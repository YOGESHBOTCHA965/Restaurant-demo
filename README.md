# Bombay Palace — complete editable website

This folder contains the full website, including the homepage, interactive spice illustrations, photo menu guide, filters, staff editor, styles, JavaScript, editable content, and all referenced image assets. No package installation or paid service is needed to edit the files.

## Open in Cursor

1. Extract the ZIP file completely.
2. In Cursor, choose **File → Open Folder** and select **Bombay-Palace-Website** (the folder containing this README and `package.json`).
3. Open Cursor's terminal and run:

   ```sh
   npm run dev
   ```

4. Open **http://localhost:8000** in your browser.
5. Edit files, save, and refresh the browser to see the changes. Stop the preview with **Ctrl+C**.

The preview command requires Node.js and npm on your computer. There are no dependencies to install, so `npm install` is unnecessary.

If Python is available instead, run either command from this folder:

```sh
# Windows
py -m http.server 8000 --bind 127.0.0.1 --directory dist

# macOS / Linux
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open the same localhost address. Use a local web server instead of double-clicking `index.html`, because the menu loads from a JSON file.

## Which files to edit

| File | What it controls |
| --- | --- |
| `dist/index.html` | Page layout, text sections, navigation, inline SVG illustrations, staff editor markup |
| `dist/site.css` | The whole design: color, type and spacing tokens, buttons, layout, motion, mobile layout, reduced-motion styles |
| `dist/app.js` | Menu filtering/search, content rendering, the "Where to start" board, staff editor, import/export |
| `dist/experience.js` | The hero board's photo preview, spice notes, brush-stroke reveal, active navigation, mobile nav and bottom bar |
| `dist/content.json` | Restaurant name/address, phone, hours, menu categories, dishes, prices, confirmation flags, optional announcement |
| `dist/assets/hero-spread.webp` | Illustrative overhead spread of the menu's dishes (hero and default photo) |
| `dist/assets/dish-*.webp` | Illustrative close-ups of samosa, chicken tikka and daal soup (hero preview and menu category photo) |
| `dist/assets/feature-tandoori.webp` | Illustrative clay-oven plate for the forest feature band |
| `dist/assets/visit-table-day.webp` | Illustrative table setting for the Visit section (not the restaurant's dining room) |
| `dist/assets/fonts/` | Self-hosted Yatra One and Mukta fonts |
| `dist/assets/mark.svg` | Proposed arch brand mark |
| `DESIGN.md` | The design system: colors, type, components, and the rules behind them |
| `previous-design/` | Backup of the earlier ivory-and-wine design, not served |

Each generated image has a `.webp.json` file beside it that records how it was made (the prompt, or which original a resized copy came from).

## Editing restaurant content

Change `dist/content.json` directly to make lasting changes to this local website. Keep JSON commas and quotation marks valid.

You can also use the website's Staff editor to try changes. **Save browser preview** stores a preview only in that browser. To make those changes part of the source, download the editor's `content.json` and replace `dist/content.json` with it. If an older browser preview hides your file edits, choose **Staff editor → Content file → Restore the hosted content in this browser**. In a local preview, that restores the content currently served from your local JSON file.

Hours, phone, ordering destination, and the selected online menu values still need restaurant confirmation. Unknown phone and ordering fields are intentionally blank. The food photographs and botanical drawings are illustrative. Do not treat them as restaurant photography or as an ingredient list.

## Hosting and privacy

Editing this download does **not** change the hosted private prototype. This archive contains no credentials and no remote publishing configuration. The local preview listens only on your computer. To update the hosted version, supply the changed files for a separate private deployment.

The `noindex` tag discourages search indexing; it is not a password or access control. Keep the hosted site's private audience settings when redeploying. Do not publish publicly without the owner's approval.

## Further notes

See `docs/MAINTENANCE.md` for the original content sources, confirmation flags, category IDs, graphic editing notes, and operating model. The original export matched the private premium redesign, commit `156a60db55ec7e1a5335c5265ee7c3dc6a438277`; that design is kept in `previous-design/`. The current "clay oven" design replaces it, and `DESIGN.md` describes it.
