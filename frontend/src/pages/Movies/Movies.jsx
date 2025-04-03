import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import "./Movies.css";
import { AiFillFire } from "react-icons/ai";
import { FaHeart } from "react-icons/fa";
import { FaMasksTheater } from "react-icons/fa6";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { SlMagicWand } from "react-icons/sl";
import { MdFamilyRestroom } from "react-icons/md";
import { IoFilter } from "react-icons/io5";
import { TbFilter } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

// Constants
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
console.log('Environment variables:', import.meta.env);
if (!TMDB_API_KEY) {
    console.error('TMDB API key is not defined. Please check your .env file.');
} else {
    console.log('TMDB API key loaded successfully');
}
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const ITEMS_PER_PAGE = 20;
const CARDS_PER_ROW = 4;
const SCROLL_THRESHOLD = 0.8;

// API Service
const tmdbService = {
    async fetchMovies(genreId, page, region) {
        try {
            console.log('Fetching movies with API key:', TMDB_API_KEY);
            const regionParam = region === "India" ? "&region=IN&with_original_language=hi" : "";
            const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}${regionParam}`;
            console.log('API URL:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            return data;
        } catch (error) {
            console.error("Error fetching movies:", error);
            throw error;
        }
    }
};

// Skeleton Components
const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-img"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-details"></div>
    </div>
);

const SkeletonGenreCard = () => (
    <div className="skeleton-genre-card">
        <div className="skeleton-genre-icon"></div>
        <div className="skeleton-genre-title"></div>
    </div>
);

// Movie Card Component
const MovieCard = React.memo(({ movie, fallbackImage }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
        <motion.a 
            className="movie-card" 
            href={`/movie/${movie.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <div className="movie-card-image">
                {!imageError && movie.poster_path ? (
                    <picture>
                        <source 
                            srcSet={`${IMAGE_BASE_URL}/w500${movie.poster_path}.webp`} 
                            type="image/webp" 
                        />
                        <img 
                            src={`${IMAGE_BASE_URL}/w500${movie.poster_path}`}
                            className="movie-card-img"
                            alt={movie.title}
                            onError={() => setImageError(true)}
                            loading="lazy"
                            width="250"
                            height="375"
                            style={{ objectFit: "cover" }}
                        />
                    </picture>
                ) : (
                    <img 
                        src={fallbackImage}
                        className="movie-card-img"
                        alt="Default movie poster"
                        loading="lazy"
                        width="250"
                        height="375"
                        style={{ objectFit: "cover" }}
                    />
                )}
            </div>
            <span className="movie-title">{movie.title}</span>
            <div className="movie-details">
                <span><FaStar className="movie-star" /> {movie.vote_average.toFixed(1)}</span>
                <span className="gap">&nbsp;〡&nbsp;</span>
                <span>{movie.release_date?.split("-")[0]}</span>
            </div>
        </motion.a>
    );
});

const genres = [
    { id: 28, name: "Action", icon: <AiFillFire /> },
    { id: 35, name: "Comedy", icon: <FaMasksTheater /> },
    { id: 18, name: "Drama", icon: <FaHeart /> },
    { id: 16, name: "Animation", icon: <RiBearSmileFill /> },
    { id: 27, name: "Horror", icon: <RiGhostFill /> },
    { id: 10770, name: "Series", icon: <AiFillFire /> },
    { id: 14, name: "Fantasy", icon: <SlMagicWand /> },
    { id: 878, name: "Sci‒Fi", icon: <RiSpaceShipFill /> },
    { id: 10751, name: "Family", icon: <MdFamilyRestroom /> },
];

const Movies = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [moviesByGenre, setMoviesByGenre] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoadingGenres, setIsLoadingGenres] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [moviesPerPage] = useState(49); // 7 rows * 7 cards per row
    const [cardsPerRow] = useState(7); // Fixed number of cards per row
    const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem('region') || "Global");
    const [selectedGenre, setSelectedGenre] = useState("Action");
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState({});
    const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
    const sortPopupRef = useRef();
    const { ref: loadMoreRef, inView } = useInView({
        threshold: SCROLL_THRESHOLD,
        triggerOnce: false
    });
    const [displayedMovies, setDisplayedMovies] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const fallbackImage = "/default.png";

    const fetchMovies = useCallback(async (genreId, page) => {
        try {
            setError(null);
            setIsLoading(true);
            console.log('Starting to fetch movies for genre:', genreId);
            
            const data = await tmdbService.fetchMovies(genreId, page, selectedRegion);
            console.log('Received movies data:', data);
            
            setMoviesByGenre(prevMovies => ({
                ...prevMovies,
                [genreId]: data.results
            }));

            setTotalPages(Math.min(Math.ceil(data.total_results / moviesPerPage), 7));
            setIsLoading(false);
        } catch (error) {
            console.error("Error in fetchMovies:", error);
            setError(error.message);
            setIsLoading(false);
        }
    }, [selectedRegion, moviesPerPage]);

    useEffect(() => {
        localStorage.setItem('region', selectedRegion);
    }, [selectedRegion]);

    const handleGenreClick = useCallback((genreId, genreName) => {
        setSelectedGenre(genreName);
        localStorage.setItem('selectedGenre', genreName);
        setCurrentPage(1);
        fetchMovies(genreId, 1);
    }, [fetchMovies]);

    const handlePageChange = useCallback((newPage) => {
        const currentGenreId = genres.find(genre => genre.name === selectedGenre)?.id;
        if (!currentGenreId) return;

        setCurrentPage(newPage);
        fetchMovies(currentGenreId, newPage);
    }, [selectedGenre, fetchMovies]);

    useEffect(() => {
        const storedGenre = localStorage.getItem('selectedGenre') || "Action";
        setSelectedGenre(storedGenre);
        
        const genreId = genres.find(genre => genre.name === storedGenre)?.id || genres[0].id;
        if (!moviesByGenre[genreId] || moviesByGenre[genreId].length === 0) {
            setIsLoadingGenres(true);
            fetchMovies(genreId, 1);
        }
    }, [fetchMovies, selectedRegion]);

    const handleClickOutside = useCallback((event) => {
        if (sortPopupRef.current && !sortPopupRef.current.contains(event.target)) {
            setIsSortPopupOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const currentGenreId = useMemo(() => 
        genres.find(genre => genre.name === selectedGenre)?.id,
        [selectedGenre]
    );

    const filteredMovies = useMemo(() => {
        if (!currentGenreId || !moviesByGenre[currentGenreId]) return [];
        
        return moviesByGenre[currentGenreId]
            .filter(movie => {
                // Check if movie has all required properties
                const hasRequiredProperties = 
                    movie.vote_average !== undefined && 
                    movie.vote_average > 0 &&
                    movie.release_date && 
                    movie.release_date.length >= 4 &&
                    movie.poster_path;

                // Check if movie matches search term
                const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());

                return hasRequiredProperties && matchesSearch;
            })
            .sort((a, b) => {
                // Sort by rating first
                if (b.vote_average !== a.vote_average) {
                    return b.vote_average - a.vote_average;
                }
                
                // Then by release year
                const yearA = parseInt(a.release_date.split("-")[0]);
                const yearB = parseInt(b.release_date.split("-")[0]);
                return yearB - yearA;
            });
    }, [moviesByGenre, currentGenreId, searchTerm]);

    return (
        <div className="landing-container">
            <div className="genre-container">
                {isLoading ? (
                    Array.from({ length: genres.length }, (_, index) => (
                        <div key={index} className="genre-slide">
                            <SkeletonGenreCard />
                        </div>
                    ))
                ) : (
                    genres.map((genre) => (
                        <div key={genre.id} className="genre-slide">
                            <div 
                                className={`genre ${selectedGenre === genre.name ? 'active' : ''}`}
                                onClick={() => handleGenreClick(genre.id, genre.name)}
                            >
                                <div className="genre-icon">{genre.icon}</div>
                                {genre.name}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="filter-container">
                <div className="sort" onClick={() => setIsSortPopupOpen(!isSortPopupOpen)}>
                    <IoFilter className={`bounce-in ${isSortPopupOpen ? 'active' : ''}`} />
                </div>
                <div className="filter">
                    <TbFilter />
                </div>
            </div>

            <div className="item-container">
                {isLoading ? (
                    Array.from({ length: moviesPerPage }, (_, index) => (
                        <SkeletonCard key={index} />
                    ))
                ) : (
                    filteredMovies
                        .slice(0, moviesPerPage)
                        .map((movie, index) => (
                            <MovieCard 
                                key={`${movie.id}-${index}`} 
                                movie={movie} 
                                fallbackImage={fallbackImage}
                            />
                        ))
                )}
                
                {!isLoading && filteredMovies.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-buttons">
                            <button 
                                className="pagination-button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            
                            <button 
                                className="pagination-button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                        <div className="page-info">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="error-message">
                        Error loading movies. Please try again.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Movies;