/**
 * Build configuration for Minimal Editor
 * This configuration defines entry points, output settings, and bundling options
 * for the minimal, lightweight editor application derived from VS Code.
 */

module.exports = {
	// Entry points for the application
	entryPoints: {
		main: 'src/minimal-main.ts',       // Electron main process
		renderer: 'src/minimal-renderer.ts', // Renderer process (browser window)
		preload: 'src/minimal-preload.ts'   // Preload script for IPC
	},

	// Output configuration
	output: {
		dir: 'out-minimal',  // Output directory
		format: 'cjs'        // CommonJS format for Electron compatibility
	},

	// External dependencies (not bundled)
	external: [
		'electron',    // Electron framework
		'fs',          // Node.js file system
		'path',        // Node.js path utilities
		'crypto',      // Node.js crypto
		'os'           // Node.js OS utilities
	],

	// Bundle configuration
	bundle: {
		monaco: true,    // Bundle Monaco editor
		themes: true,    // Include theme definitions
		grammars: true   // Include TextMate grammars
	}
};
