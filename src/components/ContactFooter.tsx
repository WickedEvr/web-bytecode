// src/components/ContactFooter.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';

const ContactFooter: React.FC = () => {
    return (
        <footer className="bg-[#060C1D] text-white py-12 px-8 md:px-16 relative overflow-hidden flex flex-col mt-auto shadow-[0_-20px_60px_rgba(0,0,0,0.4)] font-sansation">
        
        {/* Decorativo Fondo Footer */}
        <img 
            src="/desings/elemento_footer.svg" 
            alt="" 
            className="absolute top-0 left-0 w-full md:w-[60%] h-full object-cover md:object-contain object-left opacity-30 pointer-events-none"
        />

        {/* Barra de Contacto e Información Legal */}
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            
            {/* Contáctanos */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <span className="font-bold text-xl md:text-2xl text-white">Contáctanos</span>
            <div className="flex flex-col sm:flex-row gap-6">
                <a href="tel:+15551234567" className="flex items-center gap-3 text-white/80 hover:text-[#06CFD6] transition-colors text-lg">
                <div className="bg-[#06CFD6]/10 p-2 rounded-full">
                    <Phone size={20} className="text-[#06CFD6]" />
                </div>
                <span>+1 (555) 123-4567</span>
                </a>
                <a href="mailto:hola@bytecode.dev" className="flex items-center gap-3 text-white/80 hover:text-[#06CFD6] transition-colors text-lg">
                <div className="bg-[#06CFD6]/10 p-2 rounded-full">
                    <Mail size={20} className="text-[#06CFD6]" />
                </div>
                <span>hola@bytecode.dev</span>
                </a>
            </div>
            </div>

            {/* Copyright y Enlaces */}
            <div className="flex flex-col xl:flex-row items-center gap-6 xl:gap-10 text-sm md:text-base text-white/60">
            <p className="text-center">© {new Date().getFullYear()} Bytecode. Todos los derechos reservados.</p>
            <div className="flex flex-wrap justify-center gap-6 font-medium">
                <Link to="/condiciones" className="hover:text-[#06CFD6] transition-colors">Condiciones</Link>
                <Link to="/privacidad" className="hover:text-[#06CFD6] transition-colors">Privacidad</Link>
                <Link to="/reclamaciones" className="hover:text-[#06CFD6] transition-colors">Libro de Reclamaciones</Link>
            </div>
            </div>

        </div>
        </footer>
    );
};

export default ContactFooter;
