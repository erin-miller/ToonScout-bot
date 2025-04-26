import express from "express";
import {
  FishCalculator,
  SuitsCalculator,
  FlowerCalculator,
} from "toonapi-calculator";
import fetch from "node-fetch";

const router = express.Router();

router.post("/get-fish", async (req, res) => {
  const { toonData } = req.body;

  if (!toonData) {
    return res.status(400).json({ message: "Toon data is required" });
  }

  const calc = new FishCalculator(JSON.stringify(toonData.data.fish));

  try {
    const rarity = calc.sortBestRarity();
    const caught = calc.getCaught();
    const fishData = { rarity, caught };

    if (fishData) {
      return res.status(200).json(fishData);
    } else {
      return res
        .status(404)
        .json({ message: "Fish data not found for this toon" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.post("/get-promo", async (req, res) => {
  const { toonData, dept } = req.body;

  if (!toonData || !dept) {
    return res.status(400).json({ message: "Toon data and dept is required" });
  }

  const calc = new SuitsCalculator(JSON.stringify(toonData.data.cogsuits));

  try {
    const promoData = calc.getBestPathWeighted(dept);
    if (promoData) {
      return res.status(200).json(promoData);
    } else {
      return res
        .status(404)
        .json({ message: "Suit data not found for this toon" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.post("/get-garden", async (req, res) => {
  const { toonData } = req.body;

  const calc = new FlowerCalculator(JSON.stringify(toonData.data.flowers));

  try {
    const upgrade = calc.getDaysToUpgrade();
    const plantable = calc.getPlantableFlowers();
    const progress = calc.getProgressFlowers();
    const missing = calc.getMissingFlowers();
    const flowers = { upgrade, plantable, progress, missing };

    if (flowers) {
      return res.status(200).json(flowers);
    } else {
      return res
        .status(404)
        .json({ message: "Flower data not found for this toon" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// In-memory cache for invasions
let cachedInvasions = null;
let lastFetchTime = 0;
const INVASION_CACHE_MS = 60 * 1000; // 60 seconds

/**
 * @typedef {Object} InvasionDetails
 * @property {number} asOf - Timestamp when invasion info was updated
 * @property {string} type - The cog type (e.g., "Ambulance Chaser", "Bottom Feeder")
 * @property {string} progress - Current invasion progress as "current/total" (e.g., "1498/3000")
 * @property {number} startTimestamp - Unix timestamp when the invasion started
 */

/**
 * @typedef {Object} TTRInvasionResponse
 * @property {null|string} error - Error message if any, null if successful
 * @property {Object.<string, InvasionDetails>} invasions - Map of district names to invasion details
 * @property {number} lastUpdated - Unix timestamp of when the data was last updated
 */

// Proxy TTR invasions API with in-memory caching and CORS
router.get("/get-invasions", async (req, res) => {
  res.set("Cache-Control", "public, max-age=60"); // Allow clients/proxies to cache for 60 seconds
  const now = Date.now();
  if (cachedInvasions && now - lastFetchTime < INVASION_CACHE_MS) {
    return res.status(200).json(cachedInvasions);
  }
  try {
    const response = await fetch(
      "https://www.toontownrewritten.com/api/invasions",
      {
        headers: { "User-Agent": process.env.USER_AGENT },
      }
    );
    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch from TTR API" });
    }
    const data = await response.json();
    cachedInvasions = data;
    lastFetchTime = now;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Test endpoint to return invasion data with a Legal Eagle invasion for local testing
router.get("/test-invasions", async (req, res) => {
  // Create a mock invasion response with the same structure as TTR API
  const mockResponse = {
    error: null,
    invasions: {
      "Hiccup Hills": {
        asOf: Math.floor(Date.now() / 1000),
        type: "Bottom Feeder",
        progress: "1498/3000",
        startTimestamp: Math.floor(Date.now() / 1000) - 1200, // Started 20 minutes ago
      },
      "Kaboom Cliffs": {
        asOf: Math.floor(Date.now() / 1000),
        type: "Ambulance Chaser",
        progress: "2429/8084",
        startTimestamp: Math.floor(Date.now() / 1000) - 1800, // Started 30 minutes ago
      },
      Splatville: {
        asOf: Math.floor(Date.now() / 1000),
        type: "Short Change",
        progress: "4371/6000",
        startTimestamp: Math.floor(Date.now() / 1000) - 3400, // Started ~56 minutes ago
      },
      "Zoink Falls": {
        asOf: Math.floor(Date.now() / 1000),
        type: "Robber Baron",
        progress: "5352/7686",
        startTimestamp: Math.floor(Date.now() / 1000) - 4500, // Started ~75 minutes ago
      },
      // Adding the requested Legal Eagle invasion for testing
      "Toon Valley": {
        asOf: Math.floor(Date.now() / 1000),
        type: "Legal Eagle",
        progress: "3245/9000",
        startTimestamp: Math.floor(Date.now() / 1000) - 2700, // Started 45 minutes ago
      },
    },
    lastUpdated: Math.floor(Date.now() / 1000),
  };

  return res.status(200).json(mockResponse);
});

export default router;
