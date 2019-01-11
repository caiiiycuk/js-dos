export class DosOptions {
    public canvas: HTMLCanvasElement;
    public wdosboxUrl?: string;
    public log?: (message: string) => void;
    public onready?: (main: (args: string[]) => void) => void;
    public onprogress?: (total: number, loaded: number) => void;
    public onerror?: (message: string) => void;
}
