/* eslint-disable @next/next/no-img-element */

type SocialCardProps = {
  eyebrow: string;
  title: string;
  summary: string;
  imageSrc: string;
  accent?: string;
  tags?: string[];
};

export default function SocialCard({ eyebrow, title, summary, imageSrc, accent = "#55a8ff" }: SocialCardProps) {
  const titleSize = title.length <= 8 ? 158 : title.length <= 14 ? 124 : 94;
  return <div style={{
    width: "100%",
    height: "100%",
    display: "flex",
    position: "relative",
    overflow: "hidden",
    color: "#f3f1e9",
    background: "#04090c",
    fontFamily: "Arial, sans-serif",
  }}>
    <img src={imageSrc} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{ position: "absolute", inset: 0, display: "flex", background: "rgba(2,7,10,0.22)" }} />
    <div style={{ position: "absolute", left: 30, top: 48, bottom: 48, width: 790, display: "flex", background: "rgba(2,7,10,0.79)", border: "1px solid rgba(194,218,228,0.22)", borderRadius: 8, boxShadow: "0 24px 80px rgba(0,0,0,0.58)" }} />
    <div style={{ position: "absolute", left: 30, top: 48, width: 625, height: 12, display: "flex", borderTop: `3px solid ${accent}`, borderLeft: `3px solid ${accent}`, borderTopLeftRadius: 8 }} />
    <div style={{ position: "absolute", left: 52, top: 70, bottom: 70, width: 1, display: "flex", background: "rgba(213,229,236,0.16)" }} />

    <div style={{ position: "relative", width: 760, height: "100%", padding: "116px 72px 92px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ display: "flex", fontSize: titleSize, lineHeight: 0.86, fontWeight: 900, letterSpacing: -2, textShadow: "0 5px 30px rgba(0,0,0,0.88)" }}>{title}</div>
      <div style={{ width: 620, height: 5, display: "flex", background: accent, marginTop: 32, marginBottom: 22 }} />
      <div style={{ display: "flex", color: accent, fontSize: 28, lineHeight: 1.05, fontWeight: 900, letterSpacing: 1.4, textShadow: "0 3px 18px rgba(0,0,0,0.9)" }}>{eyebrow.toUpperCase()}</div>
      <div style={{ width: 620, height: 1, display: "flex", background: "rgba(218,230,235,0.46)", marginTop: 20, marginBottom: 18 }} />
      <div style={{ display: "flex", color: "#c2c9c7", fontSize: 25, lineHeight: 1.25, fontWeight: 600, letterSpacing: 0.3, maxWidth: 630 }}>{summary}</div>
    </div>
  </div>;
}
