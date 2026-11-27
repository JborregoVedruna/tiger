// Emisor de eventos tipado y minúsculo, compartido entre Phaser y los paneles DOM.

type Oyente<P> = (payload: P) => void;

export class Emisor<M extends Record<string, unknown>> {
  private oyentes: { [K in keyof M]?: Set<Oyente<M[K]>> } = {};

  on<K extends keyof M>(tipo: K, fn: Oyente<M[K]>): () => void {
    let set = this.oyentes[tipo];
    if (!set) {
      set = new Set();
      this.oyentes[tipo] = set;
    }
    set.add(fn);
    return () => {
      this.oyentes[tipo]?.delete(fn);
    };
  }

  emit<K extends keyof M>(tipo: K, payload: M[K]): void {
    const set = this.oyentes[tipo];
    if (!set) return;
    for (const fn of [...set]) fn(payload);
  }
}

/** Peticiones de la interfaz Phaser hacia los paneles superpuestos. */
export const busUi = new Emisor<{
  'ver-pista': { mision: number };
  'ir-a-mision': { mision: number };
  modal: { abierto: boolean };
  'partida-perdida': Record<string, never>;
}>();
