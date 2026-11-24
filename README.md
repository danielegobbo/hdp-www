# Sito Hospital Divina Providência

Sito statico (HTML + CSS, **nessun JavaScript, nessun database**) generato con [Astro](https://astro.build) 7.4.
Sostituisce il vecchio Joomla 3 (`www7`). I contenuti sono file Markdown in portoghese.

## Comandi

```sh
npm install        # solo la prima volta
npm run dev        # anteprima con ricarica automatica: http://localhost:4321
npm run build      # genera il sito in dist/
npm run preview    # serve dist/ come in produzione
```

## Modificare i contenuti

| Cosa | Dove |
|---|---|
| Testo di una pagina | `src/content/paginas/**/*.md` |
| Telefoni, e-mail, indirizzo, orari | `src/data/site.ts` (valgono in tutto il sito) |
| Voci del menu principale | `src/data/site.ts` → `menu` |
| Home page | `src/pages/index.astro` |
| Pagina Contactos | `src/pages/contactos.astro` (legge i dati da `site.ts`) |
| Stile | `src/styles/global.css`: tema "Savana / Baobab" da `../templates/Savana_Baobab_V1.html` (palette in `:root`, Georgia per i titoli, Arial per il testo) |
| Icone e logo trasparente | generati da `src/assets/logo.png` con `node scripts/gen-favicon.mjs`: `public/favicon.ico`, `favicon-32.png` (trasparenti), `apple-touch-icon.png` (fondo crema: iOS non gestisce la trasparenza), `src/assets/logo-transparente.png` (intestazione) |
| Foto della home | `src/assets/img/hdp-pavilhao.jpg` (panoramica 1600×600, da Google Maps; usata anche come anteprima per WhatsApp/Facebook) |

### Frontmatter di una pagina

```yaml
---
slug: servicos/ortopedia        # URL: /servicos/ortopedia/
title: "Ortopedia"
section: servicos               # pagina "madre": compare nel suo elenco e nel menu laterale
order: 1                        # facoltativo, ordine negli elenchi (altrimenti alfabetico)
image: ../../../assets/img/...  # facoltativo, immagine di copertina (percorso relativo)
description: "..."              # facoltativo, per Google; se manca usa il primo paragrafo
fonte: "Wikipédia (CC BY-SA 4.0)"  # facoltativo, attribuzione del testo
atualizado: 2026-11-03          # data dell'ultimo aggiornamento del contenuto
rascunho: true                  # facoltativo: pagina esclusa dal sito
---
Testo in **Markdown**…
```

**Nuova pagina:** crea un `.md` con `slug`, `title` e (se è una sottopagina) `section`. Compare da sola negli elenchi e nel menu laterale della sezione.

**Immagini:** mettile in `src/assets/img/` e richiamale con un percorso relativo, es. `![Descrição](../../assets/img/foto.jpg)`. Al build vengono ridimensionate e convertite in WebP.

## Pubblicazione su cPanel (`hospit5`)

1. `npm run build`
2. Carica **il contenuto** di `dist/` (incluso il file nascosto `.htaccess`) nella cartella del dominio, tramite File Manager di cPanel o FTP.
3. Prima di caricare, fai un backup della cartella attuale e **rimuovi i file del vecchio Joomla** da quella cartella.

`.htaccess` (generato da `node scripts/gen-htaccess.mjs`) contiene:
- redirect 301 dai vecchi URL Joomla (`/index.php/...`, `?option=com_content&id=...`) alle nuove pagine
- pagina 404, compressione, cache delle risorse, alcune intestazioni di sicurezza
- il blocco per forzare HTTPS, commentato: attivalo se il dominio ha il certificato SSL

Testato con Apache 2.4 (lo stesso usato da cPanel).

## Struttura

```
src/content/paginas/   pagine (Markdown)
src/assets/img/        immagini usate dalle pagine
src/data/site.ts       dati generali e menu
src/pages/             home, contactos, 404 e il modello delle pagine ([...slug].astro)
src/layouts/Base.astro intestazione, menu, piè di pagina
public/                file copiati così come sono (favicon, .htaccess)
arquivo/               contenuti del vecchio sito NON pubblicati (COVID 2020, notizie, progetti, Concept Note…)
scripts/               migrazione da Joomla (già eseguita) e generazione di .htaccess
```

## Migrazione da Joomla (già fatta)

`npm run migrate` rigenera `src/content/paginas/`, `src/assets/img/` e `arquivo/` dall'export del DB di www7
(`../local-www7/export/`). **Sovrascrive le modifiche manuali**: non rilanciarlo dopo aver iniziato a modificare i contenuti.
