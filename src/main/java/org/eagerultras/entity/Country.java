package org.eagerultras.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "countries")
@Data
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "code")
    private String code;

  //  @OneToMany(mappedBy = "country")
   // private List<Stadium> stadiums;
}
