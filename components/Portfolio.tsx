"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Project = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  role: string;
  period: string;
  result: string;
  accent: string;
  videoUrl?: string;
};

// Replace this with PogDog's real Discord profile URL before publishing.
const discordUrl = "#contact";

const projects: Project[] = [
  {
    slug: "tower-defense",
    title: "Project One",
    eyebrow: "Gameplay systems / 01",
    description: "Replace this with a concise description of PogDog's first project.",
      image: "/images/projects/tower-defense.webp",
    category: "Gameplay Systems",
    tags: ["Luau", "Progression", "Systems"],
    role: "Add role",
    period: "Add period",
    result: "Add a measurable or clearly described result",
    accent: "#55a8ff",
  },
  {
    slug: "pvp",
    title: "Project Two",
    eyebrow: "Combat systems / 02",
    description: "Replace this with the problem solved, the work completed, and the outcome.",
      image: "/images/projects/pvp.webp",
    category: "Gameplay Systems",
    tags: ["Combat", "State", "Client-server"],
    role: "Add role",
    period: "Add period",
    result: "Add result",
    accent: "#9fd4ff",
  },
  {
    slug: "tycoon",
    title: "Project Three",
    eyebrow: "Progression / 03",
    description: "Add a short project summary. Keep it specific and easy to verify.",
      image: "/images/projects/tycoon.webp",
    category: "Gameplay Systems",
    tags: ["Tycoon", "UI", "DataStores"],
    role: "Add role",
    period: "Add period",
    result: "Add result",
    accent: "#d9ecff",
  },
  {
    slug: "car-kits",
    title: "Project Four",
    eyebrow: "Vehicle systems / 04",
    description: "Use this card for a vehicle, systems, UI, or other specialist project.",
      image: "/images/projects/car-kits.webp",
    category: "Vehicle Systems",
    tags: ["Vehicles", "Tuning", "A-Chassis"],
    role: "Add role",
    period: "Add period",
    result: "Add result",
    accent: "#73c7ff",
  },
  {
    slug: "coin-collection",
    title: "Project Five",
    eyebrow: "Interaction loop / 05",
    description: "Use this card for a smaller experiment, prototype, or personal project.",
      image: "/images/projects/coin-collection.webp",
    category: "Personal Projects",
    tags: ["Interaction", "Feedback", "Persistence"],
    role: "Add role",
    period: "Add period",
    result: "Add result",
    accent: "#b09af5",
  },
  {
    slug: "featured-project",
    title: "Featured Project",
    eyebrow: "Featured case study / 06",
    description: "Replace this with PogDog's strongest case study and a truthful one-line outcome.",
      image: "/images/projects/west-indies.webp",
    category: "Production Work",
    tags: ["Primary skill", "Contribution", "Outcome"],
    role: "Add role",
    period: "Add period",
    result: "Add a verified result",
    accent: "#70d6ff",
  },
];

const filters = ["All work", "Gameplay Systems", "Production Work", "Vehicle Systems", "Personal Projects"];

const metrics = [
  { value: "00+", label: "Years in Roblox Studio", note: "Replace with an accurate number" },
  { value: "00", label: "Projects shipped", note: "Replace with a verified count" },
  { value: "00", label: "Peak players / result", note: "Replace or remove" },
  { value: "∞", label: "Room to keep learning", note: "Personalize this signal" },
];

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

const services = [
  { number: "01", title: "Production bug fixing", copy: "Race conditions, state problems, UI conflicts, and failures in live games." },
  { number: "02", title: "Existing codebase work", copy: "Understand what is there, preserve what works, and change only what needs changing." },
  { number: "03", title: "Gameplay systems", copy: "Shops, inventories, progression, minigames, and custom mechanics." },
  { number: "04", title: "Vehicle development", copy: "A-Chassis, tuning, customization, spawning, and controller support." },
  { number: "05", title: "Performance optimization", copy: "Profile scripts, reduce expensive loops, and improve replication." },
  { number: "06", title: "UI engineering", copy: "Responsive Roblox UI, gamepad navigation, and production-ready interaction." },
];

const skills = [
  ["Luau", "Daily driver"],
  ["Roblox Studio", "Production"],
  ["Client-server architecture", "Systems"],
  ["DataStores / ProfileStore", "Persistence"],
  ["RemoteEvents / Functions", "Networking"],
  ["Gamepad navigation", "UI"],
  ["A-Chassis / vehicle tuning", "Vehicles"],
  ["Performance profiling", "Optimization"],
  ["Rojo / Git / GitHub", "Workflow"],
];

const workflow = [
  ["Understand", "Map the system."],
  ["Reproduce", "Make the issue repeatable."],
  ["Locate", "Trace the root cause."],
  ["Plan", "Choose the safest change."],
  ["Ship", "Test, document, deliver."],
];

const testimonials = [
  { quote: "Replace this with a real client testimonial. Never publish an invented endorsement.", name: "Client name", role: "Role or studio", project: "Project", initials: "CN" },
  { quote: "Add a second verified testimonial here, or remove this item until one is available.", name: "Client name", role: "Role or studio", project: "Project", initials: "CN" },
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

function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  return <form className="contact-form" onSubmit={submit}>
    <input className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" name="company" />
    <div className="form-grid"><label><span>Your name</span><input required name="name" placeholder="Jane / Studio" /></label><label><span>Email</span><input required type="email" name="email" placeholder="hello@studio.com" /></label><label><span>Discord username</span><input name="discord" placeholder="your_discord" /></label><label><span>Project type</span><select name="projectType" defaultValue=""><option value="" disabled>Select one</option><option>Production debugging</option><option>Gameplay systems</option><option>Vehicle systems</option><option>UI / controller navigation</option><option>Performance optimization</option></select></label></div>
    <label><span>What needs solving?</span><textarea required name="description" rows={4} placeholder="System, issue, and what a good outcome looks like." /></label>
    <div className="form-footer"><p className="form-note">Usually replies within 1–2 business days.<br />IST / UTC+05:30 · Remote.</p><button className="button button-solid" type="submit">{sent ? "Message queued" : "Start a conversation"}<Arrow /></button></div>
    {sent && <p className="form-success" role="status">Thanks — your brief is captured in this demo.</p>}
  </form>;
}

export default function Portfolio() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All work");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = () => setReducedMotion(query.matches);
    query.addEventListener?.("change", listener);
    const timer = window.setInterval(() => setProgress((current) => Math.min(100, current + 17)), reducedMotion ? 1 : 115);
    const close = window.setTimeout(() => setLoading(false), reducedMotion ? 120 : 900);
    return () => { window.clearInterval(timer); window.clearTimeout(close); query.removeEventListener?.("change", listener); };
  }, [reducedMotion]);

  const visibleProjects = useMemo(() => activeFilter === "All work" ? projects : projects.filter((project) => project.category === activeFilter), [activeFilter]);

  function trackPointer(event: React.PointerEvent<HTMLElement>) {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
  }

  return <main className="site-shell" onPointerMove={trackPointer}>
    <div className={`loading-screen ${loading ? "is-visible" : "is-hidden"}`} aria-hidden={!loading}><div className="loading-top"><span>P / ROBLOX DEVELOPER</span><span>PORTFOLIO TEMPLATE</span></div><div className="loading-center"><div className="monogram">P</div><p>Loading PogDog's work.</p></div><div className="loading-bottom"><span>INITIALIZING EXPERIENCE</span><div className="loading-progress"><span style={{ width: `${progress}%` }} /></div><span>{String(progress).padStart(3, "0")}%</span></div></div>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="noise" />
    <header className="top-nav"><a className="brand" href="#top" aria-label="PogDog home"><span className="brand-mark">P</span><span>POGDOG / <em>ROBLOX DEVELOPER</em></span></a><nav className="desktop-nav" aria-label="Primary navigation"><a href="#work">Selected work</a><a href="#approach">Approach</a><a href="#contact">Contact</a></nav><a className="nav-cta" href="#contact">Available for select work <span className="status-dot" /></a></header>
    <div className="side-rail side-rail-left"><span>POGDOG / LUAU / SYSTEMS</span><span className="rail-line" /><span>ADD TIMEZONE</span></div><div className="side-rail side-rail-right"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /><span>01—07</span></div>

    <section className="hero-section" id="top"><div className="hero-grid" /><div className="hero-copy"><p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> PogDog · available for Roblox work</p><p className="hero-name">PogDog</p><h1><span className="hero-outline">Roblox</span><br />Development<br /><span className="hero-accent">Portfolio</span></h1><p className="hero-description">Replace this sentence with PogDog's specialty, the kinds of projects he enjoys, and the value he brings to a team.</p><div className="hero-actions"><a className="button button-solid" href="#work">View selected work <Arrow /></a><a className="button button-quiet" href="#contact">Contact me <span className="button-line" /></a></div><div className="hero-proof"><span>Specializing in</span><div className="proof-items"><span>Add specialty one</span><span>Add specialty two</span><span>Add specialty three</span></div></div></div><div className="hero-media" aria-label="PogDog profile picture"><div className="media-frame"><div className="media-image" /><div className="media-overlay" /><div className="media-scan" /><span className="media-coordinates">POGDOG / PROFILE<br />ROBLOX DEVELOPER</span><span className="media-time">READY <i>/</i> BUILD</span><div className="media-center"><span className="play-ring">P</span><small>PROFILE</small></div><div className="media-caption"><span>PogDog / selected work</span><span>Replace with specialties</span></div></div><div className="hero-float hero-float-top"><span className="float-symbol">+</span><span>Add a short<br /><b>working principle</b></span></div><div className="hero-float hero-float-bottom"><span className="float-number">00+</span><span>Years on Roblox<br /><b>replace this</b></span></div></div><div className="hero-bottom-mark"><span>SCROLL</span><span className="scroll-arrow">↓</span></div></section>

    <section className="metrics-section" aria-label="Selected metrics"><div className="metrics-intro"><span className="kicker">TRUST / SIGNAL</span><p>Useful context, not a wall of claims.</p></div>{metrics.map((metric) => <div className="metric" key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.note}</small></div>)}</section>

    <section className="skill-board" aria-label="Core systems"><div className="skill-board-heading"><span className="kicker">CORE SYSTEMS</span><span>Five things I ship with confidence.</span></div>{skillBadges.map((badge) => <div className="skill-badge" key={badge.title} tabIndex={0} style={{ "--badge-accent": badge.accent } as React.CSSProperties}><span className="skill-badge-index">{badge.index}</span><span className="skill-badge-orbit" /><strong>{badge.title}</strong><small>{badge.copy}</small><span className="skill-badge-glint" /></div>)}</section>

    <section className="statement-section section-pad"><SectionLabel index="01">The operating principle</SectionLabel><div className="statement-wrap"><p className="statement-large">Fix the real problem.<br /><em>Keep what works.</em></p><p className="statement-aside">I enter existing projects, find the root cause, and ship the smallest fix that holds.</p></div></section>

    <section className="work-section section-pad" id="work"><SectionLabel index="02">Selected work</SectionLabel><div className="work-intro"><div><h2>Projects with<br /><span>clear outcomes.</span></h2></div><p>Replace these six examples with PogDog's real projects, screenshots, credits, links, and results.</p></div><div className="filter-row" role="tablist" aria-label="Project categories">{filters.map((filter) => <button key={filter} role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? "is-active" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><div className="project-grid">{visibleProjects.map((project) => <ProjectCard key={project.slug} project={project} onOpen={setSelectedProject} />)}</div><div className="production-note"><span className="kicker">FEATURED CASE-STUDY TEMPLATE</span><p>Replace this with the strongest verified project outcome, PogDog's exact contribution, and any collaborators who should be credited.</p><Link href="/work/featured-project">Open the case-study template <Arrow /></Link></div></section>

    <section className="problems-section section-pad" id="approach"><SectionLabel index="03">Problems I solve</SectionLabel><div className="problems-header"><h2>When the system<br /><span>stops making sense.</span></h2><p>Find the failure. Fix the cause. Leave the system clearer.</p></div><div className="problems-list">{bugs.map((bug) => <article className="problem-row" key={bug.id}><span className="problem-id">{bug.id}</span><span className="problem-icon">{bug.icon}</span><div><small>{bug.type}</small><h3>{bug.title}</h3></div><span className="problem-result">{bug.result}</span><span className="problem-arrow">↗</span></article>)}</div></section>

    <section className="services-section section-pad"><SectionLabel index="04">How I can help</SectionLabel><div className="services-intro"><h2>Built for the<br /><span>messy middle.</span></h2><p>Reliable progress for Roblox teams working through live systems.</p></div><div className="services-grid">{services.map((service) => <article className="service-card" key={service.number}><span>{service.number}</span><h3>{service.title}</h3><p>{service.copy}</p><Arrow /></article>)}</div></section>

    <section className="skills-section section-pad"><SectionLabel index="05">The toolkit</SectionLabel><div className="skills-layout"><div><h2>A practical<br /><span>stack.</span></h2><p>Luau-first. Production-minded.</p></div><div className="skills-cloud">{skills.map(([skill, type], index) => <div className="skill-pill" key={skill} style={{ "--skill-index": index } as React.CSSProperties}><span>{skill}</span><small>{type}</small></div>)}</div></div></section>

    <section className="workflow-section section-pad"><SectionLabel index="06">The working rhythm</SectionLabel><div className="workflow-heading"><h2>Targeted fixes.<br /><span>Durable systems.</span></h2><p>Understand first. Change carefully. Test the edge cases. Leave the next developer a clearer path.</p></div><div className="workflow-line">{workflow.map(([title, copy], index) => <div className="workflow-step" key={title}><span className="workflow-dot">0{index + 1}</span><strong>{title}</strong><p>{copy}</p></div>)}</div></section>

    <section className="testimonials-section section-pad"><SectionLabel index="07">Good work leaves a trail</SectionLabel><div className="testimonials-layout"><div><h2>Built to be<br /><span>trusted.</span></h2><p className="section-copy">Clear questions, careful changes, and systems that are easier to continue.</p></div><div className="testimonial-stage"><article className="testimonial-card"><div className="testimonial-quote">“</div><p>{testimonials[testimonialIndex].quote}</p><div className="testimonial-person"><span className="testimonial-avatar">{testimonials[testimonialIndex].initials}</span><div><strong>{testimonials[testimonialIndex].name}</strong><small>{testimonials[testimonialIndex].role} · {testimonials[testimonialIndex].project}</small></div></div></article><div className="testimonial-controls"><span>0{testimonialIndex + 1} / 0{testimonials.length}</span><div><button onClick={() => setTestimonialIndex((current) => (current - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial">←</button><button onClick={() => setTestimonialIndex((current) => (current + 1) % testimonials.length)} aria-label="Next testimonial">→</button></div></div></div></div></section>

    <section className="contact-section section-pad" id="contact"><div className="contact-copy"><SectionLabel index="08">Start a conversation</SectionLabel><h2>Have a Roblox project<br /><span>worth building?</span></h2><p>Replace this with PogDog's preferred contact instructions and response expectations.</p><div className="contact-details"><a href={discordUrl}>Discord: add_username <Arrow /></a><span>ADD TIMEZONE · REMOTE</span><span>ADD AVAILABILITY · ADD RESPONSE TIME</span></div></div><ContactForm /></section>

    <footer className="site-footer"><div className="footer-brand"><span className="brand-mark">P</span><span>POGDOG / ROBLOX DEVELOPER</span></div><p>Replace with three core specialties</p><div><a href="#top">Back to top ↑</a><span>© 2026</span></div></footer>

    {selectedProject && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedProject(null)}><article className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedProject(null)} aria-label="Close case study">×</button><div className="modal-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,10,10,.12), rgba(8,10,10,.85)), url(${selectedProject.image})` }}><span>{selectedProject.eyebrow}</span><strong>{selectedProject.title}</strong></div><div className="modal-content"><p className="kicker">{selectedProject.category} / {selectedProject.period}</p><h2 id="project-modal-title">{selectedProject.title}</h2><p>{selectedProject.description}</p><div className="modal-facts"><div><span>Role</span><strong>{selectedProject.role}</strong></div><div><span>Result</span><strong>{selectedProject.result}</strong></div></div><div className="tag-row">{selectedProject.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>{selectedProject.videoUrl && <a className="button button-quiet" href={selectedProject.videoUrl} target="_blank" rel="noreferrer">Watch reel <Arrow /></a>}{selectedProject.slug === "featured-project" && <Link className="button button-solid" href="/work/featured-project">Open case note <Arrow /></Link>}</div></article></div>}
  </main>;
}
