'use client';

import Link from 'next/link';
import { BackButton } from './BackButton';
import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { AdminButton } from './AdminButton';
import Image from 'next/image';

interface MobileHeaderProps {
  showBackButton?: boolean;
}

const MobileHeader = ({ showBackButton = false }: MobileHeaderProps) => {
  const { siteName } = useSite();
  return (
    <header className='md:hidden relative w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm dark:bg-gray-900/70 dark:border-gray-700/50'>
      <div className='h-12 flex items-center justify-between px-4'>
        {/* 左侧：返回按钮和设置按钮 */}
        <div className='flex items-center gap-2'>
          {showBackButton && <BackButton />}
          <AdminButton />
        </div>
        {/* 右侧按钮 */}
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      {/* 中间：Logo（绝对居中） */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-[-6px] flex items-center gap-2 select-none'>
        <Link href='/' className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span className='text-xl font-bold text-[#00CC99] dark:text-[#00FF00] tracking-tight'>
            {siteName}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;