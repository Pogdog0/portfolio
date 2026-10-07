"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type AdminProject = {
  id: number;
  title: string;
  category: string;
  status: "Published" | "Draft";
  featured: boolean;
  updated: string;
  media: number;
};

const initialProjects: AdminProject[] = [
  { id: 1, title: "West Indies", category: "Production Work", status: "Published", featured: true, updated: "Current preview", media: 1 },
  { id: 2, title: "Tower Defense", category: "Gameplay Systems", status: "Published", featured: false, updated: "Current preview", media: 1 },
  { id: 3, title: "PvP", category: "Gameplay Systems", status: "Published", featured: false, updated: "Current preview", media: 1 },
  { id: 4, title: "Tycoon", category: "Gameplay Systems", status: "Published", featured: false, updated: "Current preview", media: 1 },
  { id: 5, title: "Car Kits", category: "Vehicle Systems", status: "Published", featured: false, updated: "Current preview", media: 1 },
  { id: 6, title: "Coin Collection", category: "Personal Projects", status: "Published", featured: false, updated: "Current preview", media: 1 },
];

const navGroups = [
  { label: "Overview", items: [["◈", "Dashboard"], ["▣", "Projects"], ["◫", "Case studies"]] },
  { label: "Content", items: [["◇", "Metrics"], ["✦", "Services & skills"], ["◌", "Working principles"], ["▧", "Media library"]] },
  { label: "Operations", items: [["↗", "Enquiries"], ["◎", "Site settings"]] },
];

function Stat({ value, label, detail, tone = "default" }: { value: string; label: string; detail: string; tone?: string }) {
  return <div className={`admin-stat ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  const filtered = useMemo(() => projects.filter((project) => project.title.toLowerCase().includes(query.toLowerCase())), [projects, query]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function toggleStatus(id: number) {
    setProjects((current) => current.map((project) => project.id === id ? { ...project, status: project.status === "Published" ? "Draft" : "Published", updated: "Just now" } : project));
    flash("Publishing state updated");
  }

  function toggleFeatured(id: number) {
    setProjects((current) => current.map((project) => project.id === id ? { ...project, featured: !project.featured } : project));
    flash("Featured state updated");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link className="admin-brand" href="/"><span className="brand-mark">P</span><span>Pogdog<br /><em>CONTENT OS</em></span></Link>
      <div className="admin-sidebar-scroll">{navGroups.map((group) => <div className="admin-nav-group" key={group.label}><small>{group.label}</small>{group.items.map(([icon, item]) => <button className={active === item ? "is-active" : ""} key={item} onClick={() => setActive(item)}><span>{icon}</span>{item}</button>)}</div>)}</div>
      <div className="admin-user"><span className="admin-avatar">PD</span><div><strong>Pogdog</strong><small>Administrator</small></div><button onClick={logout} aria-label="Sign out">↪</button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-header"><div><span className="admin-breadcrumb">CONTENT OS / {active.toUpperCase()}</span><h1>{active}</h1></div><div className="admin-header-actions"><a href="/" target="_blank" rel="noreferrer" className="admin-preview">View live site ↗</a><button className="admin-add" onClick={() => setShowEditor(true)}>+ New project</button></div></header>
      <div className="admin-content">
        {active === "Dashboard" && <>
          <div className="admin-announce"><span className="status-dot" /><div><strong>Portfolio content preview</strong><p>Sample activity only · the contact form is not connected</p></div><button onClick={() => flash("Review queue opened")}>Review queue ↗</button></div>
          <div className="admin-stats-grid"><Stat value="06" label="Total projects" detail="Projects shown on the portfolio" /><Stat value="06" label="Published" detail="All six project cards" tone="signal" /><Stat value="06" label="Project images" detail="One cover per project" /><Stat value="00" label="Enquiries" detail="Contact form is a demo" tone="warm" /></div>
          <div className="admin-dashboard-grid"><section className="admin-panel activity-panel"><div className="panel-heading"><div><span>ACTIVITY / SAMPLE VIEW</span><h2>Activity preview</h2></div><button onClick={() => flash("Activity range switched")}>Last 30 days⌄</button></div><div className="pulse-chart"><div className="chart-y"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div><div className="chart-area"><div className="chart-grid-lines" /><svg viewBox="0 0 620 190" preserveAspectRatio="none" aria-label="Sample activity illustration — not live analytics" role="img"><defs><linearGradient id="pulse" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#55a8ff" stopOpacity=".4" /><stop offset="1" stopColor="#55a8ff" stopOpacity="0" /></linearGradient></defs><path d="M0 163 C30 158, 32 128, 67 135 S107 104, 134 118 S168 76, 195 95 S234 113, 264 86 S304 96, 330 68 S363 83, 389 54 S425 77, 451 48 S493 41, 520 29 S572 41, 620 10 L620 190 L0 190 Z" fill="url(#pulse)" /><path d="M0 163 C30 158, 32 128, 67 135 S107 104, 134 118 S168 76, 195 95 S234 113, 264 86 S304 96, 330 68 S363 83, 389 54 S425 77, 451 48 S493 41, 520 29 S572 41, 620 10" fill="none" stroke="#55a8ff" strokeWidth="2" /></svg><div className="chart-x"><span>03 JUN</span><span>10 JUN</span><span>17 JUN</span><span>24 JUN</span><span>01 JUL</span></div></div></div></section><section className="admin-panel quick-panel"><div className="panel-heading"><div><span>QUICK EDIT</span><h2>Site status</h2></div><span className="live-badge"><i /> PREVIEW</span></div><div className="quick-setting"><span>Availability</span><strong>Available for select production work</strong><button onClick={() => flash("Availability editor opened")}>Edit</button></div><div className="quick-setting"><span>Announcement</span><strong>No current announcement</strong><button onClick={() => flash("Announcement editor opened")}>Edit</button></div><div className="quick-setting"><span>SEO health</span><strong className="health">Set the production domain before launch</strong><button onClick={() => flash("SEO inspector opened")}>Inspect</button></div></section></div>
        </>}

        {(active === "Projects" || active === "Case studies") && <section className="admin-panel projects-panel"><div className="panel-heading"><div><span>PORTFOLIO / {filtered.length} RECORDS</span><h2>{active === "Projects" ? "Project library" : "Case-study builder"}</h2></div><div className="table-actions"><label className="search-field">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" /></label><button onClick={() => flash("Filter menu opened")}>Filter⌄</button></div></div><div className="admin-table"><div className="admin-table-head"><span>Project</span><span>Category</span><span>Status</span><span>Updated</span><span>Actions</span></div>{filtered.map((project) => <div className="admin-table-row" key={project.id}><div className="admin-project-cell"><span className={`project-thumb thumb-${project.id}`} /><div><strong>{project.title}</strong><small>{project.featured ? "Featured · " : ""}{project.media} media assets</small></div></div><span>{project.category}</span><button className={`status-pill ${project.status.toLowerCase()}`} onClick={() => toggleStatus(project.id)}>{project.status}<i /></button><span>{project.updated}</span><div className="row-actions"><button onClick={() => toggleFeatured(project.id)} aria-label="Toggle featured">{project.featured ? "★" : "☆"}</button><button onClick={() => { setShowEditor(true); flash(`Editing ${project.title}`); }} aria-label={`Edit ${project.title}`}>Edit</button><button onClick={() => flash("More actions opened")} aria-label="More actions">•••</button></div></div>)}</div><div className="table-footer"><span>Showing {filtered.length} of {projects.length} projects</span><span>Drag rows to reorder <span className="drag-icon">⠿</span></span></div></section>}

        {(active !== "Dashboard" && active !== "Projects" && active !== "Case studies") && <section className="admin-panel placeholder-panel"><span className="placeholder-icon">{active === "Media library" ? "▧" : "◇"}</span><h2>{active} is ready for content</h2><p>This is an admin layout preview. Changes are temporary and are not saved.</p><button className="admin-add" onClick={() => setShowEditor(true)}>Open editor</button></section>}
      </div>
      <footer className="admin-footer"><span>POGDOG / LOCAL CONTENT PREVIEW</span><span>Portfolio preview available <i /></span><Link href="/">Exit admin ↗</Link></footer>
    </main>
    {toast && <div className="admin-toast"><span className="status-dot" />{toast}</div>}
    {showEditor && <div className="admin-editor-backdrop" onClick={() => setShowEditor(false)}><section className="admin-editor" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><div className="editor-heading"><div><span>PROJECT / PREVIEW RECORD</span><h2>Shape the story.</h2></div><button onClick={() => setShowEditor(false)} aria-label="Close editor">×</button></div><div className="editor-tabs"><button className="is-active">Details</button><button>Media</button><button>Case study</button><button>SEO</button></div><label><span>Project title</span><input defaultValue="West Indies DataStore recovery" /></label><div className="editor-two"><label><span>Category</span><select defaultValue="Production Work"><option>Production Work</option><option>Gameplay Systems</option><option>Debugging</option><option>Vehicle Systems</option></select></label><label><span>Visibility</span><select defaultValue="Draft"><option>Draft</option><option>Published</option></select></label></div><label><span>Project summary</span><textarea rows={4} defaultValue="Describe the problem, the team contribution, and what changed." /></label><div className="editor-footer"><button className="admin-preview" onClick={() => setShowEditor(false)}>Save draft</button><button className="admin-add" onClick={() => { setShowEditor(false); flash("Project saved as draft"); }}>Save & close</button></div></section></div>}
  </div>;
}
