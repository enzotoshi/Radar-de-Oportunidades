# Catálogo e proveniência dos dados

| Dado | Classificação | Fonte | Referência | Unidade/observação |
|---|---|---|---|---|
| Endereço e coordenadas | REAL | Nominatim/OpenStreetMap | momento da busca | WGS84 |
| Município e código | REAL | API de Localidades/IBGE | cadastro vigente na API | código IBGE de 7 dígitos |
| Estabelecimentos | REAL | OpenStreetMap via Overpass | momento da coleta | registros mapeados no raio |
| Densidade de estabelecimentos | CALCULADO | sistema sobre OSM | momento da coleta | estabelecimentos/km² |
| Infraestrutura | REAL | OpenStreetMap via Overpass | momento da coleta | equipamentos mapeados |
| Mobilidade | REAL | OpenStreetMap via Overpass | momento da coleta | pontos mapeados |
| PIB municipal | REAL | SIDRA tabela 5938, variável 37 | último período retornado | reais a preços correntes |
| População no raio | ESTIMADO | WorldPop 100 m via Esri | 2020 | soma de células; não censitária |
| Índice de oportunidade | CALCULADO | metodologia do projeto | momento da coleta | escala 0–100 |
| Cenário futuro | SIMULADO | sistema + hipóteses do usuário | horizonte de cinco anos | projeção, não previsão |
| Pontuação do modo investidor | CALCULADO | metodologia educacional | momento da coleta | escala 0–1000 |

## Ausências deliberadas

O projeto não apresenta renda de bairro, fluxo de pedestres, preço de imóvel, aluguel, investimento mínimo, receita, lucro, prazo de retorno ou ROI porque não há fonte adequada integrada para esses dados.

## Cache

- OSM/Overpass e análise composta: 15 minutos, pois POIs podem mudar.
- Geocodificação Nominatim: 30 dias, pois endereços e coordenadas mudam lentamente.
- Localidades, PIB e WorldPop: 30 dias, pois são dados estáveis ou anuais.

## Documentação das fontes

- IBGE Agregados: https://servicodados.ibge.gov.br/api/docs/agregados?versao=3
- IBGE Localidades: https://servicodados.ibge.gov.br/api/docs/localidades
- OSM e licença ODbL: https://www.openstreetmap.org/copyright
- Overpass: https://wiki.openstreetmap.org/wiki/Overpass_API
- Política Nominatim: https://operations.osmfoundation.org/policies/nominatim/
- Metadados WorldPop/Esri: https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Total_Population_100m/ImageServer?f=pjson
- Licença WorldPop: https://www.worldpop.org/faq/
