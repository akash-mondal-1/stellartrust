import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

if (dsn) {
  Sentry.init({
    dsn: dsn,
    tracesSampleRate: 1.0,
    debug: false,
  });
}

export const captureException = (error: any) => {
  console.error('[Sentry Event Caught]:', error);
  if (dsn) {
    Sentry.captureException(error);
  }
};
