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
} from "@/components/ui/navigation-menu"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with menu bar in upper right */}
      <header className="flex justify-end p-6 bg-white shadow-md">
        <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        </NavigationMenu>
      </header>

      {/* Main landing content */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Money Talk, Dough Listens.</h1>
        <p className="text-lg text-gray-600 mb-8">
          This is your new landing page. Customize it with your content.
        </p>
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
