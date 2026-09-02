"""
Serviço de IA GRATUITA usando Groq (Llama 3)
Alternativa gratuita à OpenAI para análises de negócio
"""
import os
import requests
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")  # Modelo gratuito e rápido
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def generate_ai_explanation(
    region: str,
    business_type: str,
    score: float,
    metrics: Dict[str, Any],
    region_data: Dict[str, Any],
    business_data: Dict[str, Any],
) -> tuple[str, str, str]:
    """
    Gera explicação inteligente usando Groq (Llama 3) - GRATUITO!
    
    Returns:
        tuple: (explanation, risk_level, roi)
    """
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_key_here":
        return _generate_fallback_explanation(region, business_type, score, metrics)
    
    try:
        # Prepara o contexto
        metrics_summary = "\n".join([
            f"- {v['label']}: {v['value']:.1f}/100 - {v['description']}"
            for k, v in metrics.items()
        ])
        
        prompt = f"""Você é um consultor de negócios especializado em análise de mercado.

Analise esta oportunidade de negócio e forneça uma explicação profissional:

**Negócio:** {business_data.get('name', business_type)}
**Região:** {region_data.get('name', region)}
**Score de Oportunidade:** {score:.1f}/100

**Métricas:**
{metrics_summary}

**Dados Demográficos:**
- População: {region_data.get('population', 'N/A')}
- Renda Média: R$ {region_data.get('income', 0):,.2f}
- Perfil: {region_data.get('profile', 'N/A')}

Forneça:
1. Análise objetiva da oportunidade (2-3 parágrafos)
2. Na última linha, escreva EXATAMENTE: "RISK: [low/medium/high] | ROI: [percentual]"

Exemplo de formato final:
"...sua análise aqui...
RISK: medium | ROI: 12% a 20% a.a."
"""

        # Chama Groq API (GRATUITA)
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": "Você é um consultor de negócios especializado. Seja direto e use dados concretos."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 500,
                "temperature": 0.7,
            },
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"Erro Groq API: {response.status_code} - {response.text}")
            return _generate_fallback_explanation(region, business_type, score, metrics)
        
        content = response.json()["choices"][0]["message"]["content"].strip()
        
        # Extrai risk e ROI da resposta
        risk_level, roi = _extract_risk_and_roi(content, score)
        
        # Remove a linha RISK/ROI da explicação
        explanation = content.split("RISK:")[0].strip()
        
        return explanation, risk_level, roi
    
    except Exception as e:
        print(f"Erro ao chamar Groq API: {e}")
        return _generate_fallback_explanation(region, business_type, score, metrics)


def _extract_risk_and_roi(content: str, score: float) -> tuple[str, str]:
    """Extrai risk_level e ROI da resposta da IA."""
    try:
        # Procura linha "RISK: ... | ROI: ..."
        if "RISK:" in content and "ROI:" in content:
            parts = content.split("RISK:")[1].split("|")
            risk = parts[0].strip().lower()
            roi = parts[1].replace("ROI:", "").strip()
            return risk, roi
    except:
        pass
    
    # Fallback baseado no score
    if score >= 70:
        return "low", "18% a 35% a.a."
    elif score >= 50:
        return "medium", "8% a 18% a.a."
    elif score >= 35:
        return "medium", "0% a 10% a.a."
    else:
        return "high", "negativo no curto prazo"


def _generate_fallback_explanation(
    region: str,
    business_type: str,
    score: float,
    metrics: Dict[str, Any],
) -> tuple[str, str, str]:
    """Gera explicação de fallback quando IA não está disponível."""
    
    if score >= 75:
        base = f"Esta é uma oportunidade excepcional para {business_type} em {region}."
        factors = "Os principais fatores de sucesso incluem baixa concorrência, perfil demográfico favorável e alto poder de compra da região."
        recommendation = "Fortemente recomendado prosseguir com planejamento detalhado e execução rápida."
        risk = "low"
        roi = "18% a 35% a.a."
    
    elif score >= 60:
        base = f"A abertura de {business_type} em {region} apresenta uma oportunidade sólida."
        factors = "O mercado mostra condições favoráveis, embora alguns fatores exijam atenção especial."
        recommendation = "Recomendado com planejamento cuidadoso de posicionamento."
        risk = "low"
        roi = "12% a 25% a.a."
    
    elif score >= 45:
        base = f"A oportunidade de {business_type} em {region} é moderada."
        factors = "Existem desafios como concorrência ou perfil demográfico que requerem estratégia adequada."
        recommendation = "Necessário desenvolver estratégia de diferenciação forte."
        risk = "medium"
        roi = "5% a 15% a.a."
    
    elif score >= 30:
        base = f"Abrir {business_type} em {region} apresenta riscos consideráveis."
        factors = "Múltiplos fatores desfavoráveis como saturação ou perfil inadequado."
        recommendation = "Não recomendado sem estratégia inovadora específica."
        risk = "high"
        roi = "0% a 8% a.a."
    
    else:
        base = f"Esta combinação apresenta alto risco."
        factors = "As condições são significativamente desfavoráveis."
        recommendation = "Fortemente desencorajado. Considere alternativas."
        risk = "high"
        roi = "negativo no curto prazo"
    
    # Adiciona insights das métricas
    low_metrics = [v['label'] for k, v in metrics.items() if v['value'] < 40]
    high_metrics = [v['label'] for k, v in metrics.items() if v['value'] >= 70]
    
    metric_insight = ""
    if high_metrics:
        metric_insight = f" Pontos fortes: {', '.join(high_metrics[:2])}."
    if low_metrics:
        metric_insight += f" Pontos de atenção: {', '.join(low_metrics[:2])}."
    
    explanation = f"{base} {factors}{metric_insight}\n\n{recommendation}"
    return explanation, risk, roi


def generate_simulation_insights(
    original_score: float,
    projected_score: float,
    population_growth: float,
    income_growth: float,
    new_competitors: int,
) -> str:
    """Gera insights sobre simulação usando Groq."""
    
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_key_here":
        return _generate_fallback_simulation(original_score, projected_score, population_growth, income_growth, new_competitors)
    
    try:
        delta = projected_score - original_score
        
        prompt = f"""Analise este cenário de projeção de negócio (5 anos):

Score Atual: {original_score:.1f}/100
Score Projetado: {projected_score:.1f}/100
Variação: {delta:+.1f} pontos

Parâmetros:
- Crescimento populacional: {population_growth:+.1f}%
- Crescimento de renda: {income_growth:+.1f}%
- Novos concorrentes: {new_competitors}

Análise concisa em 2 parágrafos sobre impacto e riscos/oportunidades."""

        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": "Você é um analista de cenários de negócio."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 300,
                "temperature": 0.7,
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"].strip()
        else:
            return _generate_fallback_simulation(original_score, projected_score, population_growth, income_growth, new_competitors)
    
    except Exception as e:
        print(f"Erro ao gerar insights de simulação: {e}")
        return _generate_fallback_simulation(original_score, projected_score, population_growth, income_growth, new_competitors)


def _generate_fallback_simulation(
    original_score: float,
    projected_score: float,
    population_growth: float,
    income_growth: float,
    new_competitors: int,
) -> str:
    """Gera análise de fallback para simulação."""
    delta = projected_score - original_score
    
    if delta > 10:
        outlook = "O cenário projetado é muito favorável"
        factors = f"O crescimento populacional de {population_growth:.0f}% e aumento de renda de {income_growth:.0f}% criam um ambiente expansivo"
    elif delta > 0:
        outlook = "O cenário apresenta tendência positiva"
        factors = "As condições de mercado devem melhorar gradualmente"
    elif delta > -10:
        outlook = "O cenário indica estabilidade com leve pressão"
        factors = f"A entrada de {new_competitors} novos concorrentes pode pressionar margens"
    else:
        outlook = "O cenário projeta desafios significativos"
        factors = "As condições adversas exigem estratégia defensiva"
    
    return f"{outlook}, com variação de {delta:+.1f} pontos. {factors} nos próximos 5 anos."


def test_groq_connection() -> bool:
    """Testa se a API do Groq está configurada."""
    try:
        if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_key_here":
            return False
        
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": "Hello"}],
                "max_tokens": 5,
            },
            timeout=5
        )
        return response.status_code == 200
    except:
        return False
