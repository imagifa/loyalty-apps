import "./globals.css";

export const metadata = {
  title: 'Loyalty Apps - Mutif Corp',
  description: 'Sistem Loyalty & Referral Professional',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 min-h-screen" suppressHydrationWarning>
        <main className="mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
