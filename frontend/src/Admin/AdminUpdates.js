import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const AdminUpdate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const snapshot = await getDocs(collection(db, 'announcements'));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAnnouncements(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);
      let fileUrl = null;

      // Upload file if exists
      if (file) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post('http://localhost:5000/api/upload', formData);
        fileUrl = response.data.url;
      }

      const payload = {
        title,
        description,
        date: serverTimestamp(),
        fileUrl,
      };

      if (editId) {
        await updateDoc(doc(db, 'announcements', editId), payload);
        setEditId(null);
      } else {
        await addDoc(collection(db, 'announcements'), payload);
        await axios.post('https://us-central1-resident-management-syst-b06cb.cloudfunctions.net/notifyEvent', {
          title,
          description,
        });
      }

      setTitle('');
      setDescription('');
      setFile(null);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error adding announcement:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditId(announcement.id);
    setTitle(announcement.title);
    setDescription(announcement.description);
    setFile(null);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'announcements', id));
    fetchAnnouncements();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Title', 'Description', 'Date']],
      body: announcements.map(a => [
        a.title,
        a.description,
        a.date?.toDate().toLocaleDateString() || '',
      ]),
    });
    doc.save('announcements.pdf');
  };

  const filtered = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4"> Announcements</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-4">
        <input
          type="text"
          placeholder="Announcement Title"
          className="w-full p-2 border rounded"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 border rounded"
          value={description}
          required
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editId ? 'Update' : 'Add'} Announcement
        </button>
      </form>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder=" Search..."
          className="p-2 border rounded w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="bg-green-700 text-white px-4 py-2 rounded"
          onClick={exportPDF}
        >
           Export to PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">File</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td className="p-2 border text-center">{a.title}</td>
                <td className="p-2 pl-6 border ">{a.description}</td>
                <td className="p-2 border text-center">
                  {a.date?.toDate().toLocaleDateString() || '—'}
                </td>
                <td className="p-2 border text-center">
                  {a.fileUrl ? (
                    <a
                      href={a.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                       View File
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className=" border space-x-4">
                  <div className='flex gap-6 justify-center'>
                    <button
                      onClick={() => handleEdit(a)}
                      className="text-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>                    
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No announcements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUpdate;
