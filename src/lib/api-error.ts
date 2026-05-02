import { NextResponse } from 'next/server';

type ErrorWithDetails = Error & {
  code?: unknown;
  errno?: unknown;
  sqlMessage?: unknown;
};

function isErrorWithDetails(error: unknown): error is ErrorWithDetails {
  return error instanceof Error;
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (!isErrorWithDetails(error)) {
    return fallback;
  }

  const details = [
    typeof error.code === 'string' ? error.code : null,
    typeof error.sqlMessage === 'string' ? error.sqlMessage : error.message,
  ].filter(Boolean);

  return details.length > 0 ? details.join(': ') : fallback;
}

export function internalServerError(error: unknown, fallback: string) {
  const message = getErrorMessage(error, fallback);

  console.error(fallback, error);

  return NextResponse.json(
    {
      message,
    },
    { status: 500 }
  );
}
