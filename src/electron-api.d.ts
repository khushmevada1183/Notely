export interface ElectronAPI {
	platform: string;
	invoke(channel: string, ...args: unknown[]): Promise<unknown>;
	on(channel: string, listener: (...args: unknown[]) => void): void;
	send(channel: string, ...args: unknown[]): void;
}

declare global {
	interface Window {
		electronAPI: ElectronAPI;
	}
}
