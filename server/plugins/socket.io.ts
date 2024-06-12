import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server } from "socket.io";
import { defineEventHandler } from "h3";
import {Cord, Grid} from "~/utils/SinkingShipTypes";

export default defineNitroPlugin((nitroApp: NitroApp) => {
    const engine = new Engine();
    const io = new Server();

    io.bind(engine);

    io.on("connection", (socket) => {
        socket.on("login", (id: {id: string}) => {
            socket.emit("loggedin", id.id);
        });

        socket.on("startGame", (grid: string) => {
            let parsedGrid: Grid[][] = JSON.parse(grid);

            //todo save grid and create player
        })

        socket.on("hit", (cord: Cord) => {
            //.emit(hitResponse, () => hitResponse: HitResponse)
        })

    });

    nitroApp.router.use("/socket.io/", defineEventHandler({
        handler(event) {
            engine.handleRequest(event.node.req, event.node.res);
            event._handled = true;
        },
        websocket: {
            open(peer) {
                const nodeContext = peer.ctx.node;
                const req = nodeContext.req;

                // @ts-expect-error private method
                engine.prepare(req);

                const rawSocket = nodeContext.req.socket;
                const websocket = nodeContext.ws;

                // @ts-expect-error private method
                engine.onWebSocket(req, rawSocket, websocket);
            }
        }
    }));
});