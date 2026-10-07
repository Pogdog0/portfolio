"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PortfolioProject, SiteContent } from "@/lib/content";

type Project = PortfolioProject;

const skillBadges = [
  { index: "01", title: "DataStore Systems", copy: "Throttling + persistence", accent: "#70d6ff" },
  { index: "02", title: "Custom Physics", copy: "Mechanics that feel right", accent: "#9fd4ff" },
  { index: "03", title: "Network Ownership", copy: "Replication under control", accent: "#7ed5e8" },
  { index: "04", title: "Optimization", copy: "Less work per frame", accent: "#b09af5" },
  { index: "05", title: "Stable Builds", copy: "Bug fixes that hold", accent: "#55a8ff" },
];

const bugs = [
  { id: "01", title: "Vehicle instability", type: "VEHICLE SYSTEMS", result: "Stable handling and spawning", icon: "⌁" },
  { id: "02", title: "Controller UI navigation", type: "UI ENGINEERING", result: "Predictable focus on every screen", icon: "↗" },
  { id: "03", title: "State and persistence bugs", type: "DATA SYSTEMS", result: "Reliable saves without silent loss", icon: "◌" },
  { id: "04", title: "Performance bottlenecks", type: "OPTIMIZATION", result: "Less work per frame", icon: "△" },
];

const testimonials = [
  { quote: "Pogdog stepped into a system they did not build, understood it quickly, and made a fix that felt obvious in hindsight.", name: "Studio lead", role: "Production partner", project: "Roblox systems", initials: "SL" },
  { quote: "Clear questions, careful changes, and a strong sense of what should stay untouched.", name: "Technical producer", role: "Roblox studio", project: "Live maintenance", initials: "TP" },
];

function Arrow() {
  return <span aria-hidden="true" className="arrow-mark">↗</span>;
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return <div className="section-label"><span className="section-number">{index}</span><span>{children}</span><span className="section-rule" /></div>;
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (project: Project) => void }) {
  return <article className="project-card" style={{ "--project-accent": project.accent } as React.CSSProperties}>
    <button className="project-image" onClick={() => onOpen(project)} aria-label={`Open ${project.title} case study`} style={{ backgroundImage: `linear-gradient(180deg, rgba(8, 10, 10, .04), rgba(8, 10, 10, .9)), url(${project.image})` }}>
      <span className="project-image-glow" /><span className="project-card-index">{project.eyebrow}</span><span className="project-open"><Arrow /></span>
      <span className="project-card-overlay"><span className="project-card-kicker">{project.category}</span><strong>{project.title}</strong></span>
    </button>
    <div className="project-card-body"><p>{project.description}</p><div className="tag-row">{project.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div>{project.videoUrl && <a className="project-video-link" href={project.videoUrl} target="_blank" rel="noreferrer">Watch previous reel <Arrow /></a>}</div>
  </article>;
}

function ContactForm({ responseTime }: { responseTime: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Unable to send your message right now.");
      form.reset();
      setStatus("sent");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send your message right now.");
      setStatus("error");
    }
  }
  return <form className="contact-form" onSubmit={submit}>
    <input className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" name="company" />
    <div className="form-grid"><label><span>Your name</span><input required maxLength={120} name="name" placeholder="Jane / Studio" /></label><label><span>Email</span><input required maxLength={254} type="email" name="email" placeholder="hello@studio.com" /></label><label><span>Discord username</span><input maxLength={100} name="discord" placeholder="fresh69" /></label><label><span>Project type</span><select name="projectType" defaultValue=""><option value="">Select one</option><option>Production debugging</option><option>Gameplay systems</option><option>Vehicle systems</option><option>UI / controller navigation</option><option>Performance optimization</option></select></label></div>
    <label><span>What needs solving?</span><textarea required maxLength={5000} name="description" rows={4} placeholder="System, issue, and what a good outcome looks like." /></label>
    <div className="form-footer"><p className="form-note">{responseTime}.</p><button className="button button-solid" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : status === "sent" ? "Enquiry received" : "Start a conversation"}<Arrow /></button></div>
    {status === "sent" && <p className="form-success" role="status">Thanks, your enquiry is in the dashboard. {responseTime}.</p>}
    {status === "error" && <p className="form-error" role="alert">{error}</p>}
  </form>;
}

export default function Portfolio({ content }: { content: SiteContent }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All work");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const projects = useMemo(() => content.projects.filter((project) => project.status === "Published").sort((a, b) => a.order - b.order), [content.projects]);
  const filters = useMemo(() => ["All work", ...Array.from(new Set(projects.map((project) => project.category)))], [projects]);
  const featured = projects.find((project) => project.featured) || projects[0];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = () => setReducedMotion(query.matches);
    query.addEventListener?.("change", listener);
    const timer = window.setInterval(() => setProgress((current) => {
      const next = Math.min(100, current + 17);
      if (next === 100) window.clearInterval(timer);
      return next;
    }), reducedMotion ? 1 : 115);
    const close = window.setTimeout(() => setLoading(false), reducedMotion ? 120 : 900);
    return () => { window.clearInterval(timer); window.clearTimeout(close); query.removeEventListener?.("change", listener); };
  }, [reducedMotion]);

  const visibleProjects = useMemo(() => activeFilter === "All work" ? projects : projects.filter((project) => project.category === activeFilter), [activeFilter, projects]);

  function trackPointer(event: React.PointerEvent<HTMLElement>) {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
  }

  return <main className="site-shell" onPointerMove={trackPointer}>
    <div className={`loading-screen ${loading ? "is-visible" : "is-hidden"}`} aria-hidden={!loading}><div className="loading-top"><span>P / SYSTEMS ENGINEER</span><span>PORTFOLIO 2025—26</span></div><div className="loading-center"><div className="monogram">P</div><p>Loading the work that ships.</p></div><div className="loading-bottom"><span>INITIALIZING EXPERIENCE</span><div className="loading-progress"><span style={{ width: `${progress}%` }} /></div><span>{String(progress).padStart(3, "0")}%</span></div></div>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="noise" />
    <header className="top-nav"><a className="brand" href="#top" aria-label="Pogdog home"><span className="brand-mark">P</span><span>Pogdog / <em>ROBLOX SYSTEMS</em></span></a><nav className="desktop-nav" aria-label="Primary navigation"><a href="#work">Selected work</a><a href="#approach">Approach</a><a href="#contact">Contact</a></nav><a className="nav-cta" href="#contact">{content.settings.availability} <span className="status-dot" /></a></header>
    {content.settings.announcement && <div className="site-announcement" role="status">{content.settings.announcement}</div>}
    <div className="side-rail side-rail-left"><span>Pogdog / LUAU / SYSTEMS</span><span className="rail-line" /><span>IST / UTC+05:30</span></div><div className="side-rail side-rail-right"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /><span>01—07</span></div>

    <section className="hero-section" id="top"><div className="hero-grid" /><div className="hero-copy"><p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> Pogdog · {content.settings.availability.toLowerCase()}</p><p className="hero-name">Pogdog</p><h1><span className="hero-outline">Roblox</span><br />Gameplay<br /><span className="hero-accent">Systems Engineer</span></h1><p className="hero-description">I debug live games, understand messy codebases, and ship reliable fixes without rewriting what already works.</p><div className="hero-actions"><a className="button button-solid" href="#work">View selected work <Arrow /></a><a className="button button-quiet" href="#contact">Hire me <span className="button-line" /></a></div><div className="hero-proof"><span>Specializing in</span><div className="proof-items"><span>Production debugging</span><span>Vehicles & A-Chassis</span><span>Client-server systems</span></div></div></div><div className="hero-media" aria-label="Pogdog introduction card"><div className="media-frame"><div className="media-image" role="img" aria-label="Illustrated Roblox development scene" /><div className="media-overlay" /><div className="media-topline"><span className="media-coordinates">POGDOG / PROFILE 01<br />ROBLOX SYSTEMS</span><span className="media-status"><i /> {content.settings.availability.toUpperCase()}</span></div><div className="media-caption"><div className="media-profile"><Image src="/images/profile/pogdog.png" alt="" width={56} height={56} /><div><strong>Pogdog</strong><small>Gameplay systems engineer</small></div></div><span className="media-focus">Luau · systems · live games</span></div></div><div className="hero-float hero-float-top"><span className="float-symbol">+</span><span>Root cause<br /><b>over rewrite</b></span></div></div><div className="hero-bottom-mark"><span>SCROLL</span><span className="scroll-arrow">↓</span></div></section>

    <section className="metrics-section" aria-label="Selected metrics"><div className="metrics-intro"><span className="kicker">TRUST / SIGNAL</span><p>Useful context, not a wall of claims.</p></div>{content.metrics.map((metric) => <div className="metric" key={metric.id}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.note}</small></div>)}</section>

    <section className="skill-board" aria-label="Core systems"><div className="skill-board-heading"><span className="kicker">CORE SYSTEMS</span><span>Five things I ship with confidence.</span></div>{skillBadges.map((badge) => <div className="skill-badge" key={badge.title} tabIndex={0} style={{ "--badge-accent": badge.accent } as React.CSSProperties}><span className="skill-badge-index">{badge.index}</span><span className="skill-badge-orbit" /><strong>{badge.title}</strong><small>{badge.copy}</small><span className="skill-badge-glint" /></div>)}</section>

    <section className="statement-section section-pad"><SectionLabel index="01">The operating principle</SectionLabel><div className="statement-wrap"><p className="statement-large">{content.principle.headline}<br /><em>{content.principle.accent}</em></p><p className="statement-aside">{content.principle.body}</p></div></section>

    <section className="work-section section-pad" id="work"><SectionLabel index="02">Selected work</SectionLabel><div className="work-intro"><div><h2>Small demos.<br /><span>Real systems.</span></h2></div><p>Previous work, organised by the system each project demonstrates.</p></div><div className="filter-row" role="tablist" aria-label="Project categories">{filters.map((filter) => <button key={filter} role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? "is-active" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><div className="project-grid">{visibleProjects.map((project) => <ProjectCard key={project.slug} project={project} onOpen={setSelectedProject} />)}</div>{featured && <div className="production-note"><span className="kicker">FEATURED / {featured.title.toUpperCase()}</span><p>{featured.result || featured.description}</p>{featured.caseStudy.intro && <Link href={`/work/${featured.slug}`}>View the case study <Arrow /></Link>}</div>}</section>

    <section className="problems-section section-pad" id="approach"><SectionLabel index="03">Problems I solve</SectionLabel><div className="problems-header"><h2>When the system<br /><span>stops making sense.</span></h2><p>Find the failure. Fix the cause. Leave the system clearer.</p></div><div className="problems-list">{bugs.map((bug) => <article className="problem-row" key={bug.id}><span className="problem-id">{bug.id}</span><span className="problem-icon">{bug.icon}</span><div><small>{bug.type}</small><h3>{bug.title}</h3></div><span className="problem-result">{bug.result}</span><span className="problem-arrow">↗</span></article>)}</div></section>

    <section className="services-section section-pad"><SectionLabel index="04">How I can help</SectionLabel><div className="services-intro"><h2>Built for the<br /><span>messy middle.</span></h2><p>Reliable progress for Roblox teams working through live systems.</p></div><div className="services-grid">{content.services.map((service, index) => <article className="service-card" key={service.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{service.title}</h3><p>{service.copy}</p><Arrow /></article>)}</div></section>

    <section className="skills-section section-pad"><SectionLabel index="05">The toolkit</SectionLabel><div className="skills-layout"><div><h2>A practical<br /><span>stack.</span></h2><p>Luau-first. Production-minded.</p></div><div className="skills-cloud">{content.skills.map((skill, index) => <div className="skill-pill" key={skill.id} style={{ "--skill-index": index } as React.CSSProperties}><span>{skill.title}</span><small>{skill.type}</small></div>)}</div></div></section>

    <section className="workflow-section section-pad"><SectionLabel index="06">The working rhythm</SectionLabel><div className="workflow-heading"><h2>Targeted fixes.<br /><span>Durable systems.</span></h2><p>Understand first. Change carefully. Test the edge cases. Leave the next developer a clearer path.</p></div><div className="workflow-line">{content.workflow.map((step, index) => <div className="workflow-step" key={step.id}><span className="workflow-dot">0{index + 1}</span><strong>{step.title}</strong><p>{step.copy}</p></div>)}</div></section>

    <section className="testimonials-section section-pad"><SectionLabel index="07">Good work leaves a trail</SectionLabel><div className="testimonials-layout"><div><h2>Built to be<br /><span>trusted.</span></h2><p className="section-copy">Clear questions, careful changes, and systems that are easier to continue.</p></div><div className="testimonial-stage"><article className="testimonial-card"><div className="testimonial-quote">“</div><p>{testimonials[testimonialIndex].quote}</p><div className="testimonial-person"><span className="testimonial-avatar">{testimonials[testimonialIndex].initials}</span><div><strong>{testimonials[testimonialIndex].name}</strong><small>{testimonials[testimonialIndex].role} · {testimonials[testimonialIndex].project}</small></div></div></article><div className="testimonial-controls"><span>0{testimonialIndex + 1} / 0{testimonials.length}</span><div><button onClick={() => setTestimonialIndex((current) => (current - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial">←</button><button onClick={() => setTestimonialIndex((current) => (current + 1) % testimonials.length)} aria-label="Next testimonial">→</button></div></div></div></div></section>

    <section className="contact-section section-pad" id="contact"><div className="contact-copy"><SectionLabel index="08">Contact</SectionLabel><h2>Have a Roblox project<br /><span>worth building?</span></h2><p>For project enquiries, share what broke, what you tried, and what a good outcome looks like.</p><div className="contact-details"><a href={`mailto:${content.settings.contactEmail}`}>{content.settings.contactEmail} <Arrow /></a><span>{content.settings.location.toUpperCase()}</span><span>{content.settings.availability} · {content.settings.responseTime}</span></div></div><ContactForm responseTime={content.settings.responseTime} /></section>

    <footer className="site-footer"><div className="footer-brand"><span className="brand-mark">P</span><span>Pogdog / ROBLOX SYSTEMS</span></div><p>Production debugging · gameplay systems · live-game maintenance</p><div><a href="#top">Back to top ↑</a><span>© 2026</span></div></footer>

    {selectedProject && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedProject(null)}><article className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedProject(null)} aria-label="Close case study">×</button><div className="modal-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,10,10,.12), rgba(8,10,10,.85)), url(${selectedProject.image})` }}><span>{selectedProject.eyebrow}</span><strong>{selectedProject.title}</strong></div><div className="modal-content"><p className="kicker">{selectedProject.category}{selectedProject.period ? ` / ${selectedProject.period}` : ""}</p><h2 id="project-modal-title">{selectedProject.title}</h2><p>{selectedProject.description}</p><div className="modal-facts">{selectedProject.role && <div><span>Role</span><strong>{selectedProject.role}</strong></div>}<div><span>Result</span><strong>{selectedProject.result}</strong></div></div><div className="tag-row">{selectedProject.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>{selectedProject.videoUrl && <a className="button button-quiet" href={selectedProject.videoUrl} target="_blank" rel="noreferrer">Watch reel <Arrow /></a>}{selectedProject.caseStudy.intro && <Link className="button button-solid" href={`/work/${selectedProject.slug}`}>Open case note <Arrow /></Link>}</div></article></div>}
  </main>;
}
