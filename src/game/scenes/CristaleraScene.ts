// Las huellas de la Breña: sudoku 6×6 con las huellas de seis animales del pinar.

import type { Rng } from '../core/rng.ts';
import { ALTO_BLOQUE, ANCHO_BLOQUE, N, generarCristalera, type PuzleCristalera } from '../puzzles/cristalera.ts';
import { ANCHO, C, H, boton, rectRedondo, texto, zonaTactil } from '../ui/phaserUi.ts';
import { MisionBase } from './MisionBase.ts';

const COLORES = [0xff2e93, 0x22d3ee, 0xffd76e, 0x3ee07a, 0xa855f7, 0xff9f1c];

export class CristaleraScene extends MisionBase {
  private puzle!: PuzleCristalera;
  private valores: (number | null)[][] = [];
  private fondos: Phaser.GameObjects.Graphics[][] = [];
  private cifras: Phaser.GameObjects.Text[][] = [];
  private seleccion: [number, number] | null = null;
  private lado = 46;

  constructor(indice: number) {
    super(indice);
  }

  protected construir(rng: Rng): void {
    this.puzle = generarCristalera(rng);
    this.valores = this.puzle.pistas.map((f) => [...f]);
    this.fondos = [];
    this.cifras = [];
    this.seleccion = null;

    const y0 = this.yLibre(6);
    const disponible = 620 - 64 - y0;
    this.lado = Math.min(50, Math.floor((Math.min(ANCHO - 40, disponible) - 8) / N));
    const total = this.lado * N + 8;
    const x0 = (ANCHO - total) / 2 + 4;

    // Marco del mapa del pinar
    const marco = this.add.graphics();
    rectRedondo(marco, x0 - 6, y0 - 4, total + 4, total + 4, { relleno: 0x0a1a2a, borde: C.cian500, grosor: 2, radio: 8 });

    for (let r = 0; r < N; r++) {
      this.fondos.push([]);
      this.cifras.push([]);
      for (let c = 0; c < N; c++) {
        const gx = x0 + c * this.lado + (c >= ANCHO_BLOQUE ? 6 : 0) + this.lado / 2;
        const gy = y0 + r * this.lado + Math.floor(r / ALTO_BLOQUE) * 3 + this.lado / 2;
        const fija = this.puzle.pistas[r][c] !== null;
        const z = zonaTactil(this, gx, gy, this.lado - 3, this.lado - 3, () => this.tocar(r, c));
        const g = this.add.graphics();
        const t = texto(this, 0, 0, '', { size: this.lado * 0.46, negrita: true, origen: [0.5, 0.5], serif: false });
        z.add([g, t]);
        if (fija) z.disableInteractive();
        this.fondos[r].push(g);
        this.cifras[r].push(t);
      }
    }

    // Teclado: luces 1–6 y borrar
    const yTeclas = y0 + total + 24;
    const anchoTecla = (ANCHO - 40 - 6 * 6) / 7;
    for (let v = 1; v <= 7; v++) {
      const x = 20 + anchoTecla / 2 + (v - 1) * (anchoTecla + 6);
      boton(this, x, yTeclas, anchoTecla, 40, v === 7 ? '⌫' : String(v), () => this.escribir(v === 7 ? null : v), v === 7 ? 'secundario' : 'fantasma', 16);
    }

    this.botonAccion('Comprobar las huellas', () => this.comprobar());
    this.repintar();
    this.avisar('Toca una casilla vacía y elige su huella (1–6).');
  }

  private repintar(): void {
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) {
        const g = this.fondos[r][c];
        const v = this.valores[r][c];
        const fija = this.puzle.pistas[r][c] !== null;
        const sel = this.seleccion?.[0] === r && this.seleccion?.[1] === c;
        const misma = this.seleccion && (this.seleccion[0] === r || this.seleccion[1] === c);
        const l = this.lado - 3;
        g.clear();
        rectRedondo(g, -l / 2, -l / 2, l, l, {
          relleno: sel ? C.noche600 : misma ? 0x1b2848 : 0x111c33,
          borde: sel ? C.champan400 : 0xffffff,
          alfaBorde: sel ? 1 : 0.12,
          grosor: sel ? 2 : 1,
          radio: 5,
        });
        // Reflejo diagonal del cristal
        g.fillStyle(0xffffff, 0.05).fillTriangle(-l / 2, -l / 2, l / 2 - 6, -l / 2, -l / 2, l / 2 - 6);
        if (v !== null) {
          g.fillStyle(COLORES[v - 1], fija ? 0.85 : 0.35).fillCircle(0, 0, l * 0.34);
        }
        const t = this.cifras[r][c];
        t.setText(v === null ? '' : String(v));
        t.setColor(fija ? '#062a3a' : H.crema);
      }
  }

  private tocar(r: number, c: number): void {
    this.seleccion = this.seleccion?.[0] === r && this.seleccion?.[1] === c ? null : [r, c];
    this.repintar();
  }

  private escribir(v: number | null): void {
    if (!this.seleccion) {
      this.avisar('Primero toca una casilla vacía del pinar.');
      return;
    }
    const [r, c] = this.seleccion;
    this.valores[r][c] = v;
    this.repintar();
  }

  private comprobar(): void {
    const vacias = this.valores.flat().filter((v) => v === null).length;
    if (vacias > 0) {
      this.avisar(`Aún quedan ${vacias} casillas vacías.`, 'error');
      return;
    }
    let mal = 0;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (this.valores[r][c] !== this.puzle.solucion[r][c]) mal++;
    if (mal === 0) this.exito('¡Las huellas cuadran! Ya sabes por dónde pasó Tiger.');
    else this.fallo(`Hay ${mal} ${mal === 1 ? 'huella que no encaja' : 'huellas que no encajan'}. Revisa filas, columnas y bloques.`);
  }

  protected textoAyuda(): string {
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++)
        if (this.valores[r][c] !== this.puzle.solucion[r][c]) {
          return `Ayuda: en la fila ${r + 1}, columna ${c + 1} va la huella ${this.puzle.solucion[r][c]}.`;
        }
    return 'Ayuda: todo parece correcto. Pulsa «Comprobar las huellas».';
  }
}
