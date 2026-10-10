import pool from "../config/db.js"

export const requireAuth = async(req,res,next)=>{
     console.log("AUTH MIDDLEWARE STARTED");
    const sessionID = req.cookies.sessionID;
        console.log("SESSION ID:", sessionID);

    if(!sessionID){
        return res.status(401).send("Not Logged IN ");
    }
    const result = await pool.query(
        `
        SELECT users.*
        FROM sessions JOIN users on sessions.user_id = users.id
        WHERE sessions.id = $1
        AND sessions.expires_at > NOW()
        `,
        [sessionID]
    );
    if(result.rows.length === 0){
        return res.status(401).send("Invalid or expires session")
    
    }
        req.user = result.rows[0];

    console.log("USER FOUND");

        next()
}