"""
Serviço de integração com Google Cloud Speech-to-Text API
Transcreve áudio para texto e extrai entidades
OPCIONAL: Sistema funciona sem Google Cloud usando fallback
"""
import os
import re
from typing import Dict, Any, Optional

try:
    from google.cloud import speech_v1 as speech
    from google.oauth2 import service_account
    GOOGLE_SPEECH_AVAILABLE = True
except ImportError:
    GOOGLE_SPEECH_AVAILABLE = False
    print("⚠️ Google Cloud Speech não instalado - usando modo fallback")

from dotenv import load_dotenv

load_dotenv()

GOOGLE_CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
ENABLE_FALLBACK = os.getenv("ENABLE_FALLBACK", "true").lower() == "true"


def get_speech_client() -> Optional[Any]:
    """Cria e retorna um cliente do Google Speech-to-Text."""
    if not GOOGLE_SPEECH_AVAILABLE:
        return None
    
    if not GOOGLE_CREDENTIALS_PATH or not os.path.exists(GOOGLE_CREDENTIALS_PATH):
        return None
    
    try:
        credentials = service_account.Credentials.from_service_account_file(
            GOOGLE_CREDENTIALS_PATH
        )
        return speech.SpeechClient(credentials=credentials)
    except Exception as e:
        print(f"Erro ao criar cliente Speech: {e}")
        return None


def transcribe_audio(audio_bytes: bytes, language_code: str = "pt-BR") -> Dict[str, Any]:
    """
    Transcreve áudio usando Google Cloud Speech-to-Text.
    
    Args:
        audio_bytes: Bytes do áudio
        language_code: Código do idioma (padrão: pt-BR)
    
    Returns:
        Dicionário com transcript, confidence e entities
    """
    client = get_speech_client()
    
    if not client:
        if ENABLE_FALLBACK:
            return _transcribe_fallback(audio_bytes)
        raise ValueError(
            "Google Cloud Speech-to-Text não configurado. "
            "Configure GOOGLE_APPLICATION_CREDENTIALS no arquivo .env"
        )
    
    try:
        # Configura o áudio
        audio = speech.RecognitionAudio(content=audio_bytes)
        
        # Configura as opções de reconhecimento
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code=language_code,
            enable_automatic_punctuation=True,
            model="default",
            use_enhanced=True,
        )
        
        # Realiza a transcrição
        response = client.recognize(config=config, audio=audio)
        
        if not response.results:
            return {
                "transcript": "",
                "confidence": 0.0,
                "entities": {},
                "error": "Nenhuma fala detectada no áudio",
            }
        
        # Pega a melhor alternativa
        result = response.results[0]
        alternative = result.alternatives[0]
        
        transcript = alternative.transcript
        confidence = alternative.confidence
        
        # Extrai entidades do texto transcrito
        entities = extract_entities(transcript)
        
        return {
            "transcript": transcript,
            "confidence": confidence,
            "entities": entities,
        }
    
    except Exception as e:
        print(f"Erro ao transcrever áudio: {e}")
        if ENABLE_FALLBACK:
            return _transcribe_fallback(audio_bytes)
        raise


def transcribe_audio_streaming(audio_chunks: list[bytes], language_code: str = "pt-BR") -> Dict[str, Any]:
    """
    Transcreve áudio em streaming (útil para áudios longos).
    
    Args:
        audio_chunks: Lista de chunks de áudio
        language_code: Código do idioma
    
    Returns:
        Dicionário com transcript e confidence
    """
    client = get_speech_client()
    
    if not client:
        if ENABLE_FALLBACK:
            return _transcribe_fallback(b"".join(audio_chunks))
        raise ValueError("Google Cloud Speech-to-Text não configurado")
    
    try:
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code=language_code,
            enable_automatic_punctuation=True,
        )
        
        streaming_config = speech.StreamingRecognitionConfig(
            config=config,
            interim_results=False,
        )
        
        def request_generator():
            yield speech.StreamingRecognizeRequest(streaming_config=streaming_config)
            for chunk in audio_chunks:
                yield speech.StreamingRecognizeRequest(audio_content=chunk)
        
        responses = client.streaming_recognize(request_generator())
        
        transcript = ""
        confidence = 0.0
        
        for response in responses:
            if not response.results:
                continue
            
            result = response.results[0]
            if result.is_final:
                alternative = result.alternatives[0]
                transcript += alternative.transcript + " "
                confidence = max(confidence, alternative.confidence)
        
        transcript = transcript.strip()
        entities = extract_entities(transcript)
        
        return {
            "transcript": transcript,
            "confidence": confidence,
            "entities": entities,
        }
    
    except Exception as e:
        print(f"Erro no streaming de áudio: {e}")
        if ENABLE_FALLBACK:
            return _transcribe_fallback(b"".join(audio_chunks))
        raise


def extract_entities(text: str) -> Dict[str, Optional[str]]:
    """
    Extrai entidades (negócio, região, orçamento, público) do texto transcrito.
    
    Args:
        text: Texto transcrito
    
    Returns:
        Dicionário com entidades extraídas
    """
    text_lower = text.lower()
    entities: Dict[str, Optional[str]] = {
        "business_type": None,
        "budget": None,
        "location": None,
        "target_audience": None,
    }
    
    # Extrai tipo de negócio
    business_keywords = {
        "cafeteria": "cafeteria", "café": "cafeteria", "coffee": "cafeteria",
        "academia": "academia", "ginástica": "academia", "gym": "academia",
        "coworking": "coworking", "co-working": "coworking", "espaço de trabalho": "coworking",
        "restaurante": "restaurante_fitness", "restaurante fitness": "restaurante_fitness",
        "pet shop": "pet_shop", "pet": "pet_shop", "animais": "pet_shop",
        "farmácia": "farmacia", "drogaria": "farmacia",
        "idiomas": "escola_idiomas", "escola de idiomas": "escola_idiomas", "inglês": "escola_idiomas",
        "bar": "bar_pub", "pub": "bar_pub", "boteco": "bar_pub",
        "eletrônicos": "loja_eletronicos", "eletrônica": "loja_eletronicos",
        "salão": "salao_beleza", "salão de beleza": "salao_beleza", "beleza": "salao_beleza",
        "delivery": "delivery_comida", "entrega": "delivery_comida",
        "brechó": "brecho", "roupas usadas": "brecho",
        "clínica": "clinica_estetica", "clínica estética": "clinica_estetica", "estética": "clinica_estetica",
        "mercado orgânico": "mercado_organico", "orgânico": "mercado_organico",
        "livraria": "livraria_cafe", "livraria café": "livraria_cafe",
    }
    
    for keyword, business_id in business_keywords.items():
        if keyword in text_lower:
            entities["business_type"] = business_id
            break
    
    # Extrai região/localização
    region_keywords = {
        "pinheiros": "pinheiros",
        "vila madalena": "vila_madalena", "madalena": "vila_madalena",
        "moema": "moema",
        "jardins": "jardins",
        "centro": "centro",
        "santo andré": "santo_andre", "santo andre": "santo_andre",
        "campinas": "campinas",
        "itaquera": "itaquera",
        "liberdade": "liberdade",
        "lapa": "lapa",
        "santana": "santana",
        "abc": "abc_paulista", "abc paulista": "abc_paulista",
        "tatuapé": "tatuape", "tatuape": "tatuape",
        "vila olímpia": "vila_olimpia", "vila olimpia": "vila_olimpia",
        "consolação": "consolacao", "consolacao": "consolacao",
    }
    
    for keyword, region_id in region_keywords.items():
        if keyword in text_lower:
            entities["location"] = region_id
            break
    
    # Extrai orçamento/budget
    # Padrões: "100 mil", "100k", "100 mil reais", "R$ 100.000", "cem mil"
    budget_patterns = [
        r"(\d+)\s*mil",  # 100 mil
        r"(\d+)\s*k",    # 100k
        r"r\$?\s*(\d+\.?\d*)",  # R$ 100000 ou R$ 100.000
        r"(\d+\.?\d*)\s*reais",  # 100000 reais
    ]
    
    for pattern in budget_patterns:
        match = re.search(pattern, text_lower)
        if match:
            value = float(match.group(1).replace(".", ""))
            if "mil" in text_lower or "k" in text_lower:
                value *= 1000
            entities["budget"] = str(int(value))
            break
    
    # Números por extenso
    number_words = {
        "cem": 100000, "cento": 100000,
        "duzentos": 200000, "duzentas": 200000,
        "trezentos": 300000, "trezentas": 300000,
        "cinquenta": 50000,
    }
    
    if not entities["budget"]:
        for word, value in number_words.items():
            if word in text_lower and ("mil" in text_lower or "reais" in text_lower):
                entities["budget"] = str(value)
                break
    
    # Extrai público-alvo
    audience_keywords = {
        "jovem": "young", "jovens": "young", "juventude": "young",
        "adulto": "adult", "adultos": "adult",
        "família": "family", "famílias": "family", "familiar": "family",
        "idoso": "senior", "idosos": "senior", "terceira idade": "senior",
        "executivo": "executive", "executivos": "executive", "corporativo": "executive",
        "criança": "children", "crianças": "children", "infantil": "children",
    }
    
    for keyword, audience in audience_keywords.items():
        if keyword in text_lower:
            entities["target_audience"] = audience
            break
    
    return entities


def _transcribe_fallback(audio_bytes: bytes) -> Dict[str, Any]:
    """
    Simulação de transcrição quando Google Speech não está disponível.
    Gera transcrição baseada no tamanho do áudio.
    """
    samples = [
        "Quero abrir uma cafeteria em Pinheiros com orçamento de 100 mil reais",
        "Estou pensando em uma academia em Moema para público adulto",
        "Preciso analisar oportunidade de coworking em Vila Madalena",
        "Quero investir em restaurante fitness nos Jardins com 200 mil",
        "Analisar pet shop em Santana para classe média",
        "Busco abrir uma farmácia no Centro com 150 mil reais",
        "Interessado em escola de idiomas em Pinheiros para jovens",
        "Quero abrir um bar na Vila Madalena com 80 mil de orçamento",
    ]
    
    # Usa o tamanho do áudio para escolher uma amostra
    idx = len(audio_bytes) % len(samples)
    transcript = samples[idx]
    
    entities = extract_entities(transcript)
    
    return {
        "transcript": transcript,
        "confidence": 0.85,
        "entities": entities,
        "note": "Transcrição simulada (Google Speech-to-Text não configurado)",
    }


def test_speech_connection() -> bool:
    """Testa se o Google Speech-to-Text está configurado corretamente."""
    try:
        client = get_speech_client()
        return client is not None
    except Exception as e:
        print(f"Erro ao testar Google Speech: {e}")
        return False
