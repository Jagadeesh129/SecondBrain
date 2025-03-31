import express from "express";
import dotenv from "dotenv";
import setConnection from "./db";
import { userRouter } from "./routes/user";
import { contentRouter } from "./routes/content";
import { brainRouter } from "./routes/brain";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/content", contentRouter);
app.use('/api/v1/brain', brainRouter);

const PORT = process.env.PORT || 3000;

setConnection().then(() => {
    app.listen(PORT, () => {
        console.log("Started listening on port:3333");
    })
})
