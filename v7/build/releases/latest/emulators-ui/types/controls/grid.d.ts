export declare type GridType = "square" | "honeycomb";
export interface Cell {
    centerX: number;
    centerY: number;
}
export interface GridConfiguration {
    gridType: GridType;
    cells: Cell[][];
    columnWidth: number;
    rowHeight: number;
    columnsPadding: number;
    rowsPadding: number;
    width: number;
    height: number;
}
export interface Grid {
    getConfiguration(width: number, height: number, scale?: number): GridConfiguration;
}
export declare function getGrid(gridType: GridType): Grid;
