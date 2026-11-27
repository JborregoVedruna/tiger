// Punto de entrada del juego: carga la partida, arranca Phaser y conecta los paneles DOM.

import { Game } from 'phaser';
import { crearConfig } from './config.ts';
import { cargarOCrear } from './core/estado.ts';
import { busUi } from './core/eventos.ts';
import { MISIONES } from './misiones.ts';
import { iniciarOverlay } from './overlay/overlay.ts';

export function arrancar(contenedor: HTMLElement): Game {
  cargarOCrear();
  iniciarOverlay();
  const juego = new Game(crearConfig(contenedor));
  // Al terminar una misión, los paneles piden ir directamente a la siguiente.
  busUi.on('ir-a-mision', ({ mision }) => {
    for (const escena of juego.scene.getScenes(true)) juego.scene.stop(escena.scene.key);
    juego.scene.start(MISIONES[mision].escena);
  });
  // Mientras hay un panel abierto (y un instante después de cerrarlo) el juego no recibe toques.
  let temporizador = 0;
  busUi.on('modal', ({ abierto }) => {
    window.clearTimeout(temporizador);
    if (abierto) juego.input.enabled = false;
    else temporizador = window.setTimeout(() => (juego.input.enabled = true), 300);
  });
  return juego;
}
