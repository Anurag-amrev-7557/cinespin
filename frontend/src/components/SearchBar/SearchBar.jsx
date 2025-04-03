import "./SearchBar.css";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { debounce } from "lodash";
import { GoCalendar } from "react-icons/go";

// Constants
const TMDB_API_KEY = "92b98feaab02d1088661e456c19edb89";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// API Service
const tmdbService = {
    async searchMovies(query) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    query,
                    include_adult: false,
                    language: "en-US",
                    page: 1
                }
            });
            return response.data.results;
        } catch (error) {
            console.error("Error searching movies:", error);
            return [];
        }
    },

    async searchTVShows(query) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
                params: {
                    api_key: TMDB_API_KEY,
                    query,
                    include_adult: false,
                    language: "en-US",
                    page: 1
                }
            });
            return response.data.results;
        } catch (error) {
            console.error("Error searching TV shows:", error);
            return [];
        }
    }
};

const SearchResultItem = ({ item, type, onClick, isSelected, onKeyDown }) => {
    const truncateOverview = (text) => {
        if (!text) return '';
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    return (
        <motion.div 
            className={`search-result-item ${isSelected ? 'selected' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={onClick}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`${item.title || item.name} - ${type} (${new Date(item.release_date || item.first_air_date).getFullYear()})`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="result-image">
                <img 
                    src={item.poster_path ? `${IMAGE_BASE_URL}/w92${item.poster_path}` : '/placeholder.jpg'} 
                    alt={item.title || item.name}
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                        e.target.onerror = null;
                    }}
                />
            </div>
            <div className="result-info">
                <h4>{item.title || item.name}</h4>
                <p className="result-overview">{truncateOverview(item.overview)}</p>
                <div className="result-meta">
                    <span>⭐ {item.vote_average?.toFixed(1) || 'N/A'}</span>
                    <span className="date-span">
                        <GoCalendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {new Date(item.release_date || item.first_air_date).getFullYear()}
                    </span>
                    <span className="result-type">{type}</span>
                </div>
            </div>
        </motion.div>
    );
};

const SearchItem = ({ item, isActive, onClick, onKeyDown }) => (
    <div 
        className={`searchitem ${isActive ? "active" : ""}`} 
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="button"
        aria-label={item}
    >
        {item}
    </div>
);

const SearchBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeItem, setActiveItem] = useState("Movies");
    const [routeKey, setRouteKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (!showResults) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < searchResults.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev > 0 ? prev - 1 : searchResults.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && searchResults[selectedIndex]) {
                    handleResultClick(searchResults[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                closeSearch();
                break;
        }
    }, [showResults, searchResults, selectedIndex]);

    // Handle touch interactions
    const handleTouchStart = useCallback((e) => {
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (target && target.closest('.search-result-item')) {
            const index = Array.from(target.closest('.search-results-container').children)
                .indexOf(target.closest('.search-result-item'));
            setSelectedIndex(index);
        }
    }, []);

    const closeSearch = useCallback(() => {
        const searchoverlay = document.querySelector(".search-bar-overlay");
        if (searchoverlay) {
            searchoverlay.style.width = "2.4rem";
            searchoverlay.style.height = "2.4rem";
            searchoverlay.style.borderRadius = "50%";
            searchoverlay.style.border = "2px solid transparent";
            setShowResults(false);
            setSelectedIndex(-1);
            setSearchQuery("");

            const input = searchoverlay.querySelector("input");
            if (input) {
                input.style.opacity = "0";
                setTimeout(() => input.remove(), 300);
            }
        }
    }, []);

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            const searchoverlay = document.querySelector(".search-bar-overlay");
            const isSearchExpanded = searchoverlay?.style.width === "98.5%";
            
            // Check if click is outside the search bar
            if (
                isSearchExpanded && 
                searchRef.current && 
                !searchRef.current.contains(event.target)
            ) {
                closeSearch();
            }
        };

        // Add event listeners for both mouse and touch events
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        // Cleanup event listeners
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [closeSearch]);

    const handleSearch = useCallback(() => {
        const searchoverlay = document.querySelector(".search-bar-overlay");

        if (searchoverlay) {
            if (searchoverlay.style.width === "98.5%") {
                closeSearch();
            } else {
                // Expand the search bar
                searchoverlay.style.width = "98.5%";
                searchoverlay.style.height = "88%";
                searchoverlay.style.borderRadius = "2rem";
                searchoverlay.style.border = "1px solid rgba(255,255,255,0.05)";

                setTimeout(() => {
                    if (!searchoverlay.querySelector("input")) {
                        const input = document.createElement("input");
                        input.type = "text";
                        input.placeholder = "Search Movie & Series";
                        input.className = "search-input";
                        input.style.opacity = "0";
                        input.value = searchQuery;
                        input.addEventListener("input", (e) => handleSearchInput(e.target.value));
                        input.addEventListener("keydown", handleKeyDown);
                        searchoverlay.appendChild(input);
                        inputRef.current = input;

                        setTimeout(() => {
                            input.style.opacity = "1";
                            input.focus();
                        }, 50);
                    }
                }, 200);
            }
        }
    }, [searchQuery, handleKeyDown, closeSearch]);

    const handleSearchInput = useCallback(
        debounce(async (query) => {
            setSearchQuery(query);
            if (query.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            setShowResults(true);

            try {
                const [movies, tvShows] = await Promise.all([
                    tmdbService.searchMovies(query),
                    tmdbService.searchTVShows(query)
                ]);

                const combinedResults = [
                    ...movies.map(movie => ({ ...movie, type: 'Movie' })),
                    ...tvShows.map(show => ({ ...show, type: 'TV Show' }))
                ].sort((a, b) => {
                    // Sort by release year (newest first)
                    const yearA = new Date(a.release_date || a.first_air_date).getFullYear();
                    const yearB = new Date(b.release_date || b.first_air_date).getFullYear();
                    return yearB - yearA;
                });

                setSearchResults(combinedResults.slice(0, 10));
            } catch (error) {
                console.error("Error in search:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300),
        []
    );

    const handleResultClick = (item) => {
        const route = item.type === 'Movie' ? `/movie/${item.id}` : `/series/${item.id}`;
        navigate(route);
        setShowResults(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleClick = (item) => {
        setActiveItem(item);
        const routes = {
            "Movies": "/movies",
            "Series": "/series",
            "Originals": "/originals",
            "What to Watch": "/watch",
        };

        window.location.href = routes[item];
    };

    useEffect(() => {
        const pathToItem = {
            "/movies": "Movies",
            "/series": "Series",
            "/originals": "Originals",
            "/watch": "What to Watch",
        };

        setActiveItem(pathToItem[location.pathname] || "Movies");
    }, [location.pathname]);

    return (
        <>
            <div 
                className="navbar-search" 
                key={routeKey} 
                ref={searchRef}
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="search-bar-overlay"></div>
                {["Movies", "Series", "Originals", "What to Watch"].map((item) => (
                    <SearchItem 
                        key={item}
                        item={item}
                        isActive={activeItem === item}
                        onClick={() => handleClick(item)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleClick(item);
                            }
                        }}
                    />
                ))}
                <div 
                    className="search" 
                    onClick={() => handleSearch()}
                    role="button"
                    aria-label="Search"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search-icon lucide-search" aria-hidden="true">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.3-4.3"/>
                    </svg>
                </div>
            </div>

            <AnimatePresence>
                {showResults && searchQuery.length >= 2 && (
                    <motion.div 
                        className="search-results-container"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        ref={resultsRef}
                        onTouchStart={handleTouchStart}
                        role="listbox"
                        aria-label="Search results"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside results
                    >
                        {isSearching ? (
                            <div className="search-loading" role="status" aria-label="Searching">
                                <div className="loading-spinner"></div>
                                <p>Searching...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((item, index) => (
                                <SearchResultItem
                                    key={`${item.type}-${item.id}`}
                                    item={item}
                                    type={item.type}
                                    isSelected={index === selectedIndex}
                                    onClick={() => handleResultClick(item)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleResultClick(item);
                                        }
                                    }}
                                />
                            ))
                        ) : (
                            <div className="no-results" role="status" aria-label="No results found">
                                <p>No results found</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SearchBar;