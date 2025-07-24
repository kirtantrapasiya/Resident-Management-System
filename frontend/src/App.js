import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Home/Home";
import Navbar from "./Home/Navbar";
import AdminLogin from "./Login/AdminLogin";
import AdminRegister from "./Login/AdminRegister";
import MemberLogin from "./Login/MemberLogin";
import MemberRegister from "./Login/MemberRegister";
import AdminProfile from "./Admin/AdminProfile";
import AdminRooms from "./Admin/AdminRooms";
import AdminDocuments from "./Admin/AdminDocuments";
import AdminMaintenance from "./Admin/AdminMaintenance";
import AdminFund from "./Admin/AdminFund";
import AdminEvents from "./Admin/AdminEvents";
import AdminCommittee from "./Admin/AdminCommittee";
import AdminUpdates from "./Admin/AdminUpdates";
import AdminBank from "./Admin/AdminBank";
import MemberProfile from "./Member/MemberProfile";
import MemberRoom from "./Member/MemberRoom";
import MemberDocuments from "./Member/MemberDocuments";
import MemberMaintenance from "./Member/MemberMaintenance";
import MemberFund from "./Member/MemberFund";
import MemberEvents from "./Member/MemberEvents";
import MemberCommittee from "./Member/MemberCommittee";
import MemberUpdates from "./Member/MemberUpdates";
import MemberBank from "./Member/MemberBank";
import MemberContact from "./Member/MemberContact";
import AdminForgotPassword from "./Login/AdminForgotPassword";
import MemberForgotPassword from "./Login/MemberForgotPassword";
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/AdminRegister" element={<AdminRegister />} />
        <Route path="/MemberLogin" element={<MemberLogin />} />
        <Route path="/MemberRegister" element={<MemberRegister />} />
        <Route path="/AdminForgotPassword" element={<AdminForgotPassword />} />
        <Route path="/MemberForgotPassword" element={<MemberForgotPassword />} />
        {/* Admin protected routes */}
        <Route path="/AdminProfile" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProfile />
          </ProtectedRoute>
        } />
        <Route path="/AdminRooms" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRooms />
          </ProtectedRoute>
        } />
        <Route path="/AdminDocuments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDocuments />
          </ProtectedRoute>
        } />
        <Route path="/AdminMaintenance" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminMaintenance />
          </ProtectedRoute>
        } />
        <Route path="/AdminFund" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminFund />
          </ProtectedRoute>
        } />
        <Route path="/AdminEvents" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminEvents />
          </ProtectedRoute>
        } />
        <Route path="/AdminCommittee" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCommittee />
          </ProtectedRoute>
        } />
        <Route path="/AdminUpdates" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUpdates />
          </ProtectedRoute>
        } />
        <Route path="/AdminBank" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminBank />
          </ProtectedRoute>
        } />
        {/* Member protected routes */}
        <Route path="/MemberProfile" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberProfile />
          </ProtectedRoute>
        } />
        <Route path="/MemberRoom" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberRoom />
          </ProtectedRoute>
        } />
        <Route path="/MemberDocuments" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberDocuments />
          </ProtectedRoute>
        } />
        <Route path="/MemberMaintenance" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberMaintenance />
          </ProtectedRoute>
        } />
        <Route path="/MemberFund" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberFund />
          </ProtectedRoute>
        } />
        <Route path="/MemberEvents" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberEvents />
          </ProtectedRoute>
        } />
        <Route path="/MemberCommittee" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberCommittee />
          </ProtectedRoute>
        } />
        <Route path="/MemberUpdates" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberUpdates />
          </ProtectedRoute>
        } />
        <Route path="/MemberBank" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberBank />
          </ProtectedRoute>
        } />
        <Route path="/MemberContact" element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberContact />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
