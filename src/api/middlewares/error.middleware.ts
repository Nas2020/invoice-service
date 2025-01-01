// src/api/middlewares/error.middleware.ts
import { Context, Next } from 'hono';
import { CustomEnv } from '../../types/common.types';

export async function errorMiddleware(c: Context<CustomEnv>, next: Next) {
    try {
        await next();
    } catch (error) {
        console.error('Error:', error);

        if (error instanceof Error) {
            return c.json({
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }, 500);
        }

        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
}