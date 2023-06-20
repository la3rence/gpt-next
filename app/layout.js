import "./globals.css";
import Providers from "./provider";

export const metadata = {
  title: "ChatGPT●",
  description: "ChatGPT",
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning={true}>
      <body className="mb-10">
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
