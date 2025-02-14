import { getScoutToken } from '../db/scoutData/scoutService.js';
import { InteractionResponseType } from 'discord-interactions';

export function getUserId(req) {
    const { user: direct, member } = req.body;
    return direct ? direct.id : member.user.id;
}

export async function validateUser(targetUser, res) {
    if (targetUser) {
        const targetToon = await getScoutToken(targetUser);

        if (!targetToon || targetToon.hidden) {
            await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `That user has not connected to ToonScout.`,
                    flags: 64
                }
            });
            return null;
        }

        return targetToon;
    }

    return null;
}