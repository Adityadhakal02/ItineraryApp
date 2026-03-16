# Midterm Report Checklist (CSCI 411/412)

Use this when writing your midterm report. Each section below maps to the official requirements.

---

## 2.1 Current Progress

**Requirement:** Implementation status, GitHub link, development timeline vs proposal.

**What to include:**

1. **Implementation Status** — List of completed items, for example:
   - Backend: FastAPI app, PostgreSQL with SQLAlchemy async, `create_tables` script
   - Auth: register, login, JWT, `/me`; protected routes
   - Data: User and Itinerary models; itineraries stored per user
   - API clients: Ticketmaster, Yelp, Amadeus, Mapbox (with mocks when keys missing)
   - Itineraries API: create (stub from query), list, get by id
   - Frontend: landing, login/register, dashboard (create + list), itinerary detail (day-by-day, events, dining, hotels)
   - Stub flow: first word → destination, optional number → budget; Ticketmaster (or mock) for events; hardcoded dining/hotels for demo

2. **GitHub Repository** — Add the repo link (e.g. `https://github.com/Adityadhakal02/ItineraryApp`) and state that it is the central record for source code, README, and project logs.

3. **Development Timeline** — Short comparison: where you are now vs the schedule in your **initial proposal** (e.g. “Weeks 1–4: setup, DB, auth, API clients” — on track / slightly ahead because of stub + dashboard).

---

## 2.2 Challenges and Proposal Adjustments

**Requirement:** Technical difficulties (with examples) and how you addressed them; any strategic changes to the proposal.

**What to include:**

1. **Technical Difficulties** — Concrete examples you can use:
   - Async SQLAlchemy required **greenlet** (not in docs at first); added to `requirements.txt`.
   - **Python 3.9**: used `Optional[...]` instead of `X | None` for compatibility.
   - **PostgreSQL**: connection issues until DB was created and service running; used `create_tables.py` instead of full migrations for this phase.
   - **API keys**: clients return mocks when keys are missing so you can run and demo without every key.

2. **Strategic Adjustments** — If you have **not** changed your main goals, say so briefly (e.g. “No change to overall goals; scope for midterm focused on foundation and stub flow.”). If you **did** change goals, you need to submit a modified proposal; otherwise this is optional.

---

## 2.3 Demonstration of Work Done

**Requirement:** Preliminary results (outputs/UI) and a technical demo (live or recorded) showing core functionality.

**What to do:**

1. **Preliminary Results** — In the report and/or appendix:
   - Screenshots: login/register screen, dashboard with at least one itinerary, itinerary detail (day-by-day + events/dining/hotels).
   - Optional: FastAPI `/docs` with a successful POST to create an itinerary, or a sample JSON response.

2. **Technical Demo** — Either:
   - **Live**: Run backend + frontend, show register → login → create itinerary (e.g. “Paris 3 days”) → open it → show day-by-day and details; or  
   - **Recorded**: Short video doing the same flow and narrating (“This is the stub; real AI parsing comes next.”).

**Before the demo:** Ensure PostgreSQL is running, DB created, `python create_tables.py` run, backend and frontend start without errors.

---

## 2.4 Future Plan for Final Delivery

**Requirement:** Roadmap for second half — technical milestones and plan for final report, repo, and video.

**What to include:**

1. **Technical Milestones** (prioritized), for example:
   - NL parsing (e.g. Gemini) to turn natural language into structured params.
   - Orchestrator to call Ticketmaster, Yelp, Amadeus, Mapbox and merge results; replace stub with real orchestration.
   - Mapbox map and route display.
   - Testing, deployment, polish.

2. **Final Deliverables** — Short plan for:
   - Final written report (structure, main sections).
   - GitHub: README, docs, clean commit history, any final polish.
   - Final video presentation (length, what to show, how it aligns with report).

You can adapt the “Next phase” from `docs/DEVELOPMENT_NOTES.md` for the milestones.

---

## 3 Professional Conduct and Integrity

**Requirement:** AI tools and open-source use acknowledged in the report and in the GitHub repo.

**What to do:**

1. **In the report** — One short paragraph stating that you used AI tools (e.g. for implementation help, debugging, or documentation) and/or open-source libraries and APIs; all use is acknowledged in the report and in the repository.

2. **In the repo** — Already done: [docs/ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md) and the README link to it. No extra action needed unless your instructor wants something more specific.

---

## Quick verification

| Requirement                         | In repo / done? | In report? |
|------------------------------------|-----------------|------------|
| 2.1 Implementation status          | Yes (code)      | You write  |
| 2.1 GitHub link                    | Repo exists     | You add    |
| 2.1 Timeline vs proposal           | —               | You write  |
| 2.2 Technical difficulties        | Yes (notes)     | You write  |
| 2.2 Proposal adjustments          | None so far     | You state  |
| 2.3 Preliminary results           | —               | Screenshots|
| 2.3 Technical demo                | —               | Live/video |
| 2.4 Technical milestones          | In DEVELOPMENT_NOTES | You adapt |
| 2.4 Final deliverables plan        | —               | You write  |
| 3 Acknowledgments                  | ACKNOWLEDGMENTS.md | + 1 para in report |
