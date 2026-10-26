import React, { useState } from "react";

const LoginPage = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:4000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed.");
      }

      // Notify App.js of successful login
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* PayFlex Brand Header */}
        <div style={styles.brandContainer}>
          <div style={styles.brandIcon}>P</div>
          <div style={styles.brandTextGroup}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={styles.brandTitle}>PayFlex</span>
              <span style={styles.brandBadge}>ADMIN</span>
            </div>
            <p style={styles.subtitle}>Fintech Operations Portal</p>
          </div>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@payflex.ng"
              
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

// PayFlex Brand Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a", // PayFlex Dark Slate
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "2.5rem",
    borderRadius: "16px",
    backgroundColor: "#1e293b", // Slate Card Surface
    color: "#f8fafc",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "2rem",
  },
  brandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    backgroundColor: "#00b130", // PayFlex Brand Green
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    fontWeight: "800",
    boxShadow: "0 4px 12px rgba(0, 177, 48, 0.3)",
  },
  brandTextGroup: {
    display: "flex",
    flexDirection: "column",
  },
  brandTitle: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "-0.02em",
  },
  brandBadge: {
    backgroundColor: "rgba(0, 177, 48, 0.15)",
    color: "#00b130",
    fontSize: "0.65rem",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 177, 48, 0.3)",
    letterSpacing: "0.05em",
  },
  subtitle: {
    margin: "2px 0 0 0",
    color: "#94a3b8",
    fontSize: "0.8rem",
  },
  errorAlert: {
    padding: "0.75rem",
    marginBottom: "1.25rem",
    borderRadius: "8px",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    fontSize: "0.85rem",
    textAlign: "center",
  },
  fieldGroup: { marginBottom: "1.25rem" },
  label: { 
    display: "block", 
    marginBottom: "0.5rem", 
    fontSize: "0.85rem", 
    fontWeight: "600",
    color: "#cbd5e1" 
  },
  input: {
    width: "100%",
    padding: "0.8rem 1rem",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  },
  button: {
    width: "100%",
    padding: "0.85rem",
    marginTop: "0.5rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#00b130", // PayFlex Brand Green Button
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 177, 48, 0.25)",
    transition: "background-color 0.2s ease",
  },
};

export default LoginPage;