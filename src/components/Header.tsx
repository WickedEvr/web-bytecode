import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Facebook, Instagram, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Portafolio', path: '/portafolio' },
    { name: 'Servicios', path: '/servicios' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white tracking-wider">
          BYTECODE
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-white hover:text-primary-cyan transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link to="/contacto" className="btn-cyan">
            Conectar
          </Link>
          <div className="flex items-center space-x-4 ml-4">
            <a href="#" className="text-white hover:text-primary-cyan">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-white hover:text-primary-cyan">
              <Instagram size={20} />
            </a>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={32} />
        </button>
      </div>

      {/* Mobile Burger Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-primary-cyan rounded-l-3xl md:hidden flex flex-col items-center justify-center"
          >
            <button
              className="absolute top-8 right-8 text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <ArrowLeft size={32} className="animate-pulse" />
            </button>

            <div className="flex flex-col items-center space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-3xl font-bold text-white uppercase tracking-widest"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/contacto"
                className="mt-8 border-2 border-white px-10 py-3 rounded-full text-white font-bold text-xl uppercase tracking-widest hover:bg-white hover:text-primary-cyan transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Conectar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
