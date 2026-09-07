import { notFound } from "next/navigation";
import Link from "next/link";

const caseStudies: Record<string, { title: string; eyebrow: string; image: string; role: string; period: string; intro: string; problem: string; investigation: string; solution: string; result: string }> = {
  "featured-project": {
    title: "Featured Project",
    eyebrow: "Project category / Case study 01",
    image: "/images/projects/west-indies.webp",
    role: "Add PogDog's exact role",
    period: "Add project period",
    intro: "Replace this with one sentence explaining the project, the context, and why the work mattered.",
    problem: "Describe the real problem before PogDog's contribution. Avoid vague claims and include only details that can be shared.",
    investigation: "Explain what PogDog inspected, measured, prototyped, or tested to understand the problem.",
    solution: "Explain PogDog's exact contribution, the technical decisions made, and what collaborators handled.",
    result: "Add a truthful, verified outcome. If no metric is available, describe the concrete improvement without inventing a number.",
  },
};

export function generateStaticParams() { return Object.keys(caseStudies).map((slug) => ({ slug })); }

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudies[slug];
  if (!study) notFound();
  return <main className="case-page"><header className="case-nav"><Link className="brand" href="/"><span className="brand-mark">P</span><span>POGDOG / <em>ROBLOX DEVELOPER</em></span></Link><Link className="case-back" href="/">Back to selected work</Link></header><section className="case-hero"><div><span className="kicker">{study.eyebrow}</span><h1>{study.title}</h1><p>{study.intro}</p><span className="case-game-link">ADD ROBLOX EXPERIENCE LINK</span></div><div className="case-hero-image" style={{ backgroundImage: `linear-gradient(140deg, rgba(7,9,9,.12), rgba(7,9,9,.78)), url(${study.image})` }}><span>FEATURED PROJECT / CASE STUDY</span><b>01</b></div></section><section className="case-details"><div className="case-detail-meta"><div><span>Role</span><strong>{study.role}</strong></div><div><span>Period</span><strong>{study.period}</strong></div><div><span>Scope</span><strong>Add systems / tools /<br />responsibilities</strong></div></div><div className="case-story"><p className="case-lead">Replace this with the main lesson or result.</p><div className="case-block"><span>01 / Problem</span><h2>What was happening</h2><p>{study.problem}</p></div><div className="case-block"><span>02 / Investigation</span><h2>How I approached it</h2><p>{study.investigation}</p></div><div className="case-block"><span>03 / Solution</span><h2>What I contributed</h2><p>{study.solution}</p></div><div className="case-block case-result"><span>04 / Result</span><h2>What improved</h2><p>{study.result}</p></div></div></section><footer className="case-footer"><span>Credit collaborators, separate personal contribution from team results, and publish only claims PogDog can support.</span><a href="#top">POGDOG / ROBLOX DEVELOPER</a></footer></main>;
}
