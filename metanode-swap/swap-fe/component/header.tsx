import React from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

export default function Header({value, handleChange} : {value: number, handleChange: (event: React.SyntheticEvent, newValue: number) => void}) {
    return (
    <div className="flex justify-between p-4 w-full border-b-1 border-b-green-700 dark:border-b-green-700">
      <div className="text-2xl font-bold">Metanode Swap</div>
      <Tabs value={value} onChange={handleChange} aria-label="disabled tabs example">
        <Tab label="swap" value={0} />
        <Tab label="pool" value={1} />
       </Tabs>
      <ConnectButton />
    </div>
  );
}