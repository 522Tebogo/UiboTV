'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

export const AdminButton = () => {
  return (
    <Link
      href="/admin"
      title="管理员入口"
      className="w-10 h-10 p-2 rounded-full flex items-center justify-center
                 text-gray-600 hover:bg-gray-200/50
                 dark:text-gray-300 dark:hover:bg-gray-700/50
                 transition-colors"
      aria-label="Admin"
    >
      <Shield className="w-full h-full" />
    </Link>
  );
};
