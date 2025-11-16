import { createBrowserRouter } from 'react-router-dom'
import App from '../App.jsx'
import BasicDemo from '../views/basic/basic-demo.jsx'
import TODOList from '../views/basic/todo-list.jsx'
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
          { path: 'todo-list', element: <TODOList /> }
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