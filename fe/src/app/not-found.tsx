"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Main 404 content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="font-cirka text-primary mb-4 text-8xl font-bold md:text-9xl">
              404
            </h1>
            <div className="bg-primary mx-auto mb-6 h-1 w-24"></div>
          </div>

          {/* Error message */}
          <div className="mb-12">
            <h2 className="font-cirka mb-4 text-3xl font-bold text-white md:text-4xl">
              Page Not Found
            </h2>
            <p className="text-muted-foreground mx-auto max-w-md text-lg leading-relaxed">
              Oops! The page you&apos;re looking for doesn&apos;t exist. It
              might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="cursor-pointer border-white/20 bg-white/5 px-8 py-3 text-base font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Go Back
            </Button>

            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 hover:shadow-primary/50 cursor-pointer px-8 py-3 text-base font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <HomeIcon className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
