/*
 * @Author: zhangjian
 * @Date: 2025-11-16 16:47:46
 * @LastEditTime: 2025-11-16 17:12:00
 * @LastEditors: zhangjian
 * @Description: reducer02
 */

import { useState } from 'react';

export default function TaskList({tasks, onChangeTask, onDeleteTask}) { 
  return (
    <ul>
      {
        tasks.map(task =>
          <li key={task.id}>
            <Task
              key={task.id}
              task={task}
              onChange={onChangeTask}
              onDelete={onDeleteTask}
            />
          </li>
        )
      }
    </ul>
  );
}

function Task({task, onChange, onDelete}) {
  const [isEditing, setIsEditing] = useState(false);
  let taskContext; 
  if(isEditing) {
    taskContext = (
      <>
        <input 
          value={task.text}
          onChange={e => onChange({...task, text: e.target.value})} />
        <button onClick={() => setIsEditing(false)}>保存</button>
      </>
    )
  } else {
    taskContext = (
      <>
        {task.text}
        <button onClick={() => setIsEditing(true)}>编辑</button>
      </>
    )
  }


  return (
    <>
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => {
          onChange({
            ...task,
            done: e.target.checked,
          });
        }}
      />
      {taskContext}
      <button onClick={() => onDelete(task.id)}>删除</button>
    </>
  );
}