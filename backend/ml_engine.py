"""
Motor de ML simulado para o Radar de Oportunidades.
Todos os dados são simulados de forma realista para São Paulo e região.
"""
import numpy as np
from typing import List, Dict, Tuple, Optional

# ── Dados Simulados de Regiões ──────────────────────────────────────────────────

REGIONS_DATA = {
    "vila_madalena": {
        "id": "vila_madalena",
        "name": "Vila Madalena",
        "lat": -23.5505, "lng": -46.6877,
        "population_density": 12000,
        "avg_income": 7500,
        "age_distribution": {"young": 0.45, "adult": 0.40, "senior": 0.15},
        "competition_density": 7.2,
        "urban_flow": 8.5,
        "consumption_trend": 9.0,
        "description": "Bairro boêmio com forte cultura artística e gastronômica. Alta concentração de jovens profissionais.",
        "highlights": ["Vida noturna intensa", "Alta densidade de cafés e bares", "Público jovem e antenado", "Aluguel elevado"],
    },
    "moema": {
        "id": "moema",
        "name": "Moema",
        "lat": -23.5997, "lng": -46.6648,
        "population_density": 14000,
        "avg_income": 12000,
        "age_distribution": {"young": 0.25, "adult": 0.55, "senior": 0.20},
        "competition_density": 6.8,
        "urban_flow": 7.8,
        "consumption_trend": 8.5,
        "description": "Bairro nobre com alta renda, foco em saúde e bem-estar. Forte presença de academias e clínicas.",
        "highlights": ["Renda muito alta", "Foco em saúde e bem-estar", "Adultos exigentes", "Boa infraestrutura"],
    },
    "centro": {
        "id": "centro",
        "name": "Centro",
        "lat": -23.5489, "lng": -46.6388,
        "population_density": 18000,
        "avg_income": 2800,
        "age_distribution": {"young": 0.30, "adult": 0.50, "senior": 0.20},
        "competition_density": 9.5,
        "urban_flow": 9.8,
        "consumption_trend": 5.5,
        "description": "Centro histórico com altíssimo fluxo de pessoas. Comércio popular e serviços essenciais dominam.",
        "highlights": ["Altíssimo fluxo diário", "Renda baixa do público", "Concorrência extrema", "Custo de aluguel variável"],
    },
    "pinheiros": {
        "id": "pinheiros",
        "name": "Pinheiros",
        "lat": -23.5660, "lng": -46.6861,
        "population_density": 11000,
        "avg_income": 8500,
        "age_distribution": {"young": 0.40, "adult": 0.45, "senior": 0.15},
        "competition_density": 7.5,
        "urban_flow": 8.8,
        "consumption_trend": 9.2,
        "description": "Bairro vibrante com forte cena gastronômica e de tecnologia. Startups e jovens empreendedores.",
        "highlights": ["Ecossistema de startups", "Alta gastronomia", "Jovens adultos qualificados", "Tendência crescente"],
    },
    "jardins": {
        "id": "jardins",
        "name": "Jardins",
        "lat": -23.5699, "lng": -46.6520,
        "population_density": 8000,
        "avg_income": 18000,
        "age_distribution": {"young": 0.15, "adult": 0.55, "senior": 0.30},
        "competition_density": 5.5,
        "urban_flow": 7.0,
        "consumption_trend": 9.5,
        "description": "Bairro de luxo com maior renda per capita da cidade. Marcas premium e restaurantes finos.",
        "highlights": ["Renda altíssima", "Consumo de luxo", "Público sofisticado", "Menos concorrência popular"],
    },
    "santo_andre": {
        "id": "santo_andre",
        "name": "Santo André",
        "lat": -23.6639, "lng": -46.5383,
        "population_density": 9500,
        "avg_income": 4500,
        "age_distribution": {"young": 0.28, "adult": 0.52, "senior": 0.20},
        "competition_density": 5.8,
        "urban_flow": 7.2,
        "consumption_trend": 6.5,
        "description": "Cidade do ABC com forte base industrial e serviços para classe média.",
        "highlights": ["Classe média consolidada", "Base industrial forte", "Serviços em expansão", "Menor custo operacional"],
    },
    "campinas": {
        "id": "campinas",
        "name": "Campinas",
        "lat": -22.9099, "lng": -47.0626,
        "population_density": 7200,
        "avg_income": 6200,
        "age_distribution": {"young": 0.35, "adult": 0.45, "senior": 0.20},
        "competition_density": 5.0,
        "urban_flow": 7.5,
        "consumption_trend": 7.8,
        "description": "Polo tecnológico e universitário com grande diversidade de perfis de consumo.",
        "highlights": ["Polo tecnológico", "Universidades renomadas", "Mercado diversificado", "Crescimento acelerado"],
    },
    "itaquera": {
        "id": "itaquera",
        "name": "Itaquera",
        "lat": -23.5400, "lng": -46.4530,
        "population_density": 16000,
        "avg_income": 2200,
        "age_distribution": {"young": 0.42, "adult": 0.45, "senior": 0.13},
        "competition_density": 6.0,
        "urban_flow": 7.8,
        "consumption_trend": 5.0,
        "description": "Bairro periférico com alta densidade populacional e grande público jovem de baixa renda.",
        "highlights": ["Alta densidade", "Público jovem", "Renda baixa", "Mercado de necessidade"],
    },
    "liberdade": {
        "id": "liberdade",
        "name": "Liberdade",
        "lat": -23.5593, "lng": -46.6336,
        "population_density": 13000,
        "avg_income": 4200,
        "age_distribution": {"young": 0.30, "adult": 0.50, "senior": 0.20},
        "competition_density": 7.0,
        "urban_flow": 8.0,
        "consumption_trend": 7.2,
        "description": "Bairro de forte identidade cultural asiática. Turismo e gastronomia temática são fortes.",
        "highlights": ["Identidade cultural única", "Turismo constante", "Gastronomia temática", "Comércio especializado"],
    },
    "lapa": {
        "id": "lapa",
        "name": "Lapa",
        "lat": -23.5238, "lng": -46.7018,
        "population_density": 10500,
        "avg_income": 5500,
        "age_distribution": {"young": 0.35, "adult": 0.48, "senior": 0.17},
        "competition_density": 6.2,
        "urban_flow": 7.5,
        "consumption_trend": 7.0,
        "description": "Bairro misto em crescimento. Bares, entretenimento e gastronomia ganhando força.",
        "highlights": ["Crescimento acelerado", "Entretenimento noturno", "Mix de renda", "Gentrificação em curso"],
    },
    "santana": {
        "id": "santana",
        "name": "Santana",
        "lat": -23.5028, "lng": -46.6282,
        "population_density": 13500,
        "avg_income": 5800,
        "age_distribution": {"young": 0.20, "adult": 0.50, "senior": 0.30},
        "competition_density": 5.5,
        "urban_flow": 7.0,
        "consumption_trend": 6.8,
        "description": "Bairro familiar com forte presença de adultos e idosos. Saúde, educação e serviços essenciais.",
        "highlights": ["Perfil familiar", "Alta fidelização", "Saúde e educação", "Renda média estável"],
    },
    "abc_paulista": {
        "id": "abc_paulista",
        "name": "ABC Paulista",
        "lat": -23.6700, "lng": -46.5600,
        "population_density": 8800,
        "avg_income": 4800,
        "age_distribution": {"young": 0.30, "adult": 0.52, "senior": 0.18},
        "competition_density": 5.2,
        "urban_flow": 6.8,
        "consumption_trend": 6.2,
        "description": "Região industrial consolidada com forte mercado de serviços técnicos e comércio.",
        "highlights": ["Indústria forte", "Serviços técnicos", "Classe média operária", "Mercado estável"],
    },
    "tatuape": {
        "id": "tatuape",
        "name": "Tatuapé",
        "lat": -23.5394, "lng": -46.5744,
        "population_density": 12000,
        "avg_income": 5200,
        "age_distribution": {"young": 0.32, "adult": 0.50, "senior": 0.18},
        "competition_density": 6.5,
        "urban_flow": 8.0,
        "consumption_trend": 7.5,
        "description": "Bairro emergente com forte comércio e gastronomia. Classe média em ascensão.",
        "highlights": ["Comércio diversificado", "Classe média em ascensão", "Boa mobilidade", "Gastronomia crescente"],
    },
    "vila_olimpia": {
        "id": "vila_olimpia",
        "name": "Vila Olímpia",
        "lat": -23.5963, "lng": -46.6872,
        "population_density": 9000,
        "avg_income": 11000,
        "age_distribution": {"young": 0.38, "adult": 0.52, "senior": 0.10},
        "competition_density": 7.8,
        "urban_flow": 9.0,
        "consumption_trend": 9.3,
        "description": "Centro financeiro com alta concentração de executivos e empresas. Serviços premium.",
        "highlights": ["Executivos e empresas", "Alto poder aquisitivo", "Serviços premium", "Fluxo corporativo intenso"],
    },
    "consolacao": {
        "id": "consolacao",
        "name": "Consolação",
        "lat": -23.5527, "lng": -46.6573,
        "population_density": 11500,
        "avg_income": 7200,
        "age_distribution": {"young": 0.50, "adult": 0.38, "senior": 0.12},
        "competition_density": 7.0,
        "urban_flow": 8.5,
        "consumption_trend": 8.8,
        "description": "Bairro jovem e alternativo, forte em vida noturna, arte e gastronomia descolada.",
        "highlights": ["Público jovem e universitário", "Vida noturna intensa", "Arte e cultura", "Tendências emergentes"],
    },
}


# ── Dados Simulados de Negócios ─────────────────────────────────────────────────

BUSINESSES_DATA = {
    "cafeteria": {
        "id": "cafeteria",
        "name": "Cafeteria / Coffee Shop",
        "icon": "🍵",
        "sector": "Alimentação",
        "min_investment": 80000,
        "ideal_income": 4000,
        "ideal_age": "mixed",
        "competition_sensitivity": 0.7,
        "description": "Alta demanda em áreas com fluxo de jovens e trabalhadores.",
    },
    "restaurante_fitness": {
        "id": "restaurante_fitness",
        "name": "Restaurante Fitness",
        "icon": "🥗",
        "sector": "Alimentação Saudável",
        "min_investment": 120000,
        "ideal_income": 6000,
        "ideal_age": "adult",
        "competition_sensitivity": 0.6,
        "description": "Crescimento acelerado em bairros com alto poder aquisitivo e foco em saúde.",
    },
    "academia": {
        "id": "academia",
        "name": "Academia de Ginástica",
        "icon": "💪",
        "sector": "Saúde e Bem-estar",
        "min_investment": 200000,
        "ideal_income": 5000,
        "ideal_age": "mixed",
        "competition_sensitivity": 0.8,
        "description": "Mercado saturado em grandes centros, mas com alta demanda em bairros emergentes.",
    },
    "coworking": {
        "id": "coworking",
        "name": "Coworking Space",
        "icon": "💻",
        "sector": "Serviços Corporativos",
        "min_investment": 150000,
        "ideal_income": 7000,
        "ideal_age": "young",
        "competition_sensitivity": 0.5,
        "description": "Ideal em regiões com concentração de startups, freelancers e jovens profissionais.",
    },
    "brechó": {
        "id": "brechó",
        "name": "Brechó / Moda Sustentável",
        "icon": "♻️",
        "sector": "Moda e Varejo",
        "min_investment": 30000,
        "ideal_income": 3500,
        "ideal_age": "young",
        "competition_sensitivity": 0.4,
        "description": "Tendência forte entre jovens conscientes. Baixo investimento inicial.",
    },
    "pet_shop": {
        "id": "pet_shop",
        "name": "Pet Shop / Veterinária",
        "icon": "🐾",
        "sector": "Pet Care",
        "min_investment": 90000,
        "ideal_income": 5500,
        "ideal_age": "adult",
        "competition_sensitivity": 0.6,
        "description": "Mercado em expansão, especialmente em bairros de renda média-alta com famílias.",
    },
    "farmácia": {
        "id": "farmácia",
        "name": "Farmácia",
        "icon": "💊",
        "sector": "Saúde",
        "min_investment": 180000,
        "ideal_income": 2500,
        "ideal_age": "mixed",
        "competition_sensitivity": 0.9,
        "description": "Alta concorrência de redes, porém demanda constante em qualquer bairro.",
    },
    "escola_idiomas": {
        "id": "escola_idiomas",
        "name": "Escola de Idiomas",
        "icon": "📚",
        "sector": "Educação",
        "min_investment": 70000,
        "ideal_income": 4500,
        "ideal_age": "young",
        "competition_sensitivity": 0.5,
        "description": "Alta demanda em bairros universitários e regiões com profissionais qualificados.",
    },
    "bar_pub": {
        "id": "bar_pub",
        "name": "Bar / Pub",
        "icon": "🍺",
        "sector": "Entretenimento",
        "min_investment": 100000,
        "ideal_income": 3500,
        "ideal_age": "young",
        "competition_sensitivity": 0.7,
        "description": "Melhor desempenho em bairros com vida noturna ativa e público jovem.",
    },
    "loja_eletronicos": {
        "id": "loja_eletronicos",
        "name": "Loja de Eletrônicos",
        "icon": "📱",
        "sector": "Varejo Tecnológico",
        "min_investment": 120000,
        "ideal_income": 4000,
        "ideal_age": "young",
        "competition_sensitivity": 0.8,
        "description": "Concorrência forte de grandes redes, mas nichos especializados têm espaço.",
    },
    "salao_beleza": {
        "id": "salao_beleza",
        "name": "Salão de Beleza",
        "icon": "💇",
        "sector": "Beleza e Estética",
        "min_investment": 60000,
        "ideal_income": 3000,
        "ideal_age": "mixed",
        "competition_sensitivity": 0.6,
        "description": "Demanda constante em qualquer bairro. Diferencial em regiões de alta renda.",
    },
    "delivery_comida": {
        "id": "delivery_comida",
        "name": "Delivery de Comida",
        "icon": "🛵",
        "sector": "Alimentação",
        "min_investment": 40000,
        "ideal_income": 2500,
        "ideal_age": "mixed",
        "competition_sensitivity": 0.75,
        "description": "Modelo com alto crescimento pós-pandemia. Custo inicial baixo com operação em nuvem.",
    },
    "clinica_estetica": {
        "id": "clinica_estetica",
        "name": "Clínica Estética",
        "icon": "✨",
        "sector": "Saúde e Beleza",
        "min_investment": 250000,
        "ideal_income": 8000,
        "ideal_age": "adult",
        "competition_sensitivity": 0.5,
        "description": "Setor em explosão. Alto ticket médio, ideal para bairros de renda elevada.",
    },
    "livraria_cafe": {
        "id": "livraria_cafe",
        "name": "Livraria & Café",
        "icon": "📖",
        "sector": "Cultura e Alimentação",
        "min_investment": 95000,
        "ideal_income": 5000,
        "ideal_age": "mixed",
        "competition_sensitivity": 0.3,
        "description": "Nicho cultural com alta fidelização. Funciona bem em bairros com perfil intelectual.",
    },
    "mercado_organico": {
        "id": "mercado_organico",
        "name": "Mercado Orgânico",
        "icon": "🌿",
        "sector": "Alimentação Sustentável",
        "min_investment": 110000,
        "ideal_income": 7500,
        "ideal_age": "adult",
        "competition_sensitivity": 0.4,
        "description": "Tendência crescente em bairros com alto poder aquisitivo e consciência ambiental.",
    },
}


# ── Funções do Motor de ML ──────────────────────────────────────────────────────

def _normalize(value: float, min_val: float, max_val: float) -> float:
    """Normaliza um valor para o intervalo [0, 100]."""
    if max_val == min_val:
        return 50.0
    return max(0.0, min(100.0, (value - min_val) / (max_val - min_val) * 100))


def calculate_opportunity_score(region_id: str, business_id: str, budget: float) -> Dict:
    """
    Calcula o score de oportunidade para uma combinação região + negócio.
    Retorna dict com score e métricas detalhadas.
    """
    region = REGIONS_DATA.get(region_id)
    business = BUSINESSES_DATA.get(business_id)

    if not region or not business:
        return {"score": 0, "metrics": {}, "error": "Região ou negócio não encontrado"}

    # ── 1. Score de Concorrência (menor concorrência = melhor) ──
    competition_score = (10 - region["competition_density"]) * business["competition_sensitivity"] * 10
    competition_score = _normalize(competition_score, 0, 100)

    # ── 2. Score Demográfico ──
    age_dist = region["age_distribution"]
    if business["ideal_age"] == "young":
        demographic_score = age_dist["young"] * 100
    elif business["ideal_age"] == "adult":
        demographic_score = age_dist["adult"] * 100
    else:
        demographic_score = (age_dist["young"] + age_dist["adult"]) * 60

    # ── 3. Score de Renda ──
    income_ratio = region["avg_income"] / max(business["ideal_income"], 1)
    income_score = min(100, income_ratio * 65)

    # ── 4. Score de Tendência / Consumo ──
    trend_score = region["consumption_trend"] * 10

    # ── 5. Score de Fluxo Urbano ──
    flow_score = region["urban_flow"] * 10

    # ── 6. Score de Orçamento (viabilidade financeira) ──
    budget_ratio = budget / max(business["min_investment"], 1)
    if budget_ratio >= 2.0:
        budget_score = 100
    elif budget_ratio >= 1.0:
        budget_score = 60 + (budget_ratio - 1.0) * 40
    else:
        budget_score = budget_ratio * 60

    # ── Score Final Ponderado ──
    weights = {
        "competition": 0.25,
        "demographics": 0.20,
        "income": 0.20,
        "trends": 0.15,
        "urban_flow": 0.10,
        "budget": 0.10,
    }

    final_score = (
        competition_score * weights["competition"]
        + demographic_score * weights["demographics"]
        + income_score * weights["income"]
        + trend_score * weights["trends"]
        + flow_score * weights["urban_flow"]
        + budget_score * weights["budget"]
    )

    # Arredonda para 1 casa decimal
    final_score = round(final_score, 1)

    return {
        "score": final_score,
        "metrics": {
            "competition": {
                "value": round(competition_score, 1),
                "label": "Concorrência",
                "description": f"Densidade de concorrência: {region['competition_density']}/10",
            },
            "demographics": {
                "value": round(demographic_score, 1),
                "label": "Perfil Demográfico",
                "description": f"Adequação do público-alvo: {int(demographic_score)}%",
            },
            "income": {
                "value": round(income_score, 1),
                "label": "Poder de Compra",
                "description": f"Renda média: R$ {region['avg_income']:,.0f}",
            },
            "trends": {
                "value": round(trend_score, 1),
                "label": "Tendências de Consumo",
                "description": f"Índice de tendência: {region['consumption_trend']}/10",
            },
            "urban_flow": {
                "value": round(flow_score, 1),
                "label": "Fluxo Urbano",
                "description": f"Circulação de pessoas: {region['urban_flow']}/10",
            },
            "budget": {
                "value": round(budget_score, 1),
                "label": "Viabilidade Financeira",
                "description": f"Orçamento vs. investimento mínimo: {budget_ratio:.1f}x",
            },
        },
        "region": region,
        "business": business,
    }


def find_similar_regions(region_id: str, business_id: str, top_n: int = 3) -> List[Dict]:
    """
    Encontra regiões similares usando distância euclidiana sobre features normalizadas.
    Simula clustering K-Means com centróides fixos.
    """
    target = REGIONS_DATA.get(region_id)
    if not target:
        return []

    def region_vector(r: Dict) -> np.ndarray:
        return np.array([
            r["population_density"] / 20000,
            r["avg_income"] / 20000,
            r["age_distribution"]["young"],
            r["competition_density"] / 10,
            r["urban_flow"] / 10,
            r["consumption_trend"] / 10,
        ])

    target_vec = region_vector(target)
    similarities = []

    for rid, rdata in REGIONS_DATA.items():
        if rid == region_id:
            continue
        vec = region_vector(rdata)
        distance = float(np.linalg.norm(target_vec - vec))
        similarity = max(0.0, 1.0 - distance)
        result = calculate_opportunity_score(rid, business_id, 200000)
        similarities.append({
            "name": rdata["name"],
            "score": result["score"],
            "similarity": round(similarity, 2),
        })

    similarities.sort(key=lambda x: (-x["similarity"], -x["score"]))
    return similarities[:top_n]


def simulate_scenario(
    region_id: str,
    business_id: str,
    budget: float,
    population_growth: float,
    income_growth: float,
    new_competitors: int,
) -> Dict:
    """
    Simula um cenário futuro ajustando os parâmetros da região.
    Retorna projeções anuais para 5 anos.
    """
    region = REGIONS_DATA.get(region_id)
    business = BUSINESSES_DATA.get(business_id)
    if not region or not business:
        return {}

    # Score original
    original = calculate_opportunity_score(region_id, business_id, budget)
    original_score = original["score"]

    # Modifica parâmetros gradualmente ao longo de 5 anos
    projections = []
    for year in range(1, 6):
        factor = year / 5.0
        modified_region = dict(region)
        modified_region["population_density"] = region["population_density"] * (1 + population_growth / 100 * factor)
        modified_region["avg_income"] = region["avg_income"] * (1 + income_growth / 100 * factor)
        modified_region["competition_density"] = min(10, region["competition_density"] + new_competitors * 0.2 * factor)

        # Recalcula score com região modificada
        REGIONS_DATA[f"_sim_{region_id}"] = modified_region
        sim_result = calculate_opportunity_score(f"_sim_{region_id}", business_id, budget)
        REGIONS_DATA.pop(f"_sim_{region_id}", None)

        projections.append({
            "year": 2024 + year,
            "score": sim_result["score"],
            "label": f"{2024 + year}",
        })

    projected_score = projections[-1]["score"]
    delta = round(projected_score - original_score, 1)

    return {
        "original_score": original_score,
        "projected_score": projected_score,
        "delta": delta,
        "projections": projections,
    }


def generate_explanation(region_id: str, business_id: str, score: float, metrics: Dict) -> Tuple[str, str, str]:
    """
    Gera explicação textual, nível de risco e ROI estimado sem API externa.
    Retorna (explanation, risk_level, estimated_roi).
    """
    region = REGIONS_DATA.get(region_id, {})
    business = BUSINESSES_DATA.get(business_id, {})

    region_name = region.get("name", region_id)
    business_name = business.get("name", business_id)

    # Determina nível de risco
    if score >= 70:
        risk_level = "low"
        risk_text = "baixo"
        roi_text = "18% a 35% a.a."
        verdict = "excelente"
    elif score >= 50:
        risk_level = "medium"
        risk_text = "médio"
        roi_text = "8% a 18% a.a."
        verdict = "moderado"
    elif score >= 35:
        risk_level = "medium"
        risk_text = "médio-alto"
        roi_text = "0% a 10% a.a."
        verdict = "arriscado"
    else:
        risk_level = "high"
        risk_text = "alto"
        roi_text = "negativo no curto prazo"
        verdict = "desfavorável"

    # Identifica pontos fortes e fracos
    strong = [k for k, v in metrics.items() if v["value"] >= 65]
    weak = [k for k, v in metrics.items() if v["value"] < 40]

    metric_labels = {
        "competition": "concorrência favorável",
        "demographics": "perfil demográfico adequado",
        "income": "poder de compra da região",
        "trends": "tendências de consumo",
        "urban_flow": "fluxo de pessoas",
        "budget": "viabilidade financeira",
    }

    strong_texts = [metric_labels.get(k, k) for k in strong]
    weak_texts = [metric_labels.get(k, k) for k in weak]

    explanation = (
        f"A análise para **{business_name}** em **{region_name}** resultou em um score {verdict} de "
        f"**{score:.0f}/100**, com risco {risk_text}.\n\n"
    )

    if strong_texts:
        explanation += f"**Pontos Fortes:** {', '.join(strong_texts).capitalize()}. "
        explanation += f"{region.get('description', '')}\n\n"

    if weak_texts:
        explanation += f"**Atenção:** Os principais desafios são: {', '.join(weak_texts)}. "

    highlights = region.get("highlights", [])
    if highlights:
        explanation += f"\n\n**Características da região:** {'; '.join(highlights[:3])}."

    return explanation, risk_level, roi_text


def get_all_regions() -> List[Dict]:
    return list(REGIONS_DATA.values())


def get_all_businesses() -> List[Dict]:
    return list(BUSINESSES_DATA.values())


def calculate_game_score(region_id: str, business_id: str, budget_used: float, total_budget: float) -> Dict:
    """
    Calcula pontuação do modo gamificação com feedback detalhado.
    """
    result = calculate_opportunity_score(region_id, business_id, budget_used)
    score = result.get("score", 0)

    # Pontuação de sucesso (baseada no score da análise)
    success_potential = min(400, int(score * 4))

    # Pontuação de gestão de risco
    business = BUSINESSES_DATA.get(business_id, {})
    budget_ratio = budget_used / max(business.get("min_investment", 1), 1)
    if 1.2 <= budget_ratio <= 2.5:
        risk_management = 300
    elif budget_ratio >= 1.0:
        risk_management = 200
    elif budget_ratio < 1.0:
        risk_management = 50
    else:
        risk_management = 150

    # Pontuação de timing de mercado
    region = REGIONS_DATA.get(region_id, {})
    trend = region.get("consumption_trend", 5)
    market_timing = min(300, int(trend * 30))

    total_score = success_potential + risk_management + market_timing

    if total_score >= 750:
        classification = "Guru dos Negócios"
        feedback = "Escolha brilhante! Você demonstrou visão estratégica excepcional ao identificar esta oportunidade de alto potencial."
    elif total_score >= 500:
        classification = "Estrategista"
        feedback = "Boa jogada! Sua análise foi sólida, com equilíbrio entre risco e retorno. Continue refinando sua visão de mercado."
    else:
        classification = "Investidor Novato"
        feedback = "É um começo! Esta escolha apresenta desafios significativos. Considere regiões com menor concorrência e negócios mais alinhados ao perfil local."

    tips = []
    if score < 50:
        tips.append("Prefira regiões com tendência de consumo acima de 7/10")
    if budget_ratio < 1.2:
        tips.append("Reserve ao menos 20% acima do investimento mínimo como capital de giro")
    if region.get("competition_density", 5) > 7:
        tips.append("Alta concorrência requer diferencial claro de produto ou serviço")
    tips.append(f"Regiões similares com bom potencial: {', '.join([r['name'] for r in find_similar_regions(region_id, business_id, 2)])}")

    return {
        "total_score": total_score,
        "success_potential": success_potential,
        "risk_management": risk_management,
        "market_timing": market_timing,
        "classification": classification,
        "feedback": feedback,
        "tips": tips,
    }
