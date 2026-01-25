package com.example.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // ✅ Single encoder instance
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ================= REGISTER =================
    public User register(User user) {

        // 🔐 Encode password before saving
        user.setPassword(encoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    // ================= LOGIN =================
    public User login(String email, String password) {

        // 1️⃣ Check email exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // 2️⃣ Check password
        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // 3️⃣ Return user (with role)
        return user;
    }
}
