import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DompetKu - Keuangan Pribadi',
  description: 'Aplikasi manajemen keuangan pribadi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
