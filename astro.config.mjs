// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Anteprima su GitHub Pages: il sito sta in un sottopercorso (es. /hdp-www/).
// Con BASE_PATH=/hdp-www, a fine build si aggiunge il prefisso a tutti i link interni
// che iniziano con "/". Senza BASE_PATH (build per cPanel) non cambia nulla.
const BASE = (process.env.BASE_PATH ?? "").replace(/\/+$/, "");

function prefissoBase() {
  return {
    name: "prefisso-base",
    hooks: {
      "astro:build:done": ({ dir }) => {
        if (!BASE) return;
        const root = fileURLToPath(dir);
        const fix = (u) => (u.startsWith("/") && !u.startsWith("//") ? BASE + u : u);
        const walk = (d) => {
          for (const f of fs.readdirSync(d)) {
            const p = path.join(d, f);
            if (fs.statSync(p).isDirectory()) { walk(p); continue; }
            if (p.endsWith(".html")) {
              let s = fs.readFileSync(p, "utf8");
              s = s.replace(/\b(href|src|action)="([^"]*)"/g, (_, a, u) => `${a}="${fix(u)}"`);
              s = s.replace(/\bsrcset="([^"]*)"/g, (_, v) =>
                `srcset="${v.split(",").map((c) => c.trim().replace(/^\S+/, fix)).join(", ")}"`);
              fs.writeFileSync(p, s);
            } else if (p.endsWith(".css")) {
              const s = fs.readFileSync(p, "utf8");
              fs.writeFileSync(p, s.replace(/url\((["']?)(\/[^)"']*)\1\)/g, (_, q, u) => `url(${q}${fix(u)}${q})`));
            }
          }
        };
        walk(root);
      },
    },
  };
}

export default defineConfig({
  // Dominio di produzione (usato per sitemap e URL canonici)
  site: "https://www.hospitaldivinaprovidencia.net",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [sitemap(), prefissoBase()],
  image: {
    // Le immagini vengono ridimensionate e convertite in WebP al build
    responsiveStyles: true,
  },
});
