import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Chatbot from "./components/Chatbot/Chatbot";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

/* ================= PROFILE ================= */
import Profile from "./Pages/Profile";

/* ================= REVIEW ================= */
import AddReview from "./Pages/AddReview";

/* ================= DOCUMENT UPLOAD ================= */
import DocumentUpload from "./Pages/DocumentUpload";

/* ================= HELP & SUPPORT ================= */
import HelpSupport from "./Pages/HelpSupport";
import ReportIssue from "./Pages/ReportIssue";

/* ================= FARMER ================= */
import FarmerLayout from "./Pages/FarmerLayout";
import FarmerDashboard from "./Pages/FarmerDashboard";
import FarmerProducts from "./Pages/FarmerProducts";
import FarmerOrders from "./Pages/FormerOrders";
import FarmerAddProduct from "./Pages/FormerAddProduct";
import FarmerReviews from "./Pages/FarmerReview";
import FarmerAnalytics from "./Pages/FarmerAnalytics";
import FarmerNotifications from "./Pages/FarmerNotifications";

/* ================= RETAILER ================= */
import RetailerLayout from "./Pages/RetailerLayout";
import RetailerHome from "./Pages/RetailerHome";
import RetailerDashboard from "./Pages/RetailerDashboard";
import RetailerOrders from "./Pages/RetailOrders";

/* ================= ADMIN ================= */
import AdminLayout from "./Pages/AdminLayout";
import AdminDashboard from "./Pages/AdminDashBoard";
import AdminUsers from "./Pages/AdminUsers";
import AdminProducts from "./Pages/AdminProducts";
import AdminOrders from "./Pages/AdminOrders";
import AdminVerification from "./Pages/AdminVerification";
import AdminSupport from "./Pages/AdminSupport";
import AdminIssues from "./Pages/AdminIssues";

/* ================= DELIVERY AGENT ================= */
import DeliveryAgentDashboard from "./Pages/DeliveryAgentDashboard";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= PROFILE (ALL ROLES) ================= */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ================= REVIEW (RETAILER ONLY) ================= */}
        <Route
          path="/review/:productId"
          element={
            <ProtectedRoute role="RETAILER">
              <AddReview />
            </ProtectedRoute>
          }
        />

        {/* ================= FARMER ROUTES ================= */}
        <Route
          path="/farmer"
          element={
            <ProtectedRoute role="FARMER">
              <FarmerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<FarmerDashboard />} />
          <Route path="add-product" element={<FarmerAddProduct />} />
          <Route path="products" element={<FarmerProducts />} />
          <Route path="orders" element={<FarmerOrders />} />
          <Route path="analytics" element={<FarmerAnalytics />} />
          <Route path="reviews" element={<FarmerReviews />} />
          <Route path="upload-documents" element={<DocumentUpload />} />
          <Route path="help-support" element={<HelpSupport />} />
          <Route path="report-issue" element={<ReportIssue />} />

        </Route>

        {/* ================= RETAILER ROUTES ================= */}
        <Route
          path="/retailer"
          element={
            <ProtectedRoute role="RETAILER">
              <RetailerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RetailerHome />} />
          <Route path="products" element={<RetailerDashboard />} />
          <Route path="orders" element={<RetailerOrders />} />
          <Route path="upload-documents" element={<DocumentUpload />} />
          <Route path="help-support" element={<HelpSupport />} />
          <Route path="report-issue" element={<ReportIssue />} />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="verification" element={<AdminVerification />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="issues" element={<AdminIssues />} />
        </Route>

        {/* ================= DELIVERY AGENT ROUTES ================= */}
        <Route
          path="/delivery-agent"
          element={
            <ProtectedRoute role="DELIVERY_AGENT">
              <DeliveryAgentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;
