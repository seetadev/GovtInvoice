import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { homeOutline, briefcaseOutline, settingsOutline, homeSharp, briefcaseSharp, settingsSharp, cubeOutline, cubeSharp } from 'ionicons/icons';

import './DashboardLayout.css';

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const history = useHistory();
    // Theme logic removed

    const menuItems = [
        {
            title: 'Home',
            path: '/app/dashboard/home',
            icon: homeOutline,
            activeIcon: homeSharp
        },
        {
            title: 'Inventory',
            path: '/app/dashboard/inventory',
            icon: cubeOutline,
            activeIcon: cubeSharp
        },
        {
            title: 'Business Info',
            path: '/app/dashboard/business-info',
            icon: briefcaseOutline,
            activeIcon: briefcaseSharp
        },
        {
            title: 'Settings',
            path: '/app/dashboard/settings',
            icon: settingsOutline,
            activeIcon: settingsSharp
        }
    ];

    const handleNavigation = (path: string) => {
        history.push(path);
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
            {/* Sidebar header removed if we want it purely below the main header, 
                 but keeping it consistent with previous logic or hiding it via CSS if needed. 
                 Since it's below the main header, we probably don't need the logo "Invoice" here 
                 if the main header has it, or maybe we leave it. 
                 Let's keep the structure simple or remove the header from here if it's redundant.
                 For now I'll restore it as it was safe. */}
            <div className="sidebar-header">
                <img src="/favicon.png" alt="Logo" className="sidebar-logo" />
                <span className="sidebar-title">Invoice</span>
            </div>

            <div className="sidebar-menu">
                {menuItems.map((item) => (
                    <div
                        key={item.path}
                        className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => handleNavigation(item.path)}
                    >
                        <div className="sidebar-icon">
                            <IonIcon icon={isActive(item.path) ? item.activeIcon : item.icon} />
                        </div>
                        <span className="sidebar-label">{item.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardSidebar;
