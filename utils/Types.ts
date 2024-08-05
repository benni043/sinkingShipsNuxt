export interface Cell {
    type: Type;
    id: number | undefined;
    color: string;
    x: number;
    y: number;
    originX: number;
    originY: number;
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
    id: number | undefined,
    cord: Cord,
    currentPlayer: string,
}

export interface ShipCount {
    shipType: ShipType,
    count: number,
    remaining: number,
}

export interface Stats {
    winner: string,
    waterHits: number,
    playTime: number,
    lobby: string
}

export interface Names {
    me: string,
    opponent: string,
    currentPlayer: string
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
    gameField: Cell[][]
}

export enum GameState {
    JOINING,
    RUNNING,
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