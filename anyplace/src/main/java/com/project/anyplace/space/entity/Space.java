package com.project.anyplace.space.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Space {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long hostId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false)
    private int pricePerHour;

    @Column(length = 255)
    private String mainImageUrl;

    @ElementCollection
    @CollectionTable(name = "anyplace_images", joinColumns = @JoinColumn(name = "anyplace_id"))
    @Column(name = "image_url", length = 255)
    private List<String> imageUrls;

    @ElementCollection
    @CollectionTable(name = "anyplace_facilities", joinColumns = @JoinColumn(name = "anyplace_id"))
    @Column(name = "facility", length = 100)
    private List<String> facilities;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}