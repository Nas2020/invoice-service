// src/api/middlewares/logger.middleware.ts
import { Context, Next } from 'hono';
import { CustomEnv } from '../../types/common.types';

export async function loggerMiddleware(c: Context<CustomEnv>, next: Next) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${c.req.method} ${c.req.url} - ${ms}ms`);
}