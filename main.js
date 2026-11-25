// ====== CONFIGURACIÓN — revisar antes de publicar ======
const CONFIG = {
  whatsapp: '584129536542', // solo números, con código de país
  correo: 'agenciacasamiranda@gmail.com',
  formulario: 'https://formsubmit.co/ajax/agenciacasamiranda@gmail.com',
  redes: { instagram: 'https://www.instagram.com/agenciacasamiranda/' },
};

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Rebaño del hero: 25 ovejas, una rosa que brinca; las demás se vuelven rosa un instante al pasarles por encima
(() => {
  const caja = document.getElementById('rebano');
  if (!caja) return;
  const rosa = 17;
  for (let i = 0; i < 25; i++) {
    const img = document.createElement('img');
    img.src = i === rosa ? 'assets/oveja-rosa.png' : 'assets/oveja-sombra.png';
    img.alt = '';
    if (i === rosa) img.classList.add('es-rosa');
    else img.addEventListener('mouseenter', () => {
      img.src = 'assets/oveja-rosa.png';
      setTimeout(() => { img.src = 'assets/oveja-sombra.png'; }, 700);
    });
    caja.appendChild(img);
  }
})();

// Aparición al hacer scroll
(() => {
  const els = document.querySelectorAll('.revela');
  if (reducido || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('visto')); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach((e, i) => { e.style.transitionDelay = `${(i % 4) * 80}ms`; io.observe(e); });
})();

// Videos de los casos: se reproducen en silencio cuando están a la vista; al tocarlos se abren con sonido
(() => {
  const vids = document.querySelectorAll('.caso video');
  if (!reducido && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
    }), { threshold: 0.4 });
    vids.forEach((v) => io.observe(v));
  }
  const visor = document.getElementById('visor');
  const vv = visor.querySelector('video');
  let casoAnterior = null;
  const cerrar = () => {
    vv.pause();
    vv.removeAttribute('src');
    vv.load();
    visor.hidden = true;
    document.body.style.overflow = '';
    if (casoAnterior) casoAnterior.focus();
  };
  document.querySelectorAll('.caso').forEach((c) => c.addEventListener('click', () => {
    casoAnterior = c;
    vv.src = c.dataset.video; visor.hidden = false; document.body.style.overflow = 'hidden';
    vv.muted = false;
    vv.play().catch(() => {});
    visor.querySelector('.visor__cerrar').focus();
  }));
  visor.addEventListener('click', (e) => { if (e.target === visor || e.target.closest('.visor__cerrar')) cerrar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !visor.hidden) cerrar(); });
})();

// Enlaces de contacto
document.querySelectorAll('[data-wa]').forEach((a) => { a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(a.dataset.wa)}`; a.target = '_blank'; a.rel = 'noopener'; });
document.querySelectorAll('[data-correo]').forEach((a) => { a.href = `mailto:${CONFIG.correo}?subject=${encodeURIComponent('Quiero agendar una reunión con Casa Miranda')}`; });
document.querySelectorAll('[data-red]').forEach((a) => { const u = CONFIG.redes[a.dataset.red]; if (u) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; } });

// Los botones de cada servicio dejan marcado ese servicio en el formulario
document.querySelectorAll('[data-servicio]').forEach((b) => b.addEventListener('click', () => {
  const r = document.querySelector(`input[name="servicio"][value="${b.dataset.servicio}"]`);
  if (r) r.checked = true;
}));

// Formulario: valida todos los campos y envía la solicitud por correo
(() => {
  const f = document.getElementById('formulario');
  const error = document.getElementById('f-error');
  const ok = document.getElementById('f-ok');
  const boton = f.querySelector('button[type="submit"]');
  const campos = [
    ['nombre', 'Nombre y apellido'],
    ['marca', 'Marca'],
    ['correo', 'Correo'],
    ['whatsapp', 'WhatsApp'],
    ['servicio', '¿Qué te interesa?'],
    ['perfil', '¿Con cuál te identificas?'],
    ['fecha', 'Fecha preferida'],
    ['hora', 'Horario'],
    ['mensaje', '¿Qué necesita tu marca?'],
  ];

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const faltan = [];
    campos.forEach(([nombre, etiqueta]) => {
      if (nombre === 'servicio') {
        const radios = f.querySelectorAll('input[name="servicio"]');
        const malo = !d.servicio;
        radios.forEach((radio) => radio.setAttribute('aria-invalid', malo ? 'true' : 'false'));
        if (malo) faltan.push(etiqueta);
        return;
      }

      const el = f.elements.namedItem(nombre);
      const valor = typeof d[nombre] === 'string' ? d[nombre].trim() : '';
      const malo = !valor || (nombre === 'correo' && !el.validity.valid);
      el.setAttribute('aria-invalid', malo ? 'true' : 'false');
      if (malo) faltan.push(etiqueta);
    });

    if (faltan.length) {
      error.textContent = `Completa todos los campos obligatorios antes de enviar: ${faltan.join(', ')}.`;
      error.focus();
      return;
    }

    error.textContent = '';
    ok.hidden = true;
    boton.disabled = true;
    boton.setAttribute('aria-busy', 'true');
    const textoBoton = boton.innerHTML;
    boton.textContent = 'Enviando...';

    const datos = {
      _subject: `Nueva solicitud web · ${d.marca.trim()}`,
      _replyto: d.correo.trim(),
      'Nombre y apellido': d.nombre.trim(),
      Marca: d.marca.trim(),
      Correo: d.correo.trim(),
      WhatsApp: d.whatsapp.trim(),
      '¿Qué te interesa?': d.servicio,
      '¿Con cuál te identificas?': d.perfil,
      'Fecha preferida': d.fecha,
      Horario: d.hora,
      '¿Qué necesita tu marca?': d.mensaje.trim(),
    };

    try {
      const respuesta = await fetch(CONFIG.formulario, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();

      if (!respuesta.ok || String(resultado.success).toLowerCase() !== 'true') {
        throw new Error(resultado.message || 'El servicio de correo rechazó la solicitud.');
      }

      ok.hidden = false;
      ok.focus();
    } catch (e) {
      console.error('No se pudo enviar la solicitud del formulario.', e);
      error.textContent = `No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos a ${CONFIG.correo}.`;
      error.focus();
    } finally {
      boton.disabled = false;
      boton.removeAttribute('aria-busy');
      boton.innerHTML = textoBoton;
    }
  });
})();
