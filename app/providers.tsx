'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: false, // We'll handle pageviews manually in Next.js
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Track pageview on mount and route changes
    posthog.capture('$pageview');
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
