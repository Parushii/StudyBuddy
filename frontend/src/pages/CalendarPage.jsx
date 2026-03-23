import React, { useEffect, useState } from "react";
import { Calendar, Plus, Trash2, Pencil } from "lucide-react";

/* ===== Floating Leaves (same as flashcards) ===== */
const LEAF_DEFS = [
  { viewBox: "0 0 20 60", path: "M10 0 C16 10, 20 25, 16 40 C13 52, 10 60, 10 60 C10 60, 7 52, 4 40 C0 25, 4 10, 10 0Z", vein: "M10 0 L10 60" },
];
const LEAVES = Array.from({ length: 10 }, (_, i) => ({
  def: LEAF_DEFS[0],
  width: 12 + i * 2,
  startX: (i * 10) % 90,
  rotate: i * 40,
  duration: 12 + i,
}));

const FloatingLeaves = () => (
  <>
    <style>{`
      ${LEAVES.map((l, i) => `
        @keyframes leafFall${i} {
          0% { transform: translateY(-80px) rotate(${l.rotate}deg); opacity:0;}
          50% { opacity:0.4;}
          100% { transform: translateY(100vh) rotate(${l.rotate + 180}deg); opacity:0;}
        }
      `).join("")}
    `}</style>

    <div className="fixed inset-0 pointer-events-none">
      {LEAVES.map((l, i) => (
        <svg key={i} viewBox={l.def.viewBox}
          style={{
            position: "absolute",
            left: `${l.startX}%`,
            width: `${l.width}px`,
            animation: `leafFall${i} ${l.duration}s linear infinite`
          }}>
          <path d={l.def.path} fill="#5a8f4e"/>
        </svg>
      ))}
    </div>
  </>
);

/* ===== Fireflies ===== */
const Fireflies = () => (
  <div className="fixed inset-0 pointer-events-none">
    {[...Array(10)].map((_, i) => (
      <div key={i}
        className="absolute w-2 h-2 rounded-full bg-yellow-200"
        style={{
          left: `${Math.random() * 90}%`,
          top: `${Math.random() * 90}%`,
          boxShadow: "0 0 10px #fff",
          animation: `pulse ${3 + i}s infinite`
        }}
      />
    ))}
  </div>
);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function CalendarPage() {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [eventId, setEventId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const toISO = (date) => new Date(date).toISOString();

  /* ===== FETCH ===== */
  const fetchEvents = async () => {
    const res = await fetch(`${BACKEND_URL}/api/calendar/events`, { credentials: "include" });
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ===== GOOGLE AUTH ===== */
  const connectGoogle = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  /* ===== CREATE / UPDATE ===== */
  const submitEvent = async () => {
    if (!title || !start || !end) return alert("Fill all fields");

    setLoading(true);

    const url = eventId
      ? `${BACKEND_URL}/api/calendar/update/${eventId}`
      : `${BACKEND_URL}/api/calendar/create`;

    const method = eventId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, start: toISO(start), end: toISO(end) }),
    });

    setTitle("");
    setStart("");
    setEnd("");
    setEventId(null);
    fetchEvents();
    setLoading(false);
  };

  /* ===== DELETE ===== */
  const deleteEvent = async (id) => {
    if (!confirm("Delete this event?")) return;

    await fetch(`${BACKEND_URL}/api/calendar/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchEvents();
  };

  /* ===== EDIT ===== */
  const editEvent = (event) => {
    setEventId(event.googleEventId);
    setTitle(event.title);
    setStart(event.start.slice(0, 16));
    setEnd(event.end.slice(0, 16));
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        fontFamily: "Georgia, serif",
        backgroundColor: "#E8DCC8",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(210,180,140,0.25) 0px, rgba(210,180,140,0.25) 2px, transparent 2px, transparent 40px)",
      }}
    >
      <FloatingLeaves />
      <Fireflies />

      <div className="relative z-10 p-8 max-w-6xl mx-auto">

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-8 text-center"
          style={{ color: "#3b2010" }}>
          🌿 Study Planner
        </h1>

        {/* CONNECT */}
        <div className="text-center mb-8">
          <button
            onClick={connectGoogle}
            className="px-6 py-3 rounded-xl"
            style={{
              background: "linear-gradient(135deg,#5a8f4e,#3d6b35)",
              color: "white",
              border: "2px solid #2d5a27",
            }}
          >
            Connect Google Calendar
          </button>
        </div>

        <div className="flex gap-8">

          {/* LEFT FORM */}
          <div className="w-1/2 space-y-5">

            {[{label:"Event Title",value:title,set:setTitle},
              {label:"Start Time",value:start,set:setStart,type:"datetime-local"},
              {label:"End Time",value:end,set:setEnd,type:"datetime-local"}
            ].map((field, i) => (
              <div key={i}
                className="p-5 rounded-2xl"
                style={{
                  background: "#fff8ec",
                  border: "2px solid #c4956a",
                  boxShadow: "4px 4px 0px rgba(196,149,106,0.4)"
                }}
              >
                <label className="text-sm block mb-2">
                  {field.label}
                </label>

                <input
                  type={field.type || "text"}
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    border: "1px solid #c4956a",
                    background: "#fffdf8"
                  }}
                />
              </div>
            ))}

            <button
              onClick={submitEvent}
              disabled={loading}
              className="w-full py-3 rounded-xl"
              style={{
                background: "#6aaa5a",
                color: "white",
                border: "2px solid #2d5a27"
              }}
            >
              {eventId ? "Update Event" : "Create Event"}
            </button>
          </div>

          {/* RIGHT EVENTS */}
          <div className="w-1/2 space-y-4">
            {events.map((event) => (
              <div key={event._id}
                className="p-4 rounded-2xl"
                style={{
                  background: "#fdf6ec",
                  border: "2px solid #c4956a",
                  boxShadow: "3px 3px 0px rgba(196,149,106,0.4)"
                }}
              >
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-sm mb-3">
                  {new Date(event.start).toLocaleString()} → {new Date(event.end).toLocaleString()}
                </p>

                <div className="flex gap-3">
                  <button onClick={() => editEvent(event)}
                    className="px-3 py-1 rounded"
                    style={{ background: "#e8a020", color: "white" }}>
                    <Pencil size={14}/> Edit
                  </button>

                  <button onClick={() => deleteEvent(event.googleEventId)}
                    className="px-3 py-1 rounded"
                    style={{ background: "#e85050", color: "white" }}>
                    <Trash2 size={14}/> Delete
                  </button>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <p className="text-center text-gray-600">
                🌱 No events yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}