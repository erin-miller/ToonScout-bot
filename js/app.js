import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType, verifyKeyMiddleware } from 'discord-interactions';
import { getUser } from './utils.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
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
    const user = getUser(req);
    
    // verification requests
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }
    
    // checking for commands
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;
        console.log(`USER [ ${user} ] RAN [ ${name} ]`);
        const cmd = app.commands.get(name); 
        try {
            return await cmd.execute(req, res)
        } catch (error) {
            console.error(error);
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: 'There was an error while executing this command!', ephemeral: true }
            });
        }            
    }

    // handle button interactions
    if (type == InteractionType.MESSAGE_COMPONENT) {
        const customId = data.custom_id;

        console.log(`USER [ ${user} ] CLICKED [ ${customId} ]`);

        const cmd = app.commands.get(customId.split(/[-:]/)[0]);

        if (cmd && cmd.handleButton) {
            try {
                console.log(`Running ${customId} button...`);
                const result = await cmd.handleButton(customId);

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
                    data: { content: 'Button interaction error.' },
                });
            }
        }
    }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

process.on('SIGINT', () => {
    console.log("Shutting down...");
    process.exit();
})
