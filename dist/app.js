'use strict';
(() => {
  const STORAGE_KEY = 'bombay-palace-content-v1';
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clone = value => JSON.parse(JSON.stringify(value));
  let content, hostedContent, draft, activeCategory = 'all', searchTerm = '', lastFocused, emptyMode = 'reset';
  let toastTimer;
  const dialog = $('#editor-dialog');

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    if (tag === 'button') element.type = 'button';
    return element;
  }
  function joinList(items) {
    if (items.length < 2) return items.join('');
    if (items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
  }
  function uniqueId(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); }
  function safeHttps(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }
  function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
  function validTime(value) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }
  function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value); }
  function minutes(value) {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || '');
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  }

  function ensureServices(data) {
    const r = data.restaurant;
    if (typeof r.email !== 'string') r.email = '';
    if (typeof r.emailConfirmed !== 'boolean') r.emailConfirmed = false;
    if (typeof r.announcementConfirmed !== 'boolean') r.announcementConfirmed = false;
    if (typeof r.noticeHref !== 'string') r.noticeHref = '';
    data.hours.forEach(hour => {
      if (typeof hour.opens !== 'string') hour.opens = '';
      if (typeof hour.closes !== 'string') hour.closes = '';
    });
    if (data.holidays !== null && !Array.isArray(data.holidays)) data.holidays = null;
    const blank = {
      reservations: { url: '', byPhone: false, confirmed: false },
      catering: { summary: '', url: '', email: '', confirmed: false },
      giftCards: { url: '', provider: '', confirmed: false },
      careers: { url: '', summary: '', confirmed: false },
      newsletter: { action: '', emailField: 'email', confirmed: false },
      menuPdf: { url: '', confirmed: false },
      social: [],
      specials: []
    };
    data.services = Object.assign({}, blank, data.services || {});
    Object.keys(blank).forEach(key => {
      if (Array.isArray(blank[key])) {
        if (!Array.isArray(data.services[key])) data.services[key] = [];
      } else data.services[key] = Object.assign({}, blank[key], data.services[key] || {});
    });
    if (!data.media || typeof data.media !== 'object') data.media = hostedContent && hostedContent.media ? clone(hostedContent.media) : {};
    return data;
  }

  function validate(data) {
    const fail = message => { throw new Error(message); };
    const string = (value, label, max = 500) => {
      if (typeof value !== 'string' || value.length > max) fail(label + ' must be text of at most ' + max + ' characters.');
    };
    if (!data || data.schemaVersion !== 1 || !data.restaurant || !data.menu || !Array.isArray(data.hours)) fail('Choose a valid version 1 Bombay Palace content file.');
    ensureServices(data);
    const r = data.restaurant;
    ['name', 'tagline', 'headline', 'intro', 'address', 'cityLine', 'phone', 'email', 'orderingUrl', 'notice', 'noticeHref'].forEach(key => string(r[key], key, key === 'intro' || key === 'notice' ? 800 : 500));
    ['name', 'address', 'cityLine', 'headline'].forEach(key => { if (!r[key].trim()) fail('Restaurant ' + key + ' cannot be blank.'); });
    ['phoneConfirmed', 'emailConfirmed', 'orderingConfirmed', 'announcementConfirmed'].forEach(key => { if (typeof r[key] !== 'boolean') fail(key + ' must be true or false.'); });
    if (r.phoneConfirmed && !/^\+?[0-9() .-]{7,25}$/.test(r.phone.trim())) fail('Enter a valid phone number before marking it confirmed.');
    if (r.emailConfirmed && !validEmail(r.email.trim())) fail('Enter a valid email before marking it confirmed.');
    if (r.orderingUrl && !safeHttps(r.orderingUrl)) fail('Ordering links must be complete HTTPS URLs.');
    if (r.orderingConfirmed && !safeHttps(r.orderingUrl)) fail('Enter an HTTPS ordering link before marking it confirmed.');
    if (r.noticeHref && !safeHttps(r.noticeHref)) fail('Announcement links must be complete HTTPS URLs.');
    if (r.announcementConfirmed && !r.notice.trim()) fail('Write the announcement before showing it.');
    if (data.hours.length !== 7 || new Set(data.hours.map(h => h.day)).size !== 7) fail('Hours must contain all seven days once.');
    data.hours.forEach(h => {
      if (!DAYS.includes(h.day) || typeof h.confirmed !== 'boolean') fail('Check the days and confirmation fields in hours.');
      string(h.text, 'Hours', 200); string(h.opens, 'Opens', 8); string(h.closes, 'Closes', 8);
      if (h.confirmed && !h.text.trim()) fail('Enter hours or “Closed” before confirming ' + h.day + '.');
      if ((h.opens || h.closes) && (!validTime(h.opens) || !validTime(h.closes) || minutes(h.opens) >= minutes(h.closes))) fail(h.day + ' needs a 24-hour start and a later end, such as 11:00 and 22:00.');
    });
    if (data.holidays !== null) {
      if (!Array.isArray(data.holidays) || data.holidays.length > 40) fail('Holiday exceptions must be a short list.');
      data.holidays.forEach(holiday => {
        string(holiday.date, 'Holiday date', 10); string(holiday.label, 'Holiday label', 80); string(holiday.opens || '', 'Holiday opens', 8); string(holiday.closes || '', 'Holiday closes', 8);
        if (!validDate(holiday.date) || !holiday.label.trim() || typeof holiday.closed !== 'boolean') fail('Each holiday exception needs a date (YYYY-MM-DD), a label, and a closed setting.');
        if (!holiday.closed && (!validTime(holiday.opens) || !validTime(holiday.closes) || minutes(holiday.opens) >= minutes(holiday.closes))) fail(holiday.label + ' needs opening and closing times.');
      });
    }
    const s = data.services;
    ['reservations', 'catering', 'giftCards', 'careers', 'newsletter', 'menuPdf'].forEach(key => { if (typeof s[key].confirmed !== 'boolean') fail(key + ' confirmation must be true or false.'); });
    if (s.reservations.url && !safeHttps(s.reservations.url)) fail('Reservation links must be complete HTTPS URLs.');
    if (s.reservations.confirmed && !safeHttps(s.reservations.url) && !(s.reservations.byPhone && r.phoneConfirmed)) fail('Confirm reservations with an HTTPS link or the restaurant phone.');
    string(s.catering.summary, 'Catering summary', 600); string(s.catering.email, 'Catering email', 200);
    if (s.catering.url && !safeHttps(s.catering.url)) fail('Catering links must be complete HTTPS URLs.');
    if (s.catering.email && !validEmail(s.catering.email)) fail('Enter a valid catering email or leave it blank.');
    if (s.catering.confirmed && (!s.catering.summary.trim() || (!safeHttps(s.catering.url) && !validEmail(s.catering.email)))) fail('Catering needs a summary and an HTTPS link or email before it can show.');
    if (s.giftCards.url && !safeHttps(s.giftCards.url)) fail('Gift card links must be complete HTTPS URLs.');
    string(s.giftCards.provider, 'Gift card provider', 80);
    if (s.giftCards.confirmed && (!safeHttps(s.giftCards.url) || !s.giftCards.provider.trim())) fail('Gift cards need a provider name and an HTTPS link.');
    string(s.careers.summary, 'Careers summary', 600);
    if (s.careers.url && !safeHttps(s.careers.url)) fail('Careers links must be complete HTTPS URLs.');
    if (s.careers.confirmed && !safeHttps(s.careers.url) && !s.careers.summary.trim()) fail('Careers needs a summary or an HTTPS link.');
    if (s.newsletter.action && !safeHttps(s.newsletter.action)) fail('Newsletter actions must be complete HTTPS URLs.');
    if (s.newsletter.confirmed && !safeHttps(s.newsletter.action)) fail('Newsletter signup needs an HTTPS form address.');
    if (!/^[A-Za-z][\w.-]{0,40}$/.test(s.newsletter.emailField || 'email')) fail('The newsletter email field name looks invalid.');
    if (s.menuPdf.url && !safeHttps(s.menuPdf.url)) fail('Menu PDF links must be complete HTTPS URLs.');
    if (s.menuPdf.confirmed && !safeHttps(s.menuPdf.url)) fail('The menu PDF needs an HTTPS link.');
    if (s.social.length > 12 || s.specials.length > 20) fail('Too many social links or specials.');
    s.social.forEach(item => {
      string(item.label || '', 'Social label', 40); if (item.url && !safeHttps(item.url)) fail('Social links must be complete HTTPS URLs.');
      if (typeof item.confirmed !== 'boolean') fail('Social confirmation must be true or false.');
      if (item.confirmed && (!item.label.trim() || !safeHttps(item.url))) fail('Each confirmed social link needs a name and an HTTPS URL.');
    });
    s.specials.forEach(item => {
      string(item.name || '', 'Special name', 80); string(item.description || '', 'Special description', 400); string(item.expires || '', 'Special expiration', 10);
      if (typeof item.confirmed !== 'boolean') fail('Special confirmation must be true or false.');
      if (item.expires && !validDate(item.expires)) fail('Special expiration dates use YYYY-MM-DD.');
      if (item.confirmed && (!item.name.trim() || !item.description.trim() || !validDate(item.expires))) fail('Each confirmed special needs a name, description, and expiration date.');
    });
    const m = data.menu;
    if (typeof m.complete !== 'boolean' || !Array.isArray(m.categories) || !Array.isArray(m.items) || m.categories.length < 1 || m.categories.length > 40 || m.items.length > 300) fail('Menu needs 1–40 categories and no more than 300 dishes.');
    ['sourceLabel', 'sourceUrl', 'sourceChecked'].forEach(key => string(m[key], key));
    if (m.sourceUrl && !safeHttps(m.sourceUrl)) fail('Menu source must be a complete HTTPS URL.');
    const catIds = new Set(), itemIds = new Set();
    m.categories.forEach(c => { string(c.id, 'Category ID', 100); string(c.name, 'Category name', 100); if (!c.id || c.id === 'all' || !c.name.trim() || catIds.has(c.id)) fail('Categories need unique IDs and nonempty names.'); catIds.add(c.id); });
    m.items.forEach(item => {
      ['id', 'category', 'name', 'description', 'price'].forEach(key => string(item[key], 'Dish ' + key, key === 'description' ? 500 : 150));
      if (!item.id || itemIds.has(item.id) || !item.name.trim() || !catIds.has(item.category)) fail('Each dish needs a unique ID, a name, and an existing category.');
      if (typeof item.confirmed !== 'boolean') fail('Dish confirmation must be true or false.');
      if (item.price && !/^\d{1,5}(\.\d{1,2})?$/.test(item.price)) fail('Use a plain number for the price of ' + item.name + ', such as 12.50, or leave it blank.');
      if (item.labels !== undefined && (!Array.isArray(item.labels) || item.labels.some(label => typeof label !== 'string'))) fail('Dietary labels must be a list of words.');
      itemIds.add(item.id);
    });
    return data;
  }

  function nyParts(date) {
    const bag = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).forEach(part => { bag[part.type] = part.value; });
    let hour = Number(bag.hour);
    if (hour === 24) hour = 0;
    return { weekday: bag.weekday, date: bag.year + '-' + bag.month + '-' + bag.day, minutes: hour * 60 + Number(bag.minute) };
  }
  function openingState(data, date = new Date()) {
    if (!Array.isArray(data.holidays)) return null;
    if (data.hours.length !== 7 || data.hours.some(hour => !hour.confirmed || !String(hour.text).trim())) return null;
    const windows = data.hours.map(hour => {
      if (/^closed$/i.test(hour.text.trim())) return { day: hour.day, closed: true };
      const opens = minutes(hour.opens), closes = minutes(hour.closes);
      if (opens === null || closes === null || opens >= closes) return null;
      return { day: hour.day, closed: false, opens, closes };
    });
    if (windows.some(window => !window)) return null;
    const now = nyParts(date);
    const holiday = data.holidays.find(item => item.date === now.date);
    if (holiday) {
      if (holiday.closed) return { open: false, label: holiday.label };
      const opens = minutes(holiday.opens), closes = minutes(holiday.closes);
      if (opens === null || closes === null) return null;
      return { open: now.minutes >= opens && now.minutes < closes, label: holiday.label };
    }
    const today = windows.find(window => window.day === now.weekday);
    if (!today || today.closed) return { open: false, label: '' };
    return { open: now.minutes >= today.opens && now.minutes < today.closes, label: '' };
  }

  function toast(message) {
    clearTimeout(toastTimer);
    const el = $('#toast');
    el.textContent = message;
    el.hidden = false;
    toastTimer = setTimeout(() => { el.hidden = true; }, 4000);
  }
  function formatPrice(item) {
    return item.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.price)) : 'Price to confirm';
  }
  function needsStar(item) {
    return item.price && !item.confirmed && content.menu.items.some(other => other.price && other.confirmed);
  }
  function applyMedia(img, media) {
    if (!img || !media || !media.src) return;
    img.src = media.src;
    if (media.width) img.width = media.width;
    if (media.height) img.height = media.height;
    if (media.srcSmall && media.width) img.srcset = media.srcSmall + ' 640w, ' + media.src + ' ' + media.width + 'w';
    const zoom = img.closest('.zoom');
    if (zoom) {
      zoom.dataset.full = media.src;
      zoom.dataset.alt = media.alt || '';
      zoom.dataset.caption = media.caption || '';
      zoom.setAttribute('aria-label', 'View larger. ' + (media.alt || 'Photograph') + '. ' + (media.caption || ''));
    }
    const caption = img.closest('figure') && img.closest('figure').querySelector('figcaption');
    if (caption && media.caption) caption.textContent = media.caption;
  }
  function externalAnchor(href, label, className) {
    const link = node('a', className || '', label);
    link.href = href;
    if (/^https:/.test(href)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    return link;
  }
  function serviceLinks() {
    const r = content.restaurant, s = content.services, links = [];
    const order = r.orderingConfirmed && safeHttps(r.orderingUrl);
    if (order) links.push({ label: 'Order online', href: order, kind: 'order' });
    if (s.reservations.confirmed && safeHttps(s.reservations.url)) links.push({ label: 'Reservations', href: safeHttps(s.reservations.url) });
    else if (s.reservations.confirmed && s.reservations.byPhone && r.phoneConfirmed) links.push({ label: 'Reservations', href: 'tel:' + r.phone.replace(/[^+0-9]/g, '') });
    if (s.giftCards.confirmed && safeHttps(s.giftCards.url)) links.push({ label: 'Gift cards', href: safeHttps(s.giftCards.url) });
    if (s.careers.confirmed && safeHttps(s.careers.url)) links.push({ label: 'Careers', href: safeHttps(s.careers.url) });
    else if (s.careers.confirmed && s.careers.summary.trim()) links.push({ label: 'Careers', href: '#careers-note' });
    s.social.filter(item => item.confirmed && safeHttps(item.url)).forEach(item => links.push({ label: item.label, href: safeHttps(item.url), social: true }));
    return links;
  }

  function renderMenu() {
    const term = searchTerm.toLocaleLowerCase();
    const matches = item => (item.name + ' ' + item.description).toLocaleLowerCase().includes(term);
    const visible = content.menu.items.filter(item => (activeCategory === 'all' || item.category === activeCategory) && matches(item));
    const elsewhere = term && activeCategory !== 'all' ? content.menu.items.filter(item => item.category !== activeCategory && matches(item)) : [];
    $('#menu-grid').replaceChildren();
    let index = 0;
    content.menu.categories.forEach(category => {
      const dishes = visible.filter(item => item.category === category.id);
      if (!dishes.length) return;
      const group = node('section', 'menu-group');
      const title = node('h3', 'menu-group-title', category.name);
      title.append(node('span', 'menu-group-count', dishes.length + (dishes.length === 1 ? ' dish' : ' dishes')));
      if (!term) group.append(title);
      dishes.forEach(item => {
        const article = node('article', 'menu-item');
        article.style.setProperty('--i', String(index++));
        const line = node('div', 'dish-line');
        line.append(node('h4', '', item.name));
        const price = node('p', 'dish-price' + (item.price ? '' : ' is-pending') + (item.price && !item.confirmed ? ' is-unconfirmed' : ''), formatPrice(item));
        if (needsStar(item)) price.append(node('sup', '', '*'));
        if (item.price && !item.confirmed) price.append(node('span', 'sr-only', ' listing price, not confirmed'));
        if (item.confirmed && Array.isArray(item.labels) && item.labels.length) price.append(node('span', 'sr-only', ' ' + item.labels.join(', ')));
        line.append(price);
        article.append(line, node('p', 'dish-desc', item.description));
        if (term) article.append(node('p', 'dish-category', category.name));
        if (item.confirmed && Array.isArray(item.labels)) item.labels.forEach(label => { if (label.trim()) article.append(node('p', 'dish-category', label.trim())); });
        group.append(article);
      });
      $('#menu-grid').append(group);
    });
    const cat = content.menu.categories.find(item => item.id === activeCategory);
    let count = visible.length + (visible.length === 1 ? ' dish' : ' dishes');
    if (cat) count += ' in ' + cat.name;
    if (searchTerm) count += ' matching “' + searchTerm + '”';
    $('#menu-count').textContent = count;
    $$('#category-filters .filter-button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === activeCategory)));
    $$('button[data-menu-path]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.menuPath === activeCategory)));
    const filtered = activeCategory !== 'all' || !!searchTerm;
    $('#show-all-menu').hidden = !filtered;
    $('#menu-empty').hidden = visible.length > 0;
    if (!visible.length) {
      const title = $('#empty-title'), copy = $('#empty-copy'), action = $('#empty-action');
      if (elsewhere.length) {
        emptyMode = 'broaden';
        const names = elsewhere.map(item => item.name);
        const where = [...new Set(elsewhere.map(item => content.menu.categories.find(c => c.id === item.category).name))];
        title.textContent = 'No matches in ' + (cat ? cat.name : 'this category');
        copy.textContent = joinList(names) + (names.length === 1 ? ' is' : ' are') + ' listed under ' + joinList(where) + '.';
        action.textContent = 'Show matches in all categories';
      } else if (searchTerm) {
        emptyMode = 'reset';
        title.textContent = 'Nothing matches “' + searchTerm + '”';
        copy.textContent = 'This is a selection of the menu, not every dish. Try another word, or show all dishes.';
        action.textContent = 'Show all dishes';
      } else {
        emptyMode = 'reset';
        title.textContent = 'No dishes in ' + (cat ? cat.name : 'this category');
        copy.textContent = 'This selection has nothing filed there yet.';
        action.textContent = 'Show all dishes';
      }
    }
  }

  function render() {
    const r = content.restaurant;
    const s = content.services;
    $$('[data-name]').forEach(el => { el.textContent = r.name; });
    $('[data-footer-name]').textContent = r.name;
    document.title = r.name + ' | Indian cuisine in Columbus, Georgia';
    const title = $('#hero-title');
    title.replaceChildren();
    r.headline.split('\n').map(line => line.trim()).filter(Boolean).forEach((line, index) => {
      if (index) title.append(document.createElement('br'));
      title.append(document.createTextNode(line));
    });
    $('#tagline').textContent = r.tagline;
    $('#intro').textContent = r.intro;
    $('#story-intro').textContent = r.intro;
    $$('[data-address]').forEach(el => { el.textContent = r.address; });
    $$('[data-city]').forEach(el => { el.textContent = r.cityLine; });
    const directions = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(r.address + ', ' + r.cityLine);
    const map = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(r.address + ', ' + r.cityLine);
    $$('[data-directions]').forEach(el => { el.href = directions; });
    $('#map-link').href = map;
    const bar = $('#announcement');
    const showBar = r.announcementConfirmed && r.notice.trim();
    bar.hidden = !showBar;
    bar.replaceChildren();
    if (showBar) {
      bar.append(document.createTextNode(r.notice.trim()));
      const href = safeHttps(r.noticeHref);
      if (href) { bar.append(' '); const link = externalAnchor(href, 'Details'); bar.append(link); }
    }
    const top = document.querySelector('.topbar');
    if (top) document.documentElement.style.setProperty('--sticky-h', top.offsetHeight + 'px');

    const media = content.media || {};
    applyMedia($('[data-media="hero"]'), media.hero);
    applyMedia($('[data-media="feature"]'), media.feature);
    (media.gallery || []).forEach(item => applyMedia($('[data-media="' + item.id + '"]'), item));
    const discover = $('#menu-discover');
    discover.replaceChildren();
    content.menu.categories.forEach(category => {
      const photo = media[category.id];
      if (!photo || !photo.src) return;
      const link = node('a', 'discover-tile');
      link.href = '#menu-list';
      link.dataset.menuPath = category.id;
      const img = node('img');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      applyMedia(img, photo);
      const copy = node('span', 'discover-copy');
      const count = content.menu.items.filter(item => item.category === category.id).length;
      copy.append(node('span', 'discover-name', category.name), node('span', 'discover-meta', count + (count === 1 ? ' dish' : ' dishes')));
      link.append(img, copy);
      discover.append(link);
    });

    const order = r.orderingConfirmed && safeHttps(r.orderingUrl);
    ['header-cta', 'mobile-cta', 'hero-primary'].forEach(id => {
      const el = $('#' + id);
      if (!el) return;
      if (order && id !== 'hero-primary') {
        el.textContent = 'Order online'; el.href = order; el.target = '_blank'; el.rel = 'noopener noreferrer';
      } else if (order && id === 'hero-primary') {
        el.textContent = 'Order online'; el.href = order; el.target = '_blank'; el.rel = 'noopener noreferrer';
      } else {
        el.textContent = 'Explore the menu'; el.href = '#menu'; el.removeAttribute('target'); el.removeAttribute('rel');
      }
    });
    const links = serviceLinks().filter(link => link.kind !== 'order');
    const optional = $('#optional-nav');
    optional.replaceChildren();
    links.slice(0, 2).forEach(link => optional.append(externalAnchor(link.href, link.label)));
    optional.hidden = optional.childElementCount === 0;
    const mobileOptional = $('#mobile-optional');
    mobileOptional.replaceChildren();
    links.forEach(link => mobileOptional.append(externalAnchor(link.href, link.label)));
    const footer = $('#footer-extra');
    footer.replaceChildren(externalAnchor(directions, 'Get directions'));
    serviceLinks().forEach(link => { if (link.social) return; footer.append(externalAnchor(link.href, link.label)); });
    const visitServices = $('#service-links');
    visitServices.replaceChildren();
    serviceLinks().filter(link => !link.social).forEach(link => visitServices.append(externalAnchor(link.href, link.label)));
    s.social.filter(item => item.confirmed && safeHttps(item.url)).forEach(item => footer.append(externalAnchor(safeHttps(item.url), item.label)));
    if (s.careers.confirmed && s.careers.summary.trim() && !safeHttps(s.careers.url)) {
      const note = node('p', 'footer-note', s.careers.summary.trim());
      note.id = 'careers-note';
      footer.append(note);
    }

    const pdf = s.menuPdf.confirmed && safeHttps(s.menuPdf.url);
    const pdfLink = $('#menu-pdf');
    pdfLink.hidden = !pdf;
    if (pdf) { pdfLink.href = pdf; pdfLink.target = '_blank'; pdfLink.rel = 'noopener noreferrer'; }
    const pending = content.menu.items.filter(item => item.price && !item.confirmed).length;
    const priced = content.menu.items.filter(item => item.price).length;
    const priceNote = !priced ? '' : !pending ? 'Prices and availability may change. ' : pending === priced ? 'Prices are from a public online listing and may differ in the restaurant. ' : 'Starred prices are from a public online listing and may differ in the restaurant. ';
    const disclaimer = $('#menu-disclaimer');
    disclaimer.replaceChildren(document.createTextNode((content.menu.complete ? '' : 'A selection from the menu. ') + priceNote));
    const sourceUrl = safeHttps(content.menu.sourceUrl);
    if (sourceUrl) {
      const source = externalAnchor(sourceUrl, content.menu.sourceLabel || 'Menu source');
      source.title = (content.menu.sourceLabel || 'Source') + (content.menu.sourceChecked ? ' · checked ' + content.menu.sourceChecked : '');
      const line = node('span', 'source-line');
      line.append(source, document.createTextNode(content.menu.sourceChecked ? ' · checked ' + content.menu.sourceChecked + '.' : '.'));
      disclaimer.append(line);
    }
    $('#price-note').textContent = priceNote.trim() || 'Prices appear after the restaurant confirms them.';

    const filters = $('#category-filters');
    filters.replaceChildren();
    [{ id: 'all', name: 'All dishes' }, ...content.menu.categories].forEach(category => {
      const button = node('button', 'filter-button', category.name);
      button.dataset.category = category.id;
      button.setAttribute('aria-pressed', String(activeCategory === category.id));
      filters.append(button);
    });
    if (activeCategory !== 'all' && !content.menu.categories.some(category => category.id === activeCategory)) activeCategory = 'all';

    const state = openingState(content);
    const status = $('#open-status');
    if (!state) status.hidden = true;
    else {
      status.hidden = false;
      status.textContent = (state.open ? 'Open now' : 'Closed now') + (state.label ? ' · ' + state.label : '');
    }
    const hoursList = $('#hours-list');
    hoursList.replaceChildren();
    const anyHours = content.hours.some(hour => hour.confirmed);
    content.hours.forEach(hour => {
      if (!anyHours) return;
      const row = node('div', 'hours-row');
      row.append(node('dt', '', hour.day), node('dd', '', hour.confirmed ? hour.text : 'To be confirmed'));
      hoursList.append(row);
    });
    hoursList.hidden = !anyHours;
    const allHours = content.hours.every(hour => hour.confirmed);
    $('#hours-note').textContent = allHours ? (Array.isArray(content.holidays) ? 'Holiday exceptions are included in Open now.' : 'Holiday hours are not confirmed yet.') : anyHours ? 'Other days are being confirmed.' : 'Being confirmed with the restaurant.';
    $('#phone-link').hidden = !r.phoneConfirmed;
    $('#phone-pending').hidden = r.phoneConfirmed;
    if (r.phoneConfirmed) { $('#phone-link').textContent = r.phone; $('#phone-link').href = 'tel:' + r.phone.replace(/[^+0-9]/g, ''); }
    else $('#phone-link').removeAttribute('href');
    $('#email-link').hidden = !r.emailConfirmed;
    $('#email-pending').hidden = r.emailConfirmed;
    if (r.emailConfirmed) { $('#email-link').textContent = r.email; $('#email-link').href = 'mailto:' + r.email.trim(); }
    else $('#email-link').removeAttribute('href');

    const specials = (s.specials || []).filter(item => item.confirmed && item.expires >= nyParts(new Date()).date);
    const specialsSection = $('#specials');
    specialsSection.hidden = specials.length === 0;
    const specialsList = $('#specials-list');
    specialsList.replaceChildren();
    specials.forEach(item => {
      const article = node('article');
      article.append(node('h3', '', item.name), node('p', '', item.description), node('p', 'dish-category', 'Through ' + item.expires));
      specialsList.append(article);
    });
    const catering = $('#catering');
    const cateringOn = s.catering.confirmed && s.catering.summary.trim() && (safeHttps(s.catering.url) || validEmail(s.catering.email));
    catering.hidden = !cateringOn;
    if (cateringOn) {
      $('#catering-summary').textContent = s.catering.summary.trim();
      const actions = $('#catering-actions');
      actions.replaceChildren();
      if (safeHttps(s.catering.url)) actions.append(externalAnchor(safeHttps(s.catering.url), 'Catering details', 'button button-primary'));
      if (validEmail(s.catering.email)) actions.append(externalAnchor('mailto:' + s.catering.email.trim(), 'Email about an event', 'button button-secondary'));
    }
    const news = $('#newsletter');
    const newsOn = s.newsletter.confirmed && safeHttps(s.newsletter.action);
    news.hidden = !newsOn;
    if (newsOn) {
      news.action = safeHttps(s.newsletter.action);
      $('#newsletter-email').name = s.newsletter.emailField || 'email';
      $('#newsletter-note').textContent = 'This form is sent to the restaurant’s email service. It does not confirm a booking.';
    }
    $$('button[data-menu-path]').forEach(button => { button.disabled = !content.menu.categories.some(category => category.id === button.dataset.menuPath); });
    renderMenu();
  }

  function field(label, key, value, options = {}) {
    const wrapper = node('label', 'form-field' + (options.wide ? ' span-two' : ''));
    const control = node(options.multiline ? 'textarea' : 'input');
    if (!options.multiline) control.type = options.type || 'text';
    control.value = value == null ? '' : value;
    control.dataset.key = key;
    if (options.group) control.dataset.svc = options.group;
    control.maxLength = options.max || 500;
    if (options.placeholder) control.placeholder = options.placeholder;
    if (options.inputMode) control.inputMode = options.inputMode;
    if (options.required) control.required = true;
    wrapper.append(node('span', '', label), control);
    if (options.help) wrapper.append(node('small', '', options.help));
    return wrapper;
  }
  function check(label, key, checked, group) {
    const wrapper = node('label', 'check-label');
    const control = node('input');
    control.type = 'checkbox';
    control.checked = !!checked;
    control.dataset.key = key;
    if (group) control.dataset.svc = group;
    wrapper.append(control, document.createTextNode(label));
    return wrapper;
  }
  function message(text) { $('#editor-message').textContent = text; }
  function populateEditor() {
    const basics = $('#basics-fields');
    basics.replaceChildren();
    const r = draft.restaurant;
    [
      ['Restaurant name', 'name', { required: true }],
      ['Location line', 'tagline', {}],
      ['Homepage headline', 'headline', { multiline: true, wide: true, help: 'Line breaks stay as separate lines.', required: true }],
      ['Welcome text', 'intro', { multiline: true, wide: true }],
      ['Street address', 'address', { required: true }],
      ['City, state, ZIP', 'cityLine', { required: true }],
      ['Phone number', 'phone', { type: 'tel', placeholder: 'Awaiting confirmation' }],
      ['Email', 'email', { type: 'email', placeholder: 'Awaiting confirmation' }],
      ['Ordering URL', 'orderingUrl', { type: 'url', placeholder: 'https://', wide: true }],
      ['Announcement', 'notice', { wide: true, multiline: true }],
      ['Announcement link', 'noticeHref', { type: 'url', placeholder: 'https://', wide: true }]
    ].forEach(([label, key, options]) => basics.append(field(label, key, r[key], options)));
    basics.append(
      check('Phone number confirmed', 'phoneConfirmed', r.phoneConfirmed),
      check('Email confirmed', 'emailConfirmed', r.emailConfirmed),
      check('Ordering link confirmed', 'orderingConfirmed', r.orderingConfirmed),
      check('Show the announcement bar', 'announcementConfirmed', r.announcementConfirmed)
    );
    $('#hours-fields').replaceChildren();
    draft.hours.forEach(hour => {
      const row = node('div', 'hours-editor-row');
      row.dataset.day = hour.day;
      row.append(node('span', '', hour.day), field('Hours', 'text', hour.text, { max: 200, placeholder: 'Not yet confirmed' }), field('Opens', 'opens', hour.opens, { max: 5, placeholder: '11:00' }), field('Closes', 'closes', hour.closes, { max: 5, placeholder: '22:00' }), check('Confirmed', 'confirmed', hour.confirmed));
      $('#hours-fields').append(row);
    });
    $('#holidays-reviewed').checked = Array.isArray(draft.holidays);
    $('#holiday-fields').replaceChildren();
    (draft.holidays || []).forEach((holiday, index) => {
      const row = node('div', 'holiday-row');
      row.dataset.index = String(index);
      const remove = node('button', 'remove-button', 'Remove');
      remove.addEventListener('click', () => { draft = readForm(); draft.holidays.splice(index, 1); populateEditor(); });
      row.append(field('Date', 'date', holiday.date, { max: 10, placeholder: 'YYYY-MM-DD' }), field('Label', 'label', holiday.label, { max: 80 }), field('Opens', 'opens', holiday.opens, { max: 5 }), field('Closes', 'closes', holiday.closes, { max: 5 }), check('Closed all day', 'closed', holiday.closed), remove);
      $('#holiday-fields').append(row);
    });
    $('#category-fields').replaceChildren();
    draft.menu.categories.forEach(category => {
      const row = node('div', 'category-editor-row');
      row.dataset.id = category.id;
      const remove = node('button', 'remove-button', 'Remove');
      remove.setAttribute('aria-label', 'Remove category ' + category.name);
      remove.addEventListener('click', () => {
        draft = readForm();
        if (draft.menu.categories.length === 1) return message('Keep at least one category.');
        if (draft.menu.items.some(item => item.category === category.id)) return message('Move or remove the dishes in this category first.');
        draft.menu.categories = draft.menu.categories.filter(item => item.id !== category.id);
        populateEditor();
      });
      row.append(field('Category name', 'name', category.name, { max: 100, required: true }), remove);
      $('#category-fields').append(row);
    });
    $('#menu-complete').checked = draft.menu.complete;
    $('#item-fields').replaceChildren();
    draft.menu.items.forEach((item, index) => {
      const card = node('div', 'item-editor-card');
      card.dataset.id = item.id;
      const title = node('div', 'card-title');
      title.append(node('h4', '', item.name || 'New dish'));
      const remove = node('button', 'remove-button', 'Remove');
      remove.setAttribute('aria-label', 'Remove dish ' + (item.name || String(index + 1)));
      remove.addEventListener('click', () => { draft = readForm(); draft.menu.items = draft.menu.items.filter(entry => entry.id !== item.id); populateEditor(); });
      title.append(remove);
      const fields = node('div', 'field-grid');
      fields.append(field('Dish name', 'name', item.name, { max: 150, required: true }));
      const catWrapper = node('label', 'form-field');
      const select = node('select');
      select.dataset.key = 'category';
      draft.menu.categories.forEach(category => { const option = node('option', '', category.name); option.value = category.id; option.selected = category.id === item.category; select.append(option); });
      catWrapper.append(node('span', '', 'Category'), select);
      fields.append(catWrapper, field('Description', 'description', item.description, { multiline: true, wide: true }), field('Price in USD', 'price', item.price, { max: 12, inputMode: 'decimal', placeholder: 'Leave blank if unknown' }), check('Item and price confirmed', 'confirmed', item.confirmed));
      card.append(title, fields);
      $('#item-fields').append(card);
    });
    const services = $('#services-fields');
    services.replaceChildren();
    const groups = [
      ['reservations', 'Reservations URL', 'url', 'Reservations confirmed', [['byPhone', 'Phone reservations use the confirmed restaurant phone']]],
      ['catering', 'Catering URL', 'url', 'Catering confirmed', []],
      ['giftCards', 'Gift card URL', 'url', 'Gift cards confirmed', []],
      ['careers', 'Careers URL', 'url', 'Careers confirmed', []],
      ['newsletter', 'Newsletter form URL', 'action', 'Newsletter confirmed', []],
      ['menuPdf', 'Menu PDF URL', 'url', 'Menu PDF confirmed', []]
    ];
    groups.forEach(([group, label, key, confirm, extras]) => {
      services.append(field(label, key, draft.services[group][key], { group, type: 'url', placeholder: 'https://', wide: true }));
      extras.forEach(([extraKey, extraLabel]) => services.append(check(extraLabel, extraKey, draft.services[group][extraKey], group)));
      services.append(check(confirm, 'confirmed', draft.services[group].confirmed, group));
    });
    services.append(field('Catering summary', 'summary', draft.services.catering.summary, { group: 'catering', multiline: true, wide: true }));
    services.append(field('Catering email', 'email', draft.services.catering.email, { group: 'catering', type: 'email' }));
    services.append(field('Gift card provider', 'provider', draft.services.giftCards.provider, { group: 'giftCards' }));
    services.append(field('Careers summary', 'summary', draft.services.careers.summary, { group: 'careers', multiline: true, wide: true }));
    services.append(field('Newsletter email field name', 'emailField', draft.services.newsletter.emailField, { group: 'newsletter', help: 'The field name the email service expects. Often “email”.' }));
    $('#social-fields').replaceChildren();
    draft.services.social.forEach((item, index) => {
      const row = node('div', 'social-row');
      const remove = node('button', 'remove-button', 'Remove');
      remove.addEventListener('click', () => { draft = readForm(); draft.services.social.splice(index, 1); populateEditor(); });
      row.append(field('Name', 'label', item.label, { max: 40 }), field('URL', 'url', item.url, { type: 'url' }), check('Confirmed', 'confirmed', item.confirmed), remove);
      $('#social-fields').append(row);
    });
    $('#specials-fields').replaceChildren();
    draft.services.specials.forEach((item, index) => {
      const card = node('div', 'special-card');
      const title = node('div', 'card-title');
      title.append(node('h4', '', item.name || 'New special'));
      const remove = node('button', 'remove-button', 'Remove');
      remove.addEventListener('click', () => { draft = readForm(); draft.services.specials.splice(index, 1); populateEditor(); });
      title.append(remove);
      const fields = node('div', 'field-grid');
      fields.append(field('Name', 'name', item.name, { max: 80 }), field('Expires', 'expires', item.expires, { max: 10, placeholder: 'YYYY-MM-DD' }), field('Description', 'description', item.description, { multiline: true, wide: true }), check('Confirmed', 'confirmed', item.confirmed));
      card.append(title, fields);
      $('#specials-fields').append(card);
    });
    message('');
  }
  function readChecks(root, target) {
    $$('[data-key]', root).forEach(control => {
      if (control.dataset.svc) return;
      target[control.dataset.key] = control.type === 'checkbox' ? control.checked : control.value.trim();
    });
  }
  function readForm() {
    const next = clone(draft);
    $$('[data-key]', $('#basics-fields')).forEach(control => { next.restaurant[control.dataset.key] = control.type === 'checkbox' ? control.checked : control.value.trim(); });
    next.hours = $$('.hours-editor-row').map(row => ({ day: row.dataset.day, text: $('[data-key=text]', row).value.trim(), opens: $('[data-key=opens]', row).value.trim(), closes: $('[data-key=closes]', row).value.trim(), confirmed: $('[data-key=confirmed]', row).checked }));
    if ($('#holidays-reviewed').checked) {
      next.holidays = $$('.holiday-row').map(row => ({ date: $('[data-key=date]', row).value.trim(), label: $('[data-key=label]', row).value.trim(), opens: $('[data-key=opens]', row).value.trim(), closes: $('[data-key=closes]', row).value.trim(), closed: $('[data-key=closed]', row).checked }));
    } else next.holidays = null;
    next.menu.categories = $$('.category-editor-row').map(row => { const previous = draft.menu.categories.find(category => category.id === row.dataset.id) || {}; return Object.assign({}, previous, { id: row.dataset.id, name: $('[data-key=name]', row).value.trim() }); });
    next.menu.complete = $('#menu-complete').checked;
    next.menu.items = $$('.item-editor-card').map(card => {
      const previous = draft.menu.items.find(item => item.id === card.dataset.id) || {};
      const item = Object.assign({}, previous, { id: card.dataset.id });
      $$('[data-key]', card).forEach(control => { item[control.dataset.key] = control.type === 'checkbox' ? control.checked : control.value.trim(); });
      return item;
    });
    $$('[data-svc]', $('#services-fields')).forEach(control => { next.services[control.dataset.svc][control.dataset.key] = control.type === 'checkbox' ? control.checked : control.value.trim(); });
    next.services.social = $$('.social-row').map(row => ({ label: $('[data-key=label]', row).value.trim(), url: $('[data-key=url]', row).value.trim(), confirmed: $('[data-key=confirmed]', row).checked }));
    next.services.specials = $$('.special-card').map(card => ({ name: $('[data-key=name]', card).value.trim(), description: $('[data-key=description]', card).value.trim(), expires: $('[data-key=expires]', card).value.trim(), confirmed: $('[data-key=confirmed]', card).checked }));
    return next;
  }
  function openEditor() {
    if (!content) return;
    lastFocused = document.activeElement;
    draft = clone(content);
    populateEditor();
    switchTab('basics');
    dialog.showModal();
    document.body.classList.add('dialog-open');
    $('#close-editor').focus();
  }
  function switchTab(name, moveFocus = false) {
    $$('.editor-tabs button').forEach(button => {
      const selected = button.dataset.tab === name;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) button.focus();
    });
    $$('[role=tabpanel]', dialog).forEach(panel => { panel.hidden = panel.id !== 'panel-' + name; });
    message('');
  }

  $$('[data-open-editor]').forEach(button => button.addEventListener('click', openEditor));
  $('#close-editor').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); if (lastFocused) lastFocused.focus(); });
  $$('.editor-tabs button').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  $('.editor-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = $$('.editor-tabs button');
    let index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    switchTab(tabs[index].dataset.tab, true);
  });
  $('#editor-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      const next = validate(readForm());
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
      catch { return message('This browser could not save the preview. Download the content file instead.'); }
      content = next;
      draft = clone(next);
      render();
      $('#preview-status').textContent = 'Saved on this browser only';
      message('Saved. Close the editor to review this browser preview.');
      toast('Browser preview saved. Shared site unchanged.');
    } catch (error) { message(error.message); }
  });
  $('#add-category').addEventListener('click', () => { draft = readForm(); draft.menu.categories.push({ id: uniqueId('category'), name: 'New category' }); populateEditor(); });
  $('#add-item').addEventListener('click', () => { draft = readForm(); draft.menu.items.unshift({ id: uniqueId('dish'), category: draft.menu.categories[0].id, name: '', description: '', price: '', confirmed: false }); populateEditor(); });
  $('#add-social').addEventListener('click', () => { draft = readForm(); draft.services.social.push({ label: '', url: '', confirmed: false }); populateEditor(); switchTab('services'); });
  $('#add-special').addEventListener('click', () => { draft = readForm(); draft.services.specials.push({ name: '', description: '', expires: '', confirmed: false }); populateEditor(); switchTab('services'); });
  $('#add-holiday').addEventListener('click', () => { draft = readForm(); if (!Array.isArray(draft.holidays)) draft.holidays = []; draft.holidays.push({ date: '', label: '', closed: true, opens: '', closes: '' }); populateEditor(); switchTab('hours'); });
  $('#export-content').addEventListener('click', () => {
    try {
      const next = validate(readForm());
      const blob = new Blob([JSON.stringify(next, null, 2) + '\n'], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = node('a');
      link.href = url;
      link.download = 'content.json';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      message('Content file exported. The hosted site has not changed.');
    } catch (error) { message(error.message); }
  });
  $('#import-content').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 1000000) throw new Error('Choose a content file smaller than 1 MB.');
      draft = validate(JSON.parse(await file.text()));
      populateEditor();
      message('File imported for review. Save the browser preview to apply it on this device.');
    } catch (error) { message('Could not import: ' + error.message); }
    event.target.value = '';
  });
  $('#reset-preview').addEventListener('click', () => { $('#reset-confirm').hidden = false; });
  $('#cancel-reset').addEventListener('click', () => { $('#reset-confirm').hidden = true; });
  $('#confirm-reset').addEventListener('click', () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    content = clone(hostedContent);
    draft = clone(content);
    render();
    populateEditor();
    $('#reset-confirm').hidden = true;
    $('#preview-status').textContent = 'Using hosted content';
    message('Restored the hosted content on this browser.');
    toast('Hosted content restored.');
  });

  $('#category-filters').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button || !content) return;
    activeCategory = button.dataset.category;
    renderMenu();
  });
  document.addEventListener('click', event => {
    const path = event.target.closest('[data-menu-path]');
    if (!path || !content) return;
    if (!content.menu.categories.some(category => category.id === path.dataset.menuPath)) return;
    event.preventDefault();
    activeCategory = path.dataset.menuPath;
    searchTerm = '';
    $('#menu-search').value = '';
    render();
    $('#menu-list').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  function showAll() { searchTerm = ''; activeCategory = 'all'; $('#menu-search').value = ''; render(); }
  $('#show-all-menu').addEventListener('click', showAll);
  $('#menu-search').addEventListener('input', event => { searchTerm = event.target.value.trim(); renderMenu(); });
  $('#empty-action').addEventListener('click', () => {
    if (emptyMode === 'broaden') { activeCategory = 'all'; render(); }
    else showAll();
    $('#menu-search').focus();
  });
  $('#copy-address').addEventListener('click', async () => {
    const address = content.restaurant.address + ', ' + content.restaurant.cityLine;
    try { await navigator.clipboard.writeText(address); $('#copy-status').textContent = 'Address copied.'; }
    catch {
      const range = document.createRange();
      range.selectNodeContents($('#visit-address'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      $('#copy-status').textContent = 'Address selected. Use your device’s Copy action.';
    }
  });

  async function init() {
    try {
      const response = await fetch('content.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('Content unavailable');
      hostedContent = validate(await response.json());
      content = clone(hostedContent);
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) { content = validate(JSON.parse(saved)); $('#preview-status').textContent = 'Using this browser’s saved preview'; }
      } catch { toast('A saved preview could not be loaded. Showing hosted content.'); }
      render();
    } catch (error) {
      const banner = node('div', 'error-banner', 'The menu content could not load. Please reload the page. Restaurant details remain unconfirmed.');
      document.querySelector('main').prepend(banner);
      console.error('Content loading failed:', error.message);
    }
  }
  init();
})();
