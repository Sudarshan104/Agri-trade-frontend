import { useEffect, useState } from "react";
import API from "../Services/api";
import "./AdminProduct.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await API.get("/admin/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load products");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await API.delete(`/admin/products/${id}`);
      loadProducts();
    } catch {
      alert("Failed to delete product");
    }
  };

  return (
    <div className="admin-page">
      <h2 className="page-title">Manage Products</h2>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          <option value="Vegetable">Vegetable</option>
          <option value="Fruit">Fruit</option>
          <option value="Grain">Grain</option>
        </select>
      </div>

      <div className="product-grid">
        {products
          .filter(p =>
            p.name.toLowerCase().includes(searchText.toLowerCase()) &&
            (category === "" || p.category === category)
          )
          .map((p) => (
          <div className="product-card" key={p.id}>
            <img
              src={`http://localhost:9090${p.imageUrl}`}
              alt={p.name}
            />
            <h3>{p.name}</h3>
            <p>₹ {p.price} / kg</p>
            <button
              className="danger-btn"
              onClick={() => deleteProduct(p.id)}
            >
              Delete
            </button>
          </div>
        ))}

        {products.length === 0 && (
          <p className="empty">No products available</p>
        )}
      </div>
    </div>
  );
}
