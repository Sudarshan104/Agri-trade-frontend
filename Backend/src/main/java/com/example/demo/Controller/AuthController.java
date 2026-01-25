package com.example.demo.Controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.services.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserService userService;

    // REGISTER
    @PostMapping("/register")
    public User register(@RequestBody User user) {

        // 🔐 Security: prevent ADMIN registration from fronted
        if (user.getRole() == Role.ADMIN || user.getRole() == null) {
            user.setRole(Role.FARMER);
        }

        return userService.register(user);
    }


    // LOGIN
    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> data) {
        return userService.login(
                data.get("email"),
                data.get("password")
        );
    }
}
