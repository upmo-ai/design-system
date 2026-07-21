---
title: Tokens
description: The single source of truth for colour, type, spacing, radius and motion.
---

Every value in the system comes from `@upmo-ai/tokens`. Components read token
variables, never literals, so the three themes stay in lockstep.

## Themes

Three themes resolve from the same token names: `light`, `dark` and `hc` (high
contrast). Set the active theme with a `data-theme` attribute on a root element.

## Grounds

The grounds are true-neutral grey: a precise, data-dense, Ramp-like business
feel. Borders carry structure; shadows only lift floating layers. Emerald is a
sparing accent (brand mark, one primary action per region, selected state,
focus), never a surface fill.

## Status and liveness

Two enums share one tone layer. Phase is the low-level task progress (Preparing,
Planning, Working, Checking, Done, Failed). Attention is the high-level hint to
the user (Queued, Needs approval, Paused, Stopped). The tones are neutral,
active, positive, attention and critical. The live caret draws itself on a
steady loop for Working and Checking, and collapses to a static drawn caret
under reduced motion.
