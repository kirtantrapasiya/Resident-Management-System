import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MemberFund = () => {
  const [funds, setFunds] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    const snapshot = await getDocs(collection(db, "funds"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFunds(list);
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text("Fund Report", 14, 16);

    const tableColumn = ["Date", "Title", "Type", "Amount"];
    const tableRows = [];

    funds.forEach((fund) => {
      const rowData = [fund.date, fund.title, fund.type, `₹ ${fund.amount}`];
      tableRows.push(rowData);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("Fund_Report.pdf");
  };

  const filteredFunds = funds.filter((fund) => {
    return (
      (!filterType || fund.type === filterType) &&
      (!filterDate || fund.date === filterDate)
    );
  });

  const totalFund = funds.reduce((acc, fund) => {
    return fund.type === "credit" ? acc + fund.amount : acc - fund.amount;
  }, 0);

  const paginatedFunds = filteredFunds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredFunds.length / itemsPerPage);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between m-6">
        <h1 className="text-2xl font-bold">💰 Total Fund: ₹ {totalFund.toFixed(2)}</h1>
        <div className="text-right">
          <button
            onClick={handleGeneratePDF}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            View Report
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="mr-2">Filter by Type:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border p-1 rounded mr-4"
        >
          <option value="">All</option>
          <option value="credit">You'll Get</option>
          <option value="debit">You'll Give</option>
        </select>

        <label className="mr-2">Filter by Date:</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border p-1 rounded"
        />
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Date</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {paginatedFunds.map((fund) => (
            <tr key={fund.id}>
              <td className="border p-2">{fund.date}</td>
              <td className="border p-2">{fund.title}</td>
              <td className="border p-2 capitalize">{fund.type}</td>
              <td className="border p-2">₹ {fund.amount}</td>
            </tr>
          ))}
          {paginatedFunds.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MemberFund;
