---
title: "Autonomous Navigation for Mobile Robots in Open Terrain"
excerpt: "For RoboJackets' autonomous ground vehicles, I developed motor-control and path-planning software and built a full-scale Gazebo reproduction of the competition course. I later managed the mechanical, electrical, and software subteams as the project integrated perception, localization, planning, and recovery behavior into a single outdoor robot."
teaser: "/images/jessiii.jpg"
date: "2019-12-17"
collection: projects
category: organizations
tags: [ robotics, competition ]
links:
- [report, pdf, /files/misc_pdf/Jessiii_Design_Report.pdf]
- [code, code, https://github.com/RoboJackets/igvc-software]
- [3rd place Grand Award, award, http://www.igvc.org/results.htm]
---

The Intelligent Ground Vehicle Competition asks a mobile robot to navigate an outdoor course marked by painted boundaries, ramps, potholes, barrels, and GPS waypoints. Reliable autonomy therefore depends on the entire stack: mechanical traction, weather-resistant electronics, perception under changing light, localization, planning, low-level control, and a simulator capable of exposing failures before competition.

I joined RoboJackets' RoboNav team as a software member and later served as project manager across the mechanical, electrical, and software subteams. My early work included motor-control firmware, path-planning changes, and a full-scale Gazebo reproduction of the competition course. The simulator combined a qualification area, open-terrain sections, and deliberately difficult edge cases so that navigation could be tested without waiting for access to the physical robot.

The later Jessiii platform used a ROS-based pipeline with camera and LiDAR perception, localization from several sensors, and global and local planning over a traversability map. Multiclass image segmentation identified lane boundaries, potholes, and barrels; LiDAR produced a height map for uneven terrain; and timed-elastic-band planning converted a route into motor commands. Automated tests used mock publishers and subscribers to verify message behavior without the robot.

![RoboJackets' Jessiii autonomous ground vehicle.](/images/jessiii.jpg)

The design process was shaped as much by previous failure as by new features. Earlier runs exposed unreliable wiring, delayed planning responses, poor behavior around course boundaries, and insufficient side-camera data. The team responded with a rewired diagnostic network, recovery behavior, improved simulation, and explicit documentation of remaining failure points. That experience made the project an early lesson in treating robotics as systems engineering rather than a collection of individually impressive algorithms.

The [design report](/files/misc_pdf/Jessiii_Design_Report.pdf) describes the full 2021 robot, and the [open-source repository](https://github.com/RoboJackets/igvc-software) contains the ROS packages and simulation environment.
