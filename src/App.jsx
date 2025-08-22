import React, { useState, useEffect } from "react";


function App() {
  // ---------- Timer ----------
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds((prev) => prev - 1);
        } else {
          if (minutes > 0) {
            setMinutes((prev) => prev - 1);
            setSeconds(59);
          } else {
            // Switch between work/break
            if (onBreak) {
              setMinutes(25);
              setSeconds(0);
              setOnBreak(false);
            } else {
              setMinutes(5);
              setSeconds(0);
              setOnBreak(true);
            }
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, seconds, minutes, onBreak]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    setOnBreak(false);
  };

  // ---------- Todo ----------
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  // Editing state for double-click rename
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editError, setEditError] = useState("");

  const addTask = (e) => {
    e.preventDefault();
    if (!task.trim()) {
      setError("Task is required");
      return;
    }
    if (task.trim().length < 3) {
      setError("Task minimum length is 3");
      return;
    }
    setTasks([...tasks, { id: Date.now(), text: task.trim(), done: false }]);
    setTask("");
    setError("");
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTask = (id) => {
    // If deleting the one being edited, cancel edit
    if (editingId === id) {
      setEditingId(null);
      setEditingText("");
      setEditError("");
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ---------- Edit handlers ----------
  const startEdit = (id, currentText) => {
    setEditingId(id);
    setEditingText(currentText);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditError("");
  };

  const saveEdit = (id) => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      setEditError("Task is required");
      return;
    }
    if (trimmed.length < 3) {
      setEditError("Task minimum length is 3");
      return;
    }

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t)));
    setEditingId(null);
    setEditingText("");
    setEditError("");
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(id);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  // ---------- Helper ----------
  const pad = (n) => String(n).padStart(2, "0");

  // ---------- UI ----------
  return (
    <div style={styles.container}>
      

      <h1 style={styles.mainTitle}>Pomodoro Timer</h1>

      <h2 style={{ color: onBreak ? "#a7f3d0" : "#fff" }}>
        {onBreak ? "Break Time" : "Focus Time"}
      </h2>

      {/* Timer squares */}
      <div style={styles.timerRow}>
        <div style={styles.timerBoxWrap}>
          <div style={{ ...styles.timerBox, background: "#0b1220" }}>
            <span style={styles.timerNumber}>{pad(minutes)}</span>
          </div>
          <div style={styles.timerLabel}>Minutes</div>
        </div>

        <div style={styles.colon}>:</div>

        <div style={styles.timerBoxWrap}>
          <div style={{ ...styles.timerBox, background: "#0b1220" }}>
            <span style={styles.timerNumber}>{pad(seconds)}</span>
          </div>
          <div style={styles.timerLabel}>Seconds</div>
        </div>
      </div>

      {/* Buttons */}
      <div style={styles.buttons}>
        <button onClick={startTimer} style={{ ...styles.button, background: "#2563eb" }}>
          Start
        </button>
        <button onClick={pauseTimer} style={{ ...styles.button, background: "#6b7280" }}>
          Pause
        </button>
        <button onClick={resetTimer} style={{ ...styles.button, background: "#ef4444" }}>
          Reset
        </button>
      </div>

      {/* To-Do */}
      <h1 style={styles.mainTitle}>My Tasks</h1>
      <form onSubmit={addTask} style={styles.form}>
        <input
          type="text"
          placeholder="Add a new task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={{ ...styles.button, background: "#2563eb" }}>
          Add
        </button>
      </form>
      {error && <p style={{ color: "#ef4444", marginTop: 6 }}>{error}</p>}

      <ul style={styles.list}>
        {tasks.map((t) => (
          <li key={t.id} style={styles.listItem}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggleTask(t.id)}
            />

            {/* If currently editing this item, show input */}
            {editingId === t.id ? (
              <input
                autoFocus
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => saveEdit(t.id)} // save on blur
                onKeyDown={(e) => handleEditKeyDown(e, t.id)}
                style={{
                  marginLeft: 12,
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#0f1724",
                  color: "#fff",
                }}
              />
            ) : (
              <span
                onDoubleClick={() => startEdit(t.id, t.text)}
                style={{
                  textDecoration: t.done ? "line-through" : "none",
                  marginLeft: 12,
                  color: t.done ? "#9ca3af" : "#fff",
                  flex: 1,
                  cursor: "text",
                  userSelect: "none",
                }}
                title="Double-click to rename"
              >
                {t.text}
              </span>
            )}

            <button
              onClick={() => deleteTask(t.id)}
              style={{ ...styles.button, background: "#ef4444", marginLeft: 12 }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Edit error message */}
      {editError && <p style={{ color: "#ef4444", marginTop: 6 }}>{editError}</p>}
    </div>
  );
}

// ---------- Styles ----------
const styles = {
  container: {
    marginLeft:"380px",
    minHeight: "100vh",
    background: "#0b1220",
    color: "white",
    padding: "40px 24px",
    fontFamily: "Inter, Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  mainTitle: {
    margin: "12px 0",
  },
  timerRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  timerBoxWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  timerBox: {
    width: 100,
    height: 72,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  timerNumber: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 1,
  },
  timerLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#9ca3af",
  },
  colon: {
    fontSize: 32,
    fontWeight: 700,
    color: "#ffffff",
  },
  buttons: {
    display: "flex",
    gap: 12,
    marginTop: 12,
    marginBottom: 28,
  },
  button: {
    padding: "10px 18px",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  form: {
    display: "flex",
    gap: 12,
    width: "640px",
    maxWidth: "90%",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "#0f1724",
    color: "#fff",
  },
  list: {
    listStyle: "none",
    padding: 0,
    width: "640px",
    maxWidth: "90%",
    marginTop: 12,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    background: "#071027",
    padding: "12px 14px",
    borderRadius: 8,
  },
};

export default App;
