import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AdminBank = () => {
  const [bankName, setBankName] = useState("");
  const [ifsc, setIFSC] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankHolderName, setBankHolderName] = useState("");

  useEffect(() => {
    const fetchBankDetails = async () => {
      const docRef = doc(db, "bank", "bankDetails");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBankName(data.bankName || "");
        setIFSC(data.ifsc || "");
        setAccountNumber(data.accountNumber || "");
        setBankHolderName(data.bankHolderName || "");
      }
    };
    fetchBankDetails();
  }, []);

  const handleSave = async () => {
    const docRef = doc(db, "bank", "bankDetails");
    await setDoc(docRef, {
      bankName,
      ifsc,
      accountNumber,
      bankHolderName,
    });
    alert("Bank details updated successfully");
  };

  return (
    <div className="p-6 m-6 max-w-xl mx-auto ">
      <h2 className="text-2xl font-bold text-center">Society Bank Details</h2>
      <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
        <div className="space-y-2">
          <label className="block font-semibold">Bank Name</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <label className="block font-semibold">IFSC Code</label>
          <input
            type="text"
            value={ifsc}
            onChange={(e) => setIFSC(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <label className="block font-semibold">Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <label className="block font-semibold">Bank Holder Name</label>
          <input
            type="text"
            value={bankHolderName}
            onChange={(e) => setBankHolderName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBank;
