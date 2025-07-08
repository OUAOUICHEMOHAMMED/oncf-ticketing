import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function UserModal({ show, onHide, onCreate }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "USER"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(form);
    setForm({ username: "", password: "", role: "USER" });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Créer un utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nom d'utilisateur</Form.Label>
            <Form.Control
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Rôle</Form.Label>
            <Form.Select name="role" value={form.role} onChange={handleChange}>
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Administrateur</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Annuler</Button>
          <Button variant="primary" type="submit">Créer</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default UserModal; 