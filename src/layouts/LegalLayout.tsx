import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const LegalLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
};

export default LegalLayout;
