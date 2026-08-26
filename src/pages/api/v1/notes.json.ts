import type { APIRoute } from 'astro';
import { json, notesPayload } from '~/lib/api';
export const GET: APIRoute = async () => json(await notesPayload());
