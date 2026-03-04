import { useState } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// ─── Payment gate (Razorpay) ─────────────────────────────────────────────────
// After creating your Razorpay Payment Page, paste your link here:
const RAZORPAY_PAYMENT_LINK = "https://razorpay.me/@shanmukhkoya";
const FREE_LIMIT = 2;

function useFreeUsage() {
  const [used, setUsed] = useState(0);
  const canUse = used < FREE_LIMIT;
  const increment = () => setUsed((n) => n + 1);
  return { used, canUse, increment, remaining: FREE_LIMIT - used };
}

// ─── AI call ─────────────────────────────────────────────────────────────────
async function generateCoverLetter({ jobTitle, company, jobDesc, resumeBlurb, tone }) {
  const prompt = `You are an expert career coach. Write a compelling, personalized cover letter.

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDesc}
Candidate background: ${resumeBlurb}
Tone: ${tone}

Write a 3-paragraph cover letter (opening hook, value proposition, closing CTA). Make it specific, human, and NOT generic. No placeholders. Output ONLY the cover letter text.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? "Error generating letter.";
}

// ─── Components ───────────────────────────────────────────────────────────────

function Badge({ children }) {
  return (
    <span style={{
      background: "linear-gradient(135deg, #00ff87, #60efff)",
      color: "#0a0a0a",
      fontSize: "0.65rem",
      fontWeight: 800,
      letterSpacing: "0.12em",
      padding: "3px 10px",
      borderRadius: "999px",
      textTransform: "uppercase",
    }}>{children}</span>
  );
}

function PaywallModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, backdropFilter: "blur(8px)",
    }}>
      <div style={{
        background: "#0f0f0f",
        border: "1px solid #2a2a2a",
        borderRadius: "20px",
        padding: "44px",
        maxWidth: 420,
        textAlign: "center",
        boxShadow: "0 0 80px rgba(0,255,135,0.08)",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
        <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", marginBottom: 8 }}>
          Free limit reached
        </h2>
        <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 28 }}>
          You've used your {FREE_LIMIT} free cover letters. Upgrade to <strong style={{ color: "#00ff87" }}>Pro</strong> for unlimited generations, tone customization, and LinkedIn message templates.
        </p>
        <div style={{
          background: "linear-gradient(135deg, #00ff87, #60efff)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: 20,
          color: "#0a0a0a",
        }}>
          <div style={{ fontWeight: 900, fontSize: "2rem" }}>$9<span style={{ fontSize: "1rem", fontWeight: 500 }}>/mo</span></div>
          <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>Unlimited · Cancel anytime</div>
        </div>
        <button
          onClick={() => window.open(RAZORPAY_PAYMENT_LINK, "_blank")}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #00ff87, #60efff)",
            border: "none",
            borderRadius: "10px",
            fontWeight: 800,
            fontSize: "1rem",
            cursor: "pointer",
            marginBottom: 12,
            color: "#0a0a0a",
          }}
        >
          Upgrade to Pro →
        </button>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#555",
          fontSize: "0.8rem", cursor: "pointer",
        }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { canUse, increment, remaining } = useFreeUsage();
  const [form, setForm] = useState({
    jobTitle: "", company: "", jobDesc: "", resumeBlurb: "", tone: "Professional",
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleGenerate = async () => {
    if (!canUse) { setShowPaywall(true); return; }
    if (!form.jobTitle || !form.company || !form.jobDesc || !form.resumeBlurb) {
      alert("Please fill in all fields."); return;
    }
    setLoading(true);
    setResult("");
    try {
      const letter = await generateCoverLetter(form);
      setResult(letter);
      increment();
    } catch (e) {
      setResult("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    width: "100%",
    background: "#111",
    border: "1px solid #222",
    borderRadius: "10px",
    color: "#e0e0e0",
    padding: "12px 14px",
    fontSize: "0.88rem",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    color: "#888",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      <div style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#e0e0e0",
        fontFamily: "'DM Sans', sans-serif",
        padding: "0 0 80px",
      }}>

        {/* Nav */}
        <nav style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 40px",
          borderBottom: "1px solid #151515",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.3rem" }}>✍️</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>
              LetterForge
            </span>
            <Badge>Beta</Badge>
          </div>
          <button
            onClick={() => window.open(RAZORPAY_PAYMENT_LINK, "_blank")}
            style={{
              background: "linear-gradient(135deg, #00ff87, #60efff)",
              border: "none", borderRadius: "8px",
              padding: "8px 18px",
              fontWeight: 700, fontSize: "0.82rem",
              cursor: "pointer", color: "#0a0a0a",
            }}
          >
            Upgrade Pro · $9/mo
          </button>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "60px 20px 40px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Land interviews with<br />
            <span style={{
              background: "linear-gradient(135deg, #00ff87, #60efff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>AI-crafted cover letters</span>
          </h1>
          <p style={{ color: "#666", fontSize: "1rem", maxWidth: 460, margin: "0 auto 10px" }}>
            Tailored to each job. Written in seconds. Not generic — actually good.
          </p>
          <p style={{
            fontSize: "0.78rem",
            color: canUse ? "#00ff87" : "#ff5555",
            fontWeight: 600,
          }}>
            {canUse ? `✦ ${remaining} free generation${remaining !== 1 ? "s" : ""} remaining` : "✦ Free limit reached — upgrade to continue"}
          </p>
        </div>

        {/* Form */}
        <div style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Job Title</label>
              <input style={inputStyle} value={form.jobTitle} onChange={set("jobTitle")} placeholder="e.g. Senior Product Manager" />
            </div>
            <div>
              <label style={labelStyle}>Company</label>
              <input style={inputStyle} value={form.company} onChange={set("company")} placeholder="e.g. Notion" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Job Description (paste key parts)</label>
            <textarea style={{ ...inputStyle, minHeight: 100 }} value={form.jobDesc} onChange={set("jobDesc")} placeholder="Paste the job description or key responsibilities here..." />
          </div>

          <div>
            <label style={labelStyle}>Your Background (brief)</label>
            <textarea style={{ ...inputStyle, minHeight: 90 }} value={form.resumeBlurb} onChange={set("resumeBlurb")} placeholder="e.g. 5 years in product at fintech startups, led 3 product launches, ex-Stripe..." />
          </div>

          <div>
            <label style={labelStyle}>Tone</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.tone} onChange={set("tone")}>
              {["Professional", "Enthusiastic", "Conversational", "Bold & Direct", "Warm & Personal"].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading ? "#1a1a1a" : "linear-gradient(135deg, #00ff87, #60efff)",
              border: "none",
              borderRadius: "12px",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              color: loading ? "#555" : "#0a0a0a",
              transition: "all 0.2s",
              letterSpacing: "0.02em",
            }}
          >
            {loading ? "✦ Crafting your letter..." : "✦ Generate Cover Letter"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            maxWidth: 640,
            margin: "32px auto 0",
            padding: "0 20px",
          }}>
            <div style={{
              background: "#0f0f0f",
              border: "1px solid #1e1e1e",
              borderRadius: "16px",
              padding: "28px",
              position: "relative",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18,
              }}>
                <span style={{ color: "#00ff87", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  ✦ Your Cover Letter
                </span>
                <button onClick={handleCopy} style={{
                  background: copied ? "#00ff87" : "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  color: copied ? "#000" : "#aaa",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "6px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p style={{
                color: "#ccc",
                fontSize: "0.9rem",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                margin: 0,
              }}>{result}</p>
            </div>

            {/* Upsell nudge */}
            <div style={{
              marginTop: 16,
              padding: "16px 20px",
              background: "#0c0c0c",
              border: "1px solid #1a1a1a",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <p style={{ color: "#666", fontSize: "0.82rem", margin: 0 }}>
                🚀 <strong style={{ color: "#aaa" }}>Pro</strong> unlocks LinkedIn DM templates + resume bullet rewriter
              </p>
              <button
                onClick={() => window.open(RAZORPAY_PAYMENT_LINK, "_blank")}
                style={{
                  background: "none",
                  border: "1px solid #00ff87",
                  borderRadius: "8px",
                  color: "#00ff87",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "7px 14px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Upgrade $9/mo
              </button>
            </div>
          </div>
        )}

        {/* How to monetize guide */}
        <div style={{
          maxWidth: 640,
          margin: "50px auto 0",
          padding: "0 20px",
        }}>
          <div style={{
            background: "#0a0a0a",
            border: "1px dashed #222",
            borderRadius: "16px",
            padding: "28px",
          }}>
            <p style={{ color: "#444", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              🛠 Your monetization roadmap
            </p>
            {[
              ["1. Add Razorpay", "Go to razorpay.com → sign up (instant approval) → Payment Pages → create a ₹750/mo or $9/mo plan → copy the link → paste it as RAZORPAY_PAYMENT_LINK in the code. Takes 15 min."],
              ["2. Deploy free", "Push to Vercel (vercel.com) — free tier, instant deploy, custom domain. Connect GitHub repo."],
              ["3. Get first users", "Post in r/jobs, r/cscareerquestions, LinkedIn. 'I built a free cover letter tool' posts go viral easily."],
              ["4. SEO", "Write 5 blog posts: 'cover letter for [job type]'. Free traffic in 3–6 months."],
              ["5. Scale", "Add resume rewriter, LinkedIn optimizer. Raise price to $19/mo. Repeat."],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                <div style={{
                  minWidth: 28, height: 28,
                  background: "#151515", border: "1px solid #252525",
                  borderRadius: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", color: "#00ff87", fontWeight: 800,
                }}>→</div>
                <div>
                  <div style={{ color: "#ccc", fontWeight: 700, fontSize: "0.85rem", marginBottom: 3 }}>{title}</div>
                  <div style={{ color: "#555", fontSize: "0.8rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
