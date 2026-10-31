# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People in and around Columbus, Georgia, deciding whether to visit Bombay Palace and looking up the menu, address, and directions. The restaurant owner reviews the site and should recognize a premium restaurant, not a template. Staff update restaurant details, hours, categories, and dishes in the browser editor.

## Product Purpose

A website for Bombay Palace, an Indian restaurant at 4213 Macon Rd, Columbus, GA 31907. Success means a visitor can find the menu, the address, and directions immediately, and the owner sees a rich, elegant, easy-to-use restaurant site.

## Positioning

A dining invitation for this restaurant on Macon Road, with an editable selected menu and visit details. It is not a generic Indian-food landing page and not a copy of a delivery listing.

## Operating Context

Visitors browse on a phone or a desktop, usually before a meal. They need the menu, the location, hours, contact, and directions. Directions are a Google Maps URL built from the street address. Staff edit content in a browser-only editor. Lasting changes require replacing `dist/content.json` and a private redeploy. There is no server, database, analytics, or form submission.

## Capabilities and Constraints

- Static files in `dist/`. No framework, build step, paid font host, or third-party script.
- Restaurant name, address, copy, phone, email, ordering URL, notice, hours, holiday exceptions, menu, photographs, and optional services come from `dist/content.json`.
- Phone, email, hours, and the ordering URL are unconfirmed. They stay inactive until the restaurant confirms them. Do not invent a phone number, email, hours, or an ordering link.
- Reservations, catering, gift cards, careers, a newsletter, a menu PDF, social links, and specials stay hidden until each one is confirmed and has a working destination. Specials also need an expiration date.
- “Open now” appears only when every weekday is confirmed, each open day has start and end times, and holiday exceptions are marked reviewed. Times use America/New_York.
- The menu is a selected preview from the Uber Eats listing for this address, checked 2026-10-29. It is not the complete dine-in menu. Listed prices are not asserted as current dine-in prices.
- Staff editor covers restaurant details, hours, holiday exceptions, the menu, optional services, and import, export, and restore. A saved preview stays in that browser.
- Primary navigation is Menu, Our Story, Gallery, and Visit & Contact. Menu search and category filters remain. The story uses confirmed facts only.
- The flavor notes (cardamom, cumin, chili) are general orientation, not a primary navigation item and not a recipe from this kitchen.
- `noindex` stays. Do not make the audience public without the owner's approval.
- The user granted full visual freedom on 2026-10-30: existing photographs may be kept or modified, and they need not be the restaurant's own photography. Do not label modified images as photographs of the restaurant's actual dishes.
- Do not invent testimonials, awards, press, or a complete menu.

## Brand Commitments

Name: Bombay Palace. Cuisine and place: Indian cuisine, Columbus, Georgia, 4213 Macon Rd. The user made this binding: the site must feel rich, elegant, and premium, and it must be easy to use. The existing arch mark is a proposed mark, not an official logo.

## Evidence on Hand

- `dist/content.json`: name, address, headline, intro, blank phone, email, and ordering URL, unconfirmed hours, `holidays: null`, three categories, eight dishes, and hidden optional services.
- Illustrative photographs in `dist/assets/`: `hero-spread.webp`, `dish-samosa.webp`, `dish-tikka.webp`, `dish-daal.webp` (1024×1024), `feature-tandoori.webp` and `visit-table-day.webp` (1152×864), plus `-640` copies. They are not photographs of the restaurant’s dishes or dining room.
- `dist/assets/mark.svg`: proposed arch mark.
- No approved phone, hours, ordering destination, testimonials, or press.

## Product Principles

1. A visitor reaches the menu, the address, and directions without hunting.
2. Unconfirmed facts stay unconfirmed. The site never invents contact details, hours, reviews, or a complete menu.
3. The page should feel specific to Bombay Palace on Macon Road.
4. Staff can still edit content and export `content.json`.
5. Premium means restraint and craft. Ease of use outranks decoration.
