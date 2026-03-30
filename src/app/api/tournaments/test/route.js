import { NextResponse } from "next/server";

// Test endpoint to verify environment variables
export async function GET() {
  const diagnostics = {
    CHALLONGE_API_KEY_present: !!process.env.CHALLONGE_API_KEY,
    CHALLONGE_API_KEY_length: process.env.CHALLONGE_API_KEY?.length || 0,
    CHALLONGE_API_KEY_prefix: process.env.CHALLONGE_API_KEY?.substring(0, 8) || 'missing',
    CHALLONGE_USERNAME: process.env.CHALLONGE_USERNAME || 'missing',
    NEXT_PUBLIC_CHALLONGE_USERNAME: process.env.NEXT_PUBLIC_CHALLONGE_USERNAME || 'missing',
    NODE_ENV: process.env.NODE_ENV,
  };

  // Test actual API call
  const CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY;
  const CHALLONGE_API_BASE = 'https://api.challonge.com/v1';

  const params = new URLSearchParams({
    api_key: CHALLONGE_API_KEY,
  });

  const url = `${CHALLONGE_API_BASE}/tournaments.json?${params}`;

  try {
    const response = await fetch(url);
    const responseText = await response.text();

    return NextResponse.json({
      diagnostics,
      test_fetch: {
        url_length: url.length,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        response_preview: responseText.substring(0, 200),
        response_length: responseText.length
      }
    });
  } catch (error) {
    return NextResponse.json({
      diagnostics,
      test_fetch: {
        error: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
