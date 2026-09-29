# EN Tracker: camino al C1 🇬🇧

App personal para pasar de **B2 a C1** en inglés y aprender a **pensar en inglés sin traducir**.
Funciona en el móvil y en el PC, se instala como una app y funciona sin conexión.

## Qué hace

| Pestaña | Para qué sirve |
|---|---|
| **Hoy** | Plan del día según tu fase, reto diario (Speaking 4/3/2, Self-talk o Writing), frase del día y registro de actividades con minutos o temporizador (te avisa a los 30 min). |
| **Repaso** | ~170 tarjetas con repetición espaciada: falsos amigos, errores típicos de hispanohablantes y catalanohablantes, collocations, phrasal verbs, linkers, gramática C1 e inglés de trabajo. Tienen audio 🔊 y puedes añadir **tus propias frases** (las correcciones de italki o de la IA). |
| **Progreso** | Horas de práctica e input frente al objetivo, fecha estimada para llegar, semana (editable), tests EF SET con su nivel MCER, tarjetas dominadas y mapa de actividad. |
| **Plan** | Las 3 fases, tu semana tipo, cómo pensar en inglés, cómo hacer cada actividad, recursos y certificados. |
| **Ajustes** | Fecha de inicio, fase, objetivos, tarjetas nuevas al día, acento, exportar/importar, Google Sheets e instalación. |

## Cómo usarla desde el móvil y el PC

1. Publica el repo con **GitHub Pages**: *Settings → Pages → Deploy from a branch → `main` / root*.
2. Abre `https://polrey98-collab.github.io/english/` (o la URL que te indique GitHub).
3. Instálala:
   - **iPhone:** Safari → Compartir → *Añadir a pantalla de inicio*.
   - **Android:** Chrome → ⋮ → *Instalar aplicación*.
   - **PC:** icono de instalar en la barra de direcciones de Chrome o Edge.

### Datos y sincronización
Los datos se guardan **en cada dispositivo** (localStorage). Para pasarlos de uno a otro, usa **Ajustes → Exportar** en uno e **Importar** en el otro. Los datos se fusionan y no se pierde nada. También acepta el JSON del tracker antiguo.

## Añadir contenido
Todo el contenido está en [`content.js`](content.js): tarjetas (`DECK`), temas de speaking, tareas de writing, misiones de self-talk y guías de cada actividad. Copia una línea, cámbiale el `id` y listo.

## Archivos
- `index.html`: estructura
- `styles.css`: estilos (modo claro y oscuro)
- `app.js`: lógica (tracker, repetición espaciada, progreso)
- `content.js`: contenido de aprendizaje
- `sw.js` y `manifest.webmanifest`: app instalable y funcionamiento sin conexión
