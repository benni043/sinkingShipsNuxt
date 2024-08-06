import {defineStore} from "pinia";
import type {Cell, Player} from "~/utils/Types";

export const useMyGridStore = defineStore("myGrid", {
    state: () => ({
        grid: [] as Cell[][],
        myUserName: "",
        opponentUserName: "",
        currentPlayer: "",
    }),
    actions: {
        setGrid(newGrid: Cell[][]) {
            this.grid = newGrid;
        },
        setMyUserName(newUserName: string) {
            this.myUserName = newUserName;
        },
        setOpponentUserName(newUserName: string) {
            this.opponentUserName = newUserName;
        },
        setCurrentPlayer(newPlayer: string) {
            this.currentPlayer = newPlayer;
        }
    }
})