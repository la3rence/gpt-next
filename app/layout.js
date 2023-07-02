import "./globals.css";
import Providers from "./provider";

export const metadata = {
  title: "ChatGPT",
  description: "ChatGPT",
  icons: {
    icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="50" fill="gray" /></svg>`,
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
    </html>
  );
}
