import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDashboard, 
  faBox, 
  faUsers, 
  faChartLine, 
  faCog, 
  faBell,
  faUser,
  faSearch,
  faPlus,
  faDownload,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Professional.css';

interface ProfessionalLayoutProps {
  children: React.ReactNode;
  activeModule?: string;
  pageTitle?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

const ProfessionalLayout: React.FC<ProfessionalLayoutProps> = ({
  children,
  activeModule = 'dashboard',
  pageTitle = 'Dashboard',
  showCreateButton = false,
  onCreateClick
}) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: faDashboard, href: '/' },
    { id: 'orders', label: 'Orders', icon: faBox, href: '/orders' },
    { id: 'customers', label: 'Customers', icon: faUsers, href: '/customers' },
    { id: 'analytics', label: 'Analytics', icon: faChartLine, href: '/analytics' },
    { id: 'settings', label: 'Settings', icon: faCog, href: '/settings' }
  ];

  return (
    <div className="professional-app">
      {/* Professional Header */}
      <header className="enterprise-header">
        <div className="professional-container">
          <div className="header-content">
            {/* Brand */}
            <div className="brand-logo">
              <div className="brand-icon">
                <FontAwesomeIcon icon={faBox} />
              </div>
              <span>OrderFlow Pro</span>
            </div>

            {/* Global Search */}
            <div className="global-search">
              <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search orders, customers, products..." 
                  className="search-input"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="header-actions">
              {showCreateButton && (
                <button 
                  className="btn-professional btn-primary"
                  onClick={onCreateClick}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Create Order
                </button>
              )}
              
              <button className="action-btn">
                <FontAwesomeIcon icon={faBell} />
                <span className="notification-badge">3</span>
              </button>

              <Dropdown>
                <Dropdown.Toggle as="button" className="user-menu-btn">
                  <div className="user-avatar">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <span className="user-name">John Doe</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="user-dropdown">
                  <Dropdown.Item>Profile Settings</Dropdown.Item>
                  <Dropdown.Item>Account Preferences</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item>Sign Out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-content-area">
        <div className="professional-container">
          <div className="content-layout">
            {/* Professional Sidebar */}
            <aside className="professional-sidebar">
              <div className="sidebar-section">
                <div className="sidebar-title">Main Navigation</div>
                <ul className="sidebar-menu">
                  {navigationItems.map((item) => (
                    <li key={item.id} className="sidebar-item">
                      <a 
                        href={item.href} 
                        className={`sidebar-link ${activeModule === item.id ? 'active' : ''}`}
                      >
                        <div className="sidebar-icon">
                          <FontAwesomeIcon icon={item.icon} />
                        </div>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sidebar-section">
                <div className="sidebar-title">Quick Actions</div>
                <ul className="sidebar-menu">
                  <li className="sidebar-item">
                    <a href="/orders/create" className="sidebar-link">
                      <div className="sidebar-icon">
                        <FontAwesomeIcon icon={faPlus} />
                      </div>
                      New Order
                    </a>
                  </li>
                  <li className="sidebar-item">
                    <a href="/orders/export" className="sidebar-link">
                      <div className="sidebar-icon">
                        <FontAwesomeIcon icon={faDownload} />
                      </div>
                      Export Data
                    </a>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Page Content */}
            <main className="page-content">
              {/* Page Header */}
              <div className="page-header">
                <div className="page-title-section">
                  <h1 className="page-title text-gradient">{pageTitle}</h1>
                  <p className="page-subtitle">
                    Manage and track your business operations with enterprise-grade tools
                  </p>
                </div>
                
                <div className="page-actions">
                  <button className="btn-professional btn-secondary">
                    <FontAwesomeIcon icon={faFilter} />
                    Filters
                  </button>
                  <button className="btn-professional btn-secondary">
                    <FontAwesomeIcon icon={faDownload} />
                    Export
                  </button>
                </div>
              </div>

              {/* Page Content */}
              <div className="page-body animate-fade-in-up">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLayout;
