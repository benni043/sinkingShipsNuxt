import type {NitroApp} from "nitropack";
import {Server as Engine} from "engine.io";
import {Server} from "socket.io";
import {defineEventHandler} from "h3";
import {Cord, FieldType, Game, GameState, HitResponse, Names, Player} from "~/utils/Types";
import {Cell} from "~/utils/Types";
import {pl} from "cronstrue/dist/i18n/locales/pl";

export default defineNitroPlugin((nitroApp: NitroApp) => {
    const engine = new Engine();
    const io = new Server();

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

        socket.on("startGame", async (grid: string, lobbyName: string) => {
            let player = {socketID: socket.id, gameField: JSON.parse(grid)} as Player;

            console.log(player.gameField[0][0])
            let lobby = await useStorage().getItem<Game>(lobbyName);

            if (lobby === null) {
                let game = {
                    gameStatus: GameState.WAITING,
                    isPlayer1Active: true,
                    player1: player,
                    player2: undefined
                } as Game

                await useStorage().setItem(lobbyName, game);
            } else {
                if (lobby.gameStatus !== GameState.WAITING) {
                    console.log("full")
                    socket.emit("lobbyIsFull");
                    return;
                }

                lobby.player2 = player;
                lobby.gameStatus = GameState.STARTED;

                await useStorage().setItem(lobbyName, lobby);
            }

            socket.emit("joined", grid);
        })

        socket.on("getNames", async (data: { lobbyName: string }) => {
            let lobby = await useStorage().getItem<Game>(data.lobbyName);

            if (lobby === null) return;

            if (lobby.player1) io.to(lobby.player1?.socketID).emit("start", {
                me: lobby.player1?.socketID,
                opponent: lobby.player2?.socketID,
                currentPlayer: lobby.player1.socketID
            } as Names)

            if (lobby.player2) io.to(lobby.player2?.socketID).emit("start", {
                me: lobby.player2?.socketID,
                opponent: lobby.player1?.socketID,
                currentPlayer: lobby.isPlayer1Active ? lobby.player1?.socketID : lobby.player2.socketID
            } as Names)
        })

        socket.on("hit", async (data: { cord: Cord, lobbyName: string }) => {
            let lobby = await useStorage().getItem<Game>(data.lobbyName);

            if (lobby === null) return;
            if (lobby.gameStatus !== GameState.STARTED) return;
            if (lobby.isPlayer1Active && lobby.player1!.socketID !== socket.id) return;
            if (!lobby.isPlayer1Active && lobby.player2!.socketID !== socket.id) return;

            if (lobby.isPlayer1Active) {
                let type = lobby.player2!.gameField[data.cord.x][data.cord.y].type.fieldType;
                let id = lobby.player2!.gameField[data.cord.x][data.cord.y].id!;

                if (lobby.player2!.gameField[data.cord.x][data.cord.y].type.isHit) {
                    socket.emit("alreadyHit");
                    return;
                }

                console.log(type)

                lobby.player2!.gameField[data.cord.x][data.cord.y].type.isHit = true;

                io.to(lobby.player1!.socketID).emit("hitResponse", {
                    fieldType: type,
                    opponentsField: true,
                    id: id,
                    cord: data.cord,
                    currentPlayer: lobby.player2!.socketID
                } as HitResponse);

                io.to(lobby.player2!.socketID).emit("hitResponse", {
                    fieldType: type,
                    opponentsField: false,
                    id: id,
                    cord: data.cord,
                    currentPlayer: lobby.player2!.socketID
                } as HitResponse);

                if (hasPlayerWon(lobby.player2!.gameField)) {
                    lobby.gameStatus = GameState.FINISHED;

                    io.to(lobby.player1!.socketID).emit("finished", lobby.player1!);
                    io.to(lobby.player2!.socketID).emit("finished", lobby.player1!);
                }
            } else {
                let type = lobby.player1!.gameField[data.cord.x][data.cord.y].type.fieldType;
                let id = lobby.player1!.gameField[data.cord.x][data.cord.y].id!;

                if (lobby.player1!.gameField[data.cord.x][data.cord.y].type.isHit) {
                    console.log("already hit")
                    socket.emit("alreadyHit");
                    return;
                }

                lobby.player1!.gameField[data.cord.x][data.cord.y].type.isHit = true;

                io.to(lobby.player2!.socketID).emit("hitResponse", {
                    fieldType: type,
                    opponentsField: true,
                    id: id,
                    cord: data.cord,
                    currentPlayer: lobby.player1!.socketID
                } as HitResponse);

                io.to(lobby.player1!.socketID).emit("hitResponse", {
                    fieldType: type,
                    opponentsField: false,
                    id: id,
                    cord: data.cord,
                    currentPlayer: lobby.player1!.socketID
                } as HitResponse);

                if (hasPlayerWon(lobby.player1!.gameField)) {
                    lobby.gameStatus = GameState.FINISHED;

                    io.to(lobby.player2!.socketID).emit("finished", lobby.player2!);
                    io.to(lobby.player1!.socketID).emit("finished", lobby.player2!);
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