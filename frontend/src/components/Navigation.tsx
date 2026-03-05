import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiMenu, HiX, HiSearch, HiUser, HiLogout } from 'react-icons/hi';

interface User {
  name: string;
  email: string;
}

interface NavigationProps {
  user?: User | null;
  onLogout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Plants', path: '/plants' },
  ];

  const isActivePath = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/90'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="Logo"
              />
              <span className="ml-2 text-xl font-bold text-gray-800">
                PlantApp
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {/* Navigation links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePath(link.path)
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <HiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            {/* User profile/auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                >
                  <HiUser className="h-5 w-5" />
                  <span>{user.name}</span>
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <HiLogout className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-gray-600 hover:text-green-600 font-medium"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-green-600"
            >
              {isMobileMenuOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath(link.path)
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-green-600 hover:bg-green-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
            {user && (
              <button
                onClick={() => {
                  onLogout?.();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-green-600 hover:bg-green-50"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;