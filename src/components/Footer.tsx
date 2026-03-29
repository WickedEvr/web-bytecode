import React from 'react';
import { Link } from 'react-router-dom';

const FONT = "'Sansation', sans-serif";

const Footer: React.FC = () => {
  return (
    <footer style={{ position: 'relative' }}>

      <div className="relative px-6 py-8" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto flex flex-col gap-4">

          {/* Fila única: Contáctanos | teléfono | email | copyright */}
          <div className="flex flex-row items-center justify-between gap-6 flex-wrap">

            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: '20px', lineHeight: '24px', color: '#FFFFFF', flexShrink: 0 }}>
              Contáctanos
            </span>

            <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
              <img src="/logos/wsp8.svg" alt="" aria-hidden="true" style={{ width: '22px', height: '22px' }} />
              <span style={{ fontFamily: FONT, fontWeight: 300, fontSize: '18px', lineHeight: '24px', color: '#FFFFFF' }}>
                (+51) 946 243 145
              </span>
            </div>

            <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
              <img src="/logos/correo1.svg" alt="" aria-hidden="true" style={{ width: '25px', height: '18px' }} />
              <span style={{ fontFamily: FONT, fontWeight: 300, fontSize: '18px', lineHeight: '24px', color: '#FFFFFF' }}>
                grupo@caplogistic.com.pe
              </span>
            </div>

            <div className="flex flex-col items-end" style={{ flexShrink: 0 }}>
              <p style={{ fontFamily: FONT, fontWeight: 300, fontSize: '16px', lineHeight: '22px', color: '#FFFFFF', textAlign: 'right' }}>
                © 2026 Bytecode. Todos los derechos reservados.
              </p>
              <p style={{ fontFamily: FONT, fontWeight: 300, fontSize: '13px', lineHeight: '17px', color: '#FFFFFF', textAlign: 'right' }}>
                Diseñado por Marco Román
              </p>
            </div>

          </div>

          {/* Fila inferior: Links centrados */}
          <div className="flex justify-center gap-8">
            <Link to="/condiciones" style={{ fontFamily: FONT, fontWeight: 300, fontSize: '18px', lineHeight: '24px', color: '#FFFFFF' }}
              className="hover:text-primary-cyan transition-colors">
              Condiciones
            </Link>
            <Link to="/privacidad" style={{ fontFamily: FONT, fontWeight: 300, fontSize: '18px', lineHeight: '24px', color: '#FFFFFF' }}
              className="hover:text-primary-cyan transition-colors">
              Privacidad
            </Link>
            <Link to="/reclamaciones" style={{ fontFamily: FONT, fontWeight: 300, fontSize: '18px', lineHeight: '24px', color: '#FFFFFF' }}
              className="hover:text-primary-cyan transition-colors">
              Libro de Reclamaciones
            </Link>
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;
