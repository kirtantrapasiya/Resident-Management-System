import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const MemberBank = () => {
  const [bankDetails, setBankDetails] = useState([]);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'bank'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBankDetails(data);
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bank Details</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Bank Name</th>
              <th className="p-2 border">Account Number</th>
              <th className="p-2 border">IFSC Code</th>
              <th className="p-2 border">Bank Holder Name</th>
            </tr>
          </thead>
          <tbody>
            {bankDetails.length > 0 ? (
              bankDetails.map((bank) => (
                <tr key={bank.id}>
                  <td className="p-2 border text-center">{bank.bankName}</td>
                  <td className="p-2 border text-center">{bank.accountNumber}</td>
                  <td className="p-2 border text-center">{bank.ifsc}</td>
                  <td className="p-2 border text-center">{bank.bankHolderName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  No bank details available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberBank;
