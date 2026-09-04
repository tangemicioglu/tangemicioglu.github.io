---
title: "Tongue Gestures in Head Worn Devices"
excerpt: "At Microsoft Research, we collected 48,000 trials from 16 participants across eight closed-mouth tongue gestures using sensors in commercial head-worn devices. A multimodal model reached 94% accuracy, and a follow-on interaction technique used tongue gestures to confirm gaze targets without dwell for subtle, hands-free selection."
teaser: "/images/tonguegestures.png"
date: "2022-08-12"
collection: projects
category: research
tags: [ sensing, head-worn-displays, subtle-interaction ]
links:
- [ICMI'23 paper, paper, https://tangemicioglu.com/publications/#tonguetap-multimodal-tongue-gesture-recognition-with-head-worn-devices]
- [CHI'23 demo, paper, https://tangemicioglu.com/publications/#gaze-tongue-a-subtle-hands-free-interaction-for-head-worn-devices]
- [UbiComp'22 poster, paper, https://tangemicioglu.com/publications/#tongue-gestures-for-hands-free-interaction-in-head-worn-displays]
- [talk, video, https://www.microsoft.com/en-us/research/video/tongue-gesture-recognition-in-head-mounted-displays/]
---

Head-worn displays are often used when the hands are occupied, fatigued, or unavailable. Voice is conspicuous and unreliable in noise, while gaze usually requires a dwell interval that slows selection and can trigger unintended actions. Tongue gestures offer another channel: they can be performed with the mouth closed, do not occupy vision or hearing, and preserve use of the hands.

At Microsoft Research, we investigated whether these gestures could be recognized using sensors already positioned on the upper face. TongueTap synchronized eye and head tracking with EEG, photoplethysmography, and inertial sensing from two commercial headsets. We collected 48,000 trials from 16 participants across eight closed-mouth tongue gestures and two baseline conditions.

![TongueTap combining commercial headsets to sense closed-mouth tongue gestures.](/images/tonguetap.png)

A multimodal model classified the eight gestures with 94% accuracy. The inertial sensor alone reached 80% across all eight and 92% on a four-gesture subset, suggesting that a practical implementation may not require every sensing modality in the research setup. The dataset also supported user-independent evaluation, an important step toward an interface that does not begin with extensive individual training.

We then used tongue gestures as a confirmation channel for gaze. In *Gaze & Tongue*, the user points with their eyes and selects with a tongue action, avoiding the delay and ambiguity of dwell. Interactive demonstrations applied the technique to three games and a musical instrument, showing how multiple tongue gestures could provide more than a single click.

The work establishes feasibility rather than long-term usability. Future systems need to address false activations during speech, eating, or natural mouth movement; fatigue over extended sessions; social acceptability; and performance in less controlled headset configurations. The [TongueTap paper](/files/papers/TongueTap_ICMI_2023.pdf) contains the recognition study, while the [Gaze & Tongue paper](/files/papers/Tongue_Gestures_CHI_2023_Interactivity.pdf) describes the interaction demonstrations.
