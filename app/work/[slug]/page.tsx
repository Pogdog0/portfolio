import { notFound } from "next/navigation";
import Link from "next/link";

const caseStudies: Record<string, { title: string; eyebrow: string; image: string; role: string; period: string; intro: string; problem: string; investigation: string; solution: string; result: string }> = {
  "featured-project": {
    title: "West Indies",
    eyebrow: "Live DataStore recovery / Case study 01",
    image: "/images/projects/west-indies.webp",
    role: "Gameplay Systems Developer",
    period: "1-week recovery sprint",
    intro: "West Indies was losing player data and hitting heavy DataStore throttling under live conditions.",
    problem: "The game had frequent throttling and data loss problems. Large player-data payloads were not reliably completing their save path.",
    investigation: "My team and I traced the write flow, retry behavior, payload pressure, and failure cases across live sessions.",
    solution: "We applied targeted persistence and recovery fixes, tightening the save path without rewriting the whole game.",
    result: "In one week, the game reached stable saving for enormous amounts of data with 500 CCU players every day.",
  },
};

export function generateStaticParams() { return Object.keys(caseStudies).map((slug) => ({ slug })); }

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudies[slug];
  if (!study) notFound();
  return <main className="case-page"><header className="case-nav"><Link className="brand" href="/"><span className="brand-mark">P</span><span>Pogdog / <em>ROBLOX SYSTEMS</em></span></Link><Link className="case-back" href="/">Back to selected work</Link></header><section className="case-hero"><div><span className="kicker">{study.eyebrow}</span><h1>{study.title}</h1><p>{study.intro}</p><span className="case-game-link">Roblox production work</span></div><div className="case-hero-image" style={{ backgroundImage: `linear-gradient(140deg, rgba(7,9,9,.12), rgba(7,9,9,.78)), url(${study.image})` }}><span>WEST INDIES / DATASTORE RECOVERY</span><b>01</b></div></section><section className="case-details"><div className="case-detail-meta"><div><span>Role</span><strong>{study.role}</strong></div><div><span>Period</span><strong>{study.period}</strong></div><div><span>Scope</span><strong>DataStores / Recovery /<br />Live stability</strong></div></div><div className="case-story"><p className="case-lead">Reliable persistence is a gameplay feature.</p><div className="case-block"><span>01 / Problem</span><h2>What was happening</h2><p>{study.problem}</p></div><div className="case-block"><span>02 / Investigation</span><h2>How we approached it</h2><p>{study.investigation}</p></div><div className="case-block"><span>03 / Solution</span><h2>What changed</h2><p>{study.solution}</p></div><div className="case-block case-result"><span>04 / Result</span><h2>What improved</h2><p>{study.result}</p></div></div></section><footer className="case-footer"><span>Project outcomes reflect the work of the team.</span><a href="#top">Pogdog / ROBLOX SYSTEMS</a></footer></main>;
}
