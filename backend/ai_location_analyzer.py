"""
Analisador de Localização com IA (ChatGPT/OpenAI)
Usa GPT para analisar a viabilidade de negócios em localizações específicas
"""
import os
from typing import Dict, Any
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


class AILocationAnalyzer:
    """Analisa localizações usando IA (ChatGPT)."""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or OPENAI_API_KEY
        self.client = None
        
        if self.api_key and self.api_key != "sua_chave_openai_aqui":
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"Erro ao inicializar OpenAI: {e}")
                self.client = None
    
    def analyze_location_with_ai(
        self,
        address: str,
        business_type: str,
        lat: float,
        lng: float,
        budget: float = 100000
    ) -> Dict[str, Any]:
        """
        Analisa uma localização usando ChatGPT.
        
        Args:
            address: Endereço completo
            business_type: Tipo de negócio
            lat: Latitude
            lng: Longitude
            budget: Orçamento disponível
        
        Returns:
            Análise completa com insights da IA
        """
        if not self.client:
            return self._fallback_analysis(address, business_type)
        
        try:
            # Mapa de tipos de negócio para português
            business_names = {
                "cafeteria": "Cafeteria/Café",
                "restaurante_fitness": "Restaurante Fitness/Saudável",
                "academia": "Academia/Fitness",
                "coworking": "Espaço de Coworking",
                "brecho": "Brechó/Loja de Roupas Usadas",
                "pet_shop": "Pet Shop",
                "farmacia": "Farmácia/Drogaria",
                "escola_idiomas": "Escola de Idiomas",
                "bar_pub": "Bar/Pub",
                "loja_eletronicos": "Loja de Eletrônicos",
                "salao_beleza": "Salão de Beleza",
                "delivery_comida": "Delivery de Comida",
                "clinica_estetica": "Clínica Estética",
                "livraria_cafe": "Livraria com Café",
                "mercado_organico": "Mercado de Produtos Orgânicos",
            }
            
            business_name = business_names.get(business_type, business_type)
            
            # Prompt para o ChatGPT
            prompt = f"""Analise a viabilidade de abrir um negócio nesta localização:

LOCALIZAÇÃO: {address}
Coordenadas: {lat}, {lng}

TIPO DE NEGÓCIO: {business_name}

ORÇAMENTO DISPONÍVEL: R$ {budget:,.2f}

Forneça uma análise DETALHADA seguindo EXATAMENTE este formato JSON:

{{
  "opportunity_score": <número de 0 a 100>,
  "competition": {{
    "total_competitors": <número estimado>,
    "competition_level": "<Baixa/Moderada/Alta/Muito Alta>",
    "average_rating": <número de 0 a 5>,
    "market_gap": "<descrição da oportunidade de mercado>"
  }},
  "demographics": {{
    "target_audience": "<descrição do público-alvo na região>",
    "income_level": "<Baixa/Média/Alta>",
    "population_density": "<Baixa/Média/Alta>",
    "age_profile": "<descrição do perfil etário predominante>"
  }},
  "infrastructure": {{
    "infrastructure_score": <número de 0 a 100>,
    "accessibility": "<descrição do acesso>",
    "nearby_facilities": "<lista de facilidades próximas>",
    "foot_traffic": "<Baixo/Médio/Alto>"
  }},
  "mobility": {{
    "mobility_score": <número de 0 a 100>,
    "public_transport": "<descrição do transporte público>",
    "parking": "<Ruim/Regular/Bom/Excelente>",
    "walkability": "<Baixa/Média/Alta>"
  }},
  "swot": {{
    "strengths": ["<força 1>", "<força 2>", "<força 3>"],
    "weaknesses": ["<fraqueza 1>", "<fraqueza 2>"],
    "opportunities": ["<oportunidade 1>", "<oportunidade 2>", "<oportunidade 3>"],
    "threats": ["<ameaça 1>", "<ameaça 2>"]
  }},
  "financial_projection": {{
    "estimated_monthly_revenue": <número>,
    "estimated_monthly_costs": <número>,
    "breakeven_months": <número>,
    "roi_expectation": "<descrição>"
  }},
  "recommendations": {{
    "viability": "<Excelente/Boa/Regular/Fraca>",
    "key_insights": ["<insight 1>", "<insight 2>", "<insight 3>"],
    "action_items": ["<ação 1>", "<ação 2>", "<ação 3>"],
    "risks": ["<risco 1>", "<risco 2>"]
  }},
  "summary": "<resumo geral em 2-3 frases>"
}}

IMPORTANTE: 
- Baseie-se no que você conhece sobre a região de São Paulo
- Seja específico e realista com os números
- Considere o orçamento disponível nas recomendações
- Retorne APENAS o JSON, sem texto adicional"""

            # Chama a API do ChatGPT
            response = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um especialista em análise de viabilidade de negócios e mercado imobiliário em São Paulo, Brasil. Forneça análises detalhadas e realistas baseadas em dados demográficos, econômicos e geográficos."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Extrai a resposta
            ai_response = response.choices[0].message.content
            
            # Parse JSON
            import json
            analysis = json.loads(ai_response)
            
            # Adiciona metadados
            analysis["data_source"] = "Análise com IA (ChatGPT/OpenAI)"
            analysis["model_used"] = OPENAI_MODEL
            analysis["location"] = {"lat": lat, "lng": lng, "address": address}
            analysis["business_type"] = business_type
            analysis["budget"] = budget
            
            return analysis
        
        except Exception as e:
            print(f"Erro na análise com IA: {e}")
            return self._fallback_analysis(address, business_type)
    
    def _fallback_analysis(
        self,
        address: str,
        business_type: str
    ) -> Dict[str, Any]:
        """Análise básica quando IA não está disponível."""
        import random
        
        score = random.randint(40, 75)
        
        return {
            "opportunity_score": score,
            "competition": {
                "total_competitors": random.randint(5, 20),
                "competition_level": "Moderada",
                "average_rating": 4.0,
                "market_gap": "Configure a API do ChatGPT para análise detalhada."
            },
            "demographics": {
                "target_audience": "Análise não disponível sem API do ChatGPT",
                "income_level": "Média",
                "population_density": "Alta",
                "age_profile": "Misto"
            },
            "infrastructure": {
                "infrastructure_score": random.randint(50, 80),
                "accessibility": "Configure a API para análise completa",
                "nearby_facilities": "Diversos",
                "foot_traffic": "Médio"
            },
            "mobility": {
                "mobility_score": random.randint(50, 80),
                "public_transport": "Configure a API para análise completa",
                "parking": "Regular",
                "walkability": "Média"
            },
            "swot": {
                "strengths": ["Localização em área urbana", "Acesso facilitado"],
                "weaknesses": ["Análise limitada sem API"],
                "opportunities": ["Configure OpenAI API para insights detalhados"],
                "threats": ["Concorrência local"]
            },
            "financial_projection": {
                "estimated_monthly_revenue": 0,
                "estimated_monthly_costs": 0,
                "breakeven_months": 0,
                "roi_expectation": "Configure a API para projeções financeiras"
            },
            "recommendations": {
                "viability": "Regular",
                "key_insights": [
                    "Configure a API do ChatGPT em backend/.env",
                    "Adicione OPENAI_API_KEY para análises completas",
                    "Obtenha chave em: https://platform.openai.com/api-keys"
                ],
                "action_items": [
                    "Configurar OpenAI API",
                    "Executar nova análise"
                ],
                "risks": ["Análise limitada sem IA"]
            },
            "summary": "Análise básica. Configure a API do ChatGPT para insights detalhados com IA.",
            "data_source": "Simulado (OpenAI API não configurada)",
            "location": {"address": address},
            "business_type": business_type
        }


def test_ai_analysis():
    """Testa o analisador com IA."""
    analyzer = AILocationAnalyzer()
    
    result = analyzer.analyze_location_with_ai(
        address="Avenida Paulista, 1000, São Paulo, SP",
        business_type="cafeteria",
        lat=-23.5505,
        lng=-46.6333,
        budget=150000
    )
    
    print("=" * 60)
    print("ANÁLISE COM IA (ChatGPT)")
    print("=" * 60)
    print(f"Localização: {result['location']['address']}")
    print(f"Fonte: {result['data_source']}")
    print()
    print(f"Score de Oportunidade: {result['opportunity_score']}/100")
    print()
    print("RESUMO:")
    print(result['summary'])
    print()
    print("RECOMENDAÇÕES:")
    print(f"  Viabilidade: {result['recommendations']['viability']}")
    for insight in result['recommendations']['key_insights']:
        print(f"  • {insight}")
    print("=" * 60)
    
    return result


if __name__ == "__main__":
    test_ai_analysis()
