import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUp,
  Briefcase,
  Check,
  Code2,
  Cpu,
  ExternalLink,
  Gamepad2,
  Github,
  GraduationCap,
  Laptop,
  LockKeyhole,
  Mail,
  Moon,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Sun,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { initHeroScene } from './hero-scene.js';
import { useTheme } from './hooks/useTheme.js';
import {
  aiTools as fallbackAiTools,
  backendTechnologies as fallbackBackendTechnologies,
  educationItems as fallbackEducationItems,
  featuredGames as fallbackFeaturedGames,
  frontendTechnologies as fallbackFrontendTechnologies,
  profile as fallbackProfile,
  smallerProjects as fallbackSmallerProjects,
  technologies as fallbackTechnologies,
} from './data/portfolio.js';

const STORAGE_KEY = 'matias_portfolio_v2';

const defaultPortfolioContent = {
  profile: fallbackProfile,
  technologies: fallbackTechnologies,
  frontendTechnologies: fallbackFrontendTechnologies,
  backendTechnologies: fallbackBackendTechnologies,
  aiTools: fallbackAiTools,
  educationItems: fallbackEducationItems,
  featuredGames: fallbackFeaturedGames,
  smallerProjects: fallbackSmallerProjects,
};

function getStoredOrInitialContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.profile) {
        const frontend =
          parsed.frontendTechnologies ||
          parsed.technologies?.slice(0, 5) ||
          defaultPortfolioContent.frontendTechnologies;
        const backend =
          parsed.backendTechnologies ||
          parsed.technologies?.slice(5) ||
          defaultPortfolioContent.backendTechnologies;

        return {
          ...defaultPortfolioContent,
          ...parsed,
          frontendTechnologies: frontend,
          backendTechnologies: backend,
          technologies: parsed.technologies || [...frontend, ...backend],
          featuredGames: (parsed.featuredGames || defaultPortfolioContent.featuredGames).map((p, i) => ({
            ...p,
            id: p.id || `game-${i}-${Date.now()}`,
          })),
          smallerProjects: (parsed.smallerProjects || defaultPortfolioContent.smallerProjects).map((p, i) => ({
            ...p,
            id: p.id || `proj-${i}-${Date.now()}`,
          })),
          educationItems: (parsed.educationItems || defaultPortfolioContent.educationItems).map((e, i) => ({
            ...e,
            id: e.id || `edu-${i}-${Date.now()}`,
          })),
        };
      }
    }
  } catch {
    // Fallback if localStorage is disabled
  }
  return defaultPortfolioContent;
}

const emptyGame = {
  id: '',
  title: 'Nuevo juego',
  status: 'Juego destacado',
  image: '',
  description: 'Descripción breve de la propuesta de juego, mecánicas y controles.',
  tags: ['Juego', 'JavaScript'],
  links: { demo: '', code: '' },
};

const emptyProject = {
  id: '',
  title: 'Nuevo proyecto',
  status: '',
  image: '',
  art: '',
  description: 'Descripción del proyecto técnico, herramienta o desarrollo.',
  tags: ['Desarrollo', 'Web'],
  links: { demo: '', code: '' },
};

const emptyEducation = {
  id: '',
  title: 'Nueva formación o certificación',
  description: 'Conocimientos, temas abordados y prácticas realizadas.',
  icon: 'graduation',
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
  const [portfolioContent, setPortfolioContent] = useState(getStoredOrInitialContent);
  const [isScrolled, setIsScrolled] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [toast, setToast] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditorUnlocked, setIsEditorUnlocked] = useState(false);
  const [editKey, setEditKey] = useState('');
  const [editorDraft, setEditorDraft] = useState(portfolioContent);
  const [editorError, setEditorError] = useState('');
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const {
    aiTools,
    educationItems,
    featuredGames,
    profile,
    smallerProjects,
    frontendTechnologies,
    backendTechnologies,
    technologies,
  } = portfolioContent;

  const hasCv = Boolean(profile.cvPath);
  const isLight = theme === 'theme-light';

  useEffect(() => {
    document.title = 'Matias Rivas desarrollador de frontend';

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
          const frontend =
            remoteContent.frontendTechnologies ||
            remoteContent.technologies?.slice(0, 5) ||
            defaultPortfolioContent.frontendTechnologies;
          const backend =
            remoteContent.backendTechnologies ||
            remoteContent.technologies?.slice(5) ||
            defaultPortfolioContent.backendTechnologies;

          const merged = {
            ...defaultPortfolioContent,
            ...remoteContent,
            frontendTechnologies: frontend,
            backendTechnologies: backend,
            technologies: remoteContent.technologies || [...frontend, ...backend],
            featuredGames: (remoteContent.featuredGames || defaultPortfolioContent.featuredGames).map((p, i) => ({
              ...p,
              id: p.id || `game-${i}-${Date.now()}`,
            })),
            smallerProjects: (remoteContent.smallerProjects || defaultPortfolioContent.smallerProjects).map((p, i) => ({
              ...p,
              id: p.id || `proj-${i}-${Date.now()}`,
            })),
            educationItems: (remoteContent.educationItems || defaultPortfolioContent.educationItems).map((e, i) => ({
              ...e,
              id: e.id || `edu-${i}-${Date.now()}`,
            })),
          };

          setPortfolioContent(merged);
          setEditorDraft(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
      } catch {
        // Keeps local / stored data active
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

  const activeFrontend = frontendTechnologies || technologies.slice(0, 5);
  const activeBackend = backendTechnologies || technologies.slice(5);

  const groupedStack = useMemo(
    () => [
      { title: 'Frontend', items: activeFrontend },
      { title: 'Backend y datos', items: activeBackend },
      { title: 'Herramientas IA', items: aiTools },
    ],
    [activeFrontend, activeBackend, aiTools],
  );

  function toggleTheme() {
    setTheme(isLight ? 'theme-dark' : 'theme-light');
    setToast(isLight ? 'Modo noche activado' : 'Modo día activado');
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
    if (event) event.preventDefault();
    setEditorError('');
    setIsUnlocking(true);

    try {
      const response = await fetch('/api/portfolio/check-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portfolio-key': editKey,
        },
      });

      if (response.status === 401) {
        setEditorError('Clave incorrecta. Probá de nuevo.');
        setIsUnlocking(false);
        return;
      }

      setIsEditorUnlocked(true);
      setToast('Editor desbloqueado');
    } catch {
      // Offline or local dev environment without backend Worker
      setIsEditorUnlocked(true);
      setToast('Editor desbloqueado (modo local)');
    } finally {
      setIsUnlocking(false);
    }
  }

  function updateDraftProfile(field, value) {
    setEditorDraft((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }));
  }

  function addDraftTech(category, tech) {
    setEditorDraft((current) => {
      const list = current[category] || [];
      if (list.includes(tech)) return current;
      return {
        ...current,
        [category]: [...list, tech],
      };
    });
    setToast(`"${tech}" agregada`);
  }

  function removeDraftTech(category, tech) {
    setEditorDraft((current) => ({
      ...current,
      [category]: (current[category] || []).filter((item) => item !== tech),
    }));
  }

  function updateProject(group, id, field, value) {
    setEditorDraft((current) => ({
      ...current,
      [group]: current[group].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  }

  function addProject(group) {
    const isFeatured = group === 'featuredGames';
    const template = isFeatured ? emptyGame : emptyProject;
    const newItem = {
      ...template,
      id: `${isFeatured ? 'game' : 'proj'}-${Date.now()}`,
    };

    setEditorDraft((current) => ({
      ...current,
      [group]: [newItem, ...current[group]],
    }));
    setToast(isFeatured ? 'Nuevo juego destacado agregado' : 'Nuevo proyecto agregado');
  }

  function requestDeleteProject(group, id, title) {
    setDeleteConfirmation({
      type: group,
      id,
      title: title || 'este proyecto',
    });
  }

  function requestDeleteEducation(id, title) {
    setDeleteConfirmation({
      type: 'educationItems',
      id,
      title: title || 'este elemento',
    });
  }

  function confirmDelete() {
    if (!deleteConfirmation) return;
    const { type, id, title } = deleteConfirmation;

    if (type === 'featuredGames' || type === 'smallerProjects') {
      setEditorDraft((current) => ({
        ...current,
        [type]: current[type].filter((item) => item.id !== id),
      }));
    } else if (type === 'educationItems') {
      setEditorDraft((current) => ({
        ...current,
        educationItems: current.educationItems.filter((item) => item.id !== id),
      }));
    }

    setToast(`"${title}" eliminado del borrador`);
    setDeleteConfirmation(null);
  }

  function updateEducation(id, field, value) {
    setEditorDraft((current) => ({
      ...current,
      educationItems: current.educationItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addEducationItem() {
    const newItem = {
      ...emptyEducation,
      id: `edu-${Date.now()}`,
    };
    setEditorDraft((current) => ({
      ...current,
      educationItems: [newItem, ...current.educationItems],
    }));
    setToast('Nueva formación agregada');
  }

  function resetToDefaults() {
    if (window.confirm('¿Querés restablecer todo el contenido a los valores iniciales? Se perderán las modificaciones no guardadas.')) {
      setEditorDraft(defaultPortfolioContent);
      setToast('Borrador restablecido a los valores por defecto');
    }
  }

  async function savePortfolioContent() {
    setIsSavingContent(true);
    setEditorError('');

    const frontend = editorDraft.frontendTechnologies || [];
    const backend = editorDraft.backendTechnologies || [];
    const payload = {
      ...editorDraft,
      frontendTechnologies: frontend,
      backendTechnologies: backend,
      technologies: [...frontend, ...backend],
    };

    // Save to localStorage immediately
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}

    setPortfolioContent(payload);
    setEditorDraft(payload);

    try {
      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-portfolio-key': editKey,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        throw new Error('Clave incorrecta para guardar en la base de datos.');
      }

      if (response.ok) {
        const savedRemote = await response.json();
        const updated = { ...payload, ...savedRemote };
        setPortfolioContent(updated);
        setEditorDraft(updated);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        setToast('Cambios guardados en la base de datos');
        closeEditor();
      } else {
        setToast('Cambios guardados localmente');
        closeEditor();
      }
    } catch (err) {
      if (err.message?.includes('Clave incorrecta')) {
        setEditorError(err.message);
      } else {
        // Saved locally even if network/worker is offline
        setToast('Cambios guardados localmente en tu navegador');
        closeEditor();
      }
    } finally {
      setIsSavingContent(false);
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
                <p>{profile.role} · Estudiante de Informática</p>
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
              <h2 className="section-title">Juegos destacados y proyectos técnicos</h2>
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
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

        <section id="formacion" className="section">
          <div className="container timeline-card">
            <p className="section-tag">04 / Formación</p>
            <h2 className="section-title">Formación académica</h2>
            {educationItems.map((item) => (
              <div className="timeline-item" key={item.id}>
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
                  : 'No encontré un archivo de CV en el proyecto. Podés cargar /cv-matias-rivas.pdf en la carpeta public y editar la ruta desde el editor.'}
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
                Podés contactarme directamente por email o visitar mi perfil de GitHub.
              </p>
              <div className="contact-actions">
                <a className="link-button" href={`mailto:${profile.email}`}>
                  <Mail size={18} aria-hidden="true" />
                  {profile.email}
                </a>
                <a className="link-button" href={profile.github} target="_blank" rel="noreferrer">
                  <Github size={18} aria-hidden="true" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-content">
          <span>{profile.name}</span>
          <span>Portfolio en español · React 19 + Vite</span>
        </div>
      </footer>

      {isScrolled && (
        <button
          className="back-to-top"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Volver arriba"
          title="Volver arriba"
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
      )}

      {deleteConfirmation && (
        <div
          className="confirm-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeleteConfirmation(null);
          }}
        >
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <span className="confirm-icon">
              <Trash2 size={20} aria-hidden="true" />
            </span>
            <h2 id="delete-dialog-title">¿Eliminar este elemento?</h2>
            <p id="delete-dialog-description">
              Se quitará <strong>{deleteConfirmation.title}</strong> del borrador. El cambio se aplicará al guardar.
            </p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" type="button" onClick={() => setDeleteConfirmation(null)}>
                Cancelar
              </button>
              <button className="btn confirm-delete-btn" type="button" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </section>
        </div>
      )}

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
          isUnlocking={isUnlocking}
          onAddEducationItem={addEducationItem}
          onAddProject={addProject}
          onAddTech={addDraftTech}
          onClose={closeEditor}
          onRemoveEducationItem={requestDeleteEducation}
          onRemoveProject={requestDeleteProject}
          onRemoveTech={removeDraftTech}
          onResetToDefaults={resetToDefaults}
          onSave={savePortfolioContent}
          onUnlock={unlockEditor}
          onUpdateEducation={updateEducation}
          onUpdateKey={setEditKey}
          onUpdateProfile={updateDraftProfile}
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
  isUnlocking,
  onAddEducationItem,
  onAddProject,
  onAddTech,
  onClose,
  onRemoveEducationItem,
  onRemoveProject,
  onRemoveTech,
  onResetToDefaults,
  onSave,
  onUnlock,
  onUpdateEducation,
  onUpdateKey,
  onUpdateProfile,
  onUpdateProject,
}) {
  const [activeTab, setActiveTab] = useState('stack');

  const frontendCount = draft.frontendTechnologies?.length || 0;
  const backendCount = draft.backendTechnologies?.length || 0;
  const aiCount = draft.aiTools?.length || 0;
  const totalStack = frontendCount + backendCount + aiCount;

  return (
    <div className="editor-backdrop" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <div className="editor-panel">
        <div className="editor-topbar">
          <div>
            <p className="section-tag">Panel de Control</p>
            <h2 id="editor-title">Editor de Contenido</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Cerrar editor">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {!isUnlocked ? (
          <form className="unlock-card" onSubmit={onUnlock}>
            <LockKeyhole size={34} aria-hidden="true" />
            <div>
              <h3>Desbloquear editor</h3>
              <p>Ingresá la clave de edición configurada en el hosting o continuá en modo local.</p>
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
            <button className="btn btn-primary btn-full" type="submit" disabled={isUnlocking}>
              {isUnlocking ? 'Verificando...' : 'Desbloquear'}
            </button>

            <div className="unlock-local-hint">
              <p>¿Estás probando en local o sin backend configurado?</p>
              <button
                type="button"
                className="unlock-local-btn"
                onClick={() => onUnlock()}
              >
                Continuar en modo local
              </button>
            </div>
          </form>
        ) : (
          <>
            <nav className="editor-tabs" aria-label="Secciones del editor">
              <button
                type="button"
                className={`editor-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={15} aria-hidden="true" />
                <span>Perfil</span>
              </button>

              <button
                type="button"
                className={`editor-tab-btn ${activeTab === 'stack' ? 'active' : ''}`}
                onClick={() => setActiveTab('stack')}
              >
                <Cpu size={15} aria-hidden="true" />
                <span>Stack & IA</span>
                <span className="editor-badge-counter">{totalStack}</span>
              </button>

              <button
                type="button"
                className={`editor-tab-btn ${activeTab === 'games' ? 'active' : ''}`}
                onClick={() => setActiveTab('games')}
              >
                <Gamepad2 size={15} aria-hidden="true" />
                <span>Juegos</span>
                <span className="editor-badge-counter">{draft.featuredGames?.length || 0}</span>
              </button>

              <button
                type="button"
                className={`editor-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                <Briefcase size={15} aria-hidden="true" />
                <span>Proyectos</span>
                <span className="editor-badge-counter">{draft.smallerProjects?.length || 0}</span>
              </button>

              <button
                type="button"
                className={`editor-tab-btn ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => setActiveTab('education')}
              >
                <GraduationCap size={15} aria-hidden="true" />
                <span>Formación</span>
                <span className="editor-badge-counter">{draft.educationItems?.length || 0}</span>
              </button>
            </nav>

            <div className="editor-content">
              {activeTab === 'profile' && (
                <EditorSection
                  title="Información Personal y Contacto"
                  description="Modificá los datos que se muestran en el encabezado, bio y pie del portfolio."
                >
                  <div className="editor-grid-2">
                    <EditorField
                      label="Nombre completo"
                      value={draft.profile.name}
                      onChange={(val) => onUpdateProfile('name', val)}
                    />
                    <EditorField
                      label="Rol / Especialidad"
                      value={draft.profile.role}
                      onChange={(val) => onUpdateProfile('role', val)}
                    />
                  </div>

                  <EditorField
                    label="Subtítulo de presentación"
                    value={draft.profile.subtitle}
                    onChange={(val) => onUpdateProfile('subtitle', val)}
                  />

                  <EditorField
                    label="Resumen biográfico"
                    value={draft.profile.summary}
                    onChange={(val) => onUpdateProfile('summary', val)}
                    multiline
                  />

                  <EditorField
                    label="Declaración sobre uso de IA"
                    value={draft.profile.aiStatement}
                    onChange={(val) => onUpdateProfile('aiStatement', val)}
                    multiline
                  />

                  <EditorField
                    label="Lema / Cita personal"
                    value={draft.profile.motto}
                    onChange={(val) => onUpdateProfile('motto', val)}
                  />

                  <div className="editor-grid-2">
                    <EditorField
                      label="Correo electrónico"
                      value={draft.profile.email}
                      onChange={(val) => onUpdateProfile('email', val)}
                    />
                    <EditorField
                      label="URL de perfil en GitHub"
                      value={draft.profile.github}
                      onChange={(val) => onUpdateProfile('github', val)}
                    />
                  </div>

                  <div className="editor-grid-2">
                    <EditorField
                      label="Ruta o URL del CV"
                      value={draft.profile.cvPath}
                      onChange={(val) => onUpdateProfile('cvPath', val)}
                      placeholder="/cv-matias-rivas.pdf"
                    />
                    <EditorField
                      label="Ruta o URL del Avatar"
                      value={draft.profile.avatarPath}
                      onChange={(val) => onUpdateProfile('avatarPath', val)}
                      placeholder="/pancho-floating.png"
                    />
                  </div>
                </EditorSection>
              )}

              {activeTab === 'stack' && (
                <>
                  <EditorSection
                    title="Tecnologías Frontend"
                    description="Lenguajes, bibliotecas y herramientas orientadas a interfaces."
                  >
                    <ChipManager
                      label="Tecnologías Frontend"
                      items={draft.frontendTechnologies || []}
                      onAdd={(tech) => onAddTech('frontendTechnologies', tech)}
                      onRemove={(tech) => onRemoveTech('frontendTechnologies', tech)}
                      placeholder="Escribí una tecnología (ej: Next.js, Tailwind, Vue)..."
                    />
                  </EditorSection>

                  <EditorSection
                    title="Tecnologías Backend y Datos"
                    description="Lenguajes del servidor, bases de datos, protocolos y APIs."
                  >
                    <ChipManager
                      label="Tecnologías Backend y Datos"
                      items={draft.backendTechnologies || []}
                      onAdd={(tech) => onAddTech('backendTechnologies', tech)}
                      onRemove={(tech) => onRemoveTech('backendTechnologies', tech)}
                      placeholder="Escribí una tecnología (ej: Node.js, PostgreSQL, Docker)..."
                    />
                  </EditorSection>

                  <EditorSection
                    title="Herramientas de Inteligencia Artificial"
                    description="Modelos y asistentes utilizados como complemento de desarrollo."
                  >
                    <ChipManager
                      label="Herramientas IA"
                      items={draft.aiTools || []}
                      onAdd={(tool) => onAddTech('aiTools', tool)}
                      onRemove={(tool) => onRemoveTech('aiTools', tool)}
                      placeholder="Escribí una herramienta (ej: Claude 3.5, Gemini, Cursor)..."
                    />
                  </EditorSection>
                </>
              )}

              {activeTab === 'games' && (
                <EditorSection
                  title="Juegos Destacados"
                  description="Proyectos lúdicos interactivos que destacan en el portfolio."
                  action={
                    <button
                      className="editor-mini-btn"
                      type="button"
                      onClick={() => onAddProject('featuredGames')}
                    >
                      <Plus size={15} aria-hidden="true" /> Agregar Juego
                    </button>
                  }
                >
                  <ProjectEditorList
                    group="featuredGames"
                    projects={draft.featuredGames}
                    onRemoveProject={(id, title) => onRemoveProject('featuredGames', id, title)}
                    onUpdateProject={onUpdateProject}
                  />
                </EditorSection>
              )}

              {activeTab === 'projects' && (
                <EditorSection
                  title="Proyectos Menores y Prácticas"
                  description="Programas, mantenimiento de hardware o diseños de infraestructura."
                  action={
                    <button
                      className="editor-mini-btn"
                      type="button"
                      onClick={() => onAddProject('smallerProjects')}
                    >
                      <Plus size={15} aria-hidden="true" /> Agregar Proyecto
                    </button>
                  }
                >
                  <ProjectEditorList
                    group="smallerProjects"
                    projects={draft.smallerProjects}
                    onRemoveProject={(id, title) => onRemoveProject('smallerProjects', id, title)}
                    onUpdateProject={onUpdateProject}
                  />
                </EditorSection>
              )}

              {activeTab === 'education' && (
                <EditorSection
                  title="Formación Académica y Prácticas"
                  description="Estudios formales, talleres técnicos y prácticas profesionalizantes."
                  action={
                    <button
                      className="editor-mini-btn"
                      type="button"
                      onClick={onAddEducationItem}
                    >
                      <Plus size={15} aria-hidden="true" /> Agregar Formación
                    </button>
                  }
                >
                  {draft.educationItems.map((item, index) => (
                    <article className="editor-card-item" key={item.id}>
                      <div className="editor-card-header">
                        <div className="editor-card-title">
                          <span className="editor-card-index">{index + 1}</span>
                          <strong>{item.title || 'Formación sin título'}</strong>
                        </div>
                        <button
                          className="editor-danger-btn"
                          type="button"
                          onClick={() => onRemoveEducationItem(item.id, item.title)}
                        >
                          <Trash2 size={15} aria-hidden="true" /> Eliminar
                        </button>
                      </div>

                      <EditorField
                        label="Título de la formación"
                        value={item.title}
                        onChange={(value) => onUpdateEducation(item.id, 'title', value)}
                      />

                      <EditorField
                        label="Descripción o detalle"
                        value={item.description}
                        onChange={(value) => onUpdateEducation(item.id, 'description', value)}
                        multiline
                      />

                      <div className="editor-field">
                        <span>Icono representativo</span>
                        <div className="editor-pill-options">
                          <button
                            type="button"
                            className={`editor-pill-option ${item.icon === 'graduation' ? 'selected' : ''}`}
                            onClick={() => onUpdateEducation(item.id, 'icon', 'graduation')}
                          >
                            <GraduationCap size={15} aria-hidden="true" />
                            Académico / Institucional
                          </button>
                          <button
                            type="button"
                            className={`editor-pill-option ${item.icon === 'computer' ? 'selected' : ''}`}
                            onClick={() => onUpdateEducation(item.id, 'icon', 'computer')}
                          >
                            <Laptop size={15} aria-hidden="true" />
                            Técnico / Hardware
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </EditorSection>
              )}
            </div>

            <div className="editor-footer">
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="editor-footer-container">
                <button
                  type="button"
                  className="unlock-local-btn"
                  onClick={onResetToDefaults}
                  title="Vuelve a los datos iniciales de fábrica"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Restablecer originales
                </button>

                <div className="editor-actions">
                  <button className="btn btn-secondary" type="button" onClick={onClose}>
                    Cerrar
                  </button>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                  >
                    <Save size={17} aria-hidden="true" />
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChipManager({ label, items, onAdd, onRemove, placeholder = 'Agregar elemento...' }) {
  const [inputValue, setInputValue] = useState('');

  function handleAdd() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (items.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('');
      return;
    }
    onAdd(trimmed);
    setInputValue('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="chip-manager">
      <div className="chip-list">
        {items.length === 0 ? (
          <span className="chip-list-empty">
            Sin elementos. Escribí uno y hacé clic en Agregar o presioná Enter.
          </span>
        ) : (
          items.map((item) => (
            <span className="tag-chip" key={item}>
              <span>{item}</span>
              <button
                type="button"
                className="tag-chip-remove"
                onClick={() => onRemove(item)}
                aria-label={`Eliminar ${item}`}
                title={`Eliminar ${item}`}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          ))
        )}
      </div>

      <div className="chip-input-row">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <button type="button" className="chip-add-btn" onClick={handleAdd}>
          <Plus size={15} aria-hidden="true" /> Agregar
        </button>
      </div>
    </div>
  );
}

function ProjectEditorList({ group, projects, onRemoveProject, onUpdateProject }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {projects.map((project, index) => (
        <article className="editor-card-item" key={project.id}>
          <div className="editor-card-header">
            <div className="editor-card-title">
              <span className="editor-card-index">{index + 1}</span>
              <strong>{project.title || 'Proyecto sin título'}</strong>
            </div>
            <button
              className="editor-danger-btn"
              type="button"
              onClick={() => onRemoveProject(project.id, project.title)}
            >
              <Trash2 size={15} aria-hidden="true" /> Eliminar
            </button>
          </div>

          <div className="editor-grid-2">
            <EditorField
              label="Nombre del proyecto"
              value={project.title}
              onChange={(value) => onUpdateProject(group, project.id, 'title', value)}
            />
            <EditorField
              label="Etiqueta de estado o badge"
              value={project.status ?? ''}
              onChange={(value) => onUpdateProject(group, project.id, 'status', value)}
              placeholder="Ej: Juego destacado, En desarrollo..."
            />
          </div>

          <div className="editor-grid-2">
            <EditorField
              label="Ruta o URL de Imagen"
              value={project.image ?? ''}
              onChange={(value) => onUpdateProject(group, project.id, 'image', value)}
              placeholder="/panchos-snake.png o URL externa"
            />

            <div className="editor-field">
              <span>Arte visual generado por CSS</span>
              <div className="editor-pill-options">
                <button
                  type="button"
                  className={`editor-pill-option ${!project.art ? 'selected' : ''}`}
                  onClick={() => onUpdateProject(group, project.id, 'art', '')}
                >
                  Usar imagen
                </button>
                <button
                  type="button"
                  className={`editor-pill-option ${project.art === 'repair' ? 'selected' : ''}`}
                  onClick={() => onUpdateProject(group, project.id, 'art', 'repair')}
                >
                  <Laptop size={14} aria-hidden="true" /> Hardware / PC
                </button>
                <button
                  type="button"
                  className={`editor-pill-option ${project.art === 'network' ? 'selected' : ''}`}
                  onClick={() => onUpdateProject(group, project.id, 'art', 'network')}
                >
                  <Cpu size={14} aria-hidden="true" /> Redes LAN
                </button>
              </div>
            </div>
          </div>

          <EditorField
            label="Descripción detallada"
            value={project.description}
            onChange={(value) => onUpdateProject(group, project.id, 'description', value)}
            multiline
          />

          <div className="editor-grid-2">
            <EditorField
              label="Enlace a Demo (opcional)"
              value={project.links?.demo ?? ''}
              onChange={(value) =>
                onUpdateProject(group, project.id, 'links', {
                  ...(project.links || {}),
                  demo: value,
                })
              }
              placeholder="https://..."
            />
            <EditorField
              label="Enlace al Código en GitHub (opcional)"
              value={project.links?.code ?? ''}
              onChange={(value) =>
                onUpdateProject(group, project.id, 'links', {
                  ...(project.links || {}),
                  code: value,
                })
              }
              placeholder="https://github.com/..."
            />
          </div>

          <div className="editor-field">
            <span>Tecnologías y Etiquetas</span>
            <ChipManager
              items={project.tags || []}
              onAdd={(tag) => {
                const nextTags = [...(project.tags || []), tag];
                onUpdateProject(group, project.id, 'tags', nextTags);
              }}
              onRemove={(tag) => {
                const nextTags = (project.tags || []).filter((t) => t !== tag);
                onUpdateProject(group, project.id, 'tags', nextTags);
              }}
              placeholder="Agregar tag (ej: React, Canvas, Python)..."
            />
          </div>
        </article>
      ))}
    </div>
  );
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
        <textarea
          rows="3"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
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
          {(project.tags || []).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        {(project.links?.demo || project.links?.code) && (
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.85rem' }}>
            {project.links?.demo && (
              <a
                className="link-button"
                href={project.links.demo}
                target="_blank"
                rel="noreferrer"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
              >
                Demo <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
            {project.links?.code && (
              <a
                className="link-button"
                href={project.links.code}
                target="_blank"
                rel="noreferrer"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
              >
                Código <Github size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        )}
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

export default App;
