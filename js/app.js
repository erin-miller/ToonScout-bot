import 'dotenv/config';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import WebSocket from 'ws';
import { InteractionType, InteractionResponseType, verifyKeyMiddleware } from 'discord-interactions';
import { readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { getUserId, validateUser } from './utils.js';
import { storeScoutToken } from './db/scoutData/scoutService.js';
import { storeCookieToken, getCookieToken } from './db/tokenData/tokenService.js';
import { FishCalculator, SuitsCalculator } from 'toonapi-calculator';

const app = express();
const allowedOrigins = ['https://scouttoon.info', 'https://api.scouttoon.info', "https://scoutsite-test.vercel.app/"];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Add any methods you expect to use
    credentials: true, // Include cookies or authorization headers
}));

// app.use(cors({
//     origin: '*', // Allow all origins
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Add methods you expect to use
//     credentials: true, // Include cookies or authorization headers if needed
// }));

// parse req as JSON
app.use(express.json())

// Get port, or default to 3000
const PORT = 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.commands = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandsPath = path.resolve(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileUrl = pathToFileURL(filePath); // Convert to a file URL
    const command = await import(fileUrl.href); // Use the URL with import
    if ('data' in command && 'execute' in command) {
        app.commands.set(command.data.name, command)
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const isProduction = process.env.NODE_ENV === 'production';
const PUBLIC_KEY = isProduction ? process.env.PUBLIC_KEY_PROD : process.env.PUBLIC_KEY_DEV;

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async function (req, res) {
    const { type, data } = req.body;
    
    // verification requests
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    const targetUser = req.body.data.options?.find(option => option.name === 'user')?.value;
    const targetToon = await validateUser(targetUser, res);
    if (!targetToon && targetUser) {
        return;
    }
    const id = targetToon ? targetUser : getUserId(req); 
    // checking for commands
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;

        const cmd = app.commands.get(name); 
        try {
            return await cmd.execute(req, res, id)
        } catch (error) {
            console.error("App command error:", error);
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: 'There was an error while executing this command!', flags: 64 }
            });
        }            
    }

    // handle button interactions
    if (type == InteractionType.MESSAGE_COMPONENT) {
        const customId = data.custom_id;

        const cmd = app.commands.get(customId.split(/[-:]/)[0]);

        if (cmd && cmd.handleButton) {
            try {
                const result = await cmd.handleButton(req, customId);

                return res.send({
                    type: InteractionResponseType.UPDATE_MESSAGE,
                    data: {
                        embeds: [result.embed],
                        components: [result.row],
                    }
                })
            }
            catch (error) {
                console.error(error);
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: 'Button interaction error. Try again in a few moments.', flags: 64 },
                });
            }
        }
    }
});


app.use(cookieParser());
/**
 * ------- TOKEN DATA -------
 */
app.post('/store-token', async (req, res) => {
    const { userId, accessToken, expiresAt } = req.body;
    try {
        const modifiedCount = await storeCookieToken(userId, accessToken, expiresAt);
        // Set HttpOnly cookie with the access token, secure, and expiry settings
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now()+(expiresAt*1000)),
            sameSite: 'Strict',
	    domain: '.scouttoon.info',
        });
	
        res.status(200).json({ message: 'Token stored successfully', modifiedCount });
    } catch (error) {
	console.error(error);
        res.status(500).json({ message: 'Failed to store token', error: error.message });
    }
});

app.get('/get-token', async (req, res) => {
    // Access token will be in the cookies
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

/**
 * ------- UTILITY -------
 */

app.post('/get-fish', async (req, res) => {
    const { toonData } = req.body;

    if (!toonData) {
        return res.status(400).json({ message: 'Toon data is required' });
    }

    const calc = new FishCalculator(JSON.stringify(toonData.fish));

    try {
        const fishData = calc.sortBestRarity();
        
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

app.post('/get-promo', async (req, res) => {
    const { toonData, dept } = req.body;

    if (!toonData || !dept) {
        return res.status(400).json({ message: 'Toon data and dept is required' });
    }

    const calc = new SuitsCalculator(JSON.stringify(toonData.cogsuits));
    
    try {
        const promoData = calc.getBestPathWeighted(dept);

        if (promoData) {
            return res.status(200).json(promoData)
        } else {
            return res.status(404).json({ message: 'Suit data not found for this toon'});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message })
    }
});


app.use(express.json());
/**
 * ------- SCOUT DATA -------
 */
const server = app.listen(PORT, () => {
    console.log('Listening on port', PORT);
  });

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const { userId, data } = JSON.parse(message);
        
	if (!userId || !data) {
            ws.send(JSON.stringify({ error: 'User ID and data are required.' }));
            return;
        }
	
	if (data.event !== 'all') {
            ws.send(JSON.stringify({ message: 'Event is not "all", skipping data entry.' }));
            return;
        }

        try {
            await storeScoutToken(userId, JSON.stringify(data));
            ws.send(JSON.stringify({ message: 'Data saved successfully.' }));
        } catch (error) {
            console.error('Error saving data:', error);
            ws.send(JSON.stringify({ error: 'Internal server error.' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
})

process.on('SIGINT', () => {
    console.log("Shutting down...");
    process.exit();
})
