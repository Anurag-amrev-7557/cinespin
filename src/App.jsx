import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/Common/ProtectedRoute.jsx';
import React, { Suspense, lazy, startTransition } from 'react';
import ErrorBoundary from './components/Common/ErrorBoundary.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import SearchBar from './components/SearchBar/SearchBar.jsx';
import Spinner from './components/Common/Spinner.jsx'; // create if doesn't exist

// Move lazy imports to top-level for optimization
const lazyImport = (path) => lazy(() => import(`${path}`));

const LandingPage   = lazyImport('./pages/LandingPage/LandingPage.jsx');
const Randomizer    = lazyImport('./pages/Randomiser/Randomizer.jsx');
const Movies        = lazyImport('./pages/Movies/Movies.jsx');
const MovieDetails  = lazyImport('./pages/MovieDetails/MovieDetails.jsx');
const SeriesDetails = lazyImport('./pages/SeriesDetails/SeriesDetails.jsx');
const CastDetails   = lazyImport('./pages/CastDetails/CastDetails.jsx');
const Series        = lazyImport('./pages/Series/Series.jsx');
const Sports        = lazyImport('./pages/Sports/sports.jsx');
const Login         = lazyImport('./pages/Auth/Login/Login.jsx');
const Register      = lazyImport('./pages/Auth/Register/Register.jsx');
const Profile       = lazyImport('./pages/Profile/Profile.jsx');
const PasswordChange = lazyImport('./pages/Auth/PasswordChange/PasswordChange.jsx');
const ForgotPassword = lazyImport('./pages/Auth/ForgotPassword/ForgotPassword.jsx');
const UpdateProfile  = lazyImport('./pages/Auth/UpdateProfile/UpdateProfile.jsx');
const NotFound       = lazyImport('./components/Common/NotFound.jsx');

const routesConfig = [
  { path: '/',           element: <LandingPage /> },
  { path: '/watch',      element: <Randomizer /> },
  { path: '/movies',     element: <Movies /> },
  { path: '/movie/:id',  element: <MovieDetails /> },
  { path: '/series/:id', element: <SeriesDetails /> },
  { path: '/cast/:id',   element: <CastDetails /> },
  { path: '/series',     element: <Series /> },
  { path: '/sports',     element: <Sports /> },
  { path: '/login',      element: <Login /> },
  { path: '/register',   element: <Register /> },
  { path: '/profile',    element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '/change-password', element: <ProtectedRoute><PasswordChange /></ProtectedRoute> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/update-profile', element: <ProtectedRoute><UpdateProfile /></ProtectedRoute> },
];

const Layout = () => {
  return (
    <>
      <SearchBar />
      <div className="mega-container">
        <Navbar />
        <Suspense fallback={<Spinner />}>
          <Routes>
            {routesConfig.map(({ path, element }, idx) => (
              <Route
                key={path || idx}
                path={path}
                element={
                  <ErrorBoundary>
                    {element}
                  </ErrorBoundary>
                }
              />
            ))}
            <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <Router>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  </HelmetProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;