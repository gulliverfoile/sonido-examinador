# Audio Planetario Interactivo

Este repositorio contiene dos implementaciones del sistema de audio planetario, que modela cómo sonarían distintos instrumentos en las atmósferas de otros planetas (Tierra, Marte, Venus, Titán). El sistema calcula la velocidad del sonido, la atenuación, la absorción y la propagación, y aplica un examinador lógico-ético para decidir si un sonido es viable.

## Archivos incluidos

### 1. `planetary-audio-standalone.js` (módulo original)

- **Descripción:** Versión monolítica en JavaScript puro (sin dependencias) que contiene toda la lógica planetaria.
- **Contenido:**
  - Clases y gestores de atmósferas (`Atmosphere`, `atmosphereManager`)
  - Registro de instrumentos (`instrumentRegistry`)
  - Examinador TUSE (corazón del sistema) que analiza, infiere y negocia parámetros
  - Propagador de sonido (`SoundPropagator`) que calcula pitch, volumen, corte y retardo según atmósfera y distancia
  - Fachada principal `planetaryAudio` lista para integrarse en un motor de juego
  - Core simulado (`MockCore`) para pruebas en Node.js
  - Demo autoejecutable que muestra casos de uso en consola
- **Uso:**
  - Se puede ejecutar directamente con Node.js: `node planetary-audio-standalone.js`
  - Se puede importar como módulo en otro proyecto: `const planetaryAudio = require('./planetary-audio-standalone.js');`
- **Objetivo:** Servir como núcleo de cálculo sin interfaz gráfica; ideal para integrarlo en videojuegos, simulaciones o como backend de una aplicación web.

### 2. `planetary-audio-interactivo.html` (aplicación web gráfica)

- **Descripción:** Versión interactiva que envuelve la lógica anterior (reescrita ligeramente para el navegador) y añade:
  - Síntesis de audio real usando la **Web Audio API** (osciladores, filtros, envolventes)
  - Interfaz gráfica con:
    - Selector de planeta
    - Selector de instrumento
    - Teclado de 8 notas (Do4 a Do5)
    - Visualizador de forma de onda en tiempo real (canvas)
    - Minimapa con la posición de la fuente de sonido y el oyente
    - Panel de datos atmosféricos y parámetros calculados en vivo
    - Indicador de estado (OK, parcial, rechazado)
- **Uso:**
  - Simplemente abre el archivo `.html` en cualquier navegador moderno (Chrome, Firefox, Edge, Safari).
  - **Importante:** La Web Audio API requiere interacción del usuario (clic) para iniciar el contexto de audio. Haz clic en cualquier parte de la página o en una nota para habilitar el sonido.
- **Objetivo:** Hacer el sistema accesible a cualquier persona sin necesidad de instalar nada, permitiendo experimentar auditivamente las diferencias planetarias.

## Cómo probar rápidamente (GitHub Pages)

1. Sube ambos archivos a un repositorio de GitHub.
2. Ve a la configuración del repositorio > **Pages**.
3. Selecciona la rama principal (main) y la carpeta raíz.
4. Guarda. En unos segundos tendrás una URL pública como `https://tuusuario.github.io/planetary-audio/planetary-audio-interactivo.html`.
5. Comparte el enlace para que cualquiera pueda probarlo.

## Estructura recomendada del repositorio
/
├── planetary-audio-standalone.js # Módulo original Node.js
├── planetary-audio-interactivo.html # Demo interactiva para navegador
├── README.md # Este archivo
└── (opcional) assets/ # Imágenes, iconos, etc.

text

## Relación entre los dos archivos

- El HTML **contiene una reimplementación adaptada** de las clases de atmósferas, instrumentos, propagador y examinador (porque la Web Audio API necesita ejecutarse en el navegador y requiere algunos ajustes). La lógica planetaria es idéntica.
- Si se desea una sola fuente de verdad, se puede extraer la lógica pura a un archivo `.js` compartido e importarlo en ambos entornos. La demo HTML actual es autocontenida para facilitar su distribución.

## Créditos

Sistema original desarrollado como exploración de síntesis de audio en entornos planetarios. La versión web interactiva se generó para hacerlo accesible a más personas.
- **Examinador TUSE**: aplica el algoritmo de 6 pasos (Hechos, Creatividad, Lógica, Ética, Negociación, Coherencia) para decidir el destino del sonido.
- **Fachada (`planetaryAudio`)**: API sencilla para el resto del juego.

---

## 🧪 El Adaptador/Examinador TUSE

Es el corazón del sistema. Sigue una plantilla fija de 6 pasos:

1. **Hechos** – Analiza los parámetros crudos: ¿volumen excesivo? ¿corte inaudible? ¿distancia extrema?
2. **Creatividad** – Genera hasta 4 opciones: OK, PARCIAL (valores limitados), INFERIDO (por historial) o RECHAZADO.
3. **Lógica** – Descarta opciones incoherentes (pitch negativo, cutoff > 22 kHz).
4. **Ética** – Protege al jugador: no permite volúmenes inferidos >1.5, ni sonidos inaudibles que gasten CPU.
5. **Negociación** – Añade metadatos (flags) para trazabilidad.
6. **Coherencia** – Elige la mejor opción por peso (OK=10, INFERIDO=7, PARCIAL=5, RECHAZADO=0).

Esto convierte al módulo en un **adaptador inteligente** que no solo traduce entre dominio y motor, sino que toma decisiones con criterio.

---

## 🚀 Cómo usar

### Ejecutar la demo
```bash
node planetary-audio-standalone.js
Verás pruebas con distintas atmósferas, instrumentos y condiciones extremas, mostrando los logs y decisiones del examinador.

Integrarlo en tu proyecto
Copia el archivo.

Proporciona un objeto core con:

log(mensaje, nivel)

emit(evento, datos)

audio.playProcessed(datos)

getPlayer() (opcional, para actualizar posición)

Inicializa:

js
planetaryAudio.init(core);
planetaryAudio.onEnter({ atmosphere: 'marte' });
planetaryAudio.playSound('flauta', 440, { x: 10, y: 20 });
¡Listo! El examinador se encarga del resto.

📦 Contenido del monolito
Atmosphere + atmosphereManager: datos y física de atmósferas.

instrumentRegistry: definición de instrumentos y su respuesta atmosférica.

SoundPropagator: cálculos acústicos.

ExaminadorAudio: implementación completa del algoritmo TUSE.

MockCore: motor simulado para pruebas autónomas.

✨ ¿Por qué es especial?
Resiliente: nunca crashea, siempre devuelve una decisión controlada.

Seguro: evita daño auditivo y parámetros absurdos.

Trazable: cada sonido lleva flags que explican cómo fue procesado.

Modular y portable: un solo archivo, sin dependencias, listo para cualquier proyecto JavaScript.

