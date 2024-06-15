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
    type: Type,
    originX: number | null,
    originY: number | null,
    id: number | null,
    w: number | null,
    h: number | null
}

export interface Type {
    fieldType: FieldType,
    isHit: boolean
}

export interface Cord {
    x: number,
    y: number
}

export interface HitResponse {
    opponentsField: boolean,
    fieldType: FieldType,
    id: number | null,
    cord: Cord
}

export enum ShipType {
    ONE,
    TWO,
    THREE,
    FOUR,
    FIVE
}

export enum FieldType {
    SHIP,
    WATER
}

export interface Player {
    socketID: string,
    gameField: Grid[][]
}

export enum GameState {
    WAITING,
    STARTED,
    FINISHED
}

export interface Game {
    player1: Player | undefined,
    player2: Player | undefined,
    isPlayer1Active: boolean,
    gameStatus: GameState,
}

export const WATER = "blue";
export const SHIP = "red";