#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function dirSize(p) {
	let size = 0;
	for (const f of fs.readdirSync(p, { withFileTypes: true })) {
		const fp = path.join(p, f.name);
		size += f.isDirectory() ? dirSize(fp) : fs.statSync(fp).size;
	}
	return size;
}

const outDir = path.join(__dirname, '..', 'out-minimal');
if (!fs.existsSync(outDir)) {
	console.error(`out-minimal not found: ${outDir}`);
	process.exit(1);
}

const mb = (dirSize(outDir) / 1024 / 1024).toFixed(2);
console.log(`out-minimal size: ${mb} MB`);
if (parseFloat(mb) > 40) {
	process.exit(1);
}
