// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Dominio di produzione (usato per sitemap e URL canonici)
  site: "https://www.hospitaldivinaprovidencia.net",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [sitemap()],
  image: {
    // Le immagini vengono ridimensionate e convertite in WebP al build
    responsiveStyles: true,
  },
});
