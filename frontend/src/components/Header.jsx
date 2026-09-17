import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, Users, Building2, Settings as SettingsIcon, Menu, X, LogOut } from 'lucide-react';

const Header = ({ totalStudents = 0, collegeName = '', onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand Group */}
        <Link to="/" className="brand-group-link" onClick={closeMobileMenu}>
          <div className="brand-group">
            <div className="brand-logo" aria-hidden="true">
              <GraduationCap size={28} />
            </div>
            <div className="brand-text">
              <h1 className="brand-title">Student Management System</h1>
              <p className="brand-subtitle">Manage student records efficiently</p>
              {collegeName && <p className="brand-college-name">{collegeName}</p>}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav" aria-label="Main Navigation">
          <div className="nav-items">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              id="nav-dashboard-link"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <button type="button" className="nav-item nav-logout" onClick={onLogout} title="Log out"><LogOut size={18} /><span>Logout</span></button>

            <NavLink
              to="/students"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              id="nav-students-link"
            >
              <Users size={18} />
              <span>Students</span>
              <span className="nav-count-badge" id="header-student-count">
                {totalStudents}
              </span>
            </NavLink>

            <NavLink
              to="/departments"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              id="nav-departments-link"
            >
              <Building2 size={18} />
              <span>Departments</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><SettingsIcon size={18} /><span>Settings</span></NavLink>
          </div>
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav className="mobile-nav-menu" aria-label="Mobile Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
            id="mobile-nav-dashboard-link"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <button type="button" className="mobile-nav-item nav-logout" onClick={onLogout}><LogOut size={18} /><span>Logout</span></button>

          <NavLink
            to="/students"
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
            id="mobile-nav-students-link"
          >
            <div className="mobile-nav-item-inner">
              <div className="mobile-nav-left">
                <Users size={18} />
                <span>Students</span>
              </div>
              <span className="nav-count-badge">
                {totalStudents}
              </span>
            </div>
          </NavLink>

          <NavLink
            to="/departments"
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
            id="mobile-nav-departments-link"
          >
            <Building2 size={18} />
            <span>Departments</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}><SettingsIcon size={18} /><span>Settings</span></NavLink>
        </nav>
      )}
    </header>
  );
};

export default Header;
