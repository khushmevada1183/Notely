export type ToggleOption = 'on' | 'off';

export function toggleValue(current: ToggleOption): ToggleOption {
	return current === 'off' ? 'on' : 'off';
}
