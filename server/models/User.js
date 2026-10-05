const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: [6, "Password must be at least 6 characters"] },
    role: { type: String, enum: ["admin", "employee", "visitor"], default: "visitor" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.matches = function (p) { return bcrypt.compare(p, this.password); };

module.exports = mongoose.model("User", userSchema);
