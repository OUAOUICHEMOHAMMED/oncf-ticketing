import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import TicketModal from "./TicketModal";
import UserModal from "./UserModal";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  // Pour la gestion des users
  const [showUserModal, setShowUserModal] = useState(false);
  const [userRole, setUserRole] = useState(""); // "ADMIN" ou "USER"

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8080",
    auth: isLogged ? { username, password } : undefined,
  });

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // On récupère les tickets pour tester l'auth, puis on récupère le rôle
      const res = await axios.get("http://localhost:8080/api/tickets", {
        auth: { username, password },
      });
      setIsLogged(true);
      setLoginError("");
      fetchTickets(username, password);

      // Récupérer le rôle de l'utilisateur connecté
      const userRes = await axios.get("http://localhost:8080/api/users/me", {
        auth: { username, password },
      });
      console.log("Réponse /api/users/me :", userRes.data); // DEBUG
      setUserRole(userRes.data.role);

    } catch (err) {
      setLoginError("Identifiants invalides ou erreur serveur.");
    }
  };

  const fetchTickets = async (u = username, p = password) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/tickets", {
        auth: { username: u, password: p },
      });
      setTickets(res.data);
    } catch (err) {
      setTickets([]);
    }
    setLoading(false);
  };

  const openModal = (ticket = null) => {
    setEditingTicket(ticket);
    setShowModal(true);
  };

  const handleSave = async (form) => {
    try {
      if (editingTicket) {
        await axiosInstance.put(`/api/tickets/${editingTicket.id}`, form);
      } else {
        await axiosInstance.post("/api/tickets", form);
      }
      setShowModal(false);
      fetchTickets();
    } catch (err) {
      alert("Erreur lors de l'enregistrement du ticket.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce ticket ?")) return;
    try {
      await axiosInstance.delete(`/api/tickets/${id}`);
      fetchTickets();
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  // Création d'utilisateur (admin)
  const handleCreateUser = async (userData) => {
    try {
      await axiosInstance.post("/api/users", userData);
      alert("Utilisateur créé !");
    } catch (err) {
      alert("Erreur lors de la création de l'utilisateur.");
    }
  };

  useEffect(() => {
    if (isLogged) fetchTickets();
    // eslint-disable-next-line
  }, [isLogged]);

  // DEBUG : Affiche le rôle à chaque render
  console.log("userRole dans le render :", userRole);

  if (!isLogged) {
    return (
      <div className="container mt-5" style={{ maxWidth: 400 }}>
        <h2>Connexion</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Nom d'utilisateur</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {loginError && <Alert variant="danger">{loginError}</Alert>}
          <Button type="submit" className="mt-3" variant="primary" block>
            Se connecter
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Gestion des Tickets ONCF</h2>
      <Button className="mb-3" onClick={() => openModal()}>
        + Nouveau Ticket
      </Button>
      {/* Bouton admin pour créer un utilisateur */}
      {userRole === "ADMIN" && (
        <Button className="mb-3 ms-2" variant="success" onClick={() => setShowUserModal(true)}>
          + Créer un utilisateur
        </Button>
      )}
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Description</th>
              <th>État</th>
              <th>Type</th>
              <th>Famille</th>
              <th>Opérateur</th>
              <th>Nature</th>
              <th>Équipement</th>
              <th>Ligne</th>
              <th>Priorité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.titre}</td>
                <td>{ticket.description}</td>
                <td>{ticket.etat}</td>
                <td>{ticket.type}</td>
                <td>{ticket.famille}</td>
                <td>{ticket.operateur}</td>
                <td>{ticket.nature}</td>
                <td>{ticket.equipement}</td>
                <td>{ticket.ligne}</td>
                <td>{ticket.priorite}</td>
                <td>
  <Button
    size="sm"
    variant="warning"
    onClick={() => openModal(ticket)}
  >
    Modifier
  </Button>{" "}
  {userRole === "ADMIN" && (
    <Button
      size="sm"
      variant="danger"
      onClick={() => handleDelete(ticket.id)}
    >
      Supprimer
    </Button>
  )}
</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <TicketModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        ticket={editingTicket}
      />

      {/* Modal pour création d'utilisateur */}
      <UserModal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        onCreate={handleCreateUser}
      />
    </div>
  );
}

export default App;