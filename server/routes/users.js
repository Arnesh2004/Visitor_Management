const router = require("express").Router();
const User = require("../models/User");
const { auth, allow } = require("../middleware/auth");

router.use(auth);

// any logged-in user (visitors need it for the "person to meet" dropdown)
router.get("/employees", async (req, res) =>
  res.json(await User.find({ role: "employee" }).select("name email createdAt").sort("name")));

// admin only
router.delete("/:id", allow("admin"), async (req, res) => {
  await User.findOneAndDelete({ _id: req.params.id, role: "employee" });
  res.json({ message: "Employee removed" });
});

module.exports = router;
