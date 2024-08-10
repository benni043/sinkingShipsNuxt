import type {NitroApp} from "nitropack";
import {Server as Engine} from "engine.io";
import {Server} from "socket.io";
import {defineEventHandler} from "h3";
import {Cord, FieldType, Game, GameState, HitResponse, Names, Player} from "~/utils/Types";
import {Cell} from "~/utils/Types";

export default defineNitroPlugin((nitroApp: NitroApp) => {
    const engine = new Engine();
    const io = new Server({
        cors: {
            origin: "http://localhost:3000"
        }
    });

    io.bind(engine);

    io.on("connection", (socket) => {
        socket.on("user-disconnect", async (data: { id: string, lobbyName: string }) => {
            console.log("disconnected: " + data.id)
            let lobby = await useStorage().getItem<Game>(data.lobbyName);

            if (lobby === null) return;

            if (lobby.player1 && data.id === lobby.player1.socketID) lobby.player1 = undefined;
            if (lobby.player2 && data.id === lobby.player2.socketID) lobby.player2 = undefined;

            await useStorage().setItem(data.lobbyName, lobby);

            if (!lobby.player1 && !lobby.player2) await useStorage().removeItem(data.lobbyName);
        })

        socket.on("postField", async (grid: string, lobbyName: string, userName: string) => {
            let player = {socketID: socket.id, gameField: JSON.parse(grid) as Cell[][], username: userName} as Player;

            let lobby = await useStorage().getItem<Game>(lobbyName);

            if (lobby === null) {
                let game = {
                    gameStatus: GameState.JOINING,
                    isPlayer1Active: true,
                    player1: player,
                    player2: undefined
                } as Game

                await useStorage().setItem(lobbyName, game);
            } else {
                if (lobby.gameStatus !== GameState.JOINING) {
                    socket.emit("lobbyIsFull");
                    return;
                }

                if (socket.id === lobby.player1!.socketID) {
                    socket.emit("playerAlreadyExists");
                    return;
                }

                lobby.player2 = player;
                lobby.gameStatus = GameState.RUNNING;

                await useStorage().setItem(lobbyName, lobby);

                io.to(lobby.player1!.socketID).emit("starting", {
                    me: lobby.player1!.username,
                    opponent: lobby.player2!.username,
                    currentPlayer: lobby.isPlayer1Active ? lobby.player1!.username : lobby.player2!.username
                } as Names)

                io.to(lobby.player2!.socketID).emit("starting", {
                    me: lobby.player2!.username,
                    opponent: lobby.player1!.username,
                    currentPlayer: lobby.isPlayer1Active ? lobby.player1!.username : lobby.player2!.username
                } as Names)
            }

            socket.emit("postFieldSucceeded");
        })

        socket.on("hit", async (data: { cord: Cord, lobbyName: string }) => {
            let lobby = await useStorage().getItem<Game>(data.lobbyName);

            if (lobby === null) return;
            if (lobby.gameStatus !== GameState.RUNNING) return;
            if ((lobby.isPlayer1Active && lobby.player1!.socketID !== socket.id) || (!lobby.isPlayer1Active && lobby.player2!.socketID !== socket.id)) {
                socket.emit("notYourTurn");
                return;
            }

            if (lobby.isPlayer1Active) {
                let type = lobby.player2!.gameField[data.cord.x][data.cord.y].type.fieldType;

                if (lobby.player2!.gameField[data.cord.x][data.cord.y].type.isHit) {
                    socket.emit("alreadyHit");
                    return;
                }

                let id = lobby.player2!.gameField[data.cord.x][data.cord.y].id!;

                lobby.player2!.gameField[data.cord.x][data.cord.y].type.isHit = true;

                io.to(lobby.player1!.socketID).emit("hitSucceeded", {
                    fieldType: type,
                    opponentsField: true,
                    id: id,
                    cord: data.cord,
                    currentPlayer: lobby.player2!.username
                });

                io.to(lobby.player2!.socketID).emit("hitSucceeded", {
                    fieldType: type,
                    opponentsField: false,
                    id: id,
                    cord: data.cord,
                    currentPlayer: lobby.player2!.username
                });

                if (hasPlayerWon(lobby.player2!.gameField)) {
                    lobby.gameStatus = GameState.FINISHED;

                    io.to(lobby.player1!.socketID).emit("gameEnd", lobby.player1!.username);
                    io.to(lobby.player2!.socketID).emit("gameEnd", lobby.player1!.username);
                }
            } else {
                let type = lobby.player1!.gameField[data.cord.x][data.cord.y].type.fieldType;

                if (lobby.player1!.gameField[data.cord.x][data.cord.y].type.isHit) {
                    socket.emit("alreadyHit");
                    return;
                }

                let id = lobby.player1!.gameField[data.cord.x][data.cord.y].id!;

                lobby.player1!.gameField[data.cord.x][data.cord.y].type.isHit = true;

                io.to(lobby.player2!.socketID).emit("hitSucceeded", {
                    fieldType: type,
                    opponentsField: true,
                    id: id,
                    cord: data.cord,
                    currentPlayer: lobby.player1!.username
                } as HitResponse);

                io.to(lobby.player1!.socketID).emit("hitSucceeded", {
                    fieldType: type,
                    opponentsField: false,
                    id: id,
                    cord: data.cord,
                    currentPlayer: lobby.player1!.username
                } as HitResponse);

                if (hasPlayerWon(lobby.player1!.gameField)) {
                    lobby.gameStatus = GameState.FINISHED;

                    io.to(lobby.player2!.socketID).emit("gameEnd", lobby.player2!.username);
                    io.to(lobby.player1!.socketID).emit("gameEnd", lobby.player2!.username);
                }
            }

            lobby.isPlayer1Active = !lobby.isPlayer1Active;

            await useStorage().setItem(data.lobbyName, lobby);
        })

        function hasPlayerWon(opponentsField: Cell[][]) {
            for (let row of opponentsField) {
                for (let cell of row) {
                    if (cell.type.fieldType === FieldType.SHIP && !cell.type.isHit) {
                        return false;
                    }
                }
            }

            return true;
        }

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