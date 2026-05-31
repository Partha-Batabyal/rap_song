import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

// Layout wrappers
import AuthLayout from './layouts/AuthLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx';

// Page components
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MySongs from './pages/MySongs.jsx';
import EditSong from './pages/EditSong.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ==================== PUBLIC SECURITY ROUTES ==================== */}
          <Route 
            path="/login" 
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            } 
          />

          {/* ==================== SECURED STUDIO ROUTES ==================== */}
          <Route 
            path="/dashboard" 
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } 
          />
          
          <Route 
            path="/songs" 
            element={
              <MainLayout>
                <MySongs />
              </MainLayout>
            } 
          />
          
          <Route 
            path="/songs/archived" 
            element={
              <MainLayout>
                <MySongs />
              </MainLayout>
            } 
          />
          
          <Route 
            path="/songs/new" 
            element={
              <MainLayout>
                <EditSong />
              </MainLayout>
            } 
          />
          
          <Route 
            path="/songs/edit/:id" 
            element={
              <MainLayout>
                <EditSong />
              </MainLayout>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <MainLayout>
                <Profile />
              </MainLayout>
            } 
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
