import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { clearAuth, getAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";

function groupByDay(tasks) {
  const map = new Map();
  for (const t of tasks) {
    const d = new Date(t.createdAt || t.updatedAt || Date.now());
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));
}

export default function Dashboard() {
  const nav = useNavigate();
  const { user } = getAuth();

  const [tab, setTab] = useState("create"); // create | tasks | analytics
  const [tasks, setTasks] = useState([]);
  const [msg, setMsg] = useState("");

  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "todo" });

  const loadTasks = async () => {
    setMsg("");
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load tasks");
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "done").length;
    const doing = tasks.filter(t => t.status === "doing").length;
    const todo = tasks.filter(t => t.status === "todo").length;
    const completion = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, done, doing, todo, completion };
  }, [tasks]);

  const activityData = useMemo(() => groupByDay(tasks), [tasks]);

  const statusData = useMemo(() => ([
    { name: "Todo", value: stats.todo },
    { name: "Doing", value: stats.doing },
    { name: "Done", value: stats.done },
  ]), [stats]);

  const createTask = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/tasks", taskForm);
      setTaskForm({ title: "", description: "", status: "todo" });
      await loadTasks();
      setTab("tasks");
      setMsg("Task created ✅");
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Create failed");
    }
  };

  const updateStatus = async (id, status) => {
    setMsg("");
    try {
      await api.put(`/tasks/${id}`, { status });
      await loadTasks();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Update failed");
    }
  };

  const removeTask = async (id) => {
    setMsg("");
    try {
      await api.delete(`/tasks/${id}`);
      await loadTasks();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Delete failed");
    }
  };

  const logout = () => {
    clearAuth();
    nav("/login", { replace: true });
  };

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logoDot" />
          <div>
            <div className="brandTitle">Momentum</div>
            <div className="brandSub">Task Tracker</div>
          </div>
        </div>

        <div className="userBox">
          <div className="avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</div>
          <div>
            <div className="userName">{user?.name || "User"}</div>
            <div className="mutedSmall">{user?.email}</div>
          </div>
        </div>

        <nav className="nav">
          <button className={`navBtn ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>
            ➕ Create Task
          </button>
          <button className={`navBtn ${tab === "tasks" ? "active" : ""}`} onClick={() => setTab("tasks")}>
            📜 My Tasks / History
          </button>
          <button className={`navBtn ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>
            📈 Analytics
          </button>
        </nav>

        <div className="sidebarBottom">
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1 className="title">Let’s complete work</h1>
            <p className="muted">Track tasks, measure consistency, and improve efficiency.</p>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="kpiLabel">Total</div>
              <div className="kpiValue">{stats.total}</div>
            </div>
            <div className="kpi">
              <div className="kpiLabel">Done</div>
              <div className="kpiValue">{stats.done}</div>
            </div>
            <div className="kpi">
              <div className="kpiLabel">Efficiency</div>
              <div className="kpiValue">{stats.completion}%</div>
            </div>
          </div>
        </header>

        {msg && <div className={`alert ${msg.includes("✅") ? "ok" : "error"}`}>{msg}</div>}

        {tab === "create" && (
          <section className="card">
            <h2>Create a new task</h2>
            <form className="gridForm" onSubmit={createTask}>
              <label>
                Title
                <input value={taskForm.title} onChange={(e) => setTaskForm(p => ({ ...p, title: e.target.value }))} required />
              </label>
              <label>
                Status
                <select value={taskForm.status} onChange={(e) => setTaskForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="todo">todo</option>
                  <option value="doing">doing</option>
                  <option value="done">done</option>
                </select>
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                Description
                <input value={taskForm.description} onChange={(e) => setTaskForm(p => ({ ...p, description: e.target.value }))} />
              </label>

              <button className="btn primary" style={{ gridColumn: "1 / -1" }}>Create</button>
            </form>
          </section>
        )}

        {tab === "tasks" && (
          <section className="card">
            <div className="cardHeaderRow">
              <h2>My tasks</h2>
              <button className="btn" onClick={loadTasks}>Refresh</button>
            </div>

            {tasks.length === 0 ? (
              <p className="muted">No tasks yet. Create one from the sidebar.</p>
            ) : (
              <div className="taskList">
                {tasks.map((t) => (
                  <div key={t._id} className="taskItem">
                    <div>
                      <div className="taskTitle">{t.title}</div>
                      <div className="mutedSmall">{t.description || "—"}</div>
                      <div className="mutedSmall">Status: <b>{t.status}</b></div>
                    </div>

                    <div className="taskActions">
                      <select value={t.status} onChange={(e) => updateStatus(t._id, e.target.value)}>
                        <option value="todo">todo</option>
                        <option value="doing">doing</option>
                        <option value="done">done</option>
                      </select>
                      <button className="btn danger" onClick={() => removeTask(t._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "analytics" && (
          <section className="grid2">
            <div className="card">
              <h2>Status breakdown</h2>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={statusData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mutedSmall">
                Efficiency is calculated as <b>(Done / Total) × 100</b>.
              </p>
            </div>

            <div className="card">
              <h2>Activity trend</h2>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={activityData}>
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line dataKey="count" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mutedSmall">
                Based on task <b>createdAt</b>. For months view, we can group by month next.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}