import typescript from 'rollup-plugin-typescript2'
import babel from 'rollup-plugin-babel'
import {terser} from 'rollup-plugin-terser'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import jsonPlugin from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import bundleSize from 'rollup-plugin-bundle-size'


const external = [
  'effector',
  'axios',
  'deepmerge'
];

const plugins =  [
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
    ],

    plugins: [
      '@babel/plugin-transform-runtime',
      [
        'effector/babel-plugin',
        {
          factories: ['src/index.ts']
        }
      ],
    ]
  }),

  nodeResolve({
    jsnext: true,

    skip: ['effector', 'axios', 'deepmerge'],

    extensions: ['.js', '.mjs']
  }),

  commonjs({
    extensions: ['.js', '.mjs']
  }),

  terser(),

  jsonPlugin(),

  copy({
    targets: [{ src: 'src/codegen-template', dest: '/' },]
  }),

  bundleSize()
];

const output = {

  file: './dist/index.js',

  format: 'cjs',

  freeze: false,

  exports: 'named',

  sourcemap: true,

  externalLiveBindings: false
};

export default [
  {
    input: './src/index.ts',

    plugins,

    external,

    output
  }
];
