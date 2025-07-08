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

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Constructeur par défaut
    public Ticket() {}

    // Constructeur avec paramètres
    public Ticket(String titre, String description, String statut, String priorite) {
        this.titre = titre;
        this.description = description;
        this.statut = statut;
        this.priorite = priorite;
    }

    // Getters et Setters
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

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}