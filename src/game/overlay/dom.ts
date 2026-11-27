// Mini ayudante para construir DOM con seguridad (todo el texto va por textContent).

type Hijo = Node | string | number | null | undefined | false;
type Props = Record<string, unknown> & { class?: string };

export function h<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  props: Props = {},
  ...hijos: (Hijo | Hijo[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(props)) {
    if (valor === undefined || valor === null || valor === false) continue;
    if (clave === 'class') el.className = String(valor);
    else if (clave.startsWith('on') && typeof valor === 'function') {
      el.addEventListener(clave.slice(2).toLowerCase(), valor as EventListener);
    } else el.setAttribute(clave, valor === true ? '' : String(valor));
  }
  for (const hijo of hijos.flat()) {
    if (hijo === null || hijo === undefined || hijo === false) continue;
    el.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo)));
  }
  return el;
}

export function $(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`No se encontró ${selector}`);
  return el;
}
