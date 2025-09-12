import './globals.css';

export const metadata = {
  title: 'YouTube Live',
  description: '24/7 YouTube streamer',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
