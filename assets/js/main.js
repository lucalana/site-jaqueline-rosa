(() => {
  const d = document, root = d.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = d.getElementById('header');
  const bar = d.querySelector('.progress');
  const burger = d.getElementById('burger');
  const nav = d.getElementById('nav');
  d.getElementById('ano').textContent = new Date().getFullYear();

  // Reveal on scroll
  const items = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el, i) => {
      if (!el.style.getPropertyValue('--i')) el.style.transitionDelay = (i % 3) * 80 + 'ms';
      io.observe(el);
    });
  } else items.forEach(el => el.classList.add('is-visible'));

  // Scroll: header, progress, light parallax (transform only)
  const par = [...d.querySelectorAll('[data-parallax]')];
  let ticking = false;
  const update = () => {
    const y = scrollY, h = root.scrollHeight - innerHeight;
    header.classList.toggle('is-scrolled', y > 40);
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (!reduce) par.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const k = parseFloat(el.dataset.parallax);
      el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - innerHeight / 2) * k).toFixed(1) + 'px,0)';
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();

  // Mobile menu
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Palavra por palavra: títulos (revelação em máscara) e manifesto (acende ao rolar)
  const wrapWords = (root, cls, inner) => {
    let k = 0;
    const walk = (node) => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.append(t); return; }
          const w = d.createElement('span'); w.className = cls;
          if (inner) { const i = d.createElement('span'); i.textContent = t; w.append(i); } else w.textContent = t;
          w.style.setProperty('--k', k++); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(root);
  };
  d.querySelectorAll('[data-words]').forEach(el => {
    el.setAttribute('aria-label', el.textContent.trim());
    wrapWords(el, 'w', true);
    el.querySelectorAll('.w').forEach(w => w.setAttribute('aria-hidden', 'true'));
  });
  const scrub = [...d.querySelectorAll('[data-scrub]')];
  scrub.forEach(el => wrapWords(el, 's', false));
  const scrubWords = scrub.map(el => [...el.querySelectorAll('.s')]);
  const runScrub = () => {
    scrub.forEach((el, i) => {
      const ws = scrubWords[i];
      if (reduce) { ws.forEach(w => w.classList.add('on')); return; }
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * .88 - r.top) / (innerHeight * .45 + r.height * .5)));
      const n = Math.round(p * ws.length);
      ws.forEach((w, j) => w.classList.toggle('on', j < n));
    });
  };
  const inview = d.querySelectorAll('[data-words],.reveal-img,.hair');
  if ('IntersectionObserver' in window && !reduce) {
    // clip-path zera a área visível: para imagens, observa o contêiner pai
    const io2 = new IntersectionObserver((es) => es.forEach(e => {
      if (e.isIntersecting) { (e.target._t || e.target).classList.add('in-view'); io2.unobserve(e.target); }
    }), { threshold: .2 });
    inview.forEach(el => {
      if (el.classList.contains('reveal-img')) { el.parentElement._t = el; io2.observe(el.parentElement); }
      else io2.observe(el);
    });
  } else inview.forEach(el => el.classList.add('in-view'));
  addEventListener('scroll', () => requestAnimationFrame(runScrub), { passive: true });
  runScrub();

  // Brilho nos cartões (mouse e toque)
  d.querySelectorAll('.pillars li').forEach(li => {
    const mv = (e) => { const r = li.getBoundingClientRect(); li.style.setProperty('--mx', (e.clientX - r.left) + 'px'); li.style.setProperty('--my', (e.clientY - r.top) + 'px'); };
    li.addEventListener('pointermove', mv);
    li.addEventListener('pointerdown', (e) => { mv(e); li.classList.add('touch'); setTimeout(() => li.classList.remove('touch'), 900); });
  });

  // Form -> WhatsApp
  const form = d.getElementById('form');
  const note = d.getElementById('form-note');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = form.nome.value.trim(), msg = form.msg.value.trim(), tel = form.tel.value.trim();
    form.nome.parentElement.classList.toggle('invalid', !nome);
    form.msg.parentElement.classList.toggle('invalid', !msg);
    if (!nome || !msg) { (!nome ? form.nome : form.msg).focus(); return; }
    const text = 'Olá, Jaqueline! Meu nome é ' + nome + '.' + (tel ? ' Meu telefone: ' + tel + '.' : '') + '\n\n' + msg;
    window.open('https://api.whatsapp.com/send/?phone=5535999042196&text=' + encodeURIComponent(text) + '&type=phone_number&app_absent=0', '_blank', 'noopener');
    note.textContent = 'Obrigada pelo contato!';
    form.reset();
  });
  form.querySelectorAll('input,textarea').forEach(i => i.addEventListener('input', () => i.parentElement.classList.remove('invalid')));
})();
