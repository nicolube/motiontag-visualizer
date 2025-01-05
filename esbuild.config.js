import * as esbuild from 'esbuild'
import esbuildPluginTsc from 'esbuild-plugin-tsc'

function createBuildSettings(options) {
	return {
		// platform: "brow"
		entryPoints: ['src/index.ts'],
		outfile: './build/bundle.js',
		bundle: true,
		plugins: [
			esbuildPluginTsc({
				force: true,
			}),
		],
		loader: {
			'.png': 'file',
		},
		assetNames: '[name]',
		...options,
	}
}

if (process.argv[2] == '--serve') {
	const context = await esbuild.context(
		createBuildSettings({
			sourcemap: true,
			publicPath: './build/',
			banner: {
				js: `new EventSource('/esbuild').addEventListener('change', () => location.reload());`,
			},
		})
	)

	await context.watch()

	const { host, port } = await context.serve({
		port: 5500,
		servedir: './',
		fallback: './index.html',
	})

	console.log(`Serving app at ${host}:${port}.`)
} else if (process.argv[2] == '--build') {
	await esbuild.build(createBuildSettings({ minify: true, publicPath: './build/' }))
} else {
	console.log('Specify operation mode: --build or --serve')
}
