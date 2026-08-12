"""
Serviço de integração com OpenAI API
Gera explicações inteligentes sobre oportunidades de negócio
OPCIONAL: Sistema funciona sem OpenAI usando fallback
"""
import os
from typing import Dict, Any

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️ OpenAI não instalado - usando modo fallback")

from dotenv import load_dotenv

load_dotenv()

# Configuração do cliente OpenAI
client = None
if OPENAI_AVAILABLE:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            client = OpenAI(api_key=api_key)
        except Exception as e:
            print(f"⚠️ Erro ao inicializar OpenAI: {e}")

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "500"))
TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
ENABLE_FALLBACK = os.getenv("ENABLE_FALLBACK", "true").lower() == "true"


def generate_ai_explanation(
    region: str,
    business_type: str,
    score: float,
    metrics: Dict[str, Any],
    region_data: Dict[str, Any],
    business_data: Dict[str, Any],
) -> str:
    """
    Gera explicação inteligente usando GPT sobre a oportunidade de negócio.
    
    Args:
        region: Nome da região
        business_type: Tipo de negócio
        score: Score de oportunidade (0-100)
        metrics: Métricas detalhadas do cálculo
        region_data: Dados demográficos da região
        business_data: Dados do tipo de negócio
    
    Returns:
        Explicação textual gerada por IA
    """
    if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "sk-proj-your_key_here":
        if ENABLE_FALLBACK:
            return _generate_fallback_explanation(region, business_type, score, metrics)
        raise ValueError("OpenAI API key não configurada. Configure OPENAI_API_KEY no arquivo .env")
    
    try:
        # Prepara o contexto para o GPT
        metrics_summary = "\n".join([
            f"- {v['label']}: {v['value']:.1f}/100 - {v['description']}"
            for k, v in metrics.items()
        ])
        
        prompt = f"""Você é um consultor de negócios especializado em análise de mercado.

Analise esta oportunidade de negócio e forneça uma explicação profissional e objetiva:

**Negócio:** {business_data.get('name', business_type)}
**Região:** {region_data.get('name', region)}
**Score de Oportunidade:** {score:.1f}/100

**Métricas Analisadas:**
{metrics_summary}

**Dados Demográficos:**
- População: {region_data.get('population', 'N/A'):,}
- Renda Média: R$ {region_data.get('income', 0):,.2f}
- Perfil: {region_data.get('profile', 'N/A')}

**Características do Negócio:**
- Investimento Médio: R$ {business_data.get('avg_investment', 0):,}
- Margem Esperada: {business_data.get('expected_margin', 0)}%
- Público-Alvo: {business_data.get('target', 'N/A')}

Forneça uma análise em 2-3 parágrafos curtos cobrindo:
1. Avaliação geral da oportunidade
2. Principais fatores de sucesso ou risco
3. Recomendação estratégica

Seja direto, profissional e use dados concretos."""

        # Chama a API do OpenAI
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Você é um consultor de negócios especializado em análise de mercado para Smart Cities. Seja objetivo, profissional e use dados concretos."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"Erro ao chamar OpenAI API: {e}")
        if ENABLE_FALLBACK:
            return _generate_fallback_explanation(region, business_type, score, metrics)
        raise


def _generate_fallback_explanation(
    region: str,
    business_type: str,
    score: float,
    metrics: Dict[str, Any],
) -> str:
    """Gera explicação de fallback quando OpenAI não está disponível."""
    
    if score >= 75:
        base = f"Esta é uma oportunidade excepcional para {business_type} em {region}."
        factors = "Os principais fatores de sucesso incluem baixa concorrência, perfil demográfico favorável e alto poder de compra da região."
        recommendation = "Fortemente recomendado prosseguir com planejamento detalhado e execução rápida para aproveitar a janela de oportunidade."
    
    elif score >= 60:
        base = f"A abertura de {business_type} em {region} apresenta uma oportunidade sólida."
        factors = "O mercado mostra condições favoráveis, embora alguns fatores como concorrência ou poder de compra exijam atenção especial."
        recommendation = "Recomendado com planejamento cuidadoso de posicionamento e diferenciação competitiva."
    
    elif score >= 45:
        base = f"A oportunidade de {business_type} em {region} é moderada e requer análise aprofundada."
        factors = "Existem desafios significativos como alta concorrência ou perfil demográfico não ideal que podem impactar o resultado."
        recommendation = "Necessário desenvolver estratégia de diferenciação forte e validar premissas com pesquisa de mercado local."
    
    elif score >= 30:
        base = f"Abrir {business_type} em {region} apresenta riscos consideráveis."
        factors = "Múltiplos fatores desfavoráveis como saturação de mercado, perfil demográfico inadequado ou baixo poder de compra."
        recommendation = "Não recomendado sem estratégia inovadora ou nicho muito específico. Considere regiões alternativas."
    
    else:
        base = f"Esta combinação de {business_type} em {region} apresenta alto risco."
        factors = "As condições de mercado são significativamente desfavoráveis para este tipo de negócio nesta região."
        recommendation = "Fortemente desencorajado. Recomenda-se buscar outras regiões ou tipos de negócio mais adequados ao perfil local."
    
    # Adiciona insights das métricas
    low_metrics = [v['label'] for k, v in metrics.items() if v['value'] < 40]
    high_metrics = [v['label'] for k, v in metrics.items() if v['value'] >= 70]
    
    metric_insight = ""
    if high_metrics:
        metric_insight = f" Pontos fortes: {', '.join(high_metrics[:2])}."
    if low_metrics:
        metric_insight += f" Pontos de atenção: {', '.join(low_metrics[:2])}."
    
    return f"{base} {factors}{metric_insight}\n\n{recommendation}"


def generate_simulation_insights(
    original_score: float,
    projected_score: float,
    population_growth: float,
    income_growth: float,
    new_competitors: int,
) -> str:
    """
    Gera insights inteligentes sobre simulação de cenários.
    
    Args:
        original_score: Score atual
        projected_score: Score projetado
        population_growth: Crescimento populacional (%)
        income_growth: Crescimento de renda (%)
        new_competitors: Número de novos concorrentes
    
    Returns:
        Análise do cenário simulado
    """
    if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "sk-proj-your_key_here":
        if ENABLE_FALLBACK:
            return _generate_fallback_simulation(original_score, projected_score, population_growth, income_growth, new_competitors)
        raise ValueError("OpenAI API key não configurada")
    
    try:
        delta = projected_score - original_score
        
        prompt = f"""Analise este cenário de projeção de negócio para os próximos 5 anos:

**Score Atual:** {original_score:.1f}/100
**Score Projetado:** {projected_score:.1f}/100
**Variação:** {delta:+.1f} pontos

**Parâmetros do Cenário:**
- Crescimento populacional: {population_growth:+.1f}%
- Crescimento de renda: {income_growth:+.1f}%
- Novos concorrentes entrando: {new_competitors}

Forneça uma análise concisa (2 parágrafos) sobre:
1. Impacto geral do cenário no negócio
2. Principais riscos e oportunidades identificados"""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Você é um analista de cenários de negócio. Seja objetivo e foque em insights acionáveis."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=TEMPERATURE,
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"Erro ao gerar insights de simulação: {e}")
        if ENABLE_FALLBACK:
            return _generate_fallback_simulation(original_score, projected_score, population_growth, income_growth, new_competitors)
        raise


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
    
    return f"{outlook}, com variação de {delta:+.1f} pontos no score. {factors} ao longo dos próximos 5 anos."


# Função para testar a conexão
def test_openai_connection() -> bool:
    """Testa se a API key do OpenAI está configurada corretamente."""
    try:
        if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "sk-proj-your_key_here":
            return False
        
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=5,
        )
        return True
    except Exception as e:
        print(f"Erro ao testar OpenAI: {e}")
        return False
