package com.testModule.TestModule.Model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Ghi nhan 1 nguoi dung da dang ky 1 mua giai (moi nguoi chi dang ky 1 lan / mua)
@Entity
@Table(name = "season_registrations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "season_id"}))
public class SeasonRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "season_id")
    private Season season;

    @Column(nullable = false)
    private LocalDateTime registeredAt = LocalDateTime.now();

    // JPA bat buoc co constructor rong
    protected SeasonRegistration() {
    }

    public SeasonRegistration(User user, Season season) {
        this.user = user;
        this.season = season;
    }

    public Long getId() { return id; }

    public User getUser() { return user; }

    public Season getSeason() { return season; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
}
