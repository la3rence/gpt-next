import "./globals.css";
import Providers from "./provider";
import Script from "next/script";

export const metadata = {
  title: "ChatGPT",
  description: "ChatGPT",
  icons: {
    icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="50" fill="gray" /></svg>`,
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning={true}>
      <body className="mb-10 color-transition dark:dark-color-transition">
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
      <Script
        async
        src="https://analytics.lawrenceli.me/script.js"
        data-website-id="50f890d5-49f1-43f0-91ca-f0a68a83c4f5"
      />
    </html>
  );
}
