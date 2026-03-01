package org.eagerultras.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "stadiums")
@Data
public class Stadium {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "city")
    private String city;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @ManyToOne
    @JoinColumn(name = "country_id")
    private Country country;
}
