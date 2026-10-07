/* eslint-disable @next/next/no-img-element */

type SocialCardProps = {
  eyebrow: string;
  title: string;
  summary: string;
  imageSrc: string;
  accent?: string;
  tags?: string[];
};

export default function SocialCard({ eyebrow, title, summary, imageSrc, accent = "#55a8ff", tags = [] }: SocialCardProps) {
  const visibleTags = tags.filter(Boolean).slice(0, 3);
  return <div style={{
    width: "100%",
    height: "100%",
    display: "flex",
    position: "relative",
    overflow: "hidden",
    color: "#f5f9fb",
    background: "#04090c",
    fontFamily: "Arial, sans-serif",
  }}>
    <img src={imageSrc} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{ position: "absolute", inset: 0, display: "flex", background: "rgba(2,7,10,0.28)" }} />
    <div style={{ position: "absolute", left: 48, top: 138, bottom: 54, width: 725, display: "flex", background: "rgba(2,7,10,0.78)", border: "1px solid rgba(181,214,228,0.14)", borderRadius: 18, boxShadow: "0 22px 70px rgba(0,0,0,0.48)" }} />
    <div style={{ position: "absolute", left: 48, top: 138, width: 215, height: 12, display: "flex", borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`, borderTopLeftRadius: 18 }} />
    <div style={{ position: "absolute", inset: 34, display: "flex", border: "1px solid rgba(187,220,235,0.18)", borderRadius: 22 }} />
    <div style={{ position: "absolute", top: 34, left: 34, width: 245, height: 14, display: "flex", borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`, borderTopLeftRadius: 22 }} />
    <div style={{ position: "absolute", right: 34, bottom: 34, width: 170, height: 14, display: "flex", borderRight: `2px solid ${accent}`, borderBottom: `2px solid ${accent}`, borderBottomRightRadius: 22 }} />

    <div style={{ width: "100%", height: "100%", padding: "58px 70px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, background: accent, color: "#061016", fontSize: 21, fontWeight: 900 }}>P</div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3.5 }}>POGDOG / PORTFOLIO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 13px", border: "1px solid rgba(255,255,255,0.19)", borderRadius: 999, color: "#d2dde2", fontSize: 12, letterSpacing: 2 }}>
          <span style={{ width: 8, height: 8, display: "flex", borderRadius: 999, background: "#69e59a", boxShadow: "0 0 14px #69e59a" }} />
          AVAILABLE / REMOTE
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 790, marginTop: 40 }}>
        <div style={{ display: "flex", fontSize: title.length > 20 ? 88 : 110, lineHeight: 0.91, fontWeight: 900, letterSpacing: 0, textShadow: "0 4px 24px rgba(0,0,0,0.82)" }}>{title}</div>
        <div style={{ width: 96, height: 4, display: "flex", background: accent, marginTop: 25, marginBottom: 18 }} />
        <span style={{ color: accent, fontSize: 19, fontWeight: 800, letterSpacing: 2.5 }}>{eyebrow.toUpperCase()}</span>
        <span style={{ color: "#c1cdd2", fontSize: 20, lineHeight: 1.35, marginTop: 12, maxWidth: 720 }}>{summary}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {(visibleTags.length ? visibleTags : ["LUAU", "GAMEPLAY SYSTEMS", "PRODUCTION DEBUGGING"]).map((tag) => <span key={tag} style={{ padding: "8px 12px", background: "rgba(3,8,11,0.68)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 6, color: "#e0e8ec", fontSize: 12, fontWeight: 700, letterSpacing: 1.2 }}>{tag.toUpperCase()}</span>)}
        <span style={{ marginLeft: "auto", color: "#a6b6bd", fontSize: 12, letterSpacing: 2 }}>ROBLOX ENGINEERING / 2026</span>
      </div>
    </div>
  </div>;
}
