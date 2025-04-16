import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiFillFire } from "react-icons/ai";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { LuSwords } from "react-icons/lu";
import { GiDrippingKnife } from "react-icons/gi";
import { FaHatWizard } from "react-icons/fa6";
import { GiSpartanHelmet } from "react-icons/gi";
import { FaHeart } from "react-icons/fa";
import { RiBearSmileFill, RiGhostFill, RiSpaceShipFill } from "react-icons/ri";
import { FaMasksTheater } from "react-icons/fa6";
import { getFromCache, setToCache } from "../../utils/cache";
import { PiDetectiveFill } from "react-icons/pi";
import { GiDramaMasks } from "react-icons/gi";
import { MdVideoCameraBack } from "react-icons/md";
import { RiFilter2Line } from "react-icons/ri";
import { FaGun } from "react-icons/fa6";
import { TbMapRoute } from "react-icons/tb";
import { IoFilterSharp } from "react-icons/io5";
import { GiSentryGun } from "react-icons/gi";
import { FaHandcuffs } from "react-icons/fa6";
import { MdFamilyRestroom } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import "./sports.css";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingGenres, setIsLoadingGenres] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState(() => localStorage.getItem("region") || "Global");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageNumber, setPageNumber] = useState(parseInt(localStorage.getItem("currentPage")) || 1); // Get from localStorage or default to 1
    const [pageRangeStart, setPageRangeStart] = useState(1);
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [sortOption, setSortOption] = useState("year");
    const [filterOrder, setFilterOrder] = useState("desc");
    const [sortedMovies, setSortedMovies] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    
    const movieCardVariant = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 240,
                damping: 20,
                mass: 0.8
            }
        },
        exit: {
            opacity: 0,
            y: 30,
            scale: 0.95,
            transition: { duration: 0.3 }
        }
    };
    
    const containerStagger = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.07,
                delayChildren: 0.2
            }
        }
    };
    
    const popupVariant = {
        hidden: { opacity: 0, scale: 0.9, y: -10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 260, damping: 22 }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: -10,
            transition: { duration: 0.2 }
        }
    };

    useEffect(() => {
        const handleRegionChange = () => {
            const updatedRegion = localStorage.getItem("region") || "Global";
            if (updatedRegion !== selectedRegion) {
                setSelectedRegion(updatedRegion);
                setCurrentPage(1);
                localStorage.setItem("currentPage", 1);
            }
        };
    
        window.addEventListener("regionChange", handleRegionChange);
        window.addEventListener("storage", handleRegionChange);
    
        return () => {
            window.removeEventListener("regionChange", handleRegionChange);
            window.removeEventListener("storage", handleRegionChange);
        };
    }, [selectedRegion]);

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "region") {
                const updatedRegion = event.newValue || "Global";
                setSelectedRegion(updatedRegion);
                setCurrentPage(1);
                localStorage.setItem("currentPage", 1);
            }
        };
    
        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    });

    return (
        <>

        <Helmet>
        <title>Sports</title>
        <meta
            name="description"
            content={`Explore the best sports. Discover new favorites with Cinespin!`}
        />
        </Helmet>
        <div className="sports-container">
                <AnimatePresence mode="wait">
                    <motion.div className="sports-grid"
                        variants={containerStagger}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                            <motion.div
                                layout
                                className="sports-card"
                                onClick={() => window.location.href = "https://user4580.ifrem.net/iframe/frame.php"}
                                whileHover={{ scale: 1.03, y: -3, transition: { ease: "easeOut" } }}
                                variants={movieCardVariant}
                            >
                                <picture>
                                    <motion.img
                                        loading="lazy"
                                        decoding="async"
                                        src="/ipl.jpg"
                                        className="sports-poster"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    />
                                </picture>
                                <span className="sports-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    IPL Live
                                </span>
                            </motion.div>
                    </motion.div>
                </AnimatePresence>
        </div>
    </>
    );
};

export default Movies;