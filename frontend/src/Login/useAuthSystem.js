import { useState, useEffect } from 'react';

const ADMIN_SECRET_CODE = 'ADMIN2024';

export const useAuthSystem = () => {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mockDatabase, setMockDatabase] = useState({ users: [], currentUserId: null });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    apartmentNumber: '',
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Firebase Auth functions
  const mockCreateUser = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = mockDatabase.users.find(u => u.email === email);
        if (existingUser) {
          reject(new Error('Firebase: Error (auth/email-already-in-use).'));
          return;
        }
        const newUser = {
          uid: 'user_' + Date.now() + Math.random().toString(36).substr(2, 9),
          email: email
        };
        resolve({ user: newUser });
      }, 1000);
    });
  };

  const mockSignIn = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockDatabase.users.find(u => u.email === email && u.password === password);
        if (user) {
          resolve({ user: { uid: user.uid, email: user.email } });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const mockSignOut = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setMockDatabase(prev => ({ ...prev, currentUserId: null }));
        resolve();
      }, 500);
    });
  };

  const mockSetDoc = (collection, docId, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setMockDatabase(prev => ({
          ...prev,
          users: [...prev.users, { ...data, password: formData.password, uid: docId }]
        }));
        resolve();
      }, 500);
    });
  };

  const mockGetDoc = (collection, docId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockDatabase.users.find(u => u.uid === docId);
        resolve({
          exists: () => !!user,
          data: () => user
        });
      }, 300);
    });
  };

  useEffect(() => {
    const checkAuthState = async () => {
      if (mockDatabase.currentUserId) {
        const userDoc = await mockGetDoc('users', mockDatabase.currentUserId);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ uid: userData.uid, email: userData.email });
          setUserRole(userData.role);
        }
      }
      setLoading(false);
    };
    checkAuthState();
  }, [mockDatabase.currentUserId, mockGetDoc]);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: '',
      apartmentNumber: '',
      adminCode: ''
    });
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = (isRegistration = false) => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (isRegistration) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (!formData.fullName.trim()) {
        setError('Full name is required');
        return false;
      }
    }
    return true;
  };

  const handleRegister = async (role) => {
    if (!validateForm(true)) return;
    if (role === 'admin' && formData.adminCode !== ADMIN_SECRET_CODE) {
      setError('Invalid admin code');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const userCredential = await mockCreateUser(formData.email, formData.password);
      const userData = {
        uid: userCredential.user.uid,
        email: formData.email,
        fullName: formData.fullName,
        role: role,
        createdAt: new Date().toISOString(),
        phoneNumber: formData.phoneNumber || '',
        apartmentNumber: role === 'member' ? formData.apartmentNumber : '',
        isActive: true
      };
      await mockSetDoc('users', userCredential.user.uid, userData);
      setMockDatabase(prev => ({ ...prev, currentUserId: userCredential.user.uid }));
      setSuccess(`${role === 'admin' ? 'Admin' : 'Member'} account created successfully!`);
      resetForm();
      setTimeout(() => setCurrentView('dashboard'), 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (role) => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setError('');
    try {
      const userCredential = await mockSignIn(formData.email, formData.password);
      setMockDatabase(prev => ({ ...prev, currentUserId: userCredential.user.uid }));
      setSuccess('Login successful!');
      resetForm();
      setTimeout(() => setCurrentView('dashboard'), 1000);
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await mockSignOut();
      setUser(null);
      setUserRole(null);
      setCurrentView('home');
      resetForm();
    } catch (error) {
      // eslint-disable-next-line
      console.error('Error signing out:', error);
    }
  };

  return {
    currentView,
    setCurrentView,
    user,
    userRole,
    loading,
    mockDatabase,
    formData,
    setFormData,
    showPassword,
    setShowPassword,
    error,
    setError,
    success,
    setSuccess,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    handleRegister,
    handleLogin,
    handleLogout,
    resetForm,
  };
}; 