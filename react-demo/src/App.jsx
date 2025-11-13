/*
 * @Author: zhangjian
 * @Date: 2025-11-11 11:34:04
 * @LastEditTime: 2025-11-11 15:41:20
 * @LastEditors: zhangjian
 * @Description: react learning
 */
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BasicDemo from './views/basic-demo.jsx'
import TODOList from './views/todo-list.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BasicDemo />
      <TODOList />
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default App
