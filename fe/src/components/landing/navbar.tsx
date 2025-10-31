"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const { login, ready, authenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false); // Close mobile menu after clicking
  };

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/assets/logo/degenbank-logo.png"
              alt="Degen Banx"
              width={180}
              height={56}
              className="h-12 w-auto"
              priority
            />
            <p className="font-cirka ml-2 text-2xl font-bold text-white md:text-4xl">
              Degen Banx
            </p>
          </div>

          <div className="flex items-center gap-4 md:gap-12">
            {/* Navigation Menu - Desktop */}
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center space-x-12 border border-white/10 bg-white/5 px-10 py-3 backdrop-blur-sm">
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="cursor-pointer text-sm font-medium tracking-wide text-white/90 transition-all duration-300 hover:scale-105 hover:text-white"
                >
                  How It Works
                </button>
                <Link href="/vaults/strategy-vaults">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="cursor-pointer text-sm font-medium tracking-wide text-white/90 transition-all duration-300 hover:scale-105 hover:text-white"
                  >
                    Vault
                  </button>
                </Link>
                <Link href="/arena/battle">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="cursor-pointer text-sm font-medium tracking-wide text-white/90 transition-all duration-300 hover:scale-105 hover:text-white"
                  >
                    Arena
                  </button>
                </Link>
              </div>
            </div>

            {/* Login/Overview Button - Desktop */}
            <div className="hidden items-center md:flex">
              {authenticated ? (
                <Link href="/overview">
                  <Button className="bg-primary hover:bg-primary/90 hover:shadow-primary/50 cursor-pointer border border-white/20 px-8 py-3 text-base font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    Overview
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={login}
                  disabled={!ready}
                  className="bg-primary hover:bg-primary/90 hover:shadow-primary/50 cursor-pointer border border-white/20 px-8 py-3 text-base font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Login
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="hover:text-primary p-2 text-white transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen
              ? "mt-4 max-h-96 border-t border-white/10 pt-4 opacity-100"
              : "max-h-0 overflow-hidden opacity-0"
          }`}
        >
          <div className="flex flex-col space-y-4 border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="rounded-md px-3 py-3 text-left text-base font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              How It Works
            </button>
            <Link href="/vaults/strategy-vaults">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full rounded-md px-3 py-3 text-left text-base font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                Vault
              </button>
            </Link>
            <Link href="/arena/battle">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full rounded-md px-3 py-3 text-left text-base font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                Arena
              </button>
            </Link>

            {/* Mobile Login/Overview Button */}
            <div className="border-t border-white/10 pt-2">
              {authenticated ? (
                <Link href="/overview">
                  <Button className="bg-primary hover:bg-primary/90 hover:shadow-primary/50 w-full cursor-pointer border border-white/20 px-6 py-3 text-base font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    Overview
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={login}
                  disabled={!ready}
                  className="bg-primary hover:bg-primary/90 hover:shadow-primary/50 w-full cursor-pointer border border-white/20 px-6 py-3 text-base font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Login
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
