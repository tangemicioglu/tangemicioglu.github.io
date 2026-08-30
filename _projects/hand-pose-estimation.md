---
title: "Hand Pose Estimation using Convolutional Neural Networks in Stereoscopic Vision"
excerpt: "Estimating hand poses is valuable for gesture interactions and hand tracking but often requires expensive depth cameras. Stereo cameras show multiple perspectives of the hand, allowing depth perception. We created a pipeline for estimating location of hand and finger keypoints with a stereo camera using deep convolutional neural networks."
teaser: "/images/hand-pose.png"
date: "2020-10-23"
collection: projects
category: coursework
tags: [ machine-learning, computer-vision ]
links:
- [slides, slides, /files/slides/hand_pose_slides.pptx]
---

Hand-pose estimation is commonly performed from a single color image or from a color-and-depth camera. A single view makes depth ambiguous, while dedicated depth hardware adds cost and constrains deployment. In this computer-vision course project, we examined whether two synchronized color images could provide the missing depth information through a learned stereo-fusion model.

Our pipeline projected 21 three-dimensional hand keypoints into the image plane, segmented likely skin regions, and passed a pair of stereo images into a convolutional network. Instead of calculating a disparity map explicitly and fusing the views geometrically at the end, we concatenated information from both cameras early enough for the network to learn how the views corresponded. The model produced probability maps for each joint and converted those maps into predicted coordinates.

![Architecture of the early-fusion stereo hand-pose model.](/images/hand-pose-architecture.png)

We trained on a 1,500-pair subset of an existing stereo hand dataset: 1,000 pairs for training, 250 for validation, and 250 for testing. The experiment did not converge to a usable estimator. Predicted keypoints showed a persistent offset across training and test images, and many fell near or outside the image boundary. Because the error was systematic and remained after optimization changes, we suspected a problem in the projection or coordinate-conversion stage, but we were not able to isolate it within the available time and compute budget.

That failure became the most informative result of the project. End-to-end geometric models can hide coordinate and calibration errors behind a decreasing training loss, and sparse documentation makes reproduction particularly difficult when several camera spaces are involved. A stronger version of the pipeline would validate every projection step independently, retain all geometry-based loss terms, train on more varied stereo configurations, and compare the learned fusion against an explicit disparity baseline. The linked slides document the original architecture and implementation.
