export interface Ship {
    id: number,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    originX: number,
    originY: number,
    gridPosX: number | null,
    gridPosY: number | null,
    isInGrid: boolean,
}

export interface Grid {
    color: string,
    originX: number | null,
    originY: number | null,
    id: number | null,
    w: number | null,
    h: number | null
}

export enum ShipType {
    ONE,
    TWO,
    THREE,
    FOUR,
    FIVE
}