'use strict';
(() => {
  const STORAGE_KEY = 'bombay-palace-content-v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clone = value => JSON.parse(JSON.stringify(value));
  let content, hostedContent, draft, activeCategory = 'all', searchTerm = '', lastFocused;
  let toastTimer;
  const dialog = $('#editor-dialog');

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function uniqueId(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,10); }
  function safeHttps(value) {
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
    catch { return null; }
  }
  function validate(data) {
    const fail = message => { throw new Error(message); };
    const string = (value, label, max = 500) => {
      if (typeof value !== 'string' || value.length > max) fail(label + ' must be text of at most ' + max + ' characters.');
    };
    if (!data || data.schemaVersion !== 1 || !data.restaurant || !data.menu || !Array.isArray(data.hours)) fail('Choose a valid version 1 Bombay Palace content file.');
    const r = data.restaurant;
    ['name','tagline','headline','intro','address','cityLine','phone','orderingUrl','notice'].forEach(key => string(r[key], key));
    ['name','address','cityLine','headline'].forEach(key => { if (!r[key].trim()) fail('Restaurant ' + key + ' cannot be blank.'); });
    if (typeof r.phoneConfirmed !== 'boolean' || typeof r.orderingConfirmed !== 'boolean') fail('Contact confirmation fields must be true or false.');
    if (r.phoneConfirmed && !/^\+?[0-9() .-]{7,25}$/.test(r.phone.trim())) fail('Enter a valid phone number before marking it confirmed.');
    if (r.orderingUrl && !safeHttps(r.orderingUrl)) fail('Ordering links must be complete HTTPS URLs.');
    if (r.orderingConfirmed && !safeHttps(r.orderingUrl)) fail('Enter an HTTPS ordering link before marking it confirmed.');
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    if (data.hours.length !== 7 || new Set(data.hours.map(h => h.day)).size !== 7) fail('Hours must contain all seven days once.');
    data.hours.forEach(h => { if (!days.includes(h.day) || typeof h.confirmed !== 'boolean') fail('Check the days and confirmation fields in hours.'); string(h.text,'Hours',200); if (h.confirmed && !h.text.trim()) fail('Enter hours or “Closed” before confirming ' + h.day + '.'); });
    const m = data.menu;
    if (typeof m.complete !== 'boolean' || !Array.isArray(m.categories) || !Array.isArray(m.items) || m.categories.length < 1 || m.categories.length > 40 || m.items.length > 300) fail('Menu needs 1–40 categories and no more than 300 dishes.');
    ['sourceLabel','sourceUrl','sourceChecked'].forEach(key => string(m[key],key));
    if (m.sourceUrl && !safeHttps(m.sourceUrl)) fail('Menu source must be a complete HTTPS URL.');
    const catIds = new Set(), itemIds = new Set();
    m.categories.forEach(c => { string(c.id,'Category ID',100); string(c.name,'Category name',100); if (!c.id || c.id === 'all' || !c.name.trim() || catIds.has(c.id)) fail('Categories need unique IDs and nonempty names.'); catIds.add(c.id); });
    m.items.forEach(item => {
      ['id','category','name','description','price'].forEach(key => string(item[key],'Dish ' + key,key === 'description' ? 500 : 150));
      if (!item.id || itemIds.has(item.id) || !item.name.trim() || !catIds.has(item.category)) fail('Each dish needs a unique ID, a name, and an existing category.');
      if (typeof item.confirmed !== 'boolean') fail('Dish confirmation must be true or false.');
      if (item.price && !/^\d{1,5}(\.\d{1,2})?$/.test(item.price)) fail('Use a plain number for the price of ' + item.name + ', such as 12.50, or leave it blank.');
      itemIds.add(item.id);
    });
    return data;
  }
  function toast(message) {
    clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4000);
  }
  function render() {
    const r = content.restaurant;
    $$('[data-name]').forEach(el => { el.replaceChildren(document.createTextNode(r.name),node('small','', 'INDIAN CUISINE')); });
    $('[data-footer-name]').textContent = r.name;
    document.title = r.name + ' | Columbus, Georgia · Private Prototype';
    $('#tagline').textContent = r.tagline.toUpperCase();
    const headline = r.headline.split('\n');
    $('#hero-title').replaceChildren(document.createTextNode(headline[0]));
    if (headline.length > 1) $('#hero-title').append(node('br'),node('em','',headline.slice(1).join(' ')));
    $('#intro').textContent = r.intro;
    $$('[data-address]').forEach(el => { el.textContent = r.address; });
    $$('[data-city]').forEach(el => { el.textContent = r.cityLine; });
    const directions = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(r.address + ', ' + r.cityLine);
    $$('[data-directions]').forEach(el => { el.href = directions; });
    $('#restaurant-notice').textContent = r.notice;
    $('#hours-list').replaceChildren();
    content.hours.forEach(hour => {
      const row = node('div','hours-row');
      row.append(node('dt','',hour.day),node('dd',hour.confirmed ? 'confirmed' : '',hour.confirmed ? hour.text : 'To be confirmed'));
      $('#hours-list').append(row);
    });
    const allHours = content.hours.every(h => h.confirmed);
    $('#hours-status').textContent = allHours ? 'RESTAURANT CONFIRMED' : 'TO BE CONFIRMED';
    $('#hours-note').textContent = allHours ? 'Holiday hours may vary. Please check with the restaurant.' : 'Some or all hours have not yet been confirmed. Please verify before travelling.';
    $('#phone-link').hidden = !r.phoneConfirmed;
    $('#phone-pending').hidden = r.phoneConfirmed;
    if (r.phoneConfirmed) { $('#phone-link').textContent = r.phone; $('#phone-link').href = 'tel:' + r.phone.replace(/[^+0-9]/g,''); }
    else $('#phone-link').removeAttribute('href');
    $('#ordering-link').hidden = !r.orderingConfirmed;
    $('#ordering-note').textContent = r.orderingConfirmed ? 'Use the restaurant-confirmed ordering link.' : 'Online ordering details are awaiting confirmation.';
    if (r.orderingConfirmed) $('#ordering-link').href = safeHttps(r.orderingUrl); else $('#ordering-link').removeAttribute('href');
    $('#category-filters').replaceChildren();
    if (activeCategory !== 'all' && !content.menu.categories.some(c => c.id === activeCategory)) activeCategory = 'all';
    [{id:'all',name:'All dishes'},...content.menu.categories].forEach(category => {
      const button = node('button','filter-button',category.name);
      button.type = 'button'; button.dataset.category = category.id;
      button.setAttribute('aria-pressed',String(activeCategory === category.id));
      button.addEventListener('click',() => { activeCategory = category.id; $$('.filter-button').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.category === activeCategory))); renderMenu(); });
      $('#category-filters').append(button);
    });
    const sourceUrl = safeHttps(content.menu.sourceUrl);
    $('#menu-source').hidden = !sourceUrl;
    if (sourceUrl) { $('#menu-source').href = sourceUrl; $('#menu-source').title = content.menu.sourceLabel + ' · checked ' + content.menu.sourceChecked; }
    const disclaimerText = (content.menu.complete ? 'Menu marked complete by the editor. ' : 'This is a selected menu preview, not the complete menu. ') + (content.menu.items.some(item => !item.confirmed) ? 'Starred prices and unconfirmed dishes come from an online listing. Items, availability, and prices need restaurant confirmation; dine-in prices may differ. ' : 'Menu details have been marked confirmed by the editor. Prices and availability may change. ');
    const source = $('#menu-source');
    $('#menu-disclaimer').replaceChildren(document.createTextNode(disclaimerText),source);
    $('.menu-heading-note .status-tag').textContent = content.menu.items.some(item => !item.confirmed) ? 'SELECTED DISHES · CONFIRMATION NEEDED' : (content.menu.complete ? 'COMPLETE MENU · MARKED CONFIRMED' : 'SELECTED DISHES · MARKED CONFIRMED');
    renderMenu();
  }
  function renderMenu() {
    const term = searchTerm.toLocaleLowerCase();
    const visible = content.menu.items.filter(item => (activeCategory === 'all' || item.category === activeCategory) && (item.name + ' ' + item.description).toLocaleLowerCase().includes(term));
    $('#menu-grid').replaceChildren();
    visible.forEach(item => {
      const article = node('article','menu-item');
      const category = content.menu.categories.find(c => c.id === item.category);
      article.append(node('div','dish-category',category.name + (item.confirmed ? '' : ' · TO CONFIRM')));
      const heading = node('div','dish-heading');
      heading.append(node('h3','',item.name));
      const price = node('span',item.price ? 'dish-price' : 'dish-price pending-price',item.price ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(item.price)) : 'Price to confirm');
      if (item.price && !item.confirmed) price.append(node('sup','','*'));
      heading.append(price); article.append(heading,node('p','',item.description)); $('#menu-grid').append(article);
    });
    $('#menu-count').textContent = visible.length + (visible.length === 1 ? ' dish' : ' dishes') + (searchTerm ? ' matching “' + searchTerm + '”' : ' in this preview');
    $('#menu-empty').hidden = visible.length > 0;
    $('#show-all-menu').hidden = activeCategory === 'all' && !searchTerm;
    const paths = $$('[data-menu-path]');
    paths.forEach(button => {
      const category = content.menu.categories.find(c => c.id === button.dataset.menuPath);
      button.disabled = !category;
      button.setAttribute('aria-pressed',String(button.dataset.menuPath === activeCategory));
    });
    const selected = content.menu.categories.find(c => c.id === activeCategory);
    const pendingMenu = content.menu.items.some(item => !item.confirmed);
    const confirmationNote = pendingMenu ? 'Availability and prices still need restaurant confirmation.' : 'Ask the restaurant about current availability.';
    $('#starter-result').textContent = selected ? 'Exploring ' + selected.name.toLowerCase() + ': ' + visible.length + (visible.length === 1 ? ' matching dish' : ' matching dishes') + ' below. ' + confirmationNote : 'Choose a style to explore the matching dishes below. ' + (pendingMenu ? 'Menu details still need restaurant confirmation.' : 'Ask the restaurant about current availability.');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      $('#menu-grid').classList.remove('refreshing');
      void $('#menu-grid').offsetWidth;
      $('#menu-grid').classList.add('refreshing');
    }
  }
  function field(label, key, value, options = {}) {
    const wrapper = node('label','form-field' + (options.wide ? ' span-two' : ''));
    const control = node(options.multiline ? 'textarea' : 'input');
    if (!options.multiline) control.type = options.type || 'text';
    control.value = value; control.dataset.key = key; control.maxLength = options.max || 500;
    if (options.placeholder) control.placeholder = options.placeholder;
    if (options.inputMode) control.inputMode = options.inputMode;
    if (options.required) control.required = true;
    wrapper.append(node('span','',label),control);
    if (options.help) wrapper.append(node('small','',options.help));
    return wrapper;
  }
  function check(label, key, checked) {
    const wrapper = node('label','check-label'); const control = node('input');
    control.type = 'checkbox'; control.checked = checked; control.dataset.key = key;
    wrapper.append(control,document.createTextNode(label)); return wrapper;
  }
  function populateEditor() {
    const basics = $('#basics-fields'); basics.replaceChildren();
    const r = draft.restaurant;
    [
      ['Restaurant name','name',{required:true}],['Location / cuisine line','tagline',{}],
      ['Homepage headline','headline',{multiline:true,wide:true,help:'Use a new line before the italic second line.',required:true}],
      ['Welcome text','intro',{multiline:true,wide:true}],['Street address','address',{required:true}],['City, state, ZIP','cityLine',{required:true}],
      ['Phone number','phone',{type:'tel',placeholder:'Awaiting confirmation'}],['Ordering URL','orderingUrl',{type:'url',placeholder:'https://…',help:'Leave blank until the restaurant confirms the link.'}],
      ['Review notice','notice',{wide:true,multiline:true}]
    ].forEach(([label,key,options]) => basics.append(field(label,key,r[key],options)));
    basics.append(check('Phone number confirmed by the restaurant','phoneConfirmed',r.phoneConfirmed),check('Ordering link confirmed by the restaurant','orderingConfirmed',r.orderingConfirmed));
    $('#hours-fields').replaceChildren();
    draft.hours.forEach(hour => { const row = node('div','hours-editor-row'); row.dataset.day = hour.day; row.append(node('span','',hour.day),field('Hours','text',hour.text,{max:200,placeholder:'Not yet confirmed'}),check('Confirmed','confirmed',hour.confirmed)); $('#hours-fields').append(row); });
    $('#category-fields').replaceChildren();
    draft.menu.categories.forEach(category => {
      const row = node('div','category-editor-row'); row.dataset.id = category.id;
      const remove = node('button','remove-button','Remove'); remove.type = 'button'; remove.setAttribute('aria-label','Remove category ' + category.name);
      remove.addEventListener('click',() => {
        draft = readForm();
        if (draft.menu.categories.length === 1) return message('Keep at least one category.');
        if (draft.menu.items.some(item => item.category === category.id)) return message('Move or remove the dishes in this category before removing it.');
        draft.menu.categories = draft.menu.categories.filter(c => c.id !== category.id); populateEditor();
      });
      row.append(field('Category name','name',category.name,{max:100,required:true}),remove); $('#category-fields').append(row);
    });
    $('#menu-complete').checked = draft.menu.complete;
    $('#item-fields').replaceChildren();
    draft.menu.items.forEach((item,index) => {
      const card = node('div','item-editor-card'); card.dataset.id = item.id;
      const title = node('div','card-title'); title.append(node('h4','',item.name || 'New dish'));
      const remove = node('button','remove-button','Remove'); remove.type='button'; remove.setAttribute('aria-label','Remove dish ' + (item.name || String(index + 1)));
      remove.addEventListener('click',() => { draft=readForm(); draft.menu.items=draft.menu.items.filter(i=>i.id!==item.id); populateEditor(); });
      title.append(remove); const fields=node('div','field-grid');
      fields.append(field('Dish name','name',item.name,{max:150,required:true}));
      const catWrapper = node('label','form-field'); const select=node('select'); select.dataset.key='category';
      draft.menu.categories.forEach(c => { const option=node('option','',c.name); option.value=c.id; option.selected=c.id===item.category; select.append(option); });
      catWrapper.append(node('span','','Category'),select); fields.append(catWrapper,field('Description','description',item.description,{multiline:true,wide:true}),field('Price in USD','price',item.price,{max:12,inputMode:'decimal',placeholder:'Leave blank if unknown'}),check('Item and price confirmed','confirmed',item.confirmed));
      card.append(title,fields); $('#item-fields').append(card);
    });
    message('');
  }
  function readForm() {
    const next = clone(draft);
    $$('[data-key]',$('#basics-fields')).forEach(control => { next.restaurant[control.dataset.key] = control.type === 'checkbox' ? control.checked : control.value.trim(); });
    next.hours = $$('.hours-editor-row').map(row => ({day:row.dataset.day,text:$('[data-key=text]',row).value.trim(),confirmed:$('[data-key=confirmed]',row).checked}));
    next.menu.categories = $$('.category-editor-row').map(row => ({id:row.dataset.id,name:$('[data-key=name]',row).value.trim()}));
    next.menu.complete = $('#menu-complete').checked;
    next.menu.items = $$('.item-editor-card').map(card => {
      const item = {id:card.dataset.id};
      $$('[data-key]',card).forEach(control => { item[control.dataset.key] = control.type === 'checkbox' ? control.checked : control.value.trim(); });
      return item;
    });
    return next;
  }
  function message(text) { $('#editor-message').textContent=text; }
  function openEditor() {
    if (!content) return;
    lastFocused = document.activeElement; draft = clone(content); populateEditor();
    switchTab('basics'); dialog.showModal(); document.body.classList.add('dialog-open'); $('#close-editor').focus();
  }
  function switchTab(name, moveFocus = false) {
    $$('.editor-tabs button').forEach(button => { const selected = button.dataset.tab===name; button.setAttribute('aria-selected',String(selected)); button.tabIndex=selected ? 0 : -1; if(selected && moveFocus) button.focus(); });
    $$('[role=tabpanel]',dialog).forEach(panel => { panel.hidden=panel.id !== 'panel-' + name; });
    message('');
  }
  $$('[data-open-editor]').forEach(button => button.addEventListener('click',openEditor));
  $('#close-editor').addEventListener('click',() => dialog.close());
  dialog.addEventListener('close',() => { document.body.classList.remove('dialog-open'); if(lastFocused) lastFocused.focus(); });
  $$('.editor-tabs button').forEach(button => button.addEventListener('click',() => switchTab(button.dataset.tab)));
  $('.editor-tabs').addEventListener('keydown',event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const tabs=$$('.editor-tabs button'); let i=tabs.indexOf(document.activeElement); if(i<0) return;
    event.preventDefault(); i=event.key==='Home' ? 0 : event.key==='End' ? tabs.length-1 : (i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length; switchTab(tabs[i].dataset.tab,true);
  });
  $('#editor-form').addEventListener('submit',event => {
    event.preventDefault();
    try {
      const next = validate(readForm());
      try { localStorage.setItem(STORAGE_KEY,JSON.stringify(next)); }
      catch { return message('This browser could not save the preview. Use Content file → Download to keep your changes.'); }
      content=next;draft=clone(next);render();$('#preview-status').textContent='Saved on this browser only';message('Saved. Close the editor to review your browser preview.');toast('Browser preview saved. Shared site unchanged.');
    } catch(error) { message(error.message); }
  });
  $('#add-category').addEventListener('click',() => { draft=readForm();draft.menu.categories.push({id:uniqueId('category'),name:'New category'});populateEditor();$$('.category-editor-row').at(-1).querySelector('input').focus(); });
  $('#add-item').addEventListener('click',() => { draft=readForm();draft.menu.items.unshift({id:uniqueId('dish'),category:draft.menu.categories[0].id,name:'',description:'',price:'',confirmed:false});populateEditor();$('.item-editor-card input').focus(); });
  $('#export-content').addEventListener('click',() => {
    try {
      const next=validate(readForm()); const blob=new Blob([JSON.stringify(next,null,2)+'\n'],{type:'application/json'}); const url=URL.createObjectURL(blob); const link=node('a');link.href=url;link.download='content.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Content file exported. The hosted site has not changed.');
    } catch(error) { message(error.message); }
  });
  $('#import-content').addEventListener('change',async event => {
    const file=event.target.files[0];if(!file)return;
    try { if(file.size>1000000) throw new Error('Choose a content file smaller than 1 MB.');const imported=validate(JSON.parse(await file.text()));draft=imported;populateEditor();message('File imported for review. Save the browser preview to apply it on this device.'); }
    catch(error) {message('Could not import: '+error.message);}
    event.target.value='';
  });
  $('#reset-preview').addEventListener('click',()=>{$('#reset-confirm').hidden=false;});
  $('#cancel-reset').addEventListener('click',()=>{$('#reset-confirm').hidden=true;});
  $('#confirm-reset').addEventListener('click',()=>{
    try {localStorage.removeItem(STORAGE_KEY);}catch{}
    content=clone(hostedContent);draft=clone(content);render();populateEditor();$('#reset-confirm').hidden=true;$('#preview-status').textContent='Using hosted content';message('Restored the hosted content on this browser.');toast('Hosted content restored.');
  });
  $$('[data-menu-path]').forEach(button => button.addEventListener('click',() => {
    if (!content || !content.menu.categories.some(c => c.id === button.dataset.menuPath)) return;
    activeCategory = button.dataset.menuPath; searchTerm = ''; $('#menu-search').value = '';
    $$('.filter-button').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.category === activeCategory)));
    renderMenu();
    $('.menu-tools').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    const activeFilter = $$('.filter-button').find(b=>b.dataset.category===activeCategory);
    if(activeFilter) activeFilter.focus({preventScroll:true});
  }));
  $('#show-all-menu').addEventListener('click',()=>{searchTerm='';activeCategory='all';$('#menu-search').value='';render();});
  $('#menu-search').addEventListener('input',event=>{searchTerm=event.target.value.trim();renderMenu();});
  $('#clear-search').addEventListener('click',()=>{searchTerm='';activeCategory='all';$('#menu-search').value='';render();$('#menu-search').focus();});
  $('#mobile-toggle').addEventListener('click',()=>{const expanded=$('#mobile-toggle').getAttribute('aria-expanded')==='true';$('#mobile-toggle').setAttribute('aria-expanded',String(!expanded));$('#mobile-toggle').setAttribute('aria-label',expanded?'Open navigation':'Close navigation');$('#mobile-nav').hidden=expanded;});
  $$('#mobile-nav a,#mobile-nav button').forEach(el=>el.addEventListener('click',()=>{$('#mobile-nav').hidden=true;$('#mobile-toggle').setAttribute('aria-expanded','false');$('#mobile-toggle').setAttribute('aria-label','Open navigation');}));
  $('#copy-address').addEventListener('click',async()=>{
    const address=content.restaurant.address+', '+content.restaurant.cityLine;
    try {await navigator.clipboard.writeText(address);$('#copy-status').textContent='Address copied.';}
    catch {const range=document.createRange();range.selectNodeContents($('.location-panel h3'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('#copy-status').textContent='Address selected. Use your device’s Copy action.';}
  });
  async function init(){
    try {
      const response=await fetch('content.json',{cache:'no-cache'});if(!response.ok)throw new Error('Content unavailable');hostedContent=validate(await response.json());content=clone(hostedContent);
      try {const saved=localStorage.getItem(STORAGE_KEY);if(saved){content=validate(JSON.parse(saved));$('#preview-status').textContent='Using this browser’s saved preview';}}
      catch{toast('A saved preview could not be loaded. Showing hosted content.');}
      render();
    }catch(error){const banner=node('div','error-banner','The menu content could not load. Please reload the page. Restaurant details remain unconfirmed.');document.querySelector('main').prepend(banner);console.error('Content loading failed:',error.message);}
  }
  init();
})();
