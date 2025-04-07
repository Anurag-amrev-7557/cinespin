import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Randomizer.css";
import { LuSwords } from "react-icons/lu";
import { FaHeart } from "react-icons/fa";
import { FaTheaterMasks } from "react-icons/fa";
import { RiGhostFill, RiSpaceShipFill, RiBearSmileFill } from "react-icons/ri";
import { AiFillFire } from "react-icons/ai";
import { FaStar, FaCalendar, FaClock, FaLanguage } from "react-icons/fa";
import { getFromCache, setToCache } from "../../utils/cache"; // adjust path if needed
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MdFamilyRestroom } from "react-icons/md";
import { SlMagicWand } from "react-icons/sl";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const genres = [
  { id: 28, name: "Action", icon: <LuSwords /> },
  { id: 35, name: "Comedy", icon: <FaTheaterMasks /> },
  { id: 18, name: "Drama", icon: <FaHeart /> },
  { id: 27, name: "Horror", icon: <RiGhostFill /> },
  { id: 14, name: "Fantasy", icon: <SlMagicWand /> },
  { id: 878, name: "Sci‒Fi", icon: <RiSpaceShipFill /> },
  { id: 10751, name: "Family", icon: <MdFamilyRestroom /> },
  { id: 10770, name: "Series", icon: <AiFillFire /> },
  { id: 16, name: "Animation", icon: <RiBearSmileFill /> },
];

const truncateOverview = (text) => {
    if (!text) return '';
    return text.length > 200 ? text.substring(0, 150) + '...' : text;
};

const Randomizer = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const trailerRef = useRef();
  const trailerButtonRef = useRef(null);
  const [trailerPosition, setTrailerPosition] = useState({ x: 0, y: 0 });
  const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem('region') || "Global"); // Read region from localStorage
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // Retry logic
  const [currentPage, setCurrentPage] = useState(1); // New state variable for pagination

  const openTrailer = () => {
    if (trailerButtonRef.current) {
      const rect = trailerButtonRef.current.getBoundingClientRect();
      setTrailerPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    setShowTrailer(true);
  };
  
  const closeTrailer = () => {
    setShowTrailer(false);
  };

    useEffect(() => {
        const handleRegionUpdate = () => {
            setSelectedRegion(localStorage.getItem("region") || "Global");
        };

        window.addEventListener("regionChange", handleRegionUpdate);

        return () => {
            window.removeEventListener("regionChange", handleRegionUpdate);
        };
    }, []);

    const handleRandomize = async () => {
        if (!selectedGenre) return;
      
        setLoading(true);
        setError(null); // Reset any previous errors
        try {
          const cacheKey = `random-${selectedGenre}-page-${currentPage}-${selectedRegion}`;
          const cachedContent = getFromCache(cacheKey);

          if (cachedContent) {
            setContent(cachedContent);
            setCurrentPage(prev => prev + 1);
            return;
          }

          const regionParam = selectedRegion === "India" ? "&region=IN&with_original_language=hi" : "";
          let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenre}&page=${currentPage}&${regionParam}`;
      
          const response = await axios.get(url);
      
          // Check if results are found
          if (response.data.results.length === 0) {
            setError("No movies found for this genre. Please try another genre.");
            return;
          }
      
          // If there are movies, select a random one
          const randomContent =
            response.data.results[Math.floor(Math.random() * response.data.results.length)];
      
          // Fetch additional details (e.g., trailer, similar content)
          const detailsResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${randomContent.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`
          );
      
          setContent(detailsResponse.data);
          setToCache(cacheKey, detailsResponse.data); // ✅ Cache it
          // Increment to the next page automatically after loading content
          setCurrentPage(prevPage => prevPage + 1);  // Increment the page number for the next request
        } catch (err) {
          console.error("Error fetching content:", err);
          setRetryCount(prevCount => prevCount + 1); // Increment retry count
          if (retryCount < 3) {
            handleRandomize(); // Retry fetching the data
          } else {
            setError("An error occurred while fetching content. Please try again later.");
          }
        } finally {
          setLoading(false);
        }
      };

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

  return (
    <motion.div className="randomizer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} {...bounceAnimation}>
      <motion.div className="genres" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="genre-title-container">
          <div className="genre-title">
            Genres
            <p>﹙Choose one genre﹚</p>
          </div>
        </div>
        <motion.div className="genre-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} {...bounceAnimation}>
          {genres.map((genre) => (
            <div key={genre.id} className={`genre-slide ${selectedGenre === genre.id ? 'selected' : ''}`}>
              <input
                type="radio"
                id={`genre-${genre.id}`}
                checked={selectedGenre === genre.id}
                onChange={() => setSelectedGenre(genre.id)}
              />
              <label htmlFor={`genre-${genre.id}`} aria-label={`Select ${genre.name} genre`}>
                <div className="genre">
                  <div className="genre-icon">{genre.icon}</div>
                  {genre.name}
                </div>
              </label>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.button className="randomizer-button" onClick={handleRandomize} disabled={!selectedGenre} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
        Random Content
      </motion.button>

      {loading && <div className="movie-details-loading">Loading... Please wait a moment...</div>}

      {error && !loading && <div className="error-message">{error}</div>}

      {content && !loading && (
        <motion.div className="content-display" {...bounceAnimation}>
          <div className="movie-content">
          <Link to={`/movie/${content.id}`}>
            <picture>
            <motion.img
              src={content.poster_path
                  ? `${IMAGE_BASE_URL}/original${content.poster_path}`
                  : "/default.png"
              }
              alt={content.title}
              className="movie-poster"
              loading="lazy"
              decoding="async"
              {...bounceAnimation}
            />
            </picture>
            </Link>
            <motion.div className="movie-info" {...bounceAnimation}>
              <h1>{content.title}</h1>
              <motion.div className="movie-meta" {...bounceAnimation}>
                <span><FaStar /> {content.vote_average.toFixed(1)}</span>
                <span><FaCalendar /> {content.release_date?.split("-")[0]}</span>
                <span><FaClock /> {content.runtime} min</span>
                <span><FaLanguage /> {content.original_language.toUpperCase()}</span>
              </motion.div>

              <motion.div className="movie-genres" {...bounceAnimation}>
                {content.genres.map(genre => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </motion.div>

              <motion.div className="movie-overview" {...bounceAnimation}>
                <h2>Overview</h2>
                <p>{truncateOverview(content.overview)}</p>
                {content.videos?.results?.length > 0 && (
                  <button
                    onClick={openTrailer}
                    ref={trailerButtonRef}
                    className="trailer-button"
                  >
                    ▶ &nbsp;Watch Trailer
                  </button>
                )}
              </motion.div>

              {content.similar?.results && content.similar.results.length > 0 && (
                <motion.div className="similar-movies" {...bounceAnimation}>
                  <h2>Similar Movies</h2>
                  <motion.div className="similar-list" {...bounceAnimation}>
                    {content.similar.results
                      .map(similar => {
                        const sharedGenres = similar.genre_ids.filter(id =>
                          content.genres.map(g => g.id).includes(id)
                        ).length;

                        const releaseYear = parseInt(similar.release_date?.split("-")[0]) || 0;
                        const currentYear = parseInt(content.release_date?.split("-")[0]) || 0;
                        const yearProximity = 1 / (1 + Math.abs(currentYear - releaseYear));

                        const mainCastIds = content.credits?.cast?.slice(0, 5).map(c => c.id) || [];
                        const similarCastIds = similar.credits?.cast?.slice(0, 5).map(c => c.id) || [];
                        const sharedCast = mainCastIds.filter(id => similarCastIds.includes(id)).length;

                        const movieDirector = content.credits?.crew?.find(c => c.job === "Director")?.id;
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
                      .slice(0, 9)
                      .map(similar => (
                        <a key={similar.id} className="similar-movie" href={`/movie/${similar.id}`}>
                          <picture>
                          <img 
                            src={similar.poster_path 
                                ? `${IMAGE_BASE_URL}/w500${similar.poster_path}` 
                                : "/default.png"
                            }
                            alt={similar.title}
                            loading="lazy"
                            decoding="async"
                          />
                          </picture>
                          <span>{similar.title}</span>
                        </a>
                      ))}
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
          <AnimatePresence>
            {showTrailer && content?.videos?.results?.length > 0 && (
              <AnimatePresence>
                <motion.div
                  className="trailer-modal-overlay"
                  onClick={closeTrailer}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  role="dialog"
                  aria-modal="true"
                >
                  <motion.div
                    className="trailer-modal"
                    onClick={(e) => e.stopPropagation()}
                    initial={{
                      scale: 0.5,
                      opacity: 0,
                      x: trailerPosition.x - window.innerWidth,
                      y: trailerPosition.y - window.innerHeight,
                    }}
                    animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    ref={trailerRef}
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${content.videos.results[0].key}?autoplay=1&rel=0`}
                      title={`${content.title} Trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Randomizer;