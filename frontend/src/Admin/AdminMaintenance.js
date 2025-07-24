// src/Admin/Home/AdminMaintenance.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

const AdminMaintenance = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [records, setRecords] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchRecords = async () => {
    const q = query(collection(db, 'maintenance'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRecords(data);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let fileUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!data.url) throw new Error(data.error || 'Upload failed');
        fileUrl = data.url;
      }

      const payload = {
        title,
        date,
        amount,
        description,
        fileUrl,
        fileName: file?.name || '',
        fileSize: file?.size || 0,
        createdAt: serverTimestamp(),
        createdBy: 'admin'
      };

      if (editingId) {
        await updateDoc(doc(db, 'maintenance', editingId), payload);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'maintenance'), payload);

        // 🔔 Notify all members
        await fetch('/api/notify-members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: 'New Maintenance Record',
            message: `Maintenance topic: ${title}\nAmount: ₹${amount}\nDate: ${date}`
          })
        });
      }

      setTitle('');
      setDate('');
      setAmount('');
      setDescription('');
      setFile(null);
      fetchRecords();
      alert('Saved successfully!');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (rec) => {
    setTitle(rec.title);
    setDate(rec.date);
    setAmount(rec.amount);
    setDescription(rec.description || '');
    setEditingId(rec.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance record?')) return;
    await deleteDoc(doc(db, 'maintenance', id));
    fetchRecords();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Maintenance / Society Expenditure</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mb-10">
        <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Entry' : 'Add Maintenance Entry'}</h3>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mb-4" required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded mb-4" required />
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border rounded mb-4" required />
        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded mb-4" />
        <input type="file" onChange={handleFileChange} className="mb-4" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
        <button type="submit" disabled={uploading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          {uploading ? 'Saving...' : (editingId ? 'Update Entry' : 'Add Entry')}
        </button>
      </form>

      {/* Display cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {records.length === 0 ? (
          <p className="text-center col-span-full text-gray-500">No maintenance records found.</p>
        ) : (
          records.map(rec => (
            <div key={rec.id} className="bg-white shadow p-4 rounded">
              <h4 className="font-bold text-lg mb-1">{rec.title}</h4>
              <p className="text-sm text-gray-600 mb-1">Date: {rec.date}</p>
              <p className="text-sm text-gray-600 mb-1">Amount: ₹{rec.amount}</p>
              {rec.description && <p className="text-sm text-gray-600 mb-2">{rec.description}</p>}
              {rec.fileUrl && (
                <a href={rec.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm">View Attachment</a>
              )}
              <div className="flex gap-4 mt-2">
                <button onClick={() => handleEdit(rec)} className="text-yellow-600 text-sm underline">Edit</button>
                <button onClick={() => handleDelete(rec.id)} className="text-red-600 text-sm underline">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMaintenance;
