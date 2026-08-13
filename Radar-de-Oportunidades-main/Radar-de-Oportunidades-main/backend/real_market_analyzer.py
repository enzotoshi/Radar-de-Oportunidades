"""
Analisador de Mercado Real
Coleta e analisa dados reais de mercado usando APIs públicas
"""
import os
import requests
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
import time

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
ENABLE_FALLBACK = os.getenv("ENABLE_FALLBACK", "true").lower() == "true"
API_TIMEOUT = int(os.getenv("API_TIMEOUT", "10"))

# URLs das APIs
GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
GOOGLE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json"
GOOGLE_PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

# Mapeamento de tipos de negócio para categorias do Google Places
BUSINESS_TO_PLACES_TYPE = {
    "cafeteria": ["cafe", "coffee_shop"],
    "restaurante_fitness": ["restaurant", "health"],
    "academia": ["gym", "fitness_center"],
    "coworking": ["business_center", "office"],
    "brecho": ["clothing_store", "store"],
    "pet_shop": ["pet_store", "veterinary_care"],
    "farmacia": ["pharmacy", "drugstore"],
    "escola_idiomas": ["school", "education"],
    "bar_pub": ["bar", "night_club"],
    "loja_eletronicos": ["electronics_store"],
    "salao_beleza": ["beauty_salon", "hair_care"],
    "delivery_comida": ["meal_delivery", "meal_takeaway"],
    "clinica_estetica": ["beauty_salon", "spa"],
    "livraria_cafe": ["book_store", "cafe"],
    "mercado_organico": ["grocery_or_supermarket", "food"],
}


class RealMarketAnalyzer:
    """Analisa dados reais de mercado usando APIs públicas."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GOOGLE_MAPS_API_KEY
        self.cache = {}
    
    def analyze_location(
        self,
        lat: float,
        lng: float,
        business_type: str,
        radius: int = 2000
    ) -> Dict[str, Any]:
        """
        Analisa uma localização específica para um tipo de negócio.
        
        Args:
            lat: Latitude
            lng: Longitude
            business_type: Tipo de negócio
            radius: Raio de análise em metros (padrão: 2km)
        
        Returns:
            Dicionário com análise completa da localização
        """
        if not self.api_key or self.api_key == "your_google_maps_key_here":
            if ENABLE_FALLBACK:
                return self._fallback_analysis(lat, lng, business_type, radius)
            raise ValueError("Google Maps API key não configurada")
        
        location_key = f"{lat},{lng},{business_type},{radius}"
        
        # Verifica cache
        if location_key in self.cache:
            return self.cache[location_key]
        
        analysis = {
            "location": {"lat": lat, "lng": lng},
            "business_type": business_type,
            "radius_meters": radius,
            "data_source": "Google Maps API (Real Data)",
        }
        
        try:
            # 1. Análise de Concorrência
            competitors = self._analyze_competitors(lat, lng, business_type, radius)
            analysis["competition"] = competitors
            
            # 2. Análise de Infraestrutura
            infrastructure = self._analyze_infrastructure(lat, lng, radius)
            analysis["infrastructure"] = infrastructure
            
            # 3. Análise de Mobilidade
            mobility = self._analyze_mobility(lat, lng, radius)
            analysis["mobility"] = mobility
            
            # 4. Score de Atratividade (baseado em dados reais)
            analysis["attractiveness_score"] = self._calculate_attractiveness(
                competitors, infrastructure, mobility
            )
            
            # Cache o resultado
            self.cache[location_key] = analysis
            
            return analysis
        
        except Exception as e:
            print(f"Erro na análise real: {e}")
            if ENABLE_FALLBACK:
                return self._fallback_analysis(lat, lng, business_type, radius)
            raise
    
    def _analyze_competitors(
        self,
        lat: float,
        lng: float,
        business_type: str,
        radius: int
    ) -> Dict[str, Any]:
        """Analisa concorrentes reais na área usando Google Places API."""
        
        # Obtém tipos de lugar para este negócio
        place_types = BUSINESS_TO_PLACES_TYPE.get(business_type, ["establishment"])
        
        all_competitors = []
        
        for place_type in place_types[:2]:  # Limita a 2 tipos para evitar muitas chamadas
            try:
                params = {
                    "location": f"{lat},{lng}",
                    "radius": radius,
                    "type": place_type,
                    "key": self.api_key,
                }
                
                response = requests.get(
                    GOOGLE_PLACES_URL,
                    params=params,
                    timeout=API_TIMEOUT
                )
                response.raise_for_status()
                
                data = response.json()
                
                if data.get("status") == "OK":
                    results = data.get("results", [])
                    all_competitors.extend(results)
                
                # Respeita rate limiting
                time.sleep(0.2)
            
            except Exception as e:
                print(f"Erro ao buscar concorrentes ({place_type}): {e}")
                continue
        
        # Remove duplicatas (mesmo place_id)
        unique_competitors = {}
        for comp in all_competitors:
            place_id = comp.get("place_id")
            if place_id and place_id not in unique_competitors:
                unique_competitors[place_id] = comp
        
        competitors_list = list(unique_competitors.values())
        
        # Análise dos concorrentes
        total = len(competitors_list)
        avg_rating = 0
        total_reviews = 0
        open_now_count = 0
        
        if total > 0:
            ratings = [c.get("rating", 0) for c in competitors_list if c.get("rating")]
            avg_rating = sum(ratings) / len(ratings) if ratings else 0
            
            total_reviews = sum([
                c.get("user_ratings_total", 0) for c in competitors_list
            ])
            
            open_now_count = sum([
                1 for c in competitors_list
                if c.get("opening_hours", {}).get("open_now") == True
            ])
        
        # Calcula densidade de concorrência (por km²)
        area_km2 = (3.14159 * (radius / 1000) ** 2)
        density = total / area_km2 if area_km2 > 0 else 0
        
        return {
            "total_competitors": total,
            "density_per_km2": round(density, 2),
            "average_rating": round(avg_rating, 2),
            "total_reviews": total_reviews,
            "currently_open": open_now_count,
            "competition_level": self._classify_competition(density),
            "top_competitors": [
                {
                    "name": c.get("name"),
                    "rating": c.get("rating"),
                    "reviews": c.get("user_ratings_total", 0),
                    "address": c.get("vicinity"),
                }
                for c in sorted(
                    competitors_list,
                    key=lambda x: x.get("user_ratings_total", 0),
                    reverse=True
                )[:5]
            ],
        }
    
    def _analyze_infrastructure(
        self,
        lat: float,
        lng: float,
        radius: int
    ) -> Dict[str, Any]:
        """Analisa infraestrutura ao redor (bancos, shopping, etc)."""
        
        infrastructure_types = {
            "atm": "Caixas Eletrônicos",
            "bank": "Bancos",
            "shopping_mall": "Shopping Centers",
            "supermarket": "Supermercados",
            "hospital": "Hospitais",
            "school": "Escolas",
        }
        
        infrastructure = {}
        total_count = 0
        
        for place_type, label in infrastructure_types.items():
            try:
                params = {
                    "location": f"{lat},{lng}",
                    "radius": radius,
                    "type": place_type,
                    "key": self.api_key,
                }
                
                response = requests.get(
                    GOOGLE_PLACES_URL,
                    params=params,
                    timeout=API_TIMEOUT
                )
                response.raise_for_status()
                
                data = response.json()
                
                if data.get("status") == "OK":
                    count = len(data.get("results", []))
                    infrastructure[place_type] = {
                        "label": label,
                        "count": count,
                    }
                    total_count += count
                
                time.sleep(0.2)
            
            except Exception as e:
                print(f"Erro ao buscar infraestrutura ({place_type}): {e}")
                infrastructure[place_type] = {"label": label, "count": 0}
        
        return {
            "total_facilities": total_count,
            "by_type": infrastructure,
            "infrastructure_score": min(100, total_count * 2),  # Score 0-100
        }
    
    def _analyze_mobility(
        self,
        lat: float,
        lng: float,
        radius: int
    ) -> Dict[str, Any]:
        """Analisa mobilidade e transporte público."""
        
        transport_types = {
            "bus_station": "Pontos de Ônibus",
            "subway_station": "Estações de Metrô",
            "train_station": "Estações de Trem",
            "parking": "Estacionamentos",
        }
        
        transport = {}
        total_count = 0
        
        for place_type, label in transport_types.items():
            try:
                params = {
                    "location": f"{lat},{lng}",
                    "radius": radius,
                    "type": place_type,
                    "key": self.api_key,
                }
                
                response = requests.get(
                    GOOGLE_PLACES_URL,
                    params=params,
                    timeout=API_TIMEOUT
                )
                response.raise_for_status()
                
                data = response.json()
                
                if data.get("status") == "OK":
                    count = len(data.get("results", []))
                    transport[place_type] = {
                        "label": label,
                        "count": count,
                    }
                    total_count += count
                
                time.sleep(0.2)
            
            except Exception as e:
                print(f"Erro ao buscar transporte ({place_type}): {e}")
                transport[place_type] = {"label": label, "count": 0}
        
        return {
            "total_transport_options": total_count,
            "by_type": transport,
            "mobility_score": min(100, total_count * 5),  # Score 0-100
        }
    
    def _classify_competition(self, density: float) -> str:
        """Classifica o nível de concorrência baseado na densidade."""
        if density < 2:
            return "Baixa"
        elif density < 5:
            return "Moderada"
        elif density < 10:
            return "Alta"
        else:
            return "Muito Alta"
    
    def _calculate_attractiveness(
        self,
        competitors: Dict,
        infrastructure: Dict,
        mobility: Dict
    ) -> Dict[str, Any]:
        """Calcula score de atratividade geral da localização."""
        
        # Pontuação baseada em dados reais
        competition_score = max(0, 100 - (competitors["density_per_km2"] * 10))
        infrastructure_score = infrastructure["infrastructure_score"]
        mobility_score = mobility["mobility_score"]
        
        # Média ponderada
        final_score = (
            competition_score * 0.4 +  # Concorrência peso 40%
            infrastructure_score * 0.35 +  # Infraestrutura peso 35%
            mobility_score * 0.25  # Mobilidade peso 25%
        )
        
        return {
            "overall_score": round(final_score, 1),
            "competition_score": round(competition_score, 1),
            "infrastructure_score": round(infrastructure_score, 1),
            "mobility_score": round(mobility_score, 1),
            "classification": self._classify_attractiveness(final_score),
        }
    
    def _classify_attractiveness(self, score: float) -> str:
        """Classifica a atratividade da localização."""
        if score >= 80:
            return "Excelente"
        elif score >= 60:
            return "Boa"
        elif score >= 40:
            return "Regular"
        else:
            return "Fraca"
    
    def _fallback_analysis(
        self,
        lat: float,
        lng: float,
        business_type: str,
        radius: int
    ) -> Dict[str, Any]:
        """Análise simulada quando API não está disponível."""
        import random
        
        # Simula dados baseados na localização
        seed = int(abs(lat * lng * 10000))
        random.seed(seed)
        
        competitors_count = random.randint(3, 25)
        density = competitors_count / (3.14159 * (radius / 1000) ** 2)
        
        return {
            "location": {"lat": lat, "lng": lng},
            "business_type": business_type,
            "radius_meters": radius,
            "data_source": "Simulado (Google Maps API não configurado)",
            "competition": {
                "total_competitors": competitors_count,
                "density_per_km2": round(density, 2),
                "average_rating": round(random.uniform(3.5, 4.5), 1),
                "total_reviews": random.randint(50, 500),
                "currently_open": random.randint(0, competitors_count),
                "competition_level": self._classify_competition(density),
                "top_competitors": [],
            },
            "infrastructure": {
                "total_facilities": random.randint(10, 40),
                "by_type": {},
                "infrastructure_score": random.randint(40, 85),
            },
            "mobility": {
                "total_transport_options": random.randint(5, 20),
                "by_type": {},
                "mobility_score": random.randint(35, 80),
            },
            "attractiveness_score": {
                "overall_score": round(random.uniform(40, 85), 1),
                "competition_score": round(random.uniform(50, 90), 1),
                "infrastructure_score": round(random.uniform(40, 85), 1),
                "mobility_score": round(random.uniform(35, 80), 1),
                "classification": "Simulado",
            },
        }


def test_real_analysis(lat: float = -23.5505, lng: float = -46.6877):
    """Testa o analisador com coordenadas reais."""
    analyzer = RealMarketAnalyzer()
    result = analyzer.analyze_location(lat, lng, "cafeteria", radius=1500)
    
    print("=" * 60)
    print("ANÁLISE DE MERCADO REAL")
    print("=" * 60)
    print(f"Localização: {lat}, {lng}")
    print(f"Fonte de dados: {result['data_source']}")
    print()
    print("CONCORRÊNCIA:")
    print(f"  Total: {result['competition']['total_competitors']}")
    print(f"  Densidade: {result['competition']['density_per_km2']}/km²")
    print(f"  Nível: {result['competition']['competition_level']}")
    print()
    print("INFRAESTRUTURA:")
    print(f"  Score: {result['infrastructure']['infrastructure_score']}/100")
    print()
    print("MOBILIDADE:")
    print(f"  Score: {result['mobility']['mobility_score']}/100")
    print()
    print("ATRATIVIDADE GERAL:")
    print(f"  Score: {result['attractiveness_score']['overall_score']}/100")
    print(f"  Classificação: {result['attractiveness_score']['classification']}")
    print("=" * 60)
    
    return result


if __name__ == "__main__":
    # Teste com Vila Madalena
    test_real_analysis()
