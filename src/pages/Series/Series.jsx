import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillFire } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { LuSwords } from "react-icons/lu";
import { FaHeart } from "react-icons/fa";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { SlMagicWand } from "react-icons/sl";
import { FaMasksTheater, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { MdFamilyRestroom } from "react-icons/md";
import { getFromCache, setToCache } from "../../utils/cache";
import { FaStar } from "react-icons/fa";
import "./Series.css";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const genres = [
    { id: 28, name: "Action", icon: <LuSwords /> },
    { id: 35, name: "Comedy", icon: <FaMasksTheater /> },
    { id: 18, name: "Drama", icon: <FaHeart /> },
    { id: 27, name: "Horror", icon: <RiGhostFill /> },
    { id: 14, name: "Fantasy", icon: <SlMagicWand /> },
    { id: 878, name: "SciFi", icon: <RiSpaceShipFill /> },
    { id: 10751, name: "Family", icon: <MdFamilyRestroom /> },
    { id: 10770, name: "Series", icon: <AiFillFire /> },
    { id: 16, name: "Animation", icon: <RiBearSmileFill /> },
];

const SkeletonGenreCard = () => (
    <div className="skeleton-genre-card">
        <div className="skeleton-genre-icon"></div>
        <div className="skeleton-genre-title"></div>
    </div>
);

const Series = () => {
    const [selectedGenre, setSelectedGenre] = useState(genres[0].id);
    const [movies, setMovies] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingGenres, setIsLoadingGenres] = useState(true);
    const [region, setRegion] = useState(() => localStorage.getItem("region") || "Global");
    const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem('region') || "Global"); // Read region from localStorage
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageRangeStart, setPageRangeStart] = useState(1);
    const MOVIES_PER_PAGE = 35; // fallback if needed but grid is now responsive
    const navigate = useNavigate();

    const fetchMovies = useCallback(async (genreId, page = 1) => {
      setIsLoading(true);
      const cacheKey = `series-${genreId}-${page}-${selectedRegion}`;
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        setMovies(cachedData.results || []);
        setTotalPages(cachedData.total_pages || 1);
        setCurrentPage(page);
        const newRangeStart = Math.floor((page - 1) / 5) * 5 + 1;
        setPageRangeStart(newRangeStart);
        setIsLoading(false);
        return;
      }
      try {
        let url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}&include_adult=false&include_null_first_air_dates=false&with_type=Scripted`;
        
        const regionMap = {
          India: { region: "IN", language: "hi" },
          US: { region: "US", language: "en" },
          Global: null,
        };
        
        const regionConfig = regionMap[selectedRegion];
        
        if (regionConfig) {
          url += `&region=${regionConfig.region}&with_original_language=${regionConfig.language}`;
        } else {
          // Optional: fallback to a global-friendly setting
          url += `&watch_region=US`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.results || data.results.length === 0) {
          const fallbackUrl = `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_API_KEY}&language=en-US`;
          const fallbackRes = await fetch(fallbackUrl);
          const fallbackData = await fallbackRes.json();
        
          const fallbackResults = fallbackData.results || [];
          const fallbackTotalPages = Math.ceil(fallbackResults.length / MOVIES_PER_PAGE) || 1;
        
          setMovies(fallbackResults.slice(0, MOVIES_PER_PAGE));
          setTotalPages(fallbackTotalPages);
          setCurrentPage(1);
          setPageRangeStart(1);
        } else {
          setMovies(data.results);
          setTotalPages(data.total_pages || 1);
          setCurrentPage(page);
          const newRangeStart = Math.floor((page - 1) / 5) * 5 + 1;
          setPageRangeStart(newRangeStart);
          setToCache(cacheKey, data);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    }, [selectedRegion]);

    const handleGenreClick = (genreId) => {
      if (genreId !== selectedGenre) {
        setSelectedGenre(genreId);
        setCurrentPage(1); // Optional: reset page if genre changes
      }
    };
    useEffect(() => {
      const handleStorageChange = (e) => {
        if (e.key === "region") {
          const newRegion = e.newValue || "Global";
          setSelectedRegion(newRegion);
          setRegion(newRegion);
        }
      };
    
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    useEffect(() => {
        const handleRegionUpdate = () => {
            const updatedRegion = localStorage.getItem("region") || "Global";
            setSelectedRegion(updatedRegion);
            setRegion(updatedRegion);
        };

        window.addEventListener("regionChange", handleRegionUpdate);
        return () => window.removeEventListener("regionChange", handleRegionUpdate);
    }, [fetchMovies, selectedGenre]);

    useEffect(() => {
      fetchMovies(selectedGenre, 1); // Always fetch page 1 for a new genre
    }, [selectedGenre, selectedRegion]);
    
    useEffect(() => {
        setIsLoadingGenres(false);
    }, []);

    const fadeInUp = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 24,
        },
      },
    };
    
    const containerStagger = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.07,
          delayChildren: 0.2,
        },
      },
    };
    
    const cardSpringVariant = {
      hidden: { opacity: 0, y: 30, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 240,
          damping: 20,
          mass: 0.8,
        },
      },
      exit: {
        opacity: 0,
        y: 30,
        scale: 0.95,
        transition: { duration: 0.3 },
      },
    };
    
    return (
        <div className="movies-container">
            <motion.div
              className="genre-container"
              variants={containerStagger}
              initial="hidden"
              animate="visible"
            >
                {!genres.length || isLoadingGenres ? (
                    Array.from({ length: genres.length || 9 }, (_, index) => (
                        <motion.div key={index} className="genre-slide" variants={fadeInUp}>
                            <SkeletonGenreCard />
                        </motion.div>
                    ))
                ) : (
                    genres.map((genre) => (
                        <motion.div key={genre.id} className="genre-slide" variants={fadeInUp}>
                                <div 
                                  className={`genre ${selectedGenre === genre.id ? "active" : ""}`}
                                  onClick={() => handleGenreClick(genre.id)}
                                >
                                <div className="genre-icon">{genre.icon}</div>
                                {genre.name}
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

          <div className="movies-list">
            {isLoading ? (
              <div className="movie-details-loading">
                <div aria-live="assertive" role="alert" class="loader"></div>
              </div>
            ) : (
            <AnimatePresence>
              <motion.div className="movie-grid"
              variants={containerStagger}
              initial="hidden"
              animate="visible"
              >
                {movies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    className="movie-card"
                    variants={cardSpringVariant}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <picture>
                    <img
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/default.png"}
                      alt={movie.title || movie.name || "Untitled"}
                      className="movie-poster"
                      onError={(e) => { e.target.src = "/default.png"; }}
                      loading="lazy"
                      decoding="async"
                    />
                    </picture>
                    <span className="movie-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.name.split(" ").slice(0, 3).join(" ")}
                    </span>
                    <div className="movie-details">
                        <span><FaStar className="movie-star" /> {movie.vote_average.toFixed(1)}</span>
                        <span className="gap">&nbsp;〡&nbsp;</span>
                        <span>{movie.first_air_date?.split("-")[0]}</span>
                        {movie.runtime && (
                            <>
                                <span className="gap">&nbsp;〡&nbsp;</span>
                                <span>{movie.runtime} min</span>
                            </>
                        )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            )}
            {!isLoading && totalPages === 1 && (
              <div className="limited-results-note">
                Only a single page of results found.
              </div>
            )}
            {totalPages > 1 && (
              <motion.div className="pagination-controls"   
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const prevPage = currentPage - 1;
                    if (prevPage >= 1) {
                      fetchMovies(selectedGenre, prevPage);
                    }
                  }}
                  disabled={currentPage === 1}
                  className="pagination-nav"
                >
                  <FaChevronLeft />
                </motion.button>

                {Array.from({ length: Math.min(5, totalPages - pageRangeStart + 1) }, (_, index) => {
                  const page = pageRangeStart + index;
                  return (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fetchMovies(selectedGenre, page)}
                      className={`pagination-page ${currentPage === page ? "active-page" : ""}`}
                    >
                      {page}
                    </motion.button>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const nextPage = currentPage + 1;
                    if (nextPage <= totalPages) {
                      fetchMovies(selectedGenre, nextPage);
                    }
                  }}
                  disabled={currentPage >= totalPages}
                  className="pagination-nav"
                >
                  <FaChevronRight />
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
    );
};

export default Series;
