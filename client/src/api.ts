import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

export type User = { id: string; name: string; email: string; role: "user" | "admin" };
export type Organisation = {
  _id: string; name: string; description: string; services: string[];
  location: string; verificationStatus: string; eligibility: string;
};
export type Resource = { _id: string; title: string; category: string; summary: string; body: string };
export type Opportunity = { _id: string; title: string; provider: string; category: string; location: string; description: string; applicationUrl: string };
