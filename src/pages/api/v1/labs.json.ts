import type { APIRoute } from 'astro';
import { json, labsPayload } from '~/lib/api';
export const GET: APIRoute = async () => json(await labsPayload());
