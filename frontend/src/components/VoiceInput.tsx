'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'

interface VoiceInputProps {
  active?: boolean
  onResult: (
    transcript: string,
    entities: Record<string, string | null>
  ) => void
}

// Tipo para SpeechRecognition API (só existe no browser)
interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: any) => void) | null
  onresult: ((event: any) => void) | null
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor
    webkitSpeechRecognition?: ISpeechRecognitionConstructor
  }
}

function extractEntitiesFromText(text: string): Record<string, string | null> {
  const lower = text.toLowerCase()
  const entities: Record<string, string | null> = {
    business_type: null,
    budget: null,
    location: null,
    target_audience: null,
  }

  const businessMap: Record<string, string> = {
    cafeteria: 'cafeteria',
    'coffee shop': 'cafeteria',
    café: 'cafeteria',
    academia: 'academia',
    ginástica: 'academia',
    coworking: 'coworking',
    'espaço compartilhado': 'coworking',
    'restaurante fitness': 'restaurante_saudavel',
    'comida saudável': 'restaurante_saudavel',
    restaurante: 'restaurante',
    hamburgueria: 'lanchonete_hamburgueria',
    lanchonete: 'lanchonete_hamburgueria',
    pizzaria: 'pizzaria',
    japonês: 'restaurante_japones',
    padaria: 'padaria',
    confeitaria: 'confeitaria_doceria',
    farmácia: 'farmacia',
    farmacia: 'farmacia',
    'pet shop': 'pet_shop',
    veterinária: 'pet_shop',
    'loja de animais': 'pet_shop',
    idiomas: 'escola_idiomas',
    inglês: 'escola_idiomas',
    'escola de idiomas': 'escola_idiomas',
    bar: 'bar_pub',
    pub: 'bar_pub',
    eletrônicos: 'loja_eletronicos',
    'loja de eletrônicos': 'loja_eletronicos',
    salão: 'salao_beleza',
    cabeleireiro: 'salao_beleza',
    delivery: 'delivery_comida',
    marmita: 'delivery_comida',
    brechó: 'brecho',
    'moda sustentável': 'brecho',
    clínica: 'clinica_estetica',
    estética: 'clinica_estetica',
    livraria: 'livraria_cafe',
    'café literário': 'livraria_cafe',
    'mercado orgânico': 'mercado_organico',
    orgânico: 'mercado_organico',
    barbearia: 'barbearia',
    'loja de roupas': 'loja_roupas',
    supermercado: 'mercado',
    hotel: 'hotel_pousada',
    pousada: 'hotel_pousada',
    imobiliária: 'imobiliaria',
  }
  for (const [kw, bid] of Object.entries(businessMap)) {
    if (lower.includes(kw)) {
      entities.business_type = bid
      break
    }
  }

  const regionMap: Record<string, string> = {
    pinheiros: 'pinheiros',
    'vila madalena': 'vila_madalena',
    moema: 'moema',
    jardins: 'jardins',
    centro: 'centro',
    'santo andré': 'santo_andre',
    campinas: 'campinas',
    itaquera: 'itaquera',
    liberdade: 'liberdade',
    lapa: 'lapa',
    santana: 'santana',
    abc: 'abc_paulista',
    tatuapé: 'tatuape',
    'vila olímpia': 'vila_olimpia',
    consolação: 'consolacao',
  }
  for (const [kw, rid] of Object.entries(regionMap)) {
    if (lower.includes(kw)) {
      entities.location = rid
      break
    }
  }

  const budgetMatch = lower.match(/(\d[\d.,]*)\s*(mil|k|reais|r\$)?/)
  if (budgetMatch) {
    let val = parseFloat(budgetMatch[1].replace(/\./g, '').replace(',', '.'))
    if (lower.includes('mil') || lower.includes('k')) val *= 1000
    if (val > 0) entities.budget = String(val)
  }

  const audienceMap: Record<string, string> = {
    jovem: 'young',
    adulto: 'adult',
    família: 'family',
    idoso: 'senior',
    executivo: 'executive',
  }
  for (const [kw, aud] of Object.entries(audienceMap)) {
    if (lower.includes(kw)) {
      entities.target_audience = aud
      break
    }
  }

  return entities
}

export default function VoiceInput({ onResult, active = true }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [supported, setSupported] = useState(true)
  const [statusMsg, setStatusMsg] = useState('Toque para falar')
  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const onResultRef = useRef(onResult)
  useEffect(() => { onResultRef.current = onResult }, [onResult])

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setStatusMsg('Ouvindo...')
    }

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      setTranscript(final || interim)
      if (final) {
        const entities = extractEntitiesFromText(final)
        onResultRef.current(final, entities)
        setStatusMsg('Analisado! Toque para falar novamente')
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      setStatusMsg('Erro. Tente novamente')
    }

    recognition.onend = () => {
      setIsListening(false)
      setStatusMsg('Toque para falar')
    }

    recognitionRef.current = recognition
    return () => {
      recognition.onstart = null
      recognition.onend = null
      recognition.onerror = null
      recognition.onresult = null
      recognition.stop()
      recognitionRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!active) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
  }, [active])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setTranscript('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  if (!supported) {
    return (
      <div className="voice-panel flex items-center gap-3">
        <MicOff size={18} className="text-slate-500" />
        <span className="text-sm text-slate-500">
          Entrada de voz não suportada neste navegador
        </span>
      </div>
    )
  }

  return (
    <div className="voice-panel flex items-center gap-3">
      {/* Mic button */}
      <button
        onClick={toggleListening}
        aria-pressed={isListening}
        aria-label={isListening ? 'Parar gravação' : 'Iniciar gravação de voz'}
        title={isListening ? 'Parar gravação' : 'Iniciar gravação de voz'}
        className="voice-button"
      >
        {isListening ? (
          <Volume2 size={22} className="text-white" />
        ) : (
          <Mic size={22} className="text-surface" />
        )}
      </button>

      {/* Status and transcript */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 mb-1">
          Prefere falar sua ideia?
        </p>
        <p role="status" className="text-xs text-accent mb-1">
          {statusMsg}
        </p>
        {transcript ? (
          <p className="text-sm text-white break-words">
            &quot;{transcript}&quot;
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Ex: &quot;Cafeteria em Pinheiros, 100 mil reais&quot;
          </p>
        )}
      </div>
    </div>
  )
}
