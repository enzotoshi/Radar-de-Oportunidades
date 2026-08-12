"""
Script de teste rápido para AI Hotspot Finder
Execute: python test_hotspots.py
"""
from ai_hotspot_finder import AIHotspotFinder
import json

def test_find_hotspots():
    """Testa a busca automática de hotspots."""
    print("=" * 80)
    print("🎯 TESTE: BUSCA AUTOMÁTICA DE HOTSPOTS")
    print("=" * 80)
    print()
    
    finder = AIHotspotFinder()
    
    # Busca os 5 melhores pontos para cafeteria em São Paulo
    print("📍 Buscando melhores locais para CAFETERIA em São Paulo...")
    print()
    
    hotspots = finder.find_hotspots(
        city="São Paulo",
        business_type="cafeteria",
        num_hotspots=5
    )
    
    print(f"🏆 TOP {len(hotspots)} HOTSPOTS IDENTIFICADOS:")
    print()
    
    for i, hotspot in enumerate(hotspots, 1):
        print(f"{i}. 📍 {hotspot['name']}")
        print(f"   Score de Oportunidade: {hotspot['opportunity_score']:.1f}/100")
        print(f"   Concorrentes: {hotspot['competition']['total_competitors']} "
              f"({hotspot['competition']['competition_level']})")
        print(f"   Infraestrutura: {hotspot['infrastructure']['infrastructure_score']:.0f}/100")
        print(f"   Mobilidade: {hotspot['mobility']['mobility_score']:.0f}/100")
        print(f"   Fonte: {hotspot['data_source']}")
        
        # Classificação visual
        score = hotspot['opportunity_score']
        if score >= 75:
            emoji = "🟢 EXCELENTE"
        elif score >= 60:
            emoji = "🟡 BOM"
        elif score >= 40:
            emoji = "🟠 REGULAR"
        else:
            emoji = "🔴 RUIM"
        print(f"   Classificação: {emoji}")
        print()
    
    print("=" * 80)
    print()
    
    return hotspots


def test_custom_location():
    """Testa análise de localização customizada."""
    print("=" * 80)
    print("🔍 TESTE: ANÁLISE DE LOCALIZAÇÃO CUSTOMIZADA")
    print("=" * 80)
    print()
    
    finder = AIHotspotFinder()
    
    # Analisa Vila Madalena especificamente
    print("📍 Analisando: Vila Madalena (-23.5505, -46.6877)")
    print()
    
    analysis = finder.analyze_custom_location(
        lat=-23.5505,
        lng=-46.6877,
        business_type="cafeteria",
        location_name="Vila Madalena"
    )
    
    print(f"🎯 Score de Oportunidade: {analysis['opportunity_score']:.1f}/100")
    print()
    
    print("📊 Análise Detalhada:")
    print()
    
    # Concorrência
    comp = analysis['competition']
    print(f"  🏪 Concorrência:")
    print(f"     • Total: {comp['total_competitors']} competidores")
    print(f"     • Densidade: {comp['density_per_km2']:.1f} por km²")
    print(f"     • Nível: {comp['competition_level']}")
    print(f"     • Rating médio: {comp.get('average_rating', 0):.1f}⭐")
    print()
    
    # Infraestrutura
    infra = analysis['infrastructure']
    print(f"  🏗️ Infraestrutura:")
    print(f"     • Score: {infra['infrastructure_score']:.0f}/100")
    print(f"     • Facilidades: {infra['total_facilities']}")
    print()
    
    # Mobilidade
    mob = analysis['mobility']
    print(f"  🚌 Mobilidade:")
    print(f"     • Score: {mob['mobility_score']:.0f}/100")
    print(f"     • Opções de transporte: {mob['total_transport_options']}")
    print()
    
    # Recomendações
    print("💡 Recomendações da IA:")
    for i, rec in enumerate(analysis['recommendations'], 1):
        print(f"   {i}. {rec}")
    print()
    
    print(f"📡 Fonte de Dados: {analysis['data_source']}")
    print()
    print("=" * 80)
    print()
    
    return analysis


def compare_business_types():
    """Compara diferentes tipos de negócio na mesma localização."""
    print("=" * 80)
    print("⚖️ TESTE: COMPARAÇÃO DE TIPOS DE NEGÓCIO")
    print("=" * 80)
    print()
    
    finder = AIHotspotFinder()
    location = "Vila Madalena"
    lat, lng = -23.5505, -46.6877
    
    business_types = ["cafeteria", "academia", "restaurante_fitness", "bar_pub"]
    
    print(f"📍 Comparando negócios em: {location}")
    print()
    
    results = []
    
    for business in business_types:
        analysis = finder.analyze_custom_location(
            lat=lat, lng=lng,
            business_type=business,
            location_name=location
        )
        results.append({
            "business": business,
            "score": analysis['opportunity_score'],
            "competition": analysis['competition']['total_competitors']
        })
    
    # Ordena por score
    results.sort(key=lambda x: x['score'], reverse=True)
    
    print("🏆 Ranking de Melhores Negócios:")
    print()
    
    for i, result in enumerate(results, 1):
        print(f"{i}. {result['business'].upper()}")
        print(f"   Score: {result['score']:.1f}/100")
        print(f"   Concorrentes: {result['competition']}")
        print()
    
    print("=" * 80)
    print()
    
    return results


def export_to_json():
    """Exporta resultados para JSON (útil para frontend)."""
    print("=" * 80)
    print("💾 EXPORTANDO PARA JSON")
    print("=" * 80)
    print()
    
    finder = AIHotspotFinder()
    
    # Busca hotspots
    hotspots = finder.find_hotspots(
        city="São Paulo",
        business_type="cafeteria",
        num_hotspots=10
    )
    
    # Salva em arquivo
    output = {
        "city": "São Paulo",
        "business_type": "cafeteria",
        "total_hotspots": len(hotspots),
        "hotspots": hotspots
    }
    
    filename = "hotspots_output.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Arquivo salvo: {filename}")
    print()
    print("Preview:")
    print(json.dumps(output, indent=2, ensure_ascii=False)[:500] + "...")
    print()
    print("=" * 80)
    print()


def main():
    """Executa todos os testes."""
    print("\n")
    print("╔═══════════════════════════════════════════════════════════════════════════╗")
    print("║                                                                           ║")
    print("║               🤖 AI HOTSPOT FINDER - SUITE DE TESTES                     ║")
    print("║                                                                           ║")
    print("╚═══════════════════════════════════════════════════════════════════════════╝")
    print("\n")
    
    try:
        # Teste 1: Busca automática
        test_find_hotspots()
        
        # Teste 2: Análise customizada
        test_custom_location()
        
        # Teste 3: Comparação de negócios
        compare_business_types()
        
        # Teste 4: Exportar JSON
        export_to_json()
        
        print()
        print("╔═══════════════════════════════════════════════════════════════════════════╗")
        print("║                                                                           ║")
        print("║                        ✅ TODOS OS TESTES CONCLUÍDOS!                     ║")
        print("║                                                                           ║")
        print("║  Próximo passo: Integrar no frontend!                                    ║")
        print("║  Veja: COMO_USAR_AI_HOTSPOTS.md                                         ║")
        print("║                                                                           ║")
        print("╚═══════════════════════════════════════════════════════════════════════════╝")
        print("\n")
        
    except Exception as e:
        print()
        print("❌ ERRO durante os testes:")
        print(f"   {str(e)}")
        print()
        print("💡 Possíveis causas:")
        print("   • Google Maps API não configurada")
        print("   • API key inválida ou sem permissões")
        print("   • Places API não habilitada")
        print()
        print("🔧 Solução:")
        print("   1. Verifique backend/.env")
        print("   2. Habilite Places API no Google Cloud Console")
        print("   3. Tente novamente")
        print()


if __name__ == "__main__":
    main()
