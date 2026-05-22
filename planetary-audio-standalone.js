// ============================================================
// planetary-audio-standalone.js
// Módulo de audio planetario monolítico e independiente
// Incluye: atmósferas, instrumentos, propagador, examinador TUSE,
// y un core simulado para pruebas.
// ============================================================

// ---------- 1. DOMINIO PURO: ATMÓSFERAS ----------
class Atmosphere {
  constructor(id, config) {
    this.id = id;
    this.name = config.name || id;
    this.pressure = config.pressure;         // atm
    this.temperature = config.temperature;   // Kelvin
    this.molarMass = config.molarMass;       // kg/mol
    this.gamma = config.gamma;               // coeficiente adiabático
    this.absorptionCoeffs = config.absorptionCoeffs || {};
  }

  get soundSpeed() {
    const R = 8.314;
    return Math.sqrt((this.gamma * R * this.temperature) / this.molarMass);
  }

  get density() {
    const R = 0.082;
    return (this.pressure * this.molarMass) / (R * this.temperature);
  }

  getAbsorption(frequency) {
    const freqs = Object.keys(this.absorptionCoeffs).map(Number).sort((a, b) => a - b);
    if (freqs.length === 0) return 0.001;
    let closest = freqs[0];
    for (const f of freqs) {
      if (f <= frequency) closest = f;
    }
    return this.absorptionCoeffs[closest] || 0.001;
  }
}

const atmosphereManager = {
  _atmospheres: {},

  init() {
    this.register('tierra', new Atmosphere('tierra', {
      name: 'Tierra',
      pressure: 1.0,
      temperature: 293,
      molarMass: 0.029,
      gamma: 1.4,
      absorptionCoeffs: { 100: 0.001, 1000: 0.003, 10000: 0.01 }
    }));
    this.register('marte', new Atmosphere('marte', {
      name: 'Marte',
      pressure: 0.006,
      temperature: 210,
      molarMass: 0.044,
      gamma: 1.3,
      absorptionCoeffs: { 100: 0.01, 1000: 0.1, 10000: 0.5 }
    }));
    this.register('venus', new Atmosphere('venus', {
      name: 'Venus',
      pressure: 92,
      temperature: 737,
      molarMass: 0.044,
      gamma: 1.3,
      absorptionCoeffs: { 100: 0.0001, 1000: 0.001, 10000: 0.05 }
    }));
    this.register('titan', new Atmosphere('titan', {
      name: 'Titán',
      pressure: 1.45,
      temperature: 94,
      molarMass: 0.028,
      gamma: 1.4,
      absorptionCoeffs: { 100: 0.0005, 1000: 0.002, 10000: 0.008 }
    }));
  },

  register(id, atmosphere) {
    this._atmospheres[id] = atmosphere;
  },

  get(id) {
    return this._atmospheres[id] || this._atmospheres['tierra'];
  }
};

// ---------- 2. DOMINIO PURO: INSTRUMENTOS ----------
const instrumentRegistry = {
  _templates: {},

  init() {
    this._templates = {
      'flauta': {
        type: 'wind',
        earthPitch: 1.0,
        adjustPitch: true,
        baseVolume: 0.7
      },
      'guitarra': {
        type: 'string',
        earthPitch: 1.0,
        adjustPitch: false,
        baseVolume: 0.8,
        resonanceScale: true
      },
      'tambor': {
        type: 'percussion',
        earthPitch: 1.0,
        adjustPitch: false,
        baseVolume: 0.9,
        dampingScale: true
      },
      'voz': {
        type: 'voice',
        earthPitch: 1.0,
        adjustPitch: false,
        baseVolume: 0.6
      }
    };
  },

  create(type, note, intensity) {
    const template = this._templates[type] || this._templates['guitarra'];
    return {
      type: template.type,
      note: note,
      intensity: intensity,
      adjustPitch: template.adjustPitch,
      earthPitch: template.earthPitch,
      baseVolume: template.baseVolume,
      resonanceScale: template.resonanceScale || false,
      dampingScale: template.dampingScale || false
    };
  }
};

// ---------- 3. EXAMINADOR TUSE (corazón del sistema) ----------
class ExaminadorAudio {
  constructor() {
    this._historial = new Map();
    this._perfil = {
      toleranciaFaltantes: 0.4,
      permitirInferencia: true,
      maxReintentos: 2
    };
  }

  examinar(params, core) {
    const id = `${params.instrument.type}_${params.atmosphere}`;

    // PASO 1: HECHOS
    const hechos = this._analizarHechos(params);
    if (!hechos.valido) {
      return { tipo: 'RECHAZADO', motivo: 'Parámetros inválidos o corruptos' };
    }

    // PASO 2: CREATIVIDAD (generar opciones)
    const opciones = [
      this._intentarCompleto(params, hechos),
      this._intentarParcial(params, hechos),
      this._perfil.permitirInferencia ? this._intentarInferir(params, hechos, id) : null,
      this._intentarRechazo(params, hechos, id)
    ].filter(o => o !== null);

    // PASO 3: LÓGICA
    const opcionesLogicas = opciones.filter(op => this._esCoherente(op));

    // PASO 4: ÉTICA
    const opcionesEticas = opcionesLogicas.filter(op => this._esEtico(op));

    if (opcionesEticas.length === 0) {
      return { tipo: 'RECHAZADO', motivo: 'Ninguna opción viable tras filtros éticos' };
    }

    // PASO 5: NEGOCIACIÓN
    const opcionesAjustadas = opcionesEticas.map(op => this._negociar(op, hechos));

    // PASO 6: COHERENCIA (elegir la mejor)
    return this._elegirMasCoherente(opcionesAjustadas);
  }

  _analizarHechos(params) {
    const hechos = {
      valido: true,
      tienePitch: typeof params.pitchMultiplier === 'number' && params.pitchMultiplier > 0,
      tieneVolumen: typeof params.volumeFactor === 'number' && params.volumeFactor >= 0,
      tieneCutoff: typeof params.cutoffFrequency === 'number' && params.cutoffFrequency > 0,
      tieneDistancia: typeof params.distance === 'number' && params.distance >= 0,
      volumenExcesivo: params.volumeFactor > 2.0,
      cutoffInaudible: params.cutoffFrequency < 20,
      distanciaExtrema: params.distance > 1000
    };
    if (!hechos.tienePitch || !hechos.tieneVolumen) {
      hechos.valido = false;
    }
    return hechos;
  }

  _intentarCompleto(params, hechos) {
    if (hechos.volumenExcesivo || hechos.cutoffInaudible) return null;
    return {
      tipo: 'OK',
      datos: {
        pitchMultiplier: params.pitchMultiplier,
        volumeFactor: params.volumeFactor,
        cutoffFrequency: params.cutoffFrequency,
        resonanceShift: params.resonanceShift || 0,
        delay: params.delay || 0
      }
    };
  }

  _intentarParcial(params, hechos) {
    const faltan = [];
    if (hechos.volumenExcesivo) faltan.push('volumeFactor');
    if (hechos.cutoffInaudible) faltan.push('cutoffFrequency');
    if (faltan.length / 4 > this._perfil.toleranciaFaltantes) return null;
    return {
      tipo: 'PARCIAL',
      datos: {
        pitchMultiplier: params.pitchMultiplier,
        volumeFactor: hechos.volumenExcesivo ? 1.0 : params.volumeFactor,
        cutoffFrequency: hechos.cutoffInaudible ? 200 : params.cutoffFrequency,
        resonanceShift: params.resonanceShift || 0,
        delay: params.delay || 0
      },
      faltan
    };
  }

  _intentarInferir(params, hechos, id) {
    const historial = this._historial.get(id) || [];
    if (historial.length > 0) {
      const ultimoExito = historial[historial.length - 1];
      return {
        tipo: 'INFERIDO',
        datos: {
          pitchMultiplier: params.pitchMultiplier || ultimoExito.pitchMultiplier,
          volumeFactor: hechos.volumenExcesivo ? 1.0 : params.volumeFactor,
          cutoffFrequency: hechos.cutoffInaudible ? ultimoExito.cutoffFrequency : params.cutoffFrequency,
          resonanceShift: params.resonanceShift || 0,
          delay: params.delay || 0
        },
        flags: ['inferido_por_historial']
      };
    }
    return null;
  }

  _intentarRechazo(params, hechos, id) {
    const historial = this._historial.get(id) || [];
    const tasaFallos = historial.filter(h => h.fallo).length;
    if (tasaFallos > 5 && !hechos.tienePitch) {
      return { tipo: 'RECHAZADO', motivo: 'Cliente con historial de fallos' };
    }
    return { tipo: 'RECHAZADO', motivo: 'Parámetros degradados' };
  }

  _esCoherente(opcion) {
    if (opcion.tipo === 'RECHAZADO') return true;
    const d = opcion.datos;
    if (d.pitchMultiplier <= 0 || d.pitchMultiplier > 10) return false;
    if (d.cutoffFrequency > 22000) return false;
    return true;
  }

  _esEtico(opcion) {
    if (opcion.tipo === 'INFERIDO') {
      if (opcion.datos.volumeFactor > 1.5) return false;
      if (!opcion.flags || opcion.flags.length === 0) return false;
    }
    if (opcion.datos.cutoffFrequency < 20) return false;
    return true;
  }

  _negociar(opcion, hechos) {
    if (opcion.tipo === 'INFERIDO') {
      return {
        ...opcion,
        flags: [...opcion.flags, `distancia:${hechos.distanciaExtrema ? 'extrema' : 'normal'}`]
      };
    }
    if (opcion.tipo === 'PARCIAL') {
      return {
        ...opcion,
        flags: ['degradado', ...(opcion.faltan || [])]
      };
    }
    return opcion;
  }

  _elegirMasCoherente(opciones) {
    const pesos = { OK: 10, INFERIDO: 7, PARCIAL: 5, RECHAZADO: 0 };
    return opciones.reduce((mejor, actual) =>
      pesos[actual.tipo] > pesos[mejor.tipo] ? actual : mejor
    );
  }
}

// ---------- 4. PROPAGADOR DE SONIDO ----------
class SoundPropagator {
  constructor() {
    this._atmosphere = null;
    this._activeSounds = [];
  }

  init(core) {
    this.core = core;
  }

  setAtmosphere(atmosphere) {
    this._atmosphere = atmosphere;
  }

  update(delta, listenerPos) {
    this._activeSounds = this._activeSounds.filter(sound => {
      sound.elapsed += delta;
      return sound.elapsed < sound.maxDuration;
    });
  }

  process(instrument, sourcePos, listenerPos) {
    if (!this._atmosphere) {
      return { tipo: 'RECHAZADO', motivo: 'Sin atmósfera definida' };
    }

    const dx = listenerPos.x - sourcePos.x;
    const dy = listenerPos.y - sourcePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const soundSpeed = this._atmosphere.soundSpeed;
    const density = this._atmosphere.density;
    const earthSoundSpeed = 340;

    let pitchMultiplier = 1.0;
    if (instrument.adjustPitch) {
      pitchMultiplier = soundSpeed / earthSoundSpeed;
    }

    const distanceAttenuation = 1 / (1 + distance);
    const densityFactor = density / 1.225;
    const volumeFactor = distanceAttenuation * Math.min(densityFactor, 2.0);

    const baseFrequency = instrument.note;
    const absorption = this._atmosphere.getAbsorption(baseFrequency);
    const cutoffFrequency = Math.max(200, baseFrequency * Math.exp(-absorption * distance));

    let resonanceShift = 0;
    if (instrument.resonanceScale) {
      resonanceShift = (soundSpeed / earthSoundSpeed - 1) * 0.3;
    }

    const audioParams = {
      instrument,
      atmosphere: this._atmosphere.id,
      distance,
      pitchMultiplier,
      volumeFactor: volumeFactor * instrument.baseVolume * instrument.intensity,
      cutoffFrequency,
      resonanceShift,
      delay: distance / soundSpeed,
    };

    // Usar examinador interno
    const examinador = examinadorAudio; // instancia única global
    return examinador.examinar(audioParams, this.core);
  }

  reset() {
    this._activeSounds = [];
  }
}

// Instancia única del examinador
const examinadorAudio = new ExaminadorAudio();

// Instancia única del propagador
const soundPropagator = new SoundPropagator();

// ---------- 5. FACHADA PRINCIPAL: planetaryAudio ----------
const planetaryAudio = {
  name: 'planetary-audio',
  enabled: true,
  _currentAtmosphere: null,
  _listenerPosition: { x: 0, y: 0 },

  init(core) {
    this.core = core;
    atmosphereManager.init();
    instrumentRegistry.init();
    soundPropagator.init(core);
    console.log('🔊 Módulo de audio planetario inicializado');
  },

  onEnter(params = {}) {
    const atmosphereId = params.atmosphere || 'tierra';
    this.setAtmosphere(atmosphereId);
    this.core.log(`🌍 Atmósfera activa: ${atmosphereId}`);
  },

  onExit() {
    this._currentAtmosphere = null;
    soundPropagator.reset();
  },

  update(delta, controls) {
    // Simular posición del jugador (para demo, fija o desde core)
    const player = this.core.getPlayer ? this.core.getPlayer() : null;
    if (player) {
      this._listenerPosition = { x: player.x, y: player.y };
    }
    soundPropagator.update(delta, this._listenerPosition);
  },

  setAtmosphere(id) {
    this._currentAtmosphere = atmosphereManager.get(id);
    if (!this._currentAtmosphere) {
      console.warn(`⚠️ Atmósfera no encontrada: ${id}, usando tierra`);
      this._currentAtmosphere = atmosphereManager.get('tierra');
    }
    soundPropagator.setAtmosphere(this._currentAtmosphere);
    this.core.emit('atmosphere:changed', this._currentAtmosphere);
  },

  getCurrentAtmosphere() {
    return this._currentAtmosphere;
  },

  playSound(instrumentType, note, position, intensity = 1.0) {
    const instrument = instrumentRegistry.create(instrumentType, note, intensity);
    const result = soundPropagator.process(instrument, position, this._listenerPosition);

    if (result.tipo === 'OK' || result.tipo === 'PARCIAL' || result.tipo === 'INFERIDO') {
      this.core.audio.playProcessed(result.datos);
    } else {
      this.core.log(`🔇 Sonido rechazado: ${result.motivo}`, 'warn');
    }
  }
};

// ---------- 6. CORE SIMULADO PARA PRUEBAS ----------
class MockCore {
  constructor() {
    this.logs = [];
    this.eventos = [];
    this.audio = {
      playProcessed: (datos) => {
        console.log('🔈 Reproduciendo audio procesado:', datos);
      }
    };
    this.player = { x: 10, y: 20 }; // posición fija para demo
  }

  log(mensaje, nivel = 'info') {
    this.logs.push({ mensaje, nivel });
    console.log(`[${nivel.toUpperCase()}] ${mensaje}`);
  }

  emit(evento, datos) {
    this.eventos.push({ evento, datos });
    console.log(`📡 Evento emitido: ${evento}`, datos);
  }

  getPlayer() {
    return this.player;
  }
}

// ---------- 7. DEMO AUTOEJECUTABLE ----------
// Si ejecutas este archivo con Node, se ejecutará esta demo.
if (typeof require !== 'undefined' && require.main === module) {
  console.log('=== DEMO DEL MÓDULO DE AUDIO PLANETARIO ===\n');

  const core = new MockCore();
  planetaryAudio.init(core);

  // Entrar en la Tierra por defecto
  planetaryAudio.onEnter({ atmosphere: 'tierra' });

  // Simular que el jugador toca una flauta en (0,0)
  console.log('\n--- Flauta en Tierra ---');
  planetaryAudio.playSound('flauta', 440, { x: 0, y: 0 }); // La4

  // Cambiar a Marte
  console.log('\n--- Cambio a Marte ---');
  planetaryAudio.setAtmosphere('marte');
  planetaryAudio.playSound('flauta', 440, { x: 0, y: 0 }); // Misma nota, pero en Marte

  // Cambiar a Venus y probar un tambor
  console.log('\n--- Tambor en Venus ---');
  planetaryAudio.setAtmosphere('venus');
  planetaryAudio.playSound('tambor', 200, { x: 50, y: 100 }); // Cerca

  // Intentar un sonido con intensidad altísima
  console.log('\n--- Voz con intensidad 5.0 (excesiva) ---');
  planetaryAudio.playSound('voz', 1000, { x: 5, y: 5 }, 5.0);

  // Intentar sonido en Titán a distancia extrema
  console.log('\n--- Guitarra en Titán a 2000 metros ---');
  planetaryAudio.setAtmosphere('titan');
  planetaryAudio.playSound('guitarra', 330, { x: 2000, y: 0 });

  // Mostrar historial de logs y eventos
  console.log('\n=== LOGS ===');
  core.logs.forEach(l => console.log(`[${l.nivel}] ${l.mensaje}`));
  console.log('\n=== EVENTOS ===');
  core.eventos.forEach(e => console.log(`${e.evento}:`, e.datos));
}

// Exportar para uso en otros entornos (módulo)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = planetaryAudio;
}