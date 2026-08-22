import { getThemes } from './theme-service';

export function showThemeSelector(onSelect: (themeId: string) => void): void {
	const overlay = document.createElement('div');
	overlay.className = 'theme-selector-overlay';
	const list = document.createElement('div');
	list.className = 'theme-selector-list';

	for (const theme of getThemes()) {
		const item = document.createElement('button');
		item.type = 'button';
		item.className = 'theme-item';
		item.textContent = `${theme.label} (${theme.uiTheme})`;
		item.onclick = () => { onSelect(theme.id); overlay.remove(); };
		list.appendChild(item);
	}

	overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
	document.addEventListener('keydown', function esc(e) {
		if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
	});

	overlay.appendChild(list);
	document.body.appendChild(overlay);
}
