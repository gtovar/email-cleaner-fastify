
# 🧪 Testing with Jest

Este proyecto utiliza Jest como motor de pruebas. Migrar a Jest ofrece una experiencia de testing más rica, con mocks, spies, snapshots y reportes de cobertura integrados.

## Ejecución de la suite

Ejecuta todas las pruebas una vez:

```bash
npm test
```

Modo observador (vuelve a ejecutar al detectar cambios):

```bash
npm run test:watch
```

Generar un reporte de cobertura en la carpeta `coverage/`:

```bash
npm run coverage
```

## Configuración

El proyecto se escribe en módulos ECMAScript (véase `package.json` con `"type": "module"`).  La configuración de Jest se define en el mismo `package.json` para tratar los archivos `.js` como ESM y usar el entorno de prueba de Node:

```json
"jest": {
  "testEnvironment": "node",
  "transform": {}
}
```

No se aplica transformación con Babel; si en el futuro incorporas TypeScript o JSX, deberás ajustar la configuración.

## Escribir pruebas

Las pruebas viven en el directorio `tests/` y siguen las convenciones de Jest.  Usa las funciones globales `test()` y `expect()`, o impórtalas desde `@jest/globals`.  Por ejemplo:

```js
import { test, expect } from '@jest/globals';
import { buildGmailQuery } from '../src/utils/filters.js';

test('buildGmailQuery añade banderas', () => {
  const q = buildGmailQuery({ unread: 'true', category: 'promotions' });
  expect(q).toBe('is:unread category:promotions');
});
```

Para pruebas asíncronas, declara la función `async` o retorna una promesa.


