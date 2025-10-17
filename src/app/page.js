"use client";

import { playfair } from "./font.js";
import styles from "./page.module.css";
import { useEffect, useState, useRef } from "react";
import { Edit, Trash2, Check, Search, CirclePlus } from "lucide-react";

export default function Home() {
  const [task, setTask] = useState("");
  const [List, setList] = useState([]);
  const [editId, setEditId] = useState("");
  const [freq, setFreq] = useState(new Map());

  // reference part
  const ref_to_input = useRef();
  // const ref_to_enter = useRef();

  const maxFreq = Math.max(
    ...Array.from(freq.values()).map((val) => val.counter)
  );
  async function addData() {
    if (task.trim() === "") return; // check first

    // Update frequency map
    updateFreq();

    const data = {
      id: Date.now(),
      task,
      completed: false,
      removed: false,
      edited: false,
    };

    setList((prev) => [...prev, data]);
    setTask("");

    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        return;
      }

      const resp = await response.json();
      console.log("Saved task:", resp);
    } catch (err) {
      console.error("Network error:", err);
    }
  }
  function DeleteTask(id) {
    const newList = List.filter((task) => task.id !== id);
    setList(newList);
  }
  function CheckedTask(id) {
    const newList = List.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      } else return task;
    });
    setList(newList);
  }
  function Edit_task(id) {
    // it will take that text to the input box directly and whatever make edit to set to list task
    setEditId(id);
  }
  function modify_task(id) {
    updateFreq();
    const newList = List.map((val) => {
      if (val.id === id) {
        return { ...val, task: task };
      } else return val;
    });
    setList(newList);
    setEditId("");
  }
  function updateFreq() {
    if (task.trim() === "") return;

    setFreq((prev) => {
      const newMap = new Map(prev);

      if (newMap.has(task)) {
        const entry = newMap.get(task);
        newMap.set(task, { ...entry, counter: entry.counter + 1 });
      } else {
        newMap.set(task, { id: Date.now(), task: task, counter: 1 });
      }

      return newMap;
    });
  }
  useEffect(() => {
    ref_to_input.current.focus();
    fetchData();
    console.log(List);
  }, []);
  async function fetchData() {
    try {
      const response = await fetch("/api/task", { method: "GET" });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        return;
      }

      const data = await response.json();
      console.log("Fetched tasks:", data);
      setList(data); // ✅ sync backend data

      // 🔧 rebuild frequency map after fetching from DB
      const freqMap = new Map();
      data.forEach((item) => {
        const t = item.task.trim();
        if (!t) return;
        if (freqMap.has(t)) {
          const entry = freqMap.get(t);
          freqMap.set(t, { ...entry, counter: entry.counter + 1 });
        } else {
          freqMap.set(t, { id: Date.now(), task: t, counter: 1 });
        }
      });
      setFreq(freqMap);
      // ✅ done: this ensures right panel reloads correctly after refresh
    } catch (err) {
      console.error("Network error:", err);
    }
  }


  // async function AddData() {}
  return (
    <div className={playfair.className}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.left_upper}>
            <input
              ref={ref_to_input}
              className={styles.input_field}
              type="text"
              placeholder="Search or Add Task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addData();
              }}
            />
            <button className={styles.my_button}>
              <Search />
            </button>
            <button className={styles.last_btn} onClick={addData}>
              <CirclePlus />
            </button>
          </div>

          <div className={styles.left_lower}>
            <div className={styles.left_lower_single}>
              <ul>
                {List.map((val) => (
                  <li key={val.id} className={styles.task_row}>
                    <span
                      className={
                        val.completed
                          ? `${styles.task_text} ${styles.completed}`
                          : styles.task_text
                      }
                    >
                      {val.task.length <= 50 ? (
                        val.id === editId ? (
                          <>
                            <input
                              onChange={(e) => setTask(e.target.value)}
                            ></input>{" "}
                            <button onClick={() => modify_task(val.id)}>
                              Add
                            </button>
                          </>
                        ) : (
                          val.task
                        )
                      ) : (
                        val.task.substring(0, 50) + "..."
                      )}
                    </span>
                    <div className={styles.icon_group}>
                      <Check onClick={() => CheckedTask(val.id)} size={16} />
                      <Trash2 onClick={() => DeleteTask(val.id)} size={16} />
                      <Edit onClick={() => Edit_task(val.id)} size={16} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.right_left}>
            <h3 style={{ color: "white" }}>Most frequent Task</h3>
            <ul>
              {Array.from(freq.values()).map((val) => (
                <li key={val.id} className={styles.freqRow}>
                  <span className={styles.taskName}>{val.task}</span>
                  <div className={styles.barContainer}>
                    <div
                      className={styles.freqBar}
                      style={{ width: `${(val.counter / maxFreq) * 100}%` }}
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.right_right}></div>
        </div>
      </div>
    </div>
  );
}
