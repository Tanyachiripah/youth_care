import { requireEnv } from "./config/env.js";
import bcrypt from "bcryptjs";
import { connectDatabase } from "./config/db.js";
import { Opportunity, Organisation, Resource, User } from "./models/index.js";

await connectDatabase(requireEnv("MONGODB_URI"));

const orgCount = await Organisation.countDocuments();
if (!orgCount) {
  await Organisation.insertMany([
    {
      name: "YouthCare Demonstration Support Centre",
      description: "Illustrative listing for demonstrating the organisation directory. This is not a real or verified provider.",
      services: ["General youth information", "Referral information"],
      location: "Harare, Zimbabwe",
      verificationStatus: "demo",
      eligibility: "Demonstration data only. No services or referrals are available."
    },
    {
      name: "Sample Skills and Careers Hub",
      description: "Illustrative listing showing how training and career support providers may be displayed.",
      services: ["Career guidance", "Skills development"],
      location: "Zimbabwe",
      verificationStatus: "demo",
      eligibility: "Demonstration data only. Confirm all real-world details before publication."
    }
  ]);
}

if (!(await Resource.countDocuments())) {
  await Resource.insertMany([
    {
      title: "Taking a manageable next step",
      category: "Well-being",
      summary: "A simple way to make an overwhelming situation feel more manageable.",
      body: "Pause and name what feels most urgent. Choose one small action that is safe and achievable today. If you are struggling, consider speaking with someone you trust or a qualified professional. You do not need to solve everything at once."
    },
    {
      title: "Supporting a friend who is struggling",
      category: "Peer support",
      summary: "Listen without judgement and help someone connect with appropriate support.",
      body: "Give your friend time to speak. Avoid minimising their experience or promising to keep dangerous situations secret. Ask what kind of support would help. If they may be in immediate danger, stay with them if safe and seek urgent human assistance."
    },
    {
      title: "Preparing for a career conversation",
      category: "Career",
      summary: "Organise your interests, skills and questions before seeking career guidance.",
      body: "Write down activities you enjoy, skills you have practised, projects you have completed and areas you want to explore. Prepare two or three questions. Career direction can develop through small experiments, learning and conversations."
    }
  ]);
}

if (!(await Opportunity.countDocuments())) {
  await Opportunity.insertMany([
    {
      title: "Explore entry-level digital skills",
      provider: "YouthCare demonstration content",
      category: "Skills development",
      location: "Online",
      description: "A sample opportunity card for demonstrating how training and skills programmes can be presented. This is not an active course or application.",
      applicationUrl: "",
      published: true
    }
  ]);
}

if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
  const email = process.env.SEED_ADMIN_EMAIL.toLowerCase();
  if (!(await User.exists({ email }))) {
    const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12);
    await User.create({ name: "YouthCare Administrator", email, passwordHash, role: "admin" });
    console.log("Seed admin created.");
  } else {
    console.log("Seed admin already exists; no changes made.");
  }
} else {
  console.log("Admin seed skipped. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one.");
}

console.log("YouthCare demo data seeded.");
process.exit(0);
