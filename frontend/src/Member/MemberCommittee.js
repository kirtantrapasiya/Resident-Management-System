import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const MemberCommittee = () => {
  const [committees, setCommittees] = useState([]);

  useEffect(() => {
    const fetchCommittees = async () => {
      const snapshot = await getDocs(collection(db, "committees"));
      setCommittees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCommittees();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Committee Information</h2>

      {committees.length === 0 ? (
        <p className="text-gray-500 text-center">No committee data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 font-medium">Committee Name</th>
                <th className="text-left p-3 font-medium">Members</th>
                <th className="text-left p-3 font-medium">Rules File</th>
              </tr>
            </thead>
            <tbody>
              {committees.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.committeeName}</td>
                  <td className="p-3">
                    <ul className="list-disc pl-5">
                      {c.members.map((m, i) => (
                        <li key={i}>
                          {m.name} - {m.role} ({m.contact})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-3">
                    {c.rulesURL ? (
                      <a
                        href={c.rulesURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View File
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No File</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MemberCommittee;
