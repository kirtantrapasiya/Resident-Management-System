import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter
} from "firebase/firestore";
import { db } from "../firebase";
import axios from "axios";

const AdminEvents = () => {
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    banner: "",
  });
  const [file, setFile] = useState(null);
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Pagination
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 5;

  useEffect(() => {
    fetchEvents(true);
  }, [fetchEvents]);

  const fetchEvents = async (initial = false) => {
    try {
      const q = query(
        collection(db, "events"),
        orderBy("date", "desc"),
        ...(initial ? [limit(PAGE_SIZE)] : [startAfter(lastDoc), limit(PAGE_SIZE)])
      );

      const snapshot = await new Promise((resolve) => {
        onSnapshot(q, (snap) => resolve(snap));
      });

      const eventsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (initial) {
        setEvents(eventsList);
      } else {
        setEvents((prev) => [...prev, ...eventsList]);
      }

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendNotification = async (eventData) => {
    try {
      const notify = window.firebase.functions().httpsCallable("notifyEvent");
      await notify(eventData);
      console.log("Notification sent");
    } catch (error) {
      console.error("Notification failed:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedUrl = form.banner;

      // Upload file if selected
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        const uploadRes = await axios.post("http://localhost:5000/api/upload", formData);
        uploadedUrl = uploadRes.data.url;
      }

      const eventData = {
        title: form.title,
        date: form.date,
        time: form.time,
        location: form.location,
        banner: uploadedUrl || "",
      };

      if (editingId) {
        await updateDoc(doc(db, "events", editingId), eventData);
      } else {
        await addDoc(collection(db, "events"), eventData);
        await sendNotification(eventData); // optional
      }

      // Reset form
      setForm({ title: "", date: "", time: "", location: "", banner: "" });
      setFile(null);
      setEditingId(null);
      fetchEvents(true);
      document.querySelector('input[type="file"]').value = "";
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      banner: event.banner,
    });
    setEditingId(event.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "events", id));
      fetchEvents(true);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Event" : "Add Event"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-xl">
        <div className="flex gap-4">
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Event Title"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />         
        </div>
        <div className="flex gap-4">
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingId ? "Update Event" : "Add Event"}
        </button>
      </form>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold"> Event List</h3>
        </div>

        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Banner</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map(event => (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{event.title}</td>
                    <td className="px-4 py-2">{event.date}</td>
                    <td className="px-4 py-2">{event.time}</td>
                    <td className="px-4 py-2">{event.location}</td>
                    <td className="px-4 py-2">
                      {event.banner ? (
                        <a
                          href={event.banner}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">No file</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => fetchEvents(false)}
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
