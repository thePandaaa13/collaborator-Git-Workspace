import crypto from "crypto";
import pool from "../config/db.js";
import { getDocument } from "../services/collaboration.service.js";
import * as Y from "yjs"


// ==================================================
// CREATE COLLABORATION
// ==================================================

export const createCollaboration = async (req, res) => {

    const userId = req.user.id;

    const repoId = req.params.repoId;

    const { filePath } = req.body;


    if (!filePath) {

        return res
            .status(400)
            .send("File path is required");

    }


    const sessionID =
        crypto.randomUUID();

    const inviteToken =
        crypto.randomUUID();


    await pool.query(
        `
        INSERT INTO collaboration_sessions
        (
            id,
            repository_id,
            leader_user_id,
            file_path,
            invite_token,
            expires_at
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            NOW() + INTERVAL '1 day'
        )
        `,
        [
            sessionID,
            repoId,
            userId,
            filePath,
            inviteToken
        ]
    );


    res.send({

        sessionID,

        inviteToken,

        filePath

    });
};


// ==================================================
// JOIN COLLABORATION
// ==================================================

export const joinCollaboration = async (req, res) => {

    const inviteToken =
        req.params.inviteToken;


    const result =
        await pool.query(
            `
            SELECT
                id,
                repository_id,
                leader_user_id,
                file_path,
                expires_at
            FROM collaboration_sessions
            WHERE invite_token = $1
            AND expires_at > NOW()
            `,
            [
                inviteToken
            ]
        );


    if (result.rows.length === 0) {

        return res
            .status(404)
            .send(
                "Invalid or expired invitation"
            );

    }


    const collaboration =
        result.rows[0];


    res.send(
        collaboration
    );
};


// ==================================================
// INITIALIZE COLLABORATION
// ==================================================

export const initializeCollaboration =
    async (req, res) => {

        const userId =
            req.user.id;

        const sessionID =
            req.params.sessionID;

        const { update } =
            req.body;


        if (
            update === undefined ||
            update === null
        ) {

            return res
                .status(400)
                .send(
                    "Yjs update is required"
                );

        }


        const result =
            await pool.query(
                `
                SELECT
                    leader_user_id
                FROM collaboration_sessions
                WHERE id = $1
                AND expires_at > NOW()
                `,
                [
                    sessionID
                ]
            );


        if (result.rows.length === 0) {

            return res
                .status(404)
                .send(
                    "Collaboration session not found"
                );

        }


        const leaderUserId =
            result.rows[0].leader_user_id;


        if (
            Number(leaderUserId) !==
            Number(userId)
        ) {

            return res
                .status(403)
                .send(
                    "Only the leader can initialize collaboration"
                );

        }


        const doc =
            getDocument(sessionID);


        const ytext =
            doc.getText("code");


        // Only initialize once — guard on the
        // doc's own state instead of text length,
        // since applying a Yjs update twice is safe
        // but we still don't want to re-run it
        // needlessly after a leader reconnect.

        if (ytext.length === 0) {

            const uint8Array =
                new Uint8Array(update);

            Y.applyUpdate(
                doc,
                uint8Array
            );

        }


        console.log(
            "SERVER INITIALIZED YJS CONTENT:",
            ytext.toString()
        );


        res.send({

            message:
                "Collaboration Initialised"

        });

    };