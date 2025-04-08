import "./SearchBar.css";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Fuse from "fuse.js";
import { debounce } from "lodash";
import { GoCalendar } from "react-icons/go";

const getFromCache = (key) => {
    const cached = localStorage.getItem(`search_${key}`);
    return cached ? JSON.parse(cached) : null;
};
const setToCache = (key, data) => {
    localStorage.setItem(`search_${key}`, JSON.stringify(data));
};

// Constants
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
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
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 150, damping: 26, duration: 0.45 }}
            onClick={onClick}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="option"
            id={`search-result-${item.id}`}
            aria-selected={isSelected}
            aria-label={`${item.title || item.name} - ${type} (${new Date(item.release_date || item.first_air_date).getFullYear()})`}
            whileHover={{ scale: 1}}
            whileTap={{ scale: 0.98 }}
        >
            <div className="result-image">
                <picture>
                <img 
                    src={item.poster_path ? `${IMAGE_BASE_URL}/w92${item.poster_path}` : '/placeholder.jpg'} 
                    alt={item.title || item.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                        e.target.onerror = null;
                    }}
                />
                </picture>
            </div>
            <div className="result-info">
                <h4>{item.title || item.name}
                    <span className="autocomplete-year"> ({new Date(item.release_date || item.first_air_date).getFullYear()})</span>
                </h4>
                <p className="result-overview">{truncateOverview(item.overview)}</p>
                <div className="result-meta">
                    <span>⭐ {item.vote_average?.toFixed(1) || 'N/A'}</span>
                    <span className="date-span">
                        <GoCalendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {new Date(item.release_date || item.first_air_date).getFullYear()}
                    </span>
                    {type === "TV Show" && item.number_of_seasons && (
                        <span className="seasons-count" title={`${item.number_of_seasons} Seasons`}>
                            📺 {item.number_of_seasons} Season{item.number_of_seasons > 1 ? 's' : ''}
                        </span>
                    )}
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
    const [searchHistory, setSearchHistory] = useState([]);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    useEffect(() => {
        const handleBlur = (e) => {
          if (!searchRef.current?.contains(e.relatedTarget)) {
            closeSearch();
          }
        };
      
        if (inputRef.current) {
          inputRef.current.addEventListener("blur", handleBlur);
        }
      
        return () => {
          if (inputRef.current) {
            inputRef.current.removeEventListener("blur", handleBlur);
          }
        };
      }, [searchRef.current, inputRef.current]);

    useEffect(() => {
        if (selectedIndex >= 0 && resultsRef.current) {
          const selectedEl = document.getElementById(`search-result-${searchResults[selectedIndex]?.id}`);
          if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, [selectedIndex, searchResults]);

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
                if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
                    handleResultClick(searchResults[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                closeSearch();
                break;
        }
    }, [showResults, searchResults, selectedIndex]);

    useEffect(() => {
        if (selectedIndex >= 0 && resultsRef.current) {
          const el = document.getElementById(`search-result-${searchResults[selectedIndex]?.id}`);
          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "nearest"
            });
          }
        }
      }, [selectedIndex, searchResults]);

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
                        setShowResults(true);
                        const input = document.createElement("input");
                        input.type = "text";
                        input.placeholder = "Search Movie & Series";
                        input.className = "search-input";
                        input.style.opacity = "0";
                        input.value = searchQuery;
                        input.setAttribute("role", "combobox");
                        input.setAttribute("aria-autocomplete", "list");
                        input.setAttribute("aria-expanded", "true");
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
            const normalizedQuery = query.toLowerCase().trim();
            setSearchQuery(query);
    
            if (!normalizedQuery || normalizedQuery.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
    
            setIsSearching(true);
            setShowResults(true);
    
            const cacheKey = normalizedQuery;
            const cachedResults = getFromCache(cacheKey);
            if (cachedResults) {
                setSearchResults(cachedResults);
                setIsSearching(false);
                return;
            }
    
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout
    
                const [movies, tvShows] = await Promise.all([
                    tmdbService.searchMovies(normalizedQuery),
                    tmdbService.searchTVShows(normalizedQuery)
                ]);
    
                clearTimeout(timeout);
    
                const results = [...movies, ...tvShows].map(item => {
                    const title = item.title || item.name || "";
                    const year = new Date(item.release_date || item.first_air_date).getFullYear();
                    const lowerTitle = title.toLowerCase();
    
                    let relevanceScore = 0;
                    if (lowerTitle === normalizedQuery) relevanceScore += 100;
                    else if (lowerTitle.startsWith(normalizedQuery)) relevanceScore += 60;
                    else if (lowerTitle.includes(normalizedQuery)) relevanceScore += 40;
    
                    if (item.vote_average) relevanceScore += item.vote_average * 3;
                    if (item.popularity) relevanceScore += item.popularity * 0.7;
                    if (year && !isNaN(year)) {
                        const currentYear = new Date().getFullYear();
                        const yearScore = Math.max(0, 15 - (currentYear - year));
                        relevanceScore += yearScore;
                    }
    
                    return {
                        ...item,
                        type: item.title ? 'Movie' : 'TV Show',
                        relevanceScore
                    };
                });
    
                let filtered = results
                .filter(item => item.poster_path && (item.release_date || item.first_air_date));
            
                // Fuzzy fallback if direct results aren't good
                if (filtered.length < 5) {
                    const fuse = new Fuse(results, {
                        keys: ['title', 'name'],
                        threshold: 0.4,
                        distance: 100,
                        ignoreLocation: true,
                        includeScore: true,
                    });
                
                    const fuzzyResults = fuse.search(normalizedQuery);
                    filtered = fuzzyResults.map(r => ({ ...r.item, fuzzyScore: r.score }))
                        .sort((a, b) => (a.fuzzyScore ?? 0) - (b.fuzzyScore ?? 0))
                        .slice(0, 12);
                } else {
                    filtered = filtered
                        .sort((a, b) => b.relevanceScore - a.relevanceScore)
                        .slice(0, 12);
                }
    
                setToCache(cacheKey, filtered);
                setSearchResults(filtered);
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400),
        []
    );

    const handleResultClick = (item) => {
        const route = item.type === 'Movie' ? `/movie/${item.id}` : `/series/${item.id}`;
        const queryTitle = item.title || item.name;
    
        // Save to search history
        setSearchHistory(prev => {
            const updated = [queryTitle, ...prev.filter(q => q !== queryTitle)].slice(0, 5);
            localStorage.setItem("searchHistory", JSON.stringify(updated));
            return updated;
        });
    
        navigate(route);
        setShowResults(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleClick = (item) => {
        setActiveItem(item);
        localStorage.setItem("activeTab", item);
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

        const storedTab = localStorage.getItem("activeTab");
        setActiveItem(pathToItem[location.pathname] || storedTab || "Movies");
    }, [location.pathname]);

    useEffect(() => {
        const storedHistory = localStorage.getItem("searchHistory");
        if (storedHistory) {
            setSearchHistory(JSON.parse(storedHistory));
        }
    }, []);

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
            {showResults && (searchQuery.length >= 2 || (!searchQuery && searchHistory.length > 0)) && (
            <motion.div 
                        className="search-results-container"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 26,
                            mass: 0.9,
                            duration: 0.5,
                            ease: [0.25, 0.1, 0.25, 1]
                        }}
                        ref={resultsRef}
                        onTouchStart={handleTouchStart}
                        role="listbox"
                        aria-activedescendant={selectedIndex >= 0 ? `search-result-${searchResults[selectedIndex]?.id}` : undefined}
                        aria-label="Search results"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside results
                    >
                        {!searchQuery && searchHistory.length > 0 && (
                            <div className="search-history">
                                <h4>Recent Searches</h4>
                                {searchHistory.map((query, index) => (
                                    <div
                                        key={`history-${index}`}
                                        className="search-history-item"
                                        onClick={() => handleSearchInput(query)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleSearchInput(query);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Search history: ${query}`}
                                    >
                                        {query}
                                    </div>
                                ))}
                            </div>
                        )}
                        {isSearching ? (
                            <div className="search-skeletons" role="status" aria-label="Loading search results" aria-live="polite">
                                {[...Array(6)].map((_, index) => (
                                    <div className="skeleton-item" key={`skeleton-${index}`}>
                                        <div className="skeleton-img shimmer" />
                                        <div className="skeleton-text-container">
                                            <div className="skeleton-title shimmer" />
                                            <div className="skeleton-overview shimmer" />
                                            <div className="skeleton-meta shimmer" />
                                        </div>

                                    </div>
                                ))}
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults
                                .filter(item => item.poster_path && (item.release_date || item.first_air_date) && item.vote_average)
                                .sort((a, b) => {
                                    const yearA = new Date(a.release_date || a.first_air_date).getFullYear();
                                    const yearB = new Date(b.release_date || b.first_air_date).getFullYear();
                                    return yearB - yearA; // latest year first
                                })
                                .map((item, index) => (
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
                            <div className="no-results" role="status" aria-label="No results found" aria-live="polite">
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