import type { APIRoute } from 'astro';
import { json, openItemsPayload } from '~/lib/api';
export const GET: APIRoute = async () => json(await openItemsPayload());
