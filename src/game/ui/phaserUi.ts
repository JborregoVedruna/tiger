// Utilidades de interfaz dentro de Phaser: colores, textos nítidos, botones y paneles táctiles.
// Todo el juego se maqueta en un espacio lógico de 400×720 (vertical, pensado para móvil);
// la cámara aplica ZOOM para que el lienzo tenga el doble de píxeles y se vea nítido.

import type { Scene } from 'phaser';

export const ANCHO = 400;
export const ALTO = 720;
export const ZOOM = 2;

export const C = {
  noche950: 0x03141c,
  noche900: 0x062a3a,
  noche800: 0x0b3a4f,
  noche700: 0x124a63,
  noche600: 0x1d6280,
  fucsia900: 0x5c2018,
  fucsia800: 0x8f3324,
  fucsia700: 0xd4553c,
  fucsia600: 0xff7a59,
  champan600: 0xd9a54e,
  champan500: 0xf4c97a,
  champan400: 0xffe3a3,
  cian500: 0x2ec4b6,
  cian400: 0x7ff0e3,
  crema: 0xfdf8ee,
  papel: 0xf3ecdc,
  gris: 0xa9c7cf,
  verde: 0x3ee07a,
  rojo: 0xff4d6d,
};

export const H = {
  noche900: '#062a3a',
  fucsia700: '#d4553c',
  fucsia600: '#ff7a59',
  champan500: '#f4c97a',
  champan400: '#ffe3a3',
  cian400: '#7ff0e3',
  crema: '#fdf8ee',
  tinta: '#123040',
  gris: '#cfe3e8',
  verde: '#6ff0a0',
  rojo: '#ff8098',
};

/** Fuente principal (geométrica y festiva). */
export const SERIF = 'Futura, "Century Gothic", "Avenir Next", "Trebuchet MS", system-ui, sans-serif';
export const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Courier New", monospace';
export const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export interface OpcionesTexto {
  size?: number;
  color?: string;
  ancho?: number;
  align?: 'left' | 'center' | 'right';
  serif?: boolean;
  negrita?: boolean;
  cursiva?: boolean;
  origen?: [number, number];
  interlineado?: number;
  espaciado?: number;
  mono?: boolean;
}

export function texto(escena: Scene, x: number, y: number, contenido: string, o: OpcionesTexto = {}) {
  const estilo = [o.negrita ? 'bold' : '', o.cursiva ? 'italic' : ''].filter(Boolean).join(' ') || 'normal';
  const t = escena.add.text(x, y, contenido, {
    fontFamily: o.mono ? MONO : o.serif === false ? SANS : SERIF,
    fontSize: `${o.size ?? 16}px`,
    color: o.color ?? H.crema,
    align: o.align ?? 'left',
    fontStyle: estilo,
    lineSpacing: o.interlineado ?? 4,
    wordWrap: o.ancho ? { width: o.ancho, useAdvancedWrap: true } : undefined,
  });
  t.setResolution(ZOOM * 1.25);
  if (o.espaciado) t.setLetterSpacing(o.espaciado);
  if (o.origen) t.setOrigin(o.origen[0], o.origen[1]);
  return t;
}

export function prepararCamara(escena: Scene): void {
  const cam = escena.cameras.main;
  cam.setZoom(ZOOM);
  cam.centerOn(ANCHO / 2, ALTO / 2);
  cam.setBackgroundColor(H.noche900);
  cam.fadeIn(220, 6, 42, 58);
}

/** Fondo de playa: mar al atardecer, sol bajo y olas. */
export function fondo(escena: Scene, tono: number = C.cian500): void {
  const g = escena.add.graphics();
  g.fillStyle(C.noche900, 1).fillRect(0, 0, ANCHO, ALTO);
  // Luz del cielo arriba
  for (let i = 0; i < 14; i++) g.fillStyle(tono, 0.04).fillEllipse(ANCHO / 2, 20, 520 - i * 26, 340 - i * 20);
  // Sol bajo a la derecha
  for (let i = 0; i < 10; i++) g.fillStyle(C.champan400, 0.035).fillCircle(ANCHO - 50, 70, 120 - i * 10);
  g.fillStyle(C.fucsia600, 0.18).fillCircle(ANCHO - 50, 70, 22);
  // Olas al pie
  for (let k = 0; k < 4; k++) {
    g.lineStyle(1.5, C.cian400, 0.08 + k * 0.03);
    g.beginPath();
    const y0 = ALTO - 120 + k * 26;
    for (let x = 0; x <= ANCHO; x += 10) {
      const y = y0 + Math.sin((x + k * 40) / 28) * 4;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.strokePath();
  }
  g.fillStyle(C.noche950, 0.35).fillRect(0, ALTO - 110, ANCHO, 110);
  g.lineStyle(1, C.champan500, 0.3).strokeRect(8, 8, ANCHO - 16, ALTO - 16);
}

export function rectRedondo(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  o: { relleno?: number; alfa?: number; borde?: number; alfaBorde?: number; grosor?: number; radio?: number } = {},
): void {
  const r = o.radio ?? 12;
  if (o.relleno !== undefined) g.fillStyle(o.relleno, o.alfa ?? 1).fillRoundedRect(x, y, w, h, r);
  if (o.borde !== undefined) g.lineStyle(o.grosor ?? 1.5, o.borde, o.alfaBorde ?? 1).strokeRoundedRect(x, y, w, h, r);
}

export type VarianteBoton = 'primario' | 'secundario' | 'fantasma';

export interface Boton {
  contenedor: Phaser.GameObjects.Container;
  habilitar(v: boolean): void;
  etiqueta(s: string): void;
}

export function boton(
  escena: Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  etiqueta: string,
  alPulsar: () => void,
  variante: VarianteBoton = 'primario',
  tamano = 16,
): Boton {
  const g = escena.add.graphics();
  const colorTexto = variante === 'primario' ? '#123040' : H.champan400;
  const t = texto(escena, 0, 0, etiqueta, {
    size: tamano,
    negrita: true,
    serif: false,
    color: colorTexto,
    origen: [0.5, 0.5],
    align: 'center',
  });
  const c = escena.add.container(x, y, [g, t]);
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  let activo = true;

  const pintar = (pulsado: boolean) => {
    g.clear();
    const x0 = -w / 2;
    const y0 = -h / 2;
    if (!activo) {
      rectRedondo(g, x0, y0, w, h, { relleno: C.noche700, alfa: 0.7, borde: C.noche600 });
      t.setColor(H.gris);
      return;
    }
    t.setColor(colorTexto);
    if (variante === 'primario') {
      rectRedondo(g, x0, y0, w, h, { relleno: pulsado ? C.champan600 : C.champan500, borde: C.champan400 });
    } else if (variante === 'secundario') {
      rectRedondo(g, x0, y0, w, h, {
        relleno: pulsado ? C.fucsia700 : C.fucsia800,
        borde: C.fucsia600,
        alfaBorde: 0.7,
      });
    } else {
      rectRedondo(g, x0, y0, w, h, {
        relleno: C.noche800,
        alfa: pulsado ? 1 : 0.6,
        borde: C.cian500,
        alfaBorde: 0.45,
      });
    }
  };
  pintar(false);

  let pulsado = false;
  c.on('pointerdown', () => {
    if (!activo) return;
    pulsado = true;
    pintar(true);
  });
  c.on('pointerout', () => {
    pulsado = false;
    pintar(false);
  });
  c.on('pointerup', () => {
    if (!activo || !pulsado) return;
    pulsado = false;
    pintar(false);
    alPulsar();
  });

  return {
    contenedor: c,
    habilitar(v: boolean) {
      activo = v;
      pintar(false);
    },
    etiqueta(s: string) {
      t.setText(s);
    },
  };
}

/** Contenedor táctil genérico (tarjetas). El fondo lo pinta quien lo usa. */
export function zonaTactil(
  escena: Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  alPulsar: () => void,
): Phaser.GameObjects.Container {
  const c = escena.add.container(x, y);
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  // Solo cuenta si el dedo bajó y subió sobre el mismo objeto (evita pulsaciones fantasma tras cerrar un panel).
  let pulsado = false;
  c.on('pointerdown', () => (pulsado = true));
  c.on('pointerout', () => (pulsado = false));
  c.on('pointerup', () => {
    if (!pulsado) return;
    pulsado = false;
    alPulsar();
  });
  return c;
}

export function sacudir(escena: Scene, objetivos: object | object[]): void {
  escena.tweens.add({ targets: objetivos, x: '+=7', duration: 45, yoyo: true, repeat: 3 });
}
