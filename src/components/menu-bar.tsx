// import { Link } from "next/link"

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

export function MenuBar(){
    return (
         <header className="flex justify-center p-6 bg-white shadow-md">
        
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item1</NavigationMenuTrigger>



                <NavigationMenuContent>
                  <NavigationMenuLink>Link1</NavigationMenuLink>
                </NavigationMenuContent>



            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

          <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item1</NavigationMenuTrigger>



                <NavigationMenuContent>
                  <NavigationMenuLink>Link1</NavigationMenuLink>
                </NavigationMenuContent>



            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        </header>
    )
}