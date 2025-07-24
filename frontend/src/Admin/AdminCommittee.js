import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import axios from "axios";

const AdminCommittee = () => {
  const [committeeName, setCommitteeName] = useState("");
  const [members, setMembers] = useState([{ name: "", role: "", contact: "" }]);
  const [rulesFile, setRulesFile] = useState(null);
  const [committees, setCommittees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchCommittees = async () => {
      const snapshot = await getDocs(collection(db, "committees"));
      setCommittees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCommittees();
  }, []);

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMember = () => setMembers([...members, { name: "", role: "", contact: "" }]);

  const removeMember = index => {
    const updated = [...members];
    updated.splice(index, 1);
    setMembers(updated);
  };

  const handleFileUpload = async () => {
    if (!rulesFile) return "";
    const formData = new FormData();
    formData.append("image", rulesFile);
    const res = await axios.post("http://localhost:5000/api/upload", formData);
    return res.data.url;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const uploadedURL = await handleFileUpload();
    const newCommittee = {
      committeeName,
      members,
      rulesURL: uploadedURL,
    };

    if (editingId) {
      await updateDoc(doc(db, "committees", editingId), newCommittee);
    } else {
      await addDoc(collection(db, "committees"), newCommittee);
    }

    window.location.reload();
  };

  const handleEdit = data => {
    setCommitteeName(data.committeeName);
    setMembers(data.members);
    setEditingId(data.id);
  };

  const handleDelete = async id => {
    await deleteDoc(doc(db, "committees", id));
    setCommittees(committees.filter(c => c.id !== id));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-blue-700"> Committee Management</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-4"
      >
        <div>
          <label className="block font-medium mb-1">Committee Name</label>
          <input
            value={committeeName}
            onChange={e => setCommitteeName(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Members</label>
          {members.map((member, index) => (
            <div
              key={index}
              className="flex gap-2 mb-2 items-center"
            >
              <input
                placeholder="Name"
                value={member.name}
                onChange={e => handleMemberChange(index, "name", e.target.value)}
                className="border rounded-md px-3 py-2 w-1/3"
                required
              />
              <input
                placeholder="Role"
                value={member.role}
                onChange={e => handleMemberChange(index, "role", e.target.value)}
                className="border rounded-md px-3 py-2 w-1/3"
                required
              />
              <input
                placeholder="Contact"
                value={member.contact}
                onChange={e => handleMemberChange(index, "contact", e.target.value)}
                className="border rounded-md px-3 py-2 w-1/3"
                required
              />
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMember}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add Member
          </button>
        </div>
        <div>
          <label className="block font-medium mb-1">Rules Document (PDF/Image)</label>
          <input
            type="file"
            onChange={e => setRulesFile(e.target.files[0])}
            accept=".pdf,.jpg,.png"
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          {editingId ? "Update Committee" : "Add Committee"}
        </button>
      </form>

      <h3 className="text-2xl font-semibold mb-3 text-gray-800"> Committee List</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 font-medium">Committee Name</th>
              <th className="text-left p-3 font-medium">Members</th>
              <th className="text-left p-3 font-medium">Rules File</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {committees.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.committeeName}</td>
                <td className="p-3">
                  <ul className="list-disc pl-5">
                    {c.members.map((m, i) => (
                      <li key={i}>{m.name} - {m.role} ({m.contact})</li>
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
                    "-"
                  )}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCommittee;
