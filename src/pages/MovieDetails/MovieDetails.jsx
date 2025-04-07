import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
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
                setMovie(cached);
                setLoading(false);
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
                <p>Loading.....</p>
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
            <div className="movie-details-error">
                <p>Movie not found</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="movie-details-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div 
                className="movie-details-overlay" 
                style={{
                    backgroundImage: `url(${IMAGE_BASE_URL}/original${movie.backdrop_path})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
                loading="lazy"
                decoding="async"
                {...bounceAnimation}
            >
                <div className="backdrop-overlay"></div>
            </motion.div>

            <motion.div className="movie-content" {...bounceAnimation}>
                <motion.div className="movie-info" {...bounceAnimation}>
                    <motion.h1 {...bounceAnimation}>{movie.title}</motion.h1>
                    <div className="movie-meta">
                        <motion.span {...bounceAnimation}><FaStar /> {movie.vote_average.toFixed(1)}</motion.span>
                        <motion.span {...bounceAnimation}><FaCalendar /> {movie.release_date?.split("-")[0]}</motion.span>
                        <motion.span {...bounceAnimation}><FaClock /> {movie.runtime} min</motion.span>
                        <motion.span {...bounceAnimation}><FaLanguage /> {movie.original_language.toUpperCase()}</motion.span>
                    </div>

                    <motion.div className="movie-genres" {...bounceAnimation}>
                        {movie.genres.map(genre => (
                            <motion.span key={genre.id} className="genre-tag" {...bounceAnimation}>
                                {genre.name}
                            </motion.span>
                        ))}
                    </motion.div>

                    <motion.div className="movie-overview" {...bounceAnimation}>
                        <h2>Overview</h2>
                        <p>{truncateOverview(movie.overview)}</p>
                        {movie.videos?.results?.length > 0 && (
                            <motion.button
                                onClick={openTrailer}
                                ref={trailerButtonRef}
                                className="trailer-button"
                                {...bounceAnimation}
                            >
                                ▶ &nbsp;Watch Trailer
                            </motion.button>
                        )}
                    </motion.div>

                    {movie.similar?.results && movie.similar.results.length > 0 && (
                        <motion.div className="similar-movies" {...bounceAnimation}>
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
                                    .slice(0, 10)
                                    .map(similar => (
                                        <motion.a key={similar.id} className="similar-movie" href={`/movie/${similar.id}`} {...bounceAnimation}>
                                            <img 
                                                src={similar.poster_path 
                                                    ? `${IMAGE_BASE_URL}/w500${similar.poster_path}` 
                                                    : "/default.png"
                                                }
                                                alt={similar.title}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <span>{similar.title}</span>
                                        </motion.a>
                                    ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
                
                {movie.credits?.cast && movie.credits.cast.length > 0 && (
                    <motion.div className="movie-cast" {...bounceAnimation}>
                        <h2>Cast</h2>
                        <div className="cast-list">
                            {movie.credits.cast.map(cast => (
                                <motion.a key={cast.id} className="cast-member" href={`/cast/${cast.id}`} {...bounceAnimation}>
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

            <AnimatePresence>
                {showTrailer && (
                    <motion.div
                        className="trailer-modal-overlay"
                        onClick={closeTrailer}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        role="dialog"
                        aria-modal="true"
                    >
                        <motion.div
                            className="trailer-modal"
                            onClick={(e) => e.stopPropagation()}
                            initial={{
                                scale: 0.7, 
                                opacity: 0,
                                x: trailerPosition.x - window.innerWidth / 2, 
                                y: trailerPosition.y - window.innerHeight / 2
                            }}
                            animate={{
                                scale: 1, 
                                opacity: 1,
                                x: 0, 
                                y: 0
                            }}
                            exit={{
                                scale: 0.7, 
                                opacity: 0
                            }}
                            transition={{
                                scale: { type: "spring", stiffness: 400, damping: 20 }, // Spring for smooth scale transition
                                opacity: { duration: 0.4 },
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                y: { type: "spring", stiffness: 300, damping: 30 },
                            }}
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