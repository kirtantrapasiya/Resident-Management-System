import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';  // Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const AdminNavbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);  // To check if the user is an admin
  const [loading, setLoading] = useState(true);   // To handle loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication state change
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch admin role from Firestore
        const userRef = doc(db, 'admin', user.uid); // admin collection
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.role === 'admin') {
            setIsAdmin(true); // User is an admin
          } else {
            setIsAdmin(false); // Not an admin, redirect to Member page
            navigate('/Member');
          }
        }
      } else {
        setIsAdmin(false); // User is not logged in, redirect to AdminLogin
        navigate('/AdminLogin');
      }
      setLoading(false); // Stop loading when authentication state is checked
    });

    // Cleanup on component unmount
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);  // Sign out the user
      navigate('/AdminLogin');  // Redirect to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return null; // Show nothing while loading
  }

  if (!isAdmin) {
    return null; // Don't render the navbar if the user is not an admin or not logged in
  }

  return (
    <div className="bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <div className="text-2xl font-semibold">
          <Link to="/Admin" className="text-white hover:text-gray-200">Admin Panel</Link>
        </div>
        <div className="space-x-4">
          <Link to="/AdminRooms" className="text-white hover:text-gray-200">Rooms</Link>
          <Link to="/AdminDocuments" className="text-white hover:text-gray-200">Documents</Link>
          <Link to="/AdminMaintenance" className="text-white hover:text-gray-200">Maintenance</Link>
          <Link to="/AdminFund" className="text-white hover:text-gray-200">Fund</Link>
          <Link to="/AdminEvents" className="text-white hover:text-gray-200">Events</Link>
          <Link to="/AdminCommittee" className="text-white hover:text-gray-200">Committee</Link>
          <Link to="/AdminUpdates" className="text-white hover:text-gray-200">Updates</Link>
          <Link to="/AdminBank" className="text-white hover:text-gray-200">Bank</Link>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
