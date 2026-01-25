package com.example.demo.Controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ================= GET PROFILE =================
    @GetMapping("/{userId}")
    public User getProfile(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ================= UPDATE PROFILE =================
    @PutMapping("/{userId}")
    @Transactional
    public User updateProfile(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> data
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        /* ===== SAFE UPDATES (NO NULL CRASH) ===== */

        if (data.get("name") != null) {
            user.setName(data.get("name").toString());
        }

        // ❌ Do NOT allow email change (recommended)
        // If you REALLY want it, uncomment below
        /*
        if (data.get("email") != null) {
            user.setEmail(data.get("email").toString());
        }
        */

        if (data.get("address") != null) {
            user.setAddress(data.get("address").toString());
        }



        return userRepository.save(user);
    }

    // ================= GET USER COUNT =================
    @GetMapping("/count")
    public long getUserCount() {
        return userRepository.count();
    }
}
