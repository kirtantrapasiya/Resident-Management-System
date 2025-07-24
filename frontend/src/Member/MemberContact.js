import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const MemberContact = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError('');
      try {
        const snapshot = await getDocs(collection(db, 'admin'));
        const adminList = snapshot.docs.map(doc => doc.data());
        setAdmins(adminList);
      } catch (err) {
        setError('Error fetching admin contacts.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Admin Contacts</h2>
      {admins.length === 0 ? (
        <div className="text-center text-gray-500">No admin contacts found.</div>
      ) : (
        <ul className="space-y-6">
          {admins.map((admin, idx) => (
            <li key={idx} className="border-b pb-4 bg-green-50 rounded-xl p-4 shadow hover:shadow-md transition">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="font-semibold text-lg text-green-900">{admin.fullName}</div>
                <div className="text-sm text-gray-600">{admin.email}</div>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-gray-700">
                <div><span className="font-semibold">Phone:</span> {admin.phoneNumber}</div>
                <div><span className="font-semibold">Building No.:</span> {admin.buildingNo}</div>
                <div><span className="font-semibold">Society:</span> {admin.societyName}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MemberContact;