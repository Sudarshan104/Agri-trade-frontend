package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Review;   // 🔥 THIS LINE FIXES YOUR ERROR

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("""
        SELECT r FROM Review r
        JOIN r.product p
        WHERE p.farmer.id = :farmerId
    """)
    List<Review> findByFarmerId(@Param("farmerId") Long farmerId);

    List<Review> findByProductId(Long productId);
}
