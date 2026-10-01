"""Relatórios interpretativos por IA sobre dados já coletados pelo Radar."""
from __future__ import annotations

import json
import os
from typing import Any, Dict

import requests


class AIReportUnavailable(RuntimeError):
    """A IA não está configurada ou a cota gratuita não está disponível."""


def generate_investor_report(analysis: Dict[str, Any]) -> Dict[str, str]:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise AIReportUnavailable("Relatório por IA indisponível. Configure GROQ_API_KEY no backend.")

    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    evidence = {
        "business_type": analysis["business_type"],
        "location": analysis["location"],
        "opportunity_score": analysis["opportunity_score"],
        "budget": analysis.get("budget"),
        "estimated_required_capital": analysis.get("estimated_required_capital"),
        "score_label": analysis["score_label"],
        "metrics": analysis["metrics"],
        "methodology": analysis["methodology"],
        "warnings": analysis["warnings"],
        "collected_at": analysis["collected_at"],
    }
    prompt = (
        "Você é um analista de investimento responsável. Produza um relatório em português "
        "do Brasil, conciso e útil, usando exclusivamente as evidências JSON abaixo. "
        "Não invente aluguel, receita, demanda, retorno, concorrentes ou custos. Diferencie "
        "dados observados, estimativas e cálculos. Estruture em: Resumo executivo, Evidências, "
        "Riscos e limitações, Próximos passos. Não prometa sucesso financeiro.\n\n"
        + json.dumps(evidence, ensure_ascii=False, default=str)
    )
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "Você analisa somente evidências fornecidas."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
                "max_tokens": 700,
            },
            timeout=30,
        )
    except requests.RequestException as exc:
        raise AIReportUnavailable("Não foi possível acessar a IA no momento.") from exc

    if response.status_code in {401, 403}:
        raise AIReportUnavailable("A chave do Groq não foi aceita pelo serviço de IA.")
    if response.status_code == 429:
        raise AIReportUnavailable("A cota gratuita da IA foi atingida. Tente novamente mais tarde.")
    if not response.ok:
        raise AIReportUnavailable("A IA não conseguiu gerar o relatório agora.")
    try:
        report = response.json()["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise AIReportUnavailable("A IA retornou uma resposta inválida.") from exc
    if not report:
        raise AIReportUnavailable("A IA não retornou conteúdo para o relatório.")
    return {"report": report, "model": model}
