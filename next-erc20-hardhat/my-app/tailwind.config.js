import path from 'path';
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // PNPM动态路径解决方案
    path.join(
      path.dirname(require.resolve('@wendy-banzhuanke/wallet-connect-kit')),
      'dist/**/*.js'
    ),
    // 硬链接后备方案
    '../../node_modules/.pnpm/@wendy-banzhuanke+wallet-connect-kit@*/*/dist/**/*.js'
  ]
}