import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js"
import { requireAuth } from "./middleware/auth.middleware.js";
import repositoryRoutes from "./routes/repository.routes.js";
import collaborationRoutes from "./routes/collaboration.routes.js"

import cors from "cors";

const app = express();

app.use(
    cors({
        origin:"http://localhost:5173",
        credentials : true
    })
)

app.use(express.json());

app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/", userRoutes);
app.get("/profile", requireAuth, (req, res) => {
    res.send(req.user);
});
app.use('/repositories', repositoryRoutes);
app.use("/collaboration",collaborationRoutes)

export default app;