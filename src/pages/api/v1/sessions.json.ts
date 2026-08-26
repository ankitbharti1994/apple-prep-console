import type { APIRoute } from 'astro';
import { json, sessionsPayload } from '~/lib/api';
export const GET: APIRoute = async () => json(await sessionsPayload());
