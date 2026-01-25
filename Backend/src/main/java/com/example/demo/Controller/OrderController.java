package com.example.demo.Controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Notification;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderStatus;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.services.EmailService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    // ✅ Helper method: always compute total amount safely
    private double calculateTotalAmount(Order order) {
        if (order == null) return 0.0;
        if (order.getProduct() == null) return 0.0;
        if (order.getProduct().getPrice() == null) return 0.0;

        int qty = order.getQuantity();
        if (qty <= 0) return 0.0;

        return order.getProduct().getPrice() * qty;
    }

    // ✅ Helper: ensure total amount always set
    private void ensureTotalAmount(Order order) {
        if (order == null) return;

        Double current = order.getTotalAmount();
        if (current == null || current <= 0) {
            order.setTotalAmount(calculateTotalAmount(order));
        }
    }

    // ================= PLACE ORDER =================
    @PostMapping
    @Transactional
    public Map<String, Object> placeOrder(@RequestBody Map<String, Object> data) {

        Long productId = Long.parseLong(data.get("productId").toString());
        Long retailerId = Long.parseLong(data.get("retailerId").toString());
        int qty = Integer.parseInt(data.get("quantity").toString());

        if (qty <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getQuantity() < qty) {
            throw new RuntimeException("Insufficient stock");
        }

        User retailer = userRepository.findById(retailerId)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));

        // ✅ Reduce stock immediately
        product.setQuantity(product.getQuantity() - qty);
        productRepository.save(product);

        // ✅ Create order
        Order order = new Order();
        order.setProduct(product);
        order.setRetailer(retailer);
        order.setQuantity(qty);
        order.setStatus(OrderStatus.PLACED);
        order.setOrderDate(LocalDateTime.now());
        order.setPaymentStatus("PENDING");

        // ✅ Always set totalAmount
        ensureTotalAmount(order);

        Order savedOrder = orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", savedOrder.getId());
        response.put("totalAmount", savedOrder.getTotalAmount());
        response.put("productName", product.getName());
        response.put("quantity", qty);

        return response;
    }

    // ================= RETAILER ORDERS =================
    @GetMapping("/retailer/{retailerId}")
    public List<Order> getRetailerOrders(@PathVariable Long retailerId) {
        return orderRepository.findByRetailerId(retailerId);
    }

    // ================= FARMER ORDERS =================
    @GetMapping("/farmer/{farmerId}")
    public List<Order> getFarmerOrders(@PathVariable Long farmerId) {
        return orderRepository.findByProductFarmerId(farmerId);
    }

    // ================= FARMER CONFIRM STOCK =================
    @PutMapping("/farmer/{orderId}/confirm-stock")
    @Transactional
    public Order confirmStockByFarmer(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> data
    ) {
        Long farmerId = Long.parseLong(data.get("farmerId").toString());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getProduct().getFarmer().getId().equals(farmerId)) {
            throw new RuntimeException("You are not allowed to confirm stock for this order");
        }

        if (order.getStatus() != OrderStatus.PROCESSING) {
            throw new RuntimeException("Order must be in PROCESSING status to confirm stock");
        }

        order.setStatus(OrderStatus.STOCK_CONFIRMED);

        // Notify retailer
        Notification retailerNotification = new Notification();
        retailerNotification.setUserId(order.getRetailer().getId());
        retailerNotification.setMessage("Stock confirmed by farmer for order #" + order.getId());
        retailerNotification.setRead(false);
        retailerNotification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(retailerNotification);

        return orderRepository.save(order);
    }

    // ================= RETAILER EDIT ORDER =================
    @PutMapping("/retailer/{orderId}/edit")
    @Transactional
    public Order editOrderByRetailer(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> data
    ) {
        Long retailerId = Long.parseLong(data.get("retailerId").toString());
        int newQty = Integer.parseInt(data.get("quantity").toString());

        if (newQty <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getRetailer().getId().equals(retailerId)) {
            throw new RuntimeException("You are not allowed to edit this order");
        }

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot edit delivered/cancelled order");
        }

        Product product = order.getProduct();

        int oldQty = order.getQuantity();
        int diff = newQty - oldQty;

        if (diff > 0 && product.getQuantity() < diff) {
            throw new RuntimeException("Insufficient stock to increase quantity");
        }

        // ✅ Update stock accordingly
        product.setQuantity(product.getQuantity() - diff);
        productRepository.save(product);

        // ✅ Update order
        order.setQuantity(newQty);
        order.setStatus(OrderStatus.MODIFIED);

        // ✅ Always update totalAmount
        ensureTotalAmount(order);

        return orderRepository.save(order);
    }

    // ================= RETAILER CANCEL ORDER =================
    @PutMapping("/retailer/{orderId}/cancel")
    @Transactional
    public Order cancelOrderByRetailer(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> data
    ) {
        Long retailerId = Long.parseLong(data.get("retailerId").toString());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getRetailer().getId().equals(retailerId)) {
            throw new RuntimeException("You are not allowed to cancel this order");
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Delivered order cannot be cancelled");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            return order;
        }

        // ✅ Restore stock
        Product product = order.getProduct();
        product.setQuantity(product.getQuantity() + order.getQuantity());
        productRepository.save(product);

        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus("FAILED");

        return orderRepository.save(order);
    }

    // ================= FARMER DASHBOARD SUMMARY =================
    @GetMapping("/farmer/{farmerId}/summary")
    public Map<String, Object> getFarmerDashboardSummary(@PathVariable Long farmerId) {

        Map<String, Object> response = new HashMap<>();

        response.put("totalOrders", orderRepository.countByFarmerId(farmerId));

        response.put(
                "processingOrders",
                orderRepository.countByFarmerIdAndStatusIn(
                        farmerId, List.of(OrderStatus.PLACED, OrderStatus.PROCESSING, OrderStatus.MODIFIED)
                )
        );

        response.put("cancelledOrders",
                orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.CANCELLED));

        response.put("deliveredOrders",
                orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.DELIVERED));

        response.put("totalRevenue",
                orderRepository.sumRevenueByFarmerId(farmerId, OrderStatus.DELIVERED));

        return response;
    }

    // ================= FARMER SALES ANALYTICS =================
    @GetMapping("/farmer/{farmerId}/analytics")
    public Map<String, Object> getFarmerSalesAnalytics(@PathVariable Long farmerId) {
        Map<String, Object> response = new HashMap<>();

        List<Order> completedOrders =
                orderRepository.findByProductFarmerIdAndStatus(farmerId, OrderStatus.DELIVERED);
        response.put("completedTransactions", completedOrders);

        Double totalRevenue = orderRepository.sumRevenueByFarmerId(farmerId, OrderStatus.DELIVERED);
        response.put("totalRevenue", totalRevenue == null ? 0.0 : totalRevenue);

        List<Object[]> monthlyTransactions =
                orderRepository.getMonthlyTransactionCounts(farmerId, OrderStatus.DELIVERED);

        Map<String, Integer> monthlyTransactionData = new HashMap<>();
        String[] monthNames = {"January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};

        for (Object[] row : monthlyTransactions) {
            int monthIndex = ((Number) row[0]).intValue() - 1;
            int count = ((Number) row[1]).intValue();
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyTransactionData.put(monthNames[monthIndex], count);
            }
        }

        response.put("monthlyTransactions", monthlyTransactionData);

        List<Object[]> topProducts = orderRepository.getTopSoldProducts(
                farmerId,
                OrderStatus.DELIVERED,
                PageRequest.of(0, 5)
        );

        List<Map<String, Object>> topProductsData = new java.util.ArrayList<>();
        for (Object[] row : topProducts) {
            Map<String, Object> product = new HashMap<>();
            product.put("name", row[0]);
            product.put("quantity", ((Number) row[1]).intValue());
            topProductsData.add(product);
        }

        response.put("topSoldProducts", topProductsData);

        return response;
    }

    // ================= RETAILER ANALYTICS =================
    @GetMapping("/retailer/{retailerId}/analytics")
    public Map<String, Object> getRetailerAnalytics(@PathVariable Long retailerId) {

        Map<String, Object> response = new HashMap<>();

        long totalOrders = orderRepository.countByRetailerId(retailerId);
        long placedOrders = orderRepository.countByRetailerIdAndStatus(retailerId, OrderStatus.PLACED);
        long modifiedOrders = orderRepository.countByRetailerIdAndStatus(retailerId, OrderStatus.MODIFIED);
        long processingOrders = orderRepository.countByRetailerIdAndStatus(retailerId, OrderStatus.PROCESSING);
        long deliveredOrders = orderRepository.countByRetailerIdAndStatus(retailerId, OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByRetailerIdAndStatus(retailerId, OrderStatus.CANCELLED);

        Double totalSpent = orderRepository.sumRevenueByRetailerId(retailerId, OrderStatus.DELIVERED);
        if (totalSpent == null) totalSpent = 0.0;

        response.put("totalOrders", totalOrders);
        response.put("placedOrders", placedOrders);
        response.put("modifiedOrders", modifiedOrders);
        response.put("processingOrders", processingOrders);
        response.put("deliveredOrders", deliveredOrders);
        response.put("cancelledOrders", cancelledOrders);
        response.put("totalSpent", totalSpent);

        List<Object[]> monthly = orderRepository.getMonthlyRetailerTransactions(retailerId, OrderStatus.DELIVERED);

        Map<String, Integer> monthlyTransactionData = new HashMap<>();
        String[] monthNames = {"January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};

        for (Object[] row : monthly) {
            int monthIndex = ((Number) row[0]).intValue() - 1;
            int count = ((Number) row[1]).intValue();
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyTransactionData.put(monthNames[monthIndex], count);
            }
        }

        response.put("monthlyTransactions", monthlyTransactionData);

        List<Object[]> topProducts = orderRepository.getTopPurchasedProducts(retailerId, OrderStatus.DELIVERED);

        List<Map<String, Object>> topProductsData = new java.util.ArrayList<>();
        for (Object[] row : topProducts) {
            Map<String, Object> product = new HashMap<>();
            product.put("name", row[0]);
            product.put("quantity", ((Number) row[1]).intValue());
            topProductsData.add(product);
        }

        response.put("topPurchasedProducts", topProductsData);

        return response;
    }

    // ================= ADMIN: GET ALL ORDERS =================
    @GetMapping("/admin")
    public List<Order> getAllOrdersForAdmin() {
        return orderRepository.findAll();
    }

    // ================= UPDATE ORDER STATUS (ADMIN) =================
    @PutMapping("/admin/{orderId}/status")
    @Transactional
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> data
    ) {
        try {
            logger.info("Updating order status for orderId: {}", orderId);

            // Validate input
            if (data == null || data.get("status") == null || data.get("status").trim().isEmpty()) {
                logger.error("Invalid status data provided for orderId: {}", orderId);
                return ResponseEntity.badRequest().build();
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Validate status enum value
            OrderStatus newStatus;
            try {
                newStatus = OrderStatus.valueOf(data.get("status"));
            } catch (IllegalArgumentException e) {
                logger.error("Invalid status value: {} for orderId: {}", data.get("status"), orderId);
                return ResponseEntity.badRequest().build();
            }

            // ✅ Validation: Admin can only pack when stock is confirmed by farmer
            if (newStatus == OrderStatus.PACKED && order.getStatus() != OrderStatus.STOCK_CONFIRMED) {
                logger.warn("Cannot pack order {}: Stock not confirmed by farmer", orderId);
                return ResponseEntity.badRequest().build();
            }

            order.setStatus(newStatus);

            // ✅ VERY IMPORTANT: when delivered -> compute total_amount
            if (newStatus == OrderStatus.DELIVERED) {
                ensureTotalAmount(order);
            }

            // Save the order first
            Order savedOrder = orderRepository.save(order);
            logger.info("Order status updated successfully for orderId: {} to status: {}", orderId, newStatus);

            // Notify farmer (with error handling)
            try {
                if (order.getProduct() != null && order.getProduct().getFarmer() != null) {
                    Notification farmerNotification = new Notification();
                    farmerNotification.setUserId(order.getProduct().getFarmer().getId());
                    farmerNotification.setMessage("Order #" + order.getId() + " status updated to " + newStatus);
                    farmerNotification.setRead(false);
                    farmerNotification.setCreatedAt(LocalDateTime.now());
                    notificationRepository.save(farmerNotification);
                    logger.debug("Farmer notification sent for orderId: {}", orderId);
                }
            } catch (Exception e) {
                logger.error("Failed to send farmer notification for orderId: {}", orderId, e);
                // Don't fail the whole operation
            }

            // Notify retailer (with error handling)
            try {
                if (order.getRetailer() != null) {
                    Notification retailerNotification = new Notification();
                    retailerNotification.setUserId(order.getRetailer().getId());
                    retailerNotification.setMessage("Your order #" + order.getId() + " status updated to " + newStatus);
                    retailerNotification.setRead(false);
                    retailerNotification.setCreatedAt(LocalDateTime.now());
                    notificationRepository.save(retailerNotification);
                    logger.debug("Retailer notification sent for orderId: {}", orderId);
                }
            } catch (Exception e) {
                logger.error("Failed to send retailer notification for orderId: {}", orderId, e);
                // Don't fail the whole operation
            }

            // Send emails (with error handling)
            try {
                if (order.getProduct() != null && order.getProduct().getFarmer() != null &&
                    order.getProduct().getFarmer().getEmail() != null) {
                    emailService.sendOrderStatusNotification(
                            order.getProduct().getFarmer().getEmail(),
                            order.getId().toString(),
                            newStatus.toString()
                    );
                    logger.debug("Farmer email sent for orderId: {}", orderId);
                }
            } catch (Exception e) {
                logger.error("Failed to send farmer email for orderId: {}", orderId, e);
                // Don't fail the whole operation
            }

            try {
                if (order.getRetailer() != null && order.getRetailer().getEmail() != null) {
                    emailService.sendOrderStatusNotification(
                            order.getRetailer().getEmail(),
                            order.getId().toString(),
                            newStatus.toString()
                    );
                    logger.debug("Retailer email sent for orderId: {}", orderId);
                }
            } catch (Exception e) {
                logger.error("Failed to send retailer email for orderId: {}", orderId, e);
                // Don't fail the whole operation
            }

            return ResponseEntity.ok(savedOrder);

        } catch (RuntimeException e) {
            logger.error("Runtime error updating order status for orderId: {}", orderId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            logger.error("Unexpected error updating order status for orderId: {}", orderId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ================= CANCEL ORDER (ADMIN) =================
    @PutMapping("/admin/{orderId}/cancel")
    @Transactional
    public Order cancelOrderAdmin(@PathVariable Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            return order;
        }

        Product product = order.getProduct();
        product.setQuantity(product.getQuantity() + order.getQuantity());
        productRepository.save(product);

        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus("FAILED");

        return orderRepository.save(order);
    }

    // ================= ADMIN REVENUE =================
    @GetMapping("/admin/revenue")
    public Map<String, Object> getAdminRevenue() {

        Map<String, Object> response = new HashMap<>();

        Double totalRevenue = orderRepository.getTotalRevenue(OrderStatus.DELIVERED);
        if (totalRevenue == null) totalRevenue = 0.0;

        Double adminCommission = totalRevenue * 0.05;

        response.put("totalRevenue", totalRevenue);
        response.put("adminCommission", adminCommission);

        return response;
    }

    // ================= RETAILER REVENUE =================
    @GetMapping("/retailer/{retailerId}/revenue")
    public Map<String, Object> getRetailerRevenue(@PathVariable Long retailerId) {
        Map<String, Object> response = new HashMap<>();
        Double totalRevenue = orderRepository.sumRevenueByRetailerId(retailerId, OrderStatus.DELIVERED);
        response.put("totalRevenue", totalRevenue == null ? 0.0 : totalRevenue);
        return response;
    }

    // ================= ADMIN ORDER COUNT =================
    @GetMapping("/admin/count")
    public long getOrderCount() {
        Long total = orderRepository.getTotalOrders();
        return total == null ? 0 : total;
    }

    // ✅ ================= FIX OLD ORDERS (IMPORTANT) =================
    // Call this endpoint ONCE to fix old orders having total_amount = NULL
    @GetMapping("/admin/fix-totalamount")
    @Transactional
    public Map<String, Object> fixNullTotalAmount() {

        List<Order> allOrders = orderRepository.findAll();
        int fixed = 0;

        for (Order o : allOrders) {
            if (o.getTotalAmount() == null || o.getTotalAmount() <= 0) {
                if (o.getProduct() != null && o.getProduct().getPrice() != null) {
                    double amount = o.getProduct().getPrice() * o.getQuantity();
                    o.setTotalAmount(amount);
                    fixed++;
                }
            }
        }

        orderRepository.saveAll(allOrders);

        Double totalRevenue = orderRepository.getTotalRevenue(OrderStatus.DELIVERED);
        if (totalRevenue == null) totalRevenue = 0.0;

        Map<String, Object> res = new HashMap<>();
        res.put("message", "✅ totalAmount fixed successfully");
        res.put("fixedOrders", fixed);
        res.put("newTotalRevenue", totalRevenue);
        res.put("newAdminCommission", totalRevenue * 0.05);

        return res;
    }
}
