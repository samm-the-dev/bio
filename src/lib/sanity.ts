import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'wqqh5015',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2025-03-01',
});
