import { useEffect, useState } from "react";
import API from "../Services/api";
import { getUser } from "../utils/Auth";
import "./ProductReviews.css";

export default function ProductReviews({ productId }) {
  const user = getUser();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  /* ================= LOAD REVIEWS ================= */
  const loadReviews = async () => {
    try {
      const res = await API.get(`/reviews/product/${productId}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
      setReviews([]);
    }
  };

  useEffect(() => {
    if (productId) loadReviews();
  }, [productId]);

  /* ================= ADD REVIEW ================= */
  const submitReview = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      // 🔍 DEBUG (can remove later)
      console.log({
        productId,
        retailerId: user.id,
        rating,
        comment,
      });

      await API.post("/reviews", {
        productId: productId,
        retailerId: user.id,   // ✅ FIXED
        rating: Number(rating),
        comment: comment,
      });

      alert("Review added successfully ✅");
      setComment("");
      setRating(5);
      loadReviews();
    } catch (err) {
      console.error(err);
      alert("Failed to add review");
    }
  };

  return (
    <div className="review-section">
      <h3 className="section-title">⭐ Product Reviews</h3>

      {/* ================= ADD REVIEW ================= */}
      <div className="review-form">
        <label>Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          <option value={5}>★★★★★ (5)</option>
          <option value={4}>★★★★ (4)</option>
          <option value={3}>★★★ (3)</option>
          <option value={2}>★★ (2)</option>
          <option value={1}>★ (1)</option>
        </select>

        <label>Comment</label>
        <textarea
          placeholder="Write your honest review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button className="submit-btn" onClick={submitReview}>
          Submit Review
        </button>
      </div>

      {/* ================= SHOW REVIEWS ================= */}
      {reviews.length === 0 ? (
        <p className="empty-text">No reviews yet</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((r) => (
            <div className="review-card" key={r.id}>
              <div className="review-header">
                <strong>{r.retailer?.name || "Retailer"}</strong>
                <span className="stars">
                  {"★".repeat(r.rating)}
                </span>
              </div>
              <p className="review-comment">“{r.comment}”</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
