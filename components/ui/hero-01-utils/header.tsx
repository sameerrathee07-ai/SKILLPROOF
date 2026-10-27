"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowUpRight, User as UserIcon, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth/AuthContext";

export type NavigationSection = {
  title: string;
  href: string;
  isActive?: boolean;
};

export const defaultHeaderNav: NavigationSection[] = [
  { title: "Home", href: "/" },
  { title: "Challenges", href: "/problems" },
  { title: "Dashboard", href: "/org/dashboard" },
  { title: "Calibration", href: "/admin/calibrate" },
  { title: "About us", href: "/about" },
  { title: "Services", href: "/services" },
  { title: "Pricing", href: "/pricing" },
];

type HeaderProps = {
  navigationData?: NavigationSection[];
  className?: string;
};

const CollaborateButton = ({ className }: { className?: string }) => (
  <Link href="/collaborate" aria-label="Let's Collaborate">
    <Button className={cn("relative text-sm font-medium rounded-lg h-10 p-1 ps-4 pe-12 group transition-all duration-500 hover:ps-12 hover:pe-4 w-fit overflow-hidden cursor-pointer", className)}>
      <span className="relative z-10 transition-all duration-500">
        Let&apos;s Collaborate
      </span>
      <span className="absolute right-1 w-8 h-8 bg-background text-foreground rounded-md flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-36px)] group-hover:rotate-45">
        <ArrowUpRight size={16} />
      </span>
    </Button>
  </Link>
);

const UserAvatarBadge = ({ user }: { user: any }) => {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SP";

  const href = user ? "/profile" : "/login?next=/profile";

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 group"
      title={user ? `Profile: ${user.name}` : "Sign In to Access Profile (SP)"}
    >
      <div className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/50 bg-slate-900 text-white font-bold transition-transform group-hover:scale-105 shadow-md">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name || "User Profile"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-black tracking-wider text-slate-100">
            {user ? initials : "SP"}
          </span>
        )}
      </div>
      <div className="hidden sm:flex flex-col text-left">
        <span className="font-bold text-sm tracking-tight text-white group-hover:text-sky-300 transition-colors">
          SkillProof
        </span>
        <span className="text-[10px] font-medium text-slate-400 -mt-0.5">
          {user ? user.name : "Sign In"}
        </span>
      </div>
    </Link>
  );
};

const Header = ({ navigationData, className }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [sticky, setSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const links = (navigationData && navigationData.length > 0 ? navigationData : defaultHeaderNav).filter(
    (item) =>
      (item.href !== "/admin/calibrate" || user?.role === "ADMIN") &&
      (item.href !== "/org/dashboard" ||
        user?.role === "POSTER" ||
        user?.role === "ADMIN")
  );

  const handleScroll = useCallback(() => {
    setSticky(window.scrollY >= 50);
  }, []);

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768) setIsOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleScroll, handleResize]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className={cn(
        "inset-x-0 z-50 px-4 flex items-center justify-center sticky top-0 h-20",
        className,
      )}
    >
      <div
        className={cn(
          "w-full max-w-6xl flex items-center h-fit justify-between gap-3.5 lg:gap-6 transition-all duration-500",
          sticky
            ? "p-2.5 bg-background/80 backdrop-blur-lg border border-border/40 shadow-xl rounded-lg"
            : "bg-transparent border-transparent",
        )}
      >
        {/* Dynamic Top-Left Avatar / SP */}
        <div>
          <UserAvatarBadge user={user} />
        </div>

        {/* Desktop Navigation */}
        <div>
          <NavigationMenu className="max-lg:hidden bg-muted/60 p-1 rounded-lg">
            <NavigationMenuList className="flex gap-1">
              {links.map((navItem) => (
                <NavigationMenuItem key={navItem.title}>
                  <NavigationMenuLink
                    href={navItem.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition tracking-normal",
                      navItem.isActive ? "bg-background text-foreground shadow-sm" : ""
                    )}
                  >
                    {navItem.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Actions */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                href="/profile"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-md border border-slate-700/60 hover:bg-slate-800/80 transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Profile</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 rounded-md border border-transparent hover:border-rose-900/40 hover:bg-rose-950/20 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800/90 hover:bg-slate-700 rounded-md border border-slate-700 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Sign Up
              </Link>
            </>
          )}

          <CollaborateButton className="hidden lg:flex" />

          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger id="mobile-menu-trigger" asChild>
                <button
                  type="button"
                  className="rounded-lg border border-border p-2 block hover:bg-muted transition"
                  aria-label="Open navigation menu"
                >
                  <Menu width={20} height={20} />
                </button>
              </SheetTrigger>

              <SheetContent
                showCloseButton={false}
                side="right"
                className="w-full sm:w-96 p-0 border-l"
              >
                <div className="flex items-center justify-between p-6">
                  <UserAvatarBadge user={user} />
                  <SheetClose asChild>
                    <button
                      type="button"
                      className="rounded-lg border border-border p-2 block hover:bg-muted transition"
                      aria-label="Close navigation menu"
                    >
                      <X width={16} height={16} />
                    </button>
                  </SheetClose>
                </div>

                <div className="flex flex-col gap-12 px-6 pb-6 overflow-y-auto">
                  <div className="flex flex-col gap-8">
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <NavigationMenu
                      orientation="vertical"
                      className="items-start flex-none w-full"
                    >
                      <NavigationMenuList className="flex flex-col items-start gap-3 w-full">
                        {links.map((item) => (
                          <NavigationMenuItem key={item.title} className="w-full">
                            <NavigationMenuLink
                              href={item.href}
                              className={cn(
                                "group/nav flex items-center text-xl font-semibold tracking-tight transition-all p-2 rounded-md hover:bg-muted w-full",
                                item.isActive
                                  ? "text-primary"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-0.5 bg-primary transition-all duration-300",
                                  item.isActive
                                    ? "w-4 mr-2 opacity-100"
                                    : "w-0 opacity-0 group-hover/nav:w-4 group-hover/nav:mr-2 group-hover/nav:opacity-100",
                                )}
                              />
                              {item.title}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </NavigationMenuList>
                    </NavigationMenu>

                    <div className="flex flex-col gap-3 w-full">
                      {user ? (
                        <>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">{user.name}</span>
                              <span className="text-[10px] text-slate-400">{user.email}</span>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50">
                              {user.role}
                            </span>
                          </div>
                          <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition"
                          >
                            <UserIcon className="w-4 h-4" />
                            <span>Edit Profile</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              logout();
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-rose-400 border border-rose-900/30 hover:bg-rose-950/20 transition cursor-pointer text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-white text-slate-950 hover:bg-slate-200 transition"
                          >
                            <LogIn className="w-4 h-4" />
                            <span>Sign In</span>
                          </Link>
                          <Link
                            href="/signup"
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition text-slate-300"
                          >
                            Create Account
                          </Link>
                        </>
                      )}
                      <CollaborateButton />
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      SkillProof Verified Quality Platform
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
