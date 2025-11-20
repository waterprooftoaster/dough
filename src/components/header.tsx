//components/header.tsx
"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from 'react';
import { useIsMobile } from "@/src/hooks/use-mobile"
import {
  usePlaidLink,
  PlaidLinkOnExit,
  PlaidLinkOnExitMetadata,
  PlaidLinkError,
} from "react-plaid-link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/src/components/ui/navigation-menu"

export function Header() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const getToken = useCallback(
    async () => {
      try {
        const response = await fetch("/api/plaid/create-link-token", { method: "POST", });
        if (!response.ok) throw new Error("Failed to create link token");
        const { link_token } = await response.json();
        setLinkToken(link_token);
      } catch (error) {
        console.error("Error getting link token:", error);
      }
    }, []
  );

  const onSuccess = useCallback(
    async (public_token: string) => {
      try {
        const response = await fetch("/api/plaid/create-plaid-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token }),
        });
        if (!response.ok) throw new Error("Failed to exchange token");
      } catch (error) {
        console.error("Error linking account:");
      }
    }, []
  );

  const onExit = useCallback<PlaidLinkOnExit>(
    (error: PlaidLinkError | null, metadata: PlaidLinkOnExitMetadata) => {
      if (error != null && error.error_code === 'INVALID_LINK_TOKEN') { getToken(); }
      // to handle other error codes, see https://plaid.com/docs/errors/
      console.log("User exited Plaid Link flow", { error, metadata });
    }, [getToken]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit
  });

  // Get link token
  useEffect(() => {
    if (!linkToken) { getToken(); }
  }, [linkToken, getToken]);

  const isMobile = useIsMobile();
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
        <button
          onClick={() => open()}
          disabled={!ready}
          className="px-4 py-2 bg-background text-white rounded-lg disabled:opacity-50"
        >
          Connect Bank
        </button>
      </div>
    </header>
  )
}

