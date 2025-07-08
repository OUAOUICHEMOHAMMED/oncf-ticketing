package com.oncf.ticketing.repository;


import com.oncf.ticketing.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}
