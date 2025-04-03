import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaCalendar, FaClock, FaLanguage } from "react-icons/fa";
import { motion } from "framer-motion";
import "./MovieDetails.css";

const TMDB_API_KEY = "92b98feaab02d1088661e456c19edb89";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const response = await fetch(
                    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`
                );
                
                if (!response.ok) {
                    throw new Error("Failed to fetch movie details");
                }

                const data = await response.json();
                setMovie(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="movie-details-loading">
                <div className="loading-spinner"></div>
                <p>Loading movie details...</p>
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
            <div 
                className="movie-backdrop"
                style={{
                    backgroundImage: `url(${IMAGE_BASE_URL}/w1280${movie.backdrop_path})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                <div className="backdrop-overlay"></div>
            </div>

            <div className="movie-content">
                <div className="movie-poster">
                    <img 
                        src={`${IMAGE_BASE_URL}/w500${movie.poster_path}`}
                        alt={movie.title}
                        loading="lazy"
                    />
                </div>

                <div className="movie-info">
                    <h1>{movie.title}</h1>
                    <div className="movie-meta">
                        <span><FaStar /> {movie.vote_average.toFixed(1)}</span>
                        <span><FaCalendar /> {movie.release_date?.split("-")[0]}</span>
                        <span><FaClock /> {movie.runtime} min</span>
                        <span><FaLanguage /> {movie.original_language.toUpperCase()}</span>
                    </div>

                    <div className="movie-genres">
                        {movie.genres.map(genre => (
                            <span key={genre.id} className="genre-tag">
                                {genre.name}
                            </span>
                        ))}
                    </div>

                    <div className="movie-overview">
                        <h2>Overview</h2>
                        <p>{movie.overview}</p>
                    </div>

                    {movie.credits?.cast && movie.credits.cast.length > 0 && (
                        <div className="movie-cast">
                            <h2>Cast</h2>
                            <div className="cast-list">
                                {movie.credits.cast.slice(0, 6).map(cast => (
                                    <div key={cast.id} className="cast-member">
                                        <img 
                                            src={cast.profile_path 
                                                ? `${IMAGE_BASE_URL}/w185${cast.profile_path}`
                                                : "/default-avatar.png"
                                            }
                                            alt={cast.name}
                                            loading="lazy"
                                        />
                                        <span>{cast.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {movie.similar?.results && movie.similar.results.length > 0 && (
                        <div className="similar-movies">
                            <h2>Similar Movies</h2>
                            <div className="similar-list">
                                {movie.similar.results.slice(0, 4).map(similar => (
                                    <div key={similar.id} className="similar-movie">
                                        <img 
                                            src={`${IMAGE_BASE_URL}/w342${similar.poster_path}`}
                                            alt={similar.title}
                                            loading="lazy"
                                        />
                                        <span>{similar.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MovieDetails; 