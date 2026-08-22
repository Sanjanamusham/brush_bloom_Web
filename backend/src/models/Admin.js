const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
    // Rotated whenever a refresh token is issued/invalidated, so all sessions can be revoked at once.
    refreshTokenVersion: { type: Number, default: 0 },
    // Set by /forgot-password, cleared after use or expiry. Only the SHA-256 hash is
    // stored — never the raw token — so a database leak alone can't be used to reset a password.
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

adminSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

adminSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
};

adminSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.passwordHash;
    delete ret.refreshTokenVersion;
    delete ret.resetPasswordTokenHash;
    delete ret.resetPasswordExpires;
    return ret;
  },
});

module.exports = mongoose.model("Admin", adminSchema);
