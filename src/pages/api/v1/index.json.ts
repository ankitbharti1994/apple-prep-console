import type { APIRoute } from 'astro';
import { json, manifest } from '~/lib/api';
export const GET: APIRoute = async () => json(await manifest());
