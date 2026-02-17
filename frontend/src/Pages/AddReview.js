import { useParams, useNavigate } from "react-router-dom";
import ProductReviews from "./ProductReview";
import "./AddReview.css";

export default function AddReview() {
  const { productId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="review-page">
      <div className="review-card">
        {/* HEADER */}
        <div className="review-header">
          <h2>⭐ Review Product</h2>
          <p>
            Your feedback helps improve product quality and trust in the
            marketplace.
          </p>
        </div>

        {/* REVIEW FORM + LIST */}
        <ProductReviews productId={productId} />

        {/* ACTIONS */}
        <div className="review-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ⬅ Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
}
