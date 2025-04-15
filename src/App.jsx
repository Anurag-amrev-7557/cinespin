import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/Common/ProtectedRoute.jsx';
import React, { Suspense, lazy, useEffect } from 'react';
import ErrorBoundary from './components/Common/ErrorBoundary.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import SearchBar from './components/SearchBar/SearchBar.jsx';
import Spinner from './components/Common/Spinner.jsx'; // create if doesn't exist

// Prefetch routes when browser is idle
const prefetchRoutes = () => {
  const preload = () => {
    import('./pages/Movies/Movies.jsx');
    import('./pages/Series/Series.jsx');
    import('./pages/Randomiser/Randomizer.jsx');
    import('./pages/Profile/Profile.jsx');
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload);
  } else {
    setTimeout(preload, 2000); // fallback for unsupported browsers
  }
};

// Memoize LazyWrapper to avoid repeated wrapping
const LazyWrapper = (Component) => {
  const MemoComponent = React.memo(Component);
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <MemoComponent />
      </Suspense>
    </ErrorBoundary>
  );
};

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
  { path: '/',           element: LazyWrapper(LandingPage) },
  { path: '/watch',      element: LazyWrapper(Randomizer) },
  { path: '/movies',     element: LazyWrapper(Movies) },
  { path: '/movie/:id',  element: LazyWrapper(MovieDetails) },
  { path: '/series/:id', element: LazyWrapper(SeriesDetails) },
  { path: '/cast/:id',   element: LazyWrapper(CastDetails) },
  { path: '/series',     element: LazyWrapper(Series) },
  { path: '/sports',     element: LazyWrapper(Sports) },
  { path: '/login',      element: LazyWrapper(Login) },
  { path: '/register',   element: LazyWrapper(Register) },
  { path: '/profile',    element: LazyWrapper(<ProtectedRoute><Profile /></ProtectedRoute>) },
  { path: '/change-password', element: LazyWrapper(<ProtectedRoute><PasswordChange /></ProtectedRoute>) },
  { path: '/forgot-password', element: LazyWrapper(ForgotPassword) },
  { path: '/update-profile', element: LazyWrapper(<ProtectedRoute><UpdateProfile /></ProtectedRoute>) },
];

const Layout = () => {
  useEffect(() => {
    prefetchRoutes();
  }, []);

  return (
    <>
      <SearchBar />
      <div className="mega-container">
        <Navbar />
        <Routes>
          {routesConfig.map(({ path, element }, idx) => (
            <Route key={path || idx} path={path} element={element} />
          ))}
          <Route path="*" element={LazyWrapper(NotFound)} />
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <Router basename={import.meta.env.BASE_URL || '/'}>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  </HelmetProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;