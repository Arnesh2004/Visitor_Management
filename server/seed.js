require("dotenv").config();
const mongoose = require("mongoose");
const Visitor = require("./models/Visitor");

const samples = [
  { name: "Aarav Sharma", mobile: "9876543210", email: "aarav@example.com", organization: "Tech Solutions Pvt Ltd", personToMeet: "Ms. Priya Nair", purpose: "Client meeting", status: "Checked In" },
  { name: "Neha Verma", mobile: "9123456780", email: "neha@college.edu", organization: "ABC College of Engineering", personToMeet: "Mr. Rohan Mehta", purpose: "Industrial visit", status: "Checked Out" },
  { name: "Rahul Iyer", mobile: "9988776655", email: "rahul@vendor.com", organization: "Prime Supplies", personToMeet: "Procurement Head", purpose: "Vendor discussion", status: "Checked In" },
  { name: "Sneha Patil", mobile: "9012345678", email: "sneha@gmail.com", organization: "", personToMeet: "HR Manager", purpose: "Interview", status: "Checked In" },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/visitor_management");
    await Visitor.init();            // creates collection + indexes
    await Visitor.deleteMany({});
    await Visitor.insertMany(samples);
    console.log(`Database ready. Inserted ${samples.length} sample visitors.`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
