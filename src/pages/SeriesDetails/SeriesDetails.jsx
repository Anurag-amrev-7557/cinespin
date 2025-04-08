import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaCalendar, FaClock, FaLanguage, FaTv } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { getFromCache, setToCache } from "../../utils/cache";
import "./SeriesDetails.css";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const truncateOverview = (text) => {
    if (!text) return '';
    return text.length > 200 ? text.substring(0, 150) + '...' : text;
};

const SeriesDetails = () => {
    const { id } = useParams();
    const [movie, setSeries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const trailerButtonRef = useRef(null);
    const [trailerPosition, setTrailerPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchSeriesDetails = async () => {
            const cacheKey = `series-${id}`;
    
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setSeries(cachedData);
                setLoading(false);
                return;
            }
    
            try {
                const response = await fetch(
                    `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`
                );
    
                if (!response.ok) {
                    throw new Error("Failed to fetch series details");
                }
    
                const data = await response.json();
                setSeries(data);
                setToCache(cacheKey, data); // ✅ Store full response
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchSeriesDetails();
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
            <div className="series-details-loading">
                <div className="loading-spinner"></div>
                <p>Loading series details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="series-details-error">
                <p>Error: {error}</p>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="series-details-error">
                <p>Series not found</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="series-details-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div className="series-details-overlay" 
                style={{
                    backgroundImage: `url(${IMAGE_BASE_URL}/original${movie.backdrop_path})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
                decoding="async"
                {...bounceAnimation}
            >
                <div className="backdrop-overlay"></div>
            </motion.div>

            <motion.div className="series-content" {...bounceAnimation}>
                <motion.div className="series-info" {...bounceAnimation}>
                    <motion.h1 {...bounceAnimation}>{movie.name}</motion.h1>
                    <div className="series-meta">
                        <motion.span {...bounceAnimation}><FaStar /> {movie.vote_average.toFixed(1)}</motion.span>
                        <motion.span {...bounceAnimation}><FaCalendar /> {movie.release_date?.split("-")[0]}</motion.span>
                        <motion.span {...bounceAnimation}><FaClock /> {movie.runtime} min</motion.span>
                        <motion.span {...bounceAnimation}><FaLanguage /> {movie.original_language.toUpperCase()}</motion.span>
                        <motion.span {...bounceAnimation}><FaTv /> {movie.number_of_seasons} season{movie.number_of_seasons > 1 ? "s" : ""}</motion.span>
                    </div>

                    <motion.div className="series-genres" {...bounceAnimation}>
                        {movie.genres.map(genre => (
                            <motion.span key={genre.id} className="genre-tag" {...bounceAnimation}>
                                {genre.name}
                            </motion.span>
                        ))}
                    </motion.div>

                    <motion.div className="series-overview" {...bounceAnimation}>
                        <h2>Overview</h2>
                        <p>{truncateOverview(movie.overview)}</p>
                        {movie.videos?.results?.length > 0 && (
                            <motion.button
                                onClick={() => {
                                    if (trailerButtonRef.current) {
                                        const rect = trailerButtonRef.current.getBoundingClientRect();
                                        const scrollX = window.scrollX || window.pageXOffset;
                                        const scrollY = window.scrollY || window.pageYOffset;
                                        setTrailerPosition({
                                            x: rect.left + rect.width / 2 + scrollX,
                                            y: rect.top + rect.height / 2 + scrollY
                                        });
                                    }
                                    setShowTrailer(true);
                                }}
                                className="trailer-button"
                                ref={trailerButtonRef}
                                {...bounceAnimation}
                            >
                                ▶ &nbsp;Watch Trailer
                            </motion.button>
                        )}
                    </motion.div>

                    {movie.similar?.results && movie.similar.results.length > 0 && (
                        <motion.div className="similar-series" {...bounceAnimation}>
                            <h2>Similar Series</h2>
                            <div className="similar-list">
                                {movie.similar.results
                                    .filter(similar => similar.poster_path && similar.vote_average && (similar.release_date || similar.first_air_date))
                                    .map(similar => (
                                        <motion.a key={similar.id} className="similar-series" href={`/series/${similar.id}`} {...bounceAnimation}>
                                            <picture>
                                            <img 
                                                src={`${IMAGE_BASE_URL}/original${similar.poster_path}`} 
                                                alt={similar.title || similar.name}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            </picture>
                                            <span>{similar.title || similar.name}</span>
                                        </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
                {movie.credits?.cast && movie.credits.cast.length > 0 && (
                        <motion.div className="series-cast" {...bounceAnimation}>
                        <h2>Cast</h2>
                        <div className="cast-list">
                            {movie.credits.cast.map(cast => (
                                <motion.a key={cast.id} className="cast-member" href={`/cast/${cast.id}`} {...bounceAnimation}>
                                    <picture>
                                    <img 
                                        src={cast.profile_path 
                                            ? `${IMAGE_BASE_URL}/original${cast.profile_path}`
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
                    onClick={() => setShowTrailer(false)}
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
                            scale: 0.5, 
                            opacity: 0, 
                            x: trailerPosition.x - window.innerWidth / 2, 
                            y: trailerPosition.y - window.innerHeight / 2 
                        }}
                        animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{
                            scale: { type: "spring", stiffness: 400, damping: 20 }, // Spring for smooth scale transition
                            opacity: { duration: 0.4 },
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            y: { type: "spring", stiffness: 300, damping: 30 },
                        }}
                    >
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${movie.videos.results[0].key}?autoplay=1&rel=0`}
                            title={`${movie.name} Trailer`}
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

export default SeriesDetails;