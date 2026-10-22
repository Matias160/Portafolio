import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  Code2,
  Github,
  GraduationCap,
  Laptop,
  LockKeyhole,
  Mail,
  Moon,
  Pencil,
  Plus,
  Save,
  Send,
  Sparkles,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { initHeroScene } from './hero-scene.js';
import { useTheme } from './hooks/useTheme.js';
import {
  aiTools as fallbackAiTools,
  educationItems as fallbackEducationItems,
  featuredGames as fallbackFeaturedGames,
  profile as fallbackProfile,
  smallerProjects as fallbackSmallerProjects,
  technologies as fallbackTechnologies,
} from './data/portfolio.js';

const emptyProject = {
  title: 'Nuevo proyecto',
  status: '',
  image: '',
  art: '',
  description: 'Descripción del proyecto.',
  tags: ['HTML', 'CSS', 'JavaScript'],
};

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
  const [portfolioContent, setPortfolioContent] = useState({
    aiTools: fallbackAiTools,
    educationItems: fallbackEducationItems,
    featuredGames: fallbackFeaturedGames,
    profile: fallbackProfile,
    smallerProjects: fallbackSmallerProjects,
    technologies: fallbackTechnologies,
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [toast, setToast] = useState('');
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditorUnlocked, setIsEditorUnlocked] = useState(false);
  const [editKey, setEditKey] = useState('');
  const [editorDraft, setEditorDraft] = useState(portfolioContent);
  const [editorError, setEditorError] = useState('');
  const [isSavingContent, setIsSavingContent] = useState(false);
  const { aiTools, educationItems, featuredGames, profile, smallerProjects, technologies } = portfolioContent;

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
    let isMounted = true;

    async function loadPortfolioContent() {
      try {
        const response = await fetch('/api/portfolio', {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) return;

        const remoteContent = await response.json();
        if (isMounted && remoteContent?.profile) {
          setPortfolioContent((current) => ({ ...current, ...remoteContent }));
          setEditorDraft((current) => ({ ...current, ...remoteContent }));
        }
      } catch {
        // The local data keeps the portfolio complete when the backend is unavailable.
      }
    }

    loadPortfolioContent();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const groupedStack = useMemo(
    () => [
      { title: 'Frontend', items: technologies.slice(0, 5) },
      { title: 'Backend y datos', items: technologies.slice(5) },
      { title: 'Herramientas IA', items: aiTools },
    ],
    [aiTools, technologies],
  );

  function toggleTheme() {
    setTheme(isLight ? 'theme-dark' : 'theme-light');
    setToast(isLight ? 'Modo noche activado' : 'Modo día activado');
  }

  function copyEmail() {
    navigator.clipboard.writeText(profile.email);
    setToast('Email copiado al portapapeles');
  }

  function openEditor() {
    setEditorDraft(portfolioContent);
    setEditorError('');
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setIsEditorUnlocked(false);
    setEditKey('');
    setEditorError('');
  }

  async function unlockEditor(event) {
    event.preventDefault();
    setEditorError('');

    try {
      const response = await fetch('/api/portfolio/check-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portfolio-key': editKey,
        },
      });

      if (!response.ok) throw new Error('Clave incorrecta.');

      setIsEditorUnlocked(true);
      setToast('Editor activado');
    } catch {
      setEditorError('Clave incorrecta. Probá de nuevo.');
    }
  }

  function updateDraftList(path, value) {
    setEditorDraft((current) => {
      const next = structuredClone(current);
      let target = next;
      for (const key of path.slice(0, -1)) target = target[key];
      target[path.at(-1)] = value;
      return next;
    });
  }

  function updateProject(group, index, field, value) {
    setEditorDraft((current) => {
      const next = structuredClone(current);
      next[group][index] = { ...next[group][index], [field]: value };
      return next;
    });
  }

  function addProject(group) {
    setEditorDraft((current) => ({
      ...current,
      [group]: [...current[group], { ...emptyProject, id: `proyecto-${Date.now()}` }],
    }));
  }

  function removeProject(group, index) {
    const title = editorDraft[group][index]?.title || 'este proyecto';
    if (!window.confirm(`¿Querés eliminar “${title}”? Esta acción se aplicará cuando guardes los cambios.`)) return;

    setEditorDraft((current) => ({
      ...current,
      [group]: current[group].filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateEducation(index, field, value) {
    setEditorDraft((current) => {
      const next = structuredClone(current);
      next.educationItems[index] = { ...next.educationItems[index], [field]: value };
      return next;
    });
  }

  function addEducationItem() {
    setEditorDraft((current) => ({
      ...current,
      educationItems: [
        ...current.educationItems,
        { title: 'Nuevo item de formación', description: 'Descripción breve.', icon: 'graduation' },
      ],
    }));
  }

  function removeEducationItem(index) {
    const title = editorDraft.educationItems[index]?.title || 'este elemento';
    if (!window.confirm(`¿Querés eliminar “${title}”? Esta acción se aplicará cuando guardes los cambios.`)) return;

    setEditorDraft((current) => ({
      ...current,
      educationItems: current.educationItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function savePortfolioContent() {
    setIsSavingContent(true);
    setEditorError('');

    try {
      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-portfolio-key': editKey,
        },
        body: JSON.stringify(editorDraft),
      });

      if (!response.ok) throw new Error('No se pudo guardar.');

      const savedContent = await response.json();
      setPortfolioContent(savedContent);
      setEditorDraft(savedContent);
      setToast('Cambios guardados en la base de datos');
      closeEditor();
    } catch {
      setEditorError('No se pudieron guardar los cambios. Revisá la clave o intentá otra vez.');
    } finally {
      setIsSavingContent(false);
    }
  }

  function updateField(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => ({ ...current, [name]: '' }));
  }

  function validateForm() {
    const errors = {};
    const name = formState.name.trim();
    const email = formState.email.trim();
    const message = formState.message.trim();

    if (name.length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.';
    else if (name.length > 80) errors.name = 'El nombre no puede superar los 80 caracteres.';
    else if (/[\u0000-\u001f\u007f]/.test(name)) errors.name = 'El nombre contiene caracteres no válidos.';

    const emailParts = email.split('@');
    const [localPart, domain] = emailParts;
    const domainLabels = domain?.split('.') ?? [];
    const validEmail =
      email.length <= 254 &&
      emailParts.length === 2 &&
      localPart.length > 0 &&
      localPart.length <= 64 &&
      /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(localPart) &&
      !localPart.startsWith('.') &&
      !localPart.endsWith('.') &&
      !localPart.includes('..') &&
      domainLabels.length >= 2 &&
      domainLabels.every((label) =>
        label.length > 0 && label.length <= 63 && /^[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?$/i.test(label),
      ) &&
      domainLabels.at(-1).length >= 2;
    if (!validEmail) errors.email = 'Ingresá un correo válido, por ejemplo nombre@dominio.com.';

    if (message.length < 20) errors.message = 'El mensaje debe tener al menos 20 caracteres.';
    else if (message.length > 2000) errors.message = 'El mensaje no puede superar los 2000 caracteres.';
    else if (!/[\p{L}\p{N}]/u.test(message)) errors.message = 'Escribí un mensaje con texto.';

    return errors;
  }

  async function submitForm(event) {
    event.preventDefault();
    if (isSendingMessage) return;

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setToast('Revisá los campos marcados antes de enviar.');
      document.querySelector(`[name="${Object.keys(errors)[0]}"]`)?.focus();
      return;
    }
    setIsSendingMessage(true);
    setToast('Enviando mensaje...');

    let timeoutId;
    try {
      const controller = new AbortController();
      timeoutId = window.setTimeout(() => controller.abort(), 15000);
      const response = await fetch(`https://formsubmit.co/ajax/${profile.email}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          message: formState.message.trim(),
          _replyto: formState.email.trim(),
          _subject: 'Nuevo contacto desde el portfolio',
          _template: 'table',
        }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result || (result.success !== true && result.success !== 'true')) {
        throw new Error(result?.message || 'El servicio no aceptó el mensaje.');
      }

      setToast('Mensaje aceptado para envío. Revisá tu correo y spam.');
      setFormState({ name: '', email: '', message: '' });
      setFormErrors({});
    } catch (error) {
      setToast(
        error.name === 'AbortError'
          ? 'El envío tardó demasiado. Revisá tu conexión e intentá de nuevo.'
          : 'No se pudo confirmar el envío. Intentá de nuevo o escribime por email directo.',
      );
    } finally {
      window.clearTimeout(timeoutId);
      setIsSendingMessage(false);
    }
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

          <button className="icon-btn edit-open-btn" type="button" onClick={openEditor} aria-label="Editar contenido">
            <Pencil size={17} aria-hidden="true" />
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
              <p className="profile-quote">“{profile.motto}”</p>
            </div>
            <div className="profile-card">
              {profile.avatarPath ? (
                <img className="avatar-image" src={profile.avatarPath} alt="Identidad visual de Matías" />
              ) : (
                <div className="avatar-placeholder" aria-label="Identidad digital pendiente">
                  MR
                </div>
              )}
              <div>
                <h3>{profile.name}</h3>
                <p>Desarrollador Frontend · Estudiante de Informática</p>
              </div>
            </div>
          </div>
        </section>

        <section id="stack" className="section">
          <div className="container">
            <div className="section-header">
              <p className="section-tag">02 / Stack</p>
              <h2 className="section-title">Tecnologías y herramientas</h2>
              <p className="section-subtitle">Lenguajes, frameworks y asistentes.</p>
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
                Una selección de juegos, herramientas y trabajos técnicos desarrollados durante la formación.
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
            {educationItems.map((item) => (
              <div className="timeline-item" key={item.title}>
                {item.icon === 'computer' ? (
                  <Laptop size={24} aria-hidden="true" />
                ) : (
                  <GraduationCap size={24} aria-hidden="true" />
                )}
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
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
                Contacto directo por email y GitHub. El formulario valida los datos y envía el mensaje a mi correo.
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
                autoComplete="name"
                minLength={2}
                maxLength={80}
                required
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={formState.email}
                error={formErrors.email}
                onChange={updateField}
                placeholder="tu@email.com"
                autoComplete="email"
                maxLength={254}
                required
              />
              <Field
                label="Mensaje"
                name="message"
                value={formState.message}
                error={formErrors.message}
                onChange={updateField}
                placeholder="Contame qué necesitás..."
                minLength={20}
                maxLength={2000}
                required
                multiline
              />
              <button className="btn btn-primary btn-full" type="submit" disabled={isSendingMessage} aria-busy={isSendingMessage}>
                {isSendingMessage ? 'Enviando...' : 'Enviar mensaje'} <Send size={18} aria-hidden="true" />
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

      {isEditorOpen && (
        <PortfolioEditor
          draft={editorDraft}
          editKey={editKey}
          error={editorError}
          isSaving={isSavingContent}
          isUnlocked={isEditorUnlocked}
          onAddEducationItem={addEducationItem}
          onAddProject={addProject}
          onClose={closeEditor}
          onRemoveEducationItem={removeEducationItem}
          onRemoveProject={removeProject}
          onSave={savePortfolioContent}
          onUnlock={unlockEditor}
          onUpdateDraftList={updateDraftList}
          onUpdateEducation={updateEducation}
          onUpdateKey={setEditKey}
          onUpdateProject={updateProject}
        />
      )}
    </>
  );
}

function PortfolioEditor({
  draft,
  editKey,
  error,
  isSaving,
  isUnlocked,
  onAddEducationItem,
  onAddProject,
  onClose,
  onRemoveEducationItem,
  onRemoveProject,
  onSave,
  onUnlock,
  onUpdateDraftList,
  onUpdateEducation,
  onUpdateKey,
  onUpdateProject,
}) {
  const frontendTech = draft.technologies.slice(0, 5);
  const backendTech = draft.technologies.slice(5);

  function updateTechnologies(frontend, backend) {
    onUpdateDraftList(['technologies'], [...frontend, ...backend]);
  }

  return (
    <div className="editor-backdrop" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <div className="editor-panel">
        <div className="editor-topbar">
          <div>
            <p className="section-tag">Editor</p>
            <h2 id="editor-title">Contenido del portfolio</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Cerrar editor">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {!isUnlocked ? (
          <form className="unlock-card" onSubmit={onUnlock}>
            <LockKeyhole size={34} aria-hidden="true" />
            <div>
              <h3>Ingresá la clave</h3>
              <p>Al desbloquear podés editar proyectos, tecnologías y formación.</p>
            </div>
            <input
              type="password"
              value={editKey}
              onChange={(event) => onUpdateKey(event.target.value)}
              placeholder="Clave de edición"
              aria-label="Clave de edición"
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary btn-full" type="submit">
              Desbloquear
            </button>
          </form>
        ) : (
          <>
            <div className="editor-content">
            <EditorSection
              title="Tecnologías y herramientas"
              description="Editá las listas separando cada item con coma."
            >
              <EditorField
                label="Frontend"
                value={frontendTech.join(', ')}
                onChange={(value) => updateTechnologies(splitList(value), backendTech)}
              />
              <EditorField
                label="Backend y datos"
                value={backendTech.join(', ')}
                onChange={(value) => updateTechnologies(frontendTech, splitList(value))}
              />
              <EditorField
                label="Herramientas IA"
                value={draft.aiTools.join(', ')}
                onChange={(value) => onUpdateDraftList(['aiTools'], splitList(value))}
              />
            </EditorSection>

            <EditorSection
              title="Juegos destacados"
              description="Podés cambiar nombre, imagen, descripción y tecnologías."
              action={
                <button className="editor-mini-btn" type="button" onClick={() => onAddProject('featuredGames')}>
                  <Plus size={15} aria-hidden="true" /> Agregar
                </button>
              }
            >
              <ProjectEditorList
                group="featuredGames"
                projects={draft.featuredGames}
                onRemoveProject={onRemoveProject}
                onUpdateProject={onUpdateProject}
              />
            </EditorSection>

            <EditorSection
              title="Proyectos menores"
              description="La imagen puede ser una ruta del proyecto o un arte: repair / network."
              action={
                <button className="editor-mini-btn" type="button" onClick={() => onAddProject('smallerProjects')}>
                  <Plus size={15} aria-hidden="true" /> Agregar
                </button>
              }
            >
              <ProjectEditorList
                group="smallerProjects"
                projects={draft.smallerProjects}
                onRemoveProject={onRemoveProject}
                onUpdateProject={onUpdateProject}
              />
            </EditorSection>

            <EditorSection
              title="Formación académica"
              description="Usá icono graduation o computer."
              action={
                <button className="editor-mini-btn" type="button" onClick={onAddEducationItem}>
                  <Plus size={15} aria-hidden="true" /> Agregar
                </button>
              }
            >
              {draft.educationItems.map((item, index) => (
                <article className="editor-item" key={`${item.title}-${index}`}>
                  <EditorField label="Título" value={item.title} onChange={(value) => onUpdateEducation(index, 'title', value)} />
                  <EditorField
                    label="Descripción"
                    value={item.description}
                    onChange={(value) => onUpdateEducation(index, 'description', value)}
                    multiline
                  />
                  <EditorField label="Icono" value={item.icon} onChange={(value) => onUpdateEducation(index, 'icon', value)} />
                  <button className="editor-danger-btn" type="button" onClick={() => onRemoveEducationItem(index)}>
                    <Trash2 size={15} aria-hidden="true" /> Eliminar
                  </button>
                </article>
              ))}
            </EditorSection>
          </div>
            <div className="editor-footer">
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="editor-actions">
                <button className="btn btn-secondary" type="button" onClick={onClose}>
                  Cancelar
                </button>
                <button className="btn btn-primary" type="button" onClick={onSave} disabled={isSaving}>
                  <Save size={17} aria-hidden="true" /> {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProjectEditorList({ group, projects, onRemoveProject, onUpdateProject }) {
  return projects.map((project, index) => (
    <article className="editor-item" key={`${project.title}-${index}`}>
      <div className="editor-item-heading">
        <strong>{project.title || 'Proyecto sin título'}</strong>
        <button className="editor-danger-btn" type="button" onClick={() => onRemoveProject(group, index)}>
          <Trash2 size={15} aria-hidden="true" /> Eliminar
        </button>
      </div>
      <EditorField label="Nombre" value={project.title} onChange={(value) => onUpdateProject(group, index, 'title', value)} />
      <EditorField
        label="Imagen"
        value={project.image ?? ''}
        onChange={(value) => onUpdateProject(group, index, 'image', value)}
        placeholder="/imagen.png o URL"
      />
      <EditorField
        label="Arte CSS"
        value={project.art ?? ''}
        onChange={(value) => onUpdateProject(group, index, 'art', value)}
        placeholder="repair, network o vacío"
      />
      <EditorField
        label="Descripción"
        value={project.description}
        onChange={(value) => onUpdateProject(group, index, 'description', value)}
        multiline
      />
      <EditorField
        label="Tags"
        value={(project.tags ?? []).join(', ')}
        onChange={(value) => onUpdateProject(group, index, 'tags', splitList(value))}
      />
    </article>
  ));
}

function EditorSection({ title, description, action, children }) {
  return (
    <section className="editor-section">
      <div className="editor-section-head">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {action}
      </div>
      <div className="editor-section-body">{children}</div>
    </section>
  );
}

function EditorField({ label, value, onChange, placeholder = '', multiline = false }) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      {multiline ? (
        <textarea rows="3" value={value ?? ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      ) : (
        <input value={value ?? ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

function splitList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function ProjectCard({ project, large = false }) {
  return (
    <article className={`project-card ${large ? 'project-card-large' : ''}`}>
      <div className="project-thumb">
        {project.art || !project.image ? (
          <ProjectArt type={project.art || 'repair'} title={project.title} />
        ) : (
          <img src={project.image} alt={`Captura de ${project.title}`} loading="lazy" />
        )}
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

function ProjectArt({ type, title }) {
  if (type === 'network') {
    return (
      <div className="project-art project-art-network" aria-label={`Arte visual para ${title}`}>
        <span className="network-node node-a" />
        <span className="network-node node-b" />
        <span className="network-node node-c" />
        <span className="network-node node-d" />
        <span className="network-line line-a" />
        <span className="network-line line-b" />
        <span className="network-line line-c" />
        <span className="network-label">LAN</span>
      </div>
    );
  }

  return (
    <div className="project-art project-art-repair" aria-label={`Arte visual para ${title}`}>
      <span className="monitor-frame">
        <span className="monitor-code" />
      </span>
      <span className="tool-orbit orbit-one" />
      <span className="tool-orbit orbit-two" />
      <span className="repair-chip">CPU</span>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  error,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  autoComplete,
  minLength,
  maxLength,
  required = false,
}) {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const props = {
    id: fieldId,
    name,
    value,
    onChange,
    placeholder,
    autoComplete,
    minLength,
    maxLength,
    required,
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
