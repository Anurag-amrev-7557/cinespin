import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import "./Series.css";
import { AiFillFire } from "react-icons/ai";
import { FaHeart } from "react-icons/fa";
import { FaMasksTheater } from "react-icons/fa6";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { SlMagicWand } from "react-icons/sl";
import { MdFamilyRestroom } from "react-icons/md";
import { IoFilter } from "react-icons/io5";
import { TbFilter } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

// Constants
const TMDB_API_KEY = "92b98feaab02d1088661e456c19edb89";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const ITEMS_PER_PAGE = 20;
const CARDS_PER_ROW = 4;
const SCROLL_THRESHOLD = 0.8;

// API Service
const tmdbService = {
    async fetchTVShows(genreId, page, region) {
        try {
            const regionParam = region === "India" ? "&region=IN&with_original_language=hi" : "";
            const response = await fetch(
                `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}${regionParam}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching TV shows:", error);
            throw error;
        }
    }
};

// Skeleton Components
const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-img"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-details"></div>
    </div>
);

const SkeletonGenreCard = () => (
    <div className="skeleton-genre-card">
        <div className="skeleton-genre-icon"></div>
        <div className="skeleton-genre-title"></div>
    </div>
);

// Series Card Component
const SeriesCard = React.memo(({ series, fallbackImage }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
        <motion.a 
            className="series-card" 
            href={`/series/${series.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <div className="series-card-image">
                {!imageError && series.poster_path ? (
                    <picture>
                        <source 
                            srcSet={`${IMAGE_BASE_URL}/w500${series.poster_path}.webp`} 
                            type="image/webp" 
                        />
                        <img 
                            src={`${IMAGE_BASE_URL}/w500${series.poster_path}`}
                            className="series-card-img"
                            alt={series.name}
                            onError={() => setImageError(true)}
                            loading="lazy"
                            width="250"
                            height="375"
                            style={{ objectFit: "cover" }}
                        />
                    </picture>
                ) : (
                    <img 
                        src={fallbackImage}
                        className="series-card-img"
                        alt="Default series poster"
                        loading="lazy"
                        width="250"
                        height="375"
                        style={{ objectFit: "cover" }}
                    />
                )}
            </div>
            <span className="series-title">{series.name}</span>
            <div className="series-details">
                <span><FaStar className="series-star" /> {series.vote_average.toFixed(1)}</span>
                <span className="gap">&nbsp;〡&nbsp;</span>
                <span>{series.first_air_date?.split("-")[0]}</span>
            </div>
        </motion.a>
    );
});

const genres = [
    { id: 10759, name: "Action & Adventure", icon: <AiFillFire /> },
    { id: 35, name: "Comedy", icon: <FaMasksTheater /> },
    { id: 18, name: "Drama", icon: <FaHeart /> },
    { id: 16, name: "Animation", icon: <RiBearSmileFill /> },
    { id: 9648, name: "Mystery", icon: <RiGhostFill /> },
    { id: 10765, name: "Sci-Fi & Fantasy", icon: <RiSpaceShipFill /> },
    { id: 14, name: "Fantasy", icon: <SlMagicWand /> },
    { id: 878, name: "Sci‒Fi", icon: <RiSpaceShipFill /> },
    { id: 10751, name: "Family", icon: <MdFamilyRestroom /> },
];

const Series = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [seriesByGenre, setSeriesByGenre] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoadingGenres, setIsLoadingGenres] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [seriesPerPage] = useState(49); // 7 rows * 7 cards per row
    const [cardsPerRow] = useState(7); // Fixed number of cards per row
    const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem('region') || "Global");
    const [selectedGenre, setSelectedGenre] = useState("Action & Adventure");
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState({});
    const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
    const sortPopupRef = useRef();
    const { ref: loadMoreRef, inView } = useInView({
        threshold: SCROLL_THRESHOLD,
        triggerOnce: false
    });
    const [displayedSeries, setDisplayedSeries] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const fallbackImage = "/default.png";

    const fetchSeries = useCallback(async (genreId, page) => {
        try {
            setError(null);
            setIsLoading(true);
            
            const data = await tmdbService.fetchTVShows(genreId, page, selectedRegion);
            
            setSeriesByGenre(prevSeries => ({
                ...prevSeries,
                [genreId]: data.results
            }));

            setTotalPages(Math.min(Math.ceil(data.total_results / seriesPerPage), 7));
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching TV shows:", error);
            setError(error.message);
            setIsLoading(false);
        }
    }, [selectedRegion, seriesPerPage]);

    useEffect(() => {
        localStorage.setItem('region', selectedRegion);
    }, [selectedRegion]);

    const handleGenreClick = useCallback((genreId, genreName) => {
        setSelectedGenre(genreName);
        localStorage.setItem('selectedGenre', genreName);
        setCurrentPage(1);
        fetchSeries(genreId, 1);
    }, [fetchSeries]);

    const handlePageChange = useCallback((newPage) => {
        const currentGenreId = genres.find(genre => genre.name === selectedGenre)?.id;
        if (!currentGenreId) return;

        setCurrentPage(newPage);
        fetchSeries(currentGenreId, newPage);
    }, [selectedGenre, fetchSeries]);

    useEffect(() => {
        const storedGenre = localStorage.getItem('selectedGenre') || "Action & Adventure";
        setSelectedGenre(storedGenre);
        
        const genreId = genres.find(genre => genre.name === storedGenre)?.id || genres[0].id;
        if (!seriesByGenre[genreId] || seriesByGenre[genreId].length === 0) {
            setIsLoadingGenres(true);
            fetchSeries(genreId, 1);
        }
    }, [fetchSeries, selectedRegion]);

    const handleClickOutside = useCallback((event) => {
        if (sortPopupRef.current && !sortPopupRef.current.contains(event.target)) {
            setIsSortPopupOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const currentGenreId = useMemo(() => 
        genres.find(genre => genre.name === selectedGenre)?.id,
        [selectedGenre]
    );

    const filteredSeries = useMemo(() => {
        if (!currentGenreId || !seriesByGenre[currentGenreId]) return [];
        
        return seriesByGenre[currentGenreId]
            .filter(series => {
                // Check if series has all required properties
                const hasRequiredProperties = 
                    series.vote_average !== undefined && 
                    series.vote_average > 0 &&
                    series.first_air_date && 
                    series.first_air_date.length >= 4 &&
                    series.poster_path;

                // Check if series matches search term
                const matchesSearch = series.name.toLowerCase().includes(searchTerm.toLowerCase());

                return hasRequiredProperties && matchesSearch;
            })
            .sort((a, b) => {
                // Sort by rating first
                if (b.vote_average !== a.vote_average) {
                    return b.vote_average - a.vote_average;
                }
                
                // Then by release year
                const yearA = parseInt(a.first_air_date.split("-")[0]);
                const yearB = parseInt(b.first_air_date.split("-")[0]);
                return yearB - yearA;
            });
    }, [seriesByGenre, currentGenreId, searchTerm]);

    return (
        <div className="landing-container">
            <div className="genre-container">
                {isLoading ? (
                    Array.from({ length: genres.length }, (_, index) => (
                        <div key={index} className="genre-slide">
                            <SkeletonGenreCard />
                        </div>
                    ))
                ) : (
                    genres.map((genre) => (
                        <div key={genre.id} className="genre-slide">
                            <div 
                                className={`genre ${selectedGenre === genre.name ? 'active' : ''}`}
                                onClick={() => handleGenreClick(genre.id, genre.name)}
                            >
                                <div className="genre-icon">{genre.icon}</div>
                                {genre.name}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="filter-container">
                <div className="sort" onClick={() => setIsSortPopupOpen(!isSortPopupOpen)}>
                    <IoFilter className={`bounce-in ${isSortPopupOpen ? 'active' : ''}`} />
                </div>
                <div className="filter">
                    <TbFilter />
                </div>
            </div>

            <div className="item-container">
                {isLoading ? (
                    Array.from({ length: seriesPerPage }, (_, index) => (
                        <SkeletonCard key={index} />
                    ))
                ) : (
                    filteredSeries
                        .slice(0, seriesPerPage)
                        .map((series, index) => (
                            <SeriesCard 
                                key={`${series.id}-${index}`} 
                                series={series} 
                                fallbackImage={fallbackImage}
                            />
                        ))
                )}
                
                {!isLoading && filteredSeries.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-buttons">
                            <button 
                                className="pagination-button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            
                            <button 
                                className="pagination-button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                        <div className="page-info">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="error-message">
                        Error loading TV shows. Please try again.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Series; 