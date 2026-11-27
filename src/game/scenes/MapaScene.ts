// Mapa de Zahora, Los Caños y Barbate: las 15 misiones agrupadas y el progreso.

import { Scene } from 'phaser';
import { eventos, obtener, puedeAcusar, TOTAL_MISIONES, VIDAS_INICIALES, vidas } from '../core/estado.ts';
import { busUi } from '../core/eventos.ts';
import type { EstadoMision } from '../core/tipos.ts';
import { MISIONES, type GrupoMision } from '../misiones.ts';
import { ANCHO, C, H, fondo, prepararCamara, rectRedondo, texto, zonaTactil } from '../ui/phaserUi.ts';

const GRUPOS: { grupo: GrupoMision; titulo: string; color: string }[] = [
  { grupo: 'lugar', titulo: 'POR ZAHORA, LOS CAÑOS Y BARBATE', color: H.cian400 },
  { grupo: 'arma', titulo: 'UNA MISIÓN POR CADA VEHÍCULO', color: H.fucsia600 },
  { grupo: 'testimonio', titulo: 'TESTIMONIOS · SE ABREN AL TERMINAR LAS 12', color: H.champan400 },
];

const ICONO: Record<EstadoMision, string> = { bloqueada: '🔒', disponible: '', descarte: '!', completada: '✓' };

export class MapaScene extends Scene {
  private aviso!: Phaser.GameObjects.Text;

  constructor() {
    super('Mapa');
  }

  create(): void {
    prepararCamara(this);
    fondo(this);
    const partida = obtener();

    texto(this, ANCHO / 2, 24, 'ZAHORA · LOS CAÑOS · BARBATE', {
      size: 10.5,
      color: H.cian400,
      origen: [0.5, 0.5],
      serif: false,
      negrita: true,
      espaciado: 2,
    });
    texto(this, ANCHO / 2, 48, 'El misterio de Tiger', { size: 21, origen: [0.5, 0.5], negrita: true });
    texto(this, ANCHO / 2, 70, 'Resuelve las misiones en el orden que quieras.', {
      size: 12,
      color: H.gris,
      origen: [0.5, 0.5],
      serif: false,
    });

    // ---------- Panel de progreso y vidas (justo bajo el subtítulo) ----------
    const completadas = partida.misiones.filter((m) => m.estado === 'completada').length;
    const v = vidas();
    const yPanel = 84;
    const altoPanel = 56;
    const panel = this.add.graphics();
    rectRedondo(panel, 20, yPanel, ANCHO - 40, altoPanel, { relleno: C.noche800, borde: C.fucsia600, alfaBorde: 0.5, radio: 14 });
    // Progreso (izquierda)
    texto(this, 34, yPanel + 12, 'MISIONES', { size: 9.5, color: H.cian400, serif: false, negrita: true, espaciado: 1.5 });
    texto(this, 34, yPanel + 25, `${completadas} / ${TOTAL_MISIONES}`, { size: 17, negrita: true, serif: false });
    const anchoBarra = 120;
    const xBarra = 104;
    rectRedondo(panel, xBarra, yPanel + 32, anchoBarra, 8, { relleno: C.noche600, radio: 4 });
    if (completadas > 0) {
      rectRedondo(panel, xBarra, yPanel + 32, (anchoBarra * completadas) / TOTAL_MISIONES, 8, { relleno: C.fucsia600, radio: 4 });
    }
    // Vidas (derecha, grandes)
    texto(this, ANCHO - 34, yPanel + 12, 'VIDAS', { size: 9.5, color: H.cian400, serif: false, negrita: true, espaciado: 1.5, origen: [1, 0] });
    for (let k = 0; k < VIDAS_INICIALES; k++) {
      const llena = k < v;
      const corazon = texto(this, ANCHO - 34 - (VIDAS_INICIALES - 1 - k) * 32, yPanel + 38, llena ? '♥' : '♡', {
        size: 28,
        color: llena ? H.fucsia600 : '#5b4f80',
        origen: [1, 0.5],
        serif: false,
      });
      if (llena && v === 1) this.tweens.add({ targets: corazon, scale: { from: 1, to: 1.15 }, duration: 500, yoyo: true, repeat: -1 });
    }

    const anchoCelda = (ANCHO - 40 - 16) / 3;
    const altoCelda = 80;
    let y = yPanel + altoPanel + 12;
    for (const g of GRUPOS) {
      texto(this, 20, y, g.titulo, { size: 9.5, color: g.color, serif: false, negrita: true, espaciado: 1.5 });
      y += 16;
      const indices = MISIONES.map((m, i) => (m.grupo === g.grupo ? i : -1)).filter((i) => i >= 0);
      indices.forEach((i, k) => {
        const col = k % 3;
        const fila = Math.floor(k / 3);
        const x = 20 + col * (anchoCelda + 8) + anchoCelda / 2;
        const cy = y + fila * (altoCelda + 8) + altoCelda / 2;
        this.celda(i, x, cy, anchoCelda, altoCelda, partida.misiones[i].estado);
      });
      y += Math.ceil(indices.length / 3) * (altoCelda + 8) + 4;
    }

    let pie = 'Abre el Cuaderno cuando quieras para revisar tus descartes.';
    if (partida.perdida) pie = 'Has perdido la partida. Empieza una nueva desde el Cuaderno o desde el inicio.';
    else if (partida.resuelta) pie = 'Caso resuelto. Puedes empezar otra partida desde el Cuaderno.';
    else if (puedeAcusar()) pie = 'Todas las pistas están sobre la mesa. Pulsa «Resolver el caso» cuando lo tengas.';
    this.aviso = texto(this, ANCHO / 2, y + 16, pie, {
      size: 12,
      color: puedeAcusar() ? H.champan400 : H.gris,
      origen: [0.5, 0.5],
      align: 'center',
      ancho: ANCHO - 60,
      serif: false,
    });

    // Solo se repinta si cambia algo visible aquí (no al marcar notas en el cuaderno).
    const firma = (p = obtener()) => `${p.misiones.map((m) => m.estado).join()}|${p.resuelta}|${p.semilla}|${p.vidas}|${p.perdida}`;
    const actual = firma(partida);
    const off = eventos.on('cambio', (p) => {
      if (this.scene.isActive() && firma(p) !== actual) this.scene.restart();
    });
    this.events.once('shutdown', off);
  }

  private celda(i: number, x: number, y: number, w: number, h: number, estado: EstadoMision): void {
    const info = MISIONES[i];
    const c = zonaTactil(this, x, y, w, h, () => this.tocar(i));
    const g = this.add.graphics();
    const activa = estado === 'disponible' || estado === 'descarte';
    const borde =
      estado === 'completada' ? C.verde : estado === 'descarte' ? C.rojo : activa ? C.fucsia600 : C.noche600;
    rectRedondo(g, -w / 2, -h / 2, w, h, {
      relleno: activa ? C.noche700 : C.noche800,
      alfa: estado === 'bloqueada' ? 0.5 : 1,
      borde,
      alfaBorde: estado === 'bloqueada' ? 0.5 : 0.95,
      grosor: activa ? 2 : 1.5,
      radio: 12,
    });
    const apagado = estado === 'bloqueada';
    const numero = texto(this, -w / 2 + 9, -h / 2 + 7, info.numeral, {
      size: 11,
      negrita: true,
      color: apagado ? H.gris : H.champan400,
      serif: false,
    });
    const icono = texto(this, w / 2 - 9, -h / 2 + 6, ICONO[estado], {
      size: 12,
      negrita: true,
      color: estado === 'completada' ? H.verde : H.rojo,
      origen: [1, 0],
      serif: false,
    });
    // Primero la referencia (abajo, hasta 2 líneas); el título ocupa el hueco que queda encima.
    const ref = texto(this, -w / 2 + 9, h / 2 - 6, info.referencia, {
      size: 8.5,
      color: H.gris,
      serif: false,
      ancho: w - 14,
      origen: [0, 1],
      interlineado: 0,
    });
    const yTitulo = -h / 2 + 21;
    const huecoTitulo = h / 2 - 6 - ref.height - 3 - yTitulo;
    let titulo!: Phaser.GameObjects.Text;
    for (const size of [12, 11, 10, 9.5, 9]) {
      titulo?.destroy();
      titulo = texto(this, -w / 2 + 9, yTitulo, info.titulo, {
        size,
        negrita: true,
        color: apagado ? H.gris : H.crema,
        ancho: w - 16,
        interlineado: 0,
      });
      if (titulo.height <= huecoTitulo) break;
    }
    c.add([g, numero, icono, titulo, ref]);
    if (activa) {
      this.tweens.add({ targets: c, scale: { from: 1, to: 1.03 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  private tocar(i: number): void {
    const m = obtener().misiones[i];
    if (obtener().perdida) {
      busUi.emit('partida-perdida', {});
    } else if (m.estado === 'disponible') {
      this.cameras.main.fadeOut(160, 6, 42, 58);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(MISIONES[i].escena));
    } else if (m.estado === 'descarte' || m.estado === 'completada') {
      busUi.emit('ver-pista', { mision: i });
    } else {
      this.aviso.setText('Los testimonios se abren cuando termines las 12 misiones de lugares y armas.');
      this.aviso.setColor(H.rojo);
    }
  }
}
