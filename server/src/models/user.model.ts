import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["admin", "employee", "manager"],
  },
  teamId: { type: Number, required: false },
});

export default mongoose.model("User", userSchema);
