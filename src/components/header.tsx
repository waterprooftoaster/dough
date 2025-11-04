import Link from "next/link"
import { useIsMobile } from "@/src/hooks/use-mobile"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/src/components/ui/navigation-menu"

export function Header() {
  const isMobile = useIsMobile();
  return (
    <header className="flex items-center bg-background top-0 left-0 right-0 p-6">
      <NavigationMenu viewport={isMobile}>

      </NavigationMenu>
    </header>
  )
}

