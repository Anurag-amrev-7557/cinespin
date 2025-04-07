import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';

import ErrorBoundary from './components/Common/ErrorBoundary.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import SearchBar from './components/SearchBar/SearchBar.jsx';

// 🔹 Lazy-loaded pages for code-splitting
const LandingPage   = lazy(() => import('./pages/LandingPage/LandingPage.jsx'));
const Randomizer    = lazy(() => import('./pages/Randomiser/Randomizer.jsx'));
const Movies        = lazy(() => import('./pages/Movies/Movies.jsx'));
const MovieDetails  = lazy(() => import('./pages/MovieDetails/MovieDetails.jsx'));
const SeriesDetails = lazy(() => import('./pages/SeriesDetails/SeriesDetails.jsx'));
const CastDetails   = lazy(() => import('./pages/CastDetails/CastDetails.jsx'));
const Series        = lazy(() => import('./pages/Series/Series.jsx'));

// 🔐 Optional: import ProtectedRoute when auth is ready
// import ProtectedRoute from './components/Common/ProtectedRoute.jsx';

// 🧭 Central route configuration
const routesConfig = [
  { path: '/',           element: <LandingPage /> },
  { path: '/watch',      element: <Randomizer /> },
  { path: '/movies',     element: <Movies /> },
  { path: '/movie/:id',  element: <MovieDetails /> },
  { path: '/series/:id', element: <SeriesDetails /> },
  { path: '/cast/:id',   element: <CastDetails /> },
  { path: '/series',     element: <Series /> },
  // Future route protection flag (not yet used)
  // { path: '/profile', protected: true, element: <UserProfile /> },
];

const Layout = () => {
  const location = useLocation();

  return (
    <>
      <SearchBar />
      <div className="mega-container">
        <Navbar />
        <Suspense fallback={<div className="loader"></div>}>
          <Routes>
            {routesConfig.map(({ path, element }, idx) => (
              <Route
                key={path || idx}
                path={path}
                element={
                  <ErrorBoundary>
                    {/* Optional: <ProtectedRoute>{element}</ProtectedRoute> */}
                    {element}
                  </ErrorBoundary>
                }
              />
            ))}

            {/* 🔄 Optional 404 handler */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

const App = () => (
  <Router>
    <Layout />
  </Router>
);

export default App;