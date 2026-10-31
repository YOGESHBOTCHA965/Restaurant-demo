# Bombay Palace — private website prototype

This is a dependency-free static site. Sites controls owner-private access. Do not make the audience public without the owner's approval. `noindex` is an additional crawler instruction, not the access control.

## Update restaurant details

All content is in `dist/content.json`. Staff can use the website's **Staff editor** to edit restaurant details, hours, holiday exceptions, the menu, and optional services. Save browser preview only affects that browser. Export the JSON, replace `dist/content.json` in the source repository, and redeploy privately through Sites to update the hosted copy for all allowed visitors. Import, export, and restore functions are available under **Content file**. The editor is not a shared content management service and has no server password or database.

Blank phone, email, hours, and ordering fields are intentional. Unconfirmed phone, email, and ordering links never become active. Each day's hours and each menu item has a separate `confirmed` flag. While no day is confirmed, Visit says hours are being confirmed; once any day is confirmed the full list appears, with unconfirmed days marked “To be confirmed”. An open day also needs `opens` and `closes` as 24-hour `HH:MM` values, with open before close. `holidays` stays `null` until exceptions have been reviewed; then it is an array of `{ "date": "YYYY-MM-DD", "text": "Closed" }` entries. “Open now” appears only when all seven days are confirmed in that form and `holidays` is an array. Times use America/New_York. Overnight hours are not supported.

Price uncertainty is stated beside the menu. While no price is confirmed, the note says the prices come from a public online listing and no asterisks render. Once some prices are confirmed, only the unconfirmed ones get an asterisk. When all are confirmed it reads “Prices and availability may change.” The header action stays “Explore the menu” until `orderingConfirmed` is true and `orderingUrl` is a complete HTTPS URL; then it becomes “Order online”.

Optional services live under `services` and stay hidden until confirmed with a working destination: reservations (`url` or `byPhone` with a confirmed phone), catering (`summary` plus an HTTPS URL or email), gift cards (HTTPS URL and provider), careers (HTTPS URL, or a summary with no dead link), newsletter (HTTPS form `action`), menu PDF (HTTPS URL), social links, and specials (`expires` as `YYYY-MM-DD`, still current in America/New_York). The announcement bar appears only when `announcementConfirmed` is true and `notice` has text. Set confirmation flags only after restaurant approval.

The starter menu is a selection, not a complete menu. Add categories with unique IDs, then dishes referencing those IDs. Prices use plain USD strings (`"4.99"`); blank prices display “Price to confirm”. Text is rendered through safe DOM APIs. Imported files are validated. Browser preview data stays in local storage; this site sends no form submissions, analytics, or customer records.

## Sources and open details

- Name and address supplied by the user: Bombay Palace, 4213 Macon Rd, Columbus, GA 31907.
- Selected dish names, prices, categories, and paraphrased descriptions: [Uber Eats at the same address](https://www.ubereats.com/store/bombay-palace/h5OYGVfTWHWQAwGDbkMlBw), checked October 29, 2026. These are online listing values pending restaurant confirmation; they are not asserted to be current dine-in prices.
- No hours, phone number, or ordering destination has been approved. These remain blank.
- Directions are a Google Maps directions URL built from the supplied address; no map API key, billing, or embedded tracking map is required.
- The food photography is AI-generated and labeled as concept photography. It does not depict the restaurant's actual dishes. The arch mark and wordmark are proposed visual branding, not a claim to an official identity.

## Operating model

There is no framework, build step, database, paid font, or third-party script. Serve `dist/` as static files. Hosting and a possible custom domain remain subject to the provider's plan; this source does not establish a specific hosting price. After confirmation, real restaurant photography can replace the concept image and the relevant alt text and caption should be updated.

## Photography and visual design

The page is a warm-paper dining page. Charcoal text, one deep green for the main action and the pressed filter, Sorts Mill Goudy for the wordmark and headlines, and Source Sans 3 for navigation, the menu, and buttons. Tokens are at the top of `dist/site.css`. `DESIGN.md` documents the system. Primary navigation is Menu, Our Story, Gallery, and Visit & Contact. On a phone, a Menu / Directions bar appears after the hero actions leave the screen. Earlier designs are kept in `previous-design/` and are not served.

The photographs are illustrative and optimized to WebP. Each one has a provenance sidecar. Paths and captions live in `content.json` under `media`. Square files are `hero-spread.webp`, `dish-samosa.webp`, `dish-tikka.webp`, and `dish-daal.webp` (1024×1024). The 4:3 files are `feature-tandoori.webp` and `visit-table-day.webp` (1152×864). The `-640` files are the smaller `srcset` copies; replace them with the full-size originals. Do not crop a square photograph into a wide banner. Every photo is labeled illustrative. The table caption must keep saying it is not the restaurant’s dining room. To use real photographs, replace the files, then update `media` alt text and captions.

## Structure

- `dist/index.html` — semantic homepage and staff editor dialog.
- `dist/site.css` — the only stylesheet: tokens, layout, the oven, responsive design, focus styles, reduced-motion support.
- `dist/experience.js` — mobile navigation, the flavor notes, the gallery dialog, active navigation, and the mobile bar.
- `dist/app.js` — content rendering, menu filters/search, directions, copy address, and browser-local editor.
- `dist/content.json` — editable restaurant content.
- `.openai/hosting.json` — private Sites project identity and static directory.

For QA use the managed Sites preview. Do not open `index.html` directly from a filesystem URL because browsers restrict JSON fetches there.

## Interactive pieces

The gallery opens the existing photographs in a dialog with close, previous, and next. It does not play by itself. Category photographs and the clay-oven button set that category and scroll to the dish list. If a search misses inside the active category but matches dishes elsewhere, the empty state names those dishes and their categories.

“A little about the flavors” uses small line drawings for cardamom, cumin, and chili. The notes are general orientation, not this kitchen’s recipes. The text is in `dist/experience.js`; the drawings are the SVG symbols in `dist/index.html`.

Menu filters use the category IDs (`appetizers`, `clay-oven`, `soups`). Renaming a category keeps the filters working as long as its ID stays the same. Search and “Show all dishes” reset the list.

Motion is limited to short transitions after a deliberate action. Nothing loops. The operating system’s reduced-motion setting removes those transitions. No third-party animation libraries are required.
