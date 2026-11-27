// Escena genérica: ordenar tarjetas (reloj, cámaras de seguridad, sesión del DJ).

import type { Rng } from '../core/rng.ts';
import type { PuzleOrden, TarjetaOrden } from '../puzzles/tipos.ts';
import { ANCHO, C, H, rectRedondo, texto, zonaTactil, type Boton } from '../ui/phaserUi.ts';
import { MisionBase } from './MisionBase.ts';

interface Vista {
  datos: TarjetaOrden;
  fondo: Phaser.GameObjects.Graphics;
  insignia: Phaser.GameObjects.Text;
  alto: number;
  ancho: number;
}

const ANCHO_TARJETA = ANCHO - 36;

export class OrdenarScene extends MisionBase {
  private generar: (rng: Rng) => PuzleOrden;
  private puzle!: PuzleOrden;
  private orden: string[] = [];
  private vistas: Vista[] = [];
  private accion!: Boton;

  constructor(indice: number, generar: (rng: Rng) => PuzleOrden) {
    super(indice);
    this.generar = generar;
  }

  protected construir(rng: Rng): void {
    this.puzle = this.generar(rng);
    this.orden = [];
    this.vistas = [];
    const yInicio = this.yLibre(6);
    let y = yInicio;
    const previos = new Set(this.children.list);

    if (this.puzle.destacado) {
      const d = this.puzle.destacado;
      let x = 22;
      if (this.puzle.reloj !== undefined) {
        this.dibujarReloj(52, y + 28, 26, this.puzle.reloj);
        x = 92;
      }
      texto(this, x, y + 4, d.etiqueta, { size: 12, color: H.gris, serif: false, ancho: ANCHO - x - 20 });
      texto(this, x, y + 22, d.valor, { size: 24, color: H.champan400, negrita: true });
      y += this.puzle.reloj !== undefined ? 62 : 54;
    }

    if (this.puzle.pistas?.length) {
      const lista = this.puzle.pistas.map((p) => `• ${p}`).join('\n');
      const reservaTarjetas = this.puzle.tarjetas.length * 50;
      let t!: Phaser.GameObjects.Text;
      for (const size of [12, 11, 10.5, 10]) {
        t?.destroy();
        t = texto(this, 34, y + 10, lista, { size, ancho: ANCHO - 68, color: H.tinta, interlineado: 2 });
        if (y + t.height + 30 + reservaTarjetas <= this.disponibleDesde(0)) break;
      }
      const g = this.add.graphics();
      this.children.moveBelow(g, t);
      rectRedondo(g, 20, y, ANCHO - 40, t.height + 20, { relleno: C.papel, radio: 6 });
      y += t.height + 30;
    }

    const disponible = this.disponibleDesde(y);
    const conMiniatura = this.puzle.tarjetas.some((t) => t.plazas);
    // Tarjetas cortas (p. ej. canciones): en dos columnas para que quepan en el móvil.
    const columnas = !conMiniatura && this.puzle.tarjetas.every((t) => t.texto.length <= 34) ? 2 : 1;
    const anchoTarjeta = columnas === 2 ? (ANCHO - 36 - 8) / 2 : ANCHO_TARJETA;
    let yFinal = y;
    for (const size of [13, 12, 11, 10]) {
      this.vistas.forEach((v) => v.fondo.parentContainer?.destroy());
      this.vistas = [];
      let yy = y;
      for (let k = 0; k < this.puzle.tarjetas.length; k += columnas) {
        let altoFila = 0;
        for (let c = 0; c < columnas && k + c < this.puzle.tarjetas.length; c++) {
          const x = 18 + anchoTarjeta / 2 + c * (anchoTarjeta + 8);
          const v = this.crearTarjeta(this.puzle.tarjetas[k + c], x, yy, size, conMiniatura, anchoTarjeta);
          altoFila = Math.max(altoFila, v.alto);
        }
        yy += altoFila + 7;
      }
      yFinal = yy - 7;
      if (yFinal - y <= disponible) break;
    }

    // Si aun así no cabe, se encoge todo el contenido para que entre entero en pantalla.
    const limite = this.disponibleDesde(0);
    if (yFinal > limite) {
      const escala = (limite - yInicio) / (yFinal - yInicio);
      const nuevos = this.children.list.filter((o) => !previos.has(o));
      const contenedor = this.add.container(0, 0, nuevos);
      contenedor.setScale(escala);
      contenedor.setPosition((ANCHO - ANCHO * escala) / 2, yInicio * (1 - escala));
    }

    this.accion = this.botonAccion('Comprobar orden', () => this.comprobar());
    this.accion.habilitar(false);
    this.avisar('Toca las tarjetas de la primera a la última. Vuelve a tocar una para quitarla.');
  }

  private crearTarjeta(
    t: TarjetaOrden,
    x: number,
    y: number,
    size: number,
    conMiniatura: boolean,
    ANCHO_TARJETA: number,
  ): Vista {
    const izquierda = conMiniatura ? 128 : 48;
    const cuerpo = texto(this, 0, 0, t.texto, { size, ancho: ANCHO_TARJETA - izquierda - 10, interlineado: 1 });
    const alto = t.texto ? Math.max(44, cuerpo.height + 28) : 56;
    const c = zonaTactil(this, x, y + alto / 2, ANCHO_TARJETA, alto, () => this.alternar(t.id));
    const fondo = this.add.graphics();
    const etiqueta = texto(this, -ANCHO_TARJETA / 2 + izquierda, -alto / 2 + 9, t.etiqueta.toUpperCase(), {
      size: 10.5,
      color: H.cian400,
      serif: false,
      negrita: true,
      espaciado: 1,
      mono: !!t.plazas,
    });
    cuerpo.setPosition(-ANCHO_TARJETA / 2 + izquierda, -alto / 2 + 23);
    const insignia = texto(this, -ANCHO_TARJETA / 2 + 24, 0, '', {
      size: 17,
      negrita: true,
      color: '#123040',
      origen: [0.5, 0.5],
      serif: false,
    });
    c.add([fondo, etiqueta, cuerpo, insignia]);
    if (t.plazas) c.add(this.miniaturaCamara(-ANCHO_TARJETA / 2 + 50, -alto / 2 + 6, 70, alto - 12, t.plazas));
    const vista = { datos: t, fondo, insignia, alto, ancho: ANCHO_TARJETA };
    this.vistas.push(vista);
    this.pintar(vista);
    return vista;
  }

  /** Vista cenital del aparcamiento de la clínica: 4 plazas, ocupadas o libres. */
  private miniaturaCamara(x: number, y: number, w: number, h: number, plazas: boolean[]): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    // Asfalto con un poco de arena
    g.fillStyle(0x3a3f44, 1).fillRect(x, y, w, h);
    g.fillStyle(0xe9d8a6, 0.18).fillRect(x, y + h - 6, w, 6);
    g.lineStyle(1, 0x8b939a, 1).strokeRect(x, y, w, h);
    // Líneas de las plazas
    const n = plazas.length;
    const anchoPlaza = w / n;
    g.lineStyle(1.5, 0xffffff, 0.75);
    for (let k = 1; k < n; k++) g.lineBetween(x + k * anchoPlaza, y + 4, x + k * anchoPlaza, y + h * 0.62);
    // Coches (vistos desde arriba)
    const colores = [0x2ec4b6, 0xff7a59, 0xf4c97a, 0xdfe6ea];
    plazas.forEach((ocupada, k) => {
      if (!ocupada) return;
      const cx = x + k * anchoPlaza + anchoPlaza / 2;
      const cw = anchoPlaza * 0.64;
      const ch = h * 0.5;
      const cy = y + 6;
      g.fillStyle(colores[k % colores.length], 1).fillRoundedRect(cx - cw / 2, cy, cw, ch, 3);
      g.fillStyle(0x10303f, 0.85).fillRect(cx - cw / 2 + 1.5, cy + ch * 0.18, cw - 3, ch * 0.2); // parabrisas
      g.fillStyle(0x10303f, 0.6).fillRect(cx - cw / 2 + 1.5, cy + ch * 0.68, cw - 3, ch * 0.14); // luna trasera
    });
    // Ruido de vídeo y piloto de grabación
    g.lineStyle(1, 0xffffff, 0.05);
    for (let ly = y + 3; ly < y + h; ly += 4) g.lineBetween(x, ly, x + w, ly);
    g.fillStyle(0xff3355, 1).fillCircle(x + w - 5, y + h - 5, 2);
    return g;
  }

  private pintar(v: Vista): void {
    const ANCHO_TARJETA = v.ancho;
    const pos = this.orden.indexOf(v.datos.id);
    const g = v.fondo;
    g.clear();
    rectRedondo(g, -ANCHO_TARJETA / 2, -v.alto / 2, ANCHO_TARJETA, v.alto, {
      relleno: pos >= 0 ? C.noche700 : C.noche800,
      borde: pos >= 0 ? C.fucsia600 : C.noche600,
    });
    const cx = -ANCHO_TARJETA / 2 + 24;
    if (pos >= 0) {
      g.fillStyle(C.champan500, 1).fillCircle(cx, 0, 14);
      v.insignia.setText(String(pos + 1));
    } else {
      g.lineStyle(1.5, C.cian500, 0.6).strokeCircle(cx, 0, 14);
      v.insignia.setText('');
    }
  }

  private alternar(id: string): void {
    const i = this.orden.indexOf(id);
    if (i >= 0) this.orden.splice(i, 1);
    else this.orden.push(id);
    this.vistas.forEach((v) => this.pintar(v));
    this.accion.habilitar(this.orden.length === this.puzle.tarjetas.length);
  }

  private comprobar(): void {
    if (this.orden.every((id, i) => id === this.puzle.orden[i])) {
      this.exito('El orden encaja. Hay una pista nueva.');
    } else {
      const aciertos = this.orden.filter((id, i) => id === this.puzle.orden[i]).length;
      this.fallo(`Ese orden no cuadra (${aciertos} de ${this.puzle.orden.length} en su sitio).`);
    }
  }

  protected textoAyuda(): string {
    return this.puzle.ayuda;
  }

  private dibujarReloj(x: number, y: number, r: number, minuto: number): void {
    const g = this.add.graphics();
    g.fillStyle(C.noche950, 1).fillCircle(x, y, r + 4);
    g.lineStyle(2, C.champan500, 1).strokeCircle(x, y, r + 4);
    g.fillStyle(C.papel, 1).fillCircle(x, y, r);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const largo = i % 3 === 0 ? 6 : 3;
      g.lineStyle(i % 3 === 0 ? 2 : 1, 0x123040, 1);
      g.lineBetween(
        x + Math.sin(a) * (r - 2),
        y - Math.cos(a) * (r - 2),
        x + Math.sin(a) * (r - 2 - largo),
        y - Math.cos(a) * (r - 2 - largo),
      );
    }
    const aH = (((minuto / 60) % 12) / 12) * Math.PI * 2;
    const aM = ((minuto % 60) / 60) * Math.PI * 2;
    g.lineStyle(3, 0x123040, 1).lineBetween(x, y, x + Math.sin(aH) * r * 0.5, y - Math.cos(aH) * r * 0.5);
    g.lineStyle(2, C.fucsia600, 1).lineBetween(x, y, x + Math.sin(aM) * r * 0.8, y - Math.cos(aM) * r * 0.8);
    g.fillStyle(C.champan500, 1).fillCircle(x, y, 2.5);
    g.lineStyle(1, 0xffffff, 0.8);
    g.beginPath();
    g.moveTo(x - r * 0.7, y - r * 0.5);
    g.lineTo(x - r * 0.15, y - r * 0.1);
    g.lineTo(x + r * 0.1, y - r * 0.55);
    g.moveTo(x - r * 0.15, y - r * 0.1);
    g.lineTo(x + r * 0.45, y + r * 0.35);
    g.strokePath();
  }
}
