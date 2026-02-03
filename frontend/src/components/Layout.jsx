import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    const location = useLocation();

    // Determine active menu item based on path
    const getActiveKey = (path) => {
        if (path.includes('/dashboard')) return 'dashboard';
        if (path.includes('/chat')) return 'chat';
        if (path.includes('/roles')) return 'roles';
        if (path.includes('/courses')) return 'courses';
        return '';
    };

    const activeKey = getActiveKey(location.pathname);

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display selection:bg-primary/30">
            <Sidebar active={activeKey} />
            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark h-full overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}
