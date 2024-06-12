import type {NitroApp} from "nitropack";
import {Server as Engine} from "engine.io";
import {Server} from "socket.io";
import {defineEventHandler} from "h3";
import {Cord, Game, GameState, Grid, HitResponse, Player} from "~/utils/SinkingShipTypes";

export default defineNitroPlugin((nitroApp: NitroApp) => {
    const engine = new Engine();
    const io = new Server();

    io.bind(engine);

    io.on("connection", (socket) => {
        socket.on("login", (id: { id: string }) => {
            socket.emit("loggedin", id.id);
        });

        socket.on("startGame", async (grid: string, lobbyName: string) => {
            let player = {socketID: socket.id, gameField: JSON.parse(grid)} as Player;

            let lobby = await useStorage().getItem<Game>(lobbyName);

            console.log(lobby)

            if (lobby === null) {
                let game = {
                    gameStatus: GameState.WAITING,
                    isPlayer1Active: true,
                    player1: player,
                    player2: undefined
                } as Game

                await useStorage().setItem(lobbyName, game);
            } else {
                lobby.player2 = player;
                lobby.gameStatus = GameState.STARTED;

                await useStorage().removeItem(lobbyName);
                await useStorage().setItem(lobbyName, lobby);
            }
        })

        socket.on("hit", async (cord: Cord, lobbyName: string) => {
            let lobby = await useStorage().getItem<Game>(lobbyName);

            if (lobby === null) return;
            if (lobby.isPlayer1Active && lobby.player1.socketID !== socket.id) return;
            if (!lobby.isPlayer1Active && lobby.player2!.socketID !== socket.id) return;

            if (lobby.isPlayer1Active) {
                let type = lobby.player2!.gameField[cord.x][cord.y].type;

                io.to(lobby.player1.socketID).emit("hitResponse", {
                    fieldType: type,
                    opponentsField: true,
                    cord: cord
                } as HitResponse);

                io.to(lobby.player2!.socketID).emit("hitResponse", {
                    fieldType: type,
                    opponentsField: false,
                    cord: cord
                } as HitResponse);

                console.log(0)
            } else {
                let type = lobby.player1.gameField[cord.x][cord.y].type;

                io.to(lobby.player2!.socketID).emit("hitResponse", {
                    fieldType: type,
                    opponentsField: true,
                    cord: cord
                } as HitResponse);

                io.to(lobby.player1.socketID).emit("hitResponse", {
                    fieldType: type,
                    opponentsField: false,
                    cord: cord
                } as HitResponse);

                console.log(1)
            }

            lobby.isPlayer1Active = !lobby.isPlayer1Active;

            await useStorage().removeItem(lobbyName);
            await useStorage().setItem(lobbyName, lobby);
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