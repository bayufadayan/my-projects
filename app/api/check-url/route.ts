import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      // Abort after 10 seconds
      signal: AbortSignal.timeout(10_000),
      headers: { 'User-Agent': 'project-shelf-status-checker/1.0' },
    });

    const active = res.ok; // true for 200-299
    return NextResponse.json({ active, status: res.status });
  } catch {
    return NextResponse.json({ active: false, status: null });
  }
}
