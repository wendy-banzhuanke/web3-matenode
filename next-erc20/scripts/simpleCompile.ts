/*
 * @Author: zhangjian
 * @Date: 2025-11-17 14:01:16
 * @LastEditTime: 2025-11-17 14:40:33
 * @LastEditors: zhangjian
 * @Description: simple编译
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import solc from 'solc';

// --- ESM 环境下的路径处理 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. 增强版文件解析器
function findImport(path: string) {
  const tryPaths = [
    // 从 node_modules 解析（支持 OpenZeppelin）
    resolve(__dirname, '../node_modules', path),
    // 从本地 contracts 目录解析
    resolve(__dirname, '../contracts', path),
    // 原始路径尝试
    path
  ];

  for (const tryPath of tryPaths) {
    if (existsSync(tryPath)) {
      return { contents: readFileSync(tryPath, 'utf-8') };
    }
  }
  return { error: `File not found: ${path}` };
}

// 2. 读取合约源码（使用绝对路径）
const contractPath = resolve(__dirname, '../contracts/simple/SimpleToken.sol');
const source = readFileSync(contractPath, 'utf-8');

// 3. 编译配置
const input = {
  language: 'Solidity',
  sources: {
    [contractPath]: {
      content: source
    }
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode']
      }
    }
  }
};

try {
  // 4. 执行编译
  console.log('🔧 开始编译...');
  const output = JSON.parse(
    solc.compile(
      JSON.stringify(input),
      { import: findImport }
    )
  );

  // 5. 错误处理
  if (output.errors) {
    const errors = output.errors
      .filter((e: any) => e.severity === 'error')
      .map((e: any) => e.formattedMessage);
      
    if (errors.length > 0) {
      throw new Error(`❌ 编译错误:\n${errors.join('\n')}`);
    }
  }

  // 6. 提取编译结果（使用绝对路径作为key）
  const artifact = output.contracts[contractPath]?.SimpleToken;
  if (!artifact) {
    throw new Error('编译结果中没有找到 SimpleToken');
  }

  // 7. 输出文件
  const outputPath = resolve(__dirname, '../contracts/simple/SimpleToken.json');
  writeFileSync(outputPath, JSON.stringify(artifact, null, 2));
  console.log('✅ 编译成功！文件已保存至:', outputPath);

} catch (err) {
  console.error('🔥 编译失败:', err instanceof Error ? err.message : err);
  process.exit(1);
}
