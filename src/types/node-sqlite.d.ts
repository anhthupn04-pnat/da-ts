declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean; readOnly?: boolean });
    exec(sql: string): void;
    prepare(sql: string): {
      run(...args: any[]): { changes: number; lastInsertRowid: number | bigint };
      get(...args: any[]): any;
      all(...args: any[]): any[];
    };
    close(): void;
  }
}
