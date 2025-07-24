import React from 'react';
import { Home as HomeIcon, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-center mb-6">
            <HomeIcon className="h-16 w-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Resident Management System</h1>
          <p className="text-xl text-gray-600 mb-8">Streamline your residential community management</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a mock version for demonstration. Admin code: <code className="bg-yellow-100 px-1 rounded">ADMIN2024</code>
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl">
              <Shield className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Admin Access</h3>
              <p className="mb-4">Manage residents, facilities, and community operations</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/AdminRegister')}
                  className="w-full bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
                >
                  Register as Admin
                </button>
                <button
                  onClick={() => navigate('/AdminLogin')}
                  className="w-full bg-transparent border-2 border-white text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition duration-200"
                >
                  Admin Login
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl">
              <User className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Member Access</h3>
              <p className="mb-4">Access community services and stay connected</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/MemberRegister')}
                  className="w-full bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
                >
                  Register as Member
                </button>
                <button
                  onClick={() => navigate('/MemberLogin')}
                  className="w-full bg-transparent border-2 border-white text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition duration-200"
                >
                  Member Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 