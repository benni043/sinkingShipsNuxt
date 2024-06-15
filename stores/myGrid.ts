import {defineStore} from "pinia";
import type {Grid} from "~/utils/SinkingShipTypes";

export const useMyGridStore = defineStore("myGrid", {
    state: () => ({
        grid: [] as Grid[][]
    }),
    actions: {
        setGrid(newGrid: Grid[][]) {
            this.grid = newGrid;
        },
    }
})