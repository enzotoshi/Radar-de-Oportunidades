# Metodologia do índice de oportunidade

O índice é uma métrica calculada pelo projeto sobre registros do OpenStreetMap. Não é um índice oficial, recomendação financeira, previsão de retorno ou probabilidade de sucesso.

## Entradas observadas

Para um raio de 1,5 km:

- quantidade de estabelecimentos compatíveis com o tipo de negócio;
- quantidade de equipamentos de infraestrutura mapeados;
- quantidade de pontos de mobilidade mapeados;
- área circular calculada em km².

População WorldPop e PIB municipal IBGE são contexto e não entram no índice.

## Componentes

```
densidade = estabelecimentos / área_km²
concorrência = max(0, 100 - densidade * 9)
infraestrutura = min(100, equipamentos * 5)
mobilidade = min(100, pontos_de_mobilidade * 7)

índice = 0,45 * concorrência
       + 0,30 * infraestrutura
       + 0,25 * mobilidade
```

Os multiplicadores e pesos são escolhas metodológicas do projeto, publicadas para permitir auditoria. Devem ser calibrados futuramente contra resultados observados antes de qualquer uso decisório.

## Orçamento e capital necessário

O usuário pode informar o orçamento disponível e sua estimativa do capital total necessário para o endereço escolhido, incluindo implantação, estoque e reserva de operação. O Radar não conhece esses custos automaticamente.

Quando os dois valores são informados:

```
cobertura = orçamento / capital necessário estimado pelo usuário
índice ajustado = índice territorial × min(1, cobertura)
```

Assim, o endereço e os concorrentes alteram o índice territorial; orçamento e custos estimados alteram a cobertura. Quando o orçamento cobre toda a estimativa, capital adicional não eleva o índice. Sem os dois valores, o resultado mostra somente o índice territorial. A cobertura não é uma taxa de retorno nem prova de viabilidade financeira.

## Classificação

- 70 a 100: índice alto na metodologia própria;
- 45 a 69,9: índice intermediário;
- 0 a 44,9: índice baixo.

As faixas não correspondem a risco financeiro.

## Simulação

A projeção começa no índice observado e aplica progressivamente, por cinco anos:

- alteração do componente de concorrência causada pelo número hipotético de novos concorrentes;
- 0,10 ponto no índice para cada ponto percentual da hipótese populacional;
- 0,10 ponto no índice para cada ponto percentual da hipótese de renda.

Todas as entradas futuras são hipóteses do usuário. O resultado é projeção do sistema, não previsão.

## Modo investidor

Pontuação educacional:

- concorrência: componente × 4, máximo 400;
- infraestrutura: componente × 3, máximo 300;
- mobilidade: componente × 3, máximo 300.

Total máximo: 1.000 pontos. Essa pontuação não estima retorno.
