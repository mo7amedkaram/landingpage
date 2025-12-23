import { getSiteContent } from '@/lib/supabase';
import { DynamicLandingPage } from '@/components/DynamicLandingPage';

// Force dynamic rendering to always get fresh content
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const content = await getSiteContent();

  return <DynamicLandingPage content={content} />;
}
