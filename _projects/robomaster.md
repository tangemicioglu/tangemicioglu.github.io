---
title: "Multi-Agent Reinforcement Learning in the 2018 DJI RoboMaster AI Challenge"
excerpt: "I designed a recurrent reinforcement-learning and simulation framework for an autonomous robot in the 2018 DJI RoboMaster AI Challenge. Team RCMakers qualified as a finalist and placed 11th at ICRA 2018."
teaser: "/images/robomaster.jpg"
date: "2018-05-25"
collection: projects
category: organizations
tags: [ robotics, machine-learning, competition ]
links:
- [report, pdf, /files/misc_pdf/Team RCMakers Technical Report 2018.pdf]
- [Finalist Award, award, https://www.robomaster.com/en-US/resource/pages/announcement/863]

---

The 2018 DJI RoboMaster AI Challenge required autonomous robots to localize, avoid obstacles, identify opponents, aim, and make tactical decisions in a fast two-on-two match. Team RCMakers entered with a small high-school team and a limited hardware budget, which made simulation and compact learning methods central to our approach.

Our robot combined a Jetson TX1, two-dimensional LiDAR, a camera, and ultra-wideband localization. A vision pipeline detected illuminated armor plates and estimated a target's position, while adaptive Monte Carlo localization combined map, LiDAR, and UWB information. The decision system represented the game as a sequence of robot positions, target measurements, nearby obstacles, remaining time, and health.

I designed a recurrent reinforcement-learning framework in which a long short-term memory network selected among eight atomic actions at approximately 10 Hz. We first trained from 50 human-controlled matches, then continued training through policy-gradient updates in simulated self-play. After ten hours, the best model won 52% of self-play evaluation matches and 70% of 100 matches against a random-action baseline.

Those results were obtained in simulation. We did not have a full practice arena or additional robots with which to validate the learned decision policy on hardware, and the report identifies several parts of the reward function and match model that still needed revision. The project is best understood as a working learning-and-simulation framework developed under competition constraints, not as evidence that the policy generalized to real matches.

Team RCMakers qualified as a finalist among more than one hundred applicants and placed 11th among the finalists at ICRA 2018. The [technical report](/files/misc_pdf/Team%20RCMakers%20Technical%20Report%202018.pdf) documents the hardware, perception, localization, simulation, and learning pipeline.
