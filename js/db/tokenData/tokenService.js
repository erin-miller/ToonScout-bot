import { connectToDatabase } from './tokenDB.js';

export async function storeToken(userId, accessToken, expiresAt) {
    const collection = await connectToDatabase();

    try {
        const result = await collection.updateOne(
            { userId: userId },
            { 
                $set: { 
                    accessToken: accessToken, 
                    expiresAt: new Date(expiresAt),
                } 
            },
            { upsert: true }
        );
        return result.modifiedCount;
    } catch (error) {
        console.error('Error storing token:', error.message);
        throw error;
    }
}

// Get the token by the accessToken (which is in the cookie)
export async function getToken(accessToken) {
    const collection = await connectToDatabase();

    try {
        const user = await collection.findOne({ accessToken: accessToken });
        if (user) {
            const userId = user.userId;
            const expiresAt = new Date(user.expiresAt);
            return { userId, expiresAt };  // Return userId and expiry
        }
        return null;
    } catch (error) {
        console.error('Error retrieving token:', error.message);
        throw error;
    }
}