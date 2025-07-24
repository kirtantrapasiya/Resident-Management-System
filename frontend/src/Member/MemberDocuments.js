import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const MemberDocuments = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const snapshot = await getDocs(collection(db, 'documents'));
    const docsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDocuments(docsData);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Member Documents</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">File</th>
              <th className="p-2 border">Uploaded At</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="p-2 border text-center">{doc.title}</td>
                <td className="p-2 pl-6 border">{doc.description}</td>
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
                <td className="p-2 border text-center">
                  {doc.uploadedAt?.toDate().toLocaleString() || '—'}
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberDocuments;
