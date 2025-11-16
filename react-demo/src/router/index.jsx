/*
 * @Author: zhangjian
 * @Date: 2025-11-16 14:39:41
 * @LastEditTime: 2025-11-16 17:09:01
 * @LastEditors: zhangjian
 * @Description: 描述
 */
import { createBrowserRouter } from 'react-router-dom'
import App from '../App.jsx'
import BasicDemo from '../views/basic/basic-demo.jsx'
import TODOList from '../views/basic/todo-list.jsx'
import ReducerDemo from '../views/basic/reducer-demo.jsx'
import AdvanceDemo from '../views/advance/advance-demo.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'basic',
        element: <BasicDemo />,
        children: [
          { path: 'todo-list', element: <TODOList /> },
          { path: 'reducer-demo', element: <ReducerDemo /> }
        ]
      },
      {
        path: 'advance',
        element: <AdvanceDemo />
      }
    ]
  }
])

export default router