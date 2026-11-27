// Escena genérica: emparejar elementos de dos columnas (guardarropa, vasos, reservados, contenedor).
// Si las pistas no caben junto al tablero, se reparten en dos pestañas.

import type { Rng } from '../core/rng.ts';
import type { Ficha, PuzleEmparejar } from '../puzzles/tipos.ts';
import { ANCHO, C, H, boton, rectRedondo, texto, zonaTactil, type Boton } from '../ui/phaserUi.ts';
import { MisionBase } from './MisionBase.ts';

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];
const COLORES = [0xffd76e, 0x5ef2ff, 0xff2e93, 0x3ee07a, 0xa855f7, 0xff9f1c];
const COLORES_HEX = ['#ffd76e', '#5ef2ff', '#ff2e93', '#3ee07a', '#a855f7', '#ff9f1c'];

const ANCHO_IZQ = 196;
const ANCHO_DER = 140;
const X_IZQ = 20 + ANCHO_IZQ / 2;
const X_DER = ANCHO - 20 - ANCHO_DER / 2;

interface Tarjeta {
  ficha: Ficha;
  fondo: Phaser.GameObjects.Graphics;
  etiqueta: Phaser.GameObjects.Text;
  ancho: number;
}

export class EmparejarScene extends MisionBase {
  private generar: (rng: Rng) => PuzleEmparejar;
  private puzle!: PuzleEmparejar;
  private seleccion: string | null = null;
  private enlaces = new Map<string, string>();
  private izquierda: Tarjeta[] = [];
  private derecha: Tarjeta[] = [];
  private accion!: Boton;
  private altoFila = 56;

  constructor(indice: number, generar: (rng: Rng) => PuzleEmparejar) {
    super(indice);
    this.generar = generar;
  }

  protected construir(rng: Rng): void {
    this.puzle = this.generar(rng);
    this.seleccion = null;
    this.enlaces = new Map();
    this.izquierda = [];
    this.derecha = [];

    const y0 = this.yLibre(4);
    const n = this.puzle.izquierda.length;
    const disponible = this.disponibleDesde(y0);
    const lista = this.puzle.pistas.map((t) => `• ${t}`).join('\n');

    // ¿Cabe todo en una sola vista?
    const prueba = texto(this, 0, 0, lista, { size: 12.5, ancho: ANCHO - 68, interlineado: 3 });
    const altoPistas = prueba.height + 36;
    prueba.destroy();
    const filaMinima = 46;
    const unaVista = altoPistas + 22 + n * (filaMinima + 8) <= disponible;

    if (unaVista) {
      this.panelPistas(y0, lista, 12.5);
      const yTablero = y0 + altoPistas + 10;
      this.tablero(yTablero, this.disponibleDesde(yTablero));
    } else {
      const pistas = this.add.container(0, 0);
      const tablero = this.add.container(0, 0);
      const yContenido = y0 + 46;
      const altoContenido = this.disponibleDesde(yContenido);
      let size = 12.5;
      for (const s of [12.5, 11.5, 10.5]) {
        size = s;
        const t = texto(this, 0, 0, lista, { size: s, ancho: ANCHO - 68, interlineado: 3 });
        const cabe = t.height + 36 <= altoContenido;
        t.destroy();
        if (cabe) break;
      }
      pistas.add(this.panelPistas(yContenido, lista, size));
      tablero.add(this.tablero(yContenido, altoContenido));

      const pestanas: Boton[] = [];
      const mostrar = (cual: 0 | 1) => {
        pistas.setVisible(cual === 0);
        tablero.setVisible(cual === 1);
        pestanas.forEach((b, i) => b.contenedor.setAlpha(i === cual ? 1 : 0.55));
      };
      pestanas.push(boton(this, ANCHO / 2 - 88, y0 + 18, 170, 34, 'Pistas', () => mostrar(0), 'secundario', 13));
      pestanas.push(boton(this, ANCHO / 2 + 88, y0 + 18, 170, 34, 'Tablero', () => mostrar(1), 'secundario', 13));
      mostrar(0);
    }

    this.accion = this.botonAccion('Comprobar parejas', () => this.comprobar());
    this.repintar();
    this.avisar(`Toca ${this.puzle.tituloIzq.toLowerCase()} y luego su pareja de la derecha.`);
  }

  private panelPistas(y: number, lista: string, size: number): Phaser.GameObjects.GameObject[] {
    const g = this.add.graphics();
    const titulo = texto(this, 34, y + 10, this.puzle.tituloPistas.toUpperCase(), {
      size: 10.5,
      color: '#c2452c',
      negrita: true,
      serif: false,
      espaciado: 2,
    });
    const t = texto(this, 34, y + 28, lista, { size, ancho: ANCHO - 68, interlineado: 3, color: H.tinta });
    rectRedondo(g, 20, y, ANCHO - 40, t.height + 38, { relleno: C.papel, radio: 6 });
    return [g, titulo, t];
  }

  private tablero(y: number, alto: number): Phaser.GameObjects.GameObject[] {
    const n = this.puzle.izquierda.length;
    const objetos: Phaser.GameObjects.GameObject[] = [];
    objetos.push(
      texto(this, X_IZQ, y + 6, this.puzle.tituloIzq.toUpperCase(), { size: 10, color: H.gris, origen: [0.5, 0.5], serif: false, espaciado: 1.5 }),
      texto(this, X_DER, y + 6, this.puzle.tituloDer.toUpperCase(), {
        size: 10,
        color: H.gris,
        origen: [0.5, 0.5],
        serif: false,
        espaciado: 1,
        ancho: ANCHO_DER + 20,
        align: 'center',
      }),
    );
    const yPrimera = y + 20;
    this.altoFila = Math.min(64, Math.floor((alto - 20) / n) - 8);
    const paso = this.altoFila + 8;
    this.puzle.izquierda.forEach((f, i) => {
      const t = this.tarjeta(f, X_IZQ, yPrimera + i * paso + this.altoFila / 2, ANCHO_IZQ, () => this.tocarIzq(f.id));
      this.izquierda.push(t);
      objetos.push(t.fondo.parentContainer!);
    });
    this.puzle.derecha.forEach((f, i) => {
      const t = this.tarjeta(f, X_DER, yPrimera + i * paso + this.altoFila / 2, ANCHO_DER, () => this.tocarDer(f.id));
      this.derecha.push(t);
      objetos.push(t.fondo.parentContainer!);
    });
    return objetos;
  }

  private tarjeta(ficha: Ficha, x: number, y: number, ancho: number, alPulsar: () => void): Tarjeta {
    const c = zonaTactil(this, x, y, ancho, this.altoFila, alPulsar);
    const fondo = this.add.graphics();
    const anchoTexto = ancho - 40;
    let nombre!: Phaser.GameObjects.Text;
    let detalle: Phaser.GameObjects.Text | null = null;
    for (const size of [12.5, 11.5, 10.5, 9.5]) {
      nombre?.destroy();
      detalle?.destroy();
      nombre = texto(this, 0, 0, ficha.nombre, { size, ancho: anchoTexto, interlineado: 1, negrita: !!ficha.detalle });
      detalle = ficha.detalle
        ? texto(this, 0, 0, ficha.detalle, { size: size - 2, ancho: anchoTexto, color: H.gris, serif: false, interlineado: 1 })
        : null;
      if (nombre.height + (detalle ? detalle.height + 2 : 0) <= this.altoFila - 6) break;
    }
    const total = nombre.height + (detalle ? detalle.height + 2 : 0);
    const x0 = -ancho / 2 + 32;
    nombre.setPosition(x0, -total / 2);
    detalle?.setPosition(x0, -total / 2 + nombre.height + 2);
    const etiqueta = texto(this, -ancho / 2 + 16, 0, '', { size: 12, negrita: true, color: '#123040', origen: [0.5, 0.5], serif: false });
    c.add([fondo, nombre, ...(detalle ? [detalle] : []), etiqueta]);
    return { ficha, fondo, etiqueta, ancho };
  }

  private pintar(t: Tarjeta, color: number | null, resaltada: boolean, letra: string): void {
    const h = this.altoFila;
    t.fondo.clear();
    rectRedondo(t.fondo, -t.ancho / 2, -h / 2, t.ancho, h, {
      relleno: resaltada ? C.noche700 : C.noche800,
      borde: color ?? C.noche600,
      grosor: resaltada ? 2.5 : 1.5,
      radio: 10,
    });
    const cx = -t.ancho / 2 + 16;
    if (color !== null) t.fondo.fillStyle(color, 1).fillCircle(cx, 0, 10);
    else t.fondo.lineStyle(1, C.gris, 0.6).strokeCircle(cx, 0, 10);
    t.etiqueta.setText(letra);
  }

  private repintar(): void {
    this.izquierda.forEach((t, i) => this.pintar(t, COLORES[i], this.seleccion === t.ficha.id, LETRAS[i]));
    this.derecha.forEach((t) => {
      const izq = [...this.enlaces.entries()].find(([, d]) => d === t.ficha.id)?.[0];
      const i = izq ? this.puzle.izquierda.findIndex((f) => f.id === izq) : -1;
      this.pintar(t, i >= 0 ? COLORES[i] : null, false, i >= 0 ? LETRAS[i] : '');
    });
    this.accion.habilitar(this.enlaces.size === this.puzle.izquierda.length);
  }

  private tocarIzq(id: string): void {
    this.seleccion = this.seleccion === id ? null : id;
    if (this.seleccion) {
      const i = this.puzle.izquierda.findIndex((f) => f.id === id);
      this.mensaje.setColor(COLORES_HEX[i]);
      this.mensaje.setText(`${LETRAS[i]} seleccionado: ahora toca su pareja de la derecha.`);
    }
    this.repintar();
  }

  private tocarDer(id: string): void {
    if (!this.seleccion) {
      this.avisar(`Primero toca un elemento de «${this.puzle.tituloIzq}».`);
      return;
    }
    for (const [m, l] of this.enlaces) if (l === id) this.enlaces.delete(m);
    this.enlaces.set(this.seleccion, id);
    this.seleccion = null;
    const listas = this.enlaces.size === this.puzle.izquierda.length;
    this.avisar(listas ? 'Parejas listas. Compruébalas.' : 'Bien. Sigue con otra.');
    this.repintar();
  }

  private comprobar(): void {
    const malas = this.puzle.izquierda.filter((f) => this.enlaces.get(f.id) !== this.puzle.correcto[f.id]).length;
    if (malas === 0) this.exito('Todas las parejas encajan.');
    else this.fallo(`Hay ${malas === 1 ? 'una pareja incorrecta' : `${malas} parejas incorrectas`}. Repasa las pistas.`);
  }

  protected textoAyuda(): string {
    const f = this.puzle.izquierda[0];
    const d = this.puzle.derecha.find((x) => x.id === this.puzle.correcto[f.id])!;
    return `Ayuda: A (${f.nombre}) va con ${d.nombre}.`;
  }
}
