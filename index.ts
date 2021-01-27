import Sentry = require("@sentry/node");
import Tracing = require("@sentry/tracing");
import * as express from "express";
import { Request, Response, NextFunction } from "express";

const app = express();

Sentry.init({
    dsn: "",
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app, methods: [ "get" ] }),
    ],
    tracesSampleRate: 1
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

const wait = async (n: number) => {
    return new Promise<void>((r) => {
        setTimeout(() => {
            r();
        }, n);
    });
};

const middleWare1 = async (req: Request, res: Response, next: NextFunction) => {
    await wait(100);
    return next();
};

app.get("/A", middleWare1, async (req, res, next) => {
    await wait(150);
    res.json({ msg: "Hello World!" });
});

app.listen(process.env.PORT || 3001, () => {
    console.log("Server Up");
});