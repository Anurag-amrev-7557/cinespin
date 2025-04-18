import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useLayoutEffect,
    useMemo,
} from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { LuDownload } from "react-icons/lu";
import { FaStar, FaCalendar, FaClock, FaLanguage, FaArrowLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload } from "react-icons/fi";
import { IoPlay } from "react-icons/io5";
import { getFromCache, setToCache } from "../../utils/cache";
import movieDownloadLinks from "../../utils/movieDownloadLinks";
import streamDownloadLinks from "../../utils/streamLinks";
import "./MovieDetails.css";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const truncateOverview = (text, max = 200) =>
    text && text.length > max ? text.slice(0, max) + "..." : text || "";

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-img"></div>
        <div className="skeleton-title"></div>
    </div>
);

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const currentPage = searchParams.get("page") || 1;
    const trailerRef = useRef(null);
    const trailerButtonRef = useRef(null);

    const [movie, setMovie] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerPosition, setTrailerPosition] = useState({ x: 0, y: 0 });

    const cacheKey = useMemo(() => `movie-details-${id}`, [id]);

    const openTrailer = () => {
        if (window.innerWidth <= 450) {
            const key = movie?.videos?.results?.[0]?.key;
            if (key) {
                window.open(`https://www.youtube.com/watch?v=${key}`, "_blank");
            }
        } else {
            const rect = trailerButtonRef.current?.getBoundingClientRect();
            if (rect) {
                setTrailerPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            }
            setShowTrailer(true);
        }
    };

    const closeTrailer = useCallback(() => setShowTrailer(false), []);

    useEffect(() => {
        const handler = (e) => e.key === "Escape" && closeTrailer();
        if (showTrailer) {
            document.addEventListener("keydown", handler);
        }
        return () => document.removeEventListener("keydown", handler);
    }, [showTrailer, closeTrailer]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            document.body.style.background = "black";
        }, 1000);
        return () => {
            clearTimeout(timeout);
            document.body.style.background = "";
        };
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            const cached = getFromCache(cacheKey);
            if (cached) {
                setTimeout(() => {
                    setMovie(cached);
                    setLoading(false);
                }, 200);
                return;
            }

            try {
                const response = await fetch(
                    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
                );
                if (!response.ok) throw new Error("Failed to fetch movie details");
                const data = await response.json();
                setMovie(data);
                if (data.belongs_to_collection?.id) {
                    try {
                        const collectionRes = await fetch(`${TMDB_BASE_URL}/collection/${data.belongs_to_collection.id}?api_key=${TMDB_API_KEY}`);
                        const collectionData = await collectionRes.json();
                        const collectionWithCredits = await Promise.all(
                            (collectionData.parts || []).filter(m => m.id !== data.id).map(async (part) => {
                                const partRes = await fetch(`${TMDB_BASE_URL}/movie/${part.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
                                return await partRes.json();
                            })
                        );
 
                        const sortedCollection = collectionWithCredits
                            .filter(m => m.release_date)
                            .sort((a, b) => {
                                const yearA = parseInt(a.release_date?.split("-")[0]) || 0;
                                const yearB = parseInt(b.release_date?.split("-")[0]) || 0;
                                if (yearA === yearB) {
                                    return (b.vote_average || 0) - (a.vote_average || 0);
                                }
                                return yearB - yearA;
                            });
 
                        data.similar = { results: sortedCollection };
                        setMovie({ ...data });
                        setToCache(cacheKey, { ...data });
                        return;
                    } catch (e) {
                        console.error("Failed to fetch collection parts:", e);
                    }
                }
                try {
                    const similarRes = await fetch(`${TMDB_BASE_URL}/movie/${id}/similar?api_key=${TMDB_API_KEY}`);
                    const similarData = await similarRes.json();
                    const similarWithCredits = await Promise.all(
                        (similarData.results || []).slice(0, 10).map(async (sim) => {
                            const detailsRes = await fetch(`${TMDB_BASE_URL}/movie/${sim.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
                            const detailsData = await detailsRes.json();
                            return detailsData;
                        })
                    );
                    data.similar = { results: similarWithCredits };
                    setMovie({ ...data });
                    setToCache(cacheKey, { ...data });
                } catch (err) {
                    console.error("Error fetching similar movies with details:", err);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [cacheKey]);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await fetch(
                    `${TMDB_BASE_URL}/movie/${id}/images?api_key=${TMDB_API_KEY}&include_image_language=en,null`
                );
                const data = await response.json();
                const logo = data.logos.find(l => l.file_path.endsWith('.webp')) || data.logos[0];
                if (logo) setLogoUrl(`${IMAGE_BASE_URL}/original${logo.file_path}`);
            } catch (e) {
                console.error("Error fetching logo:", e);
            }
        };

        fetchLogo();
    }, [id]);

    const downloadLink = useMemo(() => {
        const key = Object.keys(movieDownloadLinks).find(k =>
            k.toLowerCase().trim() === movie?.title?.toLowerCase().trim()
        );
        return key ? movieDownloadLinks[key] : null;
    }, [movie]);

    const streamLink = useMemo(() => movie?.title && streamDownloadLinks[movie.title], [movie]);

    const animations = {
        container: {
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
        },
        fadeUp: {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
            exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
        },
        overlay: {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.4 } },
            exit: { opacity: 0, transition: { duration: 0.3 } },
        },
        modal: (x, y) => ({
            hidden: { scale: 0.7, opacity: 0, x, y },
            visible: {
                scale: 1,
                opacity: 1,
                x: 0,
                y: 0,
                transition: { type: "spring", stiffness: 400, damping: 25 },
            },
            exit: {
                scale: 0.7,
                opacity: 0,
                transition: { duration: 0.3, ease: "easeInOut" },
            },
        }),
    };

    if (loading || !movie) {
        return <div className="movie-details-loading"><div className="loader" aria-live="assertive" role="alert" /></div>;
    }

    if (error) {
        return <div className="movie-details-error"><p>Error: {error}</p></div>;
    }

    return (
        <motion.div className="movie-details-container" variants={animations.container} initial="hidden" animate="visible" exit="exit">
            <Helmet>
                <title>{movie.title} - Movie Details</title>
                <meta name="description" content={truncateOverview(movie.overview)} />
            </Helmet>

            <motion.div
                className="movie-details-overlay"
                style={{ backgroundImage: `url(${IMAGE_BASE_URL}/original${movie.backdrop_path})` }}
                decoding="async"
                variants={animations.fadeUp}
            >
                <div className="backdrop-overlay" />
            </motion.div>

            <motion.div className="movie-content" variants={animations.fadeUp}>
                <motion.div className="movie-info" variants={animations.fadeUp}>
                    <motion.h1 variants={animations.fadeUp}>
                        {logoUrl ? <img src={logoUrl} alt="Movie Logo" className="movie-title" /> : movie.title}
                    </motion.h1>

                    <div className="movie-meta">
                        <motion.span variants={animations.fadeUp}><FaStar /> {movie.vote_average.toFixed(1)}</motion.span>
                        <motion.span variants={animations.fadeUp}><FaCalendar /> {movie.release_date?.split("-")[0]}</motion.span>
                        {movie.runtime && <motion.span variants={animations.fadeUp}><FaClock /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</motion.span>}
                        <motion.span variants={animations.fadeUp}><FaLanguage /> {movie.original_language.toUpperCase()}</motion.span>
                    </div>

                    <motion.div className="movie-genres" variants={animations.fadeUp}>
                        {movie.genres.map(genre => (
                            <motion.div
                                key={genre.id}
                                className="genre-tag"
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(`/movies?genre=${genre.id}&page=${currentPage}`)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        navigate(`/movies?genre=${genre.id}&page=${currentPage}`);
                                    }
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {genre.name}
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div className="movie-overview" variants={animations.fadeUp}>
                        <h2>Overview</h2>
                        <p>{truncateOverview(movie.overview)}</p>
{/* 
                        {streamLink && (
                            <motion.a href={streamLink} target="_blank" rel="noopener noreferrer" className="trailer-button" animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.8 }}>
                                ▶ &nbsp;Watch
                            </motion.a>
                        )} */}
                        
                        <div className="download-container">
                            {movie.videos?.results?.length > 0 && (
                                <motion.a onClick={openTrailer} ref={trailerButtonRef} className="trailer-button" animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.8 }}>
                                    <span><IoPlay /></span> &nbsp;Watch Trailer
                                </motion.a>
                            )}

                            {downloadLink && (
                                <motion.a href={downloadLink} target="_blank" rel="noopener noreferrer" className="trailer-button" animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.8 }}>
                                    <span><FiDownload /></span>&nbsp; Download
                                </motion.a>
                            )}
                        </div>
                    </motion.div>

                    {movie.similar?.results?.length > 0 && (
                        <motion.div className="similar-movies" variants={animations.fadeUp}>
                            <h2>Similar Movies</h2>
                            <div className="similar-list">
                                {movie.similar.results
                                    .map(sim => {
                                        const movieCountry = movie.production_countries?.[0]?.iso_3166_1;
                                        const simCountries = sim.production_countries?.map(c => c.iso_3166_1) || [];

                                        // ❌ Skip if movie's country isn't in similar movie's countries
                                        if (movieCountry && !simCountries.includes(movieCountry)) return null;

                                        const sharedGenres = (sim.genre_ids || []).filter(id => (movie.genres || []).map(g => g.id).includes(id)).length;
                                        const yearDiff = Math.abs((parseInt(sim.release_date?.split("-")[0]) || 0) - (parseInt(movie.release_date?.split("-")[0]) || 0));
                                        const yearScore = 1 / (1 + yearDiff);

                                        const mainCast = movie.credits?.cast?.slice(0, 5).map(c => c.id) || [];
                                        const simCast = sim.credits?.cast?.slice(0, 5).map(c => c.id) || [];
                                        const sharedCast = mainCast.filter(id => simCast.includes(id)).length;

                                        const movieDirector = movie.credits?.crew?.find(c => c.job === "Director")?.id;
                                        const simDirector = sim.credits?.crew?.find(c => c.job === "Director")?.id;
                                        const directorScore = movieDirector && simDirector && movieDirector === simDirector ? 1 : 0;

                                        const titleScore = movie.title && sim.title && sim.title.toLowerCase().includes(movie.title.toLowerCase()) ? 1 : 0;
                                        const voteScore = (sim.vote_average || 0) / 10;
                                        const popularityScore = (sim.popularity || 0) / 1000;

                                        const primaryRelevance = titleScore * 5 + sharedCast * 3 + directorScore * 2;
                                        const secondaryRelevance = sharedGenres * 1.5 + yearScore + voteScore + popularityScore;

                                        return {
                                            ...sim,
                                            relevanceScore: primaryRelevance + secondaryRelevance,
                                            primaryRelevance,
                                            secondaryRelevance
                                        };
                                    })
                                    .filter(Boolean) // ✅ remove nulls
                                    .sort((a, b) => {
                                        // Sort first by primary relevance, then secondary
                                        if (b.primaryRelevance === a.primaryRelevance) {
                                            return b.secondaryRelevance - a.secondaryRelevance;
                                        }
                                        return b.primaryRelevance - a.primaryRelevance;
                                    })
                                    .map(sim => (
                                        <motion.a key={sim.id} className="similar-movie" onClick={() => navigate(`/movie/${sim.id}`)} variants={animations.fadeUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                            <motion.img src={sim.poster_path ? `${IMAGE_BASE_URL}/w500${sim.poster_path}` : "/default.png"} alt={sim.title} loading="lazy" decoding="async" variants={animations.fadeUp} />
                                            <span>{sim.title}</span>
                                        </motion.a>
                                    ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {movie.credits?.cast?.length > 0 && (
                    <motion.div className="movie-cast" variants={animations.fadeUp}>
                        <h2>Cast</h2>
                        <div className="cast-list">
                            {movie.credits.cast.map(c => (
                                <motion.a key={c.id} className="cast-member" onClick={() => navigate(`/cast/${c.id}`)} variants={animations.fadeUp}>
                                    <img src={c.profile_path ? `${IMAGE_BASE_URL}/w500${c.profile_path}` : "/default.png"} alt={c.name} loading="lazy" decoding="async" />
                                    <span>{c.name}</span>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            <AnimatePresence>
                {showTrailer && (
                    <motion.div className="trailer-modal-overlay" onClick={closeTrailer} variants={animations.overlay} initial="hidden" animate="visible" exit="exit" role="dialog" aria-modal="true">
                        <motion.div className="trailer-modal" onClick={(e) => e.stopPropagation()} variants={animations.modal(trailerPosition.x - window.innerWidth / 2, trailerPosition.y - window.innerHeight / 2)} initial="hidden" animate="visible" exit="exit" ref={trailerRef}>
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