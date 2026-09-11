import type { ReactNode } from 'react';
import Header from '../Header.tsx';
import Footer from '../Footer.tsx';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
