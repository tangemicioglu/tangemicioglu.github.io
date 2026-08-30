---
title: "Artificial Intelligence through Symbiosis"
excerpt: "We investigated whether the structure of warehouse order-picking tasks could provide weak supervision for object recognition from egocentric video. The system learned visual object models from repeated picks without frame-level labels and was evaluated on independent orders."
teaser: "/images/ai-through-symbiosis.jpg"
date: "2020-11-07"
collection: projects
category: research
tags: [ machine-learning, computer-vision, head-worn-displays ]
links:
- [ICASSPW'23 paper, paper, https://alexanderyang.me/documents/papers/23-aits-icassp-workshop.pdf]
- [code, code, https://github.com/czming/ai-through-symbiosis]
---

Most computer-vision systems are trained on datasets that were collected and labeled before deployment. This project explored a different model: a wearable computer observes a person performing a repetitive task, uses the structure of that task as weak supervision, and gradually learns enough about the environment to assist the person doing the work. We studied this idea in warehouse order picking, where an error-detection system would need to recognize what a worker picked without adding another scanning or labeling step.

Our prototype recorded egocentric video and head motion while participants collected objects from shelves. The order list indicated which objects belonged in each task, but not the order in which they were picked. We used hand detections and shelf markers to segment each recording into picking actions, then clustered visual features from those segments to infer object identities. In this formulation, the routine itself supplies part of the supervision: repeated picks connect otherwise unlabeled images to the set of objects required by an order.

The later evaluation used 67 training tasks containing 244 picks. The system clustered ten objects with 93.8% accuracy on that training set. On independent tasks, recognition reached 90.3% for three-object orders and 69.1% for ten-object orders when predictions were constrained to objects on the pick list. These results established that useful object models could be recovered from weak task-level labels, while also showing that the method was not yet reliable enough to warn workers about errors in real time.

The broader idea behind *AI through symbiosis* is that learning can be embedded in ordinary interaction. Rather than treating a person only as a source of labeled examples, the system can use the goals, repetitions, and constraints already present in their activity. Order picking provided a concrete test case because the work is structured and repeated; the longer-term question is where else this form of ambient, minimally supervised learning can make assistance more responsive without making data collection into a second job.
