import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const AdminFund = () => {
  const [funds, setFunds] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("credit");
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchFunds = async () => {
    const snapshot = await getDocs(collection(db, "funds"));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFunds(list);
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("credit");
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !type) return;

    const data = {
      title,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString().split("T")[0],
    };

    if (editId) {
      await updateDoc(doc(db, "funds", editId), data);
    } else {
      await addDoc(collection(db, "funds"), data);
    }

    fetchFunds();
    resetForm();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "funds", id));
    fetchFunds();
  };

  const handleEdit = (fund) => {
    setEditId(fund.id);
    setTitle(fund.title);
    setAmount(fund.amount);
    setType(fund.type);
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text("Fund Report", 14, 16);

    const tableColumn = ["Date", "Title", "Type", "Amount"];
    const tableRows = [];

    funds.forEach(fund => {
      const rowData = [fund.date, fund.title, fund.type, `₹ ${fund.amount}`];
      tableRows.push(rowData);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("Fund_Report.pdf");
  };

  const filteredFunds = funds.filter(fund => {
    return (
      (!filterType || fund.type === filterType) &&
      (!filterDate || fund.date === filterDate)
    );
  });

  const totalFund = funds.reduce((acc, fund) => {
    return fund.type === "credit" ? acc + fund.amount : acc - fund.amount;
  }, 0);

  const paginatedFunds = filteredFunds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredFunds.length / itemsPerPage);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between m-6">
        <h1 className="text-2xl font-bold">💰 Total Fund: ₹ {totalFund.toFixed(2)}</h1>
        <div className="text-right">
          <button onClick={handleGeneratePDF} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"> View Report</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">{editId ? "Edit Fund" : "Add Fund"}</h2>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded mb-2" />
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border p-2 rounded mb-2" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border p-2 rounded mb-2">
          <option value="credit">You'll Get (Credit)</option>
          <option value="debit">You'll Give (Debit)</option>
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{editId ? "Update" : "Add"} Fund</button>
      </form>

      <div className="mb-4">
        <label className="mr-2">Filter by Type:</label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border p-1 rounded mr-4">
          <option value="">All</option>
          <option value="credit">You'll Get</option>
          <option value="debit">You'll Give</option>
        </select>

        <label className="mr-2">Filter by Date:</label>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border p-1 rounded" />
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Date</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedFunds.map(fund => (
            <tr key={fund.id}>
              <td className="border p-2">{fund.date}</td>
              <td className="border p-2">{fund.title}</td>
              <td className="border p-2 capitalize">{fund.type}</td>
              <td className="border p-2">₹ {fund.amount}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEdit(fund)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Edit</button>
                <button onClick={() => handleDelete(fund.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="px-3 py-1 bg-gray-300 rounded">Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="px-3 py-1 bg-gray-300 rounded">Next</button>
      </div>
    </div>
  );
};

export default AdminFund;
