package org.eagerultras.entity;

import jakarta.persistence.*;
import lombok.Data;


import java.time.LocalDate;

@Entity
@Table(name = "user_stadiums")
@Data
public class UserStadium {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "stadium_id")
    private Stadium stadium;

    @Column(name = "visit_date")
    private LocalDate visitDate;
}
