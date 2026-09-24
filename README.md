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
- Formulario con validación accesible y feedback propio sin `alert`.
- Proyectos como plantillas editables.
- README del proyecto.
