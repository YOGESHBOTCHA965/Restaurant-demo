'use strict';
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const phone = window.matchMedia('(max-width: 760px)');
  const toggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const topbar = document.querySelector('.topbar');

  function syncOffset() {
    if (!topbar) return;
    root.style.setProperty('--sticky-h', topbar.offsetHeight + 'px');
  }
  syncOffset();
  window.addEventListener('resize', syncOffset);

  function setNav(open) {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav.hidden = !open;
    document.body.classList.toggle('nav-open', open);
    [document.getElementById('main'), document.querySelector('.site-footer'), document.querySelector('.mobile-bottom')].forEach(el => {
      if (el) el.inert = open;
    });
    syncOffset();
  }
  if (toggle) toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  if (mobileNav) {
    mobileNav.addEventListener('click', event => {
      if (event.target.closest('a')) setNav(false);
    });
  }
  document.addEventListener('keydown', event => {
    const lightbox = document.getElementById('lightbox');
    const editor = document.getElementById('editor-dialog');
    if ((lightbox && lightbox.open) || (editor && editor.open)) return;
    if (!mobileNav || mobileNav.hidden) return;
    if (event.key === 'Escape') {
      setNav(false);
      toggle.focus();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [toggle, ...mobileNav.querySelectorAll('a, button')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const navLinks = Array.from(document.querySelectorAll('[data-nav-section]'));
  const navIds = ['story', 'menu', 'gallery', 'visit'];
  let navFrame = 0;
  function syncNavigation() {
    navFrame = 0;
    const line = (parseFloat(getComputedStyle(root).getPropertyValue('--sticky-h')) || 76) + 24;
    let current = null;
    navIds.forEach(id => {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= line) current = id;
    });
    navLinks.forEach(link => {
      if (link.dataset.navSection === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => { if (!navFrame) navFrame = requestAnimationFrame(syncNavigation); }, { passive: true });
  syncNavigation();

  const bar = document.querySelector('.mobile-bottom');
  const heroActions = document.querySelector('.hero-actions');
  if (bar && heroActions && 'IntersectionObserver' in window) {
    const apply = entry => {
      const show = phone.matches && !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle('is-visible', show);
      document.body.classList.toggle('has-bar', show);
    };
    const observer = new IntersectionObserver(([entry]) => apply(entry), { threshold: 0 });
    observer.observe(heroActions);
    phone.addEventListener('change', () => observer.takeRecords().forEach(apply));
  }

  const spiceNotes = {
    cardamom: { name: 'Cardamom', profile: 'Cardamom. Floral, fragrant, bright', text: 'Green pods with a sweet, floral scent. In Indian cooking they often perfume rice, tea, and desserts.' },
    cumin: { name: 'Cumin', profile: 'Cumin. Earthy, warm, savory', text: 'Small seeds with a nutty warmth. Cooks often toast them in hot oil before they go into lentils and vegetables.' },
    chili: { name: 'Chili', profile: 'Chili. Vibrant, warming, bold', text: 'Fresh or dried, chili brings heat and color. Heat changes from dish to dish, so it is worth asking what suits you.' }
  };
  document.querySelectorAll('[data-spice-button]').forEach(button => {
    button.addEventListener('click', () => {
      const note = spiceNotes[button.dataset.spiceButton];
      const stage = document.querySelector('.spice-stage');
      if (!note || !stage) return;
      stage.dataset.active = button.dataset.spiceButton;
      document.querySelectorAll('[data-spice-button]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelectorAll('[data-spice-art]').forEach(art => art.classList.toggle('is-active', art.dataset.spiceArt === button.dataset.spiceButton));
      const name = document.getElementById('spice-name');
      if (name) name.textContent = note.name;
      document.getElementById('spice-profile').textContent = note.profile;
      document.getElementById('spice-text').textContent = note.text;
      document.getElementById('spice-illustration').setAttribute('aria-label', 'Botanical illustration of ' + note.name.toLowerCase());
    });
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCount = document.getElementById('lightbox-count');
  let slide = 0;
  let lastZoom = null;
  const slides = () => Array.from(document.querySelectorAll('.zoom'));
  function showSlide(index) {
    const list = slides();
    if (!list.length || !lightboxImg) return;
    slide = (index + list.length) % list.length;
    const item = list[slide];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.dataset.alt || '';
    lightboxCaption.textContent = item.dataset.caption || '';
    lightboxCount.textContent = (slide + 1) + ' of ' + list.length;
  }
  document.addEventListener('click', event => {
    const zoom = event.target.closest('.zoom');
    if (!zoom || !lightbox) return;
    lastZoom = zoom;
    showSlide(slides().indexOf(zoom));
    lightbox.showModal();
    document.getElementById('lightbox-close').focus();
  });
  document.getElementById('lightbox-close')?.addEventListener('click', () => lightbox.close());
  document.getElementById('lightbox-prev')?.addEventListener('click', () => showSlide(slide - 1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => showSlide(slide + 1));
  lightbox?.addEventListener('close', () => { if (lastZoom) lastZoom.focus(); });
  lightbox?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showSlide(slide - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showSlide(slide + 1); }
  });
  let startX = null;
  lightbox?.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;
    startX = event.clientX;
  });
  lightbox?.addEventListener('pointerup', event => {
    if (startX === null || event.target.closest('button')) { startX = null; return; }
    const delta = event.clientX - startX;
    startX = null;
    if (Math.abs(delta) < 48) return;
    showSlide(slide + (delta < 0 ? 1 : -1));
  });
  if (reduced.matches) root.classList.add('reduced-motion');
})();
