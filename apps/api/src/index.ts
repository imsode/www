import { Hono } from "hono";
import selfiesRouter from "./routes/selfies";
import templatesRouter from "./routes/templates";
import uploadsRouter from "./routes/uploads";
import usersRouter from "./routes/users";
import videosRouter from "./routes/videos";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", (c) => {
	return c.text("Video Generation API");
});

// Mount routers
app.route("/api/templates", templatesRouter);
app.route("/api/uploads", uploadsRouter);
app.route("/api/selfies", selfiesRouter);
app.route("/api/videos", videosRouter);
app.route("/api/users", usersRouter);

export default app;
