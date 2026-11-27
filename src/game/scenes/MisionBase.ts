// Escena base de las misiones: cabecera, instrucciones, mensajes, ayuda tras fallos
// y entrega de la pista al resolver el puzle.

import { Scene } from 'phaser';
import { eventos, obtener, registrarFallo, resolverPuzle, TOTAL_MISIONES, VIDAS_INICIALES, vidas } from '../core/estado.ts';
import { crearRng, derivar, type Rng } from '../core/rng.ts';
import { MISIONES, type InfoMision } from '../misiones.ts';
import { ANCHO, H, boton, fondo, prepararCamara, texto, type Boton } from '../ui/phaserUi.ts';

export const Y_MENSAJE = 628;
export const Y_ACCION = 678;

export abstract class MisionBase extends Scene {
  protected indice: number;
  protected info: InfoMision;
  protected mensaje!: Phaser.GameObjects.Text;
  protected instrucciones!: Phaser.GameObjects.Text;
  private botonAyuda?: Boton;
  private corazones!: Phaser.GameObjects.Text;
  private terminada = false;

  constructor(indice: number) {
    super(MISIONES[indice].escena);
    this.indice = indice;
    this.info = MISIONES[indice];
  }

  create(): void {
    this.terminada = false;
    this.botonAyuda = undefined;
    prepararCamara(this);
    fondo(this);

    if (obtener().misiones[this.indice].estado !== 'disponible' || obtener().perdida) {
      this.scene.start('Mapa');
      return;
    }

    boton(this, 56, 34, 88, 34, '‹ Volver', () => this.volver(), 'fantasma', 13);
    this.corazones = texto(this, ANCHO / 2, 34, '', { size: 24, origen: [0.5, 0.5], serif: false, espaciado: 3 });
    this.pintarVidas();
    texto(this, ANCHO / 2, 70, this.info.titulo, {
      size: 21,
      color: H.champan400,
      origen: [0.5, 0.5],
      negrita: true,
      align: 'center',
      ancho: ANCHO - 40,
    });
    texto(this, ANCHO / 2, 95, `MISIÓN ${this.info.numeral}/${TOTAL_MISIONES} · ${this.info.referencia.toUpperCase()}`, {
      size: 10.5,
      color: H.cian400,
      origen: [0.5, 0.5],
      serif: false,
      negrita: true,
      espaciado: 1.5,
    });
    this.instrucciones = texto(this, 22, 112, this.info.instrucciones, {
      size: 13,
      ancho: ANCHO - 44,
      color: H.crema,
      interlineado: 3,
    });
    this.mensaje = texto(this, ANCHO / 2, Y_MENSAJE, '', {
      size: 13.5,
      ancho: ANCHO - 44,
      align: 'center',
      origen: [0.5, 0.5],
      serif: false,
    });

    const rng = crearRng(derivar(obtener().semilla, this.indice));
    this.construir(rng);

    if (obtener().misiones[this.indice].fallos >= 2) this.mostrarBotonAyuda();

    // Si se empieza una partida nueva desde el cuaderno, este puzle ya no vale.
    const semilla = obtener().semilla;
    const off = eventos.on('cambio', (p) => {
      if (p.semilla !== semilla && this.scene.isActive()) this.scene.start('Mapa');
    });
    this.events.once('shutdown', off);
  }

  /** Primera coordenada Y libre bajo las instrucciones. */
  protected yLibre(margen = 12): number {
    return this.instrucciones.y + this.instrucciones.height + margen;
  }

  /** Espacio vertical disponible desde `y` hasta el mensaje inferior. */
  protected disponibleDesde(y: number): number {
    return Y_MENSAJE - 22 - y;
  }

  /** Dibuja el puzle. Recibe un RNG determinista para esta partida y misión. */
  protected abstract construir(rng: Rng): void;

  /** Texto de ayuda que aparece tras dos fallos. */
  protected abstract textoAyuda(): string;

  protected botonAccion(etiqueta: string, alPulsar: () => void): Boton {
    return boton(this, ANCHO / 2, Y_ACCION, ANCHO - 56, 52, etiqueta, alPulsar, 'primario', 17);
  }

  protected avisar(msg: string, tipo: 'info' | 'error' | 'exito' = 'info'): void {
    this.mensaje.setText(msg);
    this.mensaje.setColor(tipo === 'error' ? H.rojo : tipo === 'exito' ? H.champan400 : H.crema);
    this.mensaje.setAlpha(0);
    this.tweens.add({ targets: this.mensaje, alpha: 1, duration: 180 });
  }

  private pintarVidas(): void {
    const v = vidas();
    this.corazones.setText('♥'.repeat(v) + '♡'.repeat(Math.max(0, VIDAS_INICIALES - v)));
    this.corazones.setColor(v === 0 ? H.rojo : H.fucsia600);
  }

  /** Respuesta fallida: resta una vida (o pierde la partida si ya no quedaban). */
  protected fallo(msg: string): void {
    const r = registrarFallo(this.indice);
    this.cameras.main.shake(220, 0.006);
    this.pintarVidas();
    this.tweens.add({ targets: this.corazones, scale: { from: 1.5, to: 1 }, duration: 300 });
    if (r.perdida) {
      this.avisar('Sin vidas… Has perdido la partida.', 'error');
      this.input.enabled = false;
      this.time.delayedCall(1200, () => {
        this.input.enabled = true;
        this.scene.start('Mapa');
      });
      return;
    }
    const vidasTexto =
      r.vidas === 0 ? 'No te quedan vidas: si vuelves a fallar, pierdes.' : `Pierdes una vida (te ${r.vidas === 1 ? 'queda 1' : `quedan ${r.vidas}`}).`;
    this.avisar(`${msg} ${vidasTexto}`, 'error');
    if (r.fallos >= 2) this.mostrarBotonAyuda();
  }

  private mostrarBotonAyuda(): void {
    if (this.botonAyuda) return;
    this.botonAyuda = boton(this, ANCHO - 56, 34, 88, 34, 'Ayuda', () => this.avisar(this.textoAyuda()), 'secundario', 13);
  }

  protected exito(msg = 'Resuelto. Has encontrado una pista.'): void {
    if (this.terminada) return;
    this.terminada = true;
    this.input.enabled = false;
    this.avisar(msg, 'exito');
    this.cameras.main.flash(260, 255, 122, 89);
    this.time.delayedCall(900, () => {
      this.input.enabled = true;
      resolverPuzle(this.indice);
      this.scene.start('Mapa');
    });
  }

  protected volver(): void {
    this.scene.start('Mapa');
  }
}
