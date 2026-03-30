import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { FaWhatsapp } from 'react-icons/fa6';

const AltFooter: React.FC = () => {
  return (
    <div className="bg-[#024F79] pt-10 px-4 md:px-8 lg:px-12 font-sansation select-none">
      
      {/* 1. INYECTAMOS LA ANIMACIÓN FLOTANTE */}
      <style>
        {`
          @keyframes float-logo {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
          }
          .animate-float-logo {
            animation: float-logo 4s ease-in-out infinite;
          }
        `}
      </style>

      <footer className="bg-gradient-to-t from-[#022131] to-[#010b10] text-white rounded-t-[40px] md:rounded-t-[80px] pt-20 pb-12 px-8 md:px-16 lg:px-24 relative overflow-hidden flex flex-col mt-auto mx-auto w-full max-w-[1920px]">
        {/* Decorativo Fondo Footer (Geométrico) */}
        <img
          src="/desings/elemento_footer.svg"
          alt=""
          className="absolute top-[5%] left-[-1.1%] w-42 md:w-62 opacity-60 pointer-events-none object-contain z-0"
          style={{
            filter:
              "brightness(0) saturate(100%) invert(20%) sepia(54%) saturate(2973%) hue-rotate(183deg) brightness(97%) contrast(98%)",
          }}
        />

        {/* ========================================= */}
        {/* SECCIÓN SUPERIOR */}
        {/* ========================================= */}
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 mb-16">
          {/* Lado Izquierdo: Texto Principal */}
          <div className="flex-1 text-left">
            <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold leading-tight md:leading-[1.15] pl-15">
              Un clic para ti,
              <br />
              un salto para tu
              <br />
              marca.
            </h2>
          </div>

          {/* Lado Derecho: Botón CTA e Isotipo */}
          <div className="flex items-center gap-4 sm:gap-8 mt-6 lg:mt-0 ">
            <Link
              to="/contacto"
              className="bg-gradient-to-r from-[#06CFD6] to-[#026B9B] text-white font-bold text-xl md:text-3xl uppercase py-5 px-10 md:px-16 rounded-full shadow-[0_10px_30px_rgba(6,207,214,0.3)] hover:scale-105 transition-transform duration-300 lg:mr-16"
            >
              CONECTAR
            </Link>
            <div className="shrink-0 transform translate-y-17 md:translate-y-21 translate-x-28 md:translate-x-32">
              {/* Contenedor Animado (Flote continuo + Glow al pasar el mouse) */}
              <div className="animate-float-logo hover:drop-shadow-[0_0_20px_rgba(6,207,214,0.9)] transition-all duration-300">
                <img
                  src="/desings/elemento_logo.svg" 
                  alt="Bytecode Element"
                  className="w-8 md:w-11 h-auto object-contain opacity-90"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(68%) sepia(35%) saturate(3821%) hue-rotate(143deg) brightness(96%) contrast(94%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* SECCIÓN INFERIOR (Línea + Textos) */}
        {/* ========================================= */}
          {/* Línea Separadora */}
          <div className="w-full border-t border-white mb-8" />

          {/* Contenedor que da el GAP VERTICAL (gap-10) entre la Fila 1 y la Fila 2 */}
          <div className="flex flex-col gap-2">
            
            {/* --- FILA 1: Distribución Perfecta Horizontal --- */}
            {/* Al usar lg:flex-row justify-between, estos 4 bloques toman distancias iguales */}
            <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-6 text-white font-normal text-base md:text-lg">
              {/* 1. Contáctanos */}
              <span className="font-semibold text-xl md:text-2xl whitespace-nowrap">
                Contáctanos
              </span>

              {/* 2. WhatsApp */}
              <div className="flex items-center gap-3">
                <FaWhatsapp className="text-[#06CFD6]" size={22} /> 
                <span className="text-gray-300 whitespace-nowrap" aria-label="WhatsApp">
                  (+51) 936 281 147
                </span>
              </div>

              <div className="flex items-center gap-3">
                <FaWhatsapp className="text-[#06CFD6]" size={22} /> 
                <span className="text-gray-300 whitespace-nowrap" aria-label="WhatsApp">
                  (+51) 970 199 434
                </span>
              </div>

              {/* 3. Correo */}
              <div className="flex items-center gap-3">
                <Mail className="text-[#06CFD6]" size={22} />
                <span className="text-gray-300 whitespace-nowrap">
                  contacto@bytecode.com.pe
                </span>
              </div>

              {/* 4. BLOQUE DERECHO AGRUPADO (Copyright + Diseñador) */}
              <div className="flex flex-col items-center lg:items-end gap-1 shrink-0 mt-[19px]" >
                <span className="text-gray-300 whitespace-nowrap">
                  © 2026 Bytecode. Todos los derechos reservados.
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Diseñado por Marco Román
                </span>
              </div>
            </div>

            {/* --- FILA 2: Enlaces Legales Centrados --- */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-gray-400 text-sm md:text-base font-normal w-full">
              <Link to="/condiciones" className="hover:text-[#06CFD6] transition-colors whitespace-nowrap">Condiciones</Link>
              <Link to="/privacidad" className="hover:text-[#06CFD6] transition-colors whitespace-nowrap">Privacidad</Link>
              <Link to="/reclamaciones" className="hover:text-[#06CFD6] transition-colors whitespace-nowrap">Libro de Reclamaciones</Link>
            </div>
          </div>
      </footer>
    </div>
  );
};

export default AltFooter;
