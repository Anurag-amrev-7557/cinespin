import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import "./LandingPage.css";
import { AiFillFire } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { LuSwords } from "react-icons/lu";
import { FaHeart } from "react-icons/fa";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { SlMagicWand } from "react-icons/sl";
import { FaMasksTheater, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { MdFamilyRestroom } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { getFromCache, setToCache } from "../../utils/cache";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import _ from "lodash"; // Import lodash for shuffling
import { Pagination, Navigation, Autoplay } from "swiper/modules"; 
import { useNavigate, useLocation } from "react-router-dom";

const SkeletonCard = React.memo(() => (
    <div className="skeleton-card">
        <div className="skeleton-img"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-details"></div>
    </div>
));

const SkeletonBigCard = React.memo(() => (
    <div className="skeleton-big-card">
        <div className="skeleton-big-img"></div>
        <div className="skeleton-big-title"></div>
    </div>
));

const SkeletonGenreCard = React.memo(() => (
    <div className="skeleton-genre-card">
        <div className="skeleton-genre-icon"></div>
        <div className="skeleton-genre-title"></div>
    </div>
));

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY; // Replace with actual key

const genres = [
    { id: 28, name: "Action", icon: <LuSwords /> },
    { id: 35, name: "Comedy", icon: <FaMasksTheater /> },
    { id: 18, name: "Drama", icon: <FaHeart /> },
    { id: 27, name: "Horror", icon: <RiGhostFill /> },
    { id: 14, name: "Fantasy", icon: <SlMagicWand /> },
    { id: 878, name: "SciFi", icon: <RiSpaceShipFill /> },
    { id: 10751, name: "Family", icon: <MdFamilyRestroom /> },
    { id: 10770, name: "Series", icon: <AiFillFire /> },
    { id: 16, name: "Animation", icon: <RiBearSmileFill /> },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [moviesByGenre, setMoviesByGenre] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoadingGenres, setIsLoadingGenres] = useState(true); // New state
    const [currentPage, setCurrentPage] = useState({}); // Track the current page for each genre
    const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem('region') || "Global"); // Read region from localStorage
    const [popularMovies, setPopularMovies] = useState([]);
    const [selectedGenreId, setSelectedGenreId] = useState(localStorage.getItem("selectedGenre") || genres[0].id); // Default to first genre
    const swipersRef = useRef({});
    const observerRef = useRef(null);

    const handleSwiperNext = (genreId) => {
        if (swipersRef.current[genreId]) {
            swipersRef.current[genreId].slideNext();
            updateButtonVisibility(genreId);
        }
    };
    
    const handleSwiperPrev = (genreId) => {
        if (swipersRef.current[genreId]) {
            swipersRef.current[genreId].slidePrev();
            updateButtonVisibility(genreId);
        }
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
    
    const updateButtonVisibility = (genreId) => {
        setTimeout(() => { // Ensure DOM updates before checking
            const swiper = swipersRef.current[genreId];
            if (swiper) {
                const prevButton = document.getElementById(`swiper-prev-${genreId}`);
                const nextButton = document.getElementById(`swiper-next-${genreId}`);
    
                if (prevButton) prevButton.style.color = swiper.isBeginning ? "rgba(255,255,255,0.2)" : "rgba(255,255,255)";
                if (nextButton) nextButton.style.display = swiper.isEnd ? "rgba(255,255,255,0.2)" : "rgba(255,255,255)";
            }
        }, 100); // Small delay to allow Swiper to initialize
    };

    const fallbackImage = "/default.png"; // Update this with your actual path

    const getRegionParam = () => {
        if (selectedRegion === "India") {
            return "&region=IN&with_original_language=hi";
        }
        return ""; 
    };

    const fetchMovies = useCallback(async (genreId, page) => {
        const regionParam = getRegionParam();
        const cacheKey = `genre-${genreId}-page-${page}-${selectedRegion}`;
        const cached = getFromCache(cacheKey);
    
        if (cached && Array.isArray(cached.results)) {
            setMoviesByGenre(prev => ({ ...prev, [genreId]: cached.results }));
            return;
        }
    
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar&with_genres=${genreId}&page=${page}${regionParam}`
            );
            const data = await response.json();
            const movies = await Promise.all((data.results || []).map(async (movie) => {
                const details = await fetchMovieDetails(movie.id);
                return {
                    ...movie,
                    runtime: details?.runtime || null,
                };
            }));
            
            setMoviesByGenre(prevMovies => ({
                ...prevMovies,
                [genreId]: page === 1
                    ? movies
                    : [...(prevMovies[genreId] || []), ...movies]
            }));
            
            setToCache(cacheKey, { results: movies });
        } catch (error) {
            console.error("Error fetching movies:", error);
        }
    }, [selectedRegion]);

    const fetchMovieDetails = async (movieId) => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
            );
            if (!response.ok) throw new Error("Failed to fetch movie details");
            return await response.json();
        } catch (error) {
            console.error("Error fetching movie details:", error);
            return null;
        }
    };

    const fetchPopularMovie = async () => {
        try {
            const regionParam = getRegionParam();
            const response = await fetch(
                `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}${regionParam}`
            );
            if (!response.ok) throw new Error("Failed to fetch popular movies");
            const data = await response.json();

            // Fetch runtimes in parallel
            const moviesWithRuntime = await Promise.all(
                data.results.map(async (movie) => {
                    const details = await fetchMovieDetails(movie.id);
                    return {
                        ...movie,
                        runtime: details?.runtime || null,
                    };
                })
            );
            setPopularMovies(moviesWithRuntime);
        } catch (error) {
            console.error("Error fetching popular movies:", error.message);
        }
    };

    useEffect(() => {
        localStorage.setItem('region', selectedRegion); // Save region selection to localStorage
    }, [selectedRegion]);

    useEffect(() => {
        fetchPopularMovie(); // Fetch region-based popular movies when region changes
    }, [selectedRegion]);

    const handleGenreClick = (genreId) => {
        localStorage.setItem("selectedGenre", genreId);
        navigate(`/movies?genre=${genreId}&page=1`, { state: { genreId } });
    };

    useEffect(() => {
        setMoviesByGenre({});
        setCurrentPage({});
        genres.forEach(genre => {
            fetchMovies(genre.id, 1);
        });
        setIsLoadingGenres(false); 
        fetchPopularMovie();
    }, [selectedRegion]);

    const loadNextPage = (genreId) => {
        const nextPage = (currentPage[genreId] || 1) + 1;
        setCurrentPage(prev => ({ ...prev, [genreId]: nextPage }));
        fetchMovies(genreId, nextPage); // Fetch the next page of movies
    };

    const handleReachEnd = (genreId) => {
        loadNextPage(genreId); // Automatically load the next page when reaching the end
    };

    useEffect(() => {
        if (!moviesByGenre || Object.keys(moviesByGenre).length === 0) return;
    
        // Ensure observer is defined only once
        if (observerRef.current) observerRef.current.disconnect();
    
        observerRef.current = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target); // Stop observing after it's visible
                    }
                });
            },
            { threshold: 0.2 } // Trigger when 20% of the element is visible
        );
    
        // Wait for elements to render before observing
        setTimeout(() => {
            document.querySelectorAll(".item-container").forEach((card) => {
                observerRef.current.observe(card);
            });
        }, 500); // Small delay to ensure elements exist
    
        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [moviesByGenre]); // Run effect only when movies update

    useEffect(() => {
        // Add a class or force a re-render on back navigation
        const genreContainer = document.querySelector(".genre-container");
        if (genreContainer) {
            genreContainer.classList.remove("reset-animation");
            void genreContainer.offsetWidth; // force reflow
            genreContainer.classList.add("reset-animation");
        }
    }, [location]);

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
        return ` 〡 ${hrs}h ${mins}m`;
    };

    return (
        <div className="landing-container">
                <motion.div className="landing-item-container" {...bounceAnimation}>
                    {popularMovies.length === 0 ? (
                        <div className="skeleton-big-card-container">
                            <SkeletonBigCard {...bounceAnimation}/>
                            <SkeletonBigCard {...bounceAnimation}/>
                            <SkeletonBigCard {...bounceAnimation}/>
                        </div>
                    ) : (
                        <Swiper
                            slidesPerView={3}
                            spaceBetween={20}
                            loop={popularMovies.length > 3}
                            navigation={false}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            lazyPreloadPrevNext={true}
                            modules={[Navigation, Autoplay]}
                            className="popular-movies-swiper"
                        >
                            <AnimatePresence>
                                {popularMovies.map((movie, index) =>
                                    movie ? (
                                    <SwiperSlide key={index}>
                                        <motion.a
                                        onClick={() => navigate(`/movie/${movie.id}`)}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                        >
                                        <motion.div className="landing-item-poster" whileHover={{scale: 1.02, y: -3}} {...bounceAnimation}>
                                            <picture>
                                                <source
                                                    srcSet={`https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}.webp`}
                                                    type="image/webp"
                                                />
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}`}
                                                    alt={movie.title || movie.name}
                                                    decoding="async"
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        borderRadius: "inherit"
                                                    }}
                                                />
                                            </picture>
                                            <div className="movie-title-overlay">
                                                {(() => {
                                                    const words = (movie.title || movie.name)?.split(" ");
                                                    return words.length > 4
                                                        ? `${words.slice(0, 4).join(" ")}...`
                                                        : words.join(" ");
                                                })()}
                                                <div className="movie-extra-details">
                                                    ⭐ {movie.vote_average.toFixed(1)} 〡 {movie.release_date?.split("-")[0]}{formatRuntime(movie.runtime)}
                                                </div>
                                            </div>
                                        </motion.div>
                                        </motion.a>
                                    </SwiperSlide>
                                    ) : null
                                )}
                            </AnimatePresence>
                        </Swiper>
                    )}
                </motion.div>
            
            <div className="genre-container"
                key={location.key}>
                {!genres.length || isLoadingGenres ? (
                    Array.from({ length: genres.length || 9 }, (_, index) => (
                        <div key={index} className="genre-slide">
                            <SkeletonGenreCard />
                        </div>
                    ))
                ) : (
                    genres.map((genre) => (
                            <div key={genre.id}
                                className={`genre ${selectedGenreId === genre.id ? "active" : ""}`}
                                onClick={() => handleGenreClick(genre.id)}
                            >
                                <div className="genre-icon">{genre.icon}</div>
                                {genre.name}
                            </div>
                    ))
                )}
            </div>

            {genres.map((genre) => (
                <div key={genre.id} className="item-container">
                    <motion.div className="item-container-heading" {...bounceAnimation}>
                        Trending in {genre.name}
                        <div className="swiper-navigation-container">
                            <div className="swiper-navigation" id={`swiper-prev-${genre.id}`} onClick={() => handleSwiperPrev(genre.id)}>
                                <FaChevronLeft />
                            </div>
                            <div className="swiper-navigation" id={`swiper-next-${genre.id}`} onClick={() => handleSwiperNext(genre.id)}>
                                <FaChevronRight />
                            </div>
                        </div>
                    </motion.div>
                    <Swiper
                        slidesPerView={7}
                        spaceBetween={10}
                        loop={false}
                        pagination={false}
                        navigation={{
                            nextEl: `#swiper-next-${genre.id}`,
                            prevEl: `#swiper-prev-${genre.id}`,
                        }}
                        autoplay={false}
                        lazyPreloadPrevNext={true} // Optimize Swiper for better performance
                        speed={600}
                        modules={[Pagination, Navigation, Autoplay]}
                        onSwiper={(swiper) => {
                            swipersRef.current[genre.id] = swiper;
                            updateButtonVisibility(genre.id); // Ensure button visibility updates on load
                        }}
                        onSlideChange={() => updateButtonVisibility(genre.id)} // Update visibility when slides change
                        onReachEnd={() => handleReachEnd(genre.id)} // Automatically load next page when reaching the end
                    >
                        {Array.isArray(moviesByGenre[genre.id])
                            ? moviesByGenre[genre.id].map((movie, index) => {
                                const uniqueKey = `${genre.id}-${movie.id || movie.title || "untitled"}-${index}`;

                                return (
                                    <SwiperSlide key={uniqueKey}>
                                    <motion.a
                                        className="movie-card"
                                        onClick={() => navigate(`/movie/${movie.id}`)}
                                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                                        whileHover={{ scale: 1, y: -5 }}
                                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                        {...bounceAnimation}
                                    >
                                        <motion.div className="movie-card-image" {...bounceAnimation}>
                                        {movie.poster_path ? (
                                            <picture>
                                            <source
                                                srcSet={`https://image.tmdb.org/t/p/w500${movie.poster_path}.webp`}
                                                type="image/webp"
                                            />
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                className="movie-card-img"
                                                alt={movie.title}
                                                onError={(e) => {
                                                e.target.src = fallbackImage;
                                                }}
                                                width="250"
                                                height="375"
                                                style={{ objectFit: "cover" }}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            </picture>
                                        ) : (
                                            <img
                                            src={fallbackImage}
                                            className="movie-card-img"
                                            alt="Default movie poster"
                                            width="250"
                                            height="375"
                                            style={{ objectFit: "cover" }}
                                            />
                                        )}
                                        </motion.div>
                                        <span className="movie-title">                                                
                                            {(() => {
                                                    const words = (movie.title || movie.name)?.split(" ");
                                                    return words.length > 4
                                                        ? `${words.slice(0, 3).join(" ")}...`
                                                        : words.join(" ");
                                            })()}</span>
                                        <motion.div className="movie-details" {...bounceAnimation}>
                                        <span>
                                            <FaStar className="movie-star" /> {movie.vote_average.toFixed(1)}
                                        </span>
                                        <span className="gap">&nbsp;〡&nbsp;</span>
                                        <span>{movie.release_date?.split("-")[0]}</span>
                                        <span className="movie-runtime">{formatRuntime(movie.runtime)}</span>
                                        </motion.div>
                                    </motion.a>
                                    </SwiperSlide>
                                );
                                })
                            : [...Array(7)].map((_, index) => (
                                <SwiperSlide key={index}>
                                    <SkeletonCard />
                                </SwiperSlide>
                                ))}
                    </Swiper>
                </div>
            ))}
        </div>
    );
};

export default LandingPage;