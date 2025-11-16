/*
 * @Author: zhangjian
 * @Date: 2025-11-11 11:34:04
 * @LastEditTime: 2025-11-11 15:41:20
 * @LastEditors: zhangjian
 * @Description: react learning
 */
import './App.css'
import { useNavigate, Outlet } from 'react-router-dom'

function App() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <button onClick={() => navigate('/basic')}>react-基础练习</button>
      </div>

      <Outlet />
    </div>
  )
}

export default App
