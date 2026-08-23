---
title: Ranking beats recall
description: Past a certain context length, where a passage sits matters more than whether it was found.
pubDate: 2026-08-20
heroImage: ./retrieval-banner.svg
---

A running note on retrieval. Edited as I learn more, so treat anything
here as current-best-understanding rather than settled.

- Ranking matters more than recall past a certain context length. If the
  right chunk is in position forty, it may as well not be there.
- Chunk boundaries are a retrieval decision, not a preprocessing detail.
- Most "the model hallucinated" reports are really "the retriever
  returned nothing useful and the model filled the gap".
- Evaluate the retriever separately from the generator. A single
  end-to-end number hides which half is broken.
