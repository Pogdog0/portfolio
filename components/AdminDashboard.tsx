"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Enquiry, EnquiryStatus, PortfolioProject, SiteContent } from "@/lib/content";

const navGroups = [
  { label: "Overview", items: [["◈", "Dashboard"], ["▣", "Projects"], ["◫", "Case studies"]] },
  { label: "Content", items: [["◇", "Metrics"], ["✦", "Services & skills"], ["◌", "Working principles"], ["▧", "Media library"]] },
  { label: "Operations", items: [["↗", "Enquiries"], ["◎", "Site settings"]] },
];

const emptyCaseStudy = { intro: "", problem: "", investigation: "", solution: "", result: "", scope: "", lead: "" };

function emptyProject(order: number): PortfolioProject {
  return {
    id: crypto.randomUUID(), slug: "new-project", title: "", eyebrow: `Project / ${String(order + 1).padStart(2, "0")}`,
    description: "", image: "/images/projects/hero-systems.webp", category: "Gameplay Systems", tags: [], role: "", period: "", result: "",
    accent: "#55a8ff", videoUrl: "", status: "Draft", featured: false, order, updatedAt: new Date().toISOString(), caseStudy: { ...emptyCaseStudy },
  };
}

function Stat({ value, label, detail, tone = "default" }: { value: string; label: string; detail: string; tone?: string }) {
  return <div className={`admin-stat ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function ProjectEditor({ project, media, initialTab, onClose, onSave }: { project: PortfolioProject; media: SiteContent["media"]; initialTab: string; onClose: () => void; onSave: (project: PortfolioProject) => void }) {
  const [draft, setDraft] = useState(() => structuredClone(project));
  const [tab, setTab] = useState(initialTab);
  const update = <K extends keyof PortfolioProject>(key: K, value: PortfolioProject[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateCase = (key: keyof PortfolioProject["caseStudy"], value: string) => setDraft((current) => ({ ...current, caseStudy: { ...current.caseStudy, [key]: value } }));
  const normalizedSlug = () => (draft.slug || draft.title).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ ...draft, slug: normalizedSlug(), updatedAt: new Date().toISOString() });
  }
  return <div className="admin-editor-backdrop" onMouseDown={onClose}><form className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="project-editor-title" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
    <div className="editor-heading"><div><span>PROJECT / {project.title ? "EDIT RECORD" : "NEW RECORD"}</span><h2 id="project-editor-title">Shape the story.</h2></div><button type="button" onClick={onClose} aria-label="Close editor">×</button></div>
    <div className="editor-tabs" role="tablist">{["Details", "Media", "Case study", "SEO"].map((item) => <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? "is-active" : ""} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
    <div className="editor-fields">
      {tab === "Details" && <>
        <label><span>Project title</span><input required maxLength={120} value={draft.title} onChange={(event) => update("title", event.target.value)} /></label>
        <div className="editor-two"><label><span>Category</span><input required maxLength={80} value={draft.category} onChange={(event) => update("category", event.target.value)} list="project-categories" /><datalist id="project-categories"><option>Production Work</option><option>Gameplay Systems</option><option>Personal Projects</option><option>Vehicle Systems</option></datalist></label><label><span>Visibility</span><select value={draft.status} onChange={(event) => update("status", event.target.value as PortfolioProject["status"])}><option>Draft</option><option>Published</option></select></label></div>
        <label><span>Project summary</span><textarea required maxLength={800} rows={4} value={draft.description} onChange={(event) => update("description", event.target.value)} /></label>
        <label><span>Tags (comma-separated)</span><input value={draft.tags.join(", ")} onChange={(event) => update("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12))} /></label>
        <div className="editor-two"><label><span>Role</span><input value={draft.role} onChange={(event) => update("role", event.target.value)} /></label><label><span>Period</span><input value={draft.period} onChange={(event) => update("period", event.target.value)} /></label></div>
        <label><span>Result</span><textarea maxLength={500} rows={3} value={draft.result} onChange={(event) => update("result", event.target.value)} /></label>
      </>}
      {tab === "Media" && <>
        <label><span>Cover image</span><select value={draft.image} onChange={(event) => update("image", event.target.value)}>{media.map((asset) => <option value={asset.url} key={asset.id}>{asset.name}</option>)}{!media.some((asset) => asset.url === draft.image) && <option value={draft.image}>{draft.image}</option>}</select></label>
        <label><span>Image URL</span><input required value={draft.image} onChange={(event) => update("image", event.target.value)} placeholder="/images/projects/project.webp" /></label>
        <div className="admin-media-preview" style={{ backgroundImage: `url(${draft.image})` }} role="img" aria-label="Selected project cover preview" />
        <div className="editor-two"><label><span>Accent color</span><input type="color" value={draft.accent} onChange={(event) => update("accent", event.target.value)} /></label><label><span>Video URL</span><input type="url" value={draft.videoUrl} onChange={(event) => update("videoUrl", event.target.value)} placeholder="https://…" /></label></div>
      </>}
      {tab === "Case study" && <>
        <p className="editor-help">Fill in the intro to publish a case-study page. Leave it empty to keep the project card only.</p>
        <label><span>Introduction</span><textarea rows={3} value={draft.caseStudy.intro} onChange={(event) => updateCase("intro", event.target.value)} /></label>
        <div className="editor-two"><label><span>Scope</span><input value={draft.caseStudy.scope} onChange={(event) => updateCase("scope", event.target.value)} /></label><label><span>Lead statement</span><input value={draft.caseStudy.lead} onChange={(event) => updateCase("lead", event.target.value)} /></label></div>
        {(["problem", "investigation", "solution", "result"] as const).map((field) => <label key={field}><span>{field}</span><textarea rows={3} value={draft.caseStudy[field]} onChange={(event) => updateCase(field, event.target.value)} /></label>)}
      </>}
      {tab === "SEO" && <>
        <label><span>URL slug</span><input required pattern="[a-z0-9-]+" value={draft.slug} onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} /></label>
        <label><span>Card eyebrow</span><input required maxLength={140} value={draft.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} /></label>
        <p className="editor-help">Case study URL: /work/{draft.slug || "project-slug"}</p>
      </>}
    </div>
    <div className="editor-footer"><button type="button" className="admin-preview" onClick={() => onSave({ ...draft, status: "Draft", slug: normalizedSlug(), updatedAt: new Date().toISOString() })}>Save as draft</button><button className="admin-add" type="submit">Save & close</button></div>
  </form></div>;
}

export default function AdminDashboard({ initialContent, initialEnquiries, storageWritable }: { initialContent: SiteContent; initialEnquiries: Enquiry[]; storageWritable: boolean }) {
  const [active, setActive] = useState("Dashboard");
  const [content, setContent] = useState(initialContent);
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [enquiryFilter, setEnquiryFilter] = useState("All");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [editorTab, setEditorTab] = useState("Details");
  const [activityDays, setActivityDays] = useState(30);
  const lastSaved = useRef(initialContent);
  const toastTimer = useRef<number | undefined>(undefined);

  const projects = useMemo(() => [...content.projects].sort((a, b) => a.order - b.order), [content.projects]);
  const filtered = useMemo(() => projects.filter((project) => `${project.title} ${project.category}`.toLowerCase().includes(query.toLowerCase()) && (projectFilter === "All" || project.status === projectFilter || project.category === projectFilter)), [projects, query, projectFilter]);
  const visibleEnquiries = useMemo(() => enquiries.filter((enquiry) => enquiryFilter === "All" || enquiry.status === enquiryFilter), [enquiries, enquiryFilter]);
  const activityReference = Math.max(0, ...enquiries.map((enquiry) => new Date(enquiry.createdAt).getTime()));
  const recentCutoff = activityReference - activityDays * 86400000;
  const recentEnquiries = enquiries.filter((enquiry) => new Date(enquiry.createdAt).getTime() >= recentCutoff);

  useEffect(() => {
    if (!editingProject) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setEditingProject(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [editingProject]);

  function flash(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }

  async function persist(next: SiteContent, message = "Changes saved") {
    if (!storageWritable) { setError("This deployment is read-only. Connect persistent database and object storage to enable admin changes on Vercel."); return false; }
    setSaving(true); setError(""); setContent(next);
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: next }) });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) { window.location.assign("/admin/login"); return false; }
      if (!response.ok) throw new Error(result.error || "Unable to save changes.");
      setContent(result.content); lastSaved.current = result.content; flash(message); return true;
    } catch (reason) {
      setContent(lastSaved.current); setError(reason instanceof Error ? reason.message : "Unable to save changes."); return false;
    } finally { setSaving(false); }
  }

  function editProject(project: PortfolioProject, tab = "Details") { setEditorTab(tab); setEditingProject(project); }

  async function saveProject(project: PortfolioProject) {
    const exists = content.projects.some((item) => item.id === project.id);
    if (content.projects.some((item) => item.id !== project.id && item.slug === project.slug)) { setError("Another project already uses that URL slug."); return; }
    const nextProjects = exists ? content.projects.map((item) => item.id === project.id ? project : item) : [...content.projects, project];
    if (await persist({ ...content, projects: nextProjects }, exists ? "Project updated" : "Project created")) setEditingProject(null);
  }

  function toggleStatus(id: string) {
    void persist({ ...content, projects: content.projects.map((project) => project.id === id ? { ...project, status: project.status === "Published" ? "Draft" as const : "Published" as const, updatedAt: new Date().toISOString() } : project) }, "Publishing state updated");
  }

  function toggleFeatured(id: string) {
    const selected = content.projects.find((project) => project.id === id);
    void persist({ ...content, projects: content.projects.map((project) => ({ ...project, featured: project.id === id ? !selected?.featured : false, updatedAt: project.id === id ? new Date().toISOString() : project.updatedAt })) }, selected?.featured ? "Featured project cleared" : "Featured project updated");
  }

  function moveProject(id: string, direction: -1 | 1) {
    const ordered = [...projects]; const index = ordered.findIndex((project) => project.id === id); const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    void persist({ ...content, projects: ordered.map((project, order) => ({ ...project, order })) }, "Project order updated");
  }

  function removeProject(project: PortfolioProject) {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    void persist({ ...content, projects: content.projects.filter((item) => item.id !== project.id).map((item, order) => ({ ...item, order })) }, "Project deleted");
  }

  async function updateEnquiry(id: string, status: EnquiryStatus) {
    if (!storageWritable) { setError("This deployment is read-only. Enquiry updates require persistent storage."); return; }
    const previous = enquiries; setEnquiries((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    const response = await fetch(`/api/admin/enquiries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) { setEnquiries(previous); setError("Unable to update the enquiry."); return; } flash("Enquiry updated");
  }

  async function removeEnquiry(id: string) {
    if (!storageWritable) { setError("This deployment is read-only. Enquiry updates require persistent storage."); return; }
    if (!window.confirm("Delete this enquiry? This cannot be undone.")) return;
    const response = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    if (!response.ok) { setError("Unable to delete the enquiry."); return; }
    setEnquiries((current) => current.filter((item) => item.id !== id)); flash("Enquiry deleted");
  }

  async function uploadMedia(file?: File) {
    if (!file) return;
    if (!storageWritable) { setError("This deployment is read-only. Media uploads require persistent object storage."); return; }
    setUploading(true); setError("");
    const form = new FormData(); form.set("file", file);
    try {
      const response = await fetch("/api/admin/media", { method: "POST", body: form }); const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      const asset = { id: crypto.randomUUID(), url: result.url as string, name: file.name, size: file.size, createdAt: new Date().toISOString() };
      await persist({ ...content, media: [asset, ...content.media] }, "Image uploaded");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Upload failed."); } finally { setUploading(false); }
  }

  async function copyMediaUrl(url: string) {
    try { await navigator.clipboard.writeText(url); flash("Media URL copied"); }
    catch { setError("Clipboard access is unavailable. Select the visible media URL to copy it manually."); }
  }

  async function logout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (response.ok) window.location.assign("/admin/login"); else setError("Unable to sign out. Please try again.");
  }

  const updateList = <K extends "metrics" | "services" | "skills" | "workflow">(key: K, index: number, field: string, value: string) => setContent((current) => ({ ...current, [key]: current[key].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const removeListItem = <K extends "metrics" | "services" | "skills" | "workflow">(key: K, index: number) => setContent((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }));

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link className="admin-brand" href="/"><span className="brand-mark">P</span><span>Pogdog<br /><em>CONTENT OS</em></span></Link>
      <div className="admin-sidebar-scroll">{navGroups.map((group) => <div className="admin-nav-group" key={group.label}><small>{group.label}</small>{group.items.map(([icon, item]) => <button className={active === item ? "is-active" : ""} key={item} onClick={() => { setActive(item); setError(""); }}><span>{icon}</span>{item}{item === "Enquiries" && enquiries.some((enquiry) => enquiry.status === "New") && <i className="nav-count">{enquiries.filter((enquiry) => enquiry.status === "New").length}</i>}</button>)}</div>)}</div>
      <div className="admin-user"><span className="admin-avatar">PD</span><div><strong>Pogdog</strong><small>Administrator</small></div><button onClick={logout} aria-label="Sign out">↪</button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-header"><div><span className="admin-breadcrumb">CONTENT OS / {active.toUpperCase()}</span><h1>{active}</h1></div><div className="admin-header-actions"><a href="/" target="_blank" rel="noreferrer" className="admin-preview">View live site ↗</a><button className="admin-add" disabled={!storageWritable} title={!storageWritable ? "Persistent storage is required" : undefined} onClick={() => editProject(emptyProject(content.projects.length))}>+ New project</button></div></header>
      {!storageWritable && <div className="admin-storage-notice" role="status"><strong>Read-only deployment</strong><span>The public site is online, but Vercel needs an external database and object storage before admin changes can be saved.</span></div>}
      {error && <div className="admin-error" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
      <div className="admin-content">
        {active === "Dashboard" && <>
          <div className="admin-announce"><span className="status-dot" /><div><strong>{content.settings.announcement || "Portfolio content is live"}</strong><p>Dashboard changes update the public portfolio immediately.</p></div><button onClick={() => setActive("Enquiries")}>{enquiries.filter((item) => item.status === "New").length} in review queue ↗</button></div>
          <div className="admin-stats-grid"><Stat value={String(content.projects.length).padStart(2, "0")} label="Total projects" detail="Draft and published records" /><Stat value={String(content.projects.filter((project) => project.status === "Published").length).padStart(2, "0")} label="Published" detail="Visible on the public portfolio" tone="signal" /><Stat value={String(content.media.length).padStart(2, "0")} label="Media assets" detail="Available project covers" /><Stat value={String(enquiries.filter((item) => item.status === "New").length).padStart(2, "0")} label="New enquiries" detail={`${enquiries.length} total submissions`} tone="warm" /></div>
          <div className="admin-dashboard-grid"><section className="admin-panel activity-panel"><div className="panel-heading"><div><span>ACTIVITY / LIVE DATA</span><h2>Recent activity</h2></div><button onClick={() => setActivityDays((days) => days === 7 ? 30 : days === 30 ? 90 : 7)}>Last {activityDays} days⌄</button></div><div className="admin-activity-list">{recentEnquiries.length ? recentEnquiries.slice(0, 6).map((enquiry) => <button key={enquiry.id} onClick={() => setActive("Enquiries")}><span className={`enquiry-state ${enquiry.status.toLowerCase()}`} /><div><strong>{enquiry.name}</strong><small>{enquiry.projectType || "General enquiry"}</small></div><time>{new Date(enquiry.createdAt).toLocaleDateString()}</time></button>) : <div className="admin-empty"><strong>No enquiries in this period</strong><span>New contact submissions will appear here.</span></div>}</div></section><section className="admin-panel quick-panel"><div className="panel-heading"><div><span>QUICK EDIT</span><h2>Site status</h2></div><span className="live-badge"><i /> LIVE</span></div><div className="quick-setting"><span>Availability</span><strong>{content.settings.availability}</strong><button onClick={() => setActive("Site settings")}>Edit</button></div><div className="quick-setting"><span>Announcement</span><strong>{content.settings.announcement || "No current announcement"}</strong><button onClick={() => setActive("Site settings")}>Edit</button></div><div className="quick-setting"><span>SEO</span><strong className="health">Title and description configured</strong><button onClick={() => setActive("Site settings")}>Inspect</button></div></section></div>
        </>}

        {(active === "Projects" || active === "Case studies") && <section className="admin-panel projects-panel"><div className="panel-heading"><div><span>PORTFOLIO / {filtered.length} RECORDS</span><h2>{active === "Projects" ? "Project library" : "Case-study builder"}</h2></div><div className="table-actions"><label className="search-field">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" /></label><select aria-label="Filter projects" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option>All</option><option>Published</option><option>Draft</option>{Array.from(new Set(projects.map((project) => project.category))).map((category) => <option key={category}>{category}</option>)}</select></div></div><div className="admin-table"><div className="admin-table-head"><span>Project</span><span>Category</span><span>Status</span><span>Updated</span><span>Actions</span></div>{filtered.map((project) => <div className="admin-table-row" key={project.id}><div className="admin-project-cell"><span className="project-thumb" style={{ backgroundImage: `url(${project.image})` }} /><div><strong>{project.title}</strong><small>{project.featured ? "Featured · " : ""}{project.caseStudy.intro ? "Case study ready" : "Card only"}</small></div></div><span>{project.category}</span><button className={`status-pill ${project.status.toLowerCase()}`} onClick={() => toggleStatus(project.id)}>{project.status}<i /></button><span>{new Date(project.updatedAt).toLocaleDateString()}</span><div className="row-actions"><button onClick={() => toggleFeatured(project.id)} aria-label={project.featured ? "Remove featured status" : "Make featured"}>{project.featured ? "★" : "☆"}</button><button onClick={() => moveProject(project.id, -1)} aria-label={`Move ${project.title} up`}>↑</button><button onClick={() => moveProject(project.id, 1)} aria-label={`Move ${project.title} down`}>↓</button><button onClick={() => editProject(project, active === "Case studies" ? "Case study" : "Details")} aria-label={`Edit ${project.title}`}>Edit</button><button className="danger-action" onClick={() => removeProject(project)} aria-label={`Delete ${project.title}`}>Delete</button></div></div>)}{filtered.length === 0 && <div className="admin-empty"><strong>No matching projects</strong><span>Clear the search or change the filter.</span></div>}</div><div className="table-footer"><span>Showing {filtered.length} of {projects.length} projects</span><span>Use ↑ ↓ to reorder</span></div></section>}

        {active === "Metrics" && <section className="admin-panel content-editor-panel"><div className="panel-heading"><div><span>PUBLIC CONTENT / TRUST SIGNAL</span><h2>Portfolio metrics</h2></div><button className="admin-add" disabled={saving} onClick={() => void persist(content, "Metrics saved")}>{saving ? "Saving…" : "Save metrics"}</button></div><div className="admin-form-list">{content.metrics.map((metric, index) => <div className="admin-form-row metric-row" key={metric.id}><label><span>Value</span><input value={metric.value} onChange={(event) => updateList("metrics", index, "value", event.target.value)} /></label><label><span>Label</span><input value={metric.label} onChange={(event) => updateList("metrics", index, "label", event.target.value)} /></label><label><span>Supporting note</span><input value={metric.note} onChange={(event) => updateList("metrics", index, "note", event.target.value)} /></label><button className="remove-row" onClick={() => removeListItem("metrics", index)} aria-label={`Remove ${metric.label}`}>×</button></div>)}<button className="add-row" onClick={() => setContent((current) => ({ ...current, metrics: [...current.metrics, { id: crypto.randomUUID(), value: "0", label: "New metric", note: "Add supporting context" }] }))}>+ Add metric</button></div></section>}

        {active === "Services & skills" && <div className="admin-editor-stack"><section className="admin-panel content-editor-panel"><div className="panel-heading"><div><span>PUBLIC CONTENT</span><h2>Services</h2></div><button className="admin-add" disabled={saving} onClick={() => void persist(content, "Services and skills saved")}>{saving ? "Saving…" : "Save all"}</button></div><div className="admin-form-list">{content.services.map((service, index) => <div className="admin-form-row service-row" key={service.id}><label><span>Service</span><input value={service.title} onChange={(event) => updateList("services", index, "title", event.target.value)} /></label><label><span>Description</span><textarea rows={2} value={service.copy} onChange={(event) => updateList("services", index, "copy", event.target.value)} /></label><button className="remove-row" onClick={() => removeListItem("services", index)}>×</button></div>)}<button className="add-row" onClick={() => setContent((current) => ({ ...current, services: [...current.services, { id: crypto.randomUUID(), title: "New service", copy: "Describe the outcome." }] }))}>+ Add service</button></div></section><section className="admin-panel content-editor-panel"><div className="panel-heading"><div><span>PUBLIC CONTENT</span><h2>Skills</h2></div></div><div className="admin-form-list compact-list">{content.skills.map((skill, index) => <div className="admin-form-row skill-row" key={skill.id}><label><span>Skill</span><input value={skill.title} onChange={(event) => updateList("skills", index, "title", event.target.value)} /></label><label><span>Type</span><input value={skill.type} onChange={(event) => updateList("skills", index, "type", event.target.value)} /></label><button className="remove-row" onClick={() => removeListItem("skills", index)}>×</button></div>)}<button className="add-row" onClick={() => setContent((current) => ({ ...current, skills: [...current.skills, { id: crypto.randomUUID(), title: "New skill", type: "Category" }] }))}>+ Add skill</button></div></section></div>}

        {active === "Working principles" && <div className="admin-editor-stack"><section className="admin-panel content-editor-panel"><div className="panel-heading"><div><span>PUBLIC CONTENT / APPROACH</span><h2>Operating principle</h2></div><button className="admin-add" disabled={saving} onClick={() => void persist(content, "Working principles saved")}>{saving ? "Saving…" : "Save principles"}</button></div><div className="settings-grid"><label><span>Headline</span><input value={content.principle.headline} onChange={(event) => setContent((current) => ({ ...current, principle: { ...current.principle, headline: event.target.value } }))} /></label><label><span>Accent line</span><input value={content.principle.accent} onChange={(event) => setContent((current) => ({ ...current, principle: { ...current.principle, accent: event.target.value } }))} /></label><label className="wide-field"><span>Supporting statement</span><textarea rows={3} value={content.principle.body} onChange={(event) => setContent((current) => ({ ...current, principle: { ...current.principle, body: event.target.value } }))} /></label></div></section><section className="admin-panel content-editor-panel"><div className="panel-heading"><div><span>PUBLIC CONTENT</span><h2>Workflow</h2></div></div><div className="admin-form-list compact-list">{content.workflow.map((step, index) => <div className="admin-form-row skill-row" key={step.id}><label><span>Step</span><input value={step.title} onChange={(event) => updateList("workflow", index, "title", event.target.value)} /></label><label><span>Description</span><input value={step.copy} onChange={(event) => updateList("workflow", index, "copy", event.target.value)} /></label><button className="remove-row" onClick={() => removeListItem("workflow", index)}>×</button></div>)}<button className="add-row" onClick={() => setContent((current) => ({ ...current, workflow: [...current.workflow, { id: crypto.randomUUID(), title: "New step", copy: "Describe the step." }] }))}>+ Add workflow step</button></div></section></div>}

        {active === "Media library" && <section className="admin-panel media-panel"><div className="panel-heading"><div><span>ASSET LIBRARY / {content.media.length} FILES</span><h2>Project media</h2></div><label className={`admin-add upload-button ${uploading ? "is-disabled" : ""}`}>{uploading ? "Uploading…" : "+ Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={(event) => { void uploadMedia(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label></div><div className="media-library-grid">{content.media.map((asset) => <article key={asset.id}><div className="media-library-image" style={{ backgroundImage: `url(${asset.url})` }} /><div><strong>{asset.name}</strong><small>{asset.size ? `${Math.ceil(asset.size / 1024)} KB` : "Bundled asset"}</small><code>{asset.url}</code><div><button onClick={() => void copyMediaUrl(asset.url)}>Copy URL</button><button className="danger-action" onClick={() => { if (content.projects.some((project) => project.image === asset.url)) { setError("This image is still used by a project."); return; } void persist({ ...content, media: content.media.filter((item) => item.id !== asset.id) }, "Media record removed"); }}>Remove</button></div></div></article>)}</div></section>}

        {active === "Enquiries" && <section className="admin-panel enquiries-panel"><div className="panel-heading"><div><span>INBOX / {visibleEnquiries.length} RECORDS</span><h2>Project enquiries</h2></div><select aria-label="Filter enquiries" value={enquiryFilter} onChange={(event) => setEnquiryFilter(event.target.value)}><option>All</option><option>New</option><option>Read</option><option>Replied</option><option>Archived</option></select></div><div className="enquiry-list">{visibleEnquiries.map((enquiry) => <article key={enquiry.id}><div className="enquiry-meta"><span className={`enquiry-state ${enquiry.status.toLowerCase()}`} /><div><strong>{enquiry.name}</strong><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a></div><time>{new Date(enquiry.createdAt).toLocaleString()}</time></div><div className="enquiry-body"><span>{enquiry.projectType || "General enquiry"}{enquiry.discord ? ` · Discord: ${enquiry.discord}` : ""}</span><p>{enquiry.description}</p></div><div className="enquiry-actions"><small>Email delivery: {enquiry.deliveryStatus}</small><select value={enquiry.status} onChange={(event) => void updateEnquiry(enquiry.id, event.target.value as EnquiryStatus)}><option>New</option><option>Read</option><option>Replied</option><option>Archived</option></select><a className="admin-preview" href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.projectType || "your project enquiry"}`)}`}>Reply</a><button className="danger-action" onClick={() => void removeEnquiry(enquiry.id)}>Delete</button></div></article>)}{visibleEnquiries.length === 0 && <div className="admin-empty"><strong>No enquiries here</strong><span>New contact-form submissions will be stored in this inbox.</span></div>}</div></section>}

        {active === "Site settings" && <form className="admin-panel content-editor-panel" onSubmit={(event) => { event.preventDefault(); void persist(content, "Site settings saved"); }}><div className="panel-heading"><div><span>GLOBAL CONFIGURATION</span><h2>Site settings</h2></div><button className="admin-add" type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button></div><div className="settings-grid"><label><span>Availability</span><input required value={content.settings.availability} onChange={(event) => setContent((current) => ({ ...current, settings: { ...current.settings, availability: event.target.value } }))} /></label><label><span>Announcement</span><input value={content.settings.announcement} onChange={(event) => setContent((current) => ({ ...current, settings: { ...current.settings, announcement: event.target.value } }))} placeholder="Leave empty to hide" /></label><label><span>Contact email</span><input required type="email" value={content.settings.contactEmail} onChange={(event) => setContent((current) => ({ ...current, settings: { ...current.settings, contactEmail: event.target.value } }))} /></label><label><span>Location</span><input required value={content.settings.location} onChange={(event) => setContent((current) => ({ ...current, settings: { ...current.settings, location: event.target.value } }))} /></label><label><span>Response time</span><input required value={content.settings.responseTime} onChange={(event) => setContent((current) => ({ ...current, settings: { ...current.settings, responseTime: event.target.value } }))} /></label><label><span>SEO title</span><input required maxLength={120} value={content.settings.seoTitle} onChange={(event) => setContent((current) => ({ ...current, settings: { ...current.settings, seoTitle: event.target.value } }))} /></label><label className="wide-field"><span>SEO description</span><textarea required maxLength={300} rows={4} value={content.settings.seoDescription} onChange={(event) => setContent((current) => ({ ...current, settings: { ...current.settings, seoDescription: event.target.value } }))} /></label></div></form>}
      </div>
      <footer className="admin-footer"><span>POGDOG / CONTENT DATABASE</span><span>{saving ? "Saving changes…" : "All saved changes are live"} <i /></span><Link href="/">Exit admin ↗</Link></footer>
    </main>
    {toast && <div className="admin-toast" role="status"><span className="status-dot" />{toast}</div>}
    {editingProject && <ProjectEditor project={editingProject} media={content.media} initialTab={editorTab} onClose={() => setEditingProject(null)} onSave={(project) => void saveProject(project)} />}
  </div>;
}
