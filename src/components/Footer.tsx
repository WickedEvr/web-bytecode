import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa6';
import { Mail } from "lucide-react";
import SpotlightText from "./SpotlightText";

const Footer: React.FC = () => {
  return (
    <div className="bg-transparent font-sansation select-none"> 
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

      <footer style={{ position: 'relative' }}>
        {/* Decorativo Fondo Footer (Geométrico) */}
        <img
          src="/designs/elemento_footer.svg"
          alt=""
          className="absolute top-[35%] sm:top-[20%] md:top-[5%] left-[-1.1%] w-32 sm:w-42 md:w-62 opacity-60 pointer-events-none object-contain z-0"
          style={{
            filter:
              "brightness(0) saturate(100%) invert(20%) sepia(54%) saturate(2973%) hue-rotate(183deg) brightness(97%) contrast(98%)",
          }}
        />

        {/* Línea Separadora */}
        <div className="border-t border-white mb-16 w-[86.6%] mx-auto" />

        {/* ========================================= */}
        {/* SECCIÓN SUPERIOR */}
        {/* ========================================= */}
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 mb-16">
          
          {/* Lado Izquierdo: Texto Principal */}
          <div className="text-center lg:text-left">
            <h2 className="pb-[1.25em] md:pb-[1.15em] lg:pb-0 text-3xl md:text-5xl lg:text-5xl font-bold leading-tight md:leading-[1.15]">
              <SpotlightText>
                Un clic para ti,
                <br />
                un salto para tu
                <br className="hidden lg:block" />
                <span className="lg:hidden"> </span>
                marca.
              </SpotlightText>
            </h2>
          </div>

          <div className="flex items-center -mt-5 mb-5 md:-mt-8 md:mb-8 lg:mt-0 lg:mb-0">
            <Link
              to="/contacto"
              className="bg-[#06CFD6] hover:bg-[#0CA3C6] text-white font-bold text-lg md:text-2xl lg:text-3xl py-4 px-16 md:py-5 md:px-24 lg:px-28 xl:px-20 2xl:px-48 rounded-[30px] shadow-[0_10px_30px_rgba(6,207,214,0.3)] hover:scale-105 transition-all duration-300"
            >
              Conectar
            </Link>
          </div>

          {/* Isotipo */}
          <div className="absolute right-8.5 md:right-17 lg:right-[6%] xl:right-25 2xl:-right-31 lg:block shrink-0 transform translate-y-31 md:translate-y-37 lg:translate-y-21 transition-all duration-500">
            <div className="animate-float-logo hover:drop-shadow-[0_0_20px_rgba(6,207,214,0.9)] transition-all duration-300">
              <img
                src="/designs/elemento_logo.svg"
                alt="Bytecode Element"
                draggable={false}
                className="w-8 md:w-9 lg:w-11 h-auto object-contain opacity-90 transition-all duration-300"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(68%) sepia(35%) saturate(3821%) hue-rotate(143deg) brightness(96%) contrast(94%)",
                }}
              />
            </div>
          </div>
        </div>
        
        {/* ========================================= */}
        {/* SECCIÓN INFERIOR (Línea + Textos) */}
        {/* ========================================= */}

        {/* Línea Separadora */}
        <div className="border-t border-white mb-8 md:mb-1 w-[86.6%] mx-auto" />

        <div className="relative mx-auto w-full max-w-[1700px] px-6 md:px-12 pt-0 pb-8 md:py-8" style={{ zIndex: 1 }}>
          {/* Contenedor inferior */}
          <div className="flex flex-col gap-8 lg:gap-9">
            {/* --- FILA 1: Contacto --- */}
            <div className="flex flex-col lg:flex-row lg:flex-wrap 2xl:flex-nowrap items-center lg:justify-center 2xl:justify-between w-full gap-5 lg:gap-x-10 lg:gap-y-6 2xl:gap-6 text-white font-normal text-base md:text-lg">
              <div className="flex flex-col lg:flex-row lg:flex-wrap 2xl:flex-nowrap items-center justify-center gap-5 lg:gap-x-10 lg:gap-y-6 xl:gap-27 2xl:gap-29">
                <span className="font-semibold text-xl md:text-2xl whitespace-nowrap">
                  Contáctanos
                </span>

                {/* WhatsApp 1 */}
                <a 
                  href="https://wa.me/51936281137?text=%C2%A1Hola%2C%20equipo%20de%20Bytecode!%20Me%20gustar%C3%ADa%20cotizar%20el%20desarrollo%20de%20un%20software."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group outline-none"
                >
                  <FaWhatsapp className="text-[#06CFD6] group-hover:scale-110 transition-transform duration-300 shrink-0" size={22} />
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300 whitespace-nowrap" aria-label="WhatsApp">
                    (+51) 936 281 137
                  </span>
                </a>

                {/* WhatsApp 2 */}
                <a
                  href="https://wa.me/51970199434?text=%C2%A1Hola%2C%20equipo%20de%20Bytecode!%20Me%20gustar%C3%ADa%20cotizar%20el%20desarrollo%20de%20un%20software."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group outline-none"
                >
                  <FaWhatsapp className="text-[#06CFD6] group-hover:scale-110 transition-transform duration-300 shrink-0" size={22} />
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300 whitespace-nowrap" aria-label="WhatsApp">
                    (+51) 970 199 434
                  </span>
                </a>

                {/* Correo */}
                <a
                  href="mailto:contacto@bytecode.com.pe?subject=Cotizaci%C3%B3n%20de%20desarrollo%20de%20software&body=%C2%A1Hola%2C%20equipo%20de%20Bytecode!%20Me%20gustar%C3%ADa%20cotizar%20el%20desarrollo%20de%20un%20software."
                  className="flex items-center gap-3 group outline-none"
                >
                  <Mail className="text-[#06CFD6] group-hover:scale-110 transition-transform duration-300 shrink-0" size={22} />
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                    contacto@bytecode.com.pe
                  </span>
                </a>
              </div>

              {/* Copyright (Solo visible en Escritorio Gigante 2XL) */}
              <div className="hidden 2xl:flex flex-col items-end gap-1 shrink-0">
                <span className="text-gray-300 text-base text-right whitespace-nowrap">
                  © 2026 Bytecode. Todos los derechos reservados.
                </span>
              </div>
            </div>

            {/* --- FILA 2: Enlaces Legales --- */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-14 text-gray-400 text-sm md:text-base font-normal w-full">
              <Link to="/condiciones" className="hover:text-[#06CFD6] transition-colors">Condiciones</Link>
              <Link to="/privacidad" className="hover:text-[#06CFD6] transition-colors">Privacidad</Link>
              <Link to="/reclamaciones" className="hover:text-[#06CFD6] transition-colors">Libro de Reclamaciones</Link>
            </div>

            {/* --- FILA 3: Copyright Móvil/Tablet/Laptop --- */}
            <div className="flex 2xl:hidden w-full justify-center mt-2">
              <span className="text-gray-300 text-sm md:text-base text-center">
                © 2026 Bytecode. Todos los derechos reservados.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;