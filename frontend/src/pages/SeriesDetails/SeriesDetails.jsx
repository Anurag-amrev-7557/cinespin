import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaCalendar, FaClock, FaLanguage } from "react-icons/fa";
import { motion } from "framer-motion";
import "./SeriesDetails.css";

const TMDB_API_KEY = "92b98feaab02d1088661e456c19edb89";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const SeriesDetails = () => {
    const { id } = useParams();
    const [series, setSeries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSeriesDetails = async () => {
            try {
                const response = await fetch(
                    `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`
                );
                
                if (!response.ok) {
                    throw new Error("Failed to fetch series details");
                }

                const data = await response.json();
                setSeries(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSeriesDetails();
    }, [id]);

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

    if (!series) {
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
            <div 
                className="series-backdrop"
                style={{
                    backgroundImage: `url(${IMAGE_BASE_URL}/w1280${series.backdrop_path})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                <div className="backdrop-overlay"></div>
            </div>

            <div className="series-content">
                <div className="series-poster">
                    <img 
                        src={`${IMAGE_BASE_URL}/w500${series.poster_path}`}
                        alt={series.name}
                        loading="lazy"
                    />
                </div>

                <div className="series-info">
                    <h1>{series.name}</h1>
                    <div className="series-meta">
                        <span><FaStar /> {series.vote_average.toFixed(1)}</span>
                        <span><FaCalendar /> {series.first_air_date?.split("-")[0]}</span>
                        <span><FaClock /> {series.episode_run_time?.[0]} min</span>
                        <span><FaLanguage /> {series.original_language.toUpperCase()}</span>
                    </div>

                    <div className="series-genres">
                        {series.genres.map(genre => (
                            <span key={genre.id} className="genre-tag">
                                {genre.name}
                            </span>
                        ))}
                    </div>

                    <div className="series-overview">
                        <h2>Overview</h2>
                        <p>{series.overview}</p>
                    </div>

                    {series.credits?.cast && series.credits.cast.length > 0 && (
                        <div className="series-cast">
                            <h2>Cast</h2>
                            <div className="cast-list">
                                {series.credits.cast.slice(0, 6).map(cast => (
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

                    {series.similar?.results && series.similar.results.length > 0 && (
                        <div className="similar-series">
                            <h2>Similar Series</h2>
                            <div className="similar-list">
                                {series.similar.results.slice(0, 4).map(similar => (
                                    <div key={similar.id} className="similar-series">
                                        <img 
                                            src={`${IMAGE_BASE_URL}/w342${similar.poster_path}`}
                                            alt={similar.name}
                                            loading="lazy"
                                        />
                                        <span>{similar.name}</span>
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

export default SeriesDetails; 