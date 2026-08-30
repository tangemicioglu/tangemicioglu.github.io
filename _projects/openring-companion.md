---
title: "OpenRing Companion: A Local-First Health Dashboard for Tau-Ring"
excerpt: "OpenRing Companion is an independent Android companion app for Tsinghua's Tau-Ring smart ring. It replaces a data-collection-oriented interface with a local-first health dashboard that turns passive ring measurements into interpretable daily scores, trends, and intraday views while keeping health data and exports on the user's device."
teaser: "/images/openring-companion.png"
date: "2026-07-04"
collection: projects
category: independent
tags: [ wearables, android, health, bluetooth, local-first ]
links:
- [code, code, https://github.com/tangemicioglu/openring-companion]
---

Smart rings can collect detailed physiological signals, but access to the device does not always give a wearer meaningful access to their own data. OpenRing Companion is an independent Android application for Tsinghua HCI Lab's [Tau-Ring](https://arxiv.org/abs/2508.00778). It retains the ring and its published Bluetooth acquisition layer while replacing the original research-oriented interface with a local health dashboard.

The application periodically asks the ring to record five minutes of data, downloads the resulting files, and reconstructs red, infrared, and green photoplethysmography together with motion and temperature signals. It selects a relatively quiet window and runs bundled models on the phone to estimate heart rate, blood oxygen, respiratory rate, and experimental blood pressure. Hourly medians and daily summaries are computed from observations stored in the application's private directory.

![OpenRing Companion showing daily health summaries and longer-term trends on Android.](/images/openring-companion.png)

The design is deliberately local-first. There is no account, cloud service, analytics SDK, or upload path. Raw ring files, derived observations, baselines, and exports remain on the device, and missing periods remain missing rather than being synthesized for a smoother chart. A daily score is withheld until four complete prior days are available to establish a local baseline.

This is an experimental wellness application, not a medical device. Its estimates should not be used for diagnosis or treatment, and the blood-pressure model is especially preliminary: it is not calibrated against a cuff for the individual wearer and is excluded from the daily score. The current application also inherits hardware and native-library constraints from the upstream Tau-Ring software.

OpenRing Companion is independent of Tsinghua University and is not an official Tau-Ring app. The [source repository](https://github.com/tangemicioglu/openring-companion) documents the data flow, limitations, build process, upstream components, and third-party notices.
