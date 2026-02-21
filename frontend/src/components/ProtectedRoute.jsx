import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const { token } = getAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}