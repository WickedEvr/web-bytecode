import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-gray-400 py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-white text-2xl md:text-3xl font-medium mb-8 text-center">
          Un clic para ti, un salto para tu marca.
        </h2>
        
        <Link to="/contacto" className="btn-cyan mb-12">
          Conectar
        </Link>
        
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center border-t border-gray-800 pt-12 space-y-8 md:space-y-0">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Phone size={20} className="text-primary-cyan" />
              <span>+51 987 654 321</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-primary-cyan" />
              <span>contacto@bytecode.com</span>
            </div>
          </div>
          
          {/* Copyright & Info */}
          <div className="text-sm">
            <p className="text-white font-bold mb-2 uppercase tracking-widest">BYTECODE</p>
            <p>© 2026 Todos los derechos reservados.</p>
          </div>
          
          {/* Links */}
          <div className="flex flex-col space-y-2 text-sm uppercase tracking-wider">
            <Link to="/condiciones" className="hover:text-primary-cyan">Condiciones</Link>
            <Link to="/privacidad" className="hover:text-primary-cyan">Privacidad</Link>
            <Link to="/reclamaciones" className="hover:text-primary-cyan">Libro de Reclamaciones</Link>
          </div>
        </div>
        
        <div className="w-full text-right mt-12 text-xs opacity-50">
          Diseñado por Marco Román
        </div>
      </div>
    </footer>
  );
};

export default Footer;
