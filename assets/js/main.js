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
