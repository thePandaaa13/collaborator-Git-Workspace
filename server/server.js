import app from "./src/app.js";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import * as Y from "yjs";

import {
    getDocument
} from "./src/services/collaboration.service.js";


dotenv.config();


const server = http.createServer(app);


const io = new Server(server, {

    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }

});


// ==================================================
// SOCKET CONNECTION
// ==================================================

io.on("connection", (socket) => {

    console.log(
        "User connected on socket:",
        socket.id
    );


    // ==================================================
    // JOIN ROOM
    // ==================================================

    socket.on("join-room", (data) => {

        const {
            sessionID,
            name,
            role
        } = data;


        if (!sessionID) {

            console.log(
                "No sessionID provided"
            );

            return;
        }


        // Join Socket.IO room

        socket.join(sessionID);


        console.log(
            `Socket ${socket.id} joined room ${sessionID}`
        );


        // Get the Yjs document for this session

        const doc =
            getDocument(sessionID);


        // ==================================================
        // INITIAL SYNC
        // ==================================================
        //
        // IMPORTANT:
        //
        // Leader already has the file locally.
        //
        // Therefore:
        //
        // leader       -> NO initial sync
        // collaborator -> RECEIVE initial sync
        //
        // ==================================================

        if (role === "collaborator") {

            const update =
                Y.encodeStateAsUpdate(doc);


            socket.emit(
                "initial-sync",
                Array.from(update)
            );


            console.log(
                "Initial Yjs state sent to collaborator:",
                socket.id
            );

        }


        // ==================================================
        // USER JOINED
        // ==================================================

        io.to(sessionID).emit(
            "user-joined",
            {

                socketID:
                    socket.id,

                name:
                    name,

                role:
                    role

            }
        );

    });


    // ==================================================
    // YJS UPDATE
    // ==================================================

    socket.on(
        "y-update",
        ({ sessionID, update }) => {


        console.log(
            "1. Yjs update received from:",
            socket.id
        );


        if (!sessionID) {

            console.log(
                "No sessionID in Yjs update"
            );

            return;
        }


        // Get server-side Y.Doc

        const doc =
            getDocument(sessionID);


        // Convert received array back
        // into Uint8Array

        const uint8Array =
            new Uint8Array(update);


        // Apply update to server document

        Y.applyUpdate(
            doc,
            uint8Array
        );


        console.log(
            "2. Server Yjs content:",
            doc
                .getText("code")
                .toString()
        );


        // ==================================================
        // BROADCAST
        // ==================================================
        //
        // Send update to everyone ELSE
        // in this collaboration room.
        //
        // The sender doesn't need the update
        // because they already have it.
        //
        // ==================================================

        socket
            .to(sessionID)
            .emit(
                "y-update",
                update
            );


        console.log(
            "3. Yjs update broadcasted to room:",
            sessionID
        );

    });


    // ==================================================
    // OLD CODE CHANGE
    // ==================================================
    //
    // Not used by Yjs collaboration.
    //
    // Keeping it temporarily.
    //
    // ==================================================

    socket.on(
        "code-change",
        (data) => {

            const {
                sessionID,
                path,
                content
            } = data;


            socket
                .to(sessionID)
                .emit(
                    "code-change",
                    {

                        path:
                            path,

                        content:
                            content

                    }
                );

        }
    );


    // ==================================================
    // DISCONNECT
    // ==================================================

    socket.on(
        "disconnect",
        () => {

            console.log(
                "User disconnected:",
                socket.id
            );

        }
    );

});


// ==================================================
// START SERVER
// ==================================================

const PORT = 5000;


server.listen(
    PORT,
    () => {

        console.log(
            `server is running on port ${PORT}`
        );

    }
);