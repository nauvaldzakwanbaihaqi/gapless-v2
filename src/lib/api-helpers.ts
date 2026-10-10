import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Standard Auth Guard Helper for API Route Handlers.
 * Returns the authenticated user or a pre-configured 401 JSON response.
 */
export async function requireAuthUser(): Promise<
  | { user: AuthenticatedUser; errorResponse: null }
  | { user: null; errorResponse: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized', message: 'Autentikasi diperlukan untuk mengakses layanan ini.' },
        { status: 401 }
      ),
    };
  }

  return {
    user: session.user as AuthenticatedUser,
    errorResponse: null,
  };
}

/**
 * Standard JSON Success Response Formatter
 */
export function apiSuccess<T extends Record<string, unknown>>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, ...data }, { status });
}

/**
 * Standard JSON Error Response Formatter
 */
export function apiError(message: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}
