package com.numisfera.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "coin_images", joinColumns = @JoinColumn(name = "coin_id"))
    @Column(name = "image_url")
    private java.util.List<String> imageUrls = new java.util.ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password" })
    private User owner;
}
