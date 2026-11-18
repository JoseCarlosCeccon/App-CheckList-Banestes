# Checklist BANESTES 2027 · FCC

Aplicação web interativa de checklist de estudos para o **Concurso BANESTES 2027** (banca **Fundação Carlos Chagas – FCC**), focada no cargo **Analista de Tecnologia da Informação – Desenvolvimento de Sistemas (Código 04)**.

Construído seguindo a arquitetura e o modelo do [CheckListApp](https://github.com/JoseCarlosCeccon/CheckListApp) (React + Vite), com roteiro por dependência de aprendizado, estatísticas reais de provas anteriores da FCC e ilustrações 3D isométricas geradas por IA.

---

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse em `http://127.0.0.1:5173/` (ou execute o script `./start-checklistapp.ps1` no Windows).

Para gerar o build de produção:

```bash
npm run build
npm run preview
```

---

## Análise do Edital e das Provas da FCC

### 1. Estrutura da Prova e Pesos (Anexo IV do Edital)
- **Data prevista da prova:** `21/02/2027` (domingo, manhã — 4h de duração)
- **Conhecimentos Gerais:** 30 questões × Peso 1 = **30 pontos (23% da nota)**
  - Língua Portuguesa (10)
  - Raciocínio Lógico, Estatística e Matemática Financeira (10)
  - Atualidades do Mercado Financeiro e Digital (5)
  - Ética, Compliance e ESG (5)
- **Conhecimentos Específicos:** 50 questões × Peso 2 = **100 pontos (77% da nota)**

### 2. Raio-X Estatístico da Banca FCC (543 questões analisadas)
Foram extraídas e classificadas **543 questões específicas** de **13 provas de TI da FCC (2018–2025)** presentes na pasta `provas similares` (TRTs 1ª, 5ª, 6ª, 15ª e 20ª Regiões, TJ-SC, Prefeitura de SP, DETRAN-AP, COPERGÁS-PE, SANASA e SEGEP-MA):

| Ranking | Matéria / Tema | Incidência nas Provas FCC | Estimativa no Banestes (50 q.) |
| :---: | :--- | :---: | :---: |
| **1º** | **Programação & Orientação a Objetos** (Java, Python, C#, PHP, C) | **17,1%** | 8 a 10 questões |
| **2º** | **Banco de Dados & SQL** (Modelagem, Normalização, SQL, DW/NoSQL) | **16,9%** | 8 a 10 questões |
| **3º** | **Redes de Computadores** (TCP/IP, OSI, Sub-redes, Roteamento, Ferramentas) | **11,6%** | 5 a 7 questões |
| **4º** | **Arquitetura, DevOps & Cloud** (Microsserviços, Docker, K8s, CI/CD) | **9,2%** | 4 a 6 questões |
| **5º** | **Segurança da Informação & LGPD** (Criptografia, OWASP, ISO 27001/27002) | **9,0%** | 4 a 6 questões |
| **6º** | **Sistemas Operacionais** (Processos/Memória, Linux RHEL, Windows Server/AD) | **7,7%** | 3 a 5 questões |
| **7º** | **Desenvolvimento Web & APIs** (HTML/CSS/JS, HTTP, REST, OpenAPI, WCAG) | **7,0%** | 3 a 5 questões |
| **8º** | **Gestão & Governança de TI** (ITIL v5, COBIT 2019, PMBOK 8ª ed., Lei 14.133) | **6,1%** | 3 a 5 questões |
| **9º** | **Engenharia de Software & Testes** (Scrum, Kanban, UML, Testes, ISO 25010) | **5,5%** | 3 a 5 questões |

> **Destaque estratégico:** Apenas **Programação + Banco de Dados** respondem por **34% de todas as questões específicas** da FCC. Na prova de Língua Portuguesa (188 questões analisadas), **43,1%** são de compreensão e interpretação de textos, seguidas por conectivos/coordenação e subordinação (**11,2%**), concordância (**4,8%**) e vozes/tempos verbais (**4,3%**).

---

## Ordem de Aprendizado (Dependência Pedagógica)

O checklist foi ordenado em **14 matérias e 56 blocos** para que cada conteúdo sirva de alicerce para o próximo:

1. **Fase 1 · Fundamentos (Semanas 1–3):**
   - `1. Programação & POO` + `2. Banco de Dados & SQL` (as duas maiores fatias da prova e base técnica para todo o restante) + `3. Língua Portuguesa` e `4. Raciocínio Lógico, Estatística & Mat. Financeira` em estudo diário contínuo.
2. **Fase 2 · Construção de Sistemas (Semanas 4–6):**
   - `5. Engenharia de Software & Testes` (UML e TDD dependem de POO) → `6. Desenvolvimento Web & APIs` (depende de programação e banco) → `7. Sistemas Operacionais` (base para redes, containers e hardening).
3. **Fase 3 · Infraestrutura e Arquitetura (Semanas 7–9):**
   - `8. Redes de Computadores` (base para nuvem e segurança) → `9. Arquitetura, DevOps & Cloud` (une Web + SO + Redes em microsserviços, Docker e Kubernetes) → `10. Segurança da Informação & LGPD` (depende de Redes, SO e Web).
4. **Fase 4 · Gestão e Conhecimentos Bancários (Semanas 10–11):**
   - `11. Gestão & Governança de TI` → `12. Ética, Compliance & ESG` (reaproveita a LGPD já estudada em Segurança) → `13. Atualidades do Mercado Financeiro` (estudada perto da prova para manter os dados frescos).
5. **Fase 5 · Reta Final (Semanas 12–13):**
   - `14. Inglês Técnico` + revisão focada nos blocos de **Foco Máximo** e simulados cronometrados da FCC.

---

## Funcionalidades do App

- **Painel Hero com Contagem Regressiva:** mostra dias restantes até `21/02/2027`, progresso geral em anel SVG, indicador dedicado de **Foco Máximo** e card de **Próximo passo sugerido** (aponta automaticamente o primeiro assunto pendente na sequência de dependências).
- **Gráfico Interativo da Banca FCC:** barras proporcionais com a incidência real de cada disciplina nas provas da FCC (clicáveis para navegar direto à matéria).
- **Roteiro em 5 Fases:** linha do tempo com progresso calculado automaticamente por fase e chips ilustrados por matéria.
- **14 Matérias com Ilustrações 3D Isométricas:** cards visuais com estimativa de questões, tag de área (`Específicos` peso 2 vs. `Gerais` peso 1) e barra de progresso.
- **Filtros Avançados e Busca Global:**
  - Busca por texto na matéria atual ou em **Todas as matérias** simultaneamente.
  - Filtro por nível de prioridade (`Máximo`, `Alto`, `Médio`, `Baixo`).
  - Filtro por status (`Todos`, `Apenas pendentes`, `Apenas concluídos`).
- **Persistência + Backup JSON:** salvamento automático em `localStorage` e botões para **Exportar** e **Importar** seu progresso em arquivo `.json`.
