"use client";
import "./globals.css";
import React from "react";
import { Providers } from "./provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Material Icons 字体链接 */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>
      <body className="font-sans antialiased"> 
        <Providers> {children} </Providers>
      </body>
    </html>
  );
}
