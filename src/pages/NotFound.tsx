// ✅ NotFound.tsx — Fix 3: Página 404 con link al inicio
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="bg-space min-h-screen flex items-center justify-center font-sansation">
      <div className="text-center space-y-6 px-6">
        <h1 className="text-6xl font-bold text-primary-cyan">404</h1>
        <p className="text-2xl text-white font-semibold">Página no encontrada</p>
        <Link to="/" className="btn-cyan inline-block mt-4">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
