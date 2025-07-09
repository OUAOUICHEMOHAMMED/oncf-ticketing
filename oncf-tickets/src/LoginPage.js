import React from "react";
import { Button, Alert } from "react-bootstrap";

function LoginPage({ username, setUsername, password, setPassword, handleLogin, loginError }) {
  return (
    <div className="login-bg d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="login-card shadow p-4 rounded-4" style={{ background: "#232837", maxWidth: 400, width: "100%" }}>
        <div className="text-center mb-4">
          <img
            src="/oncf-logo1.png"
            alt="ONCF Logo"
            style={{ width: 200, marginBottom: 10 }}
          />
          <h2 style={{ fontWeight: 700, color: "#fff", letterSpacing: 1 }}>ONCF Helpdesk</h2>
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
              style={{ background: "#fff", color: "#232837", border: "none", borderRadius: 8 }}
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
              style={{ background: "#fff", color: "#232837", border: "none", borderRadius: 8 }}
            />
          </div>
          {loginError && <Alert variant="danger">{loginError}</Alert>}
          <Button
            type="submit"
            className="w-100"
            style={{
              fontWeight: 600,
              background: "#ffb300",
              border: "none",
              color: "#232837",
              borderRadius: 24,
              fontSize: 18,
              marginTop: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}
          >
            Se connecter
          </Button>
        </form>
      </div>
      <style>{`
        .login-bg {
          background: linear-gradient(120deg, #f8f8f8 0%, #ffe5d0 100%);
        }
        .login-card {
          border-top: 6px solid #ffb300;
          animation: fadeIn 1s;
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