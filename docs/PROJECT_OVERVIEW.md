# Project Atlas — Project Overview

## What this is

Project Atlas is a web-native interactive portfolio for a Computer Engineering student building software, intelligent systems, and interactive worlds. Its guiding statement is: **“I build systems. Sometimes they are applications. Sometimes they are intelligent systems. Sometimes they are interactive worlds.”**

The portfolio contains a verified catalog of nine projects — three flagships (Sonara, Lyrune, the Kerala Flood Risk Platform), featured and supporting work, one honest design concept, and an archive — plus an evidence-based skills system and a single-source profile. The full verified inventory, including repositories deliberately excluded because they are empty or trivial, is documented in `docs/PORTFOLIO_INVENTORY.md`.

## Purpose and audience

The portfolio should give recruiters and collaborators a fast way to understand the owner’s work, while offering a more memorable optional way to explore it. It serves people who need quick, conventional information and visitors who want to spend time with an interactive presentation.

Lyrune is the reference project integration: a verified cross-platform lyrics-overlay case study with a repository link, reusable conventional detail template, and data-configured exhibit. Sonara is the newest flagship (a Harmony Music fork with the owner's own systems — always attributed as such). Nothing in the portfolio claims users, downloads, performance numbers, or deployments that are not verified.

## Two complementary experiences

| Conventional portfolio | Interactive hub |
| --- | --- |
| Home, about, project index, and case-study routes | A small browser-native 3D prototype hub |
| Server-rendered, keyboard-accessible HTML | Explicitly launched only when the visitor chooses it |
| Works without WebGL or powerful graphics | Uses React Three Fiber and a basic explorer controller |
| Optimized for scanning and sharing project context | Optimized for spatial discovery and exhibit interaction |

The 3D experience is an immersive extension, never the sole path to portfolio information.

## Current experience

1. A visitor opens the conventional website: home (identity + directions + featured work), about, projects (with category filters and priority hierarchy), skills (evidence-linked), and per-project case studies.
2. The visitor selects **Interactive hub** and chooses to launch it.
3. The browser capability check runs; only then is the 3D code imported.
4. The visitor moves through the Atlas reference hub — a compact exhibition hall — using WASD or arrow keys and drags the scene to look.
5. Near an exhibit (Lyrune, Kerala Flood Risk Platform, Sonara), an interaction prompt appears; pressing `E` or clicking the exhibit opens its project information.
6. Closing the panel returns the visitor to exploration. A full conventional project route is also available.

## Long-term vision

Atlas may grow into separate software, intelligent-systems, and interactive-systems districts. Each project can evolve from an information display into screenshots, video, an external demo, an interactive scene, or a dedicated web experience. The current foundation proves the relationships between content and presentation without loading a large world or building project-specific demonstrations.
