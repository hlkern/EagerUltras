package org.eagerultras.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "notifications_seen_at")
    private LocalDateTime notificationsSeenAt;

  // @OneToMany(mappedBy = "user")
  //  private List<UserStadium> visitedStadiums;
}
