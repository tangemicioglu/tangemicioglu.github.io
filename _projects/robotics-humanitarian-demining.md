---
title: "Mobile Robotics for Autonomous Humanitarian Demining"
excerpt: "For the 2017 IEEE humanitarian-demining robotics challenge, our high-school team combined a low-cost mobile robot, dual-coil metal detector, decision-tree classifier, and ROS navigation stack. I worked on mine detection and supporting research; the team placed third and demonstrated the system at ICRA 2017."
teaser: "/images/hratc.jpg"
date: "2017-06-03"
collection: projects
category: organizations
tags: [ robotics, machine-learning, competition ]
links:
- [code, code, https://github.com/RCMakers/hratc2017_entry_rcmakers]
- [Finalist Award, award, https://www.inf.ufrgs.br/hratc2017/HRATC2017/Welcome.html]
---

Humanitarian demining combines two difficult problems: detecting small buried objects reliably and moving through unknown terrain without endangering people or equipment. For the 2017 IEEE Robotics and Automation Society Humanitarian Robotics and Technologies Challenge, our high-school team adapted a low-cost mobile robot with a dual-coil metal detector, range sensing, and a ROS navigation stack.

I worked on the mine-detection method and supporting research. The detector converted short windows from the two coils into features including current signal level, mean, median, variation, and rate of change. A decision tree classified likely mines, associated a detection with the position of the stronger coil, and rejected repeated detections within a local radius. The navigation node then treated reported mines and sensed obstacles as hazards while following a sweeping sequence of waypoints across the search area.

The code reflects the constraints of a competition prototype: manually tuned geometry, a fixed search pattern, and a classifier trained on a small project-specific dataset. These choices made the system practical to build and debug, but they also limit how well the approach would transfer to other soil conditions, mine types, sensor configurations, or safety-critical field deployment.

Team RCMakers placed third in the challenge and demonstrated the system at ICRA 2017. The [source repository](https://github.com/RCMakers/hratc2017_entry_rcmakers) preserves the detector, navigator, launch configuration, and contribution record.
