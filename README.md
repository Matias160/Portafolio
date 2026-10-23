# Portfolio de Matías Rivas

Portfolio personal en español construido con React 19 + Vite. La maqueta conserva la inspiración visual del proyecto original: fondo 3D, vidrio, estética tecnológica y animaciones suaves, pero adapta el contenido a Matías Rivas sin inventar biografía ni experiencia laboral.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Editar contenido

La información principal está en:

```txt
src/data/portfolio.js
```

Ahí se pueden cambiar:

- Datos personales y contacto.
- Tecnologías y herramientas de IA.
- Los dos juegos destacados.
- Proyectos menores.
- Ruta del CV.

## Hosting y base de datos

El sitio se publica como un Worker. El Worker sirve los archivos de React y ofrece rutas `/api/...` para leer y editar el contenido. En el hosting, el binding `DB` conecta ese Worker con una base D1.

### Qué se guarda

D1 contiene una tabla `portfolio_content` con estas columnas:

- `id`: identificador del registro. El portfolio usa `main`.
- `content`: el contenido editable completo, serializado como JSON: perfil, tecnologías, herramientas, formación y proyectos.
- `updated_at`: fecha y hora de la última actualización.

No se crea una fila por tarjeta. Todo el contenido se guarda en un único registro `main`; por eso los cambios hechos desde el editor reemplazan el documento completo del portfolio.

### Recorrido de los datos

1. Al abrir la página, React solicita `GET /api/portfolio`.
2. El Worker busca `portfolio_content.main` en D1. Si todavía no existe, inicializa la tabla y el registro usando los datos de `src/data/portfolio.js` incluidos en el build.
3. Al guardar desde el editor, React envía el contenido a `PUT /api/portfolio` junto con la clave del editor.
4. El Worker verifica la clave, normaliza los datos y hace un UPSERT: crea `main` la primera vez o actualiza el registro y su fecha.

`src/data/portfolio.js` funciona como contenido inicial o respaldo si D1 no está conectado. La clave se configura en el hosting como variable secreta `PORTFOLIO_EDIT_KEY`; no se guarda en la base ni en el código de la página. El tema visual es distinto: se guarda localmente en el navegador de cada visitante, no en D1.

## Agregar CV

No se encontró un CV dentro del proyecto. Para activarlo:

1. Copiar el archivo a `public/cv-matias-rivas.pdf`.
2. Editar `src/data/portfolio.js`.
3. Cambiar `cvPath: ''` por `cvPath: '/cv-matias-rivas.pdf'`.

La página mostrará la vista previa y habilitará la descarga automáticamente.

## Requisitos cubiertos

- React 19 + Vite.
- Estructura modular mínima.
- Responsive hasta 1200px y adaptable a mobile.
- Modo día/noche.
- Animaciones y escena 3D con Three.js.
- Hooks, eventos e interacción.
- Contacto directo mediante enlaces a email y GitHub; no hay formulario de envío.
- Proyectos como plantillas editables.
- Hosting preparado con base de datos D1 (`DB`).
- README del proyecto.
