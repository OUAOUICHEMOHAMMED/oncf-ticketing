import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import UserTable from './UserTable';
import TicketTable from './TicketTable';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';

const username = localStorage.getItem('username');
const password = localStorage.getItem('password');
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  auth: { username, password }
});

function AdminPage({ onLogout }) {
  const [current, setCurrent] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ totalTickets: 0, openTickets: 0, totalUsers: 0, adminUsers: 0, newTickets: 0 });

  // Modale édition utilisateur
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ username: '', role: 'USER' });
  const [editUserError, setEditUserError] = useState("");

  // Modale confirmation suppression utilisateur
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  // Modale édition ticket
  const [showEditTicket, setShowEditTicket] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [editTicketForm, setEditTicketForm] = useState({});
  const [editTicketError, setEditTicketError] = useState("");

  // Modale confirmation suppression ticket
  const [showDeleteTicket, setShowDeleteTicket] = useState(false);
  const [deleteTicket, setDeleteTicket] = useState(null);

  // Modale création utilisateur
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ username: '', password: '', email: '', role: 'USER' });
  const [addUserError, setAddUserError] = useState("");

  // État pour la modale de transfert de tickets
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [userToTransfer, setUserToTransfer] = useState(null);
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferError, setTransferError] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/api/users');
      setUsers(res.data);
      setStats(s => ({ ...s, totalUsers: res.data.length, adminUsers: res.data.filter(u => u.role === 'ADMIN').length }));
    } catch (e) {
      setUsers([]);
    }
  };

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const res = await axiosInstance.get('/api/tickets');
      setTickets(res.data);
      setStats(s => ({
        ...s,
        totalTickets: res.data.length,
        openTickets: res.data.filter(t => t.etat && t.etat.toLowerCase() !== 'clos').length,
        newTickets: res.data.filter(t => t.etat && t.etat.toLowerCase() === 'nouveau').length
      }));
    } catch (e) {
      setTickets([]);
      setStats(s => ({ ...s, totalTickets: 0, openTickets: 0, newTickets: 0 }));
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTickets();
  }, []);

  // Actions utilisateur
  const handleEditUser = (user) => {
    setEditUser(user);
    setEditUserForm({ username: user.username, email: user.email || '', role: user.role });
    setEditUserError("");
    setShowEditUser(true);
  };
  const handleSaveEditUser = async () => {
    try {
      await axiosInstance.put(`/api/users/${editUser.id}`, { ...editUserForm, email: editUserForm.email });
      setShowEditUser(false);
      fetchUsers();
    } catch (err) {
      setEditUserError("Erreur lors de la modification de l'utilisateur.");
    }
  };
  const handleDeleteUserConfirm = (user) => {
    setDeleteUser(user);
    setShowDeleteUser(true);
  };
  const handleDeleteUserFinal = async () => {
    try {
      await axiosInstance.delete(`/api/users/${deleteUser.id}`);
      setShowDeleteUser(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (msg.includes("tickets associés")) {
        setUserToTransfer(deleteUser);
        setShowDeleteUser(false);
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
      fetchUsers();
      alert("Transfert et suppression effectués avec succès.");
    } catch (err) {
      setTransferError("Erreur lors du transfert : " + (err.response?.data?.message || err.message));
    }
  };

  // Actions ticket
  const handleEditTicket = (ticket) => {
    setEditTicket(ticket);
    setEditTicketForm({ ...ticket });
    setEditTicketError("");
    setShowEditTicket(true);
  };
  const handleSaveEditTicket = async () => {
    try {
      await axiosInstance.put(`/api/tickets/${editTicket.id}`, editTicketForm);
      setShowEditTicket(false);
      fetchTickets();
    } catch (err) {
      setEditTicketError("Erreur lors de la modification du ticket.");
    }
  };
  const handleDeleteTicketConfirm = (ticket) => {
    setDeleteTicket(ticket);
    setShowDeleteTicket(true);
  };
  const handleDeleteTicketFinal = async () => {
    try {
      await axiosInstance.delete(`/api/tickets/${deleteTicket.id}`);
      setShowDeleteTicket(false);
      fetchTickets();
    } catch (err) {
      alert("Erreur lors de la suppression du ticket : " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddUser = () => {
    setAddUserForm({ username: '', password: '', email: '', role: 'USER' });
    setAddUserError("");
    setShowAddUser(true);
  };
  const handleSaveAddUser = async () => {
    try {
      await axiosInstance.post('/api/users', addUserForm);
      setShowAddUser(false);
      fetchUsers();
    } catch (err) {
      setAddUserError("Erreur lors de la création de l'utilisateur.");
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar current={current} onNavigate={setCurrent} onLogout={onLogout} />
      <div className="flex-grow-1 bg-light">
        <div className="container-fluid py-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Dashboard Admin</h2>
          </div>
          {current === 'dashboard' && <Dashboard {...stats} />}
          {current === 'users' && <UserTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUserConfirm} onAdd={handleAddUser} />}
          {current === 'tickets' && <TicketTable tickets={tickets} users={users} onEdit={handleEditTicket} onDelete={handleDeleteTicketConfirm} />}
        </div>
      </div>

      {/* Modale édition utilisateur */}
      <Modal show={showEditUser} onHide={() => setShowEditUser(false)}>
        <Modal.Header closeButton><Modal.Title>Modifier utilisateur</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nom d'utilisateur</Form.Label>
            <Form.Control value={editUserForm.username} onChange={e => setEditUserForm(f => ({ ...f, username: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={editUserForm.email || ''} onChange={e => setEditUserForm(f => ({ ...f, email: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Rôle</Form.Label>
            <Form.Select value={editUserForm.role} onChange={e => setEditUserForm(f => ({ ...f, role: e.target.value }))}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </Form.Select>
          </Form.Group>
          {editUserError && <div className="alert alert-danger">{editUserError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditUser(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleSaveEditUser}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      {/* Modale confirmation suppression utilisateur */}
      <Modal show={showDeleteUser} onHide={() => setShowDeleteUser(false)}>
        <Modal.Header closeButton><Modal.Title>Supprimer utilisateur</Modal.Title></Modal.Header>
        <Modal.Body>Confirmer la suppression de l'utilisateur <b>{deleteUser?.username}</b> ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteUser(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDeleteUserFinal}>Supprimer</Button>
        </Modal.Footer>
      </Modal>

      {/* Modale édition ticket */}
      <Modal show={showEditTicket} onHide={() => setShowEditTicket(false)}>
        <Modal.Header closeButton><Modal.Title>Modifier ticket</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Titre</Form.Label>
            <Form.Control value={editTicketForm.titre || ''} onChange={e => setEditTicketForm(f => ({ ...f, titre: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" value={editTicketForm.description || ''} onChange={e => setEditTicketForm(f => ({ ...f, description: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>État</Form.Label>
            <Form.Control value={editTicketForm.etat || ''} onChange={e => setEditTicketForm(f => ({ ...f, etat: e.target.value }))} />
          </Form.Group>
          {/* Ajoute d'autres champs si besoin */}
          {editTicketError && <div className="alert alert-danger">{editTicketError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditTicket(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleSaveEditTicket}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      {/* Modale confirmation suppression ticket */}
      <Modal show={showDeleteTicket} onHide={() => setShowDeleteTicket(false)}>
        <Modal.Header closeButton><Modal.Title>Supprimer ticket</Modal.Title></Modal.Header>
        <Modal.Body>Confirmer la suppression du ticket <b>{deleteTicket?.titre}</b> ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteTicket(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDeleteTicketFinal}>Supprimer</Button>
        </Modal.Footer>
      </Modal>

      {/* Modale création utilisateur */}
      <Modal show={showAddUser} onHide={() => setShowAddUser(false)}>
        <Modal.Header closeButton><Modal.Title>Ajouter utilisateur</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nom d'utilisateur</Form.Label>
            <Form.Control value={addUserForm.username} onChange={e => setAddUserForm(f => ({ ...f, username: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={addUserForm.email} onChange={e => setAddUserForm(f => ({ ...f, email: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control type="password" value={addUserForm.password} onChange={e => setAddUserForm(f => ({ ...f, password: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Rôle</Form.Label>
            <Form.Select value={addUserForm.role} onChange={e => setAddUserForm(f => ({ ...f, role: e.target.value }))}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </Form.Select>
          </Form.Group>
          {addUserError && <div className="alert alert-danger">{addUserError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddUser(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleSaveAddUser}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      {/* Modale de transfert de tickets */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Transférer les tickets de {userToTransfer?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Label>Transférer les tickets vers :</Form.Label>
            <Form.Select
              value={transferTargetId}
              onChange={e => setTransferTargetId(e.target.value)}
            >
              <option value="">-- Sélectionner un utilisateur --</option>
              {users.filter(u => u.id !== userToTransfer?.id).map(u => (
                <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
              ))}
            </Form.Select>
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

export default AdminPage; 