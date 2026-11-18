import { useEffect, useMemo, useRef, useState } from 'react';
import { checklistData, examInfo, incidenceStats, studyPhases } from '../checklistData.js';
import {
  countDoneTopics,
  countTopics,
  exportProgressJson,
  getBlockTopicIds,
  getCompletionPercent,
  getDaysUntil,
  getNextTopic,
  getTopicId,
  isBlockComplete,
  loadProgress,
  normalizeText,
  parseImportedProgress,
  saveProgress,
} from '../utils/checklist.js';

const focusOptions = ['Todos', 'Máximo', 'Alto', 'Médio', 'Baixo'];
const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'pending', label: 'Apenas pendentes' },
  { value: 'done', label: 'Apenas concluídos' },
];
const subjectsById = Object.fromEntries(checklistData.map((subject) => [subject.id, subject]));

function Icon({ name, size = 17 }) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  switch (name) {
    case 'check':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.7 2.7L16 9" />
        </svg>
      );
    case 'circle':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case 'list':
      return (
        <svg {...p}>
          <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      );
    case 'book':
      return (
        <svg {...p}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
          <path d="M4 5.5v16" />
        </svg>
      );
    case 'reset':
      return (
        <svg {...p}>
          <path d="M4 7v5h5" />
          <path d="M20 12a8 8 0 0 0-14.9-4" />
          <path d="M20 17a8 8 0 0 1-14.9-4" />
        </svg>
      );
    case 'download':
      return (
        <svg {...p}>
          <path d="M12 3v12m0 0-4-4m4 4 4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      );
    case 'upload':
      return (
        <svg {...p}>
          <path d="M12 15V3m0 0-4 4m4-4 4 4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...p}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      );
    case 'target':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...p}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...p}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      );
  }
}

function SubjectImage({ src, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return <div className={`img-fallback ${className}`} aria-hidden="true" />;
  }

  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

function ProgressRing({ percent, size = 112 }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="ring-bg" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className="ring-fg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percent / 100) * circumference}
        />
      </svg>
      <div className="ring-label">
        <strong>{percent}%</strong>
        <span>concluído</span>
      </div>
    </div>
  );
}

function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(max-width: 760px)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 760px)');
    const updateLayout = () => setIsMobile(mediaQuery.matches);
    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);
    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  return isMobile;
}

function TopicChecklist({ block, progress, onToggleTopic }) {
  return (
    <ul className="topic-checklist">
      {block.topics.map((topic) => {
        const topicId = getTopicId(block.id, topic);
        const isChecked = Boolean(progress[topicId]);

        return (
          <li className={isChecked ? 'checked-topic' : ''} key={topicId}>
            <label>
              <input type="checkbox" checked={isChecked} onChange={() => onToggleTopic(block.id, topic)} />
              <span>{topic}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function BlockCheckButton({ block, isDone, onToggleBlock }) {
  return (
    <button
      className="check-button"
      type="button"
      onClick={() => onToggleBlock(block)}
      aria-label={isDone ? 'Desmarcar bloco' : 'Marcar bloco inteiro'}
      aria-pressed={isDone}
    >
      <Icon name={isDone ? 'check' : 'circle'} size={22} />
    </button>
  );
}

function DesktopRow({ block, progress, onToggleBlock, onToggleTopic, subjectLabel }) {
  const isDone = isBlockComplete(block, progress);
  const doneTopics = getBlockTopicIds(block).filter((topicId) => progress[topicId]).length;

  return (
    <tr className={isDone ? 'done-row' : ''}>
      <td>
        <BlockCheckButton block={block} isDone={isDone} onToggleBlock={onToggleBlock} />
      </td>
      <td>
        <span className="order-pill">{block.order}</span>
      </td>
      <td className="block-title-cell">
        <div className="block-title">
          <strong>{subjectLabel ? `${subjectLabel} · Bloco ${block.order}` : `Bloco ${block.order}`}</strong>
          <span>{block.title}</span>
          <small>
            {doneTopics}/{block.topics.length} assuntos
          </small>
        </div>
      </td>
      <td>
        <TopicChecklist block={block} progress={progress} onToggleTopic={onToggleTopic} />
      </td>
      <td>
        <span className={`focus-pill ${normalizeText(block.focus)}`}>{block.focus}</span>
        <small className="probability">Incidência: {block.probability}</small>
      </td>
      <td className="reason-cell">{block.reason}</td>
    </tr>
  );
}

function MobileCard({ block, progress, onToggleBlock, onToggleTopic, subjectLabel }) {
  const isDone = isBlockComplete(block, progress);
  const doneTopics = getBlockTopicIds(block).filter((topicId) => progress[topicId]).length;

  return (
    <article className={`mobile-block-card ${isDone ? 'done-row' : ''}`}>
      <div className="mobile-block-head">
        <div>
          <p className="mobile-block-kicker">
            {subjectLabel ? `${subjectLabel} · Bloco ${block.order}` : `Bloco ${block.order}`}
          </p>
          <h3>{block.title}</h3>
          <p className="mobile-block-meta">
            {doneTopics}/{block.topics.length} assuntos
          </p>
        </div>
        <BlockCheckButton block={block} isDone={isDone} onToggleBlock={onToggleBlock} />
      </div>
      <div className="mobile-block-tags">
        <span className={`focus-pill ${normalizeText(block.focus)}`}>{block.focus}</span>
        <span className="probability">Incidência: {block.probability}</span>
      </div>
      <p className="mobile-block-reason">{block.reason}</p>
      <TopicChecklist block={block} progress={progress} onToggleTopic={onToggleTopic} />
    </article>
  );
}

function ChecklistBoard() {
  const [activeSubject, setActiveSubject] = useState(checklistData[0].id);
  const [progress, setProgress] = useState(loadProgress);
  const [query, setQuery] = useState('');
  const [focusFilter, setFocusFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchAllSubjects, setSearchAllSubjects] = useState(false);
  const isMobileLayout = useIsMobileLayout();
  const checklistRef = useRef(null);
  const fileInputRef = useRef(null);

  const selectedSubject = subjectsById[activeSubject] || checklistData[0];
  const allBlocks = useMemo(() => checklistData.flatMap((subject) => subject.blocks), []);
  const daysLeft = getDaysUntil(examInfo.examDate);

  const subjectProgress = useMemo(
    () =>
      Object.fromEntries(
        checklistData.map((subject) => {
          const done = countDoneTopics(subject.blocks, progress);
          const total = countTopics(subject.blocks);
          return [subject.id, { done, total, percent: getCompletionPercent(done, total) }];
        }),
      ),
    [progress],
  );

  const stats = useMemo(() => {
    const totalDoneTopics = countDoneTopics(allBlocks, progress);
    const totalTopics = countTopics(allBlocks);
    const doneBlocks = allBlocks.filter((block) => isBlockComplete(block, progress)).length;
    const subjectDoneModules = selectedSubject.blocks.filter((block) => isBlockComplete(block, progress)).length;
    const maxFocusBlocks = allBlocks.filter((block) => block.focus === 'Máximo');
    const maxFocusDoneTopics = countDoneTopics(maxFocusBlocks, progress);
    const maxFocusTotalTopics = countTopics(maxFocusBlocks);

    return {
      totalDoneTopics,
      totalTopics,
      totalPercent: getCompletionPercent(totalDoneTopics, totalTopics),
      doneBlocks,
      totalBlocks: allBlocks.length,
      subjectDoneModules,
      maxFocusDoneTopics,
      maxFocusTotalTopics,
      maxFocusPercent: getCompletionPercent(maxFocusDoneTopics, maxFocusTotalTopics),
    };
  }, [allBlocks, progress, selectedSubject]);

  const nextTopic = useMemo(() => getNextTopic(checklistData, progress), [progress]);

  const filteredBlocks = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const sourceSubjects = searchAllSubjects ? checklistData : [selectedSubject];

    return sourceSubjects.flatMap((subject) =>
      subject.blocks
        .filter((block) => {
          const matchesFocus = focusFilter === 'Todos' || block.focus === focusFilter;
          const done = isBlockComplete(block, progress);
          const matchesStatus =
            statusFilter === 'all' || (statusFilter === 'done' ? done : !done);
          const searchable = normalizeText(
            [subject.subject, block.title, block.focus, block.probability, block.reason, ...block.topics].join(' '),
          );
          return matchesFocus && matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
        })
        .map((block) => ({
          block,
          subjectLabel: searchAllSubjects ? subject.subject : null,
        })),
    );
  }, [focusFilter, statusFilter, query, searchAllSubjects, selectedSubject, progress]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  function openSubject(subjectId) {
    setActiveSubject(subjectId);
    setSearchAllSubjects(false);
    setQuery('');
    setFocusFilter('Todos');
    setStatusFilter('all');
    requestAnimationFrame(() => checklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function toggleTopic(blockId, topicTitle) {
    const topicId = getTopicId(blockId, topicTitle);
    setProgress((current) => ({ ...current, [topicId]: !current[topicId] }));
  }

  function toggleBlock(block) {
    const topicIds = getBlockTopicIds(block);
    setProgress((current) => {
      const shouldComplete = !topicIds.every((topicId) => current[topicId]);
      const next = { ...current };
      topicIds.forEach((topicId) => {
        next[topicId] = shouldComplete;
      });
      return next;
    });
  }

  function resetProgress() {
    if (window.confirm('Deseja limpar todas as marcações salvas?')) {
      setProgress({});
    }
  }

  function handleExportProgress() {
    const json = exportProgressJson(progress);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `progresso-banestes-2027-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseImportedProgress(String(reader.result || ''));
        setProgress(imported);
      } catch {
        window.alert('Não foi possível importar este arquivo JSON.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  const maxIncidence = Math.max(...incidenceStats.items.map((item) => item.value));
  const selectedProgress = subjectProgress[selectedSubject.id];

  return (
    <main className="app-shell">
      {/* ------------------------------------------------ HERO */}
      <header className="hero">
        <div className="hero-media" aria-hidden="true">
          <SubjectImage src="/images/hero.jpg" className="hero-img" />
        </div>
        <div className="hero-content">
          <p className="eyebrow">CheckList · {examInfo.board}</p>
          <h1>{examInfo.title}</h1>
          <p className="hero-role">{examInfo.role}</p>
          <p className="subtitle">
            Checklist em ordem de aprendizado — cada matéria prepara a seguinte — e priorizado pelo que
            mais cai nas provas da FCC. Seu progresso fica salvo neste navegador.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <Icon name="calendar" size={18} />
              <strong>{daysLeft}</strong>
              <span>dias até a prova · {examInfo.examDateLabel}</span>
            </div>
            {examInfo.structure.map((part) => (
              <div className="hero-stat" key={part.label}>
                <Icon name="target" size={18} />
                <strong>{part.questions}</strong>
                <span>
                  {part.label} · peso {part.weight} ({part.points} pts)
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside className="hero-panel">
          <ProgressRing percent={stats.totalPercent} />
          <div className="hero-panel-numbers">
            <span>
              <strong>{stats.totalDoneTopics}</strong>/{stats.totalTopics} assuntos
            </span>
            <span>
              <strong>{stats.doneBlocks}</strong>/{stats.totalBlocks} blocos
            </span>
          </div>
          <div className="max-focus-pill" title="Progresso nos blocos de Foco Máximo (maior incidência na FCC)">
            <span>Foco Máximo:</span>
            <strong>
              {stats.maxFocusDoneTopics}/{stats.maxFocusTotalTopics} ({stats.maxFocusPercent}%)
            </strong>
          </div>
          {nextTopic ? (
            <button type="button" className="next-step" onClick={() => openSubject(nextTopic.subject.id)}>
              <small>Próximo passo sugerido</small>
              <strong>{nextTopic.topic}</strong>
              <span>
                {nextTopic.subject.subject} · {nextTopic.block.title} <Icon name="arrow" size={14} />
              </span>
            </button>
          ) : (
            <div className="next-step done">
              <strong>Tudo concluído! Agora é simulado e revisão. 🎉</strong>
            </div>
          )}
        </aside>
      </header>

      {/* ------------------------------------------------ INSIGHTS */}
      <section className="insights">
        <article className="panel">
          <div className="panel-head">
            <Icon name="chart" />
            <div>
              <h2>O que mais cai na FCC</h2>
              <p>
                {incidenceStats.questionsAnalyzed} questões específicas de {incidenceStats.examsAnalyzed} provas
                de TI da banca (2018–2025)
              </p>
            </div>
          </div>
          <ul className="bars">
            {incidenceStats.items.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  disabled={!item.subjectId}
                  onClick={() => item.subjectId && openSubject(item.subjectId)}
                >
                  <span className="bar-label">{item.label}</span>
                  <span className="bar-track">
                    <span style={{ width: `${(item.value / maxIncidence) * 100}%` }} />
                  </span>
                  <span className="bar-value">{item.value.toFixed(1)}%</span>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel weight-panel">
          <div className="panel-head">
            <Icon name="target" />
            <div>
              <h2>Onde estão os pontos</h2>
              <p>Específicos valem mais que o triplo dos Gerais</p>
            </div>
          </div>
          <div className="weight-split">
            <div className="weight-bar">
              <span className="w-esp" style={{ width: '77%' }}>
                Específicos · 100 pts
              </span>
              <span className="w-ger" style={{ width: '23%' }}>
                Gerais · 30
              </span>
            </div>
            <ul className="weight-list">
              <li>
                <strong>50</strong> questões específicas × peso 2 = <strong>77%</strong> da nota
              </li>
              <li>
                <strong>10</strong> Português · <strong>10</strong> Raciocínio/Estatística/Mat. Fin.
              </li>
              <li>
                <strong>5</strong> Atualidades do Mercado Financeiro · <strong>5</strong> Ética, Compliance e ESG
              </li>
              <li>
                Programação + Banco de Dados ≈ <strong>1/3</strong> das específicas na FCC
              </li>
            </ul>
          </div>
        </article>
      </section>

      {/* ------------------------------------------------ ROADMAP */}
      <section className="roadmap">
        <div className="section-title">
          <h2>Roteiro de estudos</h2>
          <p>Siga as fases em ordem: as dependências entre matérias já estão resolvidas.</p>
        </div>
        <ol className="phases">
          {studyPhases.map((phase, index) => {
            const phaseSubjects = phase.subjects.map((id) => subjectsById[id]);
            const done = phaseSubjects.reduce((sum, s) => sum + subjectProgress[s.id].done, 0);
            const total = phaseSubjects.reduce((sum, s) => sum + subjectProgress[s.id].total, 0);
            const percent = getCompletionPercent(done, total);

            return (
              <li className={`phase ${percent === 100 ? 'phase-done' : ''}`} key={phase.id}>
                <div className="phase-marker">{index + 1}</div>
                <div className="phase-body">
                  <div className="phase-head">
                    <h3>{phase.title}</h3>
                    <span className="phase-weeks">{phase.weeks}</span>
                  </div>
                  <p>{phase.description}</p>
                  <div className="phase-subjects">
                    {phaseSubjects.map((subject) => (
                      <button
                        type="button"
                        key={subject.id}
                        className={`chip ${subject.id === activeSubject ? 'active' : ''}`}
                        onClick={() => openSubject(subject.id)}
                      >
                        <SubjectImage src={subject.image} className="chip-img" />
                        <span>
                          {subject.order}. {subject.subject}
                        </span>
                        <em>{subjectProgress[subject.id].percent}%</em>
                      </button>
                    ))}
                  </div>
                  <div className="mini-track">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ------------------------------------------------ SUBJECT GRID */}
      <section className="subjects">
        <div className="section-title">
          <h2>Matérias em ordem de aprendizado</h2>
          <p>Clique para abrir o checklist. A estimativa de questões considera o edital e o histórico da FCC.</p>
        </div>
        <div className="subject-grid">
          {checklistData.map((subject) => {
            const sp = subjectProgress[subject.id];
            return (
              <button
                type="button"
                key={subject.id}
                className={`subject-card ${subject.id === activeSubject ? 'active' : ''} ${
                  sp.percent === 100 ? 'complete' : ''
                }`}
                onClick={() => openSubject(subject.id)}
              >
                <div className="subject-card-media">
                  <SubjectImage src={subject.image} alt="" />
                  <span className="subject-order">{subject.order}</span>
                  <span className={`area-tag ${subject.area === 'Gerais' ? 'gerais' : ''}`}>{subject.area}</span>
                </div>
                <div className="subject-card-body">
                  <h3>{subject.subject}</h3>
                  <p className="estimate">≈ {subject.estimate}</p>
                  <div className="mini-track">
                    <span style={{ width: `${sp.percent}%` }} />
                  </div>
                  <small>
                    {sp.done}/{sp.total} assuntos · {sp.percent}%
                  </small>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------ CHECKLIST */}
      <section className="board" ref={checklistRef}>
        <div className="subject-banner">
          <SubjectImage src={selectedSubject.image} className="banner-img" />
          <div className="banner-text">
            <p className="eyebrow">
              Matéria {selectedSubject.order} de {checklistData.length} · {selectedSubject.area}
            </p>
            <h2>{selectedSubject.subject}</h2>
            <p>{selectedSubject.summary}</p>
            <div className="banner-tags">
              <span>≈ {selectedSubject.estimate}</span>
              {selectedSubject.incidence ? <span>{selectedSubject.incidence}% das questões FCC</span> : null}
              <span>
                {stats.subjectDoneModules}/{selectedSubject.blocks.length} blocos
              </span>
              <span>
                {selectedProgress.done}/{selectedProgress.total} assuntos ({selectedProgress.percent}%)
              </span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${selectedProgress.percent}%` }} />
            </div>
          </div>
        </div>

        <section className="toolbar" aria-label="Filtros">
          <div className="subject-tabs" aria-label="Matérias">
            {checklistData.map((subject) => (
              <button
                className={!searchAllSubjects && subject.id === activeSubject ? 'active' : ''}
                key={subject.id}
                type="button"
                onClick={() => {
                  setSearchAllSubjects(false);
                  setActiveSubject(subject.id);
                }}
                aria-pressed={!searchAllSubjects && subject.id === activeSubject}
                title={subject.subject}
              >
                {subject.order}. {subject.subject}
              </button>
            ))}
            <button
              className={searchAllSubjects ? 'active' : ''}
              type="button"
              onClick={() => setSearchAllSubjects((prev) => !prev)}
              aria-pressed={searchAllSubjects}
              title="Exibir blocos de todas as matérias de uma vez"
            >
              Todas as matérias
            </button>
          </div>

          <div className="tool-controls">
            <label className="search-box">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchAllSubjects ? 'Buscar em todas as matérias...' : 'Buscar assunto na matéria...'}
                aria-label="Buscar assunto"
              />
            </label>
            <select
              value={focusFilter}
              onChange={(event) => setFocusFilter(event.target.value)}
              aria-label="Filtrar por foco"
            >
              {focusOptions.map((option) => (
                <option key={option} value={option}>
                  Foco: {option}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrar por status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              className="icon-button"
              type="button"
              onClick={handleExportProgress}
              title="Exportar progresso em JSON"
              aria-label="Exportar progresso em JSON"
            >
              <Icon name="download" size={17} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Importar progresso de arquivo JSON"
              aria-label="Importar progresso de arquivo JSON"
            >
              <Icon name="upload" size={17} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={handleImportFile}
            />
            <button
              className="icon-button danger-hover"
              type="button"
              onClick={resetProgress}
              title="Limpar marcações"
              aria-label="Limpar marcações"
            >
              <Icon name="reset" size={17} />
            </button>
          </div>
        </section>

        {isMobileLayout ? (
          <section className="mobile-cards-view">
            {filteredBlocks.map(({ block, subjectLabel }) => (
              <MobileCard
                key={block.id}
                block={block}
                subjectLabel={subjectLabel}
                progress={progress}
                onToggleBlock={toggleBlock}
                onToggleTopic={toggleTopic}
              />
            ))}
            {!filteredBlocks.length ? <div className="empty-state">Nenhum bloco encontrado para esse filtro.</div> : null}
          </section>
        ) : (
          <section className="desktop-table-view">
            <table>
              <caption className="sr-only">Blocos e assuntos de {selectedSubject.subject}</caption>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Ordem</th>
                  <th>Bloco</th>
                  <th>Assuntos</th>
                  <th>Foco</th>
                  <th>Por que nesta ordem</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map(({ block, subjectLabel }) => (
                  <DesktopRow
                    key={block.id}
                    block={block}
                    subjectLabel={subjectLabel}
                    progress={progress}
                    onToggleBlock={toggleBlock}
                    onToggleTopic={toggleTopic}
                  />
                ))}
              </tbody>
            </table>
            {!filteredBlocks.length ? <div className="empty-state">Nenhum bloco encontrado para esse filtro.</div> : null}
          </section>
        )}
      </section>

      <footer className="app-footer">
        Baseado no Edital BANESTES (Anexo IV) e em {incidenceStats.examsAnalyzed} provas FCC de TI. Imagens geradas por IA.
      </footer>
    </main>
  );
}

export default ChecklistBoard;
