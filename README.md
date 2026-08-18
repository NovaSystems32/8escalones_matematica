# Los 8 Escalones de la Matemática

Juego de concurso matemático para el aula, pensado para proyectarse en el televisor de la clase mientras 5 participantes suben físicamente una escalera dibujada en el piso, respondiendo preguntas de matemática de opción múltiple (A, B, C, D).

No necesita instalación de servidor ni conexión a internet para jugar (solo para instalar las dependencias la primera vez). Todo el progreso de la partida se guarda automáticamente en el navegador.

---

## 1. Qué vas a necesitar

- Una computadora (Windows, Mac o Linux) con **Node.js** instalado (versión 18 o superior). Si no lo tenés, descargalo gratis desde [nodejs.org](https://nodejs.org).
- Un navegador moderno: Google Chrome, Microsoft Edge o Firefox actualizados.
- Un televisor o proyector conectado a la computadora (por cable HDMI, o por duplicado/extensión de pantalla).

No hace falta saber programar para usar el juego día a día: solo para la instalación inicial vas a copiar y pegar algunos comandos.

---

## 2. Instalación (una sola vez)

1. Abrí una terminal (en Windows: `PowerShell` o `Git Bash`; en Mac: `Terminal`) dentro de la carpeta del proyecto.
2. Instalá las dependencias:

```bash
npm install
```

Este paso puede tardar uno o dos minutos y solo hace falta hacerlo una vez (o cuando descargues una versión nueva del proyecto).

---

## 3. Cómo iniciar el juego

Cada vez que quieras jugar, abrí una terminal en la carpeta del proyecto y ejecutá:

```bash
npm run dev
```

Vas a ver un mensaje como:

```
  ➜  Local:   http://localhost:5173/
```

Dejá esa terminal abierta mientras estés jugando (es el "motor" que hace funcionar la aplicación). Ahora abrí tu navegador en esa dirección.

### 3.1. Página de inicio

En `http://localhost:5173/` vas a encontrar la pantalla de **configuración de la partida**, donde cargás:

- Institución y docente (opcional).
- Nombre y color de cada uno de los 5 participantes.
- Orden de participación (con las flechas ↑ ↓).
- Tiempo para responder (15, 20, 30, 45 o 60 segundos — 30 por defecto).
- Sonido y voz activados o no.

Al presionar **"🚀 Comenzar partida"** se abre automáticamente el **panel de control**.

---

## 4. Panel de control (para la docente o el/la estudiante operador/a)

Dirección: `http://localhost:5173/control`

Se usa desde la computadora (o una tablet) y permite manejar todo el juego:

- Elegir qué participante responde.
- Mostrar la siguiente pregunta de su categoría correspondiente.
- Iniciar, pausar y reiniciar el reloj.
- Marcar la opción que dijo el participante (A, B, C o D) — **todavía no se revela si es correcta**.
- Confirmar la respuesta (ahí sí se revela el resultado y, si acertó, sube un escalón).
- Pasar al siguiente participante.
- Usar los comodines de cada jugador (50 y 50 / cambiar pregunta / +30 segundos).
- Corregir manualmente el escalón de un participante si hace falta.
- Editar nombres y colores durante la partida.
- Administrar el banco de preguntas.
- Ver los resultados y exportarlos.
- Reiniciar la partida (pide confirmación).

---

## 5. Pantalla de presentación (para el televisor)

Dirección: `http://localhost:5173/presentacion`

Es la pantalla que ven los participantes y el resto del curso: muestra el título, quién está jugando, la pregunta, las 4 opciones, el reloj grande, el progreso de los 5 participantes en la escalera y el resultado de cada respuesta. **Nunca muestra la respuesta correcta antes de que el operador la confirme.**

### 5.1. Modo de dos ventanas (recomendado)

Es la forma más prolija de jugar, usando dos ventanas del mismo navegador que se mantienen sincronizadas automáticamente (sin necesidad de internet):

1. Conectá el televisor a la computadora por HDMI y configurá la pantalla en modo **"Extender"** (no "Duplicar"), para tener dos escritorios distintos.
2. En la computadora, abrí `http://localhost:5173/control`.
3. Hacé clic en el botón **"📺 Abrir presentación"** del panel de control: se abre una pestaña nueva con `/presentacion`.
4. Arrastrá esa segunda ventana hacia la pantalla del televisor y presioná **"⛶ Pantalla completa"** (o la tecla `F`).
5. Volvé a la ventana de control en la computadora y jugá desde ahí: cada acción (elegir participante, iniciar el reloj, marcar una respuesta, confirmar) se refleja al instante en la pantalla del televisor.

> La sincronización funciona mediante `BroadcastChannel`, una tecnología del navegador que comunica pestañas del mismo origen sin pasar por internet. Por eso **las dos ventanas tienen que ser del mismo navegador** (por ejemplo, las dos en Chrome) para sincronizarse.

### 5.2. Modo de una sola pantalla

Si el televisor simplemente **duplica** la pantalla de la computadora (no la extiende), o si estás practicando sin televisor, usá:

`http://localhost:5173/combinado`

Esta vista muestra arriba la presentación (lo que verían los participantes) y abajo el panel de control completo, todo en una sola ventana. Es ideal para proyectar tal cual, o para que la docente controle el juego desde la misma pantalla que se ve en el televisor.

---

## 6. Cómo modificar o agregar preguntas

Hay dos formas, sin necesitar reiniciar el servidor:

### 6.1. Desde la aplicación (recomendado)

En el panel de control, hacé clic en **"📚 Banco de preguntas"**. Ahí podés:

- Filtrar preguntas por escalón.
- Crear una pregunta nueva ("➕ Nueva pregunta").
- Editar o eliminar una existente (la eliminación pide confirmación).
- Activar o desactivar preguntas sin borrarlas (las inactivas no salen sorteadas).
- Exportar todo el banco a un archivo JSON (para respaldarlo o compartirlo con otra docente).
- Importar un banco de preguntas desde un archivo JSON.
- Restaurar el banco original de 80 preguntas en cualquier momento.

Los cambios se guardan automáticamente en el navegador (en `localStorage`), por lo que persisten aunque cierres la aplicación.

### 6.2. Editando el archivo original

El banco de preguntas inicial está en:

```
src/data/questions.default.json
```

Es un archivo de texto simple que podés abrir con cualquier editor. Cada pregunta tiene esta forma:

```json
{
  "id": "esc1-01",
  "escalon": 1,
  "categoria": "Numeración",
  "enunciado": "¿Cuál es el valor posicional del 7 en el número 47.328?",
  "opciones": ["7 unidades", "7 decenas", "7 centenas", "7 mil (7.000)"],
  "respuestaCorrecta": 3,
  "explicacion": "En 47.328 el dígito 7 ocupa el lugar de los miles.",
  "dificultad": "fácil",
  "tiempoSugerido": 30,
  "activa": true
}
```

- `escalon`: número del 1 al 8.
- `opciones`: siempre deben ser exactamente 4.
- `respuestaCorrecta`: la posición de la opción correcta, empezando en 0 (0 = A, 1 = B, 2 = C, 3 = D).

Si editás este archivo, tenés que usar **"♻ Restaurar banco inicial"** desde el panel de control (o borrar los datos del sitio en el navegador) para que tome los cambios, ya que una vez que jugaste una partida el banco se guarda personalizado en el navegador.

---

## 7. Comodines

Cada participante tiene **un solo comodín** para usar en toda la partida:

- **50 y 50**: oculta dos de las opciones incorrectas.
- **Cambio de pregunta**: descarta la pregunta actual y muestra otra de la misma categoría.
- **Tiempo extra**: suma 30 segundos al reloj.

Una vez usado, no se puede volver a usar otro comodín ese mismo juego.

---

## 8. Final del juego y desempate

Cuando un participante llega al escalón 8, el juego **no termina inmediatamente**: se espera a que el resto de los participantes complete su turno en esa misma ronda.

- Si al cerrar la ronda solo un participante llegó al escalón 8, se lo declara campeón/a.
- Si dos o más llegaron en la misma ronda, se activa el **desempate**: se muestra una nueva situación problemática y la docente marca quién respondió correctamente (o primero). Se puede repetir el desempate tantas veces como haga falta hasta que quede un único ganador o ganadora.

---

## 9. Atajos de teclado

Para agilizar el juego desde el panel de control:

| Tecla | Acción |
|---|---|
| `A` `B` `C` `D` | Seleccionar la respuesta marcada por el participante |
| Barra espaciadora | Iniciar o pausar el reloj |
| `Enter` | Confirmar la respuesta |
| `N` | Pasar al siguiente participante |
| `R` | Reiniciar el temporizador |
| `F` | Pantalla completa |
| `Escape` | Salir de pantalla completa |

También podés consultarlos en cualquier momento con el botón **"⌨ Atajos de teclado"**.

---

## 10. Resultados de la partida

Desde **"📊 Resultados"** (en el panel de control o al finalizar la partida) podés ver, por participante: cantidad de aciertos y errores, porcentaje de aciertos, escalón alcanzado, categoría con más errores y tiempo promedio de respuesta. Desde ahí se puede exportar la partida completa a **JSON** o a **CSV** (por ejemplo, para abrir en Excel).

---

## 11. Si se cierra el navegador por accidente

La partida se guarda automáticamente después de cada acción. Si volvés a abrir `http://localhost:5173/` con una partida sin terminar, la aplicación te va a preguntar si querés **continuarla**, **ver el resumen** o **comenzar una nueva**.

Para reiniciar la partida actual desde cero (mismos participantes, todos vuelven a la salida), usá el botón **"↺ Reiniciar partida"** del panel de control.

---

## 12. Cómo generar una versión lista para publicar

Si querés dejar la aplicación instalada de forma permanente en una computadora del aula (sin depender de la terminal cada vez), podés generar una versión optimizada:

```bash
npm run build
```

Esto crea una carpeta `dist/` con los archivos ya listos para usar. Para probarla localmente:

```bash
npm run preview
```

Para publicarla, basta con copiar el contenido de la carpeta `dist/` a cualquier servidor de archivos estáticos (por ejemplo, GitHub Pages, Netlify, Vercel, o un servidor interno de la escuela). No requiere base de datos ni backend: es un sitio 100% estático.

---

## 13. Pruebas automáticas

El proyecto incluye pruebas automáticas del motor del juego (avance de escalones, comodines, desempate, temporizador) y de la validez matemática de las 80 preguntas del banco inicial. Para ejecutarlas:

```bash
npm run test
```

---

## 14. Estructura del proyecto (para quien quiera modificar el código)

```
src/
  types.ts                 Tipos de TypeScript (Participante, Pregunta, Estado, etc.)
  data/
    categories.ts          Las 8 categorías y sus colores
    questions.default.json Banco inicial de 80 preguntas
  game/
    engine.ts               Funciones puras del juego (elegir pregunta, evaluar respuesta, etc.)
    gameReducer.ts           Lógica central de la partida (turnos, comodines, desempate)
    resultados.ts            Cálculo de estadísticas y exportación
  store/
    GameContext.tsx          Estado global de la partida + sincronización entre ventanas
    QuestionBankContext.tsx  Estado del banco de preguntas
  audio/
    sounds.ts                Sonidos generados con Web Audio API
    speech.ts                Voz en español con SpeechSynthesis
  components/                Todos los componentes visuales (pantallas, tarjetas, etc.)
```

---

## 15. Problemas frecuentes

- **No se escucha ningún sonido**: los navegadores bloquean el audio hasta que hay una interacción (un clic). Hacé un clic en cualquier parte del panel de control y probá de nuevo.
- **No funciona la voz**: la síntesis de voz (`SpeechSynthesis`) depende del navegador y del sistema operativo; si no está disponible, el juego sigue funcionando igual, solo sin la voz.
- **Las dos ventanas no se sincronizan**: verificá que ambas estén abiertas en el **mismo navegador** (no una en Chrome y otra en Firefox) y en la misma computadora.
- **Quiero borrar todo y empezar de cero**: usá "🏠 Terminar y volver al inicio" y luego "🆕 Comenzar una nueva partida", o borrá los datos del sitio desde la configuración del navegador.
