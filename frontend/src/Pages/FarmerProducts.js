
import { useEffect, useState } from "react";
import API from "../Services/api";
import { getUser } from "../utils/Auth";
import "./FarmerProducts.css";

export default function FarmerProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  let user;
  try {
    user = getUser();
  } catch (error) {
    console.error("Error getting user in FarmerProducts:", error);
    user = null;
  }

  useEffect(() => {
    if (!user?.id) return;

    API.get(`/products/farmer/${user.id}`)
      .then(res => {
        setProducts(res.data || []);
      })
      .catch(err => {
        console.error("Failed to load farmer products", err);
        setProducts([]);
      });
  }, [user?.id]);

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
    });
  };

  const handleSave = async (productId) => {
    try {
      const formData = new FormData();
      formData.append("farmerId", user.id);
      if (editForm.name) formData.append("name", editForm.name);
      if (editForm.price) formData.append("price", editForm.price.toString());
      if (editForm.quantity) formData.append("quantity", editForm.quantity.toString());
      if (editForm.category) formData.append("category", editForm.category);

      const response = await API.put(`/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProducts(products.map(p => p.id === productId ? response.data : p));
      setEditingProduct(null);
      setEditForm({});
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Failed to update product", error);
      alert("Failed to update product");
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  return (
    <div className="products-container">
      <h2 className="products-title">My Products</h2>
      <p className="products-subtitle">
        View and update your added products and remaining stock
      </p>

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

      {products.length === 0 ? (
        <p className="no-products">No products added yet</p>
      ) : (
        <div className="product-grid">
          {products
            .filter(p =>
              p.name.toLowerCase().includes(searchText.toLowerCase()) &&
              (category === "" || p.category === category)
            )
            .map(p => (
            <div className="product-card" key={p.id}>
              {p.imageUrl ? (
                <img
                  src={`http://localhost:9090${p.imageUrl}`}
                  alt={p.name}
                  className="product-image"
                />
              ) : (
                <div className="product-image no-image">
                  No Image
                </div>
              )}

              <div className="product-content">
                {editingProduct === p.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="Name"
                    />
                    <input
                      type="number"
                      value={editForm.price || ""}
                      onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                      placeholder="Price"
                    />
                    <input
                      type="number"
                      value={editForm.quantity || ""}
                      onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value)})}
                      placeholder="Quantity"
                    />
                    <input
                      type="text"
                      value={editForm.category || ""}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      placeholder="Category"
                    />
                    <button className="btn-save" onClick={() => handleSave(p.id)}>Save</button>
                    <button className="btn-cancel" onClick={handleCancel}>Cancel</button>

                  </div>
                ) : (
                  <>
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-detail">
                      <span>Price:</span> ₹{p.price} / kg
                    </p>
                    <p className="product-detail">
                      <span>Remaining:</span> {p.quantity} kg
                    </p>
                    <p className="product-detail">
                      <span>Category:</span> {p.category}
                    </p>
                   <button className="btn-edit" onClick={() => handleEdit(p)}>
  Edit
</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
