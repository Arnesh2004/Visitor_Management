const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { SECRET } = require("../middleware/auth");

const out = (u) => ({
  token: jwt.sign({ id: u._id, name: u.name, role: u.role }, SECRET, { expiresIn: "7d" }),
  user: { id: u._id, name: u.name, email: u.email, role: u.role },
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!["admin", "employee", "visitor"].includes(role)) return res.status(400).json({ message: "Please select a role" });
    if (await User.findOne({ email: (email || "").toLowerCase() })) return res.status(400).json({ message: "Email already registered" });
    res.status(201).json(out(await User.create({ name, email, password, role })));
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.post("/login", async (req, res) => {
  try {
    const u = await User.findOne({ email: (req.body.email || "").toLowerCase() });
    if (!u || !(await u.matches(req.body.password || ""))) return res.status(401).json({ message: "Invalid email or password" });
    res.json(out(u));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
