import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now }
});

const organisationSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  services: [{ type: String }],
  location: { type: String, default: "Zimbabwe" },
  contactEmail: { type: String, default: "" },
  website: { type: String, default: "" },
  verificationStatus: { type: String, enum: ["pending", "verified", "suspended", "demo"], default: "pending" },
  eligibility: { type: String, default: "Contact the organisation to confirm eligibility." },
  createdAt: { type: Date, default: Date.now }
});

const resourceSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  summary: { type: String, required: true },
  body: { type: String, required: true },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const opportunitySchema = new Schema({
  title: { type: String, required: true },
  provider: { type: String, required: true },
  category: { type: String, default: "Training" },
  location: { type: String, default: "Zimbabwe" },
  description: { type: String, required: true },
  applicationUrl: { type: String, default: "" },
  closingDate: { type: Date, default: null },
  published: { type: Boolean, default: true }
});

const referralSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  organisation: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
  reason: { type: String, required: true, maxlength: 1200 },
  consentToShare: { type: Boolean, required: true, validate: (v: boolean) => v === true },
  status: { type: String, enum: ["received", "reviewing", "completed", "closed"], default: "received" },
  createdAt: { type: Date, default: Date.now }
});

const auditSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);
export const Organisation = mongoose.model("Organisation", organisationSchema);
export const Resource = mongoose.model("Resource", resourceSchema);
export const Opportunity = mongoose.model("Opportunity", opportunitySchema);
export const Referral = mongoose.model("Referral", referralSchema);
export const AuditLog = mongoose.model("AuditLog", auditSchema);
