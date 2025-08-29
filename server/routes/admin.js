import { Router } from "express";
const router = Router();
let users = [
  { id: "u1", email: "mehmet@example.com", role: "buyer" },
  { id: "u2", email: "ayse@example.com", role: "wholesaler" },
  { id: "u3", email: "admin@example.com", role: "admin" },
];
router.get("/users", (_req, res) => res.json(users));
router.put("/users/:id/role", (req, res) => {
  const u = users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: "Kullanıcı yok" });
  u.role = req.body.role || u.role;
  res.json(u);
});
export default router;
