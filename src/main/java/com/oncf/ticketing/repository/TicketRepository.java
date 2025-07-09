package com.oncf.ticketing.repository;


import com.oncf.ticketing.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.user")
    List<Ticket> findAllWithUser();
}
