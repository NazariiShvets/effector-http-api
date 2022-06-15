import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const external = [
  'react',
  'react-dom',
  'effector',
  'effector-react',
  'effector-react/scope'
];

const getPlugins = ({ reactSsr = false } = {}) => [
  typescript({
    clean: true
  }),

  babel({
    exclude: 'node_modules/**',

    extensions: ['.js', '.jsx', '.ts', '.tsx'],

    runtimeHelpers: true,

    presets: [
      '@babel/preset-env',
      '@babel/preset-typescript',
      '@babel/preset-react'
    ],

    plugins: [
      '@babel/plugin-transform-runtime',
      [
        'effector/babel-plugin',
        {
          reactSsr: false,
          factories: ['src/index.ts']
        }
      ],

      ...(reactSsr
        ? [
            [
              'module-resolver',
              {
                root: ['./src'],
                alias: {
                  'effector-react': 'effector-react/scope'
                }
              }
            ]
          ]
        : [])
    ]
  }),

  nodeResolve({
    jsnext: true,

    skip: ['effector'],

    extensions: ['.js', '.mjs']
  }),

  commonjs({
    extensions: ['.js', '.mjs']
  }),

  terser()
];

const output = {
  file: './index.js',

  format: 'cjs',

  freeze: false,

  exports: 'named',

  sourcemap: true,

  externalLiveBindings: false
};

export default [
  {
    input: './src/index.ts',

    plugins: getPlugins({ reactSsr: false }),

    external,

    output
  }
];
