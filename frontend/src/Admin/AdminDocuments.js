import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { doc, deleteDoc } from 'firebase/firestore';

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore';

function AdminDocuments() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchDocs = async () => {
    try {
      const q = query(collection(db, 'documents'), orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocs(data);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title) return alert("Please provide a title.");

    setUploading(true);
    setError('');

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

      if (editingId) {
        const updateData = { title, description };
        if (fileUrl) updateData.fileUrl = fileUrl;
        await updateDoc(doc(db, 'documents', editingId), updateData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'documents'), {
          title,
          description,
          fileUrl,
          fileName: file?.name || '',
          fileSize: file?.size || 0,
          uploadedAt: serverTimestamp(),
          uploadedBy: 'admin'
        });
      }

      setTitle('');
      setDescription('');
      setFile(null);
      fetchDocs();
      alert('Document saved successfully!');

      if (!editingId) {
        await fetch('/api/notify-members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: 'New Society Document Uploaded',
            message: `New document "${title}" has been uploaded. Please check the portal.`
          })
        });
      }
    } catch (err) {
      console.error("Save failed:", err);
      setError('Save failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDoc(doc(db, 'documents', id));
      fetchDocs();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (doc) => {
    setTitle(doc.title);
    setDescription(doc.description || '');
    setEditingId(doc.id);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Admin Documents</h2>

      <form
        onSubmit={handleUpload}
        className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mb-10"
      >
        <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Document' : 'Upload New Document'}</h3>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {uploading ? 'Saving...' : (editingId ? 'Update Document' : 'Upload Document')}
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.length === 0 ? (
          <p className="text-center col-span-full text-gray-500">No documents uploaded yet.</p>
        ) : (
          docs.map(doc => (
            <div key={doc.id} className="bg-white shadow p-4 rounded">
              <h4 className="font-bold text-lg mb-1">{doc.title}</h4>
              {doc.description && <p className="text-sm mb-2 text-gray-600">{doc.description}</p>}
              <div className="flex gap-4 mb-2">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium underline"
                >
                  View
                </a>
                <button
                  onClick={() => handleEdit(doc)}
                  className="text-yellow-600 font-medium underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 font-medium underline"
                >
                  Delete
                </button>
              </div>
              <p className="text-xs text-gray-500">Size: {(doc.fileSize / 1024).toFixed(2)} KB</p>
              <p className="text-xs text-gray-400">File: {doc.fileName}</p>
              <p className="text-xs text-gray-400">Uploaded: {doc.uploadedAt?.toDate?.().toLocaleString?.()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDocuments;
