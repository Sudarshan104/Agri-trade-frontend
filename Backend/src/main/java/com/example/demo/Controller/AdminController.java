package com.example.demo.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Order;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    // ================= USERS =================

    // 🔹 Get all users (Farmers + Retailers)
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔹 Update user details (Admin use)
    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User u) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(u.getName());
        user.setEmail(u.getEmail());
        user.setRole(u.getRole());

        return userRepository.save(user);
    }

    // 🔹 Update user status (ACTIVE / INACTIVE / BLOCKED)
    @PutMapping("/users/{id}/status")
    public User updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(body.get("status"));
        return userRepository.save(user);
    }

    // 🔹 Delete user
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }

    // ================= PROFILE (ADMIN / FARMER / RETAILER) =================

    // 🔹 Get profile by ID
    @GetMapping("/profile/{id}")
    public User getProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // 🔹 Update profile (Name + Address)
    @PutMapping("/profile/{id}")
    public User updateProfile(
            @PathVariable Long id,
            @RequestBody User u) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(u.getName());
        user.setAddress(u.getAddress()); // ✅ IMPORTANT FIX

        return userRepository.save(user);
    }

    // ================= PRODUCTS =================

    // 🔹 Get all products (Admin view)
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 🔹 Update product
    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product p) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(p.getName());
        product.setPrice(p.getPrice());
        product.setQuantity(p.getQuantity());

        return productRepository.save(product);
    }

    // 🔹 Delete product
    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
    }

    // ================= ORDERS =================

    // 🔹 Get all orders
    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
