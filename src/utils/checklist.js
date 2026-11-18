const STORAGE_KEY = 'banestes2027.topicProgress.v1';

function hasLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

export function getTopicId(blockId, topicTitle) {
  return `${blockId}-topic-${hashString(`${blockId}|${topicTitle}`)}`;
}

export function getBlockTopicIds(block) {
  return block.topics.map((topic) => getTopicId(block.id, topic));
}

export function isBlockComplete(block, progress) {
  return getBlockTopicIds(block).every((topicId) => progress[topicId]);
}

export function countDoneTopics(blocks, progress) {
  return blocks.reduce(
    (total, block) =>
      total + getBlockTopicIds(block).filter((topicId) => progress[topicId]).length,
    0,
  );
}

export function countTopics(blocks) {
  return blocks.reduce((total, block) => total + block.topics.length, 0);
}

export function loadProgress() {
  if (!hasLocalStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress) {
  if (!hasLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore persistence failures so the UI remains usable.
  }
}

export function getCompletionPercent(done, total) {
  if (!total) {
    return 0;
  }

  return Math.round((done / total) * 100);
}

const focusRank = { Máximo: 0, Alto: 1, Médio: 2, Baixo: 3 };

/**
 * Próximo assunto sugerido: segue a ordem de aprendizado (matéria → bloco → assunto),
 * respeitando as dependências. Retorna o primeiro assunto ainda não marcado.
 */
export function getNextTopic(subjects, progress) {
  const ordered = [...subjects].sort((a, b) => a.order - b.order);

  for (const subject of ordered) {
    for (const block of subject.blocks) {
      for (const topic of block.topics) {
        if (!progress[getTopicId(block.id, topic)]) {
          return { subject, block, topic };
        }
      }
    }
  }

  return null;
}

export function sortByFocus(blocks) {
  return [...blocks].sort((a, b) => focusRank[a.focus] - focusRank[b.focus] || a.order - b.order);
}

export function getDaysUntil(isoDate) {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function exportProgressJson(progress) {
  const payload = {
    app: 'checklist-banestes-2027',
    version: 1,
    exportedAt: new Date().toISOString(),
    progress,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseImportedProgress(rawText) {
  const parsed = JSON.parse(rawText);
  if (parsed && typeof parsed === 'object') {
    if (parsed.progress && typeof parsed.progress === 'object') {
      return parsed.progress;
    }
    return parsed;
  }
  throw new Error('Formato de arquivo inválido.');
}
