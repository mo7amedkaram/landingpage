import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { PixelComponent } from "@/components/PixelComponent";
import { FloatingCTA } from "@/components/FloatingCTA";
import { getSiteContent } from "@/lib/supabase";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "دورة الإسعافات الأولية | احترف مهارات إنقاذ الحياة",
  description: "تدريب عملي مكثف لمدة 72 ساعة يؤهلك للتعامل مع الطوارئ الطبية بثقة. تعلم CPR، التعامل مع الإصابات، والمهارات التمريضية الأساسية.",
  keywords: ["إسعافات أولية", "دورة تمريض", "CPR", "إنقاذ حياة", "طوارئ طبية"],
  openGraph: {
    title: "دورة الإسعافات الأولية | احترف مهارات إنقاذ الحياة",
    description: "تدريب عملي مكثف لمدة 72 ساعة يؤهلك للتعامل مع الطوارئ الطبية بثقة.",
    type: "website",
    locale: "ar_EG",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch pixel settings from CMS
  let pixels = { facebook: '', tiktok: '', snapchat: '' };
  let buttonColor = '#ef4444';
  try {
    const content = await getSiteContent();
    pixels = content.pixels;
    // Use theme's heroCta color for the floating CTA
    buttonColor = content.theme?.buttons?.heroCta || '#ef4444';
  } catch (error) {
    console.error("Failed to fetch content:", error);
  }

  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className={`${cairo.className} antialiased`} suppressHydrationWarning>
        <PixelComponent
          facebookPixelId={pixels.facebook || null}
          tiktokPixelId={pixels.tiktok || null}
          snapchatPixelId={pixels.snapchat || null}
        />
        {children}
        <FloatingCTA buttonColor={buttonColor} />
      </body>
    </html>
  );
}
