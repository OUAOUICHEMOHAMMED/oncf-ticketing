import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import TicketModal from "./TicketModal";
import UserModal from "./UserModal";
import LoginPage from "./LoginPage";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userRole, setUserRole] = useState("");
  const tableRef = useRef();

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8080",
    auth: isLogged ? { username, password } : undefined,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.get("http://localhost:8080/api/tickets", {
        auth: { username, password },
      });
      setIsLogged(true);
      setLoginError("");
      fetchTickets(username, password);
      const userRes = await axios.get("http://localhost:8080/api/users/me", {
        auth: { username, password },
      });
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

  const handleCreateUser = async (userData) => {
    try {
      await axiosInstance.post("/api/users", userData);
      alert("Utilisateur créé !");
    } catch (err) {
      alert("Erreur lors de la création de l'utilisateur.");
    }
  };

  // Initialisation DataTable à chaque changement de tickets
  useEffect(() => {
    if (!isLogged) return;
    if (!tableRef.current) return;
    if ($.fn.dataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    $(tableRef.current).DataTable({
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json",
      },
      order: [],
    });
  }, [tickets, isLogged]);

  useEffect(() => {
    if (isLogged) fetchTickets();
    // eslint-disable-next-line
  }, [isLogged]);

  if (!isLogged) {
    return (
      <LoginPage
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        loginError={loginError}
      />
    );
  }

  return (
    <div className="container mt-5">
      <h2>Gestion des Tickets ONCF</h2>
      <Button className="mb-3" onClick={() => openModal()}>
        + Nouveau Ticket
      </Button>
      {userRole === "ADMIN" && (
        <Button className="mb-3 ms-2" variant="success" onClick={() => setShowUserModal(true)}>
          + Créer un utilisateur
        </Button>
      )}
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div>
          <table ref={tableRef} className="display table table-striped table-bordered" style={{ width: "100%" }}>
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
          </table>
        </div>
      )}

      <TicketModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        ticket={editingTicket}
      />

      <UserModal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        onCreate={handleCreateUser}
      />
    </div>
  );
}

export default App;