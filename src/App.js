import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [showPicker, setShowPicker] = useState(null);
  const [selectedDates, setSelectedDates] = useState({});

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get("http://localhost:3001/task").then((res) => {
      setTasks(res.data);
    });
  };

  const addTask = () => {
    if (!name.trim()) return alert("Enter a task name!");
    axios.post("http://localhost:3001/task", { name }).then(() => {
      setName("");
      fetchTasks();
    });
  };

  const setReminder = (id) => {
    const reminder = selectedDates[id];
    if (!reminder) return alert("Select a date and time");

    // Check if selected date/time is in the past
    if (new Date(reminder) <= new Date()) {
      return alert("Reminder must be a future date and time!");
    }

    axios
      .put(`http://localhost:3001/task/${id}/reminder`, { reminder })
      .then(() => {
        setShowPicker(null);
        setSelectedDates((prev) => ({ ...prev, [id]: "" }));
        fetchTasks();
      });
  };

  const completeTask = (id) => {
    if (window.confirm("Mark this task as completed?")) {
      axios.put(`http://localhost:3001/task/${id}/complete`).then(() => {
        fetchTasks();
      });
    }
  };

  return (
    <div className="App">
      <h2>Task Manager</h2>
      <div style={{ marginBottom: "10px" }}>
        <input
        type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter task name"
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Reminder</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, idx) => (
            <tr key={task.id}>
              <td>{idx + 1}</td>
              <td style={{ textDecoration: task.completed ? "line-through" : "none" }}>
                {task.name}
              </td>
              <td>
                {!task.completed && (
                  <>
                    <button onClick={() => setShowPicker(task.id)}>Set Reminder</button>
                    {showPicker === task.id && (
                      <div style={{ marginTop: "5px" }}>
                        <input
                          type="datetime-local"
                          value={selectedDates[task.id] || ""}
                          min={new Date().toISOString().slice(0, 16)} // prevent past date/time
                          onChange={(e) =>
                            setSelectedDates((prev) => ({
                              ...prev,
                              [task.id]: e.target.value,
                            }))
                          }
                        />
                        <button onClick={() => setReminder(task.id)}>Save</button>
                      </div>
                    )}
                  </>
                )}
                <div style={{ fontSize: "0.8rem" }}>
                  {task.reminder && new Date(task.reminder).toLocaleString()}
                </div>
              </td>
              <td>
                {!task.completed ? (
                  <button onClick={() => completeTask(task.id)}>✅</button>
                ) : (
                  "✔ Done"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
