/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Discover from './pages/Discover';
import ServiceDetail from './pages/ServiceDetail';
import WorkerProfile from './pages/WorkerProfile';
import PostNeed from './pages/PostNeed';
import WorkerDashboard from './pages/WorkerDashboard';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import AdminProfile from './pages/AdminProfile';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import AdminWorkers from './pages/AdminWorkers';
import AdminPosts from './pages/AdminPosts';
import SeekerDashboard from './pages/SeekerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/worker/:id" element={<WorkerProfile />} />
        <Route path="/post-need" element={<PostNeed />} />
        <Route path="/worker-dashboard" element={<WorkerDashboard />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin/add-worker" element={<AdminProfile />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/workers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminWorkers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/seeker"
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <SeekerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/provider"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
