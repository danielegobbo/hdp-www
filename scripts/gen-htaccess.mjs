// Genera public/.htaccess per l'hosting cPanel (Apache):
// - redirect 301 dai vecchi URL Joomla (/index.php/... e ?option=com_content&view=article&id=N)
// - pagina 404, cache delle risorse, compressione
//   node scripts/gen-htaccess.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = path.join(ROOT, "src/content/paginas");
const MENU = path.resolve(ROOT, "../local-www7/export/menu.jsonl");
const ARTICLES = path.resolve(ROOT, "../local-www7/export/articles.jsonl");

// joomlaId -> nuovo URL, letto dal frontmatter delle pagine
const byArticle = new Map();
for (const f of fs.readdirSync(PAGES, { recursive: true }).filter((f) => f.endsWith(".md"))) {
  const fm = fs.readFileSync(path.join(PAGES, f), "utf8").split("---")[1] ?? "";
  const id = fm.match(/^joomlaId:\s*(\d+)/m)?.[1];
  const slug = fm.match(/^slug:\s*(\S+)/m)?.[1];
  if (id && slug) byArticle.set(Number(id), `/${slug}/`);
}

// Categorie Joomla -> pagina più vicina nel nuovo sito
const byCategory = new Map([
  [126, "/quem-somos/"], [79, "/"], [89, "/rede-sanitaria/"], [88, "/rede-sanitaria/"],
  [84, "/servicos/"], [86, "/servicos/"], [87, "/servicos/"], [112, "/servicos/"], [83, "/servicos/"],
  [116, "/como-colaborar/"], [102, "/como-colaborar/"], [119, "/como-colaborar/"], [122, "/como-colaborar/patrocinadores/"],
  [117, "/contactos/"],
]);
for (let id = 90; id <= 95; id++) byCategory.set(id, "/rede-sanitaria/");

// Articoli non pubblicati nel nuovo sito -> pagina della loro categoria (o home)
const articleFallback = (catid, artId) => {
  if (artId >= 97 && artId <= 125) return "/servicos/"; // schede servizio/specialità vuote
  return byCategory.get(catid) ?? "/";
};
const articles = fs.readFileSync(ARTICLES, "utf8").split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));
const articleTarget = new Map(articles.map((a) => [a.id, byArticle.get(a.id) ?? articleFallback(a.catid, a.id)]));

const targetForLink = (link) => {
  const id = Number(link.match(/[?&]id=(\d+)/)?.[1]);
  if (link.includes("view=featured")) return "/";
  if (link.includes("option=com_contact")) return "/contactos/";
  if (link.includes("view=article")) return articleTarget.get(id) ?? "/";
  if (link.includes("view=categor")) return byCategory.get(id) ?? "/";
  return "/";
};

const menu = fs.readFileSync(MENU, "utf8").split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pathRules = [];
const seen = new Set();
// percorsi più lunghi prima, così le sottopagine non finiscono sul genitore
for (const m of [...menu].sort((a, b) => b.path.length - a.path.length)) {
  if (seen.has(m.path) || m.path === "menuprinicipal") continue;
  seen.add(m.path);
  // Joomla accetta anche /index.php/<percorso>/<id>-<alias> per gli articoli dentro una categoria
  pathRules.push(`RewriteRule ^index\\.php/${esc(m.path)}(/.*)?/?$ ${targetForLink(m.link)} [R=301,L]`);
}

const queryRules = [];
for (const [id, target] of articleTarget) {
  queryRules.push(
    `RewriteCond %{QUERY_STRING} (^|&)view=article(&|$)`,
    `RewriteCond %{QUERY_STRING} (^|&)id=${id}([:&]|$)`,
    `RewriteRule ^(index\\.php)?$ ${target} [R=301,L,QSD]`
  );
}
for (const [id, target] of byCategory) {
  queryRules.push(
    `RewriteCond %{QUERY_STRING} (^|&)view=categor(y|ies)(&|$)`,
    `RewriteCond %{QUERY_STRING} (^|&)id=${id}([:&]|$)`,
    `RewriteRule ^(index\\.php)?$ ${target} [R=301,L,QSD]`
  );
}

const out = `# Generato da scripts/gen-htaccess.mjs — non modificare a mano
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /

# Per forzare HTTPS (solo se il certificato SSL è attivo sul dominio) togliere il commento:
# RewriteCond %{HTTPS} off
# RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

# --- Vecchi URL Joomla: /index.php?option=com_content&view=...&id=N ---
${queryRules.join("\n")}
RewriteCond %{QUERY_STRING} (^|&)option=com_contact(&|$)
RewriteRule ^(index\\.php)?$ /contactos/ [R=301,L,QSD]
RewriteCond %{QUERY_STRING} option=com_
RewriteRule ^(index\\.php)?$ / [R=301,L,QSD]

# --- Vecchi URL Joomla con SEF: /index.php/<menu>/... ---
${pathRules.join("\n")}
RewriteRule ^index\\.php(/.*)?$ / [R=301,L,QSD]

# --- Vecchie cartelle Joomla ---
RewriteRule ^(administrator|components|modules|plugins|templates|media|images|cache|tmp|libraries)(/.*)?$ / [R=301,L]
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/xml text/xml
</IfModule>

<IfModule mod_headers.c>
# Le risorse in /_astro/ hanno un hash nel nome: possono restare in cache per un anno
<FilesMatch "\\.(webp|avif|png|jpe?g|svg|css|js|woff2)$">
Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
<FilesMatch "\\.html$">
Header set Cache-Control "public, max-age=600"
</FilesMatch>
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set X-Frame-Options "SAMEORIGIN"
</IfModule>
`;

fs.writeFileSync(path.join(ROOT, "public/.htaccess"), out);
console.log(`public/.htaccess: ${pathRules.length} percorsi, ${articleTarget.size} articoli, ${byCategory.size} categorie`);
