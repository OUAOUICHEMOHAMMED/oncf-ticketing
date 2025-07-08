import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const etats = ["Clos", "En Cours", "Gelé"];
const types = ["Incident", "Vandalisme", "Support"];
const familles = ["Alimentation", "Deconnexion", "Trans_IP", "FO", "Téléphonie_Ferroviaire", "Environnement", "BSS_Radio", "Supervision", "Core", "GPS"];
const operateurs = ["NOC_TELECOM", "PC_TELECOM", "GNOC_Radio", "GNOC_Tans", "GNOC_Core"];
const natures = ["Critique", "Avertissement", "Mineur", "Majeur"];
const equipements = ["Interne", "GSMR", "SDH", "Coupure", "Dispatcher", "BOX", "Clim", "Switch", "BSC", "PCF", "BTS", "NCET"];
const lignes = ["Benguerir_Safi", "Casa_Jorf_Jadida", "Casa_Kenitra", "Casa_Marrakech", "Elaidi_OuedZem", "Fes_Oujda", "Kenitra_Fes", "LGV", "Non_Specifie", "PCC_BaseTravaux", "Rabat_Casa", "Rabat_SidiKacem", "S.Yahya_M.Belksiri", "Settat_Marrakech", "SidiELAidi_Marrakech", "SidiKacem_Fes", "Tanger_SidiKacem", "Tanger_TangerMed", "Taourirt_Nador"];
const priorites = ["Haute", "Moyenne", "Basse"];

function TicketModal({ show, onHide, onSave, ticket }) {
  const [form, setForm] = useState(
    ticket || {
      etat: "",
      type: "",
      famille: "",
      operateur: "",
      nature: "",
      equipement: "",
      ligne: "",
      priorite: "",
      titre: "",
      description: ""
    }
  );

  React.useEffect(() => {
    setForm(
      ticket || {
        etat: "",
        type: "",
        famille: "",
        operateur: "",
        nature: "",
        equipement: "",
        ligne: "",
        priorite: "",
        titre: "",
        description: ""
      }
    );
  }, [ticket, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm({
      etat: "",
      type: "",
      famille: "",
      operateur: "",
      nature: "",
      equipement: "",
      ligne: "",
      priorite: "",
      titre: "",
      description: ""
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{ticket ? "Modifier un ticket" : "Créer un ticket"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>État</Form.Label>
            <Form.Select name="etat" value={form.etat} onChange={handleChange} required>
              <option value="">Sélectionner l'état</option>
              {etats.map(e => <option key={e} value={e}>{e}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Type</Form.Label>
            <Form.Select name="type" value={form.type} onChange={handleChange} required>
              <option value="">Sélectionner le type</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Famille d'équipement</Form.Label>
            <Form.Select name="famille" value={form.famille} onChange={handleChange} required>
              <option value="">Sélectionner la famille</option>
              {familles.map(f => <option key={f} value={f}>{f}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Opérateur</Form.Label>
            <Form.Select name="operateur" value={form.operateur} onChange={handleChange} required>
              <option value="">Sélectionner l'opérateur</option>
              {operateurs.map(o => <option key={o} value={o}>{o}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Nature Incident</Form.Label>
            <Form.Select name="nature" value={form.nature} onChange={handleChange} required>
              <option value="">Sélectionner la nature</option>
              {natures.map(n => <option key={n} value={n}>{n}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Équipement</Form.Label>
            <Form.Select name="equipement" value={form.equipement} onChange={handleChange} required>
              <option value="">Sélectionner l'équipement</option>
              {equipements.map(eq => <option key={eq} value={eq}>{eq}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Ligne</Form.Label>
            <Form.Select name="ligne" value={form.ligne} onChange={handleChange} required>
              <option value="">Sélectionner la ligne</option>
              {lignes.map(l => <option key={l} value={l}>{l}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Priorité</Form.Label>
            <Form.Select name="priorite" value={form.priorite} onChange={handleChange} required>
              <option value="">Sélectionner la priorité</option>
              {priorites.map(p => <option key={p} value={p}>{p}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Titre</Form.Label>
            <Form.Control name="titre" value={form.titre} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" name="description" value={form.description} onChange={handleChange} required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Annuler</Button>
          <Button variant="primary" type="submit">{ticket ? "Enregistrer" : "Créer"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default TicketModal;