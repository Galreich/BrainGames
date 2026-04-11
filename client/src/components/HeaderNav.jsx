import React from 'react';
import { Link } from 'react-router-dom';

const HeaderNav = ({ navLinks, currentPath }) => {
  return (
    <nav className='header-nav'>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`nav-link ${currentPath === link.path ? 'active' : ''}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default HeaderNav;
