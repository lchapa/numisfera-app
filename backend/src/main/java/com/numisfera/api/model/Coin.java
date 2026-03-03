package com.numisfera.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "coins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String country;

    @Column(name = "issue_year", nullable = false)
    private Integer year;

    @Column
    private String material;

    @Column(length = 1000)
    private String description;

    @Column
    private String grade;

    @Column
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;
}
