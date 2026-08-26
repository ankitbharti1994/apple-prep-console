import type { APIRoute } from 'astro';
import { json, planPayload } from '~/lib/api';
export const GET: APIRoute = async () => json(await planPayload());
