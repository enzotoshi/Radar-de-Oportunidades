"""
Serviço de integração com IBGE API
Busca dados demográficos reais de cidades brasileiras
"""
import os
import requests
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

load_dotenv()

IBGE_BASE_URL = os.getenv("IBGE_API_BASE_URL", "https://servicodados.ibge.gov.br/api/v3")
USE_IBGE_DATA = os.getenv("USE_IBGE_DATA", "true").lower() == "true"
API_TIMEOUT = int(os.getenv("API_TIMEOUT", "10"))
ENABLE_FALLBACK = os.getenv("ENABLE_FALLBACK", "true").lower() == "true"

# Cache para evitar múltiplas chamadas
_cache: Dict[str, Any] = {}

# Mapeamento de regiões do projeto para códigos IBGE de municípios
REGION_TO_IBGE = {
    "pinheiros": {"municipio_id": "3550308", "name": "São Paulo - Pinheiros"},
    "vila_madalena": {"municipio_id": "3550308", "name": "São Paulo - Vila Madalena"},
    "moema": {"municipio_id": "3550308", "name": "São Paulo - Moema"},
    "jardins": {"municipio_id": "3550308", "name": "São Paulo - Jardins"},
    "vila_olimpia": {"municipio_id": "3550308", "name": "São Paulo - Vila Olímpia"},
    "centro": {"municipio_id": "3550308", "name": "São Paulo - Centro"},
    "liberdade": {"municipio_id": "3550308", "name": "São Paulo - Liberdade"},
    "lapa": {"municipio_id": "3550308", "name": "São Paulo - Lapa"},
    "santana": {"municipio_id": "3550308", "name": "São Paulo - Santana"},
    "tatuape": {"municipio_id": "3550308", "name": "São Paulo - Tatuapé"},
    "consolacao": {"municipio_id": "3550308", "name": "São Paulo - Consolação"},
    "itaquera": {"municipio_id": "3550308", "name": "São Paulo - Itaquera"},
    "santo_andre": {"municipio_id": "3547809", "name": "Santo André"},
    "campinas": {"municipio_id": "3509502", "name": "Campinas"},
    "abc_paulista": {"municipio_id": "3547809", "name": "ABC Paulista (Santo André)"},
}


def get_city_population(municipio_id: str) -> Optional[int]:
    """
    Busca a população estimada de um município no IBGE.
    
    Args:
        municipio_id: Código IBGE do município (7 dígitos)
    
    Returns:
        População estimada ou None se não encontrada
    """
    if not USE_IBGE_DATA:
        return None
    
    cache_key = f"pop_{municipio_id}"
    if cache_key in _cache:
        return _cache[cache_key]
    
    try:
        # API do IBGE para população estimada
        url = f"{IBGE_BASE_URL}/agregados/6579/periodos/2021/variaveis/9324"
        params = {"localidades": f"N6[{municipio_id}]"}
        
        response = requests.get(url, params=params, timeout=API_TIMEOUT)
        response.raise_for_status()
        
        data = response.json()
        
        # Navega na estrutura da resposta do IBGE
        if data and len(data) > 0:
            resultados = data[0].get("resultados", [])
            if resultados and len(resultados) > 0:
                series = resultados[0].get("series", [])
                if series and len(series) > 0:
                    serie_data = series[0].get("serie", {})
                    # Pega o valor do último ano disponível
                    for year, value in serie_data.items():
                        if value:
                            population = int(value)
                            _cache[cache_key] = population
                            return population
        
        return None
    
    except Exception as e:
        print(f"Erro ao buscar população no IBGE: {e}")
        return None


def get_city_gdp_per_capita(municipio_id: str) -> Optional[float]:
    """
    Busca o PIB per capita de um município no IBGE.
    
    Args:
        municipio_id: Código IBGE do município
    
    Returns:
        PIB per capita em reais ou None
    """
    if not USE_IBGE_DATA:
        return None
    
    cache_key = f"gdp_{municipio_id}"
    if cache_key in _cache:
        return _cache[cache_key]
    
    try:
        # API do IBGE para PIB per capita
        url = f"{IBGE_BASE_URL}/agregados/5938/periodos/2020/variaveis/37"
        params = {"localidades": f"N6[{municipio_id}]"}
        
        response = requests.get(url, params=params, timeout=API_TIMEOUT)
        response.raise_for_status()
        
        data = response.json()
        
        if data and len(data) > 0:
            resultados = data[0].get("resultados", [])
            if resultados and len(resultados) > 0:
                series = resultados[0].get("series", [])
                if series and len(series) > 0:
                    serie_data = series[0].get("serie", {})
                    for year, value in serie_data.items():
                        if value:
                            gdp_per_capita = float(value)
                            _cache[cache_key] = gdp_per_capita
                            return gdp_per_capita
        
        return None
    
    except Exception as e:
        print(f"Erro ao buscar PIB per capita no IBGE: {e}")
        return None


def get_region_demographics(region_id: str) -> Dict[str, Any]:
    """
    Busca dados demográficos completos de uma região.
    
    Args:
        region_id: ID da região no sistema
    
    Returns:
        Dicionário com dados demográficos
    """
    if region_id not in REGION_TO_IBGE:
        return _get_fallback_demographics(region_id)
    
    region_info = REGION_TO_IBGE[region_id]
    municipio_id = region_info["municipio_id"]
    
    demographics = {
        "region_id": region_id,
        "name": region_info["name"],
        "ibge_code": municipio_id,
        "data_source": "IBGE API",
    }
    
    # Busca população
    population = get_city_population(municipio_id)
    if population:
        demographics["population"] = population
        demographics["population_formatted"] = f"{population:,}".replace(",", ".")
    else:
        demographics["population"] = None
        demographics["data_source"] = "Fallback (IBGE indisponível)"
    
    # Busca PIB per capita (proxy para renda)
    gdp_per_capita = get_city_gdp_per_capita(municipio_id)
    if gdp_per_capita:
        demographics["gdp_per_capita"] = gdp_per_capita
        demographics["gdp_per_capita_formatted"] = f"R$ {gdp_per_capita:,.2f}"
        # Estima renda mensal média (aproximadamente 1/12 do PIB per capita)
        demographics["estimated_monthly_income"] = gdp_per_capita / 12
    else:
        demographics["gdp_per_capita"] = None
        demographics["estimated_monthly_income"] = None
    
    # Se dados do IBGE não estiverem disponíveis, usa fallback
    if not population or not gdp_per_capita:
        if ENABLE_FALLBACK:
            fallback = _get_fallback_demographics(region_id)
            demographics.update(fallback)
            demographics["data_source"] = "Fallback parcial"
    
    return demographics


def _get_fallback_demographics(region_id: str) -> Dict[str, Any]:
    """Retorna dados simulados quando IBGE não está disponível."""
    
    # Dados simulados baseados em estimativas realistas
    fallback_data = {
        "pinheiros": {"population": 65000, "income": 8500, "profile": "Alta renda, jovem"},
        "vila_madalena": {"population": 45000, "income": 7800, "profile": "Boêmio, artístico"},
        "moema": {"population": 85000, "income": 9200, "profile": "Classe alta"},
        "jardins": {"population": 75000, "income": 12000, "profile": "Elite, luxo"},
        "vila_olimpia": {"population": 35000, "income": 10500, "profile": "Corporativo"},
        "centro": {"population": 250000, "income": 3500, "profile": "Comercial, popular"},
        "liberdade": {"population": 70000, "income": 4200, "profile": "Cultural, asiático"},
        "lapa": {"population": 65000, "income": 4800, "profile": "Classe média"},
        "santana": {"population": 120000, "income": 4500, "profile": "Residencial"},
        "tatuape": {"population": 95000, "income": 5200, "profile": "Familiar"},
        "consolacao": {"population": 55000, "income": 6800, "profile": "Urbano, diverso"},
        "itaquera": {"population": 520000, "income": 2800, "profile": "Popular, crescente"},
        "santo_andre": {"population": 720000, "income": 4100, "profile": "Industrial, ABC"},
        "campinas": {"population": 1200000, "income": 4600, "profile": "Tecnológico"},
        "abc_paulista": {"population": 2800000, "income": 4000, "profile": "Industrial"},
    }
    
    data = fallback_data.get(region_id, {
        "population": 100000,
        "income": 5000,
        "profile": "Região urbana"
    })
    
    return {
        "region_id": region_id,
        "name": REGION_TO_IBGE.get(region_id, {}).get("name", region_id.title()),
        "population": data["population"],
        "population_formatted": f"{data['population']:,}".replace(",", "."),
        "gdp_per_capita": data["income"] * 12,
        "gdp_per_capita_formatted": f"R$ {data['income'] * 12:,.2f}",
        "estimated_monthly_income": data["income"],
        "profile": data["profile"],
        "data_source": "Simulado (IBGE não configurado)",
    }


def get_city_info(municipio_id: str) -> Optional[Dict[str, Any]]:
    """
    Busca informações básicas de um município.
    
    Args:
        municipio_id: Código IBGE do município
    
    Returns:
        Dicionário com informações do município
    """
    cache_key = f"info_{municipio_id}"
    if cache_key in _cache:
        return _cache[cache_key]
    
    try:
        url = f"https://servicodados.ibge.gov.br/api/v1/localidades/municipios/{municipio_id}"
        response = requests.get(url, timeout=API_TIMEOUT)
        response.raise_for_status()
        
        data = response.json()
        
        info = {
            "id": data.get("id"),
            "name": data.get("nome"),
            "microrregiao": data.get("microrregiao", {}).get("nome"),
            "mesorregiao": data.get("microrregiao", {}).get("mesorregiao", {}).get("nome"),
            "uf": data.get("microrregiao", {}).get("mesorregiao", {}).get("UF", {}).get("sigla"),
        }
        
        _cache[cache_key] = info
        return info
    
    except Exception as e:
        print(f"Erro ao buscar informações do município: {e}")
        return None


def test_ibge_connection() -> bool:
    """Testa se a API do IBGE está acessível."""
    try:
        response = requests.get(
            "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
            timeout=5
        )
        return response.status_code == 200
    except Exception:
        return False


def get_all_available_regions() -> List[str]:
    """Retorna lista de todas as regiões disponíveis no sistema."""
    return list(REGION_TO_IBGE.keys())
