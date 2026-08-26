import type { APIRoute } from 'astro';
import { json, problemsPayload } from '~/lib/api';
export const GET: APIRoute = async () => json(problemsPayload());
