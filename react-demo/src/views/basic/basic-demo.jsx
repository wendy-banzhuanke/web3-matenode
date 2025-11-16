/*
 * @Author: zhangjian
 * @Date: 2025-11-11 14:14:57
 * @LastEditTime: 2025-11-16 14:47:08
 * @LastEditors: zhangjian
 * @Description: 基础组件学习
 */

import { useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'

function MyButton({number, onClick}) {

  const [count, setCount] = useState(0);

  function handleClick() {
    console.log("handleClick==click me")
    onClick()
    setCount(count + 1)
  }

  return (
    <button onClick={handleClick}>
      我点了{count}次,按钮被点击了{number}次
    </button>
  );
}

function ProductList() {
  const products = [
    { title: '卷心菜', isFruit: false, id: 1 },
    { title: '大蒜', isFruit: false, id: 2 },
    { title: '苹果', isFruit: true, id: 3 },
  ]
  return (<ul>
    {
        products.map(product =>
          <li
            key={product.id}
            style={{
              color: product.isFruit ? 'magenta' : 'darkgreen'
            }}
          >
            {product.title}
          </li>
        )
    }
  </ul>)
}

export default function MyApp() {
  const user = {
    name: 'Harper',
    avatar: 'https://i.imgur.com/yXOvdOSs.jpg',
    size: 90
  }

  const navigate = useNavigate()
  const [number, setNumber] = useState(0)
  
  const handleButtonClick = () => {
    setNumber(number + 1)
  }
  
  return (
    <div>
      {/* <button onClick={() => navigate('/basic')}>react-基础练习</button> */}
      <button onClick={() => navigate('/basic/todo-list')}>react-TodoList</button>
      <h1>Welcome to my app</h1>
      <p>按钮一：<MyButton number={number} onClick={handleButtonClick} /></p>
      <p>按钮二：<MyButton number={number} onClick={handleButtonClick} /></p>
      <p>{user.name}</p>
      <img 
        className="avatar"
        src={user.avatar}
        alt={'Photo of ' + user.name}
        style={{
          width: user.size,
          height: user.size
        }} />

      <ProductList />
      <Outlet />
    </div>
  );
}

