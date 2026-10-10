import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/me", async (req, res) => {

    const sessionID = req.cookies.sessionID;

    const result = await pool.query(
        `
        SELECT users.*
        FROM sessions
        JOIN users ON sessions.user_id = users.id
        WHERE sessions.id = $1
        AND sessions.expires_at > NOW()
        `,
        [sessionID]
    );

    if (result.rows.length === 0) {
        return res.status(401).send("Not logged in");
    }

    res.send(result.rows[0]);
});

export default router;