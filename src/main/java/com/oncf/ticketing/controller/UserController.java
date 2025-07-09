package com.oncf.ticketing.controller;

import com.oncf.ticketing.model.User;
import com.oncf.ticketing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;


import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Créer un nouvel utilisateur (admin uniquement)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public User createUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Récupérer la liste de tous les utilisateurs (admin uniquement)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Récupérer un utilisateur par son id (admin uniquement)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id).orElse(null);
    }

    // Modifier un utilisateur (admin uniquement)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            user.setUsername(userDetails.getUsername());
            user.setRole(userDetails.getRole());
            // Ne modifie pas le mot de passe ici
            return userRepository.save(user);
        }
        return null;
    }

    // Supprimer un utilisateur (admin uniquement)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        try {
            userRepository.deleteById(id);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Impossible de supprimer l'utilisateur : il possède des tickets associés.");
        }
    }

    // Transférer les tickets d'un utilisateur à un autre, puis supprimer l'utilisateur source (admin uniquement)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/transfer-tickets")
    public void transferTicketsAndDeleteUser(@PathVariable Long id, @RequestBody TransferRequest request) {
        User source = userRepository.findById(id).orElse(null);
        User target = userRepository.findById(request.getTargetUserId()).orElse(null);
        if (source == null || target == null) throw new RuntimeException("Utilisateur non trouvé");
        // Transférer les tickets
        source.getTickets().forEach(ticket -> ticket.setUser(target));
        userRepository.save(source); // Met à jour les tickets
        userRepository.deleteById(id);
    }

    public static class TransferRequest {
        private Long targetUserId;
        public Long getTargetUserId() { return targetUserId; }
        public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }
    }

    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByUsername(userDetails.getUsername());
    }
}