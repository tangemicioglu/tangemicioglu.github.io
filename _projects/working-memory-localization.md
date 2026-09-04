---
title: "Localization of Working Memory using tfMRI"
excerpt: "In a Neuromatch Academy collaboration, we analyzed Human Connectome Project fMRI data from 100 participants across 360 cortical regions. Contrasting 2-back with 0-back tasks isolated increased frontoparietal activity and reduced activity in parts of visual cortex, but did not establish the direction of information flow between regions."
teaser: "/images/working-memory.png"
date: "2021-07-23"
collection: projects
category: organizations
tags: [ neuroscience, fmri, memory ]
links:
- [code, code, https://colab.research.google.com/drive/1XkjX9aF_FztIpzAETZ0UhufWfHd3lty4]
- [slides, slides, /files/slides/working_memory.pptx]
---

Working memory temporarily holds information needed for an ongoing task. The N-back paradigm varies this demand by asking a participant to compare the current stimulus with one shown either immediately or several trials earlier. In a Neuromatch Academy collaboration, we used task-based functional MRI from the Human Connectome Project to examine how activity changes between 0-back and 2-back conditions.

The dataset contained 100 participants and measurements across 360 cortical regions, with faces, bodies, places, and tools used as stimuli. We compared the two memory loads using t-tests and general linear models, applying false-discovery-rate correction across regions. We also contrasted stimulus categories to separate memory-related activity from visual selectivity.

![Cortical maps from the working-memory task analysis.](/images/working-memory.png)

Higher working-memory load isolated increased activity in the frontoparietal network and decreased activity in portions of visual cortex. Comparisons among stimulus categories recovered selective visual regions, suggesting that activity related to the remembered category remains distinguishable even when the image is no longer present. These analyses localized task-related activation, but the available dataset and project timeframe did not support our more ambitious question about the direction of information flow between regions.

The project was an introduction to reproducible neuroimaging analysis rather than a new general model of working memory. The results depend on the HCP task design, cortical parcellation, hemodynamic model, and selected contrasts. The linked notebook contains the analysis, and the slides summarize the methods, activation maps, and references.
