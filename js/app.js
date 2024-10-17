import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType, verifyKeyMiddleware } from 'discord-interactions';
import { getUserId } from './utils.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import cors from 'cors';
import WebSocket from 'ws';
import { getToken, storeToken } from './db/token.js';

const app = express();
const allowedOrigins = ['https://scouttoon.info', 'https://api.scouttoon.info'];

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

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    const { type, data } = req.body;
    
    // verification requests
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    const toon = await getToken(getUserId(req));

    // checking for commands
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;

        const cmd = app.commands.get(name); 
        try {
            return await cmd.execute(req, res, toon)
        } catch (error) {
            console.error(error);
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
                const result = await cmd.handleButton(customId, toon);

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

const server = app.listen(PORT, () => {
    console.log('Listening on port', PORT);
  });

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log("Client connected.");

    ws.on('message', async (message) => {
        const { userId, data } = JSON.parse(message);

        if (!userId || !data) {
            ws.send(JSON.stringify({ error: 'User ID and data are required.' }));
            return;
        }

        try {
            await storeToken(userId, JSON.stringify(data));
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
