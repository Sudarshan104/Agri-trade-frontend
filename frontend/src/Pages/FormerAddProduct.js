import { useState } from "react";
import API from "../Services/api";
import { getUser } from "../utils/Auth";
import "./FarmerAddProduct.css";

export default function FarmerAddProduct() {
  let user;
  try {
    user = getUser();
  } catch (error) {
    console.error("Error getting user in FormerAddProduct:", error);
    user = null;
  }

  const [product, setProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "", // ✅ CATEGORY ADDED
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const addProduct = async () => {
    if (
      !product.name ||
      !product.price ||
      !product.quantity ||
      !product.category ||
      !image
    ) {
      alert("All fields including category and image are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", Number(product.price));
      formData.append("quantity", Number(product.quantity));
      formData.append("category", product.category); // ✅ SEND CATEGORY
      formData.append("farmerId", user.id);
      formData.append("image", image);

      await API.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product added successfully");

      setProduct({
        name: "",
        price: "",
        quantity: "",
        category: "",
      });
      setImage(null);
      document.getElementById("product-image").value = "";
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="content-card">
        <h2>Add Product</h2>

        {/* PRODUCT NAME */}
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            value={product.name}
            placeholder="Enter product name"
            onChange={(e) =>
              setProduct({ ...product, name: e.target.value })
            }
          />
        </div>

        {/* CATEGORY */}
        <div className="form-group">
          <label>Category</label>
          <select
            value={product.category}
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            }
          >
            <option value="">Select Category</option>
            <option value="Vegetable">Vegetable</option>
            <option value="Fruit">Fruit</option>
            <option value="Grain">Grain</option>
          </select>
        </div>

        {/* PRICE */}
        <div className="form-group">
          <label>Price (₹ / kg)</label>
          <input
            type="number"
            value={product.price}
            placeholder="Enter price"
            onChange={(e) =>
              setProduct({ ...product, price: e.target.value })
            }
          />
        </div>

        {/* QUANTITY */}
        <div className="form-group">
          <label>Quantity (kg)</label>
          <input
            type="number"
            value={product.quantity}
            placeholder="Enter quantity"
            onChange={(e) =>
              setProduct({ ...product, quantity: e.target.value })
            }
          />
        </div>

        {/* IMAGE */}
        <div className="form-group">
          <label>Product Image</label>
          <input
            type="file"
            id="product-image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button className="add-btn" onClick={addProduct} disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </div>
    </div>
  );
}
