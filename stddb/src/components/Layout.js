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

const SIDEBAR_STATE_KEY = 'sidebarState';

const Layout = () => {
    const headerRef = useRef(null);
    const mainAreaRef = useRef(null);
    const [sidebarState, setSidebarState] = useState('expanded'); // Initial value updated in useEffect

    const isMobile = useMediaQuery('(max-width: 767.95px)');
    const isTabletOrSmallDesktop = useMediaQuery('(min-width: 768px) and (max-width: 1199.95px)');

    const location = useLocation();

    useEffect(() => {
        const storedState = localStorage.getItem(SIDEBAR_STATE_KEY);
        if (!isMobile) {
            const defaultState = isTabletOrSmallDesktop ? 'collapsed' : 'expanded';
            setSidebarState(storedState || defaultState);
        }
    }, [isTabletOrSmallDesktop, isMobile]);

    useEffect(() => {
        if (!isMobile) {
            localStorage.setItem(SIDEBAR_STATE_KEY, sidebarState);
        }
    }, [sidebarState, isMobile]);

    useEffect(() => {
        if (isMobile) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }, [isMobile]);

    const handleToggleSidebar = useCallback(() => {
        if (!isMobile) {
            setSidebarState(prev => (prev === 'expanded' ? 'collapsed' : 'expanded'));
        }
    }, [isMobile]);

    // Header Height Calculation & Main Area Padding Adjustment
    useEffect(() => {
        const updateLayoutOffsets = () => {
            const headerElement = headerRef.current;
            const mainAreaElement = mainAreaRef.current;
            if (headerElement && mainAreaElement) {
                const headerHeight = headerElement.offsetHeight;
                // Apply padding only for non-mobile where CSS doesn't handle it
                if (!isMobile) {
                    mainAreaElement.style.paddingTop = `${headerHeight}px`;
                }
                // Set the CSS variable regardless of mobile state
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
            // Clean up styles potentially set on unmount/re-render cycle if needed
            document.documentElement.style.removeProperty('--header-height');
             // Also clear the JS padding on unmount/desktop->mobile transition if needed
             if (mainAreaRef.current) {
                 mainAreaRef.current.style.paddingTop = '';
             }
        };
        // Rerun when isMobile changes to apply/remove the desktop padding correctly
    }, [isMobile]); // Dependency on isMobile is important here

    useEffect(() => {
        return () => {
            document.body.classList.remove('mobile-view');
        };
    }, []);

    return (
        <div className="app-layout-wrapper" data-sidebar-state={isMobile ? 'mobile' : sidebarState}>
            <Header
                ref={headerRef}
                onToggleSidebar={handleToggleSidebar}
                isSidebarCollapsed={!isMobile && sidebarState === 'collapsed'}
                isMobile={isMobile}
            />

            {/* This container's padding-top is handled by CSS on mobile */}
            <div className="main-area-container" ref={mainAreaRef}>
                <aside className="side-nav-wrapper">
                    <SideNav
                        isMobile={isMobile}
                        isCollapsed={!isMobile && sidebarState === 'collapsed'}
                        onToggleCollapse={handleToggleSidebar}
                    />
                </aside>

                <main className="main-content-area" id="main-content">
                   <Outlet />
                </main>

                <aside className="right-sidebar-wrapper">
                    <RightSidebar />
                </aside>
            </div>
        </div>
    );
};

export default Layout;