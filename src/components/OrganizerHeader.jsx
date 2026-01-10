"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings, Wallet } from "lucide-react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import useAuthStore from "@/store/authStore";

const OrganizerHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const closeMenu = () => {}; // No longer needed if we don't have a menu but keeping for Logo prop compatibility

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b border-gray-900 backdrop-blur-md">
      <div className="px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" onClick={closeMenu}>
            <Logo className="text-white" />
          </Link>
        </div>

        {/* Mobile Actions - Only visible on small screens */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/dashboard/org/payout">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
            >
              <Wallet className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard/org/settings">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default OrganizerHeader;
