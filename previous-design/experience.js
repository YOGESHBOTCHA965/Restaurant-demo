'use strict';
/* Small, dependency-free enhancements. Restaurant content stays in content.json. */
(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = Array.from(document.querySelectorAll('[data-spice-button]'));
  const stage = document.querySelector('.spice-stage');
  const notes = {
    cardamom: {name:'Cardamom', profile:'Floral · fragrant · bright', text:'A small pod with a beautifully aromatic personality. An invitation to explore the fragrant side of Indian cooking.'},
    cumin: {name:'Cumin', profile:'Earthy · warm · savory', text:'Little seeds with a warm, earthy character. Get to know one of the familiar aromas of Indian cooking.'},
    chili: {name:'Chili', profile:'Vibrant · warming · bold', text:'A lively note in the spice cabinet. Heat varies from dish to dish—ask the restaurant about the level that suits you.'}
  };
  function chooseSpice(id) {
    const note = notes[id]; if (!note || !stage) return;
    stage.dataset.active = id;
    tabs.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.spiceButton === id)));
    document.querySelectorAll('[data-spice-art]').forEach(art => { art.classList.toggle('is-active',art.dataset.spiceArt === id); });
    document.querySelector('#spice-name').textContent = note.name;
    document.querySelector('#spice-profile').textContent = note.profile;
    document.querySelector('#spice-text').textContent = note.text;
    document.querySelector('#spice-illustration').setAttribute('aria-label','Botanical illustration of ' + note.name.toLowerCase());
  }
  tabs.forEach(button => button.addEventListener('click',() => chooseSpice(button.dataset.spiceButton)));

  // Reveal once, and only when the browser supports both observation and motion.
  const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    root.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) {entry.target.classList.add('is-revealed'); observer.unobserve(entry.target);} });
    },{threshold:0.12});
    revealElements.forEach(element => observer.observe(element));
    reducedMotion.addEventListener('change',event => { if(event.matches){root.classList.remove('motion-ready');observer.disconnect();} });
  }
  // Keep the short navigation in sync with the section being read.
  const navigation = Array.from(document.querySelectorAll('[data-nav-section]'));
  if ('IntersectionObserver' in window) {
    const navigationObserver = new IntersectionObserver(entries => {
      const current = entries.find(entry => entry.isIntersecting);
      if (!current) return;
      navigation.forEach(link => {
        if (link.dataset.navSection === current.target.id) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    },{rootMargin:'-20% 0px -60% 0px',threshold:0});
    ['menu','discover','visit'].forEach(id => navigationObserver.observe(document.getElementById(id)));
  }
  const visual = document.querySelector('.hero-visual');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (visual) {
    let frame = 0, x = 0, y = 0;
    visual.addEventListener('pointermove',event => {
      if (reducedMotion.matches || !finePointer.matches) return;
      const rect=visual.getBoundingClientRect(); x=(event.clientX-rect.left)/rect.width-.5; y=(event.clientY-rect.top)/rect.height-.5;
      if(!frame) frame=requestAnimationFrame(()=>{visual.style.setProperty('--glide-x',(x*9).toFixed(2)+'px');visual.style.setProperty('--glide-y',(y*7).toFixed(2)+'px');frame=0;});
    });
    const reset = () => {cancelAnimationFrame(frame);frame=0;visual.style.setProperty('--glide-x','0px');visual.style.setProperty('--glide-y','0px');};
    visual.addEventListener('pointerleave',reset); reducedMotion.addEventListener('change',reset);
  }
})();
