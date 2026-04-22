import React from 'react';
import { Outlet } from 'react-router-dom';
import AltHeader from '../components/AltHeader'; // ¡Reutilizamos el que creamos antes!

const ContactLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <AltHeader />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
};

export default ContactLayout;
