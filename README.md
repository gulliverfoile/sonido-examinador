README.md
markdown
# 🔊 Planetary Audio – Módulo de audio planetario con examinador TUSE

**Simulación de sonido en distintas atmósferas planetarias con un adaptador inteligente que examina, protege y decide cómo debe reproducirse cada sonido.**

---

## 🌍 ¿Qué es esto?

Un módulo de audio que modela **cómo se escucharía un instrumento en diferentes atmósferas** (Tierra, Marte, Venus, Titán) aplicando física realista: velocidad del sonido, absorción, densidad, etc.  
Pero no solo calcula: incluye un **examinador interno (TUSE)** que evalúa si el sonido resultante es seguro, coherente y ético antes de entregarlo al motor de audio.

---

## 🎯 ¿Qué problema resuelve?

Imagina que tu juego o simulación cambia de planeta. Un mismo sonido (una flauta) se comporta distinto:
- En **Marte** los agudos se pierden casi de inmediato.
- En **Venus** el volumen puede resultar ensordecedor.
- En **Titán** el sonido se propaga con un retardo extraño.

Sin un control, el motor de audio podría recibir parámetros absurdos o peligrosos (volúmenes > 2.0, frecuencias inaudibles, etc.).  
**El examinador TUSE actúa como un guardián**: analiza cada sonido y decide si reproducirlo completo, degradarlo de forma segura, inferir valores faltantes o rechazarlo.

---

## 🧱 Arquitectura
┌─────────────────────────┐
│ planetaryAudio │ ← fachada pública
└───────────┬─────────────┘
│
┌───────────▼─────────────┐
│ SoundPropagator │ ← física + llamada al examinador
└───────────┬─────────────┘
│
┌───────────▼─────────────┐
│ Examinador TUSE │ ← 6 pasos de decisión
└───────────┬─────────────┘
│
┌───────────▼─────────────┐
│ Core (motor del juego) │ ← reproduce o rechaza
└─────────────────────────┘

text

- **Dominio puro** (atmósferas, instrumentos): sin dependencias externas, solo física.
- **Propagador**: calcula los parámetros acústicos para una fuente y un oyente.
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

