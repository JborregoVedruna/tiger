// El papel del asiento trasero: descifrar un mensaje desplazado en el abecedario.
// El jugador escribe a mano el desplazamiento y la frase descifrada.

import type { Rng } from '../core/rng.ts';
import { abrirFormulario } from '../overlay/overlay.ts';
import { generarServilleta, type PuzleCifrado } from '../puzzles/servilleta.ts';
import { ANCHO, H, rectRedondo, texto } from '../ui/phaserUi.ts';
import { MisionBase } from './MisionBase.ts';

/** Compara frases sin tener en cuenta mayúsculas, tildes, signos ni espacios de más. */
export function normalizarFrase(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class CifradoScene extends MisionBase {
  private puzle!: PuzleCifrado;

  constructor(indice: number) {
    super(indice);
  }

  protected construir(rng: Rng): void {
    this.puzle = generarServilleta(rng);

    const y = this.yLibre(4);
    const msg = texto(this, ANCHO / 2, y + 40, this.puzle.cifrado, {
      size: 18,
      mono: true,
      negrita: true,
      color: '#1f3f8f',
      ancho: ANCHO - 90,
      align: 'center',
      origen: [0.5, 0],
      interlineado: 8,
    });
    const nota = texto(
      this,
      ANCHO / 2,
      msg.y + msg.height + 16,
      `En una esquina, con otra letra:\n«${this.puzle.lema}» (${this.puzle.dueno})\n«La clave son sus palabras.»`,
      { size: 12.5, cursiva: true, color: H.tinta, ancho: ANCHO - 90, align: 'center', origen: [0.5, 0], interlineado: 3 },
    );
    const alto = nota.y + nota.height + 20 - y;
    const g = this.add.graphics();
    this.children.moveBelow(g, msg);
    rectRedondo(g, 30, y, ANCHO - 60, alto, { relleno: 0xfbf7ee, radio: 4 });
    g.lineStyle(1, 0xd9cfb8, 1);
    for (let x = 38; x < ANCHO - 38; x += 8) g.strokeCircle(x, y + 8, 2);
    g.fillStyle(0x1f3f8f, 0.18).fillCircle(ANCHO - 70, y + alto - 26, 18).fillCircle(ANCHO - 54, y + alto - 18, 9);
    texto(this, 44, y + 14, 'PAPEL DEL ASIENTO TRASERO', { size: 10, color: '#c2452c', negrita: true, serif: false, espaciado: 2 });

    texto(
      this,
      ANCHO / 2,
      y + alto + 22,
      'Cada letra se movió hacia delante en el abecedario (A→B→C…; después de la Z vuelve a la A). Calcula cuántas posiciones y deshaz el cambio en papel.',
      { size: 12.5, color: H.gris, ancho: ANCHO - 60, align: 'center', origen: [0.5, 0], serif: false, interlineado: 3 },
    );

    this.botonAccion('Escribir la solución', () => this.abrirRespuesta());
    this.avisar('Necesitas dos cosas: el desplazamiento y la frase descifrada.');
  }

  private abrirRespuesta(): void {
    abrirFormulario({
      antetitulo: `Misión ${this.info.numeral} · ${this.info.titulo}`,
      titulo: 'Descifra el papel',
      descripcion: 'Escribe cuántas posiciones se desplazó cada letra y la frase que aparece al deshacerlo.',
      campos: [
        { id: 'clave', etiqueta: 'Desplazamiento', tipo: 'numero', placeholder: 'Un número del 1 al 25' },
        { id: 'frase', etiqueta: 'Frase descifrada', tipo: 'texto', placeholder: 'Escribe el mensaje' },
      ],
      textoBoton: 'Comprobar',
      textoCancelar: 'Volver a mirar el papel',
      validar: (v) => {
        const clave = Number(v.clave);
        const frase = normalizarFrase(v.frase ?? '');
        if (!v.clave?.trim() || !frase) return 'Rellena los dos campos.';
        const bienClave = clave === this.puzle.clave;
        const bienFrase = frase === normalizarFrase(this.puzle.claro);
        if (bienClave && bienFrase) return null;
        this.fallo('El papel sigue sin tener sentido.');
        if (bienClave) return 'El desplazamiento es correcto, pero la frase no. Revisa letra a letra.';
        if (bienFrase) return 'La frase es correcta, pero ese no es el desplazamiento.';
        return 'Ni el desplazamiento ni la frase son correctos.';
      },
      alAcertar: () => this.exito('¡Descifrado! El papel por fin tiene sentido.'),
    });
  }

  protected textoAyuda(): string {
    return this.puzle.ayuda;
  }
}
