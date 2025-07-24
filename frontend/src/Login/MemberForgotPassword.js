import React, { useState } from 'react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import { useSearchParams, useNavigate } from 'react-router-dom';

const MemberForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!oobCode) {
      setError('Invalid or missing reset code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/AdminLogin');
      }, 3000);
    } catch (err) {
      setError('Reset failed. The link may be invalid or expired.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Set New Password</h2>
        <form onSubmit={handleReset}>
          <div className="mb-4">
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border rounded"
              placeholder="Enter new password"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded"
              placeholder="Confirm password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm text-center">{message}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default MemberForgotPassword;
