import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["500", "600", "700"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  // metadataBase: new URL('https://example.com'),
  icons: {
    icon:  "/logo.svg"
  },
  title: "Loopin"
  // description:
  //   "The hangout spot for your friend group. Stories that vanish, loops with your people, and a profile that's actually yours.",
};

export const viewport: Viewport = {
  themeColor: "#121020",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applied before paint/hydration so there's no flash of the wrong
            theme and no hydration mismatch — ThemeProvider's own effect
            runs after hydration, which is too late to avoid the flash. 
            NOTE: keep in sync with apply() in lib/theme.tsx */
        }
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var mode = localStorage.getItem('loopin.theme') || 'system';

                  var isSystem   = mode === 'system' || mode === 'system-contrast';
                  var isContrast = mode.indexOf('-contrast') !== -1;
                  var isDark     = mode === 'dark' || mode === 'dark-contrast';

                  var dark = isDark || (isSystem &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches);

                  var root = document.documentElement;
                  root.classList.toggle('dark', dark);
                  root.classList.toggle('high-contrast', isContrast);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${space.variable} ${mono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
