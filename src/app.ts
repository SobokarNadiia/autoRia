import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import * as mongoose from "mongoose";

import { configs } from "./configs";
import { cronRunner } from "./crons";
import { authRouter, carAdRouter, companyRouter, userRouter } from "./routers";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/carAd", carAdRouter);
app.use("/company", companyRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  return res.status(status).json(error.message);
});

app.listen(configs.PORT, async () => {
  mongoose.connect(configs.DB_URL);
  cronRunner();
  console.log(`App listening on port ${configs.PORT}`);
});
