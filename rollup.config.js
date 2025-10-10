import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = true// !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',	
	output: {
		file: 'public/index.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: !production
	},
	plugins: [
		resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts date-fns to ES modules
		production && terser() // minify, but only in production
	]
};