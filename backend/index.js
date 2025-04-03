require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { corsOptions, logCorsRequests } = require("./config/corsConfig");
const { startServer } = require("./config/portConfig");

const app = express();

const apiLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 30, // Limit each IP to 30 requests per windowMs
    message: { error: "Too many requests, please try again later." }
});

app.use(apiLimiter);

// Port configuration
const DEFAULT_PORT = process.env.PORT || 3000;
const PORT_RANGE_START = 3000;
const PORT_RANGE_END = 3200;

const TMDB_API_KEY = process.env.TMDB_API_KEY;

app.use(express.json());
app.use(cors(corsOptions));
app.use(logCorsRequests);

const api_key = process.env.GEMINI_API_KEY;

// Get a random movie or TV show
app.get("/random/:type", async (req, res) => {
    const { type } = req.params;
    const validTypes = ["movie", "tv"];

    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid type. Use 'movie' or 'tv'." });
    }

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/discover/${type}`, {
            params: {
                api_key: TMDB_API_KEY,
                sort_by: "popularity.desc",
                page: Math.floor(Math.random() * 100) + 1
            }
        });

        const results = response.data.results;
        const randomItem = results.length > 0 ? results[Math.floor(Math.random() * results.length)] : null;

        if (!randomItem) {
            return res.status(404).json({ error: `No ${type}s found.` });
        }

        res.json(randomItem);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.post("/get-content-type", async (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${api_key}`,
            {
                contents: [
                    {
                        parts: [{ text: `Is "${title}" a Movie or a TV Series? Respond with only "Movie" or "Series".` }],
                    },
                ],
            }
        );

        // Check the structure of the response and extract text
        const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        let contentType = "Unknown"; // Default fallback

        if (/^\s*movie\s*$/i.test(textResponse)) {
            contentType = "Movie";
        } else if (/^\s*(series|tv show)\s*$/i.test(textResponse)) {
            contentType = "Series";
        }

        res.json({ title, type: contentType });

    } catch (error) {
        console.error("Error fetching content type:", error?.response?.data || error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get all movie genres
app.get("/genres", async (req, res) => {
    try {
        const response = await axios.get("https://api.themoviedb.org/3/genre/movie/list", {
            params: {
                api_key: TMDB_API_KEY,
                language: "en-US"
            }
        });

        res.json(response.data.genres);
    } catch (error) {
        console.error("Error fetching genres:", error);
        res.status(500).json({ error: "Failed to fetch genres" });
    }
});

// Get movies by genre
app.get("/genre/:genreId", async (req, res) => {
    const { genreId } = req.params;
    const totalPages = 5; 

    try {
        let allResults = [];

        for (let i = 1; i <= totalPages; i++) {
            const response = await axios.get("https://api.themoviedb.org/3/discover/movie", {
                params: {
                    api_key: TMDB_API_KEY,
                    with_genres: genreId,
                    sort_by: "popularity.desc",
                    page: i
                }
            });

            allResults = allResults.concat(response.data.results);
        }

        res.json(allResults);
    } catch (error) {
        console.error("Error fetching movies by genre:", error);
        res.status(500).json({ error: "Failed to fetch movies by genre" });
    }
});

startServer(app, DEFAULT_PORT, PORT_RANGE_START, PORT_RANGE_END);