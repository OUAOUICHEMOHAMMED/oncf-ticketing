import React from "react";
import { Button, Alert } from "react-bootstrap";
import "./LoginPage.css";

function LoginPage({ username, setUsername, password, setPassword, handleLogin, loginError }) {
  return (
    <div className="login-bg d-flex align-items-center justify-content-center login-page" style={{ minHeight: "100vh" }}>
      <div className="login-card shadow p-4 rounded-4" style={{ background: "#1a1a2e", maxWidth: 400, width: "100%" }}>
        <div className="text-center mb-4">
          <img
            src="/oncf-logo1.png"
            alt="ONCF Logo"
            style={{ width: 200, marginBottom: 10 }}
          />
          <h2 style={{ fontWeight: 700, color: "#fff", letterSpacing: 1 }}>ONCF TicketPro</h2>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#fff" }}>Nom d'utilisateur</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              style={{ background: "#fff", color: "#1a1a2e", border: "none", borderRadius: 8 }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#fff" }}>Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ background: "#fff", color: "#1a1a2e", border: "none", borderRadius: 8 }}
            />
          </div>
          {loginError && <Alert variant="danger">{loginError}</Alert>}
          <Button
            type="submit"
            className="w-100 btn-primary"
            style={{
              fontWeight: 600,
              border: "none",
              borderRadius: 24,
              fontSize: 18,
              marginTop: 10,
              boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"
            }}
          >
            Se connecter
          </Button>
        </form>
      </div>
      <style>{`
        .login-bg {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #8B5CF6 100%);
        }
        .login-card {
          border-top: 6px solid #8B5CF6;
          animation: fadeIn 1s;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}

export default LoginPage;