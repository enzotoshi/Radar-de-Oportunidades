"""Transcrição real via Google Cloud Speech-to-Text, sem fallback fabricado."""
from __future__ import annotations

import os
import re
from typing import Any, Dict, Optional

try:
    from google.cloud import speech_v1 as speech
    from google.oauth2 import service_account

    GOOGLE_SPEECH_AVAILABLE = True
except ImportError:
    GOOGLE_SPEECH_AVAILABLE = False

from dotenv import load_dotenv

load_dotenv()
GOOGLE_CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")


def get_speech_client() -> Optional[Any]:
    if not GOOGLE_SPEECH_AVAILABLE:
        return None
    if not GOOGLE_CREDENTIALS_PATH or not os.path.isfile(GOOGLE_CREDENTIALS_PATH):
        return None
    try:
        credentials = service_account.Credentials.from_service_account_file(
            GOOGLE_CREDENTIALS_PATH
        )
        return speech.SpeechClient(credentials=credentials)
    except Exception:
        return None


def transcribe_audio(audio_bytes: bytes, language_code: str = "pt-BR") -> Dict[str, Any]:
    if not audio_bytes:
        raise ValueError("O áudio está vazio.")
    client = get_speech_client()
    if not client:
        raise RuntimeError(
            "Transcrição indisponível. Configure GOOGLE_APPLICATION_CREDENTIALS no backend."
        )

    response = client.recognize(
        config=speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48_000,
            language_code=language_code,
            enable_automatic_punctuation=True,
            model="default",
        ),
        audio=speech.RecognitionAudio(content=audio_bytes),
    )
    if not response.results:
        return {"transcript": "", "confidence": 0.0, "entities": {}}
    alternative = response.results[0].alternatives[0]
    transcript = alternative.transcript
    return {
        "transcript": transcript,
        "confidence": float(alternative.confidence),
        "entities": extract_entities(transcript),
    }


def extract_entities(text: str) -> Dict[str, Optional[str]]:
    """Extrai somente valores presentes na transcrição recebida."""
    lowered = text.casefold()
    entities: Dict[str, Optional[str]] = {
        "business_type": None,
        "budget": None,
        "location": None,
        "target_audience": None,
    }
    businesses = {
        "cafeteria": "cafeteria",
        "café": "cafeteria",
        "restaurante saudável": "restaurante_saudavel",
        "restaurante": "restaurante",
        "hamburgueria": "lanchonete_hamburgueria",
        "pizzaria": "pizzaria",
        "japonês": "restaurante_japones",
        "academia": "academia",
        "coworking": "coworking",
        "brechó": "brecho",
        "pet shop": "pet_shop",
        "farmácia": "farmacia",
        "drogaria": "farmacia",
        "idiomas": "escola_idiomas",
        "bar": "bar_pub",
        "eletrônicos": "loja_eletronicos",
        "salão": "salao_beleza",
        "delivery": "delivery_comida",
        "padaria": "padaria",
        "mercado": "mercado",
        "barbearia": "barbearia",
        "roupas": "loja_roupas",
        "hotel": "hotel_pousada",
        "pousada": "hotel_pousada",
        "imobiliária": "imobiliaria",
    }
    for term, business_id in businesses.items():
        if term in lowered:
            entities["business_type"] = business_id
            break

    budget_match = re.search(
        r"(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*(milh(?:ão|ões)|mil)?",
        lowered,
    )
    if budget_match:
        value = float(budget_match.group(1).replace(",", "."))
        multiplier = 1_000_000 if budget_match.group(2) in {"milhão", "milhões"} else 1_000 if budget_match.group(2) == "mil" else 1
        entities["budget"] = str(round(value * multiplier))

    location_match = re.search(r"\b(?:em|no|na)\s+([^,.;]+)", text, re.IGNORECASE)
    if location_match:
        entities["location"] = location_match.group(1).strip()
    return entities


def test_speech_connection() -> bool:
    return get_speech_client() is not None
