import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaCalendar, FaClock, FaLanguage } from "react-icons/fa";
import { getFromCache, setToCache } from "../../utils/cache";
import { motion, AnimatePresence } from "framer-motion";
import "./MovieDetails.css";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const truncateOverview = (text) => {
    if (!text) return '';
    return text.length > 200 ? text.substring(0, 150) + '...' : text;
};

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-img"></div>
        <div className="skeleton-title"></div>
    </div>
);

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const trailerRef = useRef();
    const navigate = useNavigate();
    const trailerButtonRef = useRef(null);
    const [trailerPosition, setTrailerPosition] = useState({ x: 0, y: 0 });

    const openTrailer = () => {
        if (trailerButtonRef.current) {
            const rect = trailerButtonRef.current.getBoundingClientRect();
            setTrailerPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        }
        setShowTrailer(true);
    };

    const closeTrailer = useCallback(() => {
        setShowTrailer(false);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                closeTrailer();
            }
        };

        if (showTrailer) {
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.removeEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showTrailer, closeTrailer]);

    useEffect(() => {
        const cacheKey = `movie-details-${id}`;
    
        const fetchMovieDetails = async () => {
            const cached = getFromCache(cacheKey);
            if (cached) {
                setTimeout(() => {
                  setMovie(cached);
                  setLoading(false);
                }, 200); // or 100ms if you want a visible loading flicker
                return;
              }
    
            try {
                const response = await fetch(
                    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`
                );
    
                if (!response.ok) {
                    throw new Error("Failed to fetch movie details");
                }
    
                const data = await response.json();
                setMovie(data);
                setToCache(cacheKey, data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchMovieDetails();
    }, [id]);

    const bounceAnimation = {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                mass: 1 
            },
        },
        exit: { opacity: 0, y: -20 },
    };

    if (loading) {
        return (
            <div className="movie-details-loading">
                <div aria-live="assertive" role="alert" className="loader"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="movie-details-error">
                <p>Error: {error}</p>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-details-loading">
                <div aria-live="assertive" role="alert" class="loader"></div>
            </div>
        );
    }

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };
    
    const fadeUpSpring = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
                mass: 1,
            },
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: { duration: 0.3 }
        }
    };
    
    const modalOverlayVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.4 }
        },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };
    
    const modalContentVariants = (x, y) => ({
        hidden: { scale: 0.7, opacity: 0, x, y },
        visible: {
            scale: 1,
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
            }
        },
        exit: {
            scale: 0.7,
            opacity: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    });

    return (
        <motion.div 
            className="movie-details-container"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
        >
            {movie && (
              <Helmet>
                <title>{movie.title} - Movie Details</title>
                <meta name="description" content={truncateOverview(movie.overview)} />
              </Helmet>
            )}
            <motion.div 
                className="movie-details-overlay" 
                style={{
                    backgroundImage: `url(${IMAGE_BASE_URL}/original${movie.backdrop_path})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
                decoding="async"
                variants={fadeUpSpring}
            >
                <div className="backdrop-overlay"></div>
            </motion.div>
            
            <AnimatePresence>
            <motion.div className="movie-content" variants={fadeUpSpring}>
                <motion.div className="movie-info" variants={fadeUpSpring}>
                    <motion.h1 variants={fadeUpSpring}>{movie.title}</motion.h1>
                    <div className="movie-meta">
                        <motion.span variants={fadeUpSpring}><FaStar /> {movie.vote_average.toFixed(1)}</motion.span>
                        <motion.span variants={fadeUpSpring}><FaCalendar /> {movie.release_date?.split("-")[0]}</motion.span>
                        {movie.runtime && (
                            <motion.span variants={fadeUpSpring}>
                                <FaClock /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                            </motion.span>
                        )}
                        <motion.span variants={fadeUpSpring}><FaLanguage /> {movie.original_language.toUpperCase()}</motion.span>
                    </div>

                    <motion.div className="movie-genres" variants={fadeUpSpring}>
                        {movie.genres.map(genre => (
                            <motion.div
                                key={genre.id}
                                className="genre-tag"
                                onClick={() => navigate(`/movies?genre=${genre.id}&page=1`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        navigate(`/movies?genre=${genre.id}&page=1`);
                                    }
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {genre.name}
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div className="movie-overview" variants={fadeUpSpring}>
                        <h2>Overview</h2>
                        <p>{truncateOverview(movie.overview)}</p>
                        {movie.videos?.results?.length > 0 && (
                            <motion.button
                                onClick={openTrailer}
                                ref={trailerButtonRef}
                                className="trailer-button"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 24,
                                    mass: 1,
                                    delay: 0, 
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                ▶ &nbsp;Watch Trailer
                            </motion.button>
                        )}
                    </motion.div>

                    <AnimatePresence>
                    {movie.similar?.results && movie.similar.results.length > 0 && (
                        <motion.div className="similar-movies" variants={fadeUpSpring}>
                            <h2>Similar Movies</h2>
                            <div className="similar-list">
                                {movie.similar.results
                                    .map(similar => {
                                        const sharedGenres = similar.genre_ids.filter(id =>
                                            movie.genres.map(g => g.id).includes(id)
                                        ).length;

                                        const releaseYear = parseInt(similar.release_date?.split("-")[0]) || 0;
                                        const currentYear = parseInt(movie.release_date?.split("-")[0]) || 0;
                                        const yearProximity = 1 / (1 + Math.abs(currentYear - releaseYear));

                                        const mainCastIds = movie.credits?.cast?.slice(0, 5).map(c => c.id) || [];
                                        const similarCastIds = similar.credits?.cast?.slice(0, 5).map(c => c.id) || [];
                                        const sharedCast = mainCastIds.filter(id => similarCastIds.includes(id)).length;

                                        const movieDirector = movie.credits?.crew?.find(c => c.job === "Director")?.id;
                                        const similarDirector = similar.credits?.crew?.find(c => c.job === "Director")?.id;
                                        const sameDirector = movieDirector && similarDirector && movieDirector === similarDirector ? 1 : 0;

                                        const voteScore = (similar.vote_average || 0) / 10;
                                        const popularityScore = (similar.popularity || 0) / 1000;

                                        const relevanceScore =
                                            sharedGenres * 2 +
                                            yearProximity * 2 +
                                            sharedCast * 1.5 +
                                            sameDirector * 3 +
                                            voteScore * 1.5 +
                                            popularityScore;

                                        return {
                                            ...similar,
                                            relevanceScore
                                        };
                                    })
                                    .sort((a, b) => b.relevanceScore - a.relevanceScore)
                                    .map(similar => (
                                        <motion.a key={similar.id} className="similar-movie" onClick={() => navigate(`/movie/${similar.id}`)} variants={fadeUpSpring}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}>
                                            <motion.img 
                                                src={similar.poster_path 
                                                    ? `${IMAGE_BASE_URL}/w500${similar.poster_path}` 
                                                    : "/default.png"
                                                }
                                                alt={similar.title}
                                                loading="lazy"
                                                decoding="async"
                                                variants={fadeUpSpring}
                                            >
                                            </motion.img>
                                            <span>{similar.title}</span>
                                        </motion.a>
                                    ))}
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </motion.div>
                
                {movie.credits?.cast && movie.credits.cast.length > 0 && (
                    <motion.div className="movie-cast" variants={fadeUpSpring}>
                        <h2>Cast</h2>
                        <div className="cast-list">
                            {movie.credits.cast.map(cast => (
                                <motion.a key={cast.id} className="cast-member" onClick={() => navigate(`/cast/${cast.id}`)} variants={fadeUpSpring}>
                                    <picture>
                                    <img 
                                        src={cast.profile_path 
                                            ? `${IMAGE_BASE_URL}/w500${cast.profile_path}`
                                            : "/default.png"
                                        }
                                        alt={cast.name}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    </picture>
                                    <span>{cast.name}</span>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {showTrailer && (
                    <motion.div
                        className="trailer-modal-overlay"
                        onClick={closeTrailer}
                        variants={modalOverlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        role="dialog"
                        aria-modal="true"
                    >
                        <motion.div
                            className="trailer-modal"
                            onClick={(e) => e.stopPropagation()}
                            variants={modalContentVariants(
                                trailerPosition.x - window.innerWidth / 2,
                                trailerPosition.y - window.innerHeight / 2
                            )}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            ref={trailerRef}
                        >
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${movie.videos.results[0].key}?autoplay=1&rel=0`}
                                title={`${movie.title} Trailer`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
 
export default MovieDetails;