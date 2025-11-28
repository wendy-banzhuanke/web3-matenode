/*
 * @Author: zhangjian
 * @Date: 2025-11-28 09:28:04
 * @LastEditTime: 2025-11-28 10:34:39
 * @LastEditors: zhangjian
 * @Description: 导航组件
 */

import type { ReactNode } from 'react'

interface MenuItem {
  name: string
  index: number
  icon?: ReactNode
}
export default function Navigation({menuList, currentMenu, onChange}: {menuList:MenuItem[], currentMenu: number, onChange: (index: number) => void}) {
  
  return (
    // <NavigationMenu>
    //   <NavigationMenuList>
    //     <NavigationMenuItem>
    //       <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
    //       <NavigationMenuContent>
    //         <NavigationMenuLink>Link</NavigationMenuLink>
    //       </NavigationMenuContent>
    //     </NavigationMenuItem>
    //   </NavigationMenuList>
 
    // </NavigationMenu>
    <div className="flex items-center gap-20 text-muted">
      {
        menuList.map(item => {
          return (
            <div 
              key={item.index} 
              className={`cursor-pointer text-2xl ${
                currentMenu === item.index
                  ? 'font-semibold text-white border-b-1 border-white'
                  : 'text-muted-foreground hover:text-muted/80'
              }`}
              onClick={() => onChange(item.index)}>{item.name}</div>
          )
        })
      }
    </div>
  )
}