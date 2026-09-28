# IA Energy Management — Pruebas E2E

Pruebas end-to-end de **AI Energy Management** Playwright y TypeScript, usando el patrón Page Object Model.

## Requisitos

- Node.js 22 o superior
- Google Chrome instalado (las pruebas usan el Chrome del sistema)
- La aplicación [`ia-energy-management`](https://github.com/josbp0107/ia-energy-management) corriendo en local:
  - Frontend en `http://localhost:5173`
  - API en `http://localhost:8080`

### Levantar la aplicación bajo prueba

Desde el repositorio `ia-energy-management` (detalle en su README):

```bash
docker compose --env-file backend/.env up -d postgres

cd backend
go run ./cmd/seed
go run ./cmd/server

cd frontend
npm run dev
```

## Instalación

```bash
npm install
cp .env.example .env
```

Edita `.env` con las credenciales del usuario demo (las mismas de `DEMO_EMAIL` / `DEMO_PASSWORD` en `backend/.env` de la app):

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `BASE_URL` | URL del frontend | `http://localhost:5173` |
| `API_URL` | URL base de la API | `http://localhost:8080/api/v1` |
| `E2E_USER_EMAIL` | Correo del usuario de pruebas | — |
| `E2E_USER_PASSWORD` | Contraseña del usuario de pruebas | — |

> `.env` está en `.gitignore`: nunca subas credenciales al repositorio.

## Ejecutar las pruebas

Las pruebas se ejecutan **en serie** (un worker) y **con el navegador visible**.

```bash
npm test                                           # toda la suite
npx playwright test tests/meters                   # una carpeta
npx playwright test tests/auth/login.spec.ts       # un archivo
npx playwright test -g "busca un medidor"          # por nombre
npx playwright test --ui                           # modo UI (paso a paso, con time-travel)
npx playwright test --debug                        # Inspector de Playwright
```

Para ejecutarlas sin ventana:

```powershell
$env:HEADLESS="true"; npm test      # PowerShell
```

```bash
HEADLESS=true npm test              # bash
```

## Reportes

Cada ejecución genera dos reportes. Si una prueba falla, se adjuntan captura de pantalla, video y trace.

### Reporte HTML de Playwright

```bash
npm run report
```

### Allure

```bash
npm run allure:clean       # borra resultados anteriores (opcional)
npm test
npm run allure:serve       # genera el reporte y lo abre en el navegador
```

| Script | Descripción |
|---|---|
| `allure:generate` | Genera `allure-report/index.html` (un único archivo autocontenido) |
| `allure:open` | Sirve y abre un reporte ya generado |
| `allure:serve` | Genera y abre el reporte |
| `allure:clean` | Elimina `allure-results/` |

> Allure acumula los resultados entre ejecuciones (así muestra reintentos e historial). Ejecuta `allure:clean` si solo quieres ver la última.

## Estructura

```
├── src/
│   ├── api/            # clientes de la API (validación contra el backend)
│   ├── components/     # componentes reutilizables (modal Run AI Analysis)
│   ├── config/env.ts   # lectura tipada de variables de entorno
│   ├── pages/          # Page Objects
│   └── utils/          # formato de números (es-CO) igual al de la app
├── tests/
│   ├── analysis/       # ejecución del análisis de IA
│   ├── anomalies/      # cambio de estado de anomalías
│   ├── auth/           # login
│   ├── dashboard/      # KPIs del dashboard
│   └── meters/         # búsqueda, ordenamiento y detalle de medidores
├── allurerc.mjs        # configuración de Allure
└── playwright.config.ts
```

## Pruebas incluidas

| Archivo | Qué valida |
|---|---|
| `auth/login.spec.ts` | Login correcto y error con credenciales inválidas |
| `analysis/run-analysis.spec.ts` | Ejecuta *Run AI Analysis* y espera la anomalía principal |
| `dashboard/meters-count.spec.ts` | El KPI *Medidores* coincide con la sección Medidores |
| `meters/meters-search.spec.ts` | Búsqueda por identificador y búsqueda sin resultados |
| `meters/meters-sort.spec.ts` | Ordenamiento por variación |
| `meters/meter-detail.spec.ts` | Estadísticas de un medidor aleatorio contra la API y la tabla |
| `anomalies/anomaly-status.spec.ts` | Marca la primera anomalía como resuelta, o la reabre |

> `run-analysis` y `anomaly-status` modifican datos reales de la aplicación: el análisis reemplaza los resultados previos y el cambio de estado alterna el estado de la anomalía.

## Solución de problemas

| Problema | Solución |
|---|---|
| `Falta la variable de entorno ...` | Crea `.env` a partir de `.env.example` |
| `Executable doesn't exist` / no abre Chrome | Instala Google Chrome |
| Login falla o timeouts en todas las pruebas | Verifica que el frontend (5173) y la API (8080) estén corriendo |
| La tarjeta "Último análisis" dice *Nunca* | Las pruebas que lo necesitan ejecutan el análisis automáticamente |
