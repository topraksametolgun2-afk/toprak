import { Router } from "express";
const router = Router();
let profiles = {};
router.get("/", (req, res) => {
  res.json(profiles[req.user.id] || {});
});
router.post("/", (req, res) => {
  profiles[req.user.id] = { ...(profiles[req.user.id]||{}), ...req.body };
  res.json(profiles[req.user.id]);
});
router.post("/password", (_req, res) => {
  res.json({ ok: true, message: "Şifre değiştirildi (demo)" });
});
router.post("/notifications", (req, res) => {
  profiles[req.user.id] = { ...(profiles[req.user.id]||{}), notify_email: !!req.body.notify_email, notify_inapp: !!req.body.notify_inapp };
  res.json(profiles[req.user.id]);
});
router.post("/avatar", (_req, res) => {
  res.json({ ok: true, url: "https://placehold.co/100x100" });
});
export default router;
