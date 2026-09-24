import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  Code2,
  Github,
  GraduationCap,
  Mail,
  Moon,
  Send,
  Sparkles,
  Sun,
} from 'lucide-react';
import { initHeroScene } from './hero-scene.js';
import { useTheme } from './hooks/useTheme.js';
import { aiTools, featuredGames, profile, smallerProjects, technologies } from './data/portfolio.js';

const navItems = [
  ['Inicio', '#inicio'],
  ['Perfil', '#perfil'],
  ['Stack', '#stack'],
  ['Proyectos', '#proyectos'],
  ['CV', '#cv'],
  ['Contacto', '#contacto'],
];

function App() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [toast, setToast] = useState('');
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({});

  const hasCv = Boolean(profile.cvPath);
  const isLight = theme === 'theme-light';

  useEffect(() => {
    const cleanupHero = initHeroScene();

    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      cleanupHero?.();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const groupedStack = useMemo(
    () => [
      { title: 'Frontend', items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React'] },
      { title: 'Backend y datos', items: ['Python', 'SQL', 'PHP', 'Java', 'C++'] },
      { title: 'Herramientas IA', items: aiTools },
    ],
    [],
  );

  function toggleTheme() {
    setTheme(isLight ? 'theme-dark' : 'theme-light');
    setToast(isLight ? 'Modo noche activado' : 'Modo día activado');
  }

  function copyEmail() {
    navigator.clipboard.writeText(profile.email);
    setToast('Email copiado al portapapeles');
  }

  function updateField(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => ({ ...current, [name]: '' }));
  }

  function validateForm() {
    const errors = {};
    if (!formState.name.trim()) errors.name = 'Escribí tu nombre para poder identificar el mensaje.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      errors.email = 'Ingresá un email válido.';
    }
    if (formState.message.trim().length < 12) {
      errors.message = 'El mensaje necesita al menos 12 caracteres.';
    }
    return errors;
  }

  function submitForm(event) {
    event.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setToast('Revisá los campos marcados antes de enviar.');
      return;
    }

    setToast('Mensaje listo. Podés enviarlo desde tu cliente de correo.');
    window.location.href = `mailto:${profile.email}?subject=Contacto desde portfolio&body=${encodeURIComponent(
      `Nombre: ${formState.name}\nEmail: ${formState.email}\n\n${formState.message}`,
    )}`;
    setFormState({ name: '', email: '', message: '' });
  }

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <a className="brand-logo" href="#inicio" aria-label="Ir al inicio">
            <Sparkles size={18} aria-hidden="true" />
            <span>Matías Rivas</span>
          </a>

          <nav className="nav-links" aria-label="Secciones principales">
            {navItems.map(([label, href]) => (
              <a key={href} className="nav-link" href={href}>
                {label}
              </a>
            ))}
          </nav>

          <button className="control-btn" type="button" onClick={toggleTheme} aria-label="Cambiar modo día o noche">
            {isLight ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            <span>{isLight ? 'Noche' : 'Día'}</span>
          </button>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero-section">
          <div className="hero-canvas-container" aria-hidden="true">
            <canvas id="hero-3d-canvas" />
          </div>

          <div className="hero-content reveal">
            <p className="hero-badge">Portfolio académico en React + Vite</p>
            <h1 className="hero-title">
              <span>{profile.name}</span>
              <span className="gradient-text">{profile.role}</span>
            </h1>
            <p className="hero-description">
              {profile.subtitle}. {profile.summary}
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#proyectos">
                Ver proyectos <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className={`btn btn-secondary ${!hasCv ? 'is-disabled' : ''}`} href={hasCv ? profile.cvPath : '#cv'}>
                {hasCv ? 'Descargar CV' : 'CV pendiente'} <ArrowDownToLine size={18} aria-hidden="true" />
              </a>
            </div>

            <div className="hero-stats" aria-label="Resumen del perfil">
              <span>Frontend</span>
              <span>Backend básico</span>
              <span>IA complementaria</span>
            </div>
          </div>
        </section>

        <section id="perfil" className="section band">
          <div className="container about-grid">
            <div>
              <p className="section-tag">01 / Perfil</p>
              <h2 className="section-title">Desarrollo web con foco en interfaces claras</h2>
              <p className="section-subtitle">{profile.aiStatement}</p>
            </div>
            <div className="profile-card">
              <div className="avatar-placeholder" aria-label="Espacio para foto personal">
                MR
              </div>
              <div>
                <h3>{profile.name}</h3>
                <p>{profile.role} · Estudiante de Informática</p>
                <p className="muted">Foto pequeña preparada para reemplazar por una imagen personal cuando quieras.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="stack" className="section">
          <div className="container">
            <div className="section-header">
              <p className="section-tag">02 / Stack</p>
              <h2 className="section-title">Tecnologías y herramientas</h2>
              <p className="section-subtitle">
                Lenguajes, frameworks y asistentes que Matías indicó para el trabajo práctico.
              </p>
            </div>

            <div className="stack-grid">
              {groupedStack.map((group) => (
                <article className="glass-card" key={group.title}>
                  <h3>{group.title}</h3>
                  <div className="tag-row">
                    {group.items.map((item) => (
                      <span className="tag" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="proyectos" className="section band">
          <div className="container">
            <div className="section-header">
              <p className="section-tag">03 / Portfolio</p>
              <h2 className="section-title">Dos juegos destacados y proyectos menores</h2>
              <p className="section-subtitle">
                Las tarjetas quedan como plantilla editable para completar nombres, capturas, demos y repositorios.
              </p>
            </div>

            <div className="featured-grid">
              {featuredGames.map((project) => (
                <ProjectCard key={project.id} project={project} large />
              ))}
            </div>

            <div className="minor-grid">
              {smallerProjects.map((project) => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
          </div>
        </section>

        <section id="formacion" className="section">
          <div className="container timeline-card">
            <p className="section-tag">04 / Formación</p>
            <h2 className="section-title">Formación académica</h2>
            <div className="timeline-item">
              <GraduationCap size={24} aria-hidden="true" />
              <div>
                <h3>{profile.education}</h3>
                <p>
                  Se muestra únicamente la formación confirmada por Matías. La experiencia laboral queda fuera para no
                  inventar datos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="cv" className="section band">
          <div className="container cv-layout">
            <div>
              <p className="section-tag">05 / Currículum</p>
              <h2 className="section-title">CV visible y descargable</h2>
              <p className="section-subtitle">
                {hasCv
                  ? 'El archivo de CV está conectado y puede verse o descargarse.'
                  : 'No encontré un archivo de CV en el proyecto. Dejé el bloque listo para activarse cuando agregues, por ejemplo, /cv-matias-rivas.pdf en public y completes cvPath.'}
              </p>
            </div>
            <div className="cv-preview" aria-live="polite">
              {hasCv ? (
                <>
                  <iframe title="Vista previa del CV" src={profile.cvPath} />
                  <a className="btn btn-primary" href={profile.cvPath} download>
                    Descargar CV
                  </a>
                </>
              ) : (
                <div className="empty-state">
                  <Code2 size={42} aria-hidden="true" />
                  <strong>CV pendiente</strong>
                  <span>Se mostrará aquí cuando el archivo esté disponible.</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="contacto" className="section contact-section">
          <div className="container contact-card">
            <div>
              <p className="section-tag">06 / Contacto</p>
              <h2 className="section-title">Hablemos de proyectos</h2>
              <p className="section-subtitle">
                Contacto directo por email y GitHub. El formulario valida sin alertas del navegador y muestra mensajes
                propios.
              </p>
              <div className="contact-actions">
                <button className="link-button" type="button" onClick={copyEmail}>
                  <Mail size={18} aria-hidden="true" />
                  {profile.email}
                </button>
                <a className="link-button" href={profile.github} target="_blank" rel="noreferrer">
                  <Github size={18} aria-hidden="true" />
                  GitHub
                </a>
              </div>
            </div>

            <form className="contact-form" noValidate onSubmit={submitForm}>
              <Field
                label="Nombre"
                name="name"
                value={formState.name}
                error={formErrors.name}
                onChange={updateField}
                placeholder="Tu nombre"
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={formState.email}
                error={formErrors.email}
                onChange={updateField}
                placeholder="tu@email.com"
              />
              <Field
                label="Mensaje"
                name="message"
                value={formState.message}
                error={formErrors.message}
                onChange={updateField}
                placeholder="Contame qué necesitás..."
                multiline
              />
              <button className="btn btn-primary btn-full" type="submit">
                Preparar mensaje <Send size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-content">
          <span>{profile.name}</span>
          <span>Portfolio en español · React 19 + Vite</span>
        </div>
      </footer>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}

function ProjectCard({ project, large = false }) {
  return (
    <article className={`project-card ${large ? 'project-card-large' : ''}`}>
      <div className="project-thumb">
        <img src={project.image} alt={`Imagen editable para ${project.title}`} loading="lazy" />
        {project.status && <span className="project-badge-tag">{project.status}</span>}
      </div>
      <div className="project-info">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="tag-row">
          {project.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Field({ label, name, value, error, onChange, placeholder, type = 'text', multiline = false }) {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const props = {
    id: fieldId,
    name,
    value,
    onChange,
    placeholder,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
  };

  return (
    <div className="form-group">
      <label htmlFor={fieldId}>{label}</label>
      {multiline ? <textarea rows="5" {...props} /> : <input type={type} {...props} />}
      {error && (
        <p className="form-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

export default App;
