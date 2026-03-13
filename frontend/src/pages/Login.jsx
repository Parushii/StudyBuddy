import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData);
      alert("Login successful 🎉");
      navigate("/homepage");
    } catch (err) {
      console.error(err);
      alert("Login failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Garamond, Georgia, serif",
      backgroundImage: "url('/login-door.jpg')", 
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      backgroundColor: "#050a04",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        /* ── Floating sparkles (match the image's light particles) ── */
        @keyframes sparkleFloat {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          20%  { opacity: 0.9; }
          80%  { opacity: 0.4; }
          100% { transform: translateY(-120px) translateX(var(--sx)) scale(0.3); opacity: 0; }
        }
        /* ── Candle flicker on the card border ── */
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 30px rgba(255,180,60,0.25), 0 0 80px rgba(200,120,20,0.12), inset 0 0 40px rgba(255,160,40,0.04); }
          50%      { box-shadow: 0 0 50px rgba(255,200,80,0.35), 0 0 120px rgba(220,140,30,0.18), inset 0 0 60px rgba(255,180,50,0.07); }
        }
        /* ── Subtle ambient pulse on overlay ── */
        @keyframes ambientPulse {
          0%,100% { opacity: 0.52; }
          50%      { opacity: 0.44; }
        }
        /* ── Input styles ── */
        .enchanted-input {
          width: 100%;
          padding: 13px 18px;
          background: rgba(8, 4, 2, 0.55);
          border: 1px solid rgba(200, 155, 60, 0.4);
          border-radius: 10px;
          color: #f5e8c8;
          font-family: Garamond, Georgia, serif;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
          box-sizing: border-box;
          letter-spacing: 0.02em;
        }
        .enchanted-input::placeholder { color: rgba(200,165,90,0.4); }
        .enchanted-input:focus {
          background: rgba(12, 6, 2, 0.7);
          border-color: rgba(255, 195, 70, 0.75);
          box-shadow: 0 0 0 3px rgba(255,180,40,0.1), 0 0 22px rgba(255,160,30,0.18);
        }
        /* ── Submit button ── */
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, rgba(160,90,10,0.88) 0%, rgba(100,50,5,0.95) 100%);
          border: 1px solid rgba(230,175,60,0.55);
          border-radius: 10px;
          color: #faeac8;
          font-family: Garamond, Georgia, serif;
          font-size: 18px;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(180,100,15,0.3);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,220,100,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(190,110,15,0.95) 0%, rgba(130,65,8,1) 100%);
          border-color: rgba(255,210,80,0.75);
          box-shadow: 0 6px 35px rgba(220,140,20,0.45), 0 0 60px rgba(255,160,30,0.2);
          transform: translateY(-2px);
          color: #fff8e0;
        }
        .submit-btn:disabled { opacity: 0.55; cursor: default; transform: none; }

        /* ── Link hover ── */
        .signup-link {
          color: rgba(230,185,80,0.85);
          text-decoration: none;
          border-bottom: 1px solid rgba(220,175,60,0.35);
          padding-bottom: 1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .signup-link:hover {
          color: rgba(255,215,100,1);
          border-color: rgba(255,205,80,0.65);
        }
      `}</style>

      {/* ── Subtle dark vignette — darkens edges, keeps door bright ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 42% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)",
        animation: "ambientPulse 6s ease-in-out infinite",
      }} />

      {/* ── Extra warmth layer to tie form into the image light ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "rgba(0,0,0,0.35)",
      }} />

      {/* ── Floating light particles matching the image sparkles ── */}
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${20 + (i * 31.7) % 55}%`,
          top: `${10 + (i * 17.3) % 75}%`,
          width: `${2 + (i % 3)}px`,
          height: `${2 + (i % 3)}px`,
          borderRadius: "50%",
          background: i % 3 === 0 ? "#fff8e0" : i % 3 === 1 ? "#ffd870" : "#ffe4a0",
          boxShadow: `0 0 ${6 + (i % 4) * 3}px ${3 + i % 3}px rgba(255,220,100,0.7)`,
          animation: `sparkleFloat ${3 + (i * 0.45)}s ease-out infinite`,
          animationDelay: `${(i * 0.38) % 4}s`,
          "--sx": `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 8)}px`,
          zIndex: 2, pointerEvents: "none",
        }} />
      ))}

      {/* ── Form panel — right side, leaving door visible ── */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: 400,
        margin: "0 auto",
        padding: "0 4px",
      }}>

        {/* Glass card */}
        <div style={{
          background: "linear-gradient(160deg, rgba(12,5,1,0.88) 0%, rgba(8,3,0,0.94) 100%)",
          border: "1px solid rgba(200,155,55,0.3)",
          borderRadius: 22,
          padding: "44px 38px 38px",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          animation: "borderGlow 5s ease-in-out infinite",
        }}>

          {/* Ornamental top line */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(200,155,55,0.5))" }} />
            <span style={{ color: "rgba(220,175,70,0.7)", fontSize: 18, letterSpacing: 6 }}>✦ ✦ ✦</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(200,155,55,0.5))" }} />
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 32, marginBottom: 10,
              filter: "drop-shadow(0 0 14px rgba(255,190,50,0.7))" }}>🕯️</div>
            <h2 style={{
              color: "#f5e4b0", fontSize: 28, fontWeight: "normal",
              letterSpacing: "0.08em", margin: 0,
              textShadow: "0 0 25px rgba(255,180,50,0.5), 0 2px 8px rgba(0,0,0,0.8)",
            }}>Welcome Back</h2>
            <p style={{
              color: "rgba(185,145,65,0.65)", fontSize: 14,
              marginTop: 8, marginBottom: 0, letterSpacing: "0.04em",
            }}>The door remembers your hand</p>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(180,135,50,0.35))" }} />
            <span style={{ color: "rgba(190,145,55,0.45)", fontSize: 11 }}>✦</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(180,135,50,0.35))" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{
                display: "block", fontSize: 11, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(195,155,65,0.65)",
                marginBottom: 8,
              }}>Scroll Address</label>
              <input className="enchanted-input"
                type="email" name="email" placeholder="your@email.com"
                value={formData.email} onChange={handleChange} required />
            </div>

            <div>
              <label style={{
                display: "block", fontSize: 11, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(195,155,65,0.65)",
                marginBottom: 8,
              }}>Secret Incantation</label>
              <input className="enchanted-input"
                type="password" name="password" placeholder="••••••••"
                value={formData.password} onChange={handleChange} required />
            </div>

            <div style={{ marginTop: 4 }}>
              <button className="submit-btn" type="submit" disabled={isLoading}>
                {isLoading ? "Opening the door…" : "🚪 Enter the Hall"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0 18px" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(160,120,45,0.25))" }} />
            <span style={{ color: "rgba(160,120,45,0.35)", fontSize: 11 }}>✦ ✦ ✦</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(160,120,45,0.25))" }} />
          </div>

          <p style={{ textAlign: "center", color: "rgba(155,120,55,0.6)", fontSize: 14, margin: 0 }}>
            New to the forest?{" "}
            <Link to="/signup" className="signup-link">Begin your journey</Link>
          </p>
        </div>
      </div>
    </div>
  );
}