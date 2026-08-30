---
title: "BrainBraille: A Passively Learnable Brain Computer Interface using fNIRS"
excerpt: "BrainBraille is an attempted-movement brain-computer interface that maps combinations of body regions to language. For my undergraduate thesis, I explored a wearable fNIRS implementation and examined whether transitions between movements could expand the command set while improving classification accuracy."
teaser: "/images/brainbraille.jpg"
date: "2021-05-02"
collection: projects
category: research
tags: [ brain-computer-interfaces, fnirs, assistive-technology ]
links:
- [undergraduate thesis, paper, /files/misc_pdf/BrainBraille_Undergrad_Thesis.pdf]
- [BCI Meeting poster, paper, /files/papers/BrainBraille_BCIMeeting_2023_Poster.pdf]
- [President's Undergraduate Research Award, award, https://undergradresearch.gatech.edu/content/presidents-undergraduate-research-awards]

---

Many non-invasive brain-computer interfaces map one detectable brain response to one command. BrainBraille instead encodes characters through combinations of movements across six body regions, borrowing the compact structure of Braille. Its intended application is attempted-movement communication for people with little or no reliable muscle movement, while avoiding interfaces that require continuous visual attention.

My undergraduate thesis examined whether BrainBraille could be implemented with functional near-infrared spectroscopy (fNIRS), a wearable sensing method that estimates changes in blood oxygenation over the cortex. I built a processing and classification pipeline for transitions between executed left- and right-hand movements. The two-participant pilot involved healthy participants rather than intended assistive users; five-fold cross-validation reached 93% for one participant and 70% for the other. These results test the transition-classification method, not attempted-movement communication or performance in the target population.

The central interaction idea was to treat the transition between movements as information rather than noise. A conventional movement classifier distinguishes states such as left hand and right hand. A transitional classifier can instead distinguish left-to-right from right-to-left, increasing the number of commands without requiring several body regions to be activated simultaneously. In a later pilot analysis presented at the BCI Meeting, transition classification reached 92% compared with 81% for the two movements considered independently.

We also calculated how this encoding could affect communication capacity. Under the assumptions in that analysis, adding ordered transitions increased the modeled BrainBraille command space and raised estimated information transfer from 143 to 218 bits per minute at the same accuracy. This was a projection, not a measured end-to-end text-entry rate, and sequences may take longer to perform than individual gestures.

The project ultimately asks how the structure of an interaction vocabulary can compensate for the limited spatial resolution of non-invasive sensing. My [undergraduate thesis](/files/misc_pdf/BrainBraille_Undergrad_Thesis.pdf) describes the fNIRS prototype, and my [BCI Meeting abstract](/files/papers/BrainBraille_BCIMeeting_2023_Poster.pdf) develops an initial analysis of transitional gestures.
