package com.example.demo.Controller;

import com.example.demo.entity.Order;
import com.example.demo.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final OrderRepository orderRepository;

    public PaymentController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            Integer amount = (Integer) request.get("amount");
            String currency = (String) request.get("currency");

            // Fetch order to verify
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            }

            // Initialize Razorpay client
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Create order options
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (Object) amount); // amount in paisa
            orderRequest.put("currency", (Object) currency);
            orderRequest.put("receipt", (Object) ("order_" + orderId));

            // Create order
            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);

            // Update order with payment intent id
            order.setPaymentIntentId(razorpayOrder.get("id"));
            order.setPaymentStatus("PENDING");
            orderRepository.save(order);

            // Return order details
            return ResponseEntity.ok(Map.of(
                "id", razorpayOrder.get("id"),
                "amount", razorpayOrder.get("amount"),
                "currency", razorpayOrder.get("currency")
            ));

        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment order creation failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> request) {
        try {
            String razorpayOrderId = (String) request.get("razorpay_order_id");
            String razorpayPaymentId = (String) request.get("razorpay_payment_id");
            String razorpaySignature = (String) request.get("razorpay_signature");
            Long orderId = Long.valueOf(request.get("orderId").toString());

            // Create signature verification data
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);

            // Verify signature - throws exception if invalid
            com.razorpay.Utils.verifyPaymentSignature(attributes, razorpayKeySecret);

            // If no exception, payment is valid
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null) {
                order.setPaymentStatus("PAID");
                orderRepository.save(order);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Payment verified successfully"));

        } catch (RazorpayException e) {
            // Update order status to failed
            Long orderId = Long.valueOf(request.get("orderId").toString());
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null) {
                order.setPaymentStatus("FAILED");
                orderRepository.save(order);
            }

            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Payment verification failed"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/key")
    public ResponseEntity<?> getRazorpayKey() {
        return ResponseEntity.ok(Map.of("key", razorpayKeyId));
    }
}
