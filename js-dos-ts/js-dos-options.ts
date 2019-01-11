export class DosOptions {
    public canvas: string;
    public wdosboxUrl?: string;
    public log?: (message: string) => void;
    public onready?: () => void;
    public onerror?: (message: string) => void;
}
