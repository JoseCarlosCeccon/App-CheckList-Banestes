# Checklist BANESTES 2027 · FCC

App de checklist de estudos para o **Concurso BANESTES 2027** (banca **Fundação Carlos Chagas**), cargo
**Analista de Tecnologia da Informação – Desenvolvimento de Sistemas**. Ele foi feito com base no
[CheckListApp](https://github.com/JoseCarlosCeccon/CheckListApp) (React + Vite).

## Como rodar

```bash
npm install
npm run dev      # http://127.0.0.1:5173/
```

Você também pode rodar `start-checklistapp.ps1`, que sobe o servidor e abre o navegador.

## Como o conteúdo foi montado

1. **Edital** (Anexo IV): 30 questões de Conhecimentos Gerais (peso 1) e 50 de Específicos (peso 2), prova em 21/02/2027.
   As específicas valem **77% da nota**.
2. **Provas FCC de TI** da pasta `provas similares`: 13 provas com texto extraível (2018–2025), **543 questões
   específicas** classificadas por tema usando palavras-chave:

| Tema | % das questões |
|---|---|
| Programação / POO | 17,1% |
| Banco de Dados / SQL | 16,9% |
| Redes de Computadores | 11,6% |
| Arquitetura / DevOps / Cloud | 9,2% |
| Segurança / LGPD | 9,0% |
| Sistemas Operacionais | 7,7% |
| Web / APIs | 7,0% |
| Governança de TI | 6,1% |
| Engenharia de Software | 5,5% |

> Três provas (TRT-21 2023, TJ-CE 2026, TRF-4 2025) são PDFs escaneados (só imagem) e ficaram de fora da contagem.

3. **Ordem de aprendizado**: Programação → Banco de Dados → Eng. Software → Web/APIs → SO → Redes →
   Arquitetura/DevOps → Segurança → Governança. Português e Raciocínio rodam em paralelo desde a fase 1, e
   Mercado Financeiro fica perto da prova para você chegar atualizado.

## Funcionalidades

- Hero com contagem regressiva, progresso geral e **próximo passo sugerido** (o primeiro assunto pendente na ordem de aprendizado)
- Gráfico de incidência por tema (dá para clicar e abrir a matéria)
- Roteiro em 5 fases com progresso por fase
- Cards de matéria com ilustrações geradas por IA
- Checklist por blocos com foco (Máximo/Alto/Médio/Baixo), busca e filtro
- Progresso salvo no `localStorage`
- Layout responsivo (tabela no desktop, cards no mobile)
