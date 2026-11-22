import "./config/env.js";
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import OpenAI from "openai";
import { rateLimit } from "express-rate-limit";
import { requireAdmin, requireAuth } from "./middleware/auth.js";
import { AuditLog, Opportunity, Organisation, Referral, Resource, User } from "./models/index.js";

const router = Router();
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const chatLimiter = rateLimit({ windowMs: 60_000, limit: 12, standardHeaders: true, legacyHeaders: false });

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(160),
  password: z.string().min(10).max(100)
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(100) });

router.get("/health", (_req, res) => res.json({ success: true, application: "YouthCare", status: "operational" }));

router.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please provide a valid name, email and password of at least 10 characters." });
  const email = parsed.data.email.toLowerCase();
  if (await User.exists({ email })) return res.status(409).json({ error: "An account with that email already exists." });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({ name: parsed.data.name, email, passwordHash, role: "user" });
  req.session.userId = String(user._id);
  req.session.role = "user";
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid login details." });
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Could not start a secure session." });
    req.session.userId = String(user._id);
    req.session.role = user.role as "user" | "admin";
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  });
});

router.post("/auth/logout", requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("youthcare.sid");
    res.json({ success: true });
  });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId).select("name email role");
  if (!user) return res.status(401).json({ error: "Account not found." });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get("/organisations", async (req, res) => {
  const status = req.query.includeDemo === "true" ? { $in: ["verified", "demo"] } : "verified";
  const organisations = await Organisation.find({ verificationStatus: status }).sort({ name: 1 }).lean();
  res.json({ organisations });
});

router.get("/resources", async (_req, res) => {
  const resources = await Resource.find({ published: true }).sort({ createdAt: -1 }).lean();
  res.json({ resources });
});

router.get("/opportunities", async (_req, res) => {
  const opportunities = await Opportunity.find({ published: true }).sort({ closingDate: 1 }).lean();
  res.json({ opportunities });
});

router.post("/referrals", requireAuth, async (req, res) => {
  const schema = z.object({
    organisationId: z.string().min(1),
    reason: z.string().trim().min(10).max(1200),
    consentToShare: z.literal(true)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "A valid organisation, reason and explicit consent are required." });
  const organisation = await Organisation.findOne({ _id: parsed.data.organisationId, verificationStatus: "verified" });
  if (!organisation) return res.status(404).json({ error: "This organisation is not currently verified for referrals." });
  const referral = await Referral.create({ user: req.session.userId, organisation: organisation._id, reason: parsed.data.reason, consentToShare: true });
  res.status(201).json({ referral: { id: referral._id, status: referral.status, createdAt: referral.createdAt } });
});

router.get("/referrals/mine", requireAuth, async (req, res) => {
  const referrals = await Referral.find({ user: req.session.userId }).populate("organisation", "name location").sort({ createdAt: -1 }).lean();
  res.json({ referrals });
});

router.post("/ai/chat", requireAuth, chatLimiter, async (req, res) => {
  const parsed = z.object({ message: z.string().trim().min(1).max(2000) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter a message of up to 2,000 characters." });
  const message = parsed.data.message;
  const crisisPattern = /\b(suicid(e|al)|kill myself|end my life|hurt myself|self[- ]harm|overdose|want to die)\b/i;
  if (crisisPattern.test(message)) {
    return res.json({
      reply: "I'm sorry you're facing something this difficult. I can't assess your safety or provide emergency help. If you may act on thoughts of harming yourself, please move near a trusted person now and contact local emergency services or go to the nearest emergency department. If possible, tell someone plainly: “I may not be safe alone right now.” YouthCare does not have a monitored crisis-response team in this demonstration, so this chat is not an emergency service.",
      safetyNotice: true
    });
  }
  if (!openai) {
    return res.json({
      reply: "The YouthCare AI service is not configured yet. I can still encourage you to take one manageable next step: identify what kind of support you need, speak with someone you trust, or explore the educational resources and verified organisations listed on this platform. This demonstration assistant is not a counsellor.",
      demoMode: true
    });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 350,
      messages: [
        {
          role: "system",
          content: "You are YouthCare, a supportive information and signposting assistant for young people in Zimbabwe. Be warm, respectful, concise and non-judgmental. You are not a therapist or clinician. Never diagnose, prescribe, claim confidentiality, or claim a human has been notified. Do not ask for identifying details. Offer practical low-risk next steps and encourage trusted human/professional support when appropriate. For immediate danger, tell the person to contact local emergency services or go to the nearest emergency department and seek a trusted person immediately. Do not invent hotline numbers, organisations, service availability, or referral outcomes. You cannot make referrals; direct users to the verified directory and consent-based referral form."
        },
        { role: "user", content: message }
      ]
    });
    res.json({ reply: completion.choices[0]?.message?.content || "I couldn't form a response just now. Please try again." });
  } catch {
    res.status(502).json({ error: "The AI service is temporarily unavailable. Please use the resource directory or contact a trusted person." });
  }
});

router.get("/admin/overview", requireAdmin, async (_req, res) => {
  const [users, organisations, referrals, resources] = await Promise.all([
    User.countDocuments(), Organisation.countDocuments(), Referral.countDocuments(), Resource.countDocuments()
  ]);
  res.json({ counts: { users, organisations, referrals, resources } });
});

router.post("/admin/organisations", requireAdmin, async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(120), description: z.string().min(10).max(1000),
    services: z.array(z.string()).default([]), location: z.string().default("Zimbabwe"),
    contactEmail: z.string().email().or(z.literal("")).default(""),
    website: z.string().url().or(z.literal("")).default(""),
    verificationStatus: z.enum(["pending", "verified", "suspended", "demo"]).default("pending"),
    eligibility: z.string().default("Contact the organisation to confirm eligibility.")
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid organisation details." });
  const organisation = await Organisation.create(parsed.data);
  await AuditLog.create({ actor: req.session.userId, action: "organisation.created", targetType: "Organisation", targetId: String(organisation._id) });
  res.status(201).json({ organisation });
});

router.patch("/admin/organisations/:id", requireAdmin, async (req, res) => {
  const schema = z.object({ verificationStatus: z.enum(["pending", "verified", "suspended", "demo"]).optional(), description: z.string().min(10).max(1000).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid update." });
  const organisation = await Organisation.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  if (!organisation) return res.status(404).json({ error: "Organisation not found." });
  await AuditLog.create({ actor: req.session.userId, action: "organisation.updated", targetType: "Organisation", targetId: String(organisation._id) });
  res.json({ organisation });
});

router.post("/admin/resources", requireAdmin, async (req, res) => {
  const schema = z.object({ title: z.string().min(3), category: z.string().min(2), summary: z.string().min(5), body: z.string().min(10), published: z.boolean().default(true) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid resource details." });
  const resource = await Resource.create(parsed.data);
  await AuditLog.create({ actor: req.session.userId, action: "resource.created", targetType: "Resource", targetId: String(resource._id) });
  res.status(201).json({ resource });
});

router.post("/admin/opportunities", requireAdmin, async (req, res) => {
  const schema = z.object({ title: z.string().min(3), provider: z.string().min(2), category: z.string().default("Training"), location: z.string().default("Zimbabwe"), description: z.string().min(10), applicationUrl: z.string().url().or(z.literal("")).default(""), published: z.boolean().default(true) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid opportunity details." });
  const opportunity = await Opportunity.create(parsed.data);
  await AuditLog.create({ actor: req.session.userId, action: "opportunity.created", targetType: "Opportunity", targetId: String(opportunity._id) });
  res.status(201).json({ opportunity });
});

export default router;
