import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/Common/ProtectedRoute.jsx';
import React, { Suspense, lazy, useMemo } from 'react';
import ErrorBoundary from './components/Common/ErrorBoundary.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import SearchBar from './components/SearchBar/SearchBar.jsx';

// 🔹 Lazy-loaded pages for code-splitting
const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage.jsx'));
const Randomizer = lazy(() => import('./pages/Randomiser/Randomizer.jsx'));
const Movies = lazy(() => import('./pages/Movies/Movies.jsx'));
const MovieDetails = lazy(() => import('./pages/MovieDetails/MovieDetails.jsx'));
const SeriesDetails = lazy(() => import('./pages/SeriesDetails/SeriesDetails.jsx'));
const CastDetails = lazy(() => import('./pages/CastDetails/CastDetails.jsx'));
const Series = lazy(() => import('./pages/Series/Series.jsx'));
const Sports = lazy(() => import('./pages/Sports/sports.jsx'));
const Login = lazy(() => import('./pages/Auth/Login/Login.jsx'));
const Register = lazy(() => import('./pages/Auth/Register/Register.jsx'));
const Profile = lazy(() => import('./pages/Profile/Profile.jsx'));
const PasswordChange = lazy(() => import('./pages/Auth/PasswordChange/PasswordChange.jsx'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword/ForgotPassword.jsx'));
const UpdateProfile = lazy(() => import('./pages/Auth/UpdateProfile/UpdateProfile.jsx'));
const NotFound = lazy(() => import('./components/Common/NotFound.jsx'));


const Layout = React.memo(() => {
  const routesConfig = useMemo(() => [
    { path: '/', element: <LandingPage /> },
    { path: '/watch', element: <Randomizer /> },
    { path: '/movies', element: <Movies /> },
    { path: '/movie/:id', element: <MovieDetails /> },
    { path: '/series/:id', element: <SeriesDetails /> },
    { path: '/cast/:id', element: <CastDetails /> },
    { path: '/series', element: <Series /> },
    { path: '/sports', element: <Sports /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
    { path: '/change-password', element: <ProtectedRoute><PasswordChange /></ProtectedRoute> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/update-profile', element: <ProtectedRoute><UpdateProfile /></ProtectedRoute> },
  ], []);

  const renderRouteWithFallback = (element) => (
    <Suspense fallback={<div className="loader"></div>}>
      <ErrorBoundary>{element}</ErrorBoundary>
    </Suspense>
  );

  return (
    <>
      <SearchBar />
      <div className="mega-container">
        <Navbar />
        <Routes>
          {routesConfig.map(({ path, element }, idx) => (
            <Route
              key={path || idx}
              path={path}
              element={renderRouteWithFallback(element)}
            />
          ))}
          <Route path="*" element={renderRouteWithFallback(<NotFound />)} />
        </Routes>
      </div>
    </>
  );
});

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
};

// Create root with error boundary for the app-wide unhandled errors
ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default App;