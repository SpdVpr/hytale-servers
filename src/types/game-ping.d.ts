declare module 'craftping' {
    interface PingResult {
        version: {
            name: string;
            protocol: number;
        };
        players: {
            max: number;
            online: number;
            sample?: Array<{ name: string; id: string }>;
        };
        motd: string | { text: string };
        favicon?: string;
    }

    export function ping(host: string, port?: number): Promise<PingResult>;
}

declare module 'minecraft-ping' {
    interface PingResult {
        version: {
            name: string;
            protocol: number;
        };
        players: {
            max: number;
            online: number;
        };
        description: string | { text: string };
    }

    export function ping(host: string, port: number, callback: (err: Error | null, result: PingResult) => void): void;
}
