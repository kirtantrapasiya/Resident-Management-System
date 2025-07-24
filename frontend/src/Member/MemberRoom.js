import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase'; // Firebase imports
import { doc, getDoc } from 'firebase/firestore';

const MemberRoom = () => {
  const [roomData, setRoomData] = useState(null); // State to store room data
  const [loading, setLoading] = useState(true);   // Loading state
  const [error, setError] = useState(null);       // Error state

  useEffect(() => {
    // Fetch current user's UID
    const fetchRoomData = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setError('You must be logged in to view your room data');
          setLoading(false);
          return;
        }

        // Fetch user document from Firestore based on user UID
        const docRef = doc(db, 'users', user.uid); // Assuming "users" collection
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRoomData(data); // Store the user data (room info)
        } else {
          setError('No room data found for this user');
        }
      } catch (err) {
        setError('Error fetching room data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, []); // Only run once when component mounts

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!roomData) {
    return <div>No room data available.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-green-700">Your Room Details</h1>
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3 border">Room Number</th>
              <th className="p-3 border">Full Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone Number</th>
              <th className="p-3 border">Apartment Number</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Starting Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-green-50">
              <td className="p-3 border text-center font-medium">{roomData.roomNo}</td>
              <td className="p-3 border text-center">{roomData.fullName}</td>
              <td className="p-3 border text-center">{roomData.email}</td>
              <td className="p-3 border text-center">{roomData.phoneNumber}</td>
              <td className="p-3 border text-center">{roomData.apartmentNumber}</td>
              <td className="p-3 border text-center capitalize">{roomData.status}</td>
              <td className="p-3 border text-center">{roomData.startingDate ? new Date(roomData.startingDate).toLocaleDateString() : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberRoom;
