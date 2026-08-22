# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Freelance client engagement for **PT Nattu Global Synergy (NSG)** — a new construction & industrial trading company in Kemayoran, Central Jakarta. Deliverables: a company profile website, corporate email on Biznet Gio hosting (`.co.id` domain), and a 1-year maintenance contract. Not a git repository; no package manager, no build step, no framework, no tests/linter.

Client-facing content is bilingual (English default, Indonesian toggle). The source-of-truth business documents are in Indonesian.

## Running Locally

Everything is CDN-loaded (Google Fonts, Font Awesome 6.4.0) with no fetch calls, so it works directly:

```bash
open web_sample/index.html          # or serve it:
cd web_sample && python3 -m http.server 8000
```

## Repository Layout

- `web_sample/` — **the deliverable**: a single-page "Client Demo Hub" shown to the client
- `Dokumen_Analisa_Project.md`, `Dokumen_Quotation_Penawaran.md` — source-of-truth analysis & quotation documents (Indonesian)
- `Administration/` — client legal documents (KTP, NIB) and paid invoices. Confidential — never modify, publish, or copy these
- `Data Dokumen/`, `Web Design Reference/` — client-supplied reference material (read-only)

## Architecture of `web_sample/`

One `index.html` renders **two stacked panels toggled by body class**, styled by `css/styles.css` (~2000 lines, one design system), driven by `js/script.js` (vanilla JS, one global `appState`):

1. **Two-view layout.** `<main id="comproPanel">` is the website prototype; `<aside id="quotationPanel">` is the interactive quotation document. `switchViewMode()` sets `body.className = "mode-{compro|quotation|split} device-{...}"`; CSS shows/hides panels based on `mode-*`. The demo control bar on top (`.demo-bar`) exists only for client presentation — it is hidden in print.

2. **Device emulation ≠ media queries.** Real responsiveness uses `@media (max-width: 992px/768px)`; the demo bar's viewport buttons instead set a `device-*` body class with its own CSS block ("DEVICE EMULATION SELECTORS" near the end of styles.css). When adding responsive styles, update **both** mechanisms or the client will see a desktop layout in the mobile preview frame.

3. **Bilingual convention.** Every translatable element carries `data-en` and `data-id` attributes (values may contain HTML). `applyLanguage()` overwrites `innerHTML` (or `placeholder` for inputs) from the attribute for the active language. New content must include **both attributes plus the English inline default text**, or the language toggle will clobber/stale it. Indonesian text must match the tone of the two root markdown documents.

4. **Pricing lives in three places that must stay in sync**: the quotation markdown doc, the static HTML in the quotation panel, and the constants in `appState` (`hostingPrice`, `domainPrice`, `devPrice`, `maintPrice` in script.js). `updateCalculatorValues()` derives every table/modal total from `appState` (Biznet-direct = hosting + domain; DP 50% = half of dev + maintenance). Changing a price in only one place silently desyncs the calculator from the printed document.

5. **All submissions are simulated.** The contact form only shows a toast; the approval modal composes a WhatsApp deep link (`wa.me/6282240206861` — the developer's number) with the selected domain and totals. There is no backend; do not add real form handling unless asked.

6. **Print = quotation only.** `@media print` hides the demo bar, site chrome, and compro panel, forcing the quotation panel as a clean paper document (this backs the "Cetak / PDF" button). Keep new quotation styles print-safe.

7. **Design tokens.** Brand colors are CSS custom properties in `:root` (mint teal `--color-teal-*` + slate navy `--color-slate-*`, derived from the NSG logo), plus fonts (Plus Jakarta Sans body / Space Grotesk display) and radius/shadow scales. Use these variables; do not introduce raw hex values.

## Deployment Context (not yet executed)

Target: Biznet Gio NEO hosting + `.co.id` domain registered under the client's own Gmail (ownership stays with the client), SSL via hosting, email forwarded/integrated into the owner's Gmail with SPF/DKIM. Estimated timeline is 7–10 working days from quotation approval. `Administration/Biznet Bill/` holds the live hosting invoices once purchased.
