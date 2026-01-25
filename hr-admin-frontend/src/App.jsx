import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Audit from "./pages/Audit";
import SecurityAlertModal from "./components/SecurityAlertModal";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppContent = () => {
  const { user } = useAuth();
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const wsRef = useRef(null);
  const alertShownRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  const checkRecentFraud = async () => {
    if (alertShownRef.current) return;

    try {
      const response = await fetch('/api/audit/recent-fraud', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.hasRecentFraud) {
        console.warn("Recent fraud detected on reconnect:", result.alert);
        setShowSecurityAlert(true);
        alertShownRef.current = true;
      }
    } catch (err) {
      console.error("Failed to check for recent fraud:", err);
    }
  };

  const connectWebSocket = () => {
    if (!user) return;

    // Don't create a new WebSocket if one already exists
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(`ws://${window.location.host}/ws/fraud-alerts`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to Fraud Alert System (WebSocket)");
      // Check for any fraud that happened while disconnected
      checkRecentFraud();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.EventType === "FRAUD_DETECTED") {
          console.warn("Real-time Fraud Alert Received:", data);
          setShowSecurityAlert(true);
          alertShownRef.current = true;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected, will attempt to reconnect...");
      wsRef.current = null;

      // Attempt to reconnect after 2 seconds
      if (user) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect WebSocket...");
          connectWebSocket();
        }, 2000);
      }
    };
  };

  useEffect(() => {
    if (!user) {
      // Close WebSocket if user logs out
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      alertShownRef.current = false;
      return;
    }

    connectWebSocket();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  return (
    <>
      <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute>
                  <Audit />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>

      {showSecurityAlert && (
        <SecurityAlertModal onClose={() => setShowSecurityAlert(false)} />
      )}
    </>
  );
};

const App = () => {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ zIndex: 99999 }}
      />
    </>
  );
};

export default App;
