"use client";

import Image from "next/image";
import { MessageCircle, Twitter } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="bg-primary fixed right-0 bottom-0 left-0 z-0 h-[400px] w-full">
      <div className="mx-auto flex h-full max-w-6xl flex-col px-6 py-8">
        {/* Top Section - 3 Columns */}
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          {/* Left Column - Description & Social */}
          <div className="w-full space-y-6 md:w-1/3">
            <div className="space-y-3">
              <p className="text-base leading-relaxed text-black/80">
                The ultimate platform for yield farming and DeFi strategies.
                Join the community and maximize your crypto potential.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex space-x-4">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleExternalLink("https://x.com/DegenBanx")}
                  className="flex cursor-pointer items-center gap-2 px-0 text-sm text-black/80 transition-colors duration-200 hover:bg-transparent hover:text-black"
                >
                  <Twitter size={16} />X / Twitter
                </Button>
              </div>
            </div>
          </div>

          {/* Center Column - Navigation */}
          <div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="cursor-pointer text-left text-base text-black/80 transition-colors hover:text-black"
              >
                How It Works
              </button>
              <Link href="/vaults/strategy-vaults">
                <button className="cursor-pointer text-left text-base text-black/80 transition-colors hover:text-black">
                  Vault
                </button>
              </Link>
              <Link href="/arena/battle">
                <button className="cursor-pointer text-left text-base text-black/80 transition-colors hover:text-black">
                  Arena
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column - Support & Legal */}
          <div className="space-y-6">
            <div className="flex flex-col space-y-3">
              <a
                href="mailto:support@degenbanx.xyz"
                className="text-base text-black/80 transition-colors hover:text-black"
              >
                support@degenbanx.xyz
              </a>
              <button
                onClick={() => handleExternalLink("#")}
                className="cursor-pointer text-left text-base text-black/80 transition-colors hover:text-black"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Logo & Brand */}
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-4">
            <Image
              src="/assets/logo/degenbank-logo.png"
              alt="Degen Banx"
              width={240}
              height={72}
              className="mt-4 h-20 w-auto brightness-75 md:h-28"
              priority
            />
            <p className="font-cirka text-6xl font-bold whitespace-nowrap text-[#5C9487] md:text-9xl">
              Degen Banx
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
