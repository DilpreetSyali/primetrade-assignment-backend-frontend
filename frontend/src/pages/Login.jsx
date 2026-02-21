import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { setAuth } from "../utils/auth";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (loc.state?.email) setForm((p) => ({ ...p, email: loc.state.email }));
    if (loc.state?.justRegistered) setMsg("Account created ✅ Now login.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post("/auth/login", form);
      setAuth({ token: res.data.token, user: res.data.user });
      nav("/app", { replace: true });
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="authWrap">
      <div className="authCard">
        <h1>Momentum</h1>
        <p className="muted">Login to continue to your dashboard.</p>

        {msg && <div className={`alert ${msg.includes("✅") ? "ok" : "error"}`}>{msg}</div>}

        <form onSubmit={submit} className="form">
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          </label>

          <button className="btn primary">Login</button>
        </form>

        <div className="muted">
          New here? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}