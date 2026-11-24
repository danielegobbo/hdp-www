// Migrazione una tantum: Joomla 3 (www7) -> Markdown per Astro.
// Legge l'export JSONL del DB e le immagini dalla copia locale del sito.
//   node scripts/migrate.mjs
// Riscrive src/content/paginas/, src/assets/img/ e arquivo/.
// ATTENZIONE: rigenerarlo sovrascrive eventuali modifiche manuali ai file generati.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEGACY = path.resolve(ROOT, "../local-www7");
const EXPORT = path.join(LEGACY, "export");
const LEGACY_SITE = path.join(LEGACY, "site");

const OUT_PAGES = path.join(ROOT, "src/content/paginas");
const OUT_IMG = path.join(ROOT, "src/assets/img");
const OUT_ARCHIVE = path.join(ROOT, "arquivo");

// ---------------------------------------------------------------------------
// Pagine pubblicate: id articolo Joomla -> destinazione nel nuovo sito
// ---------------------------------------------------------------------------
const PUBLISHED = {
  // Quem Somos
  73: { slug: "quem-somos", title: "Quem Somos", section: "", order: 1 },
  74: { slug: "quem-somos/as-estruturas", section: "quem-somos", order: 1 },
  75: { slug: "quem-somos/onde-estamos", section: "quem-somos", order: 2 },
  72: { slug: "quem-somos/o-que-fazemos", section: "quem-somos", order: 3 },
  // Rede Sanitária
  76: { slug: "rede-sanitaria", section: "", order: 2 },
  88: { slug: "rede-sanitaria/descentralizacao", title: "A descentralização dos serviços", section: "rede-sanitaria", order: 0 },
  126: { slug: "rede-sanitaria/hospital-divina-providencia", section: "rede-sanitaria", order: 1 },
  127: { slug: "rede-sanitaria/centro-medico-sao-joao-calabria", title: "Centro Médico São João Calábria", section: "rede-sanitaria", order: 2 },
  128: { slug: "rede-sanitaria/centro-medico-sao-marcos", title: "Centro Médico São Marcos", section: "rede-sanitaria", order: 3 },
  129: { slug: "rede-sanitaria/posto-medico-nossa-senhora-da-paz", title: "Posto Médico Nossa Senhora da Paz", section: "rede-sanitaria", order: 4 },
  131: { slug: "rede-sanitaria/posto-medico-santa-catarina", title: "Posto Médico Santa Catarina", section: "rede-sanitaria", order: 5 },
  130: { slug: "rede-sanitaria/posto-medico-santa-terezinha", title: "Posto Médico Santa Terezinha", section: "rede-sanitaria", order: 6 },
  // Serviços e especialidades
  95: { slug: "servicos", section: "", order: 3 },
  114: { slug: "servicos/ortopedia", section: "servicos" },
  116: { slug: "servicos/reumatologia", section: "servicos" },
  117: { slug: "servicos/estomatologia", section: "servicos" },
  118: { slug: "servicos/ginecologia", section: "servicos" },
  119: { slug: "servicos/endocrinologia", section: "servicos" },
  120: { slug: "servicos/pneumologia", section: "servicos" },
  121: { slug: "servicos/optometria-oftalmologia", section: "servicos" },
  122: { slug: "servicos/dermatologia", section: "servicos" },
  124: { slug: "servicos/gastroenterologia", section: "servicos" },
  125: { slug: "servicos/urologia", section: "servicos" },
  // Como colaborar
  91: { slug: "como-colaborar", title: "Como Colaborar", section: "", order: 4 },
  165: { slug: "como-colaborar/fornecedores", section: "como-colaborar", order: 1 },
  218: { slug: "como-colaborar/patrocinadores", section: "como-colaborar", order: 2 },
  198: { slug: "como-colaborar/convenios", title: "Convénios", section: "como-colaborar", order: 3 },
  166: { slug: "como-colaborar/agendar-reuniao", title: "Agendar uma reunião", section: "como-colaborar", order: 4 },
};

// Le specialità sono testi tratti da Wikipédia (CC BY-SA): serve l'attribuzione
const WIKIPEDIA = new Set([114, 116, 117, 118, 119, 120, 121, 122, 124, 125]);

// ---------------------------------------------------------------------------

const readJsonl = (f) =>
  fs.readFileSync(path.join(EXPORT, f), "utf8").split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));

const articles = readJsonl("articles.jsonl");
const byId = new Map(articles.map((a) => [a.id, a]));

const slugify = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const urlFor = (id) => (PUBLISHED[id] ? `/${PUBLISHED[id].slug}/` : null);

function reset(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

const copiedImages = new Map(); // legacy path -> abs dest
function copyLegacyImage(src) {
  const clean = decodeURIComponent(src.replace(/^\/+/, "").split("?")[0]);
  if (!clean.startsWith("images/")) return null;
  const from = path.join(LEGACY_SITE, clean);
  if (!fs.existsSync(from)) {
    console.warn("  ! immagine mancante:", clean);
    return null;
  }
  const rel = clean.replace(/^images\/(hdp\/)?(images\/)?/, "");
  const dest = path.join(OUT_IMG, rel.split("/").map((p, i, a) => (i === a.length - 1 ? p.toLowerCase() : slugify(p))).join("/"));
  if (!copiedImages.has(clean)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(from, dest);
    copiedImages.set(clean, dest);
  }
  return copiedImages.get(clean);
}

function saveDataUri(uri, name) {
  const m = uri.match(/^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/s);
  if (!m) return null;
  const ext = m[1].replace("jpeg", "jpg");
  const dest = path.join(OUT_IMG, "extraidas", `${name}.${ext}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(m[2], "base64"));
  return dest;
}

const relFrom = (mdFile, absTarget) => {
  let r = path.relative(path.dirname(mdFile), absTarget).split(path.sep).join("/");
  return r.startsWith(".") ? r : "./" + r;
};

// Pulizia dell'HTML Joomla prima della conversione
function cleanHtml(h) {
  return (h || "")
    .replace(/<hr[^>]*id="system-readmore"[^>]*>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/<(span|font)[^>]*>/gi, "")
    .replace(/<\/(span|font)>/gi, "")
    // grassetti spezzati: <strong>C</strong><strong>entral</strong>
    .replace(/<\/strong>(\s*)<strong>/gi, "$1")
    .replace(/<\/b>(\s*)<b>/gi, "$1")
    .replace(/<p>\s*<\/p>/gi, "");
}

// Tabelle usate solo per impaginare (nessun <th>): ogni riga diventa un blocco
function unwrapLayoutTables(h) {
  return h.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (tbl, inner) => {
    if (/<th[\s>]/i.test(inner)) return tbl;
    const rows = [...inner.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) =>
      [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => c[1].trim()).filter(Boolean)
    );
    const layout = rows.some((cells) => cells.some((c) => /<img/i.test(c)));
    if (!layout) {
      // tabella dati senza intestazione: la prima riga diventa intestazione
      return tbl.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/i, (_m, r) => "<thead><tr>" + r.replace(/<(\/?)td/gi, "<$1th") + "</tr></thead>");
    }
    return rows.map((cells) => "<section class=\"cartao\">" + cells.map((c) => `<p>${c}</p>`).join("") + "</section><hr>").join("");
  });
}

function makeTurndown(mdFile, id, publish) {
  const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", emDelimiter: "*" });
  td.use(gfm);
  td.remove(["script", "style"]);
  let n = 0;
  td.addRule("iframe", {
    filter: "iframe",
    replacement: (_c, node) => {
      const src = node.getAttribute("src") || "";
      return src.includes("google.com/maps") ? "\n\n[Ver no Google Maps](https://maps.app.goo.gl/MUC1PeFY3kJiVYa28)\n\n" : "";
    },
  });
  td.addRule("img", {
    filter: "img",
    replacement: (_c, node) => {
      const src = node.getAttribute("src") || "";
      const alt = (node.getAttribute("alt") || "").replace(/[\[\]]/g, "");
      if (!publish) return src.startsWith("data:") ? "" : `![${alt}](${src})`;
      let abs = src.startsWith("data:") ? saveDataUri(src, `${id}-${++n}`) : copyLegacyImage(src);
      return abs ? `![${alt}](${relFrom(mdFile, abs)})` : "";
    },
  });
  td.addRule("internalLinks", {
    filter: (node) => node.nodeName === "A" && node.getAttribute("href"),
    replacement: (content, node) => {
      const href = node.getAttribute("href").replace(/&amp;/g, "&");
      if (!content.trim()) return "";
      if (href.includes("#cite_note")) return ""; // note a piè di pagina di Wikipédia
      if (href.includes("redlink=1")) return content; // voce Wikipédia inesistente
      if (href === "#") return content;
      const m = href.match(/[?&]id=(\d+)/);
      if (href.includes("option=com_content") && m) {
        const u = urlFor(Number(m[1]));
        return u ? `[${content}](${u})` : content;
      }
      if (/^(index\.php|\/index\.php)/.test(href)) return content;
      return `[${content}](${href})`;
    },
  });
  return td;
}

const yamlStr = (s) => JSON.stringify(String(s ?? ""));

function tidyMd(md) {
  return md
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\|\s{2,}/g, "| ")
    .replace(/(\* \* \*\n\n)+\* \* \*/g, "* * *")
    .trim()
    .replace(/\n+\* \* \*$/, "") + "\n";
}

// ---------------------------------------------------------------------------
reset(OUT_PAGES);
reset(OUT_IMG);
reset(OUT_ARCHIVE);

let published = 0, archived = 0;
for (const a of articles) {
  const p = PUBLISHED[a.id];
  let html = cleanHtml(a.introtext + "\n" + a.fulltext);
  if (p) html = unwrapLayoutTables(html);
  if (p) {
    const file = path.join(OUT_PAGES, p.slug + ".md");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const body = tidyMd(makeTurndown(file, a.id, true).turndown(html));
    const imgs = JSON.parse(a.images || "{}");
    const intro = imgs.image_intro ? copyLegacyImage(imgs.image_intro) : null;
    const fm = [
      "---",
      `slug: ${p.slug}`,
      `title: ${yamlStr(p.title || a.title.trim())}`,
      p.section ? `section: ${p.section}` : null,
      p.order !== undefined ? `order: ${p.order}` : null,
      intro ? `image: ${relFrom(file, intro)}` : null,
      WIKIPEDIA.has(a.id) ? `fonte: "Wikipédia (CC BY-SA 4.0)"` : null,
      `atualizado: ${a.modified.slice(0, 10)}`,
      `joomlaId: ${a.id}`,
      "---",
      "",
    ].filter((l) => l !== null).join("\n");
    fs.writeFileSync(file, fm + body);
    published++;
  } else {
    const dir = path.join(OUT_ARCHIVE, slugify(a.cat));
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${a.id}-${a.alias}.md`);
    const body = tidyMd(makeTurndown(file, a.id, false).turndown(html));
    const fm = [
      "---",
      `title: ${yamlStr(a.title.trim())}`,
      `categoria: ${yamlStr(a.cat)}`,
      `estado_joomla: ${a.state === 1 ? "publicado" : a.state === 0 ? "não publicado" : a.state}`,
      `criado: ${a.created.slice(0, 10)}`,
      `atualizado: ${a.modified.slice(0, 10)}`,
      `joomlaId: ${a.id}`,
      "---",
      "",
    ].join("\n");
    fs.writeFileSync(file, fm + body);
    archived++;
  }
}

// Contatti reali (i primi id sono dati demo di Joomla)
const contacts = readJsonl("contacts.jsonl")
  .filter((c) => [6, 8, 10, 11, 12].includes(c.id))
  .map((c) => ({ nome: c.name.trim(), telefone: (c.telephone || c.mobile || "").trim(), email: (c.email_to || "").trim() }));
fs.writeFileSync(path.join(OUT_ARCHIVE, "contactos-joomla.json"), JSON.stringify(contacts, null, 2));

console.log(`Pubblicate: ${published}  Archiviate: ${archived}  Immagini copiate: ${copiedImages.size}`);
