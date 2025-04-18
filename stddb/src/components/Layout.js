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
    const mainAreaRef = useRef(null);
    const [sidebarState, setSidebarState] = useState('expanded');
    const [mobileOpen, setMobileOpen] = useState(false);

    // This correctly defines mobile as < 768px
    const isMobile = useMediaQuery('(max-width: 767.95px)');
    const isTabletOrSmallDesktop = useMediaQuery('(min-width: 768px) and (max-width: 1199.95px)');

    const location = useLocation();

    // --- Effects --- (Keep existing useEffects as they were in the previous correct version)
    useEffect(() => {
        const storedState = localStorage.getItem(SIDEBAR_STATE_KEY);
        if (!isMobile) {
            const defaultState = isTabletOrSmallDesktop ? 'collapsed' : 'expanded';
            setSidebarState(storedState || defaultState);
            if (mobileOpen) {
                setMobileOpen(false);
            }
        }
    }, [isTabletOrSmallDesktop, isMobile, mobileOpen]); // Added mobileOpen dependency

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

    useEffect(() => {
        const updateLayoutOffsets = () => {
            const headerElement = headerRef.current;
            const mainAreaElement = mainAreaRef.current;
            if (headerElement && mainAreaElement) {
                const headerHeight = headerElement.offsetHeight;
                mainAreaElement.style.paddingTop = `${headerHeight}px`;
                document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            }
        };
        updateLayoutOffsets();
        let resizeObserver;
        const headerEl = headerRef.current;
        if (headerEl && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(updateLayoutOffsets);
            resizeObserver.observe(headerEl);
        } else {
            window.addEventListener('resize', updateLayoutOffsets);
        }
        return () => {
            if (resizeObserver && headerEl) {
                resizeObserver.unobserve(headerEl);
            } else {
                window.removeEventListener('resize', updateLayoutOffsets);
            }
            document.documentElement.style.removeProperty('--header-height');
            if (mainAreaRef.current) {
                mainAreaRef.current.style.paddingTop = '';
            }
        };
    }, []);

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

    // Close drawer on route change
    useEffect(() => {
        if (mobileOpen) {
            handleDrawerClose();
        }
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

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
                        // REMOVED the display property:
                        // display: { xs: 'block', sm: 'none' },
                        zIndex: 'var(--z-drawer)',
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: 'var(--sidebar-width-expanded)',
                            bgcolor: 'var(--color-offset)',
                            borderRight: 'none',
                            paddingTop: 'var(--header-height)',
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

            {/* Main Content Area */}
            <div className="main-area-container" ref={mainAreaRef}>
                <main className="main-content-area" id="main-content">
                    <div className="main-content-inner-wrapper">
                       <Outlet />
                    </div>
                </main>
                <aside className="right-sidebar-wrapper">
                    <RightSidebar />
                </aside>
            </div>
        </div>
    );
};

export default Layout;