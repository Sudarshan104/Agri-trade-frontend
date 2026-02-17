import { useEffect, useState } from "react";
import API from "../Services/api";
import { getUser } from "../utils/Auth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import "./FarmerAnalytics.css";

export default function FarmerAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    if (!user?.id) return;

    API.get(`/orders/farmer/${user.id}/analytics`)
      .then(res => {
        console.log("Analytics data received:", res.data);
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load analytics", err);
        setLoading(false);
      });
  }, [user?.id]);

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!analytics) return <div className="error">Failed to load analytics</div>;

  const totalTransactions = analytics.completedTransactions?.length || 0;
  const averageOrderValue = totalTransactions > 0
    ? (analytics.totalRevenue || 0) / totalTransactions
    : 0;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>📊 Sales Analytics Dashboard</h2>
        <p>Track your completed transactions and sales performance</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>₹{analytics.totalRevenue || 0}</h3>
          <p>Total Revenue</p>
        </div>

        <div className="metric-card">
          <h3>{totalTransactions}</h3>
          <p>Completed Transactions</p>
        </div>

        <div className="metric-card">
          <h3>₹{averageOrderValue.toFixed(2)}</h3>
          <p>Average Order Value</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Monthly Transactions Chart */}
        <div className="analytics-section chart-section">
          <h3>📈 Monthly Transaction Trends</h3>
          {Object.keys(analytics.monthlyTransactions || {}).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Object.entries(analytics.monthlyTransactions).map(([month, count]) => ({ month, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3498db" strokeWidth={3} name="Transactions" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-chart">
              <p>No transaction data available for this year</p>
              <p>Complete some orders to see monthly trends</p>
            </div>
          )}
        </div>

        {/* Top Sold Products Chart */}
        <div className="analytics-section chart-section">
          <h3>🏆 Top Sold Products</h3>
          {analytics.topSoldProducts && analytics.topSoldProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topSoldProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#27ae60" name="Quantity Sold (kg)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-chart">
              <p>No product sales data available</p>
              <p>Complete some orders to see top products</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Transactions */}
      <div className="analytics-section">
        <h3>📋 Recent Completed Transactions</h3>
        {analytics.completedTransactions?.length > 0 ? (
          <div className="transactions-list">
            {analytics.completedTransactions.map(order => (
              <div key={order.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="order-id">Order #{order.id}</span>
                  <span className="product-name">{order.product?.name || 'Product'}</span>
                  <span className="quantity">{order.quantity} kg</span>
                </div>
                <div className="transaction-amount">
                  ₹{(order.product?.price || 0) * order.quantity}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No completed transactions yet</p>
        )}
      </div>

      {/* Sales Trends */}
      <div className="analytics-section">
        <h3>📈 Monthly Sales Trends</h3>
        <div className="sales-trends">
          {Object.entries(analytics.monthlySales || {}).map(([month, sales]) => (
            <div key={month} className="trend-item">
              <span className="month">{month}</span>
              <div className="sales-bar">
                <div
                  className="sales-fill"
                  style={{ width: `${Math.min((sales / 10000) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="sales-amount">₹{sales}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="analytics-section">
        <h3>💡 Insights</h3>
        <div className="insights">
          <p>• You have completed {totalTransactions} transactions this period</p>
          <p>• Your average order value is ₹{averageOrderValue.toFixed(2)}</p>
          <p>• Total revenue generated: ₹{analytics.totalRevenue || 0}</p>
        </div>
      </div>
    </div>
  );
}
