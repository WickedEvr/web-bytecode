import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { FaWhatsapp } from 'react-icons/fa6';
import SpotlightText from "./SpotlightText";

const AltFooter: React.FC = () => {
  return (
    <div className="bg-transparent px-4 md:px-8 lg:px-12 font-sansation select-none">
      
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
        {/* --- NUEVO: Decorativo Fondo de Estrellas (Stardust) --- */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen"
          style={{
            backgroundImage: "url('/designs/stardust.png')",
            // 1. Le damos un tamaño fijo donde se vea nítida (ajusta este número)
            backgroundSize: '525px', 
            // 2. Le decimos que se repita para llenar el espacio vacío
            backgroundRepeat: 'repeat',
            backgroundPosition: 'top left',
          }}
        />
        
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

        {/* ========================================= */}
        {/* SECCIÓN SUPERIOR */}
        {/* ========================================= */}
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-10 mb-16">
          {/* Lado Izquierdo: Texto Principal */}
          <div className="flex-1 text-left">
            <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold leading-tight md:leading-[1.15]">
              <SpotlightText> Un clic para ti,
              <br />
              un salto para tu
              <br />
              marca. </SpotlightText>
            </h2>
          </div>

          {/* Lado Derecho: Botón CTA e Isotipo */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              to="/contacto"
              className="bg-[#06CFD6] hover:bg-[#0CA3C6] text-white font-bold text-lg md:text-2xl lg:text-3xl uppercase py-4 px-8 md:py-5 md:px-14 rounded-full shadow-[0_10px_30px_rgba(6,207,214,0.3)] hover:scale-105 transition-all duration-300"
            >
              CONECTAR
            </Link>
            <div className=" lg:block shrink-0 transform translate-y-11 md:translate-y-21 translate-x-15 md:translate-x-41">
              <div className="animate-float-logo hover:drop-shadow-[0_0_20px_rgba(6,207,214,0.9)] transition-all duration-300">
                <img
                  src="/designs/elemento_logo.svg"
                  alt="Bytecode Element"
                  className="w-11 h-auto object-contain opacity-90"
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

          {/* Contenedor inferior */}
          <div className="flex flex-col gap-6">

            {/* --- FILA 1: Contacto + Copyright --- */}
            <div className="flex flex-col lg:flex-row items-center lg:justify-between w-full gap-4 lg:gap-6 text-white font-normal text-base md:text-lg">
              {/* Contáctanos */}
              <span className="font-semibold text-xl md:text-2xl">
                Contáctanos
              </span>


              {/* 2. WhatsApp */}
              <a 

                href="https://wa.me/51936281137?text=%C2%A1Hola%2C%20equipo%20de%20Bytecode!%20Me%20gustar%C3%ADa%20cotizar%20el%20desarrollo%20de%20un%20software."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group outline-none"
              >

                <FaWhatsapp className="text-[#06CFD6] group-hover:scale-110 transition-transform duration-300 shrink-0" size={22} />
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300" aria-label="WhatsApp">
                  (+51) 936 281 137
                </span>
              </a>


              <a
                href="https://wa.me/51970199434?text=%C2%A1Hola%2C%20equipo%20de%20Bytecode!%20Me%20gustar%C3%ADa%20cotizar%20el%20desarrollo%20de%20un%20software."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group outline-none"
              >
                <FaWhatsapp className="text-[#06CFD6] group-hover:scale-110 transition-transform duration-300 shrink-0" size={22} />
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300" aria-label="WhatsApp">
                  (+51) 970 199 434
                </span>
              </a>


              {/* 3. Correo */}
              <a
                href="mailto:contacto@bytecode.com.pe?subject=Cotizaci%C3%B3n%20de%20desarrollo%20de%20software&body=%C2%A1Hola%2C%20equipo%20de%20Bytecode!%20Me%20gustar%C3%ADa%20cotizar%20el%20desarrollo%20de%20un%20software."
                className="flex items-center gap-3 group outline-none"
              >
                <Mail className="text-[#06CFD6] group-hover:scale-110 transition-transform duration-300 shrink-0" size={22} />
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300 break-all">
                  contacto@bytecode.com.pe
                </span>
              </a>

              {/* Copyright */}
              <div className="flex flex-col items-center lg:items-end gap-1 shrink-0">
                <span className="text-gray-300 text-sm md:text-base text-center lg:text-right">
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
          </div>
      </footer>
    </div>
  );
};

export default AltFooter;