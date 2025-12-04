// src/services/mlClient.js
// Cliente HTTP hacia el microservicio de ML (Python)
// Responsable de enviar correos y recibir sugerencias/clasificación IA.
//
// Diseño alineado con HU12:
// - No expone detalles del protocolo ML en los controladores.
// - Permite configurar base URL y timeout por variables de entorno.
// - Pensado para ser testeado fácilmente con Jest (mock de fetch).

'use strict';

/**
 * Obtiene la URL base del servicio ML desde variables de entorno.
 * Fallback razonable para desarrollo local.
 */
const ML_BASE_URL = process.env.ML_BASE_URL || 'http://localhost:8000';

/**
 * Timeout por defecto en milisegundos.
 */
const DEFAULT_TIMEOUT_MS = Number(process.env.ML_TIMEOUT_MS || '5000');

/**
 * Construye de forma segura una URL a partir de la base ML y un path relativo.
 * Evita problemas de dobles slashes.
 *
 * @param {string} path - Ruta relativa del endpoint ML (ej: "/v1/suggest").
 * @returns {string} URL absoluta lista para usar con fetch.
 */
function buildMlUrl(path) {
  const trimmedBase = ML_BASE_URL.replace(/\/+$/, '');
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

/**
 * Realiza una petición POST JSON hacia el servicio ML.
 *
 * @param {string} path - Path relativo dentro del servicio ML.
 * @param {object} body - Payload que se enviará como JSON.
 * @param {object} [options]
 * @param {number} [options.timeoutMs] - Timeout en milisegundos (override local).
 *
 * @throws {Error} con name "MlServiceError" o "MlServiceTimeoutError"
 * @returns {Promise<any>} JSON parseado de la respuesta correcta.
 */
async function postJson(path, body, options = {}) {
  const timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
  const url = buildMlUrl(path);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      // Intentamos leer el cuerpo para logging. Si falla, no interrumpe el throw.
      let errorBody = null;
      try {
        errorBody = await response.text();
      } catch {
        // ignorar fallo al leer body
      }

      const error = new Error(`ML service responded with status ${response.status}`);
      error.name = 'MlServiceError';
      error.statusCode = response.status;
      error.body = errorBody;
      throw error;
    }

    // Si todo bien, devolvemos JSON parseado.
    return await response.json();
  } catch (err) {
    // 1) Timeout explícito por AbortController
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`ML service timeout after ${timeoutMs}ms`);
      timeoutError.name = 'MlServiceTimeoutError';
      timeoutError.code = 'ML_TIMEOUT';
      throw timeoutError;
    }

    // 2) Errores HTTP ya tipados como MlServiceError → se re-lanzan tal cual
    if (err.name === 'MlServiceError') {
      throw err;
    }

    // 3) Cualquier otro error se considera de red / inesperado
    const networkError = new Error(`ML service network error: ${err.message}`);
    networkError.name = 'MlServiceNetworkError';
    networkError.cause = err;
    throw networkError;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Envía una lista de correos al servicio ML para obtener clasificación / sugerencias.
 *
 * IMPORTANTE:
 * - Esta función asume que `emails` ya es un arreglo de objetos "normalizados"
 *   por el backend (sin credenciales, sin tokens, sin PII innecesario).
 *
 * @param {Array<object>} emails - Lista de correos a clasificar.
 * @param {object} [options]
 * @param {string} [options.path] - Endpoint relativo del ML. Por defecto "/v1/suggest".
 * @param {number} [options.timeoutMs] - Timeout en milisegundos.
 *
 * @returns {Promise<any>} - Respuesta JSON del servicio ML (formato definido por el ML).
 */
async function classifyEmails(emails, options = {}) {
  if (!Array.isArray(emails)) {
    throw new TypeError('classifyEmails: "emails" must be an array');
  }

  const path = options.path || '/v1/suggest'; // endpoint por defecto
  const payload = emails;

  return postJson(path, payload, options);
}

export {
  classifyEmails,
  postJson,
  buildMlUrl,
  ML_BASE_URL,
  DEFAULT_TIMEOUT_MS
};

