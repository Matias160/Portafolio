import { Buffer } from 'node:buffer';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, extname, join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();
const clientDist = join(projectRoot, 'dist');
const serverDist = join(projectRoot, 'dist', 'server');
const openAiDist = join(projectRoot, 'dist', '.openai');
const portfolioModule = await import(pathToFileURL(join(projectRoot, 'src', 'data', 'portfolio.js')).href);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'server' || entry.name === '.openai') continue;

    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
    } else {
      files.push(absolutePath);
    }
  }

  return files;
}

const files = {};
for (const absolutePath of await collectFiles(clientDist)) {
  const routePath = `/${relative(clientDist, absolutePath).split(sep).join('/')}`;
  const extension = extname(absolutePath).toLowerCase();
  files[routePath] = {
    body: (await readFile(absolutePath)).toString('base64'),
    contentType: mimeTypes[extension] ?? 'application/octet-stream',
  };
}

const portfolioContent = {
  profile: portfolioModule.profile,
  technologies: portfolioModule.technologies,
  frontendTechnologies: portfolioModule.frontendTechnologies,
  backendTechnologies: portfolioModule.backendTechnologies,
  aiTools: portfolioModule.aiTools,
  educationItems: portfolioModule.educationItems,
  featuredGames: portfolioModule.featuredGames,
  smallerProjects: portfolioModule.smallerProjects,
};

// El Worker recibe el contenido inicial junto con el sitio: sirve como respaldo
// si D1 todavía no tiene el registro principal o el binding DB no está disponible.
const workerSource = `const files = ${JSON.stringify(files)};
const defaultPortfolio = ${JSON.stringify(portfolioContent)};

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...init.headers,
    },
  });
}

function isAuthorized(request, env) {
  // La clave vive como variable secreta del hosting; no se guarda en D1 ni en el frontend.
  const expectedKey = env.PORTFOLIO_EDIT_KEY;
  return Boolean(expectedKey) && request.headers.get("x-portfolio-key") === expectedKey;
}

function normalizeProject(project, index) {
  return {
    id: String(project?.id || (project?.title ? "proj-" + index + "-" + String(project.title).toLowerCase().replace(/[^a-z0-9]/g, "-") : "project-" + index)),
    title: String(project?.title || "Proyecto sin título").slice(0, 120),
    status: String(project?.status || "").slice(0, 60),
    image: String(project?.image || "").slice(0, 500),
    art: String(project?.art || "").slice(0, 50),
    description: String(project?.description || "").slice(0, 1000),
    tags: Array.isArray(project?.tags) ? project.tags.map((tag) => String(tag).slice(0, 40)).slice(0, 16) : [],
    links: project?.links && typeof project.links === "object" ? project.links : {},
  };
}

function normalizePortfolio(content) {
  const source = content && typeof content === "object" ? content : {};
  const frontendTech = Array.isArray(source.frontendTechnologies)
    ? source.frontendTechnologies.map(String).slice(0, 30)
    : (Array.isArray(source.technologies) ? source.technologies.slice(0, 5) : defaultPortfolio.technologies.slice(0, 5));
  const backendTech = Array.isArray(source.backendTechnologies)
    ? source.backendTechnologies.map(String).slice(0, 30)
    : (Array.isArray(source.technologies) ? source.technologies.slice(5) : defaultPortfolio.technologies.slice(5));
  const unifiedTech = Array.isArray(source.technologies) && source.technologies.length > 0
    ? source.technologies.map(String).slice(0, 60)
    : [...frontendTech, ...backendTech];

  return {
    profile: { ...defaultPortfolio.profile, ...(source.profile || {}) },
    frontendTechnologies: frontendTech,
    backendTechnologies: backendTech,
    technologies: unifiedTech,
    aiTools: Array.isArray(source.aiTools) ? source.aiTools.map(String).slice(0, 30) : defaultPortfolio.aiTools,
    educationItems: Array.isArray(source.educationItems)
      ? source.educationItems.map((item, index) => ({
          id: String(item?.id || "edu-" + index),
          title: String(item?.title || "Formación").slice(0, 140),
          description: String(item?.description || "").slice(0, 600),
          icon: String(item?.icon || "graduation").slice(0, 40),
        })).slice(0, 20)
      : defaultPortfolio.educationItems,
    featuredGames: Array.isArray(source.featuredGames)
      ? source.featuredGames.map(normalizeProject).slice(0, 16)
      : defaultPortfolio.featuredGames,
    smallerProjects: Array.isArray(source.smallerProjects)
      ? source.smallerProjects.map(normalizeProject).slice(0, 24)
      : defaultPortfolio.smallerProjects,
  };
}

async function readPortfolio(env) {
  // DB es el binding que conecta este Worker con la base D1 configurada en el hosting.
  if (!env.DB) return defaultPortfolio;

  // Una fila contiene todo el portfolio: "main" identifica el único documento editable.
  // CREATE TABLE IF NOT EXISTS permite inicializarlo automáticamente la primera vez.
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS portfolio_content (id TEXT PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT NOT NULL)"
  ).run();

  const row = await env.DB.prepare("SELECT content FROM portfolio_content WHERE id = ?")
    .bind("main")
    .first();

  // Si ya existe, el JSON de D1 es la versión vigente que ve la página.
  if (row?.content) return normalizePortfolio(JSON.parse(row.content));

  // Primera visita sin datos: se inicializa D1 con el contenido incluido en el proyecto.
  await env.DB.prepare(
    "INSERT INTO portfolio_content (id, content, updated_at) VALUES (?, ?, ?)"
  )
    .bind("main", JSON.stringify(defaultPortfolio), new Date().toISOString())
    .run();

  return normalizePortfolio(defaultPortfolio);
}

async function writePortfolio(env, content) {
  if (!env.DB) throw new Error("D1 binding is unavailable.");

  // Limita y normaliza lo recibido antes de persistirlo para mantener una estructura válida.
  const normalizedContent = normalizePortfolio(content);

  // UPSERT: crea la fila "main" o reemplaza su contenido y fecha si ya existía.
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS portfolio_content (id TEXT PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT NOT NULL)"
  ).run();

  await env.DB.prepare(
    "INSERT INTO portfolio_content (id, content, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at"
  )
    .bind("main", JSON.stringify(normalizedContent), new Date().toISOString())
    .run();

  return normalizedContent;
}

function serveStatic(pathname) {
  const file = files[pathname] ?? (pathname.includes(".") ? null : files["/index.html"]);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(Uint8Array.from(atob(file.body), (char) => char.charCodeAt(0)), {
    headers: {
      "content-type": file.contentType,
      "cache-control": pathname === "/index.html" ? "no-cache" : "public, max-age=31536000, immutable",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/portfolio" && request.method === "GET") {
      // La web consulta esta ruta al cargar para obtener el contenido persistido.
      return jsonResponse(await readPortfolio(env));
    }

    if (url.pathname === "/api/portfolio/check-key" && request.method === "POST") {
      // El editor comprueba la clave antes de habilitar los controles de edición.
      if (!isAuthorized(request, env)) return jsonResponse({ ok: false }, { status: 401 });
      return jsonResponse({ ok: true });
    }

    if (url.pathname === "/api/portfolio" && request.method === "PUT") {
      // Solo una petición autorizada puede guardar cambios en el registro principal.
      if (!isAuthorized(request, env)) return jsonResponse({ error: "Clave incorrecta." }, { status: 401 });
      const content = await request.json();
      return jsonResponse(await writePortfolio(env, content));
    }

    if (url.pathname === "/api/portfolio/status" && request.method === "GET") {
      // Ruta informativa para comprobar si están configurados D1 y la clave del editor.
      return jsonResponse({
        database: Boolean(env.DB),
        editorKeyConfigured: Boolean(env.PORTFOLIO_EDIT_KEY),
        storage: "D1",
        editableRecord: "portfolio_content.main"
      });
    }

    return serveStatic(url.pathname === "/" ? "/index.html" : url.pathname);
  },
};
`;

await rm(serverDist, { recursive: true, force: true });
await rm(openAiDist, { recursive: true, force: true });
await mkdir(serverDist, { recursive: true });
await mkdir(openAiDist, { recursive: true });
await writeFile(join(serverDist, 'index.js'), workerSource);
await writeFile(
  join(openAiDist, 'hosting.json'),
  `${JSON.stringify({ project_id: 'appgprj_6ab57bc912b48191bec4ef6cc5769a7c', d1: 'DB', r2: null }, null, 2)}\n`,
);

console.log(`Worker build ready with ${Object.keys(files).length} static files and ${basename(join(serverDist, 'index.js'))}`);
