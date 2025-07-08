import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  // Authentification
  const [auth, setAuth] = useState({ username: "", password: "" });
  const [isLogged, setIsLogged] = useState(false);

  // Tickets
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ titre: "", description: "", statut: "", priorite: "" });
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Config pour axios (auth dynamique)
  const config = {
    auth: {
      username: auth.username,
      password: auth.password
    }
  };

  // Charger les tickets après connexion
  useEffect(() => {
    if (isLogged) {
      fetchTickets();
    }
    // eslint-disable-next-line
  }, [isLogged]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/tickets", config);
      setTickets(res.data);
    } catch (error) {
      setTickets([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`http://localhost:8080/api/tickets/${editId}`, form, config);
        setEditing(false);
        setEditId(null);
      } else {
        await axios.post("http://localhost:8080/api/tickets", form, config);
      }
      setForm({ titre: "", description: "", statut: "", priorite: "" });
      fetchTickets();
    } catch (error) {
      alert("Erreur lors de la création ou modification du ticket !");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/tickets/${id}`, config);
      fetchTickets();
    } catch (error) {
      alert("Erreur lors de la suppression !");
    }
  };

  const handleEdit = (ticket) => {
    setEditing(true);
    setEditId(ticket.id);
    setForm({
      titre: ticket.titre,
      description: ticket.description,
      statut: ticket.statut,
      priorite: ticket.priorite
    });
  };

  // Formulaire de connexion
  if (!isLogged) {
    return (
      <div className="container mt-5">
        <form
          onSubmit={async e => {
            e.preventDefault();
            try {
              await axios.get("http://localhost:8080/api/tickets", {
                auth: {
                  username: auth.username,
                  password: auth.password
                }
              });
              setIsLogged(true);
            } catch (error) {
              alert("Nom d'utilisateur ou mot de passe incorrect !");
            }
          }}
          className="mb-4 p-4 border rounded bg-light"
          style={{ maxWidth: 400, margin: "auto" }}
        >
          <h3>Connexion</h3>
          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Nom d'utilisateur"
              value={auth.username}
              onChange={e => setAuth({ ...auth, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <input
              className="form-control"
              type="password"
              placeholder="Mot de passe"
              value={auth.password}
              onChange={e => setAuth({ ...auth, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Se connecter</button>
        </form>
      </div>
    );
  }

  // Interface tickets (après connexion)
  return (
    <div className="container mt-5">
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => {
          setIsLogged(false);
          setAuth({ username: "", password: "" });
          setTickets([]);
        }}
      >
        Déconnexion
      </button>
      <h1 className="mb-4">Tickets ONCF</h1>
      <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-light">
        <div className="mb-3">
          <input className="form-control" name="titre" placeholder="Titre" value={form.titre} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <input className="form-control" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <input className="form-control" name="statut" placeholder="Statut" value={form.statut} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <input className="form-control" name="priorite" placeholder="Priorité" value={form.priorite} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">
          {editing ? "Enregistrer les modifications" : "Créer Ticket"}
        </button>
        {editing && (
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => {
              setEditing(false);
              setEditId(null);
              setForm({ titre: "", description: "", statut: "", priorite: "" });
            }}
          >
            Annuler
          </button>
        )}
      </form>
      <h2 className="mb-3">Liste des tickets</h2>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Statut</th>
            <th>Priorité</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.titre}</td>
              <td>{ticket.description}</td>
              <td>{ticket.statut}</td>
              <td>{ticket.priorite}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(ticket)}>Modifier</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ticket.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;