// Scrollytelling con GSAP (ScrollTrigger) y Lenis.
// Atributos que reconoce:
//   [data-escena][data-tono]  sección: al entrar cambia la iluminación global (--tono)
//   [data-anim]               aparece desde abajo cuando su escena entra en pantalla
//   [data-revelar]            título revelado con un barrido (scrub)
//   [data-mono]               monograma gigante con parallax
//   [data-foco]               haz de luz que cruza la escena
//   [data-contador]           texto "03 / 06" que se actualiza con la escena activa
//   [data-progreso]           barra de progreso de lectura

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

let iniciado = false;

export function iniciarCine(): void {
  if (iniciado) return;
  iniciado = true;

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raiz = document.documentElement;

  if (!reducido) {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const escenas = gsap.utils.toArray<HTMLElement>('[data-escena]');
  const contador = document.querySelector<HTMLElement>('[data-contador]');
  const total = escenas.filter((e) => e.dataset.indice).length;

  const activar = (escena: HTMLElement) => {
    const tono = escena.dataset.tono;
    if (tono) gsap.to(raiz, { '--tono': tono, duration: reducido ? 0 : 1.1, ease: 'power2.out', overwrite: 'auto' });
    if (contador) {
      const i = escena.dataset.indice;
      contador.textContent = i ? `${i.padStart(2, '0')} / ${String(total).padStart(2, '0')}` : '';
      contador.classList.toggle('opacity-0', !i);
    }
  };

  escenas.forEach((escena) => {
    ScrollTrigger.create({
      trigger: escena,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter: () => activar(escena),
      onEnterBack: () => activar(escena),
    });

    if (reducido) return;

    const anims = escena.querySelectorAll<HTMLElement>('[data-anim]');
    if (anims.length) {
      gsap.from(anims, {
        y: 46,
        autoAlpha: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: escena, start: 'top 72%', toggleActions: 'play none none reverse' },
      });
    }

    escena.querySelectorAll<HTMLElement>('[data-revelar]').forEach((titulo) => {
      gsap.fromTo(
        titulo,
        { clipPath: 'inset(-10% 100% -10% 0%)', x: -20 },
        {
          clipPath: 'inset(-10% -5% -10% 0%)',
          x: 0,
          ease: 'none',
          scrollTrigger: { trigger: escena, start: 'top 85%', end: 'top 25%', scrub: 0.6 },
        },
      );
    });

    escena.querySelectorAll<HTMLElement>('[data-mono]').forEach((mono) => {
      gsap.fromTo(
        mono,
        { yPercent: 18, scale: 1.12, autoAlpha: 0.2 },
        {
          yPercent: -18,
          scale: 0.94,
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: { trigger: escena, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });

    escena.querySelectorAll<HTMLElement>('[data-foco]').forEach((foco) => {
      gsap.fromTo(
        foco,
        { xPercent: -60, autoAlpha: 0 },
        {
          xPercent: 60,
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: { trigger: escena, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });
  });

  const barra = document.querySelector<HTMLElement>('[data-progreso]');
  if (barra) {
    gsap.fromTo(
      barra,
      { scaleX: 0 },
      { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } },
    );
  }

  // Recalcula cuando cargan las fuentes del sistema o cambia la orientación.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
