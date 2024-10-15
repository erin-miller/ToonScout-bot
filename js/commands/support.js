import { SlashCommandBuilder } from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';

export const data = new SlashCommandBuilder()
        .setName('support')
        .setDescription('Get a link to our support server.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2])

export async function execute(req, res, toon) {
    const invite = 'https://discord.gg/Qb929SrdRP';
    
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            embeds: `Need help or have feedback? Come speak with at us on our [support server](${invite})!`,
        }
    });
}