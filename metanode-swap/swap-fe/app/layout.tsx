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
      <body className="font-sans antialiased"> 
        <Providers> {children} </Providers>
      </body>
    </html>
  );
}
