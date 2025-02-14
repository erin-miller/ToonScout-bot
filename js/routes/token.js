import express from 'express';
import { storeCookieToken, getCookieToken } from '../db/tokenData/tokenService.js';

const router = express.Router();

router.post('/store-token', async (req, res) => {
    const { userId, accessToken, expiresAt } = req.body;
    try {
        const modifiedCount = await storeCookieToken(userId, accessToken, expiresAt);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + (expiresAt * 1000)),
            sameSite: 'Strict',
            domain: process.env.COOKIE_DOMAIN,
        });

        res.status(200).json({ message: 'Token stored successfully', modifiedCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to store token', error: error.message });
    }
});

router.get('/get-token', async (req, res) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token not found in cookies' });
    }

    try {
        const tokenData = await getCookieToken(accessToken);
        if (tokenData) {
            res.status(200).json(tokenData);
        } else {
            res.status(404).json({ message: 'Token not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve token', error: error.message });
    }
});

export default router;