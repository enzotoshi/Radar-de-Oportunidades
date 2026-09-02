"""Coleta dados públicos reais para análises por coordenadas.

As fontes usadas são OpenStreetMap (via Overpass/Nominatim) e IBGE. Este
módulo nunca cria dados de fallback: uma fonte indisponível é reportada como
indisponível ao chamador.
"""
from __future__ import annotations

import json
import math
import os
import re
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Dict, Iterable, List, Optional, Tuple

import requests

if os.name == "nt":
    # Requests usa certifi por padrão; no Windows corporativo a CA confiável
    # costuma existir apenas no repositório do sistema.
    try:
        import truststore

        truststore.inject_into_ssl()
    except ImportError:
        pass


API_TIMEOUT = int(os.getenv("API_TIMEOUT", "20"))
_configured_overpass = os.getenv("OVERPASS_API_URL")
OVERPASS_URLS = [_configured_overpass] if _configured_overpass else [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
NOMINATIM_URL = os.getenv("NOMINATIM_API_URL", "https://nominatim.openstreetmap.org")
IBGE_V1_URL = "https://servicodados.ibge.gov.br/api/v1"
IBGE_V3_URL = os.getenv("IBGE_API_BASE_URL", "https://servicodados.ibge.gov.br/api/v3")
WORLDPOP_IMAGE_URL = os.getenv(
    "WORLDPOP_IMAGE_URL",
    "https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Total_Population_100m/ImageServer",
)
WORLDPOP_YEAR = int(os.getenv("WORLDPOP_YEAR", "2020"))
USER_AGENT = os.getenv(
    "NOMINATIM_USER_AGENT",
    "RadarOportunidades/2.0 (dados-publicos; contato configuravel no .env)",
)

_session = requests.Session()
_session.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json"})
_cache: Dict[str, Tuple[float, Any]] = {}
CACHE_SECONDS = 60 * 60


BUSINESS_FILTERS: Dict[str, List[Tuple[str, str]]] = {
    "cafeteria": [("amenity", "cafe")],
    "restaurante": [("amenity", "restaurant|fast_food")],
    "restaurante_fitness": [("amenity", "restaurant|fast_food")],
    "academia": [("leisure", "fitness_centre|sports_centre"), ("sport", "fitness")],
    "coworking": [("office", "coworking")],
    "brecho": [("shop", "second_hand|clothes")],
    "pet_shop": [("shop", "pet"), ("amenity", "veterinary")],
    "farmacia": [("amenity", "pharmacy")],
    "escola_idiomas": [("amenity", "language_school")],
    "bar_pub": [("amenity", "bar|pub|nightclub")],
    "loja_eletronicos": [("shop", "electronics|mobile_phone|computer")],
    "salao_beleza": [("shop", "hairdresser|beauty")],
    "delivery_comida": [("amenity", "restaurant|fast_food")],
    "clinica_estetica": [("shop", "beauty"), ("amenity", "clinic")],
    "livraria_cafe": [("shop", "books"), ("amenity", "cafe")],
    "mercado_organico": [("shop", "supermarket|convenience|greengrocer|organic")],
    "padaria": [("shop", "bakery")],
    "mercado": [("shop", "supermarket|convenience")],
    "barbearia": [("shop", "hairdresser")],
    "loja_roupas": [("shop", "clothes")],
}

INFRASTRUCTURE_TAGS = {
    "bank": "Bancos",
    "hospital": "Hospitais",
    "clinic": "Clínicas",
    "school": "Escolas",
    "university": "Universidades",
    "marketplace": "Mercados públicos",
}


class PublicDataUnavailable(RuntimeError):
    """A fonte pública principal não respondeu com dados utilizáveis."""


def _normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")


def _cached(key: str) -> Any:
    item = _cache.get(key)
    if item and time.time() - item[0] < CACHE_SECONDS:
        return item[1]
    return None


def _store(key: str, value: Any) -> Any:
    _cache[key] = (time.time(), value)
    return value


def _selector(key: str, pattern: str, radius: int, lat: float, lng: float) -> str:
    lat_delta = radius / 111_320
    lng_delta = radius / (111_320 * max(0.1, math.cos(math.radians(lat))))
    south, north = lat - lat_delta, lat + lat_delta
    west, east = lng - lng_delta, lng + lng_delta
    return f'nwr({south:.7f},{west:.7f},{north:.7f},{east:.7f})["{key}"~"^({pattern})$"];'


def _business_filters(business_type: str) -> List[Tuple[str, str]]:
    business_id = _normalize(business_type)
    aliases = {
        "cafeteria_coffee_shop": "cafeteria",
        "academia_de_ginastica": "academia",
        "coworking_space": "coworking",
        "pet_shop_veterinaria": "pet_shop",
        "farmacia": "farmacia",
        "brecho_moda_sustentavel": "brecho",
        "escola_de_idiomas": "escola_idiomas",
        "loja_de_eletronicos": "loja_eletronicos",
        "salao_de_beleza": "salao_beleza",
        "delivery_de_comida": "delivery_comida",
        "loja_de_roupas": "loja_roupas",
    }
    business_id = aliases.get(business_id, business_id)
    if business_id not in BUSINESS_FILTERS:
        raise ValueError(f"Tipo de negócio sem mapeamento OpenStreetMap: {business_type}")
    return BUSINESS_FILTERS[business_id]


def _query_osm(lat: float, lng: float, business_type: str, radius: int) -> Dict[str, Any]:
    filters = _business_filters(business_type)
    competitor_query = "\n".join(
        _selector(key, pattern, radius, lat, lng) for key, pattern in filters
    )
    # Os pontos de transporte podem chegar aos milhares. Como a interface usa
    # apenas a quantidade, o Overpass faz essa contagem e não envia todos esses
    # objetos pela rede. Concorrentes continuam completos para aparecer no mapa.
    query = f"""[out:json][timeout:18];
(
{competitor_query}
)->.competitors;
(
{_selector("amenity", "|".join(INFRASTRUCTURE_TAGS), radius, lat, lng)}
)->.infrastructure;
(
{_selector("public_transport", "platform|station|stop_position", radius, lat, lng)}
{_selector("highway", "bus_stop", radius, lat, lng)}
{_selector("railway", "station|halt|subway_entrance|tram_stop", radius, lat, lng)}
{_selector("amenity", "parking|bicycle_parking|taxi", radius, lat, lng)}
)->.transport;
(
.competitors;
.infrastructure;
);
out center tags;
.transport out count;"""
    last_error: Optional[Exception] = None
    payload = None
    for endpoint in OVERPASS_URLS:
        try:
            # Evita que uma instância pública congestionada prenda a interface.
            response = _session.post(endpoint, data={"data": query}, timeout=(5, 12))
            response.raise_for_status()
            payload = response.json()
            break
        except (requests.RequestException, ValueError) as exc:
            last_error = exc
    if payload is None:
        raise PublicDataUnavailable(f"Instâncias Overpass indisponíveis: {last_error}")
    elements = payload.get("elements")
    if not isinstance(elements, list):
        raise PublicDataUnavailable("A resposta do Overpass não contém elementos válidos.")

    def matches(tags: Dict[str, str], rules: Iterable[Tuple[str, str]]) -> bool:
        return any(re.fullmatch(pattern, tags.get(key, "")) for key, pattern in rules)

    competitors: List[Dict[str, Any]] = []
    infra_counts = {label: 0 for label in INFRASTRUCTURE_TAGS.values()}
    transport_count = 0
    all_ids = set()

    for element in elements:
        if element.get("type") == "count":
            try:
                transport_count = int((element.get("tags") or {}).get("total", 0))
            except (TypeError, ValueError):
                transport_count = 0
            continue
        element_key = (element.get("type"), element.get("id"))
        if element_key in all_ids:
            continue
        all_ids.add(element_key)
        tags = element.get("tags") or {}
        point = element.get("center") or element
        if point.get("lat") is not None and point.get("lon") is not None:
            if _distance_meters(lat, lng, point["lat"], point["lon"]) > radius:
                continue

        if matches(tags, filters):
            competitors.append(
                {
                    "id": f"osm-{element.get('type')}-{element.get('id')}",
                    "name": tags.get("name") or "Estabelecimento sem nome no OSM",
                    "lat": point.get("lat"),
                    "lng": point.get("lon"),
                    "address": _format_osm_address(tags),
                }
            )

        amenity = tags.get("amenity")
        if amenity in INFRASTRUCTURE_TAGS:
            infra_counts[INFRASTRUCTURE_TAGS[amenity]] += 1
    valid_competitors = [item for item in competitors if item["lat"] is not None and item["lng"] is not None]
    area_km2 = math.pi * (radius / 1000) ** 2
    return {
        "competitors": valid_competitors,
        "competitor_count": len(competitors),
        "competitor_density": round(len(competitors) / area_km2, 2),
        "infrastructure": infra_counts,
        "infrastructure_count": sum(infra_counts.values()),
        "transport_count": transport_count,
        "osm_element_count": len(all_ids),
    }


def _format_osm_address(tags: Dict[str, str]) -> Optional[str]:
    street = tags.get("addr:street")
    number = tags.get("addr:housenumber")
    if street and number:
        return f"{street}, {number}"
    return street or tags.get("addr:full")


def _distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    earth_radius = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    value = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return earth_radius * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))


def _reverse_location(lat: float, lng: float) -> Dict[str, Optional[str]]:
    response = _session.get(
        f"{NOMINATIM_URL.rstrip('/')}/reverse",
        params={"format": "jsonv2", "lat": lat, "lon": lng, "zoom": 10, "addressdetails": 1},
        timeout=API_TIMEOUT,
    )
    response.raise_for_status()
    address = response.json().get("address") or {}
    city = next(
        (address.get(key) for key in ("municipality", "city", "town", "village") if address.get(key)),
        None,
    )
    return {"city": city, "state": address.get("state"), "state_code": address.get("ISO3166-2-lvl4", "").split("-")[-1] or None}


def _find_ibge_city(city: str, state_code: Optional[str]) -> Optional[Dict[str, Any]]:
    if not city:
        return None
    endpoint = f"localidades/estados/{state_code}/municipios" if state_code else "localidades/municipios"
    cache_key = f"ibge-cities:{state_code or 'br'}"
    cities = _cached(cache_key)
    if cities is None:
        response = _session.get(f"{IBGE_V1_URL}/{endpoint}", timeout=API_TIMEOUT)
        response.raise_for_status()
        cities = _store(cache_key, response.json())
    target = _normalize(city)
    return next((item for item in cities if _normalize(item.get("nome", "")) == target), None)


def _latest_aggregate(aggregate: str, variable: str, city_id: int) -> Optional[Dict[str, Any]]:
    response = _session.get(
        f"{IBGE_V3_URL}/agregados/{aggregate}/periodos/-1/variaveis/{variable}",
        params={"localidades": f"N6[{city_id}]"},
        timeout=API_TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    try:
        series = data[0]["resultados"][0]["series"][0]["serie"]
    except (IndexError, KeyError, TypeError):
        return None
    for year, raw_value in sorted(series.items(), reverse=True):
        if raw_value not in (None, "", "-"):
            return {"value": float(raw_value), "year": year}
    return None


def _query_ibge(lat: float, lng: float) -> Dict[str, Any]:
    location = _reverse_location(lat, lng)
    city = _find_ibge_city(location.get("city") or "", location.get("state_code"))
    if not city:
        return {"location": location, "city": None, "gdp": None}
    gdp = _latest_aggregate("5938", "37", city["id"])
    return {"location": location, "city": {"id": city["id"], "name": city["nome"]}, "gdp": gdp}


def _query_worldpop(lat: float, lng: float, radius: int) -> Dict[str, Any]:
    """Soma uma vez cada célula WorldPop de 100 m cujo centro cai no raio."""
    # Alinhamento documentado pelo ImageServer. Usar os centros reais dos pixels
    # impede que dois pontos consultem a mesma célula do raster.
    resolution = 0.0008333323579634333
    origin_x = -179.9995786402032
    origin_y = 83.62791397674997
    lat_delta = radius / 111_320
    lng_delta = lat_delta / max(0.1, math.cos(math.radians(lat)))

    min_col = math.floor((lng - lng_delta - origin_x) / resolution)
    max_col = math.floor((lng + lng_delta - origin_x) / resolution)
    min_row = math.floor((origin_y - (lat + lat_delta)) / resolution)
    max_row = math.floor((origin_y - (lat - lat_delta)) / resolution)
    points = []
    for row in range(min_row, max_row + 1):
        y = origin_y - (row + 0.5) * resolution
        for col in range(min_col, max_col + 1):
            x = origin_x + (col + 0.5) * resolution
            if _distance_meters(lat, lng, y, x) <= radius:
                points.append([x, y])

    response = _session.post(
        f"{WORLDPOP_IMAGE_URL.rstrip('/')}/getSamples",
        data={
            "f": "json",
            "geometry": json.dumps(
                {"points": points, "spatialReference": {"wkid": 4326}}
            ),
            "geometryType": "esriGeometryMultipoint",
            "returnFirstValueOnly": "true",
            "time": f"{WORLDPOP_YEAR}-01-01",
        },
        timeout=API_TIMEOUT,
    )
    response.raise_for_status()
    payload = response.json()
    if payload.get("error"):
        raise ValueError(payload["error"].get("message", "WorldPop retornou um erro."))
    samples = payload.get("samples")
    if not isinstance(samples, list) or not samples:
        raise ValueError("WorldPop não retornou células para a área.")
    total = 0.0
    for sample in samples:
        try:
            total += float(sample.get("value", 0))
        except (TypeError, ValueError):
            continue
    return {
        "value": round(total),
        "year": WORLDPOP_YEAR,
        "resolution": "100 m",
        "area_km2": round(math.pi * (radius / 1000) ** 2, 2),
        "sampled_cells": len(samples),
    }


def _score(osm: Dict[str, Any]) -> Dict[str, float]:
    competition = max(0.0, 100.0 - osm["competitor_density"] * 9.0)
    infrastructure = min(100.0, osm["infrastructure_count"] * 5.0)
    mobility = min(100.0, osm["transport_count"] * 7.0)
    score = competition * 0.45 + infrastructure * 0.30 + mobility * 0.25
    return {
        "overall": round(score, 1),
        "competition": round(competition, 1),
        "infrastructure": round(infrastructure, 1),
        "mobility": round(mobility, 1),
    }


def analyze_public_data(lat: float, lng: float, business_type: str, radius: int = 1500) -> Dict[str, Any]:
    """Retorna somente observações reais e índices derivados explicitamente delas."""
    cache_key = f"analysis:{lat:.5f}:{lng:.5f}:{_normalize(business_type)}:{radius}"
    cached = _cached(cache_key)
    if cached:
        return cached

    # As três fontes são independentes e podem ser consultadas ao mesmo tempo.
    with ThreadPoolExecutor(max_workers=3) as executor:
        osm_future = executor.submit(_query_osm, lat, lng, business_type, radius)
        ibge_future = executor.submit(_query_ibge, lat, lng)
        population_future = executor.submit(_query_worldpop, lat, lng, radius)

        try:
            osm = osm_future.result()
        except (requests.RequestException, ValueError) as exc:
            raise PublicDataUnavailable(f"OpenStreetMap/Overpass indisponível: {exc}") from exc

        ibge_error = None
        try:
            ibge = ibge_future.result()
        except (requests.RequestException, ValueError) as exc:
            ibge = {"location": {}, "city": None, "gdp": None}
            ibge_error = str(exc)

        population_error = None
        try:
            population = population_future.result()
        except (requests.RequestException, ValueError) as exc:
            population = None
            population_error = str(exc)

    result = {
        "osm": osm,
        "ibge": ibge,
        "population_area": population,
        "score": _score(osm),
        "radius_meters": radius,
        "sources": [
            {"name": "OpenStreetMap/Overpass", "url": "https://www.openstreetmap.org/copyright", "status": "ok"},
            {
                "name": "IBGE SIDRA",
                "url": "https://sidra.ibge.gov.br/",
                "status": "partial"
                if ibge_error or not ibge.get("city") or not ibge.get("gdp")
                else "ok",
            },
            {
                "name": "WorldPop Global 2",
                "url": "https://www.worldpop.org/",
                "status": "partial" if population_error or not population else "ok",
            },
        ],
        "collected_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    if ibge_error:
        result["ibge_warning"] = ibge_error
    if population_error:
        result["population_warning"] = population_error
    return _store(cache_key, result)
