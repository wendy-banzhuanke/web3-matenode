import path from 'path';

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      config: path.join(__dirname, 'tailwind.config.js')
    },
    // tailwindcss: {
    //   config: path.join(__dirname, 'tailwind.config.js')
    // },
    autoprefixer: {},
  },
};

export default config;
