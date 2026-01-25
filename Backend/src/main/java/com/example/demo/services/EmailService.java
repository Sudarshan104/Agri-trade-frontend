package com.example.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderStatusNotification(String toEmail, String orderId, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Order Status Update - Order #" + orderId);
        message.setText("Your order #" + orderId + " status has been updated to: " + status +
                       "\n\nThank you for using our platform!");

        mailSender.send(message);
    }
}
