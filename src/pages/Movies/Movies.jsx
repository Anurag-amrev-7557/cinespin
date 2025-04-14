import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiFillFire } from "react-icons/ai";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { LuSwords } from "react-icons/lu";
import { GiDrippingKnife } from "react-icons/gi";
import { FaHatWizard } from "react-icons/fa6";
import { GiSpartanHelmet } from "react-icons/gi";
import { FaHeart } from "react-icons/fa";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { FaMasksTheater } from "react-icons/fa6";
import { getFromCache, setToCache } from "../../utils/cache";
import { PiDetectiveFill } from "react-icons/pi";
import { GiDramaMasks } from "react-icons/gi";
import { MdVideoCameraBack } from "react-icons/md";
import { RiFilter2Line } from "react-icons/ri";
import { FaGun } from "react-icons/fa6";
import { TbMapRoute } from "react-icons/tb";
import { IoFilterSharp } from "react-icons/io5";
import { GiSentryGun } from "react-icons/gi";
import { FaHandcuffs } from "react-icons/fa6";
import { MdFamilyRestroom } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import "./Movies.css";

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
    { id: 12, name: "Adventure", icon: <TbMapRoute /> },
    { id: 10749, name: "Romance", icon: <FaHeart /> },
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

const Movies = () => {
    const [selectedGenre, setSelectedGenre] = useState(() => parseInt(localStorage.getItem("genre")) || genres[0].id);
    const [movies, setMovies] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingGenres, setIsLoadingGenres] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState(() => localStorage.getItem("region") || "Global");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageNumber, setPageNumber] = useState(parseInt(localStorage.getItem("currentPage")) || 1); // Get from localStorage or default to 1
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

    const fetchMovieDetails = async (movieId) => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
            );
            if (!response.ok) throw new Error("Failed to fetch movie details");
            return await response.json();
        } catch (error) {
            console.error("Error fetching movie details:", error);
            return null;
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

            const movies = await Promise.all((data.results || []).map(async (movie) => {
                const details = await fetchMovieDetails(movie.id);
                return {
                    ...movie,
                    runtime: details?.runtime || null,
                };
            }));
    
            setMovies(movies);
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

    const formatRuntime = (minutes) => {
        if (!minutes || isNaN(minutes)) return "";
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins}m`;
    };

    return (
        <>
        {selectedGenre && (

                <Helmet>
                <title>{`Browse ${genres.find(g => g.id === selectedGenre)?.name || 'Movies'} Movies - Cinespin`}</title>
                <meta
                    name="description"
                    content={`Explore the best ${genres.find(g => g.id === selectedGenre)?.name || 'movies'} movies by genre. Discover new favorites with Cinespin!`}
                />
                </Helmet>
            
        )}
        <div className="movies-container">
            <motion.div
              className="genre-container"
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            >
                {!genres.length || isLoadingGenres ? (
                    Array.from({ length: genres.length || 18 }, (_, index) => (
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
                            <p onClick={() => handleFilterSelection("filter1")}>Descending Order</p>
                            <div className="liner"></div>
                            <p onClick={() => handleFilterSelection("filter2")}>Ascending Order</p>
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
                                whileHover={{ scale: 1.03, y: -3, transition: { ease: "easeOut" } }}
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
                                            <span>{formatRuntime(movie.runtime)}</span>
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
    </>
    );
};

export default Movies;