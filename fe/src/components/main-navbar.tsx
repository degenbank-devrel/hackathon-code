"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import {
  UserIcon,
  WalletIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { formatUSDC } from "@/lib/utils";

export function MainNavbar() {
  const {
    user,
    loading,
    walletAddress,
    userName,
    userImage,
    logout,
    login,
    authenticated,
  } = useAuth();

  const { balance, isLoading: balanceLoading, tokenSymbol } = useTokenBalance();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [{ name: "Vaults", href: "/vaults/strategy-vaults" }];

  const overviewItems = [
    { name: "Overview", href: "/overview" },
    { name: "Positions", href: "/overview/positions" },
    { name: "History", href: "/overview/history" },
  ];

  const arenaItems = [
    { name: "Battle", href: "/arena/battle" },
    { name: "Leaderboard", href: "/arena/leaderboard" },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/overview") {
      return pathname === "/overview";
    }
    if (href === "/vaults/strategy-vaults") {
      return pathname.startsWith("/vaults");
    }
    if (href === "/arena/battle") {
      return pathname.startsWith("/arena/battle");
    }
    if (href === "/arena/leaderboard") {
      return pathname.startsWith("/arena/leaderboard");
    }
    return pathname === href;
  };

  const isOverviewActive = () => {
    return pathname === "/overview";
  };

  const isArenaActive = () => {
    return pathname.startsWith("/arena");
  };

  return (
    <nav className="border-border sticky top-0 z-50 border-b bg-black">
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation - Left side */}
          <div className="flex items-center space-x-8">
            {/* Logo - Always redirects to landing page */}
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logo/degenbank-logo.png"
                alt="Degen Banx"
                width={120}
                height={37}
                className="h-8 w-auto"
                priority
              />
              <p className="font-cirka ml-2 text-xl font-bold text-white md:text-2xl">
                Degen Banx
              </p>
            </Link>

            {/* Desktop Navigation - Moved to left side */}
            <div className="hidden items-center space-x-6 md:flex">
              {/* Overview Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hover:bg-transparent">
                  <Button
                    variant="ghost"
                    className={`hover:text-primary flex cursor-pointer items-center space-x-1 text-sm font-medium transition-colors ${
                      isOverviewActive() ? "text-primary" : "text-white/80"
                    }`}
                  >
                    <span>Overview</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-none"
                  align="start"
                >
                  {overviewItems.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      asChild
                      className="rounded-none"
                    >
                      <Link
                        href={item.href}
                        className={`flex cursor-pointer items-center ${
                          isActiveLink(item.href) ? "text-primary" : ""
                        }`}
                      >
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Regular nav items */}
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`hover:text-primary text-sm font-medium transition-colors ${
                    isActiveLink(item.href) ? "text-primary" : "text-white/80"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Arena Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hover:bg-transparent">
                  <Button
                    variant="ghost"
                    className={`hover:text-primary flex cursor-pointer items-center space-x-1 text-sm font-medium transition-colors ${
                      isArenaActive() ? "text-primary" : "text-white/80"
                    }`}
                  >
                    <span>Arena</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-none"
                  align="start"
                >
                  {arenaItems.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      asChild
                      className="rounded-none"
                    >
                      <Link
                        href={item.href}
                        className={`flex cursor-pointer items-center ${
                          isActiveLink(item.href) ? "text-primary" : ""
                        }`}
                      >
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Profile Section - Updated to rectangular shape */}
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 cursor-pointer border border-white/20 bg-white/5 px-3 py-2 transition-all duration-200 hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={userImage || ""}
                          alt={userName || "User"}
                        />
                        <AvatarFallback className="bg-primary text-xs text-black">
                          {userName ? (
                            getInitials(userName)
                          ) : (
                            <UserIcon className="h-3 w-3" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {walletAddress && (
                        <span className="text-sm font-medium text-white/90">
                          {formatAddress(walletAddress)}
                        </span>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-none"
                  align="end"
                  forceMount
                >
                  <DropdownMenuItem asChild className="rounded-none">
                    <Link
                      href="/overview"
                      className="flex cursor-pointer items-center"
                    >
                      <UserIcon className="mr-2 h-4 w-4 hover:text-black" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Balance Display */}
                  <DropdownMenuItem className="cursor-default rounded-none">
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Balance:
                      </span>
                      <span className="text-sm font-semibold">
                        {balanceLoading
                          ? "Loading..."
                          : formatUSDC(balance, { showSymbol: true })}
                      </span>
                    </div>
                  </DropdownMenuItem>

                  {walletAddress && (
                    <DropdownMenuItem
                      onClick={() => handleCopyAddress(walletAddress)}
                      className="cursor-pointer rounded-none"
                    >
                      <WalletIcon className="mr-2 h-4 w-4 hover:text-black" />
                      <span>Copy Address</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer rounded-none"
                  >
                    <ArrowRightOnRectangleIcon className="text-loss mr-2 h-4 w-4 hover:text-black" />
                    <span className="text-loss hover:text-black">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={login}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 cursor-pointer text-black"
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="h-10 w-10 cursor-pointer p-0 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-white" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Overlay style */}
        {mobileMenuOpen && (
          <div className="absolute top-full right-0 left-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur-sm md:hidden">
            <div className="flex flex-col space-y-2 p-4">
              {/* Overview Section */}
              <div className="border-b border-white/10 pb-2">
                <div className="px-3 py-2 text-sm font-semibold text-white/60">
                  Overview
                </div>
                {overviewItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block cursor-pointer px-6 py-2 text-base font-medium transition-colors hover:bg-white/10 hover:text-white ${
                      isActiveLink(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-white/90"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Regular nav items */}
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`cursor-pointer px-3 py-3 text-base font-medium transition-colors hover:bg-white/10 hover:text-white ${
                    isActiveLink(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-white/90"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Arena Section */}
              <div className="border-t border-white/10 pt-2">
                <div className="px-3 py-2 text-sm font-semibold text-white/60">
                  Arena
                </div>
                {arenaItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block cursor-pointer px-6 py-2 text-base font-medium transition-colors hover:bg-white/10 hover:text-white ${
                      isActiveLink(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-white/90"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
