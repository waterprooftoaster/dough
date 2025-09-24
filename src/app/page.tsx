import React from 'react'
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
        <a
          href="#"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </a>
      </main>
    </div>
  )
}
