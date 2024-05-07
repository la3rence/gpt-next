import "./globals.css";
import Providers from "./provider";
import Script from "next/script";

export const metadata = {
  title: "ChatGPT",
  description: "LLM Playground",
  icons: {
    icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="50" fill="gray" /></svg>`,
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning={true}>
      <body className="mb-10">
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
      <Script
        async
        src="https://us.umami.is/script.js"
        data-website-id="abc83656-be0e-4dc0-8281-ce9f52c9faff"
      />
    </html>
  );
}
