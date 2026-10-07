type SocialCardProps = {
  eyebrow: string;
  title: string;
  summary: string;
  accent?: string;
  tags?: string[];
};

export default function SocialCard({ eyebrow, title, summary, accent = "#55a8ff", tags = [] }: SocialCardProps) {
  const visibleTags = tags.filter(Boolean).slice(0, 3);
  return <div style={{
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "58px 64px",
    overflow: "hidden",
    position: "relative",
    color: "#f4f8fa",
    background: "#071014",
    fontFamily: "Arial, sans-serif",
  }}>
    <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: "linear-gradient(135deg, rgba(85,168,255,0.14), transparent 48%), radial-gradient(circle at 88% 18%, rgba(85,168,255,0.22), transparent 28%)" }} />
    <div style={{ position: "absolute", width: 390, height: 390, right: -110, bottom: -185, display: "flex", border: `2px solid ${accent}`, borderRadius: 999, opacity: 0.28 }} />
    <div style={{ position: "absolute", width: 250, height: 250, right: -40, bottom: -115, display: "flex", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999 }} />
    <div style={{ position: "absolute", left: 64, right: 64, top: 130, height: 1, display: "flex", background: "rgba(255,255,255,0.10)" }} />

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: accent, color: "#061016", fontSize: 31, fontWeight: 900 }}>P</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: 2 }}>POGDOG</span>
          <span style={{ fontSize: 14, color: "#91a2aa", letterSpacing: 3 }}>ROBLOX SYSTEMS ENGINEER</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999, color: "#c8d4d9", fontSize: 14, letterSpacing: 2 }}>
        <span style={{ width: 9, height: 9, display: "flex", borderRadius: 999, background: "#69e59a", boxShadow: "0 0 16px #69e59a" }} />
        AVAILABLE / REMOTE
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "relative", maxWidth: 1000 }}>
      <span style={{ color: accent, fontSize: 17, fontWeight: 800, letterSpacing: 4 }}>{eyebrow.toUpperCase()}</span>
      <div style={{ display: "flex", fontSize: title.length > 38 ? 60 : 72, lineHeight: 1.02, fontWeight: 900, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
      <div style={{ display: "flex", color: "#b7c4ca", fontSize: 24, lineHeight: 1.35, maxWidth: 900 }}>{summary}</div>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
      {(visibleTags.length ? visibleTags : ["LUAU", "PRODUCTION DEBUGGING", "GAMEPLAY SYSTEMS"]).map((tag) => <span key={tag} style={{ padding: "9px 14px", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 8, color: "#dce6ea", fontSize: 13, fontWeight: 700, letterSpacing: 1.5 }}>{tag.toUpperCase()}</span>)}
      <span style={{ marginLeft: "auto", color: "#91a2aa", fontSize: 14, letterSpacing: 2 }}>POGDOG-PORTFOLIO.VERCEL.APP</span>
    </div>
  </div>;
}
