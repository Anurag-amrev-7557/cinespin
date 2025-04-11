import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getFromCache, setToCache } from "../../utils/cache";
import { RiFilter2Line } from "react-icons/ri";
import { IoFilterSharp } from "react-icons/io5";
import { Helmet } from "react-helmet-async";
import "./CastDetails.css";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-img"></div>
        <div className="skeleton-title"></div>
    </div>
);

const CastDetails = () => {
    const { id } = useParams();
    const [cast, setCast] = useState(null);
    const [credits, setCredits] = useState([]);
    const [sortedCredits, setSortedCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilter, setShowFilter] = useState(false);
    const navigate = useNavigate();
    const [showSort, setShowSort] = useState(false);
    const [sortOption, setSortOption] = useState("year");
    const [filterOrder, setFilterOrder] = useState("desc");

    useEffect(() => {
        const fetchCastDetails = async () => {
            setLoading(true);
            const castKey = `cast-${id}`;
            const creditsKey = `credits-${id}`;
    
            const cachedCast = getFromCache(castKey);
            const cachedCredits = getFromCache(creditsKey);
    
            if (cachedCast && cachedCredits) {
                setCast(cachedCast);
                setCredits(cachedCredits);
                setLoading(false);
                return;
            }
    
            try {
                const [personRes, creditsRes] = await Promise.allSettled([
                    fetch(`${TMDB_BASE_URL}/person/${id}?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/person/${id}/movie_credits?api_key=${TMDB_API_KEY}`)
                ]);
    
                if (personRes.status === "fulfilled") {
                    const personData = await personRes.value.json();
                    setCast(personData);
                    setToCache(castKey, personData);
                }
    
                if (creditsRes.status === "fulfilled") {
                    const creditsData = await creditsRes.value.json();
                    const castCredits = creditsData.cast || [];
                    setCredits(castCredits);
                    setToCache(creditsKey, castCredits);
                }
    
                if (personRes.status === "rejected" || creditsRes.status === "rejected") {
                    throw new Error("Some details could not be fetched.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchCastDetails();
    }, [id]);

    useEffect(() => {
        if (credits.length > 0) {
            let sorted = [...credits];

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

            setSortedCredits(sorted);
        }
    }, [sortOption, filterOrder, credits]);

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

    return (
        <>
            {cast && (
            <Helmet>
                <title>{cast.name} - Cast Details</title>
                <meta name="description" content={`Details about ${cast.name}`} />
            </Helmet>
            )}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        className="cast-details-error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <p>Error: {error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div 
                className="cast-details-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="cast-info">
                    {cast ? (
                        <>
                            <img 
                                src={cast.profile_path ? `${IMAGE_BASE_URL}/original${cast.profile_path}` : "/default.png"}
                                alt={cast.name || "Profile image"}
                            />
                            <div>
                                <h1>{cast.name}</h1>
                                <p>{cast.biography || "No biography available."}</p>
                            </div>
                        </>
                    ) : (
                        <SkeletonCard />
                    )}
                </div>

                <div className="cast-movies">
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
                                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <p onClick={() => handleSortSelection("year")}>Sort by Year</p>
                                <div className="liner"></div>
                                <p onClick={() => handleSortSelection("popularity")}>Sort by Popularity</p>
                                <div className="liner"></div>
                                <p onClick={() => handleSortSelection("rating")}>Sort by Rating</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        <motion.div layout className="movie-list">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, index) => (
                                    <SkeletonCard key={index} />
                                ))
                            ) : sortedCredits.length === 0 ? (
                                <p>No credits found.</p>
                            ) : (
                                sortedCredits.map(movie => (
                                    <motion.a 
                                        layout 
                                        key={`${movie.id}-${movie.credit_id}`} 
                                        className="movie-card" 
                                        onClick={() => navigate(`/movie/${movie.id}`)}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 30 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <img 
                                            src={movie.poster_path 
                                                ? `${IMAGE_BASE_URL}/original${movie.poster_path}` 
                                                : "/default.png"
                                            }
                                            alt={movie.title || "Movie poster"}
                                            loading="lazy"
                                        />
                                        <span>{movie.title}</span>
                                    </motion.a>
                                ))
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </>
    );
};

export default CastDetails;
