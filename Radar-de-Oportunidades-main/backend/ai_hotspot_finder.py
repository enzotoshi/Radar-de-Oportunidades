"""
AI Hotspot Finder - Identifica automaticamente os melhores pontos para negócios
usando análise real de mercado com Google Maps API + IA
"""
import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from real_market_analyzer import RealMarketAnalyzer
import math

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


class AIHotspotFinder:
    """
    Analisa uma cidade/região e identifica automaticamente os melhores hotspots
    para um tipo de negócio específico usando dados reais.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GOOGLE_MAPS_API_KEY
        self.analyzer = RealMarketAnalyzer(api_key)
    
    def find_hotspots(
        self,
        city: str,
        business_type: str,
        num_hotspots: int = 10,
        radius: int = 2000
    ) -> List[Dict[str, Any]]:
        """
        Encontra os melhores hotspots em uma cidade para um tipo de negócio.
        
        Args:
            city: Nome da cidade (ex: "São Paulo", "Rio de Janeiro")
            business_type: Tipo de negócio (ex: "cafeteria", "academia")
            num_hotspots: Número de hotspots para retornar
            radius: Raio de análise em metros
        
        Returns:
            Lista de hotspots ordenados por score de oportunidade
        """
        # Passo 1: Definir pontos de análise na cidade
        grid_points = self._generate_city_grid(city)
        
        # Passo 2: Analisar cada ponto
        hotspots = []
        
        for point in grid_points:
            try:
                analysis = self.analyzer.analyze_location(
                    lat=point["lat"],
                    lng=point["lng"],
                    business_type=business_type,
                    radius=radius
                )
                
                # Calcula score de oportunidade
                opportunity_score = self._calculate_opportunity_score(analysis)
                
                hotspot = {
                    "name": point["name"],
                    "lat": point["lat"],
                    "lng": point["lng"],
                    "opportunity_score": opportunity_score,
                    "competition": analysis["competition"],
                    "infrastructure": analysis["infrastructure"],
                    "mobility": analysis["mobility"],
                    "attractiveness": analysis["attractiveness_score"],
                    "data_source": analysis["data_source"],
                }
                
                hotspots.append(hotspot)
            
            except Exception as e:
                print(f"Erro ao analisar {point['name']}: {e}")
                continue
        
        # Passo 3: Ordenar por score e retornar os top N
        hotspots.sort(key=lambda x: x["opportunity_score"], reverse=True)
        
        return hotspots[:num_hotspots]
    
    def _generate_city_grid(self, city: str) -> List[Dict[str, Any]]:
        """
        Gera pontos de interesse (grid) para análise baseado na cidade.
        Você pode expandir isso para usar Geocoding API ou dados reais.
        """
        # Bairros conhecidos de São Paulo (expandível para outras cidades)
        city_grids = {
            "São Paulo": [
                {"name": "Vila Madalena", "lat": -23.5505, "lng": -46.6877},
                {"name": "Pinheiros", "lat": -23.5660, "lng": -46.6861},
                {"name": "Moema", "lat": -23.5997, "lng": -46.6648},
                {"name": "Jardins", "lat": -23.5699, "lng": -46.6520},
                {"name": "Vila Olímpia", "lat": -23.5963, "lng": -46.6872},
                {"name": "Itaim Bibi", "lat": -23.5850, "lng": -46.6817},
                {"name": "Brooklin", "lat": -23.6098, "lng": -46.6987},
                {"name": "Centro", "lat": -23.5489, "lng": -46.6388},
                {"name": "Liberdade", "lat": -23.5593, "lng": -46.6336},
                {"name": "Lapa", "lat": -23.5238, "lng": -46.7018},
                {"name": "Santana", "lat": -23.5028, "lng": -46.6282},
                {"name": "Tatuapé", "lat": -23.5394, "lng": -46.5744},
                {"name": "Consolação", "lat": -23.5527, "lng": -46.6573},
                {"name": "Perdizes", "lat": -23.5431, "lng": -46.6733},
                {"name": "Higienópolis", "lat": -23.5461, "lng": -46.6570},
                {"name": "Mooca", "lat": -23.5528, "lng": -46.5974},
                {"name": "Vila Mariana", "lat": -23.5886, "lng": -46.6390},
                {"name": "Ipiranga", "lat": -23.5907, "lng": -46.6033},
                {"name": "Jabaquara", "lat": -23.6474, "lng": -46.6425},
                {"name": "Santo Amaro", "lat": -23.6528, "lng": -46.7056},
            ],
            "Rio de Janeiro": [
                {"name": "Copacabana", "lat": -22.9711, "lng": -43.1822},
                {"name": "Ipanema", "lat": -22.9838, "lng": -43.2044},
                {"name": "Leblon", "lat": -22.9844, "lng": -43.2253},
                {"name": "Botafogo", "lat": -22.9519, "lng": -43.1830},
                {"name": "Centro", "lat": -22.9068, "lng": -43.1729},
                {"name": "Barra da Tijuca", "lat": -23.0045, "lng": -43.3646},
            ],
        }
        
        return city_grids.get(city, city_grids["São Paulo"])
    
    def _calculate_opportunity_score(self, analysis: Dict[str, Any]) -> float:
        """
        Calcula score de oportunidade baseado na análise de mercado real.
        
        Lógica:
        - Menor concorrência = melhor
        - Mais infraestrutura = melhor
        - Melhor mobilidade = melhor
        """
        try:
            # Score de concorrência (inverso - menos concorrência é melhor)
            competition = analysis["competition"]
            density = competition["density_per_km2"]
            
            # Normaliza densidade (0-10 competitors/km² = ótimo, >20 = ruim)
            if density <= 5:
                competition_score = 100
            elif density <= 10:
                competition_score = 80
            elif density <= 15:
                competition_score = 60
            elif density <= 20:
                competition_score = 40
            else:
                competition_score = 20
            
            # Considera rating médio (mercado estabelecido pode ser bom)
            avg_rating = competition.get("average_rating", 0)
            if avg_rating > 4.0:
                # Mercado maduro e bem avaliado = demanda comprovada
                competition_score += 10
            
            # Score de infraestrutura (direto)
            infrastructure_score = analysis["infrastructure"]["infrastructure_score"]
            
            # Score de mobilidade (direto)
            mobility_score = analysis["mobility"]["mobility_score"]
            
            # Score de atratividade geral
            attractiveness = analysis["attractiveness_score"]["overall_score"]
            
            # Média ponderada
            final_score = (
                competition_score * 0.35 +  # Concorrência é crítica
                infrastructure_score * 0.25 +  # Infraestrutura importante
                mobility_score * 0.20 +  # Mobilidade importante
                attractiveness * 0.20  # Score geral
            )
            
            return round(final_score, 1)
        
        except Exception as e:
            print(f"Erro ao calcular score: {e}")
            return 0.0
    
    def analyze_custom_location(
        self,
        lat: float,
        lng: float,
        business_type: str,
        location_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analisa uma localização customizada (usuário clica no mapa).
        """
        analysis = self.analyzer.analyze_location(
            lat=lat,
            lng=lng,
            business_type=business_type,
            radius=2000
        )
        
        opportunity_score = self._calculate_opportunity_score(analysis)
        
        return {
            "name": location_name or f"Lat {lat:.4f}, Lng {lng:.4f}",
            "lat": lat,
            "lng": lng,
            "opportunity_score": opportunity_score,
            "competition": analysis["competition"],
            "infrastructure": analysis["infrastructure"],
            "mobility": analysis["mobility"],
            "attractiveness": analysis["attractiveness_score"],
            "data_source": analysis["data_source"],
            "recommendations": self._generate_recommendations(analysis, opportunity_score),
        }
    
    def _generate_recommendations(
        self,
        analysis: Dict[str, Any],
        opportunity_score: float
    ) -> List[str]:
        """Gera recomendações baseadas na análise."""
        recommendations = []
        
        competition = analysis["competition"]
        infrastructure = analysis["infrastructure"]
        mobility = analysis["mobility"]
        
        # Recomendações sobre concorrência
        if competition["density_per_km2"] > 15:
            recommendations.append(
                f"⚠️ Alta concorrência: {competition['total_competitors']} "
                f"competidores na área. Considere diferenciação forte."
            )
        elif competition["density_per_km2"] < 5:
            recommendations.append(
                f"✅ Baixa concorrência: apenas {competition['total_competitors']} "
                f"competidores. Oportunidade de liderança de mercado."
            )
        
        # Recomendações sobre infraestrutura
        if infrastructure["infrastructure_score"] > 70:
            recommendations.append(
                "✅ Excelente infraestrutura local com bom acesso a serviços."
            )
        elif infrastructure["infrastructure_score"] < 40:
            recommendations.append(
                "⚠️ Infraestrutura limitada. Clientes podem ter dificuldade de acesso."
            )
        
        # Recomendações sobre mobilidade
        if mobility["mobility_score"] > 70:
            recommendations.append(
                "✅ Ótima mobilidade com múltiplas opções de transporte."
            )
        elif mobility["mobility_score"] < 40:
            recommendations.append(
                "⚠️ Mobilidade limitada. Considere foco em público local/residencial."
            )
        
        # Recomendação geral
        if opportunity_score >= 75:
            recommendations.append(
                "🎯 LOCALIZAÇÃO PREMIUM: Alta recomendação para investimento!"
            )
        elif opportunity_score >= 60:
            recommendations.append(
                "👍 Boa localização com potencial moderado-alto."
            )
        elif opportunity_score >= 40:
            recommendations.append(
                "⚡ Localização com desafios, mas viável com estratégia adequada."
            )
        else:
            recommendations.append(
                "❌ Localização desafiadora. Considere outras opções."
            )
        
        return recommendations


# ── Função de Teste ──────────────────────────────────────────────────────────

def test_hotspot_finder():
    """Testa o finder de hotspots."""
    finder = AIHotspotFinder()
    
    print("=" * 80)
    print("🎯 AI HOTSPOT FINDER - Análise Inteligente de Oportunidades")
    print("=" * 80)
    print()
    
    # Teste 1: Encontrar hotspots para cafeteria em São Paulo
    print("📍 Buscando melhores locais para CAFETERIA em São Paulo...")
    print()
    
    hotspots = finder.find_hotspots(
        city="São Paulo",
        business_type="cafeteria",
        num_hotspots=5
    )
    
    print(f"🏆 TOP 5 HOTSPOTS IDENTIFICADOS:")
    print()
    
    for i, hotspot in enumerate(hotspots, 1):
        print(f"{i}. {hotspot['name']}")
        print(f"   Score de Oportunidade: {hotspot['opportunity_score']:.1f}/100")
        print(f"   Concorrentes: {hotspot['competition']['total_competitors']} "
              f"({hotspot['competition']['competition_level']})")
        print(f"   Infraestrutura: {hotspot['infrastructure']['infrastructure_score']:.0f}/100")
        print(f"   Mobilidade: {hotspot['mobility']['mobility_score']:.0f}/100")
        print(f"   Fonte: {hotspot['data_source']}")
        print()
    
    print("=" * 80)
    
    # Teste 2: Análise customizada de uma localização específica
    print()
    print("📍 Análise customizada: Vila Madalena")
    print()
    
    custom = finder.analyze_custom_location(
        lat=-23.5505,
        lng=-46.6877,
        business_type="cafeteria",
        location_name="Vila Madalena"
    )
    
    print(f"Score de Oportunidade: {custom['opportunity_score']:.1f}/100")
    print()
    print("Recomendações:")
    for rec in custom['recommendations']:
        print(f"  • {rec}")
    
    print()
    print("=" * 80)


if __name__ == "__main__":
    test_hotspot_finder()
