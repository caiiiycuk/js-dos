import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { loadRuntime, playerOptions } from "./runtime.js";

@Component({
    selector: "app-root",
    standalone: true,
    template: '<div #container style="width:100%;height:100%;min-height:480px"></div><p role="alert">{{error}}</p>',
})
class Player implements AfterViewInit, OnDestroy {
    @ViewChild("container", { static: true }) container!: ElementRef<HTMLDivElement>;
    error = "";
    private disposed = false;
    private player?: { stop(): Promise<void> };
    async ngAfterViewInit() {
        try {
            const createDos = await loadRuntime();
            if (!this.disposed) this.player = createDos(this.container.nativeElement, playerOptions());
        } catch (failure) { if (!this.disposed) this.error = String(failure); }
    }
    ngOnDestroy() { this.disposed = true; void this.player?.stop(); }
}
bootstrapApplication(Player).catch(console.error);
