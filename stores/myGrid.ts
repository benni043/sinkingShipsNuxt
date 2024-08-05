import {defineStore} from "pinia";
import type {Cell} from "~/utils/Types";

export const useMyGridStore = defineStore("myGrid", {
    state: () => ({
        grid: [] as Cell[][]
    }),
    actions: {
        setGrid(newGrid: Cell[][]) {
            this.grid = newGrid;
        },
    }
})