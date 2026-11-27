// Escena genérica: tarjeta con datos + diales numéricos (taquilla, ticket, ascensor).

import type { Rng } from '../core/rng.ts';
import type { PuzleDiales } from '../puzzles/tipos.ts';
import { ANCHO, C, H, boton, rectRedondo, texto } from '../ui/phaserUi.ts';
import { MisionBase, Y_MENSAJE } from './MisionBase.ts';

export class DialesScene extends MisionBase {
  private generar: (rng: Rng) => PuzleDiales;
  private puzle!: PuzleDiales;
  private valores: number[] = [];
  private cifras: Phaser.GameObjects.Text[] = [];

  constructor(indice: number, generar: (rng: Rng) => PuzleDiales) {
    super(indice);
    this.generar = generar;
  }

  protected construir(rng: Rng): void {
    this.puzle = this.generar(rng);
    this.valores = this.puzle.diales.map(() => 0);
    this.cifras = [];

    const altoCuerpo = 132;
    const yCuerpo = Y_MENSAJE - 24 - altoCuerpo;
    const yTarjeta = this.yLibre(4);
    const limite = yCuerpo - 14;
    const mono = this.puzle.lineas.some((l) => l.includes('....'));

    let lineas!: Phaser.GameObjects.Text;
    for (const size of [13, 12, 11, 10, 9]) {
      lineas?.destroy();
      lineas = texto(this, 34, yTarjeta + 30, this.puzle.lineas.join('\n'), {
        size: mono ? size - 1 : size,
        ancho: ANCHO - 68,
        color: H.tinta,
        interlineado: 4,
        mono,
      });
      if (yTarjeta + lineas.height + 42 <= limite) break;
    }
    const g = this.add.graphics();
    this.children.moveBelow(g, lineas);
    rectRedondo(g, 20, yTarjeta, ANCHO - 40, lineas.height + 42, { relleno: C.papel, radio: 6 });
    texto(this, 34, yTarjeta + 10, this.puzle.tituloTarjeta, {
      size: 10.5,
      color: '#c2452c',
      negrita: true,
      serif: false,
      espaciado: 1.5,
    });

    const cuerpo = this.add.graphics();
    rectRedondo(cuerpo, 30, yCuerpo, ANCHO - 60, altoCuerpo, {
      relleno: C.noche800,
      borde: C.fucsia600,
      grosor: 2,
      radio: 18,
    });
    const n = this.puzle.diales.length;
    const cy = yCuerpo + altoCuerpo / 2 + 6;
    this.puzle.diales.forEach((etiqueta, k) => {
      const x = ANCHO / 2 + (k - (n - 1) / 2) * 92;
      texto(this, x, yCuerpo + 12, etiqueta.toUpperCase(), { size: 9.5, color: H.gris, origen: [0.5, 0], serif: false, espaciado: 1 });
      const caja = this.add.graphics();
      rectRedondo(caja, x - 28, cy - 22, 56, 44, { relleno: C.noche950, borde: C.cian500 });
      this.cifras.push(texto(this, x, cy, '0', { size: 30, negrita: true, color: H.cian400, origen: [0.5, 0.5] }));
      boton(this, x, cy - 42, 64, 30, '▲', () => this.girar(k, 1), 'fantasma', 13);
      boton(this, x, cy + 42, 64, 30, '▼', () => this.girar(k, -1), 'fantasma', 13);
    });

    this.botonAccion('Comprobar', () => this.comprobar());
    this.avisar('Ajusta los diales con las flechas.');
  }

  private girar(k: number, d: number): void {
    this.valores[k] = (this.valores[k] + d + 10) % 10;
    const t = this.cifras[k];
    t.setText(String(this.valores[k]));
    this.tweens.add({ targets: t, scale: { from: 1.25, to: 1 }, duration: 140 });
  }

  private comprobar(): void {
    if (this.valores.every((v, i) => v === this.puzle.solucion[i])) this.exito('¡Correcto! Los números cuadran.');
    else this.fallo(`Con ${this.valores.join('')} no cuadra. Revisa los datos uno a uno.`);
  }

  protected textoAyuda(): string {
    return this.puzle.ayuda;
  }
}
