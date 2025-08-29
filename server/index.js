import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import cartRouter from "./routes/cart.js";
import inventoryRouter from "./routes/inventory.js";
import messagesRouter from "./routes/messages.js";
import notificationsRouter from "./routes/notifications.js";
import reportsRouter from "./routes/reports.js";
import favoritesRouter from "./routes/favorites.js";
import listsRouter from "./routes/lists.js";
import reviewsRouter from "./routes/reviews.js";
import profileRouter from "./routes/profile.js";
import supportRouter from "./routes/support.js";
import searchRouter from "./routes/search.js";
import adminRouter from "./routes/admin.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = {
    id: req.headers["x-user-id"] || "user-1",
    role: req.headers["x-user-role"] || "buyer"
  };
  next();
});

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/lists", listsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/support", supportRouter);
app.use("/api/search", searchRouter);
app.use("/api/admin", adminRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

const port = process.env.PORT || 5000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "hello", message: "WebSocket bağlantısı kuruldu." }));
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
