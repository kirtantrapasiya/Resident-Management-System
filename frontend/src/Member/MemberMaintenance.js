import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const MemberMaintenance = () => {
  const [maintenanceData, setMaintenanceData] = useState([]);

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const fetchMaintenanceData = async () => {
    const snapshot = await getDocs(collection(db, 'maintenance'));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMaintenanceData(data);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Maintenance Records (Read-Only)</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">File</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceData.map((doc) => (
              <tr key={doc.id}>
                <td className="p-2 border text-center">{doc.title}</td>
                <td className="p-2 pl-6 border">{doc.description}</td>
                <td className="p-2 border text-center">{doc.amount}</td>
                <td className="p-2 border text-center">{doc.date}</td>
                <td className="p-2 border text-center">
                  {doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
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
              </tr>
            ))}
            {maintenanceData.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No maintenance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberMaintenance;
