// La nota rasgada: reconstruir el orden de diez fragmentos.

import type { Rng } from '../core/rng.ts';
import { generarNota, type Fragmento, type PuzleNota } from '../puzzles/nota.ts';
import { ANCHO, C, H, boton, texto, zonaTactil } from '../ui/phaserUi.ts';
import { MisionBase, Y_MENSAJE } from './MisionBase.ts';

/** Dibuja un trozo de papel con bordes rasgados. */
function papelRasgado(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, semilla: number, color: number) {
  let s = semilla;
  const azar = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const puntos: { x: number; y: number }[] = [];
  const pasos = Math.max(6, Math.round(w / 18));
  for (let i = 0; i <= pasos; i++) puntos.push({ x: x + (w * i) / pasos, y: y + azar() * 4 });
  for (let i = 1; i <= 3; i++) puntos.push({ x: x + w - azar() * 4, y: y + (h * i) / 4 });
  for (let i = pasos; i >= 0; i--) puntos.push({ x: x + (w * i) / pasos, y: y + h - azar() * 4 });
  for (let i = 3; i >= 1; i--) puntos.push({ x: x + azar() * 4, y: y + (h * i) / 4 });
  g.fillStyle(0x000000, 0.35).fillPoints(
    puntos.map((p) => ({ x: p.x + 2, y: p.y + 3 })),
    true,
  );
  g.fillStyle(color, 1).fillPoints(puntos, true);
}

export class NotaScene extends MisionBase {
  private puzle!: PuzleNota;
  private colocados: string[] = [];
  private textoNota!: Phaser.GameObjects.Text;
  private piezas = new Map<string, Phaser.GameObjects.Container>();
  private bloqueado = false;

  constructor(indice: number) {
    super(indice);
  }

  protected construir(rng: Rng): void {
    this.puzle = generarNota(rng);
    this.colocados = [];
    this.piezas = new Map();
    this.bloqueado = false;

    const yNota = this.yLibre(4);
    const altoNota = 132;
    const g = this.add.graphics();
    papelRasgado(g, 22, yNota, ANCHO - 44, altoNota, 7, C.papel);
    g.lineStyle(1, C.fucsia600, 0.25);
    for (let ly = yNota + 40; ly < yNota + altoNota - 8; ly += 22) g.lineBetween(36, ly, ANCHO - 36, ly);
    texto(this, 36, yNota + 12, 'NOTA EN LA ARENA', { size: 10, color: '#c2452c', negrita: true, serif: false, espaciado: 2 });
    this.textoNota = texto(this, 36, yNota + 28, '', {
      size: 13.5,
      cursiva: true,
      color: H.tinta,
      ancho: ANCHO - 72,
      interlineado: 5,
    });

    // Diez trozos en dos columnas
    const yFrag = yNota + altoNota + 12;
    const filas = Math.ceil(this.puzle.fragmentos.length / 2);
    const alto = Math.min(46, Math.floor((Y_MENSAJE - 62 - yFrag) / filas) - 6);
    const ancho = (ANCHO - 52) / 2;
    this.puzle.fragmentos.forEach((f, i) => {
      const col = i % 2;
      const fila = Math.floor(i / 2);
      const x = 22 + ancho / 2 + col * (ancho + 8);
      const y = yFrag + fila * (alto + 6) + alto / 2;
      this.crearPieza(f, i, x, y, ancho, alto);
    });

    const yBotones = yFrag + filas * (alto + 6) + 18;
    boton(this, ANCHO / 2 - 82, yBotones, 150, 34, 'Deshacer último', () => this.deshacer(), 'fantasma', 12.5);
    boton(this, ANCHO / 2 + 82, yBotones, 150, 34, 'Empezar de nuevo', () => this.reiniciar(), 'fantasma', 12.5);
    this.botonAccion('Comprobar la nota', () => this.comprobar());
    this.avisar('Toca los trozos en el orden en que se leen.');
    this.actualizarNota();
  }

  private crearPieza(f: Fragmento, i: number, x: number, y: number, ancho: number, alto: number): void {
    const c = zonaTactil(this, x, y, ancho, alto, () => this.colocar(f.id));
    const g = this.add.graphics();
    papelRasgado(g, -ancho / 2, -alto / 2, ancho, alto, 31 + i * 17, 0xe7dcc4);
    let t!: Phaser.GameObjects.Text;
    for (const size of [13, 12, 11]) {
      t?.destroy();
      t = texto(this, 0, 0, f.texto, { size, cursiva: true, color: H.tinta, origen: [0.5, 0.5], ancho: ancho - 14, align: 'center' });
      if (t.height <= alto - 6) break;
    }
    c.add([g, t]);
    c.setAngle((i % 2 === 0 ? -1 : 1) * (0.5 + (i % 3) * 0.4));
    this.piezas.set(f.id, c);
  }

  private colocar(id: string): void {
    if (this.bloqueado || this.colocados.includes(id)) return;
    this.colocados.push(id);
    const pieza = this.piezas.get(id)!;
    pieza.disableInteractive();
    this.tweens.add({ targets: pieza, alpha: 0.18, scale: 0.96, duration: 160 });
    this.actualizarNota();
    if (this.colocados.length === this.puzle.orden.length) this.avisar('Ya están todos. Léela entera y pulsa «Comprobar la nota».');
  }

  private comprobar(): void {
    if (this.colocados.length < this.puzle.orden.length) {
      this.avisar(`Faltan ${this.puzle.orden.length - this.colocados.length} trozos por colocar.`, 'error');
      return;
    }
    if (this.colocados.every((x, i) => x === this.puzle.orden[i])) {
      this.exito('El mensaje tiene sentido. Le das la vuelta al papel...');
      return;
    }
    let bien = 0;
    while (this.colocados[bien] === this.puzle.orden[bien]) bien++;
    this.fallo(
      bien === 0
        ? 'Así no se entiende. Ni siquiera el primer trozo está en su sitio.'
        : `Así no se entiende. Los ${bien} primeros trozos están bien; a partir de ahí, no.`,
    );
  }

  private actualizarNota(): void {
    const frases = this.colocados.map((id) => this.puzle.fragmentos.find((f) => f.id === id)!.texto);
    this.textoNota.setText(frases.length ? frases.join(' ') : '…');
  }

  private deshacer(): void {
    const id = this.colocados.pop();
    if (!id) return;
    const p = this.piezas.get(id)!;
    p.setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: p, alpha: 1, scale: 1, duration: 160 });
    this.actualizarNota();
  }

  private reiniciar(): void {
    this.bloqueado = false;
    this.colocados = [];
    for (const p of this.piezas.values()) {
      p.setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: p, alpha: 1, scale: 1, duration: 160 });
    }
    this.actualizarNota();
    this.avisar('Toca los trozos en el orden en que se leen.');
  }

  protected textoAyuda(): string {
    const textos = this.puzle.orden.slice(0, 3).map((id) => this.puzle.fragmentos.find((f) => f.id === id)!.texto);
    return `Ayuda: la nota empieza «${textos.join(' ')}…»`;
  }
}
