import axios from "axios";
import "./Randomizer.css";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { AiFillFire } from "react-icons/ai";
import { LuSwords } from "react-icons/lu";
import { FaHeart } from "react-icons/fa";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { SlMagicWand } from "react-icons/sl";
import { FaMasksTheater } from "react-icons/fa6";
import { MdFamilyRestroom, MdOutlineMovie, MdError } from "react-icons/md";
import { TbMovie } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import _ from "lodash";
import { Pagination, Navigation, Autoplay } from "swiper/modules";

// Constants
const TMDB_API_KEY = "92b98feaab02d1088661e456c19edb89";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// API Service
const tmdbService = {
    async fetchMovies(genreId, page = 1) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    with_genres: genreId,
                    page,
                    sort_by: "popularity.desc",
                    include_adult: false,
                    include_video: false,
                    language: "en-US"
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch movies");
        }
    },

    async fetchTrailer(movieId) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: "en-US"
                }
            });
            return response.data.results.find(video => video.type === "Trailer");
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch trailer");
        }
    },

    async fetchSimilarMovies(movieId) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/similar`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: "en-US",
                    page: 1
                }
            });
            return response.data.results.slice(0, 5);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch similar movies");
        }
    }
};

const genres = [
    { id: 28, name: "Action", icon: <LuSwords />, color: "#FF4B4B" },
    { id: 35, name: "Comedy", icon: <FaMasksTheater />, color: "#FFD700" },
    { id: 18, name: "Drama", icon: <FaHeart />, color: "#FF69B4" },
    { id: 16, name: "Animation", icon: <RiBearSmileFill />, color: "#00CED1" },
    { id: 27, name: "Horror", icon: <RiGhostFill />, color: "#8B0000" },
    { id: 10770, name: "Series", icon: <AiFillFire />, color: "#FF4500" },
    { id: 14, name: "Fantasy", icon: <SlMagicWand />, color: "#9370DB" },
    { id: 878, name: "Sci‒Fi", icon: <RiSpaceShipFill />, color: "#00BFFF" },
    { id: 10751, name: "Family", icon: <MdFamilyRestroom />, color: "#32CD32" },
];

const SkeletonGenreCard = () => (
    <motion.div 
        className="skeleton-genre-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        <div className="skeleton-genre-icon"></div>
        <div className="skeleton-genre-title"></div>
    </motion.div>
);

const MovieCard = ({ movie, onTrailerClick, onSimilarClick }) => (
    <motion.div 
        className="movie-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
    >
        <div className="movie-poster">
            <img 
                src={`${IMAGE_BASE_URL}/w500${movie.poster_path}`} 
                alt={movie.title}
                loading="lazy"
            />
            <div className="movie-overlay">
                <button onClick={() => onTrailerClick(movie.id)}>
                    <TbMovie /> Watch Trailer
                </button>
            </div>
        </div>
        <div className="movie-info">
            <h3>{movie.title}</h3>
            <div className="movie-meta">
                <span>⭐ {movie.vote_average.toFixed(1)}</span>
                <span>📅 {new Date(movie.release_date).getFullYear()}</span>
            </div>
        </div>
    </motion.div>
);

const Randomizer = () => {
    const [moviesByGenre, setMoviesByGenre] = useState({});
    const [isLoadingGenres, setIsLoadingGenres] = useState(true);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [shownMovies, setShownMovies] = useState({});
    const [currentPage, setCurrentPage] = useState({});
    const [similarMovies, setSimilarMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Add new state for mobile menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const fetchMovies = useCallback(async (genreId, page = 1) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await tmdbService.fetchMovies(genreId, page);
            setMoviesByGenre(prev => ({
                ...prev,
                [genreId]: data.results.slice(0, 100)
            }));
            setCurrentPage(prev => ({ ...prev, [genreId]: page }));
            setIsLoadingGenres(false);
        } catch (error) {
            setError(error.message);
            toast.error("Failed to fetch movies. Please try again.");
            console.error("Error fetching movies:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMovies(genres[0].id);
    }, [fetchMovies]);

    const handleGenreClick = useCallback((genreId) => {
        setSelectedGenre(genreId);
        setActiveItem(genreId);
        setCurrentPage(prev => ({ ...prev, [genreId]: 1 }));
        setShownMovies(prev => ({ ...prev, [genreId]: [] }));
        setMoviesByGenre(prev => ({ ...prev, [genreId]: [] }));
        fetchMovies(genreId, 1);
    }, [fetchMovies]);

    const openTrailer = useCallback(async (movieId) => {
        try {
            setIsLoading(true);
            const trailer = await tmdbService.fetchTrailer(movieId);
            if (trailer) {
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
            } else {
                toast.error("No trailer available for this movie");
            }
        } catch (error) {
            toast.error("Failed to fetch trailer. Please try again.");
            console.error("Error fetching trailer:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getRandomMovie = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!selectedGenre) {
                const allMovies = Object.values(moviesByGenre).flat();
                if (allMovies.length === 0) {
                    toast.error("No movies available. Please try again.");
                    return;
                }

                const randomIndex = Math.floor(Math.random() * allMovies.length);
                const chosenMovie = allMovies[randomIndex];
                setSelectedMovie(chosenMovie);
                
                // Fetch similar movies
                const similar = await tmdbService.fetchSimilarMovies(chosenMovie.id);
                setSimilarMovies(similar);
            } else {
                if (!moviesByGenre[selectedGenre] || moviesByGenre[selectedGenre].length === 0) {
                    toast.error("No movies available in this genre. Please try again.");
                    return;
                }

                let availableMovies = moviesByGenre[selectedGenre].filter(movie => 
                    !shownMovies[selectedGenre]?.includes(movie.id)
                );

                if (availableMovies.length === 0) {
                    const nextPage = (currentPage[selectedGenre] || 1) + 1;
                    await fetchMovies(selectedGenre, nextPage);
                    setShownMovies(prev => ({ ...prev, [selectedGenre]: [] }));
                    return;
                }

                const randomIndex = Math.floor(Math.random() * availableMovies.length);
                const chosenMovie = availableMovies[randomIndex];
                setSelectedMovie(chosenMovie);
                
                // Fetch similar movies
                const similar = await tmdbService.fetchSimilarMovies(chosenMovie.id);
                setSimilarMovies(similar);

                setShownMovies(prev => ({
                    ...prev,
                    [selectedGenre]: [...(prev[selectedGenre] || []), chosenMovie.id]
                }));
            }
        } catch (error) {
            setError(error.message);
            toast.error("Failed to get random movie. Please try again.");
            console.error("Error getting random movie:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedGenre, moviesByGenre, shownMovies, currentPage, fetchMovies]);

    const selectedGenreColor = useMemo(() => {
        const genre = genres.find(g => g.id === selectedGenre);
        return genre?.color || "#ffffff";
    }, [selectedGenre]);

    // Add function to handle mobile menu toggle
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="randomizer-container">
            <div className="genre-container">
                <motion.div 
                    className="genre-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2>Choose Your Genre</h2>
                    <button 
                        className="mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </motion.div>
                
                <div className={`genre-slider ${isMobileMenuOpen ? 'open' : ''}`}>
                    <Swiper
                        slidesPerView="auto"
                        spaceBetween={10}
                        loop={false}
                        pagination={false}
                        navigation={true}
                        autoplay={false}
                        modules={[Pagination, Navigation, Autoplay]}
                        breakpoints={{
                            320: { slidesPerView: 2 },
                            480: { slidesPerView: 3 },
                            768: { slidesPerView: 5 },
                            1024: { slidesPerView: 7 },
                            1280: { slidesPerView: 9 }
                        }}
                    >
                        {isLoadingGenres ? (
                            [...Array(9)].map((_, index) => (
                                <SwiperSlide key={index} className="genre-slide">
                                    <SkeletonGenreCard />
                                </SwiperSlide>
                            ))
                        ) : (
                            genres.map((genre) => (
                                <SwiperSlide key={genre.id} className="genre-slide">
                                    <motion.div 
                                        className={`genre ${activeItem === genre.id ? "active-genre" : ""}`}
                                        onClick={() => {
                                            handleGenreClick(genre.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            borderColor: activeItem === genre.id ? genre.color : undefined,
                                            boxShadow: activeItem === genre.id ? `0 0 15px ${genre.color}` : undefined
                                        }}
                                    >
                                        <div className="genre-icon">{genre.icon}</div>
                                        {genre.name}
                                    </motion.div>
                                </SwiperSlide>
                            ))
                        )}
                    </Swiper>
                </div>
            </div>

            <div className="random-container">
                <motion.div 
                    className="random-button-container"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <button 
                        onClick={getRandomMovie}
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        <div className="random-button-icon">
                            <MdOutlineMovie />
                        </div>   
                        {isLoading ? "Loading..." : "Watch"}
                    </button>
                </motion.div>

                <AnimatePresence mode="wait">
                    {error ? (
                        <motion.div 
                            className="error-container"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <MdError className="error-icon" />
                            <p>{error}</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            className="random-content-container"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {selectedMovie && selectedMovie.backdrop_path && (
                                <motion.div 
                                    className="background-blur"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        backgroundImage: `url(${IMAGE_BASE_URL}/w1280${selectedMovie.backdrop_path})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                />
                            )}
                            
                            {selectedMovie ? (
                                <motion.div 
                                    className="movie-details"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="movie-poster-container">
                                        <img 
                                            src={`${IMAGE_BASE_URL}/w500${selectedMovie.poster_path}`} 
                                            alt={selectedMovie.title}
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="movie-info-container">
                                        <h2>{selectedMovie.title}</h2>
                                        <p className="overview">{selectedMovie.overview}</p>
                                        <div className="movie-meta">
                                            <span>⭐ {selectedMovie.vote_average.toFixed(1)}/10</span>
                                            <span>📅 {new Date(selectedMovie.release_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="movie-genres">
                                            {selectedMovie.genre_ids
                                                .map(genreId => genres.find(g => g.id === genreId))
                                                .filter(Boolean)
                                                .map(genre => (
                                                    <span 
                                                        key={genre.id}
                                                        style={{ backgroundColor: genre.color }}
                                                    >
                                                        {genre.name}
                                                    </span>
                                                ))}
                                        </div>
                                        <motion.button 
                                            onClick={() => openTrailer(selectedMovie.id)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={isLoading}
                                        >
                                            <TbMovie />
                                            Watch Trailer
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.p 
                                    className="placeholder-text"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    Select a genre and click the button to get a movie!
                                </motion.p>
                            )}

                            {similarMovies.length > 0 && (
                                <motion.div 
                                    className="similar-movies"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h3>Similar Movies</h3>
                                    <div className="similar-movies-grid">
                                        {similarMovies.map(movie => (
                                            <MovieCard
                                                key={movie.id}
                                                movie={movie}
                                                onTrailerClick={openTrailer}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Randomizer;