import express from 'express';
import { FishCalculator, SuitsCalculator, FlowerCalculator } from 'toonapi-calculator';

const router = express.Router();

router.post('/get-fish', async (req, res) => {
    const { toonData } = req.body;

    if (!toonData) {
        return res.status(400).json({ message: 'Toon data is required' });
    }

    const calc = new FishCalculator(JSON.stringify(toonData.data.fish));

    try {
        const rarity = calc.sortBestRarity();
        const caught = calc.getCaught();
        const fishData = { rarity, caught };

        if (fishData) {
            return res.status(200).json(fishData);
        } else {
            return res.status(404).json({ message: 'Fish data not found for this toon' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.post('/get-promo', async (req, res) => {
    const { toonData, dept } = req.body;

    if (!toonData || !dept) {
        return res.status(400).json({ message: 'Toon data and dept is required' });
    }

    const calc = new SuitsCalculator(JSON.stringify(toonData.data.cogsuits));

    try {
        const promoData = calc.getBestPathWeighted(dept);
        if (promoData) {
            return res.status(200).json(promoData);
        } else {
            return res.status(404).json({ message: 'Suit data not found for this toon' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.post('/get-garden', async (req, res) => {
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
            return res.status(404).json({ message: 'Flower data not found for this toon' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

export default router;