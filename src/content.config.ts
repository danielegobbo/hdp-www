import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Una pagina = un file Markdown in src/content/paginas/
// L'URL è dato da `slug` (es. "quem-somos/onde-estamos" -> /quem-somos/onde-estamos/)
const paginas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/paginas" }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      title: z.string(),
      // Pagina "madre" (es. "servicos"); vuota per le pagine di primo livello
      section: z.string().optional(),
      // Ordine nei menu e negli elenchi (in mancanza: alfabetico)
      order: z.number().optional(),
      description: z.string().optional(),
      image: image().optional(),
      // Attribuzione del testo, se ripreso da altre fonti
      fonte: z.string().optional(),
      atualizado: z.coerce.date().optional(),
      joomlaId: z.number().optional(),
      // true = esclusa dal sito (bozza)
      rascunho: z.boolean().default(false),
    }),
});

export const collections = { paginas };
