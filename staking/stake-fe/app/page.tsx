"use client"

import { useState } from 'react';
import Image from "next/image";
import HeaderComp from "@/components/header";
import StakeComp from "@/components/stake";
import WithdrawComp from "@/components/withdraw"

const COMPONENTS = [
  { component: StakeComp },
  { component: WithdrawComp }
]

export default function Home() {
  const [currentMenu, setCurrentMenu] = useState(0)
  const CurrentComponent = COMPONENTS[currentMenu].component

  return (
    <div className="h-lvh w-lvw bg-stone-800 flex flex-col items-center">
      <HeaderComp currentMenu={currentMenu} onMenuChange={setCurrentMenu}/>
      <main className={`container mt-10 animate-in rounded-lg fade-in duration-200 bg-stone-700 flex items-center justify-center ${currentMenu == 1 ? 'w-8/12' : 'w-5/12'}`}>
        <CurrentComponent />
      </main>
    </div>
  );
}
