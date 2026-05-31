---
title: "Architecting a Multi-Platform OTT at Scale: Lessons from 1.9M Downloads"
date: "2025-02-10"
category: "Enterprise Architecture"
excerpt: "How we designed MEGA GO's architecture to serve 1.9M+ downloads across 7 client platforms — from Android mobile to Smart TV, Roku and Web — while maintaining a single source of truth for content, auth and monetization."
tags: ["OTT", "Android", "Microservices", "DRM", "Architecture"]
lang: "en"
---

When you build an OTT platform that needs to run on mobile phones, Android TV, Samsung Tizen, LG webOS, Roku, iOS and web browsers — all sharing the same content catalog, user identities and monetization logic — architecture decisions made in month one determine whether you survive month twelve.

This article distills the architectural patterns we used at Megamedia to build MEGA GO, Chile's #1 Entertainment app, now serving 1.91M+ downloads and handling 150K concurrent users during live events like Festival de Viña del Mar.

## The Multi-Module Android Foundation

The Android ecosystem of MEGA GO is structured as a multi-module Gradle project with clear separation of concerns:

- **mobile module**: Phone and tablet app using Material Design and Navigation Component
- **tv module**: Android TV app using Leanback UI, optimized for D-Pad navigation
- **ottlib module**: Shared library (AAR) containing domain logic, repositories, API clients and player wrappers
- **navigation module**: Reusable navigation component library

This separation allows independent release cycles. When a critical DRM fix needs to ship, we can update ottlib without touching the mobile or TV UI layers. When Samsung introduces a new TV OS requirement, the TV module adapts without destabilizing mobile.

## MVVM + Repository + Observer: The Mobile Pattern

At the UI layer, we follow MVVM with LiveData:

```
UI (Activity/Fragment)
    ↓
ViewModel (LiveData)
    ↓
Repository
    ↓
┌───────┴───────┐
│               │
[Remote API]    [Local DB]
(Retrofit)      (Room)
```

The Repository pattern is critical for offline-first user experience. A user browsing content on the subway expects immediate results from Room cache, with background sync from the OTT API when connectivity returns. This pattern also simplifies testing: repositories can be mocked, ViewModels can be unit-tested without Android instrumentation.

## The API Mesh: Seven Backends, One Experience

MEGA GO consumes seven distinct APIs, each optimized for its domain:

| API | Domain | Scale Challenge |
|-----|--------|-----------------|
| OTT API | Content catalog, streaming | 10K+ RPS during peak |
| PAY API | Subscriptions, payments | Financial consistency |
| MDS API | Media delivery, DRM | Latency-sensitive |
| MFB API | Firebase integration | Real-time sync |
| SSO (Keycloak) | Authentication | 1,500 RPS validated |
| NOTIFY API | Push notifications | Burst during live events |
| Analytics | Youbora, Firebase | High-volume telemetry |

Each API has independent staging and development environments. The mobile app switches endpoints via build variants (release, staging, debug), allowing QA to test against pre-production backends while developers work against local mocks.

## DRM: The Invisible Architecture

Digital Rights Management is where OTT architecture becomes genuinely complex. MEGA GO supports three DRM systems:

- **Widevine** (Android/Web): Google's DRM, with L1 (hardware-backed) and L3 (software) security levels
- **FairPlay** (iOS/tvOS): Apple's DRM for Apple ecosystem
- **PlayReady** (Smart TV/Roku): Microsoft's DRM for TV platforms

The DRM license flow is itself a distributed system: content request → entitlement check → license server → device verification → decryption key delivery. Each step adds latency. During Festival de Viña 2026, with 150K concurrent users requesting HD streams, the DRM system had to sustain license delivery without becoming the bottleneck.

We pre-fetch licenses for the next episode during current playback, reducing perceived latency to near zero.

## Advertising Architecture: DAI, CSAI and the Revenue Stack

Monetization in MEGA GO operates in three modes:

1. **Subscription** (SVOD): Monthly plans with access to full catalog
2. **Pay-per-view** (TVOD): One-time purchases for premium events
3. **Advertising** (AVOD): Free tier with ads

The advertising architecture supports both:
- **CSAI** (Client-Side Ad Insertion): Ad stitching happens in the client player (ExoPlayer with IMA SDK)
- **DAI** (Dynamic Ad Insertion): Ad stitching happens server-side, delivering a single manifest with ads already inserted

DAI is critical for TV platforms where client-side ad insertion is unreliable. The architecture decision to support both modes (documented in ADR-001) means we can choose the optimal strategy per platform rather than forcing one approach everywhere.

## What I Would Do Differently Today

Looking at the architecture with three years of hindsight:

1. **Dependency Injection**: We did not use Hilt/Dagger from the start. Today I would inject repositories and API clients to improve testability and reduce singleton usage.

2. **Jetpack Compose**: The entire UI is XML-based. A Compose migration would reduce UI code by ~40% and enable shared component libraries across mobile and TV.

3. **Module Boundaries**: The ottlib module grew to contain too many responsibilities. I would split it into feature modules (auth-lib, player-lib, analytics-lib) to improve build parallelism and team autonomy.

4. **GraphQL**: Seven REST APIs mean seven different response formats. GraphQL with a federated gateway would reduce client-side data mapping complexity.

## The Core Lesson

Multi-platform OTT architecture is not about choosing the perfect technology stack. It is about designing boundaries that allow each platform to evolve independently while sharing the domain logic that defines your product.

The ottlib module — that shared AAR containing repositories, API clients and player wrappers — is the single most important architectural decision we made. It turned seven client platforms into one product.
