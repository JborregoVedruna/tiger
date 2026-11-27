// Paneles superpuestos al lienzo de Phaser: cuaderno de deducción, pista, descarte,
// acusación y resolución. Se construyen con DOM + Tailwind para que sean cómodos en móvil.

import {
  CATEGORIAS,
  ELEMENTOS,
  HISTORIA_PREDETERMINADA,
  NOMBRE_CATEGORIA,
  porId,
  type Arma,
  type Categoria,
  type Lugar,
} from '../../data/caso.ts';
import {
  acusar,
  afirmacionesObtenidas,
  alternarMarca,
  candidatos,
  esTestimonio,
  eventos,
  guardarNotas,
  intentarDescarte,
  misionDelDescarte,
  nuevaPartida,
  obtener,
  puedeAcusar,
  quedaMargen,
  siguienteMision,
  TOTAL_MISIONES,
  VIDAS_INICIALES,
  vidas,
} from '../core/estado.ts';
import { busUi } from '../core/eventos.ts';
import type { Marca, Seleccion } from '../core/tipos.ts';
import { MISIONES } from '../misiones.ts';
import { ruta } from '../../lib/ruta.ts';
import { $, h } from './dom.ts';

const ETIQUETA_MARCA: Record<Marca, string> = { ninguna: 'Marcar', sospecha: 'Sospecho', principal: 'Principal' };

const BTN_PRIMARIO =
  'min-h-12 w-full rounded-xl bg-champan-500 px-5 font-sans text-base font-bold text-noche-950 shadow-lg shadow-fucsia-600/20 transition active:scale-[0.98] active:bg-champan-600 disabled:cursor-not-allowed disabled:bg-noche-700 disabled:text-crema/40 disabled:shadow-none';
const BTN_SECUNDARIO =
  'min-h-12 w-full rounded-xl border border-fucsia-600/60 bg-fucsia-900/50 px-5 font-sans text-base font-semibold text-crema transition active:scale-[0.98]';
const BTN_FANTASMA = 'min-h-11 rounded-lg px-3 font-sans text-sm font-semibold text-cian-400 underline-offset-4 hover:underline';
const ETIQUETA = 'font-sans text-[11px] font-bold tracking-[0.2em] text-cian-400 uppercase';

// ---------------------------------------------------------------- Modal

let cerrarActual: (() => void) | null = null;

export function abrirModal(contenido: HTMLElement, etiqueta: string): () => void {
  cerrarActual?.();
  const raiz = $('#modal-raiz');
  const panel = h(
    'div',
    {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': etiqueta,
      class:
        'modal-panel relative max-h-[88svh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl border border-fucsia-600/40 bg-noche-900 px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl shadow-fucsia-600/20 sm:rounded-3xl',
    },
    h('div', { class: 'mx-auto mb-4 h-1 w-12 rounded-full bg-fucsia-600/50 sm:hidden', 'aria-hidden': 'true' }),
    contenido,
  );
  const fondo = h(
    'div',
    { class: 'modal-fondo fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6' },
    panel,
  );
  fondo.addEventListener('click', (e) => {
    if (e.target === fondo) cerrar();
  });
  const alTeclado = (e: KeyboardEvent) => {
    if (e.key === 'Escape') cerrar();
  };
  document.addEventListener('keydown', alTeclado);
  raiz.append(fondo);
  busUi.emit('modal', { abierto: true });
  requestAnimationFrame(() => fondo.classList.add('abierto'));
  panel.querySelector<HTMLElement>('button, [href], textarea')?.focus({ preventScroll: true });

  function cerrar() {
    document.removeEventListener('keydown', alTeclado);
    fondo.remove();
    if (cerrarActual === cerrar) {
      cerrarActual = null;
      busUi.emit('modal', { abierto: false });
    }
  }
  cerrarActual = cerrar;
  return cerrar;
}

function aviso(mensaje: string): void {
  const t = $('#toast');
  t.textContent = mensaje;
  t.classList.remove('opacity-0', 'translate-y-4');
  window.clearTimeout(Number(t.dataset.timer));
  t.dataset.timer = String(window.setTimeout(() => t.classList.add('opacity-0', 'translate-y-4'), 2600));
}

function encabezado(antetitulo: string, titulo: string): HTMLElement {
  return h(
    'header',
    { class: 'mb-4' },
    h('p', { class: ETIQUETA }, antetitulo),
    h('h2', { class: 'mt-1 font-display text-2xl leading-tight font-bold text-crema' }, titulo),
  );
}

function nombreCon(cat: Categoria, id: string): string {
  const e = porId(id);
  if (cat === 'arma') return (e as Arma).conArticulo;
  if (cat === 'lugar') return (e as Lugar).conArticulo;
  return e.nombre;
}

// ---------------------------------------------------------------- Formulario (respuestas escritas)

export interface CampoFormulario {
  id: string;
  etiqueta: string;
  tipo: 'numero' | 'texto';
  placeholder?: string;
}

/**
 * Panel con campos de texto para responder un puzle. `validar` devuelve null si la respuesta es
 * correcta (el panel se cierra y se llama a `alAcertar`) o un mensaje de error para mostrar.
 */
export function abrirFormulario(opciones: {
  antetitulo: string;
  titulo: string;
  descripcion?: string;
  campos: CampoFormulario[];
  textoBoton: string;
  textoCancelar?: string;
  validar: (valores: Record<string, string>) => string | null;
  alAcertar: () => void;
}): void {
  const error = h('p', { class: 'mt-3 min-h-5 font-sans text-sm text-fucsia-600', role: 'alert', 'aria-live': 'assertive' });
  const entradas = new Map<string, HTMLInputElement>();
  const campos = opciones.campos.map((c) => {
    const input = h('input', {
      id: `campo-${c.id}`,
      type: c.tipo === 'numero' ? 'number' : 'text',
      inputmode: c.tipo === 'numero' ? 'numeric' : 'text',
      autocomplete: 'off',
      autocapitalize: c.tipo === 'texto' ? 'characters' : 'off',
      spellcheck: 'false',
      placeholder: c.placeholder,
      class:
        'mt-1 min-h-12 w-full rounded-xl border border-noche-600 bg-noche-950 px-3 font-sans text-base text-crema placeholder:text-crema/30 focus:border-cian-500 focus:outline-none',
    }) as HTMLInputElement;
    entradas.set(c.id, input);
    return h('label', { class: 'mt-4 block', for: `campo-${c.id}` }, h('span', { class: ETIQUETA }, c.etiqueta), input);
  });
  const enviar = h('button', { type: 'submit', class: `${BTN_PRIMARIO} mt-5` }, opciones.textoBoton);
  let cerrar = () => {};
  const formulario = h(
    'form',
    {
      novalidate: true,
      onsubmit: (e: Event) => {
        e.preventDefault();
        const valores = Object.fromEntries([...entradas].map(([k, v]) => [k, v.value]));
        const mensaje = opciones.validar(valores);
        if (mensaje) {
          error.textContent = mensaje;
          return;
        }
        cerrar();
        opciones.alAcertar();
      },
    },
    encabezado(opciones.antetitulo, opciones.titulo),
    opciones.descripcion ? h('p', { class: 'font-sans text-sm leading-relaxed text-crema/70' }, opciones.descripcion) : null,
    campos,
    error,
    enviar,
    h('button', { type: 'button', class: `${BTN_SECUNDARIO} mt-3`, onclick: () => cerrar() }, opciones.textoCancelar ?? 'Cancelar'),
  );
  cerrar = abrirModal(formulario, opciones.titulo);
}

// ---------------------------------------------------------------- Pista

function mostrarPista(i: number, recienResuelta = false): void {
  const p = obtener();
  const m = p.misiones[i];
  if (!m.pista) return;
  const pista = m.pista;
  const pendiente = m.estado === 'descarte';
  const testimonio = esTestimonio(i);
  let cerrar = () => {};

  const cuerpo = h(
    'div',
    {},
    encabezado(`Misión ${MISIONES[i].numeral} de ${TOTAL_MISIONES} · ${MISIONES[i].referencia}`, pista.titulo),
    h(
      'div',
      { class: 'space-y-3 rounded-2xl border border-cian-500/25 bg-noche-800/80 p-4 font-display text-[17px] leading-relaxed text-crema/95' },
      pista.parrafos.map((t, k) => h('p', { class: k === 0 ? 'text-crema/70 italic' : '' }, t)),
      pista.condicionales?.length
        ? h(
            'ol',
            { class: 'mt-2 space-y-3' },
            pista.condicionales.map((t) =>
              h(
                'li',
                { class: 'flex gap-3 rounded-xl bg-fucsia-950/70 p-3' },
                h('span', { class: 'font-sans text-sm font-bold text-fucsia-600' }, '◆'),
                h('span', {}, t),
              ),
            ),
          )
        : null,
    ),
    pendiente
      ? h(
          'p',
          { class: 'mt-4 font-sans text-sm text-crema/70' },
          'Ahora descarta un elemento (sospechoso, vehículo o franja horaria) que las pistas dejen fuera de sospecha.',
        )
      : null,
    testimonio && !p.resuelta
      ? h(
          'p',
          { class: 'mt-4 font-sans text-sm text-crema/70' },
          'Junta las afirmaciones de los tres testimonios y crúzalas con los dos candidatos que te quedan en cada categoría: solo una combinación las cumple todas.',
        )
      : null,
    h(
      'div',
      { class: 'mt-5 grid gap-3' },
      pendiente ? h('button', { class: BTN_PRIMARIO, onclick: () => mostrarDescarte(i) }, 'Pasar al descarte') : null,
      !pendiente && puedeAcusar()
        ? h('button', { class: BTN_PRIMARIO, onclick: () => mostrarAcusacion() }, 'Resolver el caso: Acusar')
        : null,
      !pendiente && recienResuelta && siguienteMision(i) >= 0
        ? h(
            'button',
            { class: BTN_PRIMARIO, onclick: () => irALaSiguiente(i, cerrar) },
            `Siguiente: ${MISIONES[siguienteMision(i)].numeral} · ${MISIONES[siguienteMision(i)].titulo}`,
          )
        : null,
      h('button', { class: BTN_SECUNDARIO, onclick: () => cerrar() }, pendiente ? 'Descartar más tarde' : 'Volver al mapa'),
    ),
  );
  cerrar = abrirModal(cuerpo, pista.titulo);
}

function irALaSiguiente(desde: number, cerrar: () => void): void {
  const sig = siguienteMision(desde);
  cerrar();
  if (sig >= 0) busUi.emit('ir-a-mision', { mision: sig });
}

// ---------------------------------------------------------------- Selector de chips

interface Selector {
  el: HTMLElement;
  valor(): string | null;
  bloquear(id: string): void;
}

function selector(cat: Categoria, ids: string[], alCambiar: () => void, nombreGrupo: string): Selector {
  let elegido: string | null = null;
  const bloqueados = new Set<string>();
  const botones = new Map<string, HTMLButtonElement>();

  const pintar = () => {
    for (const [id, b] of botones) {
      const activo = elegido === id;
      const bloq = bloqueados.has(id);
      b.setAttribute('aria-checked', String(activo));
      b.disabled = bloq;
      b.className = [
        'min-h-12 rounded-xl border px-3 py-2 text-left font-sans text-sm font-semibold transition active:scale-[0.98]',
        bloq
          ? 'border-fucsia-600 bg-fucsia-950/70 text-crema/40 line-through'
          : activo
            ? 'border-champan-400 bg-champan-500 text-noche-950'
            : 'border-noche-600 bg-noche-800 text-crema',
      ].join(' ');
    }
  };

  const lista = h(
    'div',
    { class: 'grid grid-cols-2 gap-2', role: 'radiogroup', 'aria-label': nombreGrupo },
    ids.map((id) => {
      const b = h(
        'button',
        {
          type: 'button',
          role: 'radio',
          onclick: () => {
            elegido = elegido === id ? null : id;
            pintar();
            alCambiar();
          },
        },
        porId(id).nombre,
      );
      botones.set(id, b);
      return b;
    }),
  );
  pintar();

  return {
    el: h('fieldset', { class: 'mt-4' }, h('legend', { class: `${ETIQUETA} mb-2` }, NOMBRE_CATEGORIA[cat].plural), lista),
    valor: () => elegido,
    bloquear(id) {
      bloqueados.add(id);
      if (elegido === id) elegido = null;
      pintar();
    },
  };
}

// ---------------------------------------------------------------- Descarte

function mostrarDescarte(i: number): void {
  const p = obtener();
  const mensaje = h('div', { class: 'mt-4 space-y-2', 'aria-live': 'polite' });
  const confirmar = h('button', { class: BTN_PRIMARIO, disabled: true }, 'Confirmar descarte') as HTMLButtonElement;
  let elegido: string | null = null;
  const bloqueados = new Set<string>();
  const botones = new Map<string, HTMLButtonElement>();

  const pintar = () => {
    for (const [id, b] of botones) {
      const cat = porId(id).categoria;
      const descartado = !candidatos(cat).includes(id);
      const lleno = !quedaMargen(cat);
      const bloq = descartado || lleno || bloqueados.has(id);
      const activo = elegido === id;
      b.disabled = bloq;
      b.setAttribute('aria-checked', String(activo));
      b.className = [
        'min-h-11 rounded-xl border px-3 py-2 text-left font-sans text-[13px] leading-snug font-semibold transition active:scale-[0.98]',
        descartado
          ? 'border-noche-700 bg-noche-900 text-crema/30 line-through'
          : bloqueados.has(id)
            ? 'border-fucsia-600 bg-fucsia-950/70 text-crema/40 line-through'
            : lleno
              ? 'border-noche-700 bg-noche-900 text-crema/40'
              : activo
                ? 'border-champan-400 bg-champan-500 text-noche-950'
                : 'border-noche-600 bg-noche-800 text-crema',
      ].join(' ');
    }
    confirmar.disabled = !elegido;
  };

  const grupos = CATEGORIAS.map((cat) => {
    const lleno = !quedaMargen(cat);
    return h(
      'fieldset',
      { class: 'mt-4' },
      h(
        'legend',
        { class: `${ETIQUETA} mb-2 flex w-full items-baseline justify-between gap-2` },
        NOMBRE_CATEGORIA[cat].plural,
        h(
          'span',
          { class: 'font-normal tracking-normal text-crema/50 normal-case' },
          lleno ? 'Ya solo quedan 2: no se puede descartar más' : `${candidatos(cat).length} en juego`,
        ),
      ),
      h(
        'div',
        { class: 'grid grid-cols-2 gap-2', role: 'radiogroup', 'aria-label': NOMBRE_CATEGORIA[cat].plural },
        ELEMENTOS[cat].map((e) => {
          const b = h(
            'button',
            {
              type: 'button',
              role: 'radio',
              onclick: () => {
                elegido = elegido === e.id ? null : e.id;
                mensaje.replaceChildren();
                pintar();
              },
            },
            e.nombre,
          ) as HTMLButtonElement;
          botones.set(e.id, b);
          return b;
        }),
      ),
    );
  });
  pintar();

  let cerrar = () => {};
  confirmar.addEventListener('click', () => {
    const id = elegido;
    const r = intentarDescarte(i, id);
    mensaje.replaceChildren();
    if (r.ok) {
      cerrar();
      const sig = siguienteMision(i);
      if (sig >= 0) {
        aviso(`Descarte anotado. Siguiente: misión ${MISIONES[sig].numeral}, ${MISIONES[sig].titulo}.`);
        busUi.emit('ir-a-mision', { mision: sig });
      } else {
        aviso(puedeAcusar() ? 'Descarte anotado. ¡Ya puedes resolver el caso!' : 'Descarte anotado.');
      }
      return;
    }
    if (r.motivo === 'contradice' && id) {
      bloqueados.add(id);
      elegido = null;
      pintar();
      mensaje.append(
        h(
          'p',
          { class: 'rounded-xl border border-fucsia-600 bg-fucsia-950/80 p-3 font-sans text-sm text-crema', role: 'alert' },
          h('strong', { class: 'text-fucsia-600' }, 'Las evidencias lo contradicen. '),
          `Descartar ${nombreCon(r.categoria, id)} contradice las evidencias del caso de Tiger. Elige otro elemento.`,
        ),
      );
    } else if (r.motivo === 'pronto' && id) {
      bloqueados.add(id);
      elegido = null;
      pintar();
      mensaje.append(
        h(
          'p',
          { class: 'rounded-xl border border-champan-500 bg-noche-800 p-3 font-sans text-sm text-crema', role: 'alert' },
          h('strong', { class: 'text-champan-400' }, 'Todavía no. '),
          `Begoña no tiene pruebas suficientes para descartar ${nombreCon(r.categoria, id)}. Elige otro elemento.`,
        ),
      );
    } else if (r.motivo === 'limite') {
      mensaje.append(h('p', { class: 'font-sans text-sm text-fucsia-600' }, 'En esa categoría ya solo quedan 2 candidatos. Elige de otra.'));
    } else {
      mensaje.append(h('p', { class: 'font-sans text-sm text-fucsia-600' }, 'Elige exactamente un elemento.'));
    }
  });

  const cuerpo = h(
    'div',
    {},
    encabezado(`Misión ${MISIONES[i].numeral} · Fase de descarte`, 'Descarta 1 elemento'),
    h(
      'p',
      { class: 'font-sans text-sm leading-relaxed text-crema/70' },
      `Elige un sospechoso, un vehículo o una franja horaria que siga en juego. Si eliges algo que las evidencias señalan, el caso te avisará. Al final deben quedar 2 candidatos en cada categoría.`,
    ),
    p.misiones[i].pista?.senalado
      ? h(
          'p',
          { class: 'mt-2 font-sans text-xs text-crema/50' },
          'Consejo: relee la pista; señala a alguien o algo fuera de sospecha.',
        )
      : null,
    grupos,
    mensaje,
    h(
      'div',
      { class: 'mt-5 grid gap-3' },
      confirmar,
      h('button', { class: BTN_SECUNDARIO, onclick: () => mostrarPista(i) }, 'Releer la pista'),
    ),
  );
  cerrar = abrirModal(cuerpo, 'Fase de descarte');
}

// ---------------------------------------------------------------- Acusación

function mostrarAcusacion(): void {
  if (obtener().resuelta) {
    mostrarVictoria();
    return;
  }
  if (!puedeAcusar()) {
    aviso('Todavía faltan pistas por reunir.');
    return;
  }
  const acusarBtn = h('button', { class: BTN_PRIMARIO, disabled: true }, 'Acusar') as HTMLButtonElement;
  const actualizar = () => {
    acusarBtn.disabled = !CATEGORIAS.every((c) => selectores[c].valor());
  };
  const selectores = Object.fromEntries(
    CATEGORIAS.map((c) => [c, selector(c, candidatos(c), actualizar, `Acusar: ${NOMBRE_CATEGORIA[c].singular}`)]),
  ) as Record<Categoria, Selector>;

  acusarBtn.addEventListener('click', () => {
    const sel = Object.fromEntries(CATEGORIAS.map((c) => [c, selectores[c].valor()!])) as Seleccion;
    const r = acusar(sel);
    if (r.correcto) mostrarVictoria();
    else mostrarDerrota(sel, r.fallos);
  });

  const condicionales = afirmacionesObtenidas();
  const cuerpo = h(
    'div',
    {},
    encabezado('Resolver el caso', '¿Quién llevó a Tiger al veterinario?'),
    h(
      'p',
      { class: 'font-sans text-sm leading-relaxed text-crema/70' },
      'Señala quién fue, en qué vehículo y a qué hora, entre los candidatos que siguen en pie.',
    ),
    condicionales.length
      ? h(
          'details',
          { class: 'mt-3 rounded-xl border border-cian-500/30 bg-noche-800/70 p-3 font-sans text-sm text-crema/85', open: true },
          h('summary', { class: 'cursor-pointer font-semibold text-cian-400' }, 'Lo que dicen los testimonios'),
          h('ol', { class: 'mt-2 list-decimal space-y-1 pl-5' }, condicionales.map((t) => h('li', {}, t))),
        )
      : null,
    CATEGORIAS.map((c) => selectores[c].el),
    h('div', { class: 'mt-5 grid gap-3' }, acusarBtn, h('button', { class: BTN_SECUNDARIO, onclick: () => cerrar() }, 'Seguir pensando')),
  );
  const cerrar = abrirModal(cuerpo, 'Acusación final');
}

function mostrarVictoria(): void {
  const p = obtener();
  const s = porId(p.solucion.sospechoso);
  const a = porId(p.solucion.arma) as Arma;
  const l = porId(p.solucion.lugar) as Lugar;

  const resumen = p.misiones.map((m, i) => {
    const info = MISIONES[i];
    const texto =
      m.descarte
        ? `Te permitió descartar ${nombreCon(porId(m.descarte).categoria, m.descarte)}.`
        : `Aportó ${m.pista?.condicionales?.length ?? 0} ${m.pista?.condicionales?.length === 1 ? 'afirmación' : 'afirmaciones'} que, junto a las demás, solo dejaban una combinación.`;
    return h(
      'li',
      { class: 'rounded-xl bg-noche-800/70 p-3' },
      h('p', { class: 'font-sans text-[11px] font-bold tracking-[0.15em] text-cian-400 uppercase' }, `${info.numeral} · ${info.titulo}`),
      h('p', { class: 'mt-1 font-sans text-sm text-crema/80' }, texto),
    );
  });

  const cuerpo = h(
    'div',
    {},
    encabezado('Caso cerrado', `${s.nombre}, ${a.modo}, ${l.enLugar}.`),
    h(
      'div',
      { class: 'space-y-3 font-display text-[17px] leading-relaxed text-crema/95' },
      ...(p.modo === 'predeterminado'
        ? HISTORIA_PREDETERMINADA.resolucion.map((t) => h('p', {}, t))
        : [h('p', {}, s.comoFue), h('p', {}, a.comoFue), h('p', {}, l.comoFue)]),
      h(
        'p',
        { class: 'text-crema/70 italic' },
        p.acusaciones === 1
          ? 'Lo resolviste a la primera. Cuando llegó la policía, solo tuvo que firmar tu informe.'
          : `Necesitaste ${p.acusaciones} acusaciones, pero la verdad salió a la luz antes de que llegara la policía.`,
      ),
    ),
    h('h3', { class: `${ETIQUETA} mt-6` }, 'Cómo encajaron las pistas'),
    h('ol', { class: 'mt-3 space-y-2' }, resumen),
    h(
      'div',
      { class: 'mt-6 grid gap-3' },
      h('button', { class: BTN_PRIMARIO, onclick: () => empezarDeNuevo() }, p.modo === 'predeterminado' ? 'Volver a jugar' : 'Nueva partida con otro misterio'),
      h('a', { class: `${BTN_SECUNDARIO} grid place-items-center`, href: ruta('/') }, 'Volver al inicio'),
    ),
  );
  abrirModal(cuerpo, 'Caso cerrado');
}

function mostrarDerrota(sel: Seleccion, fallos: Categoria[]): void {
  const frases: Record<Categoria, (id: string) => string> = {
    sospechoso: (id) => `El sospechoso no coincide: ${porId(id).nombre} no llevó a Tiger.`,
    arma: (id) => `El vehículo no coincide: no lo llevaron ${(porId(id) as Arma).modo}.`,
    lugar: (id) => `La hora no coincide: no lo llevaron ${(porId(id) as Lugar).enLugar}.`,
  };
  const cuerpo = h(
    'div',
    {},
    encabezado('La acusación no se sostiene', 'Tiger te mira con desprecio'),
    h(
      'ul',
      { class: 'space-y-2' },
      fallos.map((c) =>
        h('li', { class: 'rounded-xl border border-fucsia-600 bg-fucsia-950/70 p-3 font-sans text-sm text-crema' }, frases[c](sel[c])),
      ),
    ),
    h(
      'p',
      { class: 'mt-4 font-sans text-sm text-crema/70' },
      'Vuelve a leer los testimonios: cada afirmación descarta combinaciones.',
    ),
    h(
      'div',
      { class: 'mt-5 grid gap-3' },
      h('button', { class: BTN_PRIMARIO, onclick: () => mostrarAcusacion() }, 'Reintentar acusación'),
      h('button', { class: BTN_SECUNDARIO, onclick: () => empezarDeNuevo() }, 'Nueva partida con un misterio distinto'),
    ),
  );
  abrirModal(cuerpo, 'Acusación fallida');
}

function empezarDeNuevo(): void {
  cerrarActual?.();
  cerrarCuaderno();
  const p = nuevaPartida();
  aviso(p.modo === 'predeterminado' ? 'La historia vuelve a empezar. Suerte, detective.' : 'Nuevo misterio en Zahora. Suerte, detective.');
}

// ---------------------------------------------------------------- Cuaderno

let confirmandoReinicio = false;

function pintarCuaderno(): void {
  const p = obtener();
  const cuerpo = $('#cuaderno-cuerpo');

  const secciones = CATEGORIAS.map((cat) =>
    h(
      'section',
      { class: 'mb-6' },
      h(
        'h3',
        { class: `${ETIQUETA} mb-2 flex items-baseline justify-between` },
        NOMBRE_CATEGORIA[cat].plural,
        h('span', { class: 'font-normal tracking-normal text-crema/50 normal-case' }, `${candidatos(cat).length} en juego`),
      ),
      h(
        'ul',
        { class: 'divide-y divide-noche-700 overflow-hidden rounded-xl border border-noche-700 bg-noche-800/60' },
        ELEMENTOS[cat].map((e) => {
          const m = misionDelDescarte(e.id);
          const marca = p.marcas[e.id] ?? 'ninguna';
          return h(
            'li',
            { class: 'flex min-h-12 items-center gap-3 px-3 py-2' },
            h(
              'span',
              { class: `flex-1 font-display text-[16px] ${m >= 0 ? 'text-crema/35 line-through decoration-fucsia-600 decoration-2' : 'text-crema'}` },
              e.nombre,
            ),
            m >= 0
              ? h('span', { class: 'font-sans text-[11px] font-semibold text-crema/45' }, `Descartado · M${MISIONES[m].numeral}`)
              : h(
                  'button',
                  {
                    type: 'button',
                    class: [
                      'min-h-9 rounded-full border px-3 font-sans text-xs font-bold transition',
                      marca === 'principal'
                        ? 'border-fucsia-600 bg-fucsia-700 text-crema'
                        : marca === 'sospecha'
                          ? 'border-champan-500 bg-champan-500/15 text-champan-400'
                          : 'border-noche-600 text-crema/50',
                    ].join(' '),
                    'aria-label': `Marca para ${e.nombre}: ${ETIQUETA_MARCA[marca]}`,
                    onclick: () => alternarMarca(e.id),
                  },
                  marca === 'principal' ? '★ Principal' : marca === 'sospecha' ? '? Sospecho' : 'Marcar',
                ),
          );
        }),
      ),
    ),
  );

  const pistas = p.misiones
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m.pista)
    .map(({ m, i }) =>
      h(
        'li',
        {},
        h(
          'button',
          {
            type: 'button',
            class: 'flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-noche-800/70 px-3 text-left font-sans text-sm text-crema',
            onclick: () => {
              cerrarCuaderno();
              mostrarPista(i);
            },
          },
          h('span', {}, `${MISIONES[i].numeral} · ${MISIONES[i].titulo}`),
          h('span', { class: m.estado === 'descarte' ? 'shrink-0 text-fucsia-600' : 'shrink-0 text-cian-400' }, m.estado === 'descarte' ? 'Descartar ›' : 'Leer ›'),
        ),
      ),
    );

  const notas = h('textarea', {
    class:
      'mt-2 min-h-28 w-full rounded-xl border border-noche-600 bg-noche-950 p-3 font-sans text-sm text-crema placeholder:text-crema/30 focus:border-cian-500 focus:outline-none',
    placeholder: 'Escribe aquí tus deducciones…',
    'aria-label': 'Notas libres',
  }) as HTMLTextAreaElement;
  notas.value = p.notasLibres;
  let temporizador = 0;
  notas.addEventListener('input', () => {
    window.clearTimeout(temporizador);
    temporizador = window.setTimeout(() => guardarNotas(notas.value), 300);
  });

  const reinicio = h(
    'button',
    {
      type: 'button',
      class: `${BTN_FANTASMA} mt-2 ${confirmandoReinicio ? 'text-fucsia-600' : ''}`,
      onclick: () => {
        if (confirmandoReinicio) {
          confirmandoReinicio = false;
          empezarDeNuevo();
        } else {
          confirmandoReinicio = true;
          pintarCuaderno();
        }
      },
    },
    confirmandoReinicio ? 'Pulsa otra vez para abandonar este caso y empezar otro' : 'Abandonar y empezar una nueva partida',
  );

  cuerpo.replaceChildren(
    ...secciones,
    h(
      'section',
      { class: 'mb-6' },
      h('h3', { class: `${ETIQUETA} mb-2` }, 'Pistas obtenidas'),
      pistas.length
        ? h('ul', { class: 'space-y-2' }, pistas)
        : h('p', { class: 'font-sans text-sm text-crema/50 italic' }, 'Aún no has resuelto ninguna misión.'),
    ),
    h('section', { class: 'mb-4' }, h('h3', { class: ETIQUETA }, 'Notas libres'), notas),
    reinicio,
  );
}

function abrirCuaderno(): void {
  confirmandoReinicio = false;
  pintarCuaderno();
  const panel = $('#cuaderno');
  panel.classList.remove('translate-x-full');
  panel.setAttribute('aria-hidden', 'false');
  panel.removeAttribute('inert');
  $('#capa-cuaderno').classList.remove('pointer-events-none', 'opacity-0');
  $('#abrir-cuaderno').setAttribute('aria-expanded', 'true');
  $('#cerrar-cuaderno').focus({ preventScroll: true });
}

function cerrarCuaderno(): void {
  const panel = $('#cuaderno');
  panel.classList.add('translate-x-full');
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('inert', '');
  $('#capa-cuaderno').classList.add('pointer-events-none', 'opacity-0');
  $('#abrir-cuaderno').setAttribute('aria-expanded', 'false');
}

function cuadernoAbierto(): boolean {
  return !$('#cuaderno').classList.contains('translate-x-full');
}

// ---------------------------------------------------------------- Barra de acusación

function pintarBarra(): void {
  const p = obtener();
  const barra = $('#barra-acusar');
  const btn = $('#btn-acusar');
  const hechas = p.misiones.filter((m) => m.estado === 'completada').length;
  const visible = p.resuelta || puedeAcusar();
  barra.classList.toggle('hidden', !visible);
  btn.textContent = p.resuelta ? 'Ver la resolución del caso' : 'Resolver el caso: Acusar';
  const v = vidas();
  const corazones = '♥'.repeat(v) + '♡'.repeat(Math.max(0, VIDAS_INICIALES - v));
  $('#estado-caso').textContent = p.perdida
    ? 'Partida perdida'
    : p.resuelta
      ? 'Caso resuelto'
      : `${corazones} · ${hechas === TOTAL_MISIONES ? 'Listo para acusar' : `${hechas}/${TOTAL_MISIONES} misiones`}`;
}

// ---------------------------------------------------------------- Partida perdida

let perdidaMostrada = -1;

function mostrarPartidaPerdida(): void {
  const p = obtener();
  perdidaMostrada = p.semilla;
  const hechas = p.misiones.filter((m) => m.estado === 'completada').length;
  const cuerpo = h(
    'div',
    {},
    encabezado('Sin vidas', 'Has perdido la partida'),
    h(
      'p',
      { class: 'font-sans text-sm leading-relaxed text-crema/75' },
      `Fallaste una respuesta más sin vidas. Quien llevó a Tiger se sale con la suya y Begoña se queda sin saber la verdad. Llegaste a completar ${hechas} de ${TOTAL_MISIONES} misiones.`,
    ),
    h(
      'div',
      { class: 'mt-5 grid gap-3' },
      h('button', { class: BTN_PRIMARIO, onclick: () => empezarDeNuevo() }, p.modo === 'predeterminado' ? 'Volver a intentarlo' : 'Nueva partida'),
      h('a', { class: `${BTN_SECUNDARIO} grid place-items-center`, href: ruta('/') }, 'Volver al inicio'),
    ),
  );
  abrirModal(cuerpo, 'Partida perdida');
}

// ---------------------------------------------------------------- Arranque

export function iniciarOverlay(): void {
  $('#abrir-cuaderno').addEventListener('click', () => (cuadernoAbierto() ? cerrarCuaderno() : abrirCuaderno()));
  $('#cerrar-cuaderno').addEventListener('click', cerrarCuaderno);
  $('#capa-cuaderno').addEventListener('click', cerrarCuaderno);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cuadernoAbierto() && !cerrarActual) cerrarCuaderno();
  });
  $('#btn-acusar').addEventListener('click', mostrarAcusacion);

  eventos.on('cambio', (p) => {
    pintarBarra();
    if (p.perdida && perdidaMostrada !== p.semilla) window.setTimeout(mostrarPartidaPerdida, 1300);
    if (cuadernoAbierto()) pintarCuaderno();
  });
  eventos.on('pista', ({ mision }) => mostrarPista(mision, true));
  busUi.on('ver-pista', ({ mision }) => mostrarPista(mision));
  busUi.on('partida-perdida', () => mostrarPartidaPerdida());
  if (obtener().perdida) mostrarPartidaPerdida();

  pintarBarra();
}
