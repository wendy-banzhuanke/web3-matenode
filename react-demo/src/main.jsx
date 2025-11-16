/*
 * @Author: zhangjian
 * @Date: 2025-11-13 14:20:29
 * @LastEditTime: 2025-11-16 14:48:45
 * @LastEditors: zhangjian
 * @Description: UI enter
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/index.jsx'
import './index.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
