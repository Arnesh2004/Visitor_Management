const router = require("express").Router();
const Visitor = require("../models/Visitor");
const { auth, allow } = require("../middleware/auth");

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const staff = allow("admin", "employee");
const err = (res, e) => res.status(400).json({ message: e.message });

router.use(auth);

/* ---------- Visitor self-service ---------- */
router.get("/my", allow("visitor"), async (req, res) =>
  res.json(await Visitor.find({ user: req.user.id }).sort({ visitDateTime: -1 })));

router.post("/self", allow("visitor"), async (req, res) => {
  try {
    const { name, mobile, email, organization, personToMeet, purpose, visitDateTime } = req.body;
    res.status(201).json(await Visitor.create({
      name, mobile, email, organization, personToMeet, purpose, visitDateTime,
      status: "Checked In", user: req.user.id,
    }));
  } catch (e) { err(res, e); }
});

router.put("/self/:id/checkout", allow("visitor"), async (req, res) => {
  const v = await Visitor.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { status: "Checked Out" }, { new: true });
  v ? res.json(v) : res.status(404).json({ message: "Visit not found" });
});

/* ---------- Admin + Employee ---------- */
router.get("/stats", staff, async (req, res) => {
  const all = await Visitor.find().select("status visitDateTime personToMeet");
  const status = { "Checked In": 0, "Checked Out": 0 }, byDay = {}, byPerson = {};
  all.forEach((v) => {
    status[v.status]++;
    const d = v.visitDateTime.toISOString().slice(0, 10);
    byDay[d] = (byDay[d] || 0) + 1;
    byPerson[v.personToMeet] = (byPerson[v.personToMeet] || 0) + 1;
  });
  res.json({
    total: all.length,
    status: Object.entries(status).map(([name, value]) => ({ name, value })),
    byDay: Object.entries(byDay).sort().slice(-7).map(([date, count]) => ({ date: date.slice(5), count })),
    byPerson: Object.entries(byPerson).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count })),
  });
});

router.get("/", staff, async (req, res) => {
  const { search } = req.query;
  const filter = search ? { $or: [{ name: new RegExp(escape(search), "i") }, { mobile: new RegExp(escape(search)) }] } : {};
  res.json(await Visitor.find(filter).sort({ visitDateTime: -1 }));
});

router.post("/", staff, async (req, res) => { try { res.status(201).json(await Visitor.create(req.body)); } catch (e) { err(res, e); } });

router.put("/:id", staff, async (req, res) => {
  try {
    const v = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    v ? res.json(v) : res.status(404).json({ message: "Visitor not found" });
  } catch (e) { err(res, e); }
});

router.delete("/:id", staff, async (req, res) => {
  const v = await Visitor.findByIdAndDelete(req.params.id);
  v ? res.json({ message: "Visitor deleted" }) : res.status(404).json({ message: "Visitor not found" });
});

module.exports = router;
