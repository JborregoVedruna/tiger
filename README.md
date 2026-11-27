# ¿Quién llevó a Tiger al veterinario?

Juego web de deducción inspirado en el Cluedo. Begoña, juglar y mamporrera de la Janda, investiga
quién se adelantó a llevar a Tiger, el gato de Neyba, de Zahora al veterinario de Barbate.
Hecho con **Astro**, **Tailwind CSS 4**, **Phaser 3**, **GSAP** y **Lenis**, y pensado primero para móvil.

- **Sospechosos (6):** Oscar Plano, Fatier, Sarita, Amic, Judío y la Madre de Begoña.
- **Vehículos (6):** coche, taxi, moto, bicicleta, autobús y patinete eléctrico.
- **Franjas horarias (6):** 9:00, 10:30, 12:00, 13:30, 15:00 y 16:30.
- **Historia predeterminada:** Judío, en coche, a las 12:00. La alternativa falsa (Oscar Plano, en taxi,
  a las 15:00) nunca se descarta, así que la decisión final es siempre entre esas dos.

Por compatibilidad con el motor, las categorías internas siguen llamándose `sospechoso`, `arma`
(vehículo) y `lugar` (franja horaria). El guion completo está en `src/data/caso.ts`.

## Puesta en marcha

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # genera ./dist
```

## Rutas

| Ruta          | Contenido                                                        |
| :------------ | :--------------------------------------------------------------- |
| `/`           | Portada con la historia y accesos al expediente, juego y ajustes |
| `/personajes` | Los 6 sospechosos                                                 |
| `/vehiculos`  | Los 6 vehículos                                                   |
| `/horarios`   | Las 6 franjas horarias                                            |
| `/ajustes`    | Historia predeterminada o aleatoria                              |
| `/jugar`      | El juego (Phaser) con cuaderno, descartes, vidas y acusación     |

## Cómo funciona una partida

1. **12 misiones** (seis por Zahora, Los Caños y Barbate y una por cada vehículo), en el orden que quieras. Cada una
   da una pista; en cada descarte eliges 1 elemento de entre los 18. Quedan siempre 2 candidatos por categoría.
2. **3 testimonios** (vecinos, recepcionista de la clínica y socorristas), que se abren al terminar las 12.
   Sus afirmaciones condicionales solo encajan con una combinación.
3. **3 vidas:** cada respuesta fallida en una misión resta una; si fallas sin vidas, pierdes la partida.
4. Con todo resuelto, **«Resolver el caso: Acusar»**.

| Misión                        | Relación                      | Puzle                                   |
| :---------------------------- | :---------------------------- | :-------------------------------------- |
| El perchero de Neyba          | Casa de Neyba                 | Emparejar objetos con sospechosos       |
| Los vasos del chiringuito     | Chiringuito                   | Emparejar vasos por sus rasgos          |
| La nota en la arena           | Playa de Zahora               | Reconstruir una nota de 10 trozos       |
| Las huellas de la Breña       | Parque de la Breña            | Sudoku 6×6                              |
| El móvil del probador         | Tienda de deportes            | Teclado y pantalla del móvil            |
| La factura de la clínica      | Clínica veterinaria           | Reconstruir la caja del día             |
| La cámara del aparcamiento    | Coche                         | Ordenar fotogramas                      |
| El papel del asiento trasero  | Taxi                          | Cifrado por desplazamiento              |
| La radio de la moto           | Moto                          | Ordenar canciones por duración          |
| El aparcabicis                | Bicicleta                     | Lógica de posiciones                    |
| Los billetes del autobús      | Autobús                       | Reconstruir una parada con la recaudación |
| El candado del patinete       | Patinete eléctrico            | Candado de 3 dígitos                    |
| Los vecinos de Zahora         | Testimonio                    | Ordenar 6 sucesos                       |
| El transportín                | Testimonio                    | Emparejar restos con su procedencia     |
| El careo de los socorristas   | Testimonio                    | Uno miente                              |

## Despliegue

`.github/workflows/deploy.yml` publica en GitHub Pages en cada push a `master`
(Settings → Pages → Source: GitHub Actions).

El progreso se guarda en el `localStorage` del navegador (`partida:v1` y `ajustes:v1`).
