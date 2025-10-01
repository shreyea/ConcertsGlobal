import React from "react";
import BackgroundParticles from "../components/BackgroundParticles";
import Footer from "../components/Footer";


/**
 * Enhanced Login Component
 */
export default function Login() {
  const styles = {
    // --- Global Container Styles ---
    container: {
      position: "relative",
     
      display: "flex",
      
      justifyContent: "center",
      alignItems: "top",
      fontFamily: 'Inter, Roboto, Segoe UI, Arial, sans-serif',
      backgroundColor: "#121212",
      overflow: "hidden",
      marginTop: "10vh",
      marginBottom: "30vh",
    },

    // --- Login Card Styles ---
    loginCard: {
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "16px",
      padding: "32px 24px",
      width: "320px",
      backdropFilter: "blur(10px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
      textAlign: "center",
      zIndex: 1,
      
    },

    // --- Header ---
    header: {
      color: "white",
      marginBottom: "18px",
      fontSize: "1.2rem",
      fontWeight: "600",
    },

    // --- Form Styles ---
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      width: "100%",
    },

    // --- Input Styles ---
    input: {
      padding: "10px 12px",
      background: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "8px",
      color: "white",
      fontSize: "0.95rem",
    },

    // --- Button Styles ---
    button: {
      padding: "10px 18px",
      background: "#02456cff",
      border: "none",
      borderRadius: "8px",
      color: "white",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "600",
      marginTop: "8px",
      transition: "background 0.3s ease, transform 0.1s ease",
    },

    // --- Utility Links ---
    utilityText: {
      marginTop: "10px",
      fontSize: "0.85rem",
    },

    utilityLink: {
      color: "#0273baff",
      textDecoration: "none",
      margin: "0 5px",
      fontWeight: "500",
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
      window.location.href = "/"; // redirect to home or dashboard
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
    <div style={styles.container}>
      <BackgroundParticles id="login-bg" />
      <div style={styles.loginCard}>
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
          <button style={styles.button} disabled={loading}>{loading ? "Logging in..." : "Log In Securely"}</button>
        </form>
        <div style={styles.utilityText}>
          <a href="#" style={styles.utilityLink}>Forgot Password?</a>
          <span style={{ color: "#A0A0A0" }}> | </span>
          <span style={{ color: "#A0A0A0" }}>Need an account?</span>
          <a href="#" style={styles.utilityLink} onClick={handleSignup}> Sign Up</a>
        </div>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </div>
    </div>
  );
}
