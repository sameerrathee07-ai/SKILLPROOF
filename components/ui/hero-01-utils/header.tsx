"use client";

import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowUpRight, Instagram, Twitter, Linkedin, Dribbble } from "lucide-react";
import Logo from "@/components/ui/hero-01-utils/logo";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export type NavigationSection = {
  title: string;
  href: string;
  isActive?: boolean;
};

type HeaderProps = {
  navigationData: NavigationSection[];
  className?: string;
};

const CollaborateButton = ({ className }: { className?: string }) => (
  <a href="/login" aria-label="Sign In or Collaborate">
    <Button className={cn("relative text-sm font-medium rounded-lg h-10 p-1 ps-4 pe-12 group transition-all duration-500 hover:ps-12 hover:pe-4 w-fit overflow-hidden cursor-pointer", className)}>
      <span className="relative z-10 transition-all duration-500">
        Let&apos;s Collaborate
      </span>
      <span className="absolute right-1 w-8 h-8 bg-background text-foreground rounded-md flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-36px)] group-hover:rotate-45">
        <ArrowUpRight size={16} />
      </span>
    </Button>
  </a>
);

const Header = ({ navigationData, className }: HeaderProps) => {
  const [sticky, setSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
        {/* Logo */}
        <div>
          <a href="#" aria-label="Home">
            <Logo />
          </a>
        </div>

        {/* Desktop Navigation */}
        <div>
          <NavigationMenu className="max-lg:hidden bg-muted/60 p-1 rounded-lg">
            <NavigationMenuList className="flex gap-1">
              {navigationData.map((navItem) => (
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

        {/* Desktop CTA */}
        <div className="flex gap-4">
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
                  <a href="#" aria-label="Home">
                    <Logo />
                  </a>
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
                        {navigationData.map((item) => (
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

                    <div className="w-fit">
                      <CollaborateButton />
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-border">
                    <div className="flex gap-3">
                      <a
                        href="#"
                        aria-label="Dribbble"
                        className="flex items-center justify-center rounded-lg border border-border hover:bg-muted transition p-2.5"
                      >
                        <Dribbble className="w-4 h-4" />
                      </a>
                      <a
                        href="#"
                        aria-label="Instagram"
                        className="flex items-center justify-center rounded-lg border border-border hover:bg-muted transition p-2.5"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a
                        href="#"
                        aria-label="Twitter"
                        className="flex items-center justify-center rounded-lg border border-border hover:bg-muted transition p-2.5"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                      <a
                        href="#"
                        aria-label="LinkedIn"
                        className="flex items-center justify-center rounded-lg border border-border hover:bg-muted transition p-2.5"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      SkillProof Component Showcase
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
