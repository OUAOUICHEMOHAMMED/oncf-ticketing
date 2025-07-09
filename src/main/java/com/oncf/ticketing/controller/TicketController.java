package com.oncf.ticketing.controller;

import com.oncf.ticketing.model.Ticket;
import com.oncf.ticketing.model.User;
import com.oncf.ticketing.repository.TicketRepository;
import com.oncf.ticketing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllWithUser();
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        // Récupérer l'utilisateur connecté
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username);
        
        // Associer l'utilisateur au ticket
        ticket.setUser(currentUser);
        
        return ticketRepository.save(ticket);
    }

    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable Long id) {
        return ticketRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Ticket updateTicket(@PathVariable Long id, @RequestBody Ticket ticketDetails) {
        Ticket ticket = ticketRepository.findById(id).orElse(null);
        if (ticket != null) {
            ticket.setTitre(ticketDetails.getTitre());
            ticket.setDescription(ticketDetails.getDescription());
            ticket.setStatut(ticketDetails.getStatut());
            ticket.setPriorite(ticketDetails.getPriorite());
            ticket.setEtat(ticketDetails.getEtat());
            ticket.setType(ticketDetails.getType());
            ticket.setFamille(ticketDetails.getFamille());
            ticket.setOperateur(ticketDetails.getOperateur());
            ticket.setNature(ticketDetails.getNature());
            ticket.setEquipement(ticketDetails.getEquipement());
            ticket.setLigne(ticketDetails.getLigne());
            return ticketRepository.save(ticket);
        }
        return null;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteTicket(@PathVariable Long id) {
        ticketRepository.deleteById(id);
    }
}