import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  limit,
  startAfter,
  orderBy,
  addDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import jsPDF from 'jspdf';

const AdminRooms = () => {
  const [members, setMembers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allFetched, setAllFetched] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});

  const PAGE_SIZE = 6;

  // Fetch first page
  const fetchInitial = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '!=', 'admin'),
        orderBy('role'),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(usersData);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setAllFetched(snapshot.docs.length < PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  // Fetch more pages
  const fetchMore = async () => {
    if (allFetched || !lastVisible) return;
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '!=', 'admin'),
        orderBy('role'),
        startAfter(lastVisible),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(prev => [...prev, ...usersData]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      if (snapshot.docs.length < PAGE_SIZE) setAllFetched(true);
    } catch (error) {
      console.error("Error fetching more:", error);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  // Delete
  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this record?");
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      alert('User deleted successfully!');
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Edit
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      roomNo: user.roomNo || '',
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      apartmentNumber: user.apartmentNumber || '',
      status: user.status || '',
      startingDate: user.startingDate || '',
      endingDate: user.endingDate || ''
    });
  };

  // Update
  const handleUpdate = async () => {
    try {
      const userId = editingUser.id;
      const prevStatus = editingUser.status;
      let updateData = { ...formData };
      // Handle status change
      if (prevStatus !== formData.status) {
        if (formData.status === 'inactive') {
          updateData.endingDate = new Date().toISOString();
        } else if (formData.status === 'active') {
          updateData.startingDate = new Date().toISOString();
          updateData.endingDate = '';
        }
      }
      await updateDoc(doc(db, 'users', userId), updateData);
      // Log the edit action
      const auth = getAuth();
      const adminUser = auth.currentUser;
      await addDoc(collection(db, 'users', userId, 'logs'), {
        action: 'edit',
        date: new Date().toISOString(),
        admin: adminUser ? adminUser.email : 'Unknown',
        type: 'edit',
        details: updateData
      });
      alert('User updated successfully!');
      setEditingUser(null);
      fetchInitial(); // refresh
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  // Filter
  const filteredMembers = members.filter((member) => {
    const name = `${member.firstName} ${member.lastName}`.toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) ||
      String(member.roomNo).includes(searchTerm)
    );
  });

  // Download PDF with user info and latest log date
  const handleExploreFile = async (member) => {
    // Fetch all log entries for this user
    const logsCol = collection(db, 'users', member.id, 'logs');
    const logsSnap = await getDocs(logsCol);
    let logs = [];
    if (!logsSnap.empty) {
      logs = logsSnap.docs.map(doc => doc.data());
      logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    // Generate PDF
    const docPdf = new jsPDF();
    docPdf.setFontSize(16);
    docPdf.text('User Details', 14, 18);
    docPdf.setFontSize(12);
    let y = 30;
    docPdf.text(`Full Name: ${member.fullName || ''}`, 14, y); y += 8;
    docPdf.text(`Apartment Number: ${member.apartmentNumber || ''}`, 14, y); y += 8;
    docPdf.text(`Room No.: ${member.roomNo || ''}`, 14, y); y += 8;
    docPdf.text(`Email: ${member.email || ''}`, 14, y); y += 8;
    docPdf.text(`Phone Number: ${member.phoneNumber || ''}`, 14, y); y += 8;
    docPdf.text(`Status: ${member.status || ''}`, 14, y); y += 8;
    docPdf.text(`At Date: ${logs.length > 0 ? new Date(logs[0].date).toLocaleString() : new Date().toLocaleString()}`, 14, y); y += 12;
    // Add logs section
    docPdf.setFontSize(14);
    docPdf.text('Audit Log:', 14, y); y += 8;
    docPdf.setFontSize(11);
    if (logs.length === 0) {
      docPdf.text('No logs found.', 14, y); y += 8;
    } else {
      logs.forEach((log, idx) => {
        let logLine = `${idx + 1}. [${log.action}] by ${log.admin} on ${new Date(log.date).toLocaleString()} (type: ${log.type})`;
        if (log.details) {
          logLine += ` | Details: ${JSON.stringify(log.details)}`;
        }
        docPdf.text(logLine, 14, y);
        y += 7;
        if (y > 270) { docPdf.addPage(); y = 20; }
      });
    }
    docPdf.save(`${member.fullName || 'user'}_details.pdf`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Room Details (Members)</h2>

      {/* Search */}
      <div className="mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search by name or room no."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div key={member.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition mb-4">
              <h3 className="text-xl font-semibold mb-2 text-green-700">Room No: {member.roomNo}</h3>
              <div className="space-y-1 text-gray-700">
                <p><strong>Full Name:</strong> {member.fullName}</p>
                <p><strong>Email:</strong> {member.email}</p>
                <p><strong>Phone Number:</strong> {member.phoneNumber}</p>
                <p><strong>Apartment Number:</strong> {member.apartmentNumber}</p>
                <p><strong>Status:</strong> <span className="capitalize">{member.status}</span></p>
                <p><strong>Starting Date:</strong> {member.startingDate ? new Date(member.startingDate).toLocaleDateString() : ''}</p>
                <p><strong>Ending Date:</strong> {member.endingDate ? new Date(member.endingDate).toLocaleDateString() : ''}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => handleEdit(member)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 shadow"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 shadow"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleExploreFile(member)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 shadow"
                >
                  Explore File
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">No members found.</p>
        )}
      </div>

      {/* Load More */}
      {!searchTerm && !allFetched && (
        <div className="mt-8 text-center">
          <button
            onClick={fetchMore}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Load More
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-center">Edit Member</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Room No"
                value={formData.roomNo}
                onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border rounded p-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Apartment Number"
                value={formData.apartmentNumber}
                onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                className="w-full border rounded p-2"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded p-2"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <input
                type="date"
                placeholder="Starting Date"
                value={formData.startingDate ? formData.startingDate.split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })}
                className="w-full border rounded p-2"
              />
              <input
                type="date"
                placeholder="Ending Date"
                value={formData.endingDate ? formData.endingDate.split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, endingDate: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;
