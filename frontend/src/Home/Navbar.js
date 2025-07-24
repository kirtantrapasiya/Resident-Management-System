import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow flex items-center justify-between px-6 py-3">
      <Link to="/" className="text-xl font-bold text-indigo-700">Resident Management</Link>
      <div className="flex items-center gap-4">
        {!loading && !user && (
          <>
            <Link to="/AdminLogin" className="text-indigo-600 hover:underline">Admin Login</Link>
            <Link to="/AdminRegister" className="text-indigo-600 hover:underline">Admin Register</Link>
            <span className="text-gray-400">|</span>
            <Link to="/MemberLogin" className="text-green-600 hover:underline">Member Login</Link>
            <Link to="/MemberRegister" className="text-green-600 hover:underline">Member Register</Link>
          </>
        )}
        {!loading && user && (
          <>
            {/* Feature links for admin */}
            {role === 'admin' && (
              <>
                <Link to="/AdminRooms" className="hover:underline">Rooms</Link>
                <Link to="/AdminDocuments" className="hover:underline">Documents</Link>
                <Link to="/AdminMaintenance" className="hover:underline">Maintenance</Link>
                <Link to="/AdminFund" className="hover:underline">Fund</Link>
                <Link to="/AdminEvents" className="hover:underline">Events</Link>
                <Link to="/AdminCommittee" className="hover:underline">Committee</Link>
                <Link to="/AdminUpdates" className="hover:underline">Updates</Link>
                <Link to="/AdminBank" className="hover:underline">Bank</Link>
                <Link to="/AdminProfile" className="hover:underline">Profile</Link>
              </>
            )}
            {/* Feature links for member */}
            {role === 'member' && (
              <>
                <Link to="/MemberRoom" className="hover:underline">Room</Link>
                <Link to="/MemberDocuments" className="hover:underline">Documents</Link>
                <Link to="/MemberMaintenance" className="hover:underline">Maintenance</Link>
                <Link to="/MemberFund" className="hover:underline">Fund</Link>
                <Link to="/MemberEvents" className="hover:underline">Events</Link>
                <Link to="/MemberCommittee" className="hover:underline">Committee</Link>
                <Link to="/MemberUpdates" className="hover:underline">Updates</Link>
                <Link to="/MemberBank" className="hover:underline">Bank</Link>
                <Link to="/MemberContact" className="hover:underline">Contact</Link>
                <Link to="/MemberProfile" className="hover:underline">Profile</Link>
              </>
            )}
            {/* User info and logout */}
            <span className="ml-4 font-semibold text-gray-700">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-1">{role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;