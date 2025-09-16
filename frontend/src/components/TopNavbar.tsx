import { useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import { Brain, Newspaper, Sparkles } from "lucide-react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "./ui/resizable-navbar";
import { Logo } from "./Logo";

export function TopNavbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const navItems = [
    { name: "New Chat", link: "#new", icon: Sparkles },
    { name: "History", link: "#history", icon: Newspaper },
    { name: "About", link: "#about", icon: Brain },
  ];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <Navbar>
      <NavBody>
        <div className="flex items-center gap-2">
          <button
            aria-label="Open sidebar"
            onClick={() => onOpenSidebar?.()}
            className="p-2 rounded-md bg-neutral-900/60 text-white border border-white/10 hover:bg-neutral-800">
            <IconMenu2 className="w-5 h-5" />
          </button>
          <a href="#" className="flex items-center">
            <Logo size="md" />
          </a>
        </div>
        <NavItems
          items={navItems}
          onItemClick={(item) => {
            if (item.name === "New Chat") {
              const ev = new CustomEvent("topnav:new-chat");
              window.dispatchEvent(ev);
            }
            if (item.name === "History") {
              onOpenSidebar?.();
            }
          }}
        />
        <div className="flex items-center gap-3">
          <NavbarButton
            as="button"
            className="bg-transparent text-white shadow-none hover:bg-white/5 flex items-center gap-2"
            onClick={() => onOpenSidebar?.()}>
            <Newspaper className="w-4 h-4" />
            History
          </NavbarButton>
          <NavbarButton
            as="button"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 shadow-lg"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("topnav:new-chat"))
            }>
            <Sparkles className="w-4 h-4" />
            New Chat
          </NavbarButton>
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <a href="#" className="flex items-center">
            <Logo size="sm" />
          </a>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}>
          {navItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <button
                key={`mobile-link-${idx}`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (item.name === "New Chat") {
                    window.dispatchEvent(new CustomEvent("topnav:new-chat"));
                  }
                  if (item.name === "History") {
                    onOpenSidebar?.();
                  }
                }}
                className="relative text-neutral-600 dark:text-neutral-300 text-left flex items-center gap-3 py-2">
                <IconComponent className="w-5 h-5" />
                <span className="block">{item.name}</span>
              </button>
            );
          })}
          <div className="flex w-full flex-col gap-4">
            <NavbarButton
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenSidebar?.();
              }}
              variant="primary"
              className="w-full flex items-center justify-center gap-2">
              <Newspaper className="w-4 h-4" />
              History
            </NavbarButton>
            <NavbarButton
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent("topnav:new-chat"));
              }}
              variant="primary"
              className="w-full flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              New Chat
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
