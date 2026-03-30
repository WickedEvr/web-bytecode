// MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Importamos Outlet
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, #000000 29.33%, rgba(12,163,198,0.17) 100%), #000000' }}>
      <Header />
      <main className="flex-grow">
        {/* Aquí React Router inyectará mágicamente la página correspondiente */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
