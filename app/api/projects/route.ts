import { NextResponse } from 'next/server';
import { projects } from '@/lib/projects';

// Mock backend: serves the hardcoded project metadata.
// Swap this for a real database later without touching the frontend.
export async function GET() {
  return NextResponse.json(projects);
}
