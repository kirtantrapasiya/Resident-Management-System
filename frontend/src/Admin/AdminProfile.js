import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AdminProfile = () => {
  const [adminData, setAdminData] = useState(null);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('You must be logged in to view your profile.');
          setLoading(false);
          return;
        }
        const docRef = doc(db, 'admin', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdminData(docSnap.data());
          setImageUrl(docSnap.data().profileImage || '');
        } else {
          setError('No profile data found.');
        }
      } catch (err) {
        setError('Error fetching profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleUploadImage = async () => {
    if (!image) {
      setError('Please choose an image first!');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      // Upload to backend (ImageKit)
      const formData = new FormData();
      formData.append('image', image);
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || 'Upload failed');
      // Save the image URL in Firestore
      const user = auth.currentUser;
      const docRef = doc(db, 'admin', user.uid);
      await setDoc(docRef, { ...adminData, profileImage: data.url }, { merge: true });
      setImageUrl(data.url);
      setSuccess('Profile image updated successfully!');
    } catch (err) {
      setError('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!adminData) return null;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-10">
      <div className="flex flex-col items-center mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 mb-4 shadow-md">
          <img
            src={imageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(adminData.fullName || 'Admin') + '&background=E0E7FF&color=3730A3&size=128'}
            alt="Profile"
            className="object-cover w-full h-full"
          />
        </div>
        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
        <button
          onClick={handleUploadImage}
          disabled={uploading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 shadow"
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        {success && <div className="text-green-600 mt-2 font-medium">{success}</div>}
        {error && <div className="text-red-600 mt-2 font-medium">{error}</div>}
      </div>
      <div className="space-y-4 text-gray-700">
        <div className="flex justify-between border-b pb-2"><span className="font-semibold">Full Name:</span> <span>{adminData.fullName}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="font-semibold">Email:</span> <span>{adminData.email}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="font-semibold">Phone Number:</span> <span>{adminData.phoneNumber}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="font-semibold">Building No.:</span> <span>{adminData.buildingNo}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="font-semibold">Society Name:</span> <span>{adminData.societyName}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="font-semibold">Role:</span> <span className="capitalize">{adminData.role}</span></div>
        <div className="flex justify-between"><span className="font-semibold">Created At:</span> <span>{adminData.createdAt ? new Date(adminData.createdAt).toLocaleString() : ''}</span></div>
      </div>
    </div>
  );
};

export default AdminProfile;
