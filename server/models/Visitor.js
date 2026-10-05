const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email"],
    },
    organization: { type: String, trim: true },
    personToMeet: { type: String, required: [true, "Person to meet is required"], trim: true },
    purpose: { type: String, required: [true, "Purpose is required"], trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    visitDateTime: { type: Date, default: Date.now },
    status: { type: String, enum: ["Checked In", "Checked Out"], default: "Checked In" },
  },
  { timestamps: true }
);

visitorSchema.index({ name: 1 });
visitorSchema.index({ mobile: 1 });
visitorSchema.index({ visitDateTime: -1 });

module.exports = mongoose.model("Visitor", visitorSchema);
