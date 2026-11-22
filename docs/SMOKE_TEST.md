# Smoke Test Checklist

1. Set `server/.env` from `.env.example`.
2. Run `npm install` from repository root.
3. Run `npm run seed` after setting MongoDB URI.
4. Start with `npm run dev`.
5. Check `GET http://localhost:5000/api/health`.
6. Register a normal account and confirm it reaches the dashboard.
7. Confirm public account registration cannot create an admin.
8. Confirm `/api/organisations` does not expose demo records.
9. Confirm `/api/referrals` rejects requests without consent.
10. Confirm a normal user receives 403 from `/api/admin/overview`.
11. Configure OpenAI key and test the companion; remove key and confirm fallback.
12. Build with `npm run build`.
13. Before production, complete all items in `SECURITY_MODEL.md`.
