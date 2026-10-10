
import crypto from "crypto";
import pool from "../config/db.js"


import {
    exchangeCodeForToken,
    getGithubUser
} from "../services/github.service.js";

export const githubLogin = (req, res) => {
    console.log("i am alive");

    const githubAuthURL =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${process.env.GITHUB_CLIENT_ID}` +
        `&scope=repo`;

    res.redirect(githubAuthURL);
};

export const githubCallback = async (req, res) => {

    const tempCode = req.query.code;

    const data = await exchangeCodeForToken(tempCode);
    console.log("TOKEN RESPONSE", data)


    const accessToken = data.access_token;

    const userData = await getGithubUser(accessToken);
    console.log("user callback from github gives",userData)
try {
    const result = await pool.query(
        `
        INSERT INTO users
            (github_id, github_username, access_token, refresh_token)
        VALUES
            ($1, $2, $3, $4)
        ON CONFLICT (github_id)
        DO UPDATE SET
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token
        RETURNING *
        `,
        [
            userData.id,
            userData.login,
            accessToken,
            data.refresh_token
        ]
    );

    console.log("User inserted/updated:", result.rows[0]);

    const user = result.rows[0];

    const sessionID = crypto.randomUUID();

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await pool.query(
        `INSERT INTO sessions (id, user_id, expires_at)
         VALUES ($1, $2, $3)`,
        [sessionID, user.id, expiresAt]
    );

    res.cookie("sessionID", sessionID, {
        httpOnly: true
    });

    res.redirect("http://localhost:5173/")

} catch (error) {
    console.error("❌ Database query failed:");
    console.error(error);

    res.status(500).send("Database error");
}
};