import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase";

const MemberEvents = () => {
  const [events, setEvents] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 5;

  const fetchEvents = async (initial = false) => {
    try {
      const q = query(
        collection(db, "events"),
        orderBy("date", "desc"),
        ...(initial
          ? [limit(PAGE_SIZE)]
          : [startAfter(lastDoc), limit(PAGE_SIZE)])
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

  useEffect(() => {
    fetchEvents(true);
  }, [fetchEvents]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6"> Events</h2>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Banner</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map((event) => (
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
  );
};

export default MemberEvents;
