package com.project.anyplace.wishlist.repository;

import com.project.anyplace.wishlist.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    Page<Wishlist> findByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndSpaceId(Long userId, Long spaceId);

    void deleteByUserIdAndSpaceId(Long userId, Long spaceId);

    @Query("SELECT w.space.id FROM Wishlist w WHERE w.user.id = :userId")
    List<Long> findSpaceIdsByUserId(@Param("userId") Long userId);
}