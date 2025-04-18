/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/components/Layout.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import SideNav from './SideNav';
import RightSidebar from './RightSidebar';
import './Layout.css';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

const SIDEBAR_STATE_KEY = 'sidebarState';

const Layout = () => {
    const theme = useTheme();
    const headerRef = useRef(null);
    const mainAreaContainerRef = useRef(null); // Renamed ref for clarity
    const [sidebarState, setSidebarState] = useState('expanded');
    const [mobileOpen, setMobileOpen] = useState(false);

    const isMobile = useMediaQuery('(max-width: 767.95px)');
    const isTabletOrSmallDesktop = useMediaQuery('(min-width: 768px) and (max-width: 1199.95px)');

    const location = useLocation();

    // --- Effects ---
    useEffect(() => {
        const storedState = localStorage.getItem(SIDEBAR_STATE_KEY);
        if (!isMobile) {
            const defaultState = isTabletOrSmallDesktop ? 'collapsed' : 'expanded';
            setSidebarState(storedState || defaultState);
            if (mobileOpen) {
                setMobileOpen(false); // Close mobile drawer if resizing up
            }
        }
    }, [isTabletOrSmallDesktop, isMobile, mobileOpen]);

    useEffect(() => {
        if (!isMobile) {
            localStorage.setItem(SIDEBAR_STATE_KEY, sidebarState);
        }
    }, [sidebarState, isMobile]);

    useEffect(() => {
        if (isMobile) {
            document.body.classList.add('mobile-view');
            document.body.classList.remove('desktop-view');
        } else {
            document.body.classList.remove('mobile-view');
            document.body.classList.add('desktop-view');
        }
        return () => {
            document.body.classList.remove('mobile-view', 'desktop-view');
        };
    }, [isMobile]);

    // Effect for Header Height and Main Area Padding Top
    useEffect(() => {
        const updateLayoutOffsets = () => {
            const headerElement = headerRef.current;
            const containerElement = mainAreaContainerRef.current; // Use the ref for the container
            if (headerElement && containerElement) {
                const headerHeight = headerElement.offsetHeight;
                // Apply padding-top to the container holding main and right sidebar
                containerElement.style.paddingTop = `${headerHeight}px`;
                document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            }
        };

        updateLayoutOffsets(); // Initial calculation

        let resizeObserver;
        const headerEl = headerRef.current;

        if (headerEl && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(updateLayoutOffsets);
            resizeObserver.observe(headerEl); // Observe header for height changes
        } else {
            window.addEventListener('resize', updateLayoutOffsets); // Fallback
        }

        return () => { // Cleanup
            if (resizeObserver && headerEl) {
                resizeObserver.unobserve(headerEl);
            } else {
                window.removeEventListener('resize', updateLayoutOffsets);
            }
            document.documentElement.style.removeProperty('--header-height');
             // Clear inline style on unmount
            if (mainAreaContainerRef.current) {
                mainAreaContainerRef.current.style.paddingTop = '';
            }
        };
    }, []); // Dependencies: Re-run only if needed (e.g., header content changes causing height change)

    // Effect to Close Drawer on Route Change
    useEffect(() => {
        if (mobileOpen) {
            handleDrawerClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]); // Dependency: location.pathname

    // --- Handlers ---
    const handleToggleSidebar = useCallback(() => {
        if (isMobile) {
            setMobileOpen(prev => !prev);
        } else {
            setSidebarState(prev => (prev === 'expanded' ? 'collapsed' : 'expanded'));
        }
    }, [isMobile]);

    const handleDrawerClose = useCallback(() => {
        setMobileOpen(false);
    }, []);

    // --- Render Logic ---
    const isDesktopSidebarCollapsed = !isMobile && sidebarState === 'collapsed';
    const layoutClass = isMobile ? 'mobile-layout' : `desktop-layout-${sidebarState}`;

    return (
        <div className={`app-layout-wrapper ${layoutClass}`}
             data-sidebar-state={isMobile ? 'mobile' : sidebarState}>

            <Header
                ref={headerRef}
                onToggleSidebar={handleToggleSidebar}
                isSidebarCollapsed={isDesktopSidebarCollapsed}
                isMobile={isMobile}
            />

            {/* Conditional Rendering: Mobile Drawer or Desktop Sidebar */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerClose}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        zIndex: 'var(--z-drawer)',
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: 'var(--sidebar-width-expanded)',
                            bgcolor: 'var(--color-offset)',
                            borderRight: 'none',
                            paddingTop: 'var(--header-height)', // Space for fixed header inside drawer
                        },
                    }}
                >
                    <SideNav
                        isMobile={true}
                        isCollapsed={false}
                        onNavItemClick={handleDrawerClose}
                    />
                </Drawer>
            ) : (
                <aside className="side-nav-wrapper">
                    <SideNav
                        isMobile={false}
                        isCollapsed={isDesktopSidebarCollapsed}
                    />
                </aside>
            )}

            {/* Main Area Container (Handles header offset) */}
            <div className="main-area-container" ref={mainAreaContainerRef}>
                {/* Main Content Area (Handles sidebar offset) */}
                <main className="main-content-area" id="main-content">
                    {/* Inner Wrapper (Handles scrolling) */}
                    <div className="main-content-inner-wrapper">
                        {/* Padding Wrapper (Handles content padding) */}
                        <div className="content-padding-wrapper">
                           <Outlet />
                        </div>
                    </div>
                </main>

                {/* Right Sidebar (CSS handles hiding) */}
                <aside className="right-sidebar-wrapper">
                    <RightSidebar />
                </aside>
            </div>
        </div>
    );
};

export default Layout;