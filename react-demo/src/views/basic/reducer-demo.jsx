/*
 * @Author: zhangjian
 * @Date: 2025-11-16 16:43:14
 * @LastEditTime: 2025-11-16 17:25:34
 * @LastEditors: zhangjian
 * @Description: reducer-demo
 */

import { useState, useReducer } from 'react';
import TaskList from "./component/task-list";
import AddTask from "./component/add-task";
import tasksReducer from "./taskReducer.js";

const initialTasks = [
  {id: 0, text: '参观卡夫卡博物馆', done: true},
  {id: 1, text: '看木偶戏', done: false},
  {id: 2, text: '打卡列侬墙', done: false},
];

let nextId = 3;

export default function TaskApp() {
  // const [tasks, setTasks] = useState(initialTasks);
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text,
    });
  }

  function handleChangeTask(task) {
    dispatch({
      type: 'changed',
      task: task,
    });
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId,
    });
  }

  return (
    <>
      <h1>布拉格的行程安排</h1>
      <AddTask onAddTask={handleAddTask} />
      <TaskList 
        tasks={tasks} 
        onChangeTask={handleChangeTask} 
        onDeleteTask={handleDeleteTask} />
    </>
  );
}