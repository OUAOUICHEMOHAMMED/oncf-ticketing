import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./custom-colors.css";
import "./Modal.css";
import TicketModal from "./TicketModal";
import UserModal from "./UserModal";
import LoginPage from "./LoginPage";
import { Modal, Overlay, Popover, Form } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPlus, faUserPlus, faSort, faSortUp, faSortDown, faBars } from '@fortawesome/free-solid-svg-icons';
import AdminPage from './admin/AdminPage';

function App() {
  // Initialisation de l'état depuis localStorage
  const getLocal = (key, def = "") => localStorage.getItem(key) || def;
  const [username, setUsername] = useState(getLocal("username"));
  const [password, setPassword] = useState(getLocal("password"));
  const [isLogged, setIsLogged] = useState(getLocal("isLogged") === "true");
  const [loginError, setLoginError] = useState("");
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userRole, setUserRole] = useState(getLocal("userRole"));
  const [search, setSearch] = useState("");
  // const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" }); // Variables non utilisées
  // const [currentPage, setCurrentPage] = useState(1); // Variable non utilisée
  // const itemsPerPage = 10; // Variable non utilisée
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

  // Remplace le tableau des tickets utilisateur par un tableau avancé
  const [ticketItemsPerPage, setTicketItemsPerPage] = useState(10);
  const [ticketCurrentPage, setTicketCurrentPage] = useState(1);
  const [ticketSortConfig, setTicketSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [ticketColumnFilters, setTicketColumnFilters] = useState({});
  const [ticketFilterTypes, setTicketFilterTypes] = useState({});
  const [ticketPopoverCol, setTicketPopoverCol] = useState(null);
  const ticketPopoverRefs = {
    id: useRef(null), titre: useRef(null), etat: useRef(null), user: useRef(null), type: useRef(null), famille: useRef(null), operateur: useRef(null), nature: useRef(null), equipement: useRef(null), ligne: useRef(null), priorite: useRef(null), description: useRef(null)
  };
  const ticketFilterTypeOptions = [
    { value: 'contains', label: 'Contient' },
    { value: 'equals', label: 'Égal à' },
    { value: 'starts', label: 'Commence par' },
  ];
  const ticketColumns = [
    { key: 'id', label: 'ID' },
    { key: 'titre', label: 'Titre' },
    { key: 'etat', label: 'État' },
    { key: 'user', label: 'Créé par' },
    { key: 'type', label: 'Type' },
    { key: 'famille', label: 'Famille' },
    { key: 'operateur', label: 'Opérateur' },
    { key: 'nature', label: 'Nature' },
    { key: 'equipement', label: 'Équipement' },
    { key: 'ligne', label: 'Ligne' },
    { key: 'priorite', label: 'Priorité' },
    { key: 'description', label: 'Description' },
  ];
  const ticketFiltered = tickets.filter(ticket => {
    return Object.entries(ticketColumnFilters).every(([key, value]) => {
      if (!value) return true;
      const type = ticketFilterTypes[key] || 'contains';
      let field = key === 'user' ? (ticket.user?.username || '') : (ticket[key] || '');
      field = field.toString().toLowerCase();
      const val = value.toLowerCase();
      if (type === 'contains') return field.includes(val);
      if (type === 'equals') return field === val;
      if (type === 'starts') return field.startsWith(val);
      return true;
    });
  });
  const ticketSorted = [...ticketFiltered].sort((a, b) => {
    let aValue = a[ticketSortConfig.key];
    let bValue = b[ticketSortConfig.key];
    if (ticketSortConfig.key === 'user') {
      aValue = a.user?.username || '';
      bValue = b.user?.username || '';
    }
    if (aValue < bValue) return ticketSortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return ticketSortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  const ticketPageCount = Math.ceil(ticketSorted.length / ticketItemsPerPage);
  const ticketPaginated = ticketSorted.slice((ticketCurrentPage - 1) * ticketItemsPerPage, ticketCurrentPage * ticketItemsPerPage);
  const handleTicketSort = (key, direction = null) => {
    let dir = direction;
    if (!dir) {
      dir = 'asc';
      if (ticketSortConfig.key === key && ticketSortConfig.direction === 'asc') dir = 'desc';
    }
    setTicketSortConfig({ key, direction: dir });
  };
  const handleTicketFilterChange = (key, value) => {
    setTicketColumnFilters(f => ({ ...f, [key]: value }));
    setTicketCurrentPage(1);
  };
  const handleTicketFilterTypeChange = (key, value) => {
    setTicketFilterTypes(f => ({ ...f, [key]: value }));
  };
  const handleTicketClearSort = () => {
    setTicketSortConfig({ key: 'id', direction: 'desc' });
  };
  const renderTicketSortIcon = (key) => {
    if (ticketSortConfig.key !== key) return <FontAwesomeIcon icon={faSort} className="ms-1 text-secondary" />;
    return ticketSortConfig.direction === 'asc'
      ? <FontAwesomeIcon icon={faSortUp} className="ms-1 text-primary" />
      : <FontAwesomeIcon icon={faSortDown} className="ms-1 text-primary" />;
  };
  const renderTicketFilterPopover = (col) => (
    <Popover id={`popover-${col}`}>
      <Popover.Body>
        <Form.Group className="mb-2">
          <Form.Label visuallyHidden>Type de filtre</Form.Label>
          <Form.Select size="sm" value={ticketFilterTypes[col] || 'contains'} onChange={e => handleTicketFilterTypeChange(col, e.target.value)}>
            {ticketFilterTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label visuallyHidden>Valeur</Form.Label>
          <Form.Control size="sm" placeholder="Filtrer..." value={ticketColumnFilters[col] || ''} onChange={e => handleTicketFilterChange(col, e.target.value)} />
        </Form.Group>
        <div className="d-flex flex-column gap-1">
          <Button variant="outline-primary" size="sm" onClick={() => handleTicketSort(col, 'asc')}><FontAwesomeIcon icon={faSortUp} className="me-1" /> Sort Ascending</Button>
          <Button variant="outline-primary" size="sm" onClick={() => handleTicketSort(col, 'desc')}><FontAwesomeIcon icon={faSortDown} className="me-1" /> Sort Descending</Button>
          <Button variant="outline-secondary" size="sm" onClick={handleTicketClearSort}><FontAwesomeIcon icon={faSort} className="me-1" /> Clear sort</Button>
        </div>
      </Popover.Body>
    </Popover>
  );

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8080",
    auth: isLogged ? { username, password } : undefined,
  });

  // Sauvegarde dans localStorage à la connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.get("http://localhost:8080/api/tickets", {
        auth: { username, password },
      });
      setIsLogged(true);
      setLoginError("");
      localStorage.setItem("isLogged", "true");
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      fetchTickets(username, password);
      const userRes = await axios.get("http://localhost:8080/api/users/me", {
        auth: { username, password },
      });
      setUserRole(userRes.data.role);
      localStorage.setItem("userRole", userRes.data.role);
    } catch (err) {
      setLoginError("Identifiants invalides ou erreur serveur.");
    }
  };

  const fetchTickets = async (u = username, p = password) => {
    // setLoading(true); // Variable non utilisée
    try {
      const res = await axios.get("http://localhost:8080/api/tickets", {
        auth: { username: u, password: p },
      });
      setTickets(res.data);
    } catch (err) {
      setTickets([]);
    }
    // setLoading(false); // Variable non utilisée
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
    localStorage.removeItem("isLogged");
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("userRole");
  };

  useEffect(() => {
    if (isLogged) fetchTickets();
    // eslint-disable-next-line
  }, [isLogged]);

  // Synchronise userRole dans localStorage si modifié (ex: édition profil)
  useEffect(() => {
    if (isLogged && userRole) {
      localStorage.setItem("userRole", userRole);
    }
  }, [userRole, isLogged]);

  // Recherche et tri
  // const filteredTickets = tickets.filter(ticket => // Variable non utilisée
  //   Object.values(ticket)
  //     .join(" ")
  //     .toLowerCase()
  //     .includes(search.toLowerCase()) ||
  //   (ticket.user && ticket.user.username && ticket.user.username.toLowerCase().includes(search.toLowerCase()))
  // );

  // Pagination
  // const pageCount = Math.ceil(sortedTickets.length / itemsPerPage); // Variable non utilisée
  // const paginatedTickets = sortedTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage); // Variable non utilisée

  // const handleSort = (key) => { // Fonction non utilisée
  //   let direction = "asc";
  //   if (sortConfig.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   }
  //   setSortConfig({ key, direction });
  // };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // setCurrentPage(1); // Variable currentPage n'existe plus
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

  // Affichage conditionnel : admin dashboard ou login classique
  if (isLogged && userRole === "ADMIN") {
    return <AdminPage onLogout={handleLogout} currentUsername={username} />;
  }

  return (
    <div className="container mt-5 app-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>ONCF TicketPro</h2>
        <Button variant="outline-danger" onClick={handleLogout}>Déconnexion</Button>
      </div>
      <Button className="mb-3" onClick={() => openModal()}>
        <FontAwesomeIcon icon={faPlus} className="me-2" />
        Nouveau Ticket
      </Button>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      <div className="table-responsive w-100">
        <div className="d-flex justify-content-between align-items-center px-3 pt-3">
          <div className="d-flex align-items-center gap-2">
            <select className="form-select form-select-sm w-auto" value={ticketItemsPerPage} onChange={e => { setTicketItemsPerPage(Number(e.target.value)); setTicketCurrentPage(1); }}>
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="ms-2">entries per page</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="me-2">Search:</span>
            <input
              type="text"
              className="form-control form-control-sm w-auto"
              placeholder="Rechercher..."
              value={search}
              onChange={e => { setSearch(e.target.value); setTicketCurrentPage(1); }}
            />
          </div>
        </div>
        <table className="table table-bordered align-middle mb-0 mt-2 w-100">
          <thead className="table-light align-middle">
            <tr>
              {ticketColumns.map(col => (
                <th key={col.key} style={{ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', minWidth: col.key === 'id' ? 50 : col.key === 'equipement' ? 70 : 90, width: col.key === 'id' ? 50 : col.key === 'equipement' ? 70 : undefined, maxWidth: col.key === 'equipement' ? 70 : undefined, overflow: col.key === 'equipement' ? 'hidden' : undefined, textOverflow: col.key === 'equipement' ? 'ellipsis' : undefined }}>
                  <div>{col.label}</div>
                  <div className="d-flex justify-content-center align-items-center mt-1" style={{gap: '0.3rem'}}>
                    <span style={{fontSize: '1rem', cursor: 'pointer'}} onClick={() => handleTicketSort(col.key)}>{renderTicketSortIcon(col.key)}</span>
                    <span ref={ticketPopoverRefs[col.key]} style={{fontSize: '1rem', cursor: 'pointer'}}>
                      <FontAwesomeIcon icon={faBars} className="text-secondary" onClick={e => { e.stopPropagation(); setTicketPopoverCol(ticketPopoverCol === col.key ? null : col.key); }} />
                    </span>
                    <Overlay show={ticketPopoverCol === col.key} target={ticketPopoverRefs[col.key].current} placement="bottom" containerPadding={20} rootClose onHide={() => setTicketPopoverCol(null)}>
                      {renderTicketFilterPopover(col.key)}
                    </Overlay>
                  </div>
                </th>
              ))}
              <th className="text-center" style={{ fontWeight: 'bold', verticalAlign: 'middle' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ticketPaginated.length === 0 ? (
              <tr><td colSpan={ticketColumns.length + 1} className="text-center">Aucun ticket à afficher.</td></tr>
            ) : ticketPaginated.map((ticket) => (
              <tr key={ticket.id}>
                {ticketColumns.map(col => (
                  <td key={col.key} style={{ textAlign: 'center', maxWidth: col.key === 'equipement' ? 70 : undefined, overflow: col.key === 'equipement' ? 'hidden' : undefined, textOverflow: col.key === 'equipement' ? 'ellipsis' : undefined }}>
                    {col.key === 'user' ? (ticket.user ? ticket.user.username : 'N/A') : ticket[col.key]}
                  </td>
                ))}
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
                    {/* Pas de suppression si pas admin */}
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
        {ticketPageCount > 1 && (
          <nav className="mt-2">
            <ul className="pagination justify-content-center mb-0">
              <li className={`page-item${ticketCurrentPage === 1 ? " disabled" : ""}`}>
                <button className="page-link" onClick={() => setTicketCurrentPage(ticketCurrentPage - 1)} disabled={ticketCurrentPage === 1}>&laquo;</button>
              </li>
              {[...Array(ticketPageCount)].map((_, idx) => (
                <li key={idx + 1} className={`page-item${ticketCurrentPage === idx + 1 ? " active" : ""}`}>
                  <button className="page-link" onClick={() => setTicketCurrentPage(idx + 1)}>{idx + 1}</button>
                </li>
              ))}
              <li className={`page-item${ticketCurrentPage === ticketPageCount ? " disabled" : ""}`}>
                <button className="page-link" onClick={() => setTicketCurrentPage(ticketCurrentPage + 1)} disabled={ticketCurrentPage === ticketPageCount}>&raquo;</button>
              </li>
            </ul>
          </nav>
        )}
      </div>
      {/* Pagination supprimée ici (déjà gérée en bas du tableau) */}
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
          {/* Bouton Ajouter utilisateur */}
          <div className="mb-3 d-flex justify-content-end">
            <Button variant="success" onClick={() => setShowUserModal(true)}>
              <FontAwesomeIcon icon={faUserPlus} className="me-2" />
              Ajouter utilisateur
            </Button>
          </div>
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