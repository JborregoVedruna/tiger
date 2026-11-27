// Escena genérica: elegir una opción entre varias (careo, llamada perdida, reflejo).
// Las subclases pueden dibujar algo encima de las opciones (un teclado, un plano…).

import type { Rng } from '../core/rng.ts';
import { generarCareo } from '../puzzles/careo.ts';
import { generarLlamada, type PuzleLlamada } from '../puzzles/llamada.ts';
import type { PuzleElegir } from '../puzzles/tipos.ts';
import { ANCHO, C, H, rectRedondo, texto, zonaTactil, type Boton } from '../ui/phaserUi.ts';
import { MisionBase } from './MisionBase.ts';

export class ElegirScene<P extends PuzleElegir = PuzleElegir> extends MisionBase {
  private generar: (rng: Rng) => P;
  protected puzle!: P;
  private elegido: number | null = null;
  private fondos: Phaser.GameObjects.Graphics[] = [];
  private sellos: Phaser.GameObjects.Text[] = [];
  private accion!: Boton;
  private alto = 60;
  private etiquetaBoton: string;
  private sello: string;

  constructor(indice: number, generar: (rng: Rng) => P, etiquetaBoton = 'Confirmar', sello = 'ELEGIDO') {
    super(indice);
    this.generar = generar;
    this.etiquetaBoton = etiquetaBoton;
    this.sello = sello;
  }

  /** Dibujo opcional encima de las opciones. Devuelve la altura usada. */
  protected dibujarExtra(_y: number): number {
    return 0;
  }

  protected construir(rng: Rng): void {
    this.puzle = this.generar(rng);
    this.elegido = null;
    this.fondos = [];
    this.sellos = [];

    let y = this.yLibre(6);
    y += this.dibujarExtra(y);
    const n = this.puzle.opciones.length;
    const disponible = this.disponibleDesde(y);
    this.alto = Math.min(118, Math.floor((disponible - (n - 1) * 8) / n));
    const ancho = ANCHO - 36;
    const conTexto = this.puzle.opciones.some((o) => o.texto);

    this.puzle.opciones.forEach((o, i) => {
      const cy = y + i * (this.alto + 8) + this.alto / 2;
      const c = zonaTactil(this, ANCHO / 2, cy, ancho, this.alto, () => this.elegir(i));
      const g = this.add.graphics();
      const hijos: Phaser.GameObjects.GameObject[] = [g];
      if (conTexto) {
        const titulo = texto(this, -ancho / 2 + 16, -this.alto / 2 + 10, o.titulo.toUpperCase(), {
          size: 11.5,
          negrita: true,
          color: H.champan400,
          serif: false,
          espaciado: 1,
        });
        let frase!: Phaser.GameObjects.Text;
        for (const size of [16, 14, 13, 12]) {
          frase?.destroy();
          frase = texto(this, -ancho / 2 + 16, -this.alto / 2 + 28, o.texto ?? '', {
            size,
            cursiva: !o.texto?.match(/^\d/),
            mono: !!o.texto?.match(/^\d/),
            ancho: ancho - 32,
            interlineado: 3,
          });
          if (frase.height <= this.alto - 34) break;
        }
        hijos.push(titulo, frase);
      } else {
        hijos.push(texto(this, -ancho / 2 + 16, 0, o.titulo, { size: 15, negrita: true, origen: [0, 0.5] }));
      }
      const sello = texto(this, ancho / 2 - 14, conTexto ? -this.alto / 2 + 10 : 0, '', {
        size: 11,
        negrita: true,
        color: H.rojo,
        serif: false,
        origen: [1, conTexto ? 0 : 0.5],
        espaciado: 1.5,
      });
      hijos.push(sello);
      c.add(hijos);
      this.fondos.push(g);
      this.sellos.push(sello);
    });

    this.accion = this.botonAccion(this.etiquetaBoton, () => this.comprobar());
    this.repintar();
    this.avisar('Toca una opción y confirma.');
  }

  private repintar(): void {
    const ancho = ANCHO - 36;
    this.fondos.forEach((g, i) => {
      const sel = this.elegido === i;
      g.clear();
      rectRedondo(g, -ancho / 2, -this.alto / 2, ancho, this.alto, {
        relleno: sel ? C.fucsia900 : C.noche800,
        borde: sel ? C.fucsia600 : C.noche600,
        grosor: sel ? 2.5 : 1.5,
        radio: 14,
      });
      this.sellos[i].setText(sel ? this.sello : '');
    });
    this.accion.habilitar(this.elegido !== null);
  }

  private elegir(i: number): void {
    this.elegido = this.elegido === i ? null : i;
    this.repintar();
  }

  private comprobar(): void {
    if (this.elegido === this.puzle.correcta) this.exito('¡Exacto!');
    else this.fallo('No encaja con lo que ves. Prueba otra opción.');
  }

  protected textoAyuda(): string {
    return this.puzle.ayuda;
  }
}

// ---------------------------------------------------------------- Careo de los camareros

export class CareoScene extends ElegirScene {
  constructor(indice: number) {
    super(indice, generarCareo, 'Desenmascarar', 'MIENTE');
  }
}

// ---------------------------------------------------------------- Llamada perdida

export class LlamadaScene extends ElegirScene<PuzleLlamada> {
  constructor(indice: number) {
    super(indice, generarLlamada, 'Es a quien llamó', 'LLAMÓ');
  }

  protected dibujarExtra(y: number): number {
    const p = this.puzle;
    // Pantalla
    const g = this.add.graphics();
    rectRedondo(g, 20, y, ANCHO - 40, 34, { relleno: C.noche950, borde: C.cian500, radio: 8 });
    const pantalla = p.pantalla.map((d) => d ?? '▒');
    const numero = `${pantalla.slice(0, 3).join('')} ${pantalla.slice(3, 6).join('')} ${pantalla.slice(6).join('')}`;
    texto(this, 32, y + 17, '11:39 · Llamada cortada', { size: 11, color: H.gris, origen: [0, 0.5], serif: false });
    texto(this, ANCHO - 32, y + 17, numero, { size: 15, mono: true, negrita: true, color: H.cian400, origen: [1, 0.5] });
    // Teclado
    const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    const yT = y + 44;
    const w = 50;
    const h = 22;
    teclas.forEach((t, i) => {
      const fila = Math.floor(i / 3);
      const col = i % 3;
      const x = ANCHO / 2 + (col - 1) * (w + 8);
      const ty = yT + fila * (h + 5) + h / 2;
      const marcada = p.marcadas.includes(t);
      const k = this.add.graphics();
      rectRedondo(k, x - w / 2, ty - h / 2, w, h, {
        relleno: marcada ? C.fucsia800 : C.noche800,
        borde: marcada ? C.fucsia600 : C.noche600,
        radio: 6,
      });
      if (marcada) k.fillStyle(0xffffff, 0.12).fillEllipse(x + 8, ty + 2, 22, 12);
      texto(this, x, ty, t, { size: 13, negrita: true, color: marcada ? H.crema : H.gris, origen: [0.5, 0.5], serif: false });
    });
    texto(this, 22, yT + 4 * (h + 5) + 2, 'Teclas con marca de dedo, en fucsia.', { size: 10.5, color: H.gris, serif: false });
    return 44 + 4 * (h + 5) + 22;
  }
}
