---
title: "SilentSpeller: Silent Speech Text Entry using Electropalatography"
excerpt: "SilentSpeller is a hands-free text-entry system that senses tongue contact through capacitive electrodes in a dental retainer. We evaluated silent spelling with a 1,164-word vocabulary while participants were seated and walking, as well as in live text entry."
teaser: "/images/silentspeller.png"
date: "2020-05-12"
collection: projects
category: research
tags: [ wearables, assistive-technology, subtle-interaction ]
links:
- [video, video, https://youtu.be/W1NpJ_bwiEU]
- [CHI'22 paper, paper, https://tangemicioglu.com/publications/#silentspeller-towards-mobile-hands-free-silent-speech-text-entry-using-electropalatography]
- [CHI'21 Interactivity paper, paper, https://tangemicioglu.com/publications/#mobile-hands-free-silent-speech-texting-using-silentspeller]
- [UROP Outstanding Oral Presentation Award, award, https://symposium.urop.gatech.edu/awards/]
- [BuzzFeed, press, https://www.buzzfeednews.com/article/richardnieva/google-glass-creator-is-experimenting-with-a-smart-retainer]
---

Speech interfaces leave an important gap between typing and speaking aloud. Audible speech can be inappropriate in a shared office, impossible in a noisy setting, or undesirable when a message is private. SilentSpeller investigated whether tongue movement could provide fast, hands-free text entry without requiring the user to vocalize.

The system uses a custom dental retainer with 124 capacitive electrodes on the palate. As a user silently spells a word, the tongue contacts different electrode patterns at 100 Hz. A recognition model interprets the resulting sequence and searches a language-model vocabulary. Because the sensor measures contact inside the mouth, it is less affected by whole-body motion than camera, acoustic, or surface-muscle approaches to silent speech.

![SilentSpeller retainer and examples of tongue-contact patterns used for silent spelling.](/images/silentspeller-2.png)

In offline testing on a 1,164-word vocabulary, SilentSpeller reached 97% average character accuracy. Performance was similar for phrases recorded while walking (97.5%) and seated (96.5%), and testing on 100 words not seen during training reached 94%. In live entry, seven participants averaged 37 words per minute at 87% character accuracy; the fastest demonstrations reached 53 words per minute.

These results showed that silent spelling could remain usable while mobile and scale beyond a small command set. They do not remove the practical barriers of the prototype: each retainer requires a dental impression, the hardware occupies the mouth, and longer-term comfort, hygiene, calibration, and recognition across changing speech patterns require further study.

SilentSpeller also reframes silent-speech interaction around spelling rather than reconstructing acoustics. This reduces training for people who already know how to spell, but makes performance depend on language and orthography. The [CHI 2022 paper](/files/papers/SilentSpeller_CHI_2022.pdf) reports the complete study, and the linked video shows live use.
