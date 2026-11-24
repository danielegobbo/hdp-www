import { getCollection, type CollectionEntry } from "astro:content";

export type Pagina = CollectionEntry<"paginas">;

export async function todasPaginas(): Promise<Pagina[]> {
  return getCollection("paginas", (p) => !p.data.rascunho);
}

// Ordine: campo `order`, poi alfabetico
export function ordenar(a: Pagina, b: Pagina) {
  const oa = a.data.order ?? 999, ob = b.data.order ?? 999;
  return oa - ob || a.data.title.localeCompare(b.data.title, "pt-AO");
}

export function filhas(todas: Pagina[], slug: string) {
  return todas.filter((p) => p.data.section === slug).sort(ordenar);
}

// Primo paragrafo di testo del Markdown, per anteprime e meta description
export function resumo(p: Pagina, max = 160) {
  const txt = (p.body ?? "")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .find((b) => b && !b.startsWith("!") && !b.startsWith("[!") && !b.startsWith("|") && !b.startsWith("#") && b.replace(/[*_\[\]()]/g, "").length > 40);
  if (!txt) return "";
  const plain = txt.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_`#>]/g, "").replace(/\s+/g, " ").trim();
  return plain.length > max ? plain.slice(0, max).replace(/\s+\S*$/, "") + "…" : plain;
}
