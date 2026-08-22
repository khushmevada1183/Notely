const EXT_MAP: Record<string, string> = {
	js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescriptreact',
	py: 'python', java: 'java', cpp: 'cpp', c: 'c', rs: 'rust', go: 'go',
	html: 'html', css: 'css', json: 'json', md: 'markdown', xml: 'xml',
	yaml: 'yaml', yml: 'yaml', sql: 'sql', sh: 'shell', bat: 'bat',
	php: 'php', rb: 'ruby', swift: 'swift', kt: 'kotlin', txt: 'plaintext',
};

export function detectLanguage(filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase() ?? '';
	return EXT_MAP[ext] ?? 'plaintext';
}
