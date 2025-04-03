import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import React, {Suspense, lazy} from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import SearchBar from './components/SearchBar/SearchBar.jsx';

const LandingPage = lazy(() => import("./pages/LandingPage/LandingPage.jsx"));
const Randomizer = lazy(() => import("./pages/Randomiser/Randomizer.jsx"));
const Movies = lazy(() => import("./pages/Movies/Movies.jsx"));
const MovieDetails = lazy(() => import("./pages/MovieDetails/MovieDetails.jsx"));
const SeriesDetails = lazy(() => import("./pages/SeriesDetails/SeriesDetails.jsx"));
const Series = lazy(() => import("./pages/Series/Series.jsx"));

// 🔹 Route Configuration for Scalability
const routesConfig = [
  { path: "/", element: <LandingPage />, protected: false },
  { path: "/watch", element: <Randomizer />, protected: false },
  { path: "/movies", element: <Movies />, protected: false },
  { path: "/movie/:id", element: <MovieDetails />, protected: false },
  { path: "/series/:id", element: <SeriesDetails />, protected: false },
  { path: "/series", element: <Series />, protected: false },
];

const Layout = () => {
  const location = useLocation();

  return (
    <>
      <SearchBar />
      <div className='mega-container'>
        <Navbar />
        <Suspense>
            <Routes>
              {routesConfig.map(({ path, element, protected: isProtected }) => (
                <Route
                  key={path}
                  path={path}
                  element={isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element}
                />
              ))}
              {/* Redirect unknown routes to home */}
              {/* <Route path="*" element={<Navigate to="/not-found" replace />} /> */}
            </Routes>
        </Suspense>
        <Footer />
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