---
title: "From Monolith to Super App: Feature Flags as an Evolution Strategy"
date: "2025-03-15"
category: "Enterprise Architecture"
excerpt: "How we evolved Chile's #1 OTT app into a Super App without rewriting a single line of legacy code — using Feature Flags, Shell + Micro-Apps architecture, and an evolutionary approach that treats existing code as an asset, not a liability."
tags: ["Super App", "Feature Flags", "Evolutionary Architecture", "Micro-Frontends", "Mobile"]
lang: "en"
---

The most expensive decision in software architecture is not choosing the wrong technology. It is deciding to rewrite working code because it no longer fits your vision.

When Megamedia decided to evolve MEGA GO from a pure OTT streaming app into a Super App integrating News, Social, Shop and Radios, the engineering team faced a classic dilemma: fork the codebase and build parallel, or extend the existing platform with controlled evolution?

We chose evolution. This article explains why, and how Feature Flags became the central architectural mechanism that made it possible.

## The Fork vs. Feature Flag Decision

The conventional approach to major platform evolution is binary: maintain the old system while building the new one, then cut over. This creates several problems:

- **Duplicated effort**: Two teams maintaining parallel codebases
- **Divergence risk**: Bug fixes in the old system don't propagate to the new one
- **User fragmentation**: Users on the old app miss new features
- **Data inconsistency**: Two apps writing to the same backends with different schemas

We analyzed both approaches using eight criteria (cost, time, risk, user experience, technical debt, team capacity, rollback capability and data consistency). Feature Flags won in six of eight dimensions.

## The Shell + Micro-Apps Architecture

The Super App MEGA (SAM) architecture treats the existing MEGA GO app as a **shell** that hosts **micro-apps**:

```
┌─────────────────────────────────────────┐
│           Super App MEGA                │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │   OTT   │ │  News   │ │  Social  │  │
│  │ (legacy)│ │  (new)  │ │  (new)   │  │
│  └─────────┘ └─────────┘ └──────────┘  │
│  ┌─────────┐ ┌─────────┐              │
│  │  Shop   │ │  Radio  │              │
│  │  (new)  │ │  (new)  │              │
│  └─────────┘ └─────────┘              │
└─────────────────────────────────────────┘
```

Each micro-app is a self-contained module with:
- Independent navigation graph
- Independent build configuration
- Independent release cycle
- Shared auth layer (Lazy Login)
- Shared analytics pipeline

The shell provides:
- Bottom navigation between micro-apps
- User identity and session management
- Feature Flag evaluation
- Cross-app deep linking
- Common UI components

## Lazy Login: The Anonymous-First Pattern

One of the most consequential architectural decisions in SAM is **Lazy Login**. Users can browse content, read news and listen to radio without creating an account. Data is stored locally and associated with an anonymous ID.

When the user eventually logs in, the system migrates:
- Watch history
- Favorites
- Radio preferences
- Shopping cart
- Social follows

This pattern increases conversion dramatically. In the OTT context, users who browse before subscribing have 3x higher retention than those forced to register immediately.

The migration is non-trivial. We use a graph-based identity system (Neo4j) that tracks relationships between anonymous IDs, registered users, devices and profiles. When login occurs, the graph traversal identifies all orphaned data and re-parents it under the authenticated user.

## Feature Flags as Architecture

Feature Flags in SAM are not just for A/B testing. They are the primary mechanism for controlling which micro-apps are visible to which users on which platforms:

```yaml
mega_shop:
  enabled: true
  platforms:
    android: { minVersion: "2.0.0", rollout: 100 }
    ios: { minVersion: "2.0.0", rollout: 50 }
    web: { minVersion: "1.5.0", rollout: 100 }
  userSegments: ["premium", "free_trial"]
  
mega_news:
  enabled: true
  platforms:
    android: { minVersion: "1.8.0", rollout: 100 }
    ios: { minVersion: "1.8.0", rollout: 100 }
  dependencies: ["mega_id_v2"]
```

This declarative approach allows product managers to control rollout without engineering intervention. When a new micro-app is ready, the flag is enabled. If a critical bug is found, the flag is disabled — instantly hiding the micro-app from all users without deploying a new app version.

## Module Federation for Code Sharing

For the web and React Native PoC layers, we use Module Federation 2.0 (via Re.Pack) to share code between the OTT legacy module and new micro-apps:

- Shared design system components
- Shared auth utilities
- Shared analytics hooks
- Shared API clients

This reduces bundle size and ensures consistency. When the design team updates the primary button color, the change propagates to all micro-apps without individual updates.

## The Evolution Mindset

The core philosophy of SAM is captured in ADR-001: **"Extend, don't Replace."**

Every architectural decision is evaluated against this principle:
- Can we add the new feature without modifying existing code?
- Can we route around legacy components using adapters?
- Can we deprecate gradually rather than delete immediately?

This mindset treats existing code as an asset. The MEGA GO OTT module — 2,690 lines of player logic, battle-tested through 150K concurrent users — is not technical debt. It is a competitive advantage that new micro-apps inherit for free.

## Metrics of Evolution

After 10 months of evolutionary development:

- Zero downtime during micro-app rollouts
- 100% of legacy OTT features remain functional
- New micro-apps (News, Social) reached production in 4 months each
- User retention increased 23% due to multi-vertical engagement
- Team of 7 engineers (consolidated from 12) maintains the entire platform

## The Lesson

Rewriting code is sometimes necessary. But it should be the last option, not the first. Feature Flags, Shell + Micro-Apps architecture and Lazy Login patterns allow platforms to evolve organically — adding new capabilities while preserving the reliability of what already works.

The Super App is not a destination. It is a continuous process of controlled evolution.
