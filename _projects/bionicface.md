---
title: "BionicFace: Closed-Loop Facial Symmetry for Facial Paralysis"
excerpt: "BionicFace is an assistive wearable research project for people with chronic facial paralysis caused by nerve damage. We are exploring glasses-based facial sensing and closed-loop electrical muscle stimulation to support real-time upper-face symmetry during social expression and communication, with a focus on hardware integration, calibration, comfort, safety, and everyday use."
teaser: "/images/bionicface.png"
date: "2026-07-28"
collection: projects
category: research
tags: [ wearables, assistive technology, facial paralysis, ems, closed-loop systems ]
links:
---

BionicFace is an early-stage wearable project for people with chronic unilateral facial paralysis caused by nerve damage. The aim is assistive: support facial symmetry while the device is being worn. It is not intended to repair the facial nerve, produce permanent recovery, infer emotion, or replace clinical treatment.

The current concept uses glasses to sense movement on the unaffected side of the face and surface electrical muscle stimulation to produce a corresponding movement on feasible targets on the affected side. Prior systems have shown these two components separately. [EyeEcho](https://doi.org/10.1145/3613904.3642111) demonstrated that acoustic sensors on glasses can estimate facial movement from nearby skin deformation, while [NEURO-BLINK](https://doi.org/10.1088/1741-2552/ad35e7) synchronized electrical stimulation on the affected side with a naturally occurring blink on the unaffected side. BionicFace investigates how a related sensing-and-stimulation loop can be integrated into a self-contained glasses form factor.

![Concept illustration of glasses sensing movement on the unaffected side and triggering surface stimulation on the affected side.](/images/bionicface.png)

The main research questions are therefore systems questions. The device must distinguish intended movement from noise, select safe stimulation parameters, align stimulation with the timing and magnitude of the sensed expression, and remain comfortable through calibration and everyday wear. A closed loop also needs predictable failure behavior: missed detections, false triggers, poor electrode contact, and power faults must not result in uncontrolled stimulation.

Work is currently focused on hardware architecture and the initial upper-face use case, especially eyebrow and eye-region movement. The next milestones are bench validation, documented safety limits, sensing and stimulation calibration, and evaluation measures for symmetry, latency, comfort, reliability, and communication utility. Any participant or patient evaluation would follow appropriate technical and clinical review after the integrated prototype is stable.
