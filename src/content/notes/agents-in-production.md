---
title: Agents in production
description: Notes on what breaks once an agent leaves the notebook.
pubDate: 2026-08-22
heroImage: ./agents-in-production-banner.svg
---

Things I keep relearning about running agents against real systems.

- An agent with no injected clock will anchor relative dates to its
  training data and return confidently wrong numbers.
- A context window is working memory that evaporates every turn. Memory
  is what survives the turn, and something has to deliberately write it
  down.
- Failures should be loud. An agent that silently returns a plausible
  answer is worse than one that stops.
- Every tool needs to be safe to call twice. Retries are not exceptional.
