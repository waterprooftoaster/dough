//components/header.tsx
"use client"

import Link from "next/link"
import { useRef } from 'react';
import { useIsMobile } from "@/src/hooks/use-mobile"
import { PlaidLink, PlaidLinkHandle } from '../lib/plaid-link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/src/components/ui/navigation-menu"

export function Header() {
  const isMobile = useIsMobile();
  const linkRef = useRef<PlaidLinkHandle>(null);
  return (
    <header className="flex items-center justify-between bg-background top-0 left-0 right-0 p-6 pl-10 z-100">
      <NavigationMenu viewport={isMobile}>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/dashboard">Dashboard</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent className="z-50">
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="#">
                    <div className="font-medium">Dashboard</div>
                    <div className="text-muted-foreground">
                      All of your finances displayed beautifully.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#">
                    <div className="font-medium">Credit Card</div>
                    <div className="text-muted-foreground">
                      Alogrithmcally calculate the credit cards.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="#">
                    <div className="font-medium"> Big Purchases</div>
                    <div className="text-muted-foreground">
                      See how smart is your next big purchase.
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenu>
      <div className="pr-10">
        <PlaidLink ref={linkRef} />
        <button
          onClick={() => linkRef.current?.open()}
          disabled={!linkRef.current?.ready}
          className={`
            px-4 py-2 rounded-md text-white
            ${linkRef.current?.ready ? 'bg-background' : 'bg-gray-500 opacity-60 cursor-not-allowed'}`
          }
        >
          Connect bank
        </button>
      </div>
    </header>
  )
}

