---
title: "EchoForce: Continuous Wearable Grip Force Estimation with Acoustic Sensing"
excerpt: "EchoForce is a wristband that estimates grip force from acoustic reflections produced by subtle skin deformation above the forearm flexor muscles. We evaluated both user-dependent and user-independent models across sessions and hand orientations."
teaser: "/images/echoforce2.png"
date: "2025-04-01"
collection: projects
category: research
tags: [ wearables, sensing, force, muscle]
links:
- [ISWC'25 paper, paper, https://tangemicioglu.com/publications/#echoforce-continuous-grip-force-estimation-from-skin-deformation-using-active-acoustic-sensing-on-a-wristband]
---

Grip force is useful in rehabilitation, physical training, and assessment of strength in older adults, but it is usually measured with an instrument that must be actively held. Wearable alternatives often depend on tight placement, individual calibration, or sensors embedded in the object being grasped. EchoForce investigates whether force can instead be inferred continuously from the way forearm tissue changes during gripping.

The wristband contains a small speaker and microphone. It transmits inaudible acoustic sweeps and measures the returning echoes from the skin above the forearm flexor muscles. As grip force increases, muscle contraction subtly changes the shape and acoustic response of this surface. The system converts changes in the echo profile into an estimate of force without placing a sensor in the hand or on the object.

![EchoForce wristband and the acoustic signal changes produced by increasing grip force.](/images/echoforce.png)

In a study with 11 participants, a fine-tuned user-dependent model produced a mean error of 9.08% of maximum voluntary contraction. A user-independent model evaluated by leave-one-participant-out testing produced a mean error of 12.3%. The estimates remained comparatively stable across sessions and hand orientations, addressing two practical sources of drift in wearable force sensing.

EchoForce is a research prototype rather than a clinical strength instrument. The study used controlled grip tasks, a small participant sample, and force normalized to each participant's maximum. Longer-term work is needed to understand performance during complex activities, changes in wristband placement, fatigue, and variation in anatomy or health conditions.

The project illustrates a broader use for active acoustic sensing: a wearable can measure mechanical changes inside and around the body using inexpensive components already common in consumer devices. The [ISWC paper](/files/papers/EchoForce_ISWC_2025.pdf) describes the hardware, signal processing, models, and evaluation.
