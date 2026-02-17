import { useEffect, useMemo, useState } from "react";
import API from "../Services/api";
import { NotificationBell } from "../components/NotificationBell";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import "./AdminDashboard.css";

const CHART_COLORS = ["#2563eb", "#f97316", "#22c55e", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // ✅ Call new centralized dashboard call
      const statsRes = await API.get("/dashboard/admin");
      console.log("Admin Dashboard Response:", statsRes.data); // DEBUG LOG

      // ✅ Also fetch orders for charts logic if needed, or update backend to return charts data
      // For now, keep orders fetching for charts
      // Wait, I changed this to /orders/all in step 203. Let's check backend.
      // OrderController has /orders/all. 
      // AdminOrders.js calls /orders/all. 
      // AdminDashboard.js calls /orders/admin which might fail if I didn't update it to /orders/all or creating /orders/admin endpoint.
      // OrderController DOES NOT HAVE /orders/admin. It has /orders/all.
      // This is likely why charts are empty (orders array empty).
      // But counts come from /dashboard/admin now.

      // Let's fix the orders call to /orders/all
      const ordersListRes = await API.get("/orders/all"); // Corrected endpoint
      const allOrders = Array.isArray(ordersListRes.data) ? ordersListRes.data : [];
      setOrders(allOrders);

      setStats({
        users: statsRes.data?.totalUsers || 0,
        products: statsRes.data?.totalFarmers + statsRes.data?.totalRetailers || 0, // Using totalUsers approx or fetch product count if added to admin endpoint
        // Let's use what the endpoint gives:
        // Endpoint gives: totalUsers, totalFarmers, totalRetailers, pendingVerifications, totalOrders, totalRevenue
        // UI expects: users, products, orders, revenue
        // We might want to add totalProducts to Admin endpoint if missing.
        // Waiting... checking backend code again.
        // Backend Admin endpoint has: totalUsers, totalFarmers, totalRetailers, pendingVerifications, totalOrders, totalRevenue
        // IT DOES NOT HAVE TOTAL PRODUCTS. I will add it to backend first or just use 0.
        // Let's assume user wants accurate counts. I should update backend to include totalProducts.
        // For now, I will map what I have.
        users: statsRes.data?.totalUsers || 0,
        products: statsRes.data?.totalFarmers + statsRes.data?.totalRetailers || 0, // Approx
        orders: statsRes.data?.totalOrders || 0,
        revenue: statsRes.data?.totalRevenue || 0,
      });

      // Quick fix: Fetch products count separately if not in dashboard endpoint
      const productsRes = await API.get("/admin/products");
      setStats(prev => ({
        ...prev,
        products: productsRes.data?.length || 0
      }));

    } catch (err) {
      console.error("Failed to load admin stats", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== CHART DATA ===================== */

  // ✅ Pie: status counts
  const statusData = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const s = o.status || "UNKNOWN";
      map[s] = (map[s] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [orders]);

  // ✅ Line: monthly total orders (current year)
  const monthlyOrders = useMemo(() => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const counts = new Array(12).fill(0);

    orders.forEach((o) => {
      if (!o.orderDate) return;
      const d = new Date(o.orderDate);
      const monthIndex = d.getMonth();
      counts[monthIndex] += 1;
    });

    return monthNames.map((m, i) => ({
      month: m,
      orders: counts[i],
    }));
  }, [orders]);

  // ✅ Bar: monthly revenue (only DELIVERED)
  const monthlyRevenue = useMemo(() => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const revenue = new Array(12).fill(0);

    orders.forEach((o) => {
      if (!o.orderDate) return;
      if (o.status !== "DELIVERED") return;

      const d = new Date(o.orderDate);
      const monthIndex = d.getMonth();
      revenue[monthIndex] += Number(o.totalAmount || 0);
    });

    return monthNames.map((m, i) => ({
      month: m,
      revenue: Math.round(revenue[i]),
    }));
  }, [orders]);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="subtitle">System-wide overview</p>
        </div>

        <button className="admin-refresh" onClick={loadStats}>
          ⟳ Refresh
        </button>
      </div>

      <div className="admin-cards">
        <div className="admin-card">
          <h2>{loading ? "…" : stats.users}</h2>
          <p>Total Users</p>
        </div>

        <div className="admin-card">
          <h2>{loading ? "…" : stats.products}</h2>
          <p>Total Products</p>
        </div>

        <div className="admin-card">
          <h2>{loading ? "…" : stats.orders}</h2>
          <p>Total Orders</p>
        </div>

        <div className="admin-card revenue">
          <h2>{loading ? "…" : `₹ ${Math.round(stats.revenue)}`}</h2>
          <p>Total Revenue</p>
        </div>
      </div>

      {/* ✅ CHARTS SECTION */}
      <div className="admin-analytics">
        <h2 className="analytics-title">📊 Admin Analytics</h2>

        {loading ? (
          <p>Loading charts...</p>
        ) : orders.length === 0 ? (
          <p>No orders found to generate analytics.</p>
        ) : (
          <div className="admin-chart-grid">
            {/* ✅ PIE */}
            <div className="admin-chart-box">
              <h3>Orders by Status</h3>
              <div className="chart-wrap">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={3}
                      label
                    >
                      {statusData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={45} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ✅ LINE */}
            <div className="admin-chart-box">
              <h3>Monthly Orders</h3>
              <div className="chart-wrap">
                <ResponsiveContainer>
                  <LineChart
                    data={monthlyOrders}
                    margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ✅ BAR */}
            <div className="admin-chart-box span-2">
              <h3>Monthly Revenue (Delivered Orders)</h3>
              <div className="chart-wrap">
                <ResponsiveContainer>
                  <BarChart
                    data={monthlyRevenue}
                    margin={{ top: 10, right: 15, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                      {monthlyRevenue.map((_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
