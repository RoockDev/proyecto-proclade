import { promises as fs } from 'node:fs';
import path from 'node:path';

const CHANGELOG_PATH = path.resolve('docs/CHANGELOG.md');
const HU_DIR = path.resolve('docs/hu');
const ENTRY_START = '<!-- DOCS_AUTO_ENTRIES_START -->';
const ENTRY_END = '<!-- DOCS_AUTO_ENTRIES_END -->';

function normalizeWhitespace(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function extractHuId(pr) {
  const labelNames = (pr.labels ?? [])
    .map((label) => (typeof label === 'string' ? label : label.name ?? ''))
    .join(' ');

  const searchSpace = [pr.title, pr.body ?? '', pr.head?.ref ?? '', labelNames].join(' ');
  const match = searchSpace.match(/hu[\s\-_]*0*(\d{1,4})/i);

  if (match?.[1]) {
    return `HU-${Number(match[1])}`;
  }

  return `PR-${pr.number}`;
}

function sanitizeForFilename(value) {
  return value
    .replace(/[^A-Za-z0-9.-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/\.{2,}/g, '.');
}

function deriveScopeFromFiles(files) {
  const hasFrontend = files.some((file) => file.startsWith('frontend/'));
  const hasBackend = files.some((file) => file.startsWith('backend/'));
  const hasInfra = files.some(
    (file) =>
      file.startsWith('.github/') ||
      file.startsWith('docker/') ||
      file.startsWith('nginx/') ||
      file === 'docker-compose.yml',
  );
  const hasDocs = files.some((file) => file.startsWith('docs/'));

  if (hasFrontend && hasBackend) return 'fullstack';
  if (hasFrontend) return 'frontend';
  if (hasBackend) return 'backend';
  if (hasInfra) return 'infra';
  if (hasDocs) return 'docs';

  return 'unknown';
}

function buildSummary(pr) {
  const cleanedTitle = normalizeWhitespace(pr.title.replace(/hu[\s\-_]*\d+/gi, '').replace(/\s+-\s+/g, ' - '));
  const firstBodyLine = normalizeWhitespace((pr.body ?? '').split('\n').find((line) => line.trim() !== '') ?? '');

  if (firstBodyLine && firstBodyLine.length <= 180) {
    return normalizeWhitespace(`${cleanedTitle}. ${firstBodyLine}`);
  }

  return cleanedTitle || `Cambios incorporados en la PR #${pr.number}`;
}

function formatDate(isoDate) {
  if (!isoDate) return 'Fecha por confirmar';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Fecha por confirmar';

  return date.toISOString().slice(0, 10);
}

function toYamlList(items, fallbackText) {
  if (!items.length) {
    return `  - ${fallbackText}`;
  }

  return items.map((item) => `  - ${item}`).join('\n');
}

function escapeYamlString(value) {
  return value.replace(/"/g, '\\"');
}

async function ensureBaseFiles() {
  await fs.mkdir(HU_DIR, { recursive: true });

  try {
    await fs.access(CHANGELOG_PATH);
  } catch {
    const initial = [
      '# Changelog de documentación',
      '',
      'Registro automático de documentos generados por HU/PR.',
      '',
      '## Entradas',
      '',
      ENTRY_START,
      ENTRY_END,
      '',
    ].join('\n');

    await fs.writeFile(CHANGELOG_PATH, initial, 'utf8');
  }
}

async function githubGet(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'docs-bootstrap-script',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status} (${url}): ${body}`);
  }

  return response.json();
}

// Lista PRs cerradas y mergeadas en la rama base indicada.
async function fetchMergedPullRequests(repository, baseBranch, token, maxPrs) {
  const collected = [];
  let page = 1;

  while (collected.length < maxPrs) {
    const url = `https://api.github.com/repos/${repository}/pulls?state=closed&base=${encodeURIComponent(baseBranch)}&sort=updated&direction=desc&per_page=100&page=${page}`;
    const items = await githubGet(url, token);

    if (!Array.isArray(items) || items.length === 0) {
      break;
    }

    for (const pr of items) {
      if (!pr?.merged_at) {
        continue;
      }

      if (String(pr.title ?? '').startsWith('docs(auto):')) {
        continue;
      }

      collected.push(pr);

      if (collected.length >= maxPrs) {
        break;
      }
    }

    if (items.length < 100) {
      break;
    }

    page += 1;
  }

  return collected.sort((a, b) => new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime());
}

// Obtiene los ficheros modificados de una PR concreta.
async function fetchPullRequestFiles(repository, pullNumber, token) {
  const files = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/repos/${repository}/pulls/${pullNumber}/files?per_page=100&page=${page}`;
    const pageItems = await githubGet(url, token);

    if (!Array.isArray(pageItems) || pageItems.length === 0) {
      break;
    }

    for (const item of pageItems) {
      if (item?.filename) {
        files.push(item.filename);
      }
    }

    if (pageItems.length < 100) {
      break;
    }

    page += 1;
  }

  return files;
}

function buildDocumentContent({ pr, huId, scope, fileList, summary, repository, fileName }) {
  const prUrl = `https://github.com/${repository}/pull/${pr.number}`;
  const filesForFrontmatter = fileList.slice(0, 50);
  const filesForSection = fileList.slice(0, 30);

  return [
    '---',
    `hu_id: ${huId}`,
    `pr_number: ${pr.number}`,
    `merged_at: ${pr.merged_at ?? ''}`,
    `scope: ${scope}`,
    `summary: "${escapeYamlString(summary)}"`,
    'files_changed:',
    toYamlList(filesForFrontmatter, 'Sin archivos detectados por API.'),
    'decisions:',
    '  - Generado automáticamente desde metadatos de la PR. Revisar y completar si aplica.',
    'risks:',
    '  - Validar impacto funcional y cobertura de pruebas antes de promover a producción.',
    '---',
    '',
    `# ${huId} - ${pr.title}`,
    '',
    '## Contexto',
    '',
    summary,
    '',
    '## Cambios implementados',
    '',
    '- Documento generado automáticamente en el bootstrap histórico.',
    '- Se recomienda enriquecer decisiones/riesgos cuando haya contexto de negocio adicional.',
    '',
    '## Archivos relevantes',
    '',
    ...filesForSection.map((file) => `- \`${file}\``),
    ...(filesForSection.length === 0 ? ['- No se pudieron recuperar archivos desde la API de GitHub.'] : []),
    '',
    '## Decisiones técnicas',
    '',
    '- Basado en la estrategia de documentación automática sin IA de pago.',
    '',
    '## Riesgos y mitigación',
    '',
    '- Riesgo: resumen incompleto si la PR no trae contexto suficiente en título/body.',
    '- Mitigación: completar manualmente en la revisión de la PR de documentación.',
    '',
    '## Verificación',
    '',
    `- Documento generado para la PR #${pr.number}.`,
    `- Fecha de merge: ${formatDate(pr.merged_at)}.`,
    '',
    '## Trazabilidad',
    '',
    `- PR: [#${pr.number}](${prUrl})`,
    `- Autor PR: @${pr.user?.login ?? 'desconocido'}`,
    `- Rama origen: \`${pr.head?.ref ?? 'desconocida'}\``,
    `- Archivo de documentación: \`docs/hu/${fileName}\``,
    '',
  ].join('\n');
}

async function upsertChangelogEntry({ huId, pr, repository, fileName }) {
  const prMarker = `PR [#${pr.number}](`;
  const prUrl = `https://github.com/${repository}/pull/${pr.number}`;
  const mergedDate = formatDate(pr.merged_at);
  const entry = `- ${mergedDate} | [${huId} - PR #${pr.number}](hu/${fileName}) | PR [#${pr.number}](${prUrl}) | ${pr.title}`;

  let changelog = await fs.readFile(CHANGELOG_PATH, 'utf8');

  if (changelog.includes(prMarker)) {
    return false;
  }

  if (!changelog.includes(ENTRY_START) || !changelog.includes(ENTRY_END)) {
    changelog = [
      '# Changelog de documentación',
      '',
      'Registro automático de documentos generados por HU/PR.',
      '',
      '## Entradas',
      '',
      ENTRY_START,
      ENTRY_END,
      '',
    ].join('\n');
  }

  const [before, afterStartRaw] = changelog.split(ENTRY_START);
  const [middleRaw, after] = afterStartRaw.split(ENTRY_END);
  const middle = middleRaw.trim();
  const updatedMiddle = middle ? `${entry}\n${middle}` : entry;

  const updatedContent = `${before}${ENTRY_START}\n${updatedMiddle}\n${ENTRY_END}${after}`;
  await fs.writeFile(CHANGELOG_PATH, updatedContent, 'utf8');

  return true;
}

async function processPullRequest(pr, repository, token) {
  const huId = extractHuId(pr);
  const baseFileName = huId.startsWith('HU-') ? `${huId}-PR-${pr.number}.md` : `PR-${pr.number}.md`;
  const fileName = sanitizeForFilename(baseFileName);
  const documentPath = path.join(HU_DIR, fileName);

  let fileList = [];
  try {
    fileList = await fetchPullRequestFiles(repository, pr.number, token);
  } catch (error) {
    console.warn(`No se pudieron recuperar archivos para PR #${pr.number}: ${String(error)}`);
  }

  const scope = deriveScopeFromFiles(fileList);
  const summary = buildSummary(pr);

  let created = false;
  try {
    await fs.access(documentPath);
  } catch {
    const content = buildDocumentContent({
      pr,
      huId,
      scope,
      fileList,
      summary,
      repository,
      fileName,
    });
    await fs.writeFile(documentPath, content, 'utf8');
    created = true;
  }

  const changelogUpdated = await upsertChangelogEntry({ huId, pr, repository, fileName });

  return {
    created,
    changelogUpdated,
    fileName,
    prNumber: pr.number,
  };
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const baseBranch = process.env.INPUT_BASE_BRANCH || 'dev';
  const maxPrs = Number.parseInt(process.env.INPUT_MAX_PRS ?? '200', 10);

  if (!repository || !token) {
    throw new Error('Faltan variables obligatorias: GITHUB_REPOSITORY y GH_TOKEN/GITHUB_TOKEN.');
  }

  if (!Number.isFinite(maxPrs) || maxPrs <= 0) {
    throw new Error('INPUT_MAX_PRS debe ser un número entero mayor que 0.');
  }

  await ensureBaseFiles();

  const pullRequests = await fetchMergedPullRequests(repository, baseBranch, token, maxPrs);

  let createdCount = 0;
  let changelogCount = 0;

  for (const pr of pullRequests) {
    const result = await processPullRequest(pr, repository, token);

    if (result.created) createdCount += 1;
    if (result.changelogUpdated) changelogCount += 1;

    console.log(
      `PR #${result.prNumber}: documento ${result.created ? 'creado' : 'ya existía'}, changelog ${
        result.changelogUpdated ? 'actualizado' : 'sin cambios'
      }`,
    );
  }

  console.log(`Bootstrap finalizado. PRs procesadas: ${pullRequests.length}`);
  console.log(`Documentos nuevos: ${createdCount}`);
  console.log(`Entradas nuevas en changelog: ${changelogCount}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
