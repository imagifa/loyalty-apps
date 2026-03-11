import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning={true}>
        <div className="min-h-screen bg-gray-100 text-slate-900">
          {children}
        </div>
      </body>
    </html>
  );
}