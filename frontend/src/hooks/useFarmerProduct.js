import { useEffect, useState } from "react";
import API from "../Services/api";
import { getUser } from "../utils/Auth";

export default function useFarmerProducts() {
  let user;
  try {
    user = getUser();
  } catch (error) {
    console.error("Error getting user in useFarmerProduct:", error);
    user = null;
  }
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    API.get(`/products/farmer/${user.id}`)
      .then(res => {
        setProducts(res.data || []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return { products, loading };
}
