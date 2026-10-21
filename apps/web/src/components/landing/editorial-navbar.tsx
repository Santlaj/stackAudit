"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EditorialNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-[#FAFAF9]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded overflow-hidden">
              <img src="/icon.png" alt="StackAudit Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-neutral-900">StackAudit</span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#product"
              className="text-[13px] font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Product
            </Link>
            <Link
              href="#how-it-works"
              className="text-[13px] font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              How it works
            </Link>
            <Link
              href="/discover"
              className="text-[13px] font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Directory
            </Link>
            <Link
              href="#faq"
              className="text-[13px] font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Specs & FAQ
            </Link>
          </nav>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[13px] font-medium text-neutral-700 transition-colors hover:text-neutral-950 px-2.5 py-1.5 rounded-md hover:bg-neutral-100"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-[13px] font-medium text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.98]"
          >
            <span>Get started</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
