import React, { useState, useEffect, useCallback, useRef } from "react";
import "./LandingPage.css";
import { AiFillFire } from "react-icons/ai";
import { LuSwords } from "react-icons/lu";
import { FaHeart } from "react-icons/fa";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { SlMagicWand } from "react-icons/sl";
import { FaMasksTheater, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { MdFamilyRestroom } from "react-icons/md";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import _ from "lodash"; // Import lodash for shuffling
import { Pagination, Navigation, Autoplay } from "swiper/modules"; 
import { useNavigate, useLocation } from "react-router-dom";

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-img"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-details"></div>
    </div>
);

const SkeletonBigCard = () => (
    <div className="skeleton-big-card">
        <div className="skeleton-big-img"></div>
        <div className="skeleton-big-title"></div>
    </div>
);

const SkeletonGenreCard = () => (
    <div className="skeleton-genre-card">
        <div className="skeleton-genre-icon"></div>
        <div className="skeleton-genre-title"></div>
    </div>
);

const TMDB_API_KEY = "92b98feaab02d1088661e456c19edb89"; // Replace with actual key

const genres = [
    { id: 28, name: "Action", icon: <LuSwords /> },
    { id: 35, name: "Comedy", icon: <FaMasksTheater /> },
    { id: 18, name: "Drama", icon: <FaHeart /> },
    { id: 27, name: "Horror", icon: <RiGhostFill /> },
    { id: 14, name: "Fantasy", icon: <SlMagicWand /> },
    { id: 878, name: "Sci‒Fi", icon: <RiSpaceShipFill /> },
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

    const fetchMovies = useCallback(async (genreId, page) => {
        try {
            const regionParam = selectedRegion === "India" ? "&region=IN&with_original_language=hi" : "";
            const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}${regionParam}`);

            const data = await response.json();

            setMoviesByGenre(prevMovies => ({
                ...prevMovies,
                [genreId]: page === 1 
                    ? data.results  // Replace with new movies on page 1
                    : [...(prevMovies[genreId] || []), ...data.results] // Append new movies on subsequent pages
            }));
        } catch (error) {
            console.error("Error fetching movies:", error);
        }
    }, [selectedRegion]);

    const fetchPopularMovie = async () => {
        try {
            const regionParam = selectedRegion === "India" ? "&region=IN&with_original_language=hi" : "";
            const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&${regionParam}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch popular movies");
            }
    
            const data = await response.json();
            setPopularMovies(data.results);
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
        setCurrentPage(prev => ({ ...prev, [genreId]: 1 })); // Reset page count for new genre
        setIsLoadingGenres(true);
        fetchMovies(genreId, 1); // Fetch the first page of movies for the genre
    };

    useEffect(() => {
        // Preload the movies for all genres when the component mounts
        genres.forEach(genre => {
            fetchMovies(genre.id, 1); // Fetch the first page of each genre
        });
        setIsLoadingGenres(false); // Set genres to loaded after initial fetch
        fetchPopularMovie(); // Fetch popular movie when component mounts
    }, [fetchMovies]);

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

    return (
        <div className="landing-container">
            <div className="landing-item-container">
                {popularMovies.length === 0 ? (
                    <div className="skeleton-big-card-container">
                        <SkeletonBigCard />
                        <SkeletonBigCard />
                        <SkeletonBigCard />
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
                        {popularMovies.map((movie, index) =>
                            movie ? (
                                <SwiperSlide key={index}>
                                    <div 
                                        className="landing-item-poster"
                                        style={{ 
                                            backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path ? movie.backdrop_path : movie.poster_path})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center"
                                        }}
                                    >
                                        <div className="movie-title-overlay">
                                            {(() => {
                                                const words = (movie.title || movie.name)?.split(" ");
                                                return words.length > 4 
                                                    ? `${words.slice(0, 4).join(" ")}...`
                                                    : words.join(" ");
                                            })()}
                                            <div className="movie-extra-details">
                                                ⭐ {movie.vote_average.toFixed(1)} 〡 {movie.release_date?.split("-")[0]}
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ) : null
                        )}
                    </Swiper>
                )}
            </div>
            
            <div className="genre-container">
                {!genres.length || isLoadingGenres ? (
                    Array.from({ length: genres.length || 9 }, (_, index) => (
                        <div key={index} className="genre-slide">
                            <SkeletonGenreCard />
                        </div>
                    ))
                ) : (
                    genres.map((genre) => (
                        <div key={genre.id} className="genre-slide">
                            <div 
                                className="genre" // Add 'active' class conditionally
                                onClick={() => handleGenreClick(genre.id, genre.name)}
                            >
                                <div className="genre-icon">{genre.icon}</div>
                                {genre.name}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {genres.map((genre) => (
                <div key={genre.id} className="item-container">
                    <div className="item-container-heading">
                        Trending in {genre.name}
                        <div className="swiper-navigation-container">
                            <div className="swiper-navigation" id={`swiper-prev-${genre.id}`} onClick={() => handleSwiperPrev(genre.id)}>
                                <FaChevronLeft />
                            </div>
                            <div className="swiper-navigation" id={`swiper-next-${genre.id}`} onClick={() => handleSwiperNext(genre.id)}>
                                <FaChevronRight />
                            </div>
                        </div>
                    </div>
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
                        {moviesByGenre[genre.id] ? (
                            moviesByGenre[genre.id]
                                .map((movie, index) => (
                                <SwiperSlide key={`${genre.id}-${movie.id || `${movie.title}-${index}`}`}>
                                    <a className="movie-card" href={`/movie/${movie.id}`}>
                                        <div className="movie-card-image">
                                            {movie.poster_path ? (
                                                <>
                                                    <source srcSet={`https://image.tmdb.org/t/p/w500${movie.poster_path}.webp`} type="image/webp" />
                                                    <source srcSet={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} type="image/jpeg" />
                                                    <img 
                                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                                                        className="movie-card-img"
                                                        alt={movie.title} 
                                                        onError={(e) => { e.target.src = fallbackImage; }}
                                                        width="250"
                                                        height="375"
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                </>
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
                                        </div>
                                        <span className="movie-title">{movie.title}</span>
                                        <div className="movie-details">
                                            <span><FaStar className="movie-star" /> {movie.vote_average.toFixed(1)}</span>
                                            <span className="gap">&nbsp;〡&nbsp;</span>
                                            <span>{movie.release_date?.split("-")[0]}</span>
                                        </div>
                                    </a>
                                </SwiperSlide>
                            ))
                        ) : (
                            [...Array(7)].map((_, index) => (
                                <SwiperSlide key={index}>
                                    <SkeletonCard />
                                </SwiperSlide>
                            ))
                        )}
                    </Swiper>
                </div>
            ))}
        </div>
    );
};

export default LandingPage;