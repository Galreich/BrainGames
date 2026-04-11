
import { Link } from 'react-router-dom';

type HeaderNavProps = {
  navLinks: { path: string; label: string }[];
  currentPath: string;
};

const HeaderNav = ({ navLinks, currentPath }: HeaderNavProps) => {
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
