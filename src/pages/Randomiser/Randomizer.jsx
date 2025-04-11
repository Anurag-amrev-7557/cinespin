import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Randomizer.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AiFillFire } from "react-icons/ai";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { LuSwords } from "react-icons/lu";
import { BsCameraReelsFill } from "react-icons/bs";
import { FaCalendar, FaClock, FaLanguage } from "react-icons/fa";
import { GiDrippingKnife } from "react-icons/gi";
import { FaHatWizard } from "react-icons/fa6";
import { GiSpartanHelmet } from "react-icons/gi";
import { FaHeart } from "react-icons/fa";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { FaMasksTheater } from "react-icons/fa6";
import { getFromCache, setToCache } from "../../utils/cache";
import { PiDetectiveFill } from "react-icons/pi";
import { IoIosHeart } from "react-icons/io";
import { MdVideoCameraBack } from "react-icons/md";
import { RiFilter2Line } from "react-icons/ri";
import { FaGun } from "react-icons/fa6";
import { TbMapRoute } from "react-icons/tb";
import { IoFilterSharp } from "react-icons/io5";
import { GiSentryGun } from "react-icons/gi";
import { FaHandcuffs } from "react-icons/fa6";
import { GiHearts } from "react-icons/gi";
import { MdFamilyRestroom } from "react-icons/md";
import { FaStar } from "react-icons/fa";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const genres = [
    { id: 28, name: "Action", icon: <LuSwords /> },
    { id: 35, name: "Comedy", icon: <FaMasksTheater /> },
    { id: 18, name: "Drama", icon: <GiHearts /> },
    { id: 27, name: "Horror", icon: <RiGhostFill /> },
    { id: 14, name: "Fantasy", icon: <FaHatWizard /> },
    { id: 878, name: "SciFi", icon: <RiSpaceShipFill /> },
    { id: 10751, name: "Family", icon: <MdFamilyRestroom /> },
    { id: 10770, name: "Series", icon: <AiFillFire /> },
    { id: 16, name: "Animation", icon: <RiBearSmileFill /> },
    { id: 53, name: "Thriller", icon: <GiDrippingKnife /> },
    { id: 80, name: "Crime", icon: <FaHandcuffs /> },
    { id: 9648, name: "Mystery", icon: <PiDetectiveFill /> },
    { id: 12, name: "Adventure", icon: <TbMapRoute /> },
    { id: 10749, name: "Romance", icon: <FaHeart /> },
    { id: 99, name: "Documentary", icon: <MdVideoCameraBack /> },
    { id: 36, name: "History", icon: <GiSpartanHelmet /> },
    { id: 10752, name: "War", icon: <GiSentryGun /> },
    { id: 37, name: "Western", icon: <FaGun /> },
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

  useEffect(() => {
    const saved = localStorage.getItem("randomizerState");
    if (saved) {
      const { genre, page } = JSON.parse(saved);
      if (genre) setSelectedGenre(Number(genre));
      if (page) setCurrentPage(Number(page));
    }
  }, []);

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
    setCurrentPage(1); // Reset to page 1 when genre changes
  }, [selectedGenre]);

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
      setError(null);
      setContent(null); // Clear old content when randomizing
    
      const maxRetries = 3;

      const regionMap = {
        Global: "",
        India: "&region=IN",
      };
      

      const backoffWithJitter = (attempt) =>
        Math.pow(2, attempt) * 500 + Math.random() * 300;
    
      const fetchWithRetries = async (retryAttempt = 0, region = selectedRegion) => {
        const cacheKey = `random-${selectedGenre}-page-${currentPage}-${region}`;
        const regionParam = region?.toLowerCase() === "india" ? "&region=IN" : "";

        try {
          const cachedContent = getFromCache(cacheKey);
          if (cachedContent) {
            setContent(cachedContent);
            setCurrentPage(prev => prev + 1);
            return;
          }
    
          const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenre}&sort_by=popularity.desc&page=${currentPage}${regionParam}`;
          const { data } = await axios.get(url);
    

          if (!data?.results?.length) {
            // Retry from page 1 if current page failed
            if (currentPage > 1 && retryAttempt === 0) {
              setCurrentPage(1);
              return fetchWithRetries(retryAttempt + 1, region);
            }
            throw new Error("No results found");
          }

          const qualityFiltered = data.results.filter(movie => {
            const isSafe = movie?.adult === false;
            const hasPoster = !!movie?.poster_path;
            const hasBasicRating = movie?.vote_average >= 3.5; // ↓ from 4
            const hasSomeVotes = movie?.vote_count >= 3;       // ↓ from 5
            return isSafe && hasPoster && hasBasicRating && hasSomeVotes;
          });

          let filtered = qualityFiltered.length ? qualityFiltered : data.results;

          if (!filtered.length) {
            // If even fallback filtering fails, use all results that have a poster and are not adult
            filtered = data.results.filter(movie => movie?.poster_path && movie?.adult === false);
          
            // If still empty, just use ALL results as last resort (no filters at all)
            if (!filtered.length) {
              filtered = data.results;
            }
          }
    
          const C = 6.5; // average vote across all movies
          const m = 300; // minimum votes required to be considered

          const bayesianScore = (R, v, m, C, popularity, releaseDate) => {
            const releaseYear = new Date(releaseDate).getFullYear() || new Date().getFullYear();
            const ageFactor = 1 / (1 + Math.abs(new Date().getFullYear() - releaseYear));
            const popularityFactor = Math.log10(popularity + 1);
            return ((v / (v + m)) * R + (m / (v + m)) * C) * ageFactor * popularityFactor;
          };
          
          const weightedResults = filtered.map(movie => {
            const R = movie.vote_average || 0;
            const v = movie.vote_count || 0;
            const weight = bayesianScore(R, v, m, C, movie.popularity || 1, movie.release_date);
            return { movie, weight };
          });
          
          const totalWeight = weightedResults.reduce((sum, entry) => sum + entry.weight, 0);
          const rand = Math.random() * totalWeight;
          
          let runningSum = 0;
          let selectedMovie = weightedResults[0].movie;
          
          for (const entry of weightedResults) {
            runningSum += entry.weight;
            if (rand <= runningSum) {
              selectedMovie = entry.movie;
              break;
            }
          }

          // Fetch detailed content
          const [detailsRes, creditsRes, videosRes, similarRes] = await Promise.all([
            axios.get(`${TMDB_BASE_URL}/movie/${selectedMovie.id}?api_key=${TMDB_API_KEY}`),
            axios.get(`${TMDB_BASE_URL}/movie/${selectedMovie.id}/credits?api_key=${TMDB_API_KEY}`),
            axios.get(`${TMDB_BASE_URL}/movie/${selectedMovie.id}/videos?api_key=${TMDB_API_KEY}`),
            axios.get(`${TMDB_BASE_URL}/movie/${selectedMovie.id}/similar?api_key=${TMDB_API_KEY}`),
          ]);
          
          const contentData = {
            ...detailsRes.data,
            credits: creditsRes.data,
            videos: videosRes.data,
            similar: similarRes.data,
          };
    
          setContent(contentData);
          setToCache(cacheKey, contentData);
          setCurrentPage(prev => prev + 1);
        } catch (err) {
          console.error(`Attempt ${retryAttempt + 1}:`, err.message);
    
          if (retryAttempt < maxRetries - 1) {
            const backoffDelay = backoffWithJitter(retryAttempt);
            setTimeout(() => fetchWithRetries(retryAttempt + 1, region), backoffDelay);
          } else if (region !== "Global") {
            console.warn("Region failed. Switching to Global...");
            return fetchWithRetries(0, "Global"); // fallback to global
          } else {
            try {
              // Final attempt with minimal filtering
              const fallbackUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenre}&sort_by=popularity.desc&page=${currentPage}${regionParam}`;
              const { data } = await axios.get(fallbackUrl);
          
              let safeContent = data.results.find(movie => movie?.poster_path);
              if (!safeContent && data.results.length) {
                safeContent = data.results[0];
              }
          
              if (safeContent) {
                const [detailsRes, creditsRes, videosRes, similarRes] = await Promise.all([
                  axios.get(`${TMDB_BASE_URL}/movie/${safeContent.id}?api_key=${TMDB_API_KEY}`),
                  axios.get(`${TMDB_BASE_URL}/movie/${safeContent.id}/credits?api_key=${TMDB_API_KEY}`),
                  axios.get(`${TMDB_BASE_URL}/movie/${safeContent.id}/videos?api_key=${TMDB_API_KEY}`),
                  axios.get(`${TMDB_BASE_URL}/movie/${safeContent.id}/similar?api_key=${TMDB_API_KEY}`),
                ]);
          
                const fallbackData = {
                  ...detailsRes.data,
                  credits: creditsRes.data,
                  videos: videosRes.data,
                  similar: similarRes.data,
                };
          
                setContent(fallbackData);
                setToCache(cacheKey, fallbackData);
                setError("Used unfiltered fallback due to repeated failures.");
              } else {
                setError("Completely failed to fetch any content.");
              }
            } catch (finalError) {
              console.error("Final fallback failed:", finalError);
              setError("Completely failed to fetch any content.");
            }
          }
        } finally {
          setLoading(false);
        }
      };
    
      await fetchWithRetries();
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

    const formatRuntime = (minutes) => {
      if (!minutes || isNaN(minutes)) return "";
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hrs}h ${mins}m`;
  };

  return (
    <>
    <Helmet>
      <title>{content ? `${content.title} - Random Pick | Cinespin` : 'Random Movie Picker - Cinespin'}</title>
      <meta
        name="description"
        content={
          content
            ? `Discover "${content.title}" (${content.release_date?.split('-')[0]}) - a ${content.genres?.map(g => g.name).join(', ')} movie. Picked just for you!`
            : "Feeling indecisive? Let Cinespin's Randomizer pick a great movie for you by genre and region!"
        }
      />
    </Helmet>
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

      {loading && (
        <div className="movie-details-loading">
          <div aria-live="assertive" role="alert" className="loader"></div>
        </div>
      )}

      {/* {error && !loading && (
        <div role="alertdialog" className="error-modal">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Close</button>
        </div>
      )} */}

      {content && !loading && (
        <motion.div className="content-display" {...bounceAnimation}>
          <div className="movie-content">
          <Link to={`/movie/${content.id}`} className="random-image">
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
                <span><FaClock /> {formatRuntime(content.runtime)}</span>
                <span><FaLanguage /> {content.original_language.toUpperCase()}</span>
              </motion.div>

              <motion.div className="movie-genres" {...bounceAnimation}>
                {content.genres.map(genre => (
                  <a key={genre.id} className="genre-tag"
                    href={`/movies?genre=${genre.id}&page=1`}>
                    {genre.name}
                  </a>
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
                        
                        const mainCast = (content.credits?.cast || []).slice(0, 5).map(c => c.id);
                        const simCast = (similar.credits?.cast || []).slice(0, 5).map(c => c.id);
                        const sharedCast = mainCast.filter(id => simCast.includes(id)).length;
                        
                        const mainDir = content.credits?.crew?.find(c => c.job === "Director")?.id;
                        const simDir = similar.credits?.crew?.find(c => c.job === "Director")?.id;
                        const sameDirector = mainDir && simDir && mainDir === simDir ? 1 : 0;
                        
                        const voteScore = (similar.vote_average || 0) / 10;
                        const popularityScore = Math.log10(similar.popularity || 1);
                        
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
    </>
  );
};

export default Randomizer;