import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Try admin first
        let docRef = doc(db, 'admin', firebaseUser.uid);
        let docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole('admin');
        } else {
          // Try users collection
          docRef = doc(db, 'users', firebaseUser.uid);
          docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setRole('member');
          } else {
            setRole(null);
          }
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 