package com.oncf.ticketing.model;

import javax.persistence.*;
import java.io.Serializable;

@Entity
public class Ticket implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;
    private String statut;    // Exemple: "Nouveau", "En cours", "Résolu"
    private String priorite;  // Exemple: "Haute", "Moyenne", "Basse"

    // Champs supplémentaires pour l'affichage complet
    private String etat;
    private String type;
    private String famille;
    private String operateur;
    private String nature;
    private String equipement;
    private String ligne;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Ticket() {}

    public Ticket(String titre, String description, String statut, String priorite,
                  String etat, String type, String famille, String operateur,
                  String nature, String equipement, String ligne) {
        this.titre = titre;
        this.description = description;
        this.statut = statut;
        this.priorite = priorite;
        this.etat = etat;
        this.type = type;
        this.famille = famille;
        this.operateur = operateur;
        this.nature = nature;
        this.equipement = equipement;
        this.ligne = ligne;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }

    public String getEtat() { return etat; }
    public void setEtat(String etat) { this.etat = etat; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getFamille() { return famille; }
    public void setFamille(String famille) { this.famille = famille; }

    public String getOperateur() { return operateur; }
    public void setOperateur(String operateur) { this.operateur = operateur; }

    public String getNature() { return nature; }
    public void setNature(String nature) { this.nature = nature; }

    public String getEquipement() { return equipement; }
    public void setEquipement(String equipement) { this.equipement = equipement; }

    public String getLigne() { return ligne; }
    public void setLigne(String ligne) { this.ligne = ligne; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}