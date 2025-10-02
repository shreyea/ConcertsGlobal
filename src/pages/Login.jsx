import React from "react";
import BackgroundParticles from "../components/BackgroundParticles";
import Footer from "../components/Footer";

/**
 * Enhanced Login Component with Darker Background
 */
export default function Login() {
  const styles = {
    // --- Global Container Styles ---
    container: {
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif',
      background: "linear-gradient(135deg, #0a0a13 0%, #181a23 100%)",
      overflow: "hidden",
    },

    // --- Login Card Styles (kept minimal because CSS class handles visual) ---
    loginCard: {
      borderRadius: "20px",
      padding: "40px 32px",
      width: "340px",
      textAlign: "center",
      zIndex: 1,
    },

    // --- Header ---
    header: {
      color: "#f3f6fa",
      marginBottom: "22px",
      fontSize: "1.45rem",
      fontWeight: "700",
      letterSpacing: "0.5px",
      textShadow: "0 2px 8px rgba(0,0,0,0.25)",
    },

    // --- Form Styles ---
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      width: "100%",
    },

    // --- Input Styles ---
    input: {
      padding: "12px 14px",
      background: "rgba(30, 32, 48, 0.95)",
      border: "1.5px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "10px",
      color: "#e6e9f0",
      fontSize: "1rem",
      outline: "none",
      transition: "border 0.2s",
      boxShadow: "0 1px 4px 0 rgba(0,0,0,0.12)",
    },

    // --- Button Styles ---
    button: {
      padding: "12px 0",
      background: "linear-gradient(90deg, #02456c 0%, #0273ba 100%)",
      border: "none",
      borderRadius: "10px",
      color: "white",
      cursor: "pointer",
      fontSize: "1.08rem",
      fontWeight: "700",
      marginTop: "10px",
      transition: "background 0.3s, transform 0.1s",
      boxShadow: "0 2px 8px 0 rgba(2,67,108,0.18)",
    },

    // --- Utility Links ---
    utilityText: {
      marginTop: "16px",
      fontSize: "0.93rem",
      color: "#b0b4c0",
    },

    utilityLink: {
      color: "#3fa7ff",
      textDecoration: "none",
      margin: "0 5px",
      fontWeight: "500",
      transition: "color 0.2s",
    },
  };

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    setLoading(false);
    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      window.location.href = "/";
    } else {
      setError(res.error || "Login failed");
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signup(email, password);
    setLoading(false);
    if (res.success) {
      setError("Signup successful! Please log in.");
    } else {
      setError(res.error || "Signup failed");
    }
  }

  return (
    <div className="page-root page-login" style={styles.container}>
      <BackgroundParticles id="login-bg" />
      <div className="page login" style={{ position: 'relative', zIndex: 1 }}>
        <div className={`surface-blur`} style={styles.loginCard}>
        <h1 style={styles.header}>Welcome Back!</h1>
        <form style={styles.form} onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            style={styles.input}
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Log In Securely"}
          </button>
        </form>
        <div style={styles.utilityText}>
          <a href="#" style={styles.utilityLink}>Forgot Password?</a>
          <span style={{ color: "#6a6e7a" }}> | </span>
          <span style={{ color: "#6a6e7a" }}>Need an account?</span>
          <a href="#" style={styles.utilityLink} onClick={handleSignup}> Sign Up</a>
        </div>
        {error && <div style={{ color: '#ff4d4f', marginTop: 14, fontWeight: 500 }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
