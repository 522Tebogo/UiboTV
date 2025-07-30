/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { Clover, Film, Home, Menu, Search, Star, Tv } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

import { useSite } from './SiteProvider';

interface SidebarContextType {
  isCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
});

export const useSidebar = () => useContext(SidebarContext);

// Logo component from Sidebar.tsx, with Image and custom colors
const Logo = () => {
  const { siteName } = useSite();
  return (
    <Link
      href='/'
      className='flex items-center justify-start pl-0 h-16 select-none hover:opacity-80 transition-opacity duration-200 gap-2'
    >
      <Image
        src="/logo.png"
        alt="网站Logo"
        width={45}
        height={45}
        priority
      />
      <span className='text-2xl font-bold text-[#00CC99] dark:text-[#39FF14] tracking-tight'>
        {siteName}
      </span>
    </Link>
  );
};

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
  activePath?: string;
}

// Global variable caching for collapsed state
declare global {
  interface Window {
    __sidebarCollapsed?: boolean;
  }
}

const Sidebar = ({ onToggle, activePath = '/' }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.__sidebarCollapsed === 'boolean'
    ) {
      return window.__sidebarCollapsed;
    }
    return false; // Default to expanded
  });

  // Effect for persisting collapsed state to localStorage
  useLayoutEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      const val = JSON.parse(saved);
      setIsCollapsed(val);
      window.__sidebarCollapsed = val;
    }
  }, []);

  // Effect for syncing collapsed state to HTML data attribute
  useLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      if (isCollapsed) {
        document.documentElement.dataset.sidebarCollapsed = 'true';
      } else {
        delete document.documentElement.dataset.sidebarCollapsed;
      }
    }
  }, [isCollapsed]);

  const [active, setActive] = useState(activePath);

  // Effect for updating the active path
  useEffect(() => {
    if (activePath) {
      setActive(activePath);
    } else {
      const getCurrentFullPath = () => {
        const queryString = searchParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
      };
      const fullPath = getCurrentFullPath();
      setActive(fullPath);
    }
  }, [activePath, pathname, searchParams]);

  const handleToggle = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    if (typeof window !== 'undefined') {
      window.__sidebarCollapsed = newState;
    }
    onToggle?.(newState);
  }, [isCollapsed, onToggle]);

  const handleSearchClick = useCallback(() => {
    router.push('/search');
  }, [router]);

  const contextValue = {
    isCollapsed,
  };

  // State for menu items, combining static and dynamic items
  const [menuItems, setMenuItems] = useState([
    {
      icon: Film,
      label: '电影',
      href: '/douban?type=movie',
    },
    {
      icon: Tv,
      label: '剧集',
      href: '/douban?type=tv',
    },
    {
      icon: Clover,
      label: '综艺',
      href: '/douban?type=show',
    },
  ]);

  // Effect to add dynamic categories from RUNTIME_CONFIG
  useEffect(() => {
    const runtimeConfig = (window as any).RUNTIME_CONFIG;
    if (runtimeConfig?.CUSTOM_CATEGORIES) {
      setMenuItems((prevItems) => [
        ...prevItems,
        ...runtimeConfig.CUSTOM_CATEGORIES.map((category: any) => ({
          icon: Star, // Use Star icon for custom items
          label: category.name || category.query,
          href: `/douban?type=${category.type}&tag=${category.query}${
            category.name ? `&name=${category.name}` : ''
          }&custom=true`,
        })),
      ]);
    }
  }, []);

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* Sidebar hidden on mobile */}
      <div className='hidden md:flex'>
        <aside
          data-sidebar
          className={`fixed top-0 left-0 h-screen bg-white/40 backdrop-blur-xl transition-all duration-300 border-r border-gray-200/50 z-10 shadow-lg dark:bg-gray-900/70 dark:border-gray-700/50 ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className='flex h-full flex-col'>
            {/* Top Logo Area */}
            <div className='relative h-16'>
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                  isCollapsed ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {/* Styling from Sidebar.tsx for logo alignment */}
                <div className='w-full flex items-center pl-9 -ml-1'>
                  {!isCollapsed && <Logo />}
                </div>
              </div>
              <button
                onClick={handleToggle}
                className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 transition-colors duration-200 z-10 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50 ${
                  isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-2'
                }`}
              >
                <Menu className='h-4 w-4' />
              </button>
            </div>

            {/* Home and Search Navigation */}
            <nav className='px-2 mt-4 space-y-1'>
              {/* Using custom color scheme from Sidebar.tsx */}
              <Link
                href='/'
                onClick={() => setActive('/')}
                data-active={active === '/'}
                className={`group flex items-center rounded-lg px-2 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-[#00CC99] data-[active=true]:bg-[#00CC99]/20 data-[active=true]:text-[#00CC99] font-medium transition-colors duration-200 min-h-[40px] dark:text-gray-300 dark:hover:text-[#39FF14] dark:data-[active=true]:bg-[#39FF14]/20 dark:data-[active=true]:text-[#39FF14] ${
                  isCollapsed ? 'w-full max-w-none mx-0' : 'mx-0'
                } gap-3 justify-start`}
              >
                <div className='w-4 h-4 flex items-center justify-center'>
                  <Home className='h-4 w-4 text-gray-500 group-hover:text-[#00CC99] data-[active=true]:text-[#00CC99] dark:text-gray-400 dark:group-hover:text-[#39FF14] dark:data-[active=true]:text-[#39FF14]' />
                </div>
                {!isCollapsed && (
                  <span className='whitespace-nowrap transition-opacity duration-200 opacity-100'>
                    首页
                  </span>
                )}
              </Link>
              <Link
                href='/search'
                onClick={(e) => {
                  e.preventDefault();
                  handleSearchClick();
                  setActive('/search');
                }}
                data-active={active === '/search'}
                className={`group flex items-center rounded-lg px-2 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-[#00CC99] data-[active=true]:bg-[#00CC99]/20 data-[active=true]:text-[#00CC99] font-medium transition-colors duration-200 min-h-[40px] dark:text-gray-300 dark:hover:text-[#39FF14] dark:data-[active=true]:bg-[#39FF14]/20 dark:data-[active=true]:text-[#39FF14] ${
                  isCollapsed ? 'w-full max-w-none mx-0' : 'mx-0'
                } gap-3 justify-start`}
              >
                <div className='w-4 h-4 flex items-center justify-center'>
                  <Search className='h-4 w-4 text-gray-500 group-hover:text-[#00CC99] data-[active=true]:text-[#00CC99] dark:text-gray-400 dark:group-hover:text-[#39FF14] dark:data-[active=true]:text-[#39FF14]' />
                </div>
                {!isCollapsed && (
                  <span className='whitespace-nowrap transition-opacity duration-200 opacity-100'>
                    搜索
                  </span>
                )}
              </Link>
            </nav>

            {/* Menu Items */}
            <div className='flex-1 overflow-y-auto px-2 pt-4'>
              <div className='space-y-1'>
                {menuItems.map((item) => {
                  const typeMatch = item.href.match(/type=([^&]+)/)?.[1];
                  const tagMatch = item.href.match(/tag=([^&]+)/)?.[1];
                  const decodedActive = decodeURIComponent(active);
                  const decodedItemHref = decodeURIComponent(item.href);
                  const isActive =
                    decodedActive === decodedItemHref ||
                    (decodedActive.startsWith('/douban') &&
                      decodedActive.includes(`type=${typeMatch}`) &&
                      tagMatch &&
                      decodedActive.includes(`tag=${tagMatch}`));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActive(item.href)}
                      data-active={isActive}
                      className={`group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-[#00CC99] data-[active=true]:bg-[#00CC99]/20 data-[active=true]:text-[#00CC99] transition-colors duration-200 min-h-[40px] dark:text-gray-300 dark:hover:text-[#39FF14] dark:data-[active=true]:bg-[#39FF14]/20 dark:data-[active=true]:text-[#39FF14] ${
                        isCollapsed ? 'w-full max-w-none mx-0' : 'mx-0'
                      } gap-3 justify-start`}
                    >
                      <div className='w-4 h-4 flex items-center justify-center'>
                        <Icon className='h-4 w-4 text-gray-500 group-hover:text-[#00CC99] data-[active=true]:text-[#00CC99] dark:text-gray-400 dark:group-hover:text-[#39FF14] dark:data-[active=true]:text-[#39FF14]' />
                      </div>
                      {!isCollapsed && (
                        <span className='whitespace-nowrap transition-opacity duration-200 opacity-100'>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
        <div
          className={`transition-all duration-300 sidebar-offset ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
        ></div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;