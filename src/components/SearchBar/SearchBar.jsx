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

// Cache handler: Stores results with an expiration time
const setToCache = (key, value, options = {}) => {
    const cache = {
        data: value,
        expiry: Date.now() + (options.expiration || 600000), // Default to 10 minutes
    };
    localStorage.setItem(key, JSON.stringify(cache));
};

// Cache retrieval: Returns cached data if it's still valid
const getFromCache = (key) => {
    const cached = JSON.parse(localStorage.getItem(key));
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }
    return null;
};

// Constants
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// API Service
const tmdbService = {
    async searchContent(type, query, { signal }) {
        if (!query) {
            console.error("Query is required.");
            return [];
        }

        try {
            const response = await axios.get(`${TMDB_BASE_URL}/search/${type}`, {
                params: {
                    api_key: TMDB_API_KEY,
                    query,
                    include_adult: false,
                    language: "en-US",
                    page: 1
                },
                signal // Pass the signal here
            });

            const results = response.data.results;

            const enrichedResults = await Promise.all(
                results.map(async (item) => {
                    try {
                        const details = await axios.get(
                            `${TMDB_BASE_URL}/${type}/${item.id}`,
                            { 
                                params: { api_key: TMDB_API_KEY },
                                signal // Pass the signal here as well
                            }
                        );

                        const fullData = details.data;

                        return {
                            ...item,
                            ...fullData,
                            type: type === "movie" ? "Movie" : "TV Show",
                            runtime: type === "movie" ? fullData.runtime : undefined,
                            number_of_seasons: type === "tv" ? fullData.number_of_seasons : undefined,
                        };
                    } catch (err) {
                        console.warn(`Failed to fetch full details for ${type} ${item.id}`, err);
                        return {
                            ...item,
                            type: type === "movie" ? "Movie" : "TV Show"
                        };
                    }
                })
            );

            return enrichedResults;

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request was aborted');
            } else {
                console.error(`Error searching ${type}:`, error);
            }
            return [];
        }
    },

    async searchMovies(query, { signal }) {
        return await this.searchContent("movie", query, { signal });
    },

    async searchTVShows(query, { signal }) {
        return await this.searchContent("tv", query, { signal });
    }
};

const SearchResultItem = ({ item, type, onClick, isSelected, onKeyDown }) => {
    const truncateOverview = (text) => {
        if (!text) return '';
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    const formatRuntime = (minutes) => {
        if (!minutes || isNaN(minutes)) return "";
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins}m`;
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
                    <span>⭐ {item.vote_average?.toFixed(1) || 'N/A'}&nbsp;&nbsp; 〡</span>
                    <span className="date-span">
                        <GoCalendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {new Date(item.release_date || item.first_air_date).getFullYear()}&nbsp;&nbsp; 〡
                    </span>
                    {item.type === "movie" && item.runtime && (
                        <span className="result-runtime">
                            {formatRuntime(item.runtime)}&nbsp;&nbsp; 〡
                        </span>
                    )}
                    {type === "TV Show" && item.number_of_seasons && (
                        <span className="seasons-count" title={`${item.number_of_seasons} Seasons`} style={{display: "flex", alignItems: "center"}}>
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M592 0H48A48 48 0 0 0 0 48v320a48 48 0 0 0 48 48h240v32H112a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H352v-32h240a48 48 0 0 0 48-48V48a48 48 0 0 0-48-48zm-16 352H64V64h512z"></path></svg>
                            &nbsp;&nbsp;{item.number_of_seasons} Season{item.number_of_seasons > 1 ? 's' : ''} &nbsp;&nbsp; 〡
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
    const [inlineSuggestion, setInlineSuggestion] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [searchHistory, setSearchHistory] = useState([]);
    const [trendingResults, setTrendingResults] = useState([]);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);


    const fetchTrending = async () => {
        try {
            const [movieResponse, tvResponse] = await Promise.all([
                fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`),
                fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${TMDB_API_KEY}`)
            ]);
    
            const movieData = await movieResponse.json();
            const tvData = await tvResponse.json();
    
            const allTrending = [
                ...movieData.results.map(item => ({ ...item, type: 'movie' })),
                ...tvData.results.map(item => ({ ...item, type: 'tv' }))
            ];
    
            const detailedResults = await Promise.all(
                allTrending.map(async (item) => {
                    try {
                        const detailsResponse = await fetch(
                            `https://api.themoviedb.org/3/${item.type}/${item.id}?api_key=${TMDB_API_KEY}`
                        );
                        const detailsData = await detailsResponse.json();
    
                        // Defensive check
                        if (detailsData.status_code) {
                            console.warn(`Invalid TMDB details for ${item.name || item.title}:`, detailsData);
                            return { ...item, runtime: null, numberOfSeasons: null };
                        }
    
                        const runtime = item.type === 'movie'
                            ? detailsData.runtime ?? null
                            : detailsData.episode_run_time?.[0] ?? null;
    
                        const numberOfSeasons = item.type === 'tv'
                            ? detailsData.number_of_seasons ?? null
                            : null;
    
                        return { ...item, runtime, numberOfSeasons };
                    } catch (err) {
                        console.warn(`Failed to fetch details for ${item.name || item.title}:`, err);
                        return { ...item, runtime: null, numberOfSeasons: null };
                    }
                })
            );
    
            setTrendingResults(detailedResults);
        } catch (error) {
            console.error("Error fetching trending movies and TV shows with runtime and seasons:", error);
        }
    };

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
            searchoverlay.style.width = "2vw";
            searchoverlay.style.height = "2vw";
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

    useEffect(() => {
        const handleClickOutside = (event) => {
          const searchOverlay = document.querySelector(".search-bar-overlay");
          const isSearchExpanded = searchOverlay?.style.width === "98.65%";
    
          // Check if click is outside the search bar and if search is expanded
          if (
            isSearchExpanded && 
            searchRef.current && 
            !searchRef.current.contains(event.target)
          ) {
            closeSearch(); // Close the search overlay
          }
        };
    
        // Add event listeners for both mouse and touch events
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
    
        // Cleanup event listeners on component unmount
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('touchstart', handleClickOutside);
        };
      }, [closeSearch]);

    const handleSearch = useCallback(() => {
        const searchoverlay = document.querySelector(".search-bar-overlay");

        if (searchoverlay) {
            if (searchoverlay.style.width === "98.65%") {
                closeSearch();
            } else {
                // Expand the search bar
                searchoverlay.style.width = "98.65%";
                searchoverlay.style.height = "87%";
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

                        if (!searchQuery.trim()) {
                            fetchTrending();
                        }

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
    
            // Check cache before making an API request
            const cachedResults = getFromCache(cacheKey);
            if (cachedResults) {
                setSearchResults(cachedResults);
                setIsSearching(false);
                return;
            }
    
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000); // Timeout for request
    
                // Fetch Movies and TV Shows in parallel
                const [movies, tvShows] = await Promise.all([
                    tmdbService.searchMovies(normalizedQuery, { signal: controller.signal }),
                    tmdbService.searchTVShows(normalizedQuery, { signal: controller.signal })
                ]);
    
                clearTimeout(timeout);
    
                // Combine movie and TV show results and calculate relevance score
                const results = [...movies, ...tvShows].map(item => {
                    const title = item.title || item.name || '';
                    const lowerTitle = title.toLowerCase();
    
                    let relevanceScore = 0;
                    const isMatch = lowerTitle.includes(normalizedQuery);
                    if (isMatch) {
                        relevanceScore += 30;
    
                        // Enhance scoring with vote average, popularity, and recency
                        if (item.vote_average) relevanceScore += item.vote_average * 2;
                        if (item.popularity) relevanceScore += item.popularity * 0.8;
    
                        const year = new Date(item.release_date || item.first_air_date).getFullYear();
                        if (year && !isNaN(year)) {
                            const currentYear = new Date().getFullYear();
                            const yearScore = Math.max(0, 20 - (currentYear - year));
                            relevanceScore += yearScore;
                        }
                    }
    
                    return {
                        ...item,
                        type: item.title ? 'Movie' : 'TV Show',
                        relevanceScore
                    };
                });
    
                // Filter out results without valid poster or date
                let filtered = results.filter(item => item.poster_path && (item.release_date || item.first_air_date));
    
                // Prioritize variations like "Chapter" in titles (e.g., "Kesari Chapter 2")
                filtered = filtered.filter(item => {
                    const lowerTitle = (item.title || item.name || "").toLowerCase();
                    return lowerTitle.includes(normalizedQuery) || lowerTitle.includes("chapter");
                });
    
                // Sort by relevance score, limit to top 12 results
                filtered = filtered.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 12);
    
                // Fallback fuzzy search if results are low
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
                        .sort((a, b) => (a.fuzzyScore ?? 0) - (b.fuzzyScore ?? 0));
                }
    
                // After final 'filtered' results are ready (before caching and setting state)
                const topMatch = filtered.find(item => {
                    const title = (item.title || item.name || "").toLowerCase();
                    return title.startsWith(normalizedQuery) && title !== normalizedQuery;
                });
    
                if (topMatch) {
                    const title = topMatch.title || topMatch.name || "";
                    const remaining = title.slice(query.length); // use raw query for case match
                    setInlineSuggestion(remaining);
                } else {
                    setInlineSuggestion('');
                }
    
                // Store results in cache with an expiration mechanism (e.g., 10 minutes)
                setToCache(cacheKey, filtered, { expiration: 600000 });
    
                // Update state with final results
                setSearchResults(filtered);
    
            } catch (err) {
                console.error("Search failed:", err);
    
                // Retry mechanism on failure (max 2 retries)
                if (!err.message.includes('AbortError')) {
                    retryRequest(normalizedQuery, 1);
                }
    
                // Update state with empty results
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400),
        []
    );

    const handleResultClick = (item) => {
        const route = item.type.toLowerCase() === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`;
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
            "Sports": "/sports",
            "What to Watch": "/watch",
        };

        navigate(routes[item]);
    };

    useEffect(() => {
        const pathToItem = {
            "/movies": "Movies",
            "/series": "Series",
            "/sports": "Sports",
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
        <AnimatePresence>
            <motion.div 
                className="navbar-search" 
                key={routeKey} 
                ref={searchRef}
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="search-bar-overlay"></div>
                {["Movies", "Series", "Sports", "What to Watch"].map((item) => (
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
            </motion.div>
        </AnimatePresence>
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
        
            {/* If searching, show skeleton loader */}
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
            ) : (
                // When searchQuery is empty, show trending results
                searchQuery.trim() === "" ? (
                    trendingResults.length > 0 ? (
                        <div className="trending-now">
                            <br />
                            <h4>Popular Now</h4>
                            {trendingResults.map((item, index) => (
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
                            ))}
                        </div>
                    ) : (
                        <div className="no-results" role="status" aria-label="No results found" aria-live="polite">
                            <p>No results found</p>
                        </div>
                    )
                ) : (
                    // Show search results when there is a query
                    searchResults.length > 0 ? (
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
                    ) : trendingResults.length > 0 ? (
                        // Display trending movies if no search results
                        <div className="trending-movies">
                            <div className="no-results" role="status" aria-label="No results found" aria-live="polite">
                                <p>No results found</p>
                            </div>
                            <h4>Popular Now</h4>
                            {trendingResults.map((item, index) => (

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
                                
                            ))}
                        </div>
                    ) : (
                        <div className="no-results" role="status" aria-label="No results found" aria-live="polite">
                            <p>No results found</p>
                        </div>
                    )
                )
            )}
        </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SearchBar;