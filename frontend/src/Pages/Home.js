import "./LandingPage.css";
import { useState, useEffect } from "react";
import { getUser } from "../utils/Auth";

export default function LandingPage() {
  const user = getUser();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`landing-page ${isVisible ? 'fade-in' : ''}`}>



      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="platform-tag animate-fade-in-up">🌱 Revolutionizing Agriculture</span>
          <h1 className="hero-title animate-fade-in-up">
            Direct Farmer-Retailer Trading Platform
          </h1>
          <p className="hero-subtitle animate-fade-in-up">
            Connect directly with farmers for fresh, quality produce at fair prices.
            Eliminate middlemen, ensure transparency, and support local agriculture.
          </p>
          <div className="hero-buttons animate-fade-in-up">
            <button className="btn-primary" onClick={() => window.location.href = '/register'}>Get Started</button>
            <button className="btn-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Learn More</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card animate-float">
            <div className="card-icon">🚜</div>
            <h4>Fresh Produce</h4>
            <p>Direct from farms</p>
          </div>
          <div className="floating-card animate-float-delayed">
            <div className="card-icon">📊</div>
            <h4>Real-time Analytics</h4>
            <p>Track your business</p>
          </div>
          <div className="floating-card animate-float">
            <div className="card-icon">🔒</div>
            <h4>Secure Payments</h4>
            <p>Safe transactions</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">2,500+</div>
            <div className="stat-label">Registered Farmers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1,800+</div>
            <div className="stat-label">Active Retailers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">15,000+</div>
            <div className="stat-label">Successful Transactions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">₹2.5Cr+</div>
            <div className="stat-label">Revenue Generated</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <h2 className="section-title">Why Choose AgriConnect?</h2>
          <p className="section-subtitle">Empowering farmers and retailers with cutting-edge technology</p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚜</div>
              <h3>Direct Trading</h3>
              <p>Eliminate middlemen and connect farmers directly with retailers for better pricing and fresher produce.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>Track sales performance, monthly trends, and top-selling products with comprehensive analytics.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Product Reviews</h3>
              <p>Build trust with a transparent review system for products and farmer-retailer relationships.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Real-time Updates</h3>
              <p>Get instant notifications about order status, new products, and market opportunities.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>Safe and secure payment processing with multiple payment options and transaction tracking.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Regional Focus</h3>
              <p>Support local agriculture by connecting buyers with nearby farmers and fresh regional produce.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Simple steps to start trading on our platform</p>

          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Register & Verify</h3>
                <p>Create your account as a farmer or retailer and complete the verification process.</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>List or Browse Products</h3>
                <p>Farmers list their produce with details, retailers browse and compare available products.</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Place & Confirm Orders</h3>
                <p>Secure order placement with real-time inventory updates and instant confirmations.</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Track & Deliver</h3>
                <p>Monitor order status, arrange logistics, and complete successful deliveries.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-container">
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle">Real experiences from farmers and retailers</p>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                "AgriConnect has transformed how I sell my vegetables. I get better prices and direct access to retailers. My income has increased by 40%!"
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍🌾</div>
                <div className="author-info">
                  <div className="author-name">Rajesh Kumar</div>
                  <div className="author-role">Organic Farmer, Punjab</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                "As a retailer, I can now source fresh produce directly from farmers. The quality is better and prices are more competitive than wholesale markets."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">🏪</div>
                <div className="author-info">
                  <div className="author-name">Priya Sharma</div>
                  <div className="author-role">Retail Store Owner, Delhi</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                "The analytics dashboard helps me track my sales and plan better. The platform is user-friendly and the support team is excellent."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍🌾</div>
                <div className="author-info">
                  <div className="author-name">Meera Patel</div>
                  <div className="author-role">Fruit Farmer, Gujarat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Transform Your Agriculture Business?</h2>
          <p>Join thousands of farmers and retailers already using AgriConnect</p>
          <div className="cta-buttons">
            <button className="btn-primary">Join as Farmer</button>
            <button className="btn-secondary">Join as Retailer</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-icon">🌾</span>
              <span className="logo-text">AgriTrade</span>
            </div>
            <p>Empowering farmers, connecting communities, feeding the nation.</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#testimonials">Testimonials</a>
            </div>

            <div className="footer-column">
              <h4>Support</h4>
              <a href="#help">Help Center</a>
              <a href="#contact">Contact Us</a>
              <a href="#faq">FAQ</a>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 AgriTrade. All rights reserved. | Made with ❤️ for Indian Agriculture</p>
        </div>
      </footer>
    </div>
  );
}
