import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import TicketModal from "./TicketModal";
import UserModal from "./UserModal";
import LoginPage from "./LoginPage";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPlus, faUserPlus } from '@fortawesome/free-solid-svg-icons';

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
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showUserList, setShowUserList] = useState(false);
  const [userList, setUserList] = useState([]);
  const [userListLoading, setUserListLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ username: '', role: 'USER' });
  const [editUserError, setEditUserError] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [userToTransfer, setUserToTransfer] = useState(null);
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferError, setTransferError] = useState("");
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

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
      alert("Erreur lors de l'enregistrement du ticket : " + (err.response?.data?.message || err.message));
      fetchTickets();
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

  // Fonction pour récupérer la liste des utilisateurs
  const fetchUserList = async () => {
    setUserListLoading(true);
    try {
      const res = await axiosInstance.get("/api/users");
      setUserList(res.data);
    } catch (err) {
      setUserList([]);
    }
    setUserListLoading(false);
  };

  // Fonction pour ouvrir la modale d'édition
  const openEditUserModal = (user) => {
    setEditingUser(user);
    setEditUserForm({ username: user.username, role: user.role });
    setEditUserError("");
    setShowEditUserModal(true);
  };

  // Fonction pour modifier un utilisateur
  const handleEditUser = async () => {
    try {
      await axiosInstance.put(`/api/users/${editingUser.id}`, editUserForm);
      setShowEditUserModal(false);
      fetchUserList();
    } catch (err) {
      setEditUserError("Erreur lors de la modification de l'utilisateur.");
    }
  };

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Supprimer l'utilisateur ${user.username} ?`)) return;
    try {
      await axiosInstance.delete(`/api/users/${user.id}`);
      fetchUserList();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (msg.includes("tickets associés")) {
        setUserToTransfer(user);
        setPendingDeleteUser(user);
        setShowTransferModal(true);
        setTransferError("");
      } else {
        alert("Erreur lors de la suppression de l'utilisateur : " + msg);
      }
    }
  };

  // Fonction pour transférer les tickets
  const handleTransferTickets = async () => {
    if (!transferTargetId) {
      setTransferError("Veuillez sélectionner un utilisateur destinataire.");
      return;
    }
    try {
      await axiosInstance.post(`/api/users/${userToTransfer.id}/transfer-tickets`, { targetUserId: transferTargetId });
      setShowTransferModal(false);
      setTransferError("");
      fetchUserList();
      alert("Transfert et suppression effectués avec succès.");
    } catch (err) {
      setTransferError("Erreur lors du transfert : " + (err.response?.data?.message || err.message));
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    setIsLogged(false);
    setUsername("");
    setPassword("");
    setUserRole("");
  };

  useEffect(() => {
    if (isLogged) fetchTickets();
    // eslint-disable-next-line
  }, [isLogged]);

  // Recherche et tri
  const filteredTickets = tickets.filter(ticket =>
    Object.values(ticket)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (ticket.user && ticket.user.username && ticket.user.username.toLowerCase().includes(search.toLowerCase()))
  );

  const sortedTickets = React.useMemo(() => {
    if (!sortConfig.key) return filteredTickets;
    const sorted = [...filteredTickets].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === "user") {
        aValue = a.user?.username || "";
        bValue = b.user?.username || "";
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredTickets, sortConfig]);

  // Pagination
  const pageCount = Math.ceil(sortedTickets.length / itemsPerPage);
  const paginatedTickets = sortedTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestion des Tickets ONCF</h2>
        <Button variant="outline-danger" onClick={handleLogout}>Déconnexion</Button>
      </div>
      <Button className="mb-3" onClick={() => openModal()}>
        <FontAwesomeIcon icon={faPlus} className="me-2" />
        Nouveau Ticket
      </Button>
      {userRole === "ADMIN" && (
        <>
          <Button className="mb-3 ms-2" variant="success" onClick={() => setShowUserModal(true)}>
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Créer un utilisateur
          </Button>
          <Button className="mb-3 ms-2" variant="info" onClick={() => { setShowUserList(true); fetchUserList(); }}>
            Lister les utilisateurs
          </Button>
        </>
      )}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div>
          {paginatedTickets.length === 0 ? (
            <div className="alert alert-info">Aucun ticket à afficher.</div>
          ) : (
            <table className="table table-striped table-bordered" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th onClick={() => handleSort("titre")} style={{ cursor: "pointer" }}>Titre {sortConfig.key === "titre" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("etat")} style={{ cursor: "pointer" }}>État {sortConfig.key === "etat" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("user")} style={{ cursor: "pointer" }}>Créé par {sortConfig.key === "user" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("type")} style={{ cursor: "pointer" }}>Type {sortConfig.key === "type" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("famille")} style={{ cursor: "pointer" }}>Famille {sortConfig.key === "famille" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("operateur")} style={{ cursor: "pointer" }}>Opérateur {sortConfig.key === "operateur" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("nature")} style={{ cursor: "pointer" }}>Nature {sortConfig.key === "nature" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("equipement")} style={{ cursor: "pointer" }}>Équipement {sortConfig.key === "equipement" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("ligne")} style={{ cursor: "pointer" }}>Ligne {sortConfig.key === "ligne" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("priorite")} style={{ cursor: "pointer" }}>Priorité {sortConfig.key === "priorite" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("description")} style={{ cursor: "pointer" }}>Description {sortConfig.key === "description" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.titre}</td>
                    <td>{ticket.etat}</td>
                    <td>{ticket.user ? ticket.user.username : 'N/A'}</td>
                    <td>{ticket.type}</td>
                    <td>{ticket.famille}</td>
                    <td>{ticket.operateur}</td>
                    <td>{ticket.nature}</td>
                    <td>{ticket.equipement}</td>
                    <td>{ticket.ligne}</td>
                    <td>{ticket.priorite}</td>
                    <td>{ticket.description}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center align-items-center" style={{gap: '0.5rem'}}>
                        <span
                          className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer' }}
                          title="Modifier"
                          onClick={() => openModal(ticket)}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </span>
                        {userRole === "ADMIN" && (
                          <span
                            className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{ width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer' }}
                            title="Supprimer"
                            onClick={() => handleDelete(ticket.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Pagination */}
          {pageCount > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>&laquo;</button>
                </li>
                {[...Array(pageCount)].map((_, idx) => (
                  <li key={idx + 1} className={`page-item${currentPage === idx + 1 ? " active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
                  </li>
                ))}
                <li className={`page-item${currentPage === pageCount ? " disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === pageCount}>&raquo;</button>
                </li>
              </ul>
            </nav>
          )}
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
        onSave={handleCreateUser}
      />
      {/* Modale de liste des utilisateurs */}
      <Modal show={showUserList} onHide={() => setShowUserList(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Liste des utilisateurs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userListLoading ? (
            <div>Chargement...</div>
          ) : userList.length === 0 ? (
            <div>Aucun utilisateur trouvé.</div>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nom d'utilisateur</th>
                  <th>Rôle</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center align-items-center" style={{gap: '0.5rem'}}>
                        <span
                          className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer' }}
                          title="Modifier"
                          onClick={() => openEditUserModal(user)}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </span>
                        <span
                          className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer' }}
                          title="Supprimer"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserList(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modale de modification d'utilisateur */}
      <Modal show={showEditUserModal} onHide={() => setShowEditUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              className="form-control"
              value={editUserForm.username}
              onChange={e => setEditUserForm({ ...editUserForm, username: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label>Rôle</label>
            <select
              className="form-control"
              value={editUserForm.role}
              onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          {editUserError && <div className="alert alert-danger">{editUserError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditUserModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleEditUser}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modale de transfert de tickets */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Transférer les tickets de {userToTransfer?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label>Transférer les tickets vers :</label>
            <select
              className="form-control"
              value={transferTargetId}
              onChange={e => setTransferTargetId(e.target.value)}
            >
              <option value="">-- Sélectionner un utilisateur --</option>
              {userList.filter(u => u.id !== userToTransfer?.id).map(u => (
                <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
              ))}
            </select>
          </div>
          {transferError && <div className="alert alert-danger">{transferError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleTransferTickets}>
            Transférer les tickets
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;