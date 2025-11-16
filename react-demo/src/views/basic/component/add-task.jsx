/*
 * @Author: zhangjian
 * @Date: 2025-11-16 16:45:01
 * @LastEditTime: 2025-11-16 16:47:03
 * @LastEditors: zhangjian
 * @Description: reducer01
 */

import { useState } from "react";

export default function AddTask({ onAddTask }) {

  const [text, setText] = useState("");

  return (
    <>
      <input
        placeholder="添加任务"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={() => {
        setText("");
        onAddTask(text);
      }}>
        添加
      </button>
    </>
  );
}