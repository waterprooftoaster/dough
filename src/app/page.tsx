"use client"

import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from "react-plaid-link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/src/components/ui/navigation-menu"

export default function LandingPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const response = await fetch("/api/plaid/create-link-token", {
          method: "POST",
        });
        if (!response.ok) throw new Error("Failed to create link token");
        const { link_token } = await response.json();
        setLinkToken(link_token);
      } catch (error) {
        console.error("Error getting link token:", error);
      }
    };

    if (!linkToken) {
      console.error("Link token is null");
      getToken();
    }
  }, [linkToken]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token: string, metadata: any) => {
    // send public_token to server
    console.log(public_token);
    console.log(metadata);
  },
  onExit: async () => {
    // handle the case when the user exits the Link flow
  }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Menu Bar */}
      <header className="flex justify-center p-6 bg-white shadow-md">
        <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>

            <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>

            <NavigationMenuTrigger>Item Two</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>

            <NavigationMenuTrigger>Item Three</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>

          </NavigationMenuItem>
        </NavigationMenuList>
        </NavigationMenu>
      </header>

      {/* Main landing content */}
      <main className="flex flex-col items-center justify-left flex-1 px-4 py-12 text-left">
        <h1 className="text-5xl font-bold mb-4"> Money Talks, </h1>
        <h1 className="text-5xl font-bold mb-4"> Dough Listens. </h1>
         <button
                onClick={() => open()}
                disabled={!ready}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Connect Bank
          </button>
      </main>
    </div>
  )
}
