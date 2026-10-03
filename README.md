# EN C1: curso de inglés B2 → C1 🇬🇧

Curso propio y completo dentro de la web: **no depende de apps externas**. Funciona en el móvil y en el PC, se instala como una app y funciona sin conexión.

## Cómo está organizado

- **Test de nivel** (24 preguntas, 10 min): te dice desde dónde partes y qué unidades te convienen.
- **8 unidades** (bloque 1, de B2 a las puertas del C1), cada una con un tema y un punto de gramática:

| # | Tema | Gramática | Nivel |
|---|---|---|---|
| 1 | Work & Careers | Present perfect vs past simple | B2 |
| 2 | Technology & AI | Formas de futuro | B2 |
| 3 | Money & Economy | Condicionales (incluidos los mixtos) | B2 |
| 4 | Health & Fitness | Modales de deducción | B2+ |
| 5 | Travel & Culture | Oraciones de relativo | B2+ |
| 6 | Communication & Media | Estilo indirecto y verbos de reporte | B2+ |
| 7 | Environment & Cities | Pasiva y pasiva de reporte | C1 |
| 8 | Leadership & Negotiation | Inversión y cleft sentences | C1 |

- **5 sesiones guiadas por unidad** (20–30 min cada una). Todas empiezan con un calentamiento de repaso:
  1. 📖 Vocabulario (10 palabras con audio) + quiz + lectura con preguntas
  2. 🏗️ Explicación de gramática + la trampa típica del hispanohablante + ejercicios corregidos al momento
  3. 🎧 Listening (diálogo con voces) + shadowing (grábate y compara; comprobación automática en Chrome)
  4. 🗣️ Vocabulario en contexto + speaking con la técnica 4/3/2 y grabación
  5. ✍️ Writing con checklist y texto modelo + test de unidad
- **Repaso con repetición espaciada**: ~200 tarjetas (falsos amigos, errores típicos, collocations, phrasal verbs, linkers, gramática C1, inglés de trabajo) más el vocabulario de cada unidad. **Los ejercicios que falles se añaden solos** y vuelven hasta que los domines.
- **Pensada para el móvil**: las sesiones se pueden hacer por partes (si sales o te llaman, se guarda el paso y retomas con "Continuar"). El botón Atrás de Android no te saca de la app, y te recuerda hacer copia de tus datos.
- **Progreso**: racha, sesiones, horas, acierto por unidad, evolución del test de nivel, fecha estimada para terminar y mapa de actividad.

## Usarla desde el móvil y el PC

1. Fusiona la rama en `main`.
2. Activa **GitHub Pages**: *Settings → Pages → Deploy from a branch → `main` / (root)*.
3. Abre `https://polrey98-collab.github.io/English/` e instálala:
   - **iPhone:** Safari → Compartir → *Añadir a pantalla de inicio*.
   - **Android:** Chrome → ⋮ → *Instalar aplicación*.
   - **PC:** icono de instalar en la barra de direcciones.

### Sincronizar móvil y PC

El progreso se guarda en un **Gist secreto** de tu cuenta de GitHub (no en este repositorio, que es público). Se configura una vez en cada dispositivo:

1. Crea un token con **solo el permiso `gist`**: [github.com/settings/tokens/new?scopes=gist](https://github.com/settings/tokens/new?scopes=gist&description=EN%20C1%20sync). En *Expiration* elige *No expiration* (o 1 año).
2. En la app: **Ajustes → Sincronizar móvil y PC** → pega el token → **Conectar**.
3. Repite en el otro dispositivo con el mismo token.

A partir de ahí se sincroniza sola (al abrir la app, al volver a ella y al terminar cada actividad). Los datos se **fusionan**, así que nunca se pierde nada: los minutos de cada dispositivo se suman, una sesión a medias en el móvil se puede continuar en el PC y lo que borres no reaparece. Sin conexión funciona igual y se sincroniza al volver la red.

Como respaldo extra, también puedes usar **Ajustes → Exportar / Importar** con un archivo.

## Añadir contenido

- [`course.js`](course.js): unidades, sesiones y test de nivel. Copia una unidad, cambia el `id` y el contenido.
- [`content.js`](content.js): tarjetas del repaso y misiones para pensar en inglés.
