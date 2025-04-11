import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiFillFire } from "react-icons/ai";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { LuSwords } from "react-icons/lu";
import { BsCameraReelsFill } from "react-icons/bs";
import { GiDrippingKnife } from "react-icons/gi";
import { FaHatWizard } from "react-icons/fa6";
import { GiSpartanHelmet } from "react-icons/gi";
import { FaHeart } from "react-icons/fa";
import { GiDramaMasks } from "react-icons/gi";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { FaMasksTheater } from "react-icons/fa6";
import { getFromCache, setToCache } from "../../utils/cache";
import { PiDetectiveFill } from "react-icons/pi";
import { IoIosHeart } from "react-icons/io";
import { MdVideoCameraBack } from "react-icons/md";
import { RiFilter2Line } from "react-icons/ri";
import { FaGun } from "react-icons/fa6";
import { TbMapRoute } from "react-icons/tb";
import { IoFilterSharp } from "react-icons/io5";
import { GiSentryGun } from "react-icons/gi";
import { FaHandcuffs } from "react-icons/fa6";
import { GiHearts } from "react-icons/gi";
import { MdFamilyRestroom } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import "./Series.css";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const genres = [
    { id: 28, name: "Action", icon: <LuSwords /> },
    { id: 35, name: "Comedy", icon: <FaMasksTheater /> },
    { id: 18, name: "Drama", icon: <GiDramaMasks /> },
    { id: 27, name: "Horror", icon: <RiGhostFill /> },
    { id: 14, name: "Fantasy", icon: <FaHatWizard /> },
    { id: 878, name: "SciFi", icon: <RiSpaceShipFill /> },
    { id: 10751, name: "Family", icon: <MdFamilyRestroom /> },
    { id: 10770, name: "Series", icon: <AiFillFire /> },
    { id: 16, name: "Animation", icon: <RiBearSmileFill /> },
    { id: 53, name: "Thriller", icon: <GiDrippingKnife /> },
    { id: 80, name: "Crime", icon: <FaHandcuffs /> },
    { id: 9648, name: "Mystery", icon: <PiDetectiveFill /> },
    { id: 10749, name: "Romance", icon: <FaHeart /> },
    { id: 12, name: "Adventure", icon: <TbMapRoute /> },
    { id: 99, name: "Documentary", icon: <MdVideoCameraBack /> },
    { id: 36, name: "History", icon: <GiSpartanHelmet /> },
    { id: 10752, name: "War", icon: <GiSentryGun /> },
    { id: 37, name: "Western", icon: <FaGun /> },
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
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [sortOption, setSortOption] = useState("year");
    const [filterOrder, setFilterOrder] = useState("desc");
    const [totalPages, setTotalPages] = useState(1);
    const [region, setRegion] = useState(() => localStorage.getItem("region") || "Global");
    const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem('region') || "Global"); // Read region from localStorage
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageRangeStart, setPageRangeStart] = useState(1);
    const [sortedMovies, setSortedMovies] = useState([]);
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
            if (movies.length > 0) {
                let sorted = [...movies];
    
                const direction = filterOrder === "asc" ? 1 : -1;
    
                if (sortOption === "year") {
                    sorted.sort((a, b) => {
                        const yearA = a.first_air_date ? parseInt(a.first_air_date.slice(0, 4)) : -Infinity;
                        const yearB = b.first_air_date ? parseInt(b.first_air_date.slice(0, 4)) : -Infinity;
                        return direction * (yearA - yearB);
                    });
                } else if (sortOption === "popularity") {
                    sorted.sort((a, b) => direction * (b.popularity - a.popularity));
                } else if (sortOption === "rating") {
                    sorted.sort((a, b) => direction * (b.vote_average - a.vote_average));
                }
    
                setSortedMovies(sorted);
            }
        }, [sortOption, filterOrder, movies]);
    
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (
                    showFilter && !event.target.closest(".filter-popup") && !event.target.closest(".filter")
                ) {
                    setShowFilter(false);
                }
                if (
                    showSort && !event.target.closest(".sort-popup") && !event.target.closest(".sort")
                ) {
                    setShowSort(false);
                }
            };
    
            document.addEventListener("click", handleClickOutside);
    
            return () => {
                document.removeEventListener("click", handleClickOutside);
            };
        }, [showFilter, showSort]);
    
        const handleSortSelection = (option) => {
            setSortOption(option);
            setShowSort(false); // Close the sort popup
        };
    
        const handleFilterSelection = (option) => {
            if (option === "filter1") {
                setFilterOrder("asc");
            } else if (option === "filter2") {
                setFilterOrder("desc");
            }
            setShowFilter(false); // Close the filter popup
        };

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

    const popupVariant = {
      hidden: { opacity: 0, scale: 0.9, y: -10 },
      visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: "spring", stiffness: 260, damping: 22 }
      },
      exit: {
          opacity: 0,
          scale: 0.9,
          y: -10,
          transition: { duration: 0.2 }
      }
  };

    const formatRuntime = (minutes) => {
      if (!minutes || isNaN(minutes)) return "";
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hrs}h ${mins}m`;
    };

    return (
        <div className="movies-container">
            <motion.div
              className="genre-container"
              variants={containerStagger}
              initial="hidden"
              animate="visible"
            >
                  <Helmet>
                    <title>Browse Series by Genre - Cinespin</title>
                    <meta name="description" content="Discover trending TV series across genres like Drama, Action, Comedy and more. Watch the best shows now on Cinespin!" />
                  </Helmet>
                {genres.map((genre) => (
                    <motion.div key={genre.id} className="genre-slide" variants={fadeInUp}>
                        <div 
                          className={`genre ${selectedGenre === genre.id ? "active" : ""}`}
                          onClick={() => handleGenreClick(genre.id)}
                        >
                            <div className="genre-icon">{genre.icon}</div>
                            {genre.name}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="big-sorting-container">
                <div className="sorting-container">
                    <div className="filter" onClick={() => setShowFilter(prev => !prev)} aria-label="Toggle filter options">
                        <RiFilter2Line />
                    </div>
                    <div className="sort" onClick={() => setShowSort(prev => !prev)} aria-label="Toggle sort options">
                        <IoFilterSharp />
                    </div>
                </div>
                <AnimatePresence>
                    {showFilter && (
                        <motion.div 
                            className="popup-menu filter-popup"
                            variants={popupVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <p onClick={() => handleFilterSelection("filter1")}>Ascending Order</p>
                            <div className="liner"></div>
                            <p onClick={() => handleFilterSelection("filter2")}>Descending Order</p>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {showSort && (
                        <motion.div 
                            className="popup-menu sort-popup"
                            variants={popupVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <p onClick={() => handleSortSelection("year")}>Sort by Year</p>
                            <div className="liner"></div>
                            <p onClick={() => handleSortSelection("popularity")}>Sort by Popularity</p>
                            <div className="liner"></div>
                            <p onClick={() => handleSortSelection("rating")}>Sort by Rating</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

          <div className="movies-list">
            {isLoading ? (
              <div className="movie-details-loading">
                <div aria-live="assertive" role="alert" className="loader"></div>
              </div>
            ) : (
            <AnimatePresence>
              <motion.div className="movie-grid"
              variants={containerStagger}
              initial="hidden"
              animate="visible"
              >
                {sortedMovies.map((movie) => (
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
                                <span>{formatRuntime(movie.runtime)}</span>
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
