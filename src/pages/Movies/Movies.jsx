import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiFillFire } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { LuSwords } from "react-icons/lu";
import { FaHeart } from "react-icons/fa";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { FaMasksTheater } from "react-icons/fa6";
import { getFromCache, setToCache } from "../../utils/cache";
import { SlMagicWand } from "react-icons/sl";
import { RiFilter2Line } from "react-icons/ri";
import { IoFilterSharp } from "react-icons/io5";
import { MdFamilyRestroom } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import "./Movies.css";

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

const Movies = () => {
    const [selectedGenre, setSelectedGenre] = useState(() => parseInt(localStorage.getItem("genre")) || genres[0].id);
    const [movies, setMovies] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingGenres, setIsLoadingGenres] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState(() => localStorage.getItem("region") || "Global");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageRangeStart, setPageRangeStart] = useState(1);
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [sortOption, setSortOption] = useState("year");
    const [filterOrder, setFilterOrder] = useState("desc");
    const [sortedMovies, setSortedMovies] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const genreCardVariant = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.4
            }
        }
    };
    
    const movieCardVariant = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 240,
                damping: 20,
                mass: 0.8
            }
        },
        exit: {
            opacity: 0,
            y: 30,
            scale: 0.95,
            transition: { duration: 0.3 }
        }
    };
    
    const containerStagger = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.07,
                delayChildren: 0.2
            }
        }
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

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const genreFromUrl = parseInt(searchParams.get("genre"), 10);
        const pageFromUrl = parseInt(searchParams.get("page"), 10);
    
        const validGenre = genreFromUrl || genres[0].id;
        const validPage = pageFromUrl || 1;
    
        setSelectedGenre(validGenre);
        setCurrentPage(validPage);
        fetchMovies(validGenre, validPage);
    }, [location.search]);

    const handleGenreClick = (genreId) => {
        if (genreId !== selectedGenre) {
            localStorage.setItem("genre", genreId);
            localStorage.setItem("currentPage", currentPage);
            setSelectedGenre(genreId);
            navigate(`/movies?genre=${genreId}&page=${currentPage}`);
            fetchMovies(genreId, currentPage);
        }
    };

    const fetchMovies = async (genreId = 0, page = 1) => {
        setIsLoading(true);
        const safeGenreId = typeof genreId === "number" && !isNaN(genreId) ? genreId : 0;
        const safePage = typeof page === "number" && page > 0 ? page : 1;
        const cacheKey = `genre-${safeGenreId}-page-${safePage}-region-${selectedRegion}`;
    
        try {
            // Attempt to retrieve from cache
            const cachedData = getFromCache(cacheKey);
            if (cachedData && Array.isArray(cachedData.results)) {
                setMovies(cachedData.results);
                const total = parseInt((cachedData || data).total_pages, 10);
                setTotalPages(!isNaN(total) && total > 0 ? total : 1);
            
                if (safePage > total) {
                    setCurrentPage(1);
                } else {
                    setCurrentPage(safePage);
                }
            
                setPageRangeStart(Math.floor((safePage - 1) / 5) * 5 + 1);
                return;
            }
    
            // Construct URL
            const regionParam =
                selectedRegion === "India"
                    ? "&region=IN&with_original_language=hi"
                    : "";
            const genreParam =
                safeGenreId && safeGenreId !== 0
                    ? `&with_genres=${safeGenreId}`
                    : "";
    
            const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}${genreParam}&page=${safePage}${regionParam}`;
    
            const response = await fetch(url);
    
            // Check for non-OK response
            if (!response.ok) {
                const errorMessage = `TMDB API error: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }
    
            const data = await response.json();
    
            // Validate data structure
            if (!Array.isArray(data.results)) {
                throw new Error("Invalid data structure from TMDB API.");
            }
    
            setMovies(data.results);
            setTotalPages(Number.isInteger(data.total_pages) ? data.total_pages : 1);
            setCurrentPage(safePage);
            localStorage.setItem("currentPage", safePage);
            setPageRangeStart(Math.floor((safePage - 1) / 5) * 5 + 1);
            navigate(`/movies?genre=${safeGenreId}&page=${safePage}`, { replace: true });
            setToCache(cacheKey, data); // ✅ Save valid data to cache
        } catch (error) {
            console.error("Error fetching movies:", error);
            // Optional: display fallback UI or show user-facing error state
            setMovies([]);
            setTotalPages(1);
            setCurrentPage(1);
            setPageRangeStart(1);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies(selectedGenre, 1);
    }, [selectedRegion]);

    useEffect(() => {
        const handleRegionChange = () => {
            const updatedRegion = localStorage.getItem("region") || "Global";
            if (updatedRegion !== selectedRegion) {
                setSelectedRegion(updatedRegion);
                setCurrentPage(1);
                localStorage.setItem("currentPage", 1);
                fetchMovies(selectedGenre, 1);
            }
        };
    
        window.addEventListener("regionChange", handleRegionChange);
        window.addEventListener("storage", handleRegionChange);
    
        return () => {
            window.removeEventListener("regionChange", handleRegionChange);
            window.removeEventListener("storage", handleRegionChange);
        };
    }, [selectedGenre, selectedRegion]);

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "region") {
                const updatedRegion = event.newValue || "Global";
                setSelectedRegion(updatedRegion);
                setCurrentPage(1);
                localStorage.setItem("currentPage", 1);
                fetchMovies(selectedGenre, 1);
            }
        };
    
        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [selectedGenre, fetchMovies]);

    useEffect(() => {
        if (movies.length > 0) {
            let sorted = [...movies];

            const direction = filterOrder === "asc" ? 1 : -1;

            if (sortOption === "year") {
                sorted.sort((a, b) => {
                    const yearA = a.release_date ? parseInt(a.release_date.slice(0, 4)) : -Infinity;
                    const yearB = b.release_date ? parseInt(b.release_date.slice(0, 4)) : -Infinity;
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

    useEffect(() => {
        fetchMovies(selectedGenre, 1); // Always fetch page 1 for a new genre
    }, [selectedGenre, selectedRegion]);
    
    useEffect(() => {
        setIsLoadingGenres(false);
    }, []);

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
                        <div key={index} className="genre-slide">
                            <SkeletonGenreCard />
                        </div>
                    ))
                ) : (
                    genres.map((genre) => (
                        <div key={genre.id} className="genre-slide">
                                <div 
                                  className={`genre ${selectedGenre === genre.id ? "active" : ""}`}
                                  onClick={() => handleGenreClick(genre.id)}
                                >
                                <div className="genre-icon">{genre.icon}</div>
                                {genre.name}
                            </div>
                        </div>
                    ))
                )}
            </motion.div>

            <div className="movies-list">
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
                {isLoading ? (
                    <div className="movie-details-loading">
                        <div aria-live="assertive" role="alert" class="loader"></div>
                    </div>
                ) : (
                <AnimatePresence mode="wait">
                    <motion.div className="movie-grid"
                        variants={containerStagger}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {sortedMovies.map((movie) => (
                            <motion.div
                                key={movie.id}
                                layout
                                className="movie-card"
                                onClick={() => navigate(`/movie/${movie.id}`)}
                                whileHover={{ scale: 1.03, y: -3, ease: "easeOut" }}
                                variants={movieCardVariant}
                            >
                                <picture>
                                    {movie.poster_path && (
                                        <source
                                            srcSet={`https://image.tmdb.org/t/p/w500${movie.poster_path.endsWith(".webp") ? movie.poster_path : `${movie.poster_path}.webp`}`}
                                            type="image/webp"
                                        />
                                    )}
                                    <motion.img
                                        loading="lazy"
                                        decoding="async"
                                        src={movie.poster_path
                                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                            : "/default.png"}
                                        alt={movie.title}
                                        className="movie-poster"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    />
                                </picture>
                                <span className="movie-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {movie.title.split(" ").slice(0, 3).join(" ")}
                                </span>
                                <div className="movie-details">
                                    <span><FaStar className="movie-star" /> {movie.vote_average.toFixed(1)}</span>
                                    <span className="gap">&nbsp;〡&nbsp;</span>
                                    <span>{movie.release_date?.split("-")[0]}</span>
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
                {(totalPages > 1 || movies.length > 0) && (
                    <div className="pagination-controls">
                        <button
                            onClick={() => fetchMovies(selectedGenre, currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </button>

                        {[...Array(Math.min(5, totalPages - pageRangeStart + 1))].map((_, index) => {
                            const page = pageRangeStart + index;
                            return (
                                <motion.button
                                    key={page}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fetchMovies(selectedGenre, page)}
                                    className={currentPage === page ? "active-page" : ""}
                                >
                                    {page}
                                </motion.button>
                            );
                        })}

                        <button
                            onClick={() => fetchMovies(selectedGenre, currentPage + 1)}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Movies;
