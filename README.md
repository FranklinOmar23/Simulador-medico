# Diagnóstico Clínico · Simulador Médico

Simulador educativo de casos clínicos: entrevista al paciente, pide pruebas, emite un diagnóstico y recibe una revisión docente del caso. Incluye rangos por experiencia, emergencias con tiempo límite e inicio de sesión con Google para guardar el progreso.

> Herramienta educativa. Los casos no sustituyen el juicio clínico ni deben usarse para decisiones reales.

## Puesta en marcha

```bash
npm install
npm run dev
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run lint` | ESLint |
| `npm run validate:cases` | Valida `public/data/cases-v2.json` |

## Casos clínicos

Los casos están en [`public/data/cases-v2.json`](public/data/cases-v2.json). Antes de añadir o editar uno, ejecuta `npm run validate:cases`: comprueba la estructura, que los signos vitales sean posibles y la coherencia básica. **Todo caso nuevo debe revisarlo un profesional médico.**

Los casos con `"emergency": true` no aparecen en la sala de espera: llegan como alertas aleatorias (tiempos en [`src/lib/emergency.js`](src/lib/emergency.js)).

Los casos del formato antiguo están en `legacy/cases-v1.json` y no se usan.

## Cuentas de usuario (Firebase)

Sin configuración, la app funciona en **modo local**: el progreso se guarda solo en el navegador. Para activar el inicio de sesión con Google y guardar el progreso en la cuenta:

1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com) (Google Analytics no hace falta).
2. **Authentication** → Comenzar → **Método de inicio de sesión** → **Google** → Habilitar → elige un correo de asistencia → Guardar.
3. **Firestore Database** → Crear base de datos → modo producción → elige una ubicación cercana (no se puede cambiar después).
4. **Firestore Database → Reglas**: pega el contenido de [`firestore.rules`](firestore.rules) y pulsa **Publicar**.
5. **Configuración del proyecto** (engranaje) → **Tus apps** → icono web `</>` → registra la app (sin Hosting) → copia los valores de `firebaseConfig`.
6. Copia `.env.example` como `.env.local` y pega esos valores.
7. Reinicia `npm run dev`.

Al publicar la web en un dominio propio, añádelo en **Authentication → Configuración → Dominios autorizados** (`localhost` ya viene incluido).

Los valores de `firebaseConfig` identifican el proyecto y son públicos por diseño; la protección de los datos la dan las reglas de Firestore. Aun así, `.env.local` no se sube a git.

### Cómo se guarda el progreso

- Cada usuario tiene un documento `users/{uid}` con su XP, casos resueltos y rango.
- Al iniciar sesión se conserva el progreso más avanzado entre el del dispositivo y el de la cuenta, así que lo jugado sin cuenta no se pierde.
- Al cerrar sesión, el progreso queda en la cuenta y se limpia del dispositivo.
- La puntuación se calcula en el navegador, así que un usuario con conocimientos técnicos podría alterar su propio XP. Para una clasificación entre usuarios habría que validar la puntuación en un servidor.
