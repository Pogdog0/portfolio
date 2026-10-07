import { notFound } from "next/navigation";
import Link from "next/link";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = (await getSiteContent()).projects.find((item) => item.slug === slug && item.status === "Published" && item.caseStudy.intro);
  if (!project) notFound();
  const study = project.caseStudy;
  return <main className="case-page"><header className="case-nav"><Link className="brand" href="/"><span className="brand-mark">P</span><span>Pogdog / <em>ROBLOX SYSTEMS</em></span></Link><Link className="case-back" href="/">Back to selected work</Link></header><section className="case-hero"><div><span className="kicker">{project.eyebrow}</span><h1>{project.title}</h1><p>{study.intro}</p><span className="case-game-link">Roblox production work</span></div><div className="case-hero-image" style={{ backgroundImage: `linear-gradient(140deg, rgba(7,9,9,.12), rgba(7,9,9,.78)), url(${project.image})` }}><span>{project.title.toUpperCase()} / CASE STUDY</span><b>01</b></div></section><section className="case-details"><div className="case-detail-meta"><div><span>Role</span><strong>{project.role || "Developer"}</strong></div><div><span>Period</span><strong>{project.period || "Project engagement"}</strong></div><div><span>Scope</span><strong>{study.scope || project.tags.join(" / ")}</strong></div></div><div className="case-story"><p className="case-lead">{study.lead || project.result}</p><div className="case-block"><span>01 / Problem</span><h2>What was happening</h2><p>{study.problem}</p></div><div className="case-block"><span>02 / Investigation</span><h2>How we approached it</h2><p>{study.investigation}</p></div><div className="case-block"><span>03 / Solution</span><h2>What changed</h2><p>{study.solution}</p></div><div className="case-block case-result"><span>04 / Result</span><h2>What improved</h2><p>{study.result || project.result}</p></div></div></section><footer className="case-footer"><span>Project outcomes reflect the work of the team.</span><a href="#top">Pogdog / ROBLOX SYSTEMS</a></footer></main>;
}
