---
title: "Classifying Exoplanet Candidates from Stellar Time Series"
excerpt: "In this machine-learning course project, we represented Kepler K2 light curves using generic time-series features and compared five classifiers on a curated set of 685 stars. A random forest produced the strongest result, with an F1 score of 0.83 and cross-validated accuracy of 0.80 ± 0.06; the model ranked candidates rather than confirming new planets."
teaser: "/images/exoplanet-discovery.png"
date: "2020-04-16"
collection: projects
category: coursework
tags: [ machine-learning, astronomy ]
links:
- [source writeup, writeup, https://github.com/andrewyarovoi/exoplanet-detection]
---

NASA's Kepler and K2 missions recorded the brightness of large numbers of stars over time. A planet passing in front of a star can produce a small periodic drop in that light curve, but the volume of observations makes exhaustive manual review impractical. In this machine-learning course project, we explored whether generic time-series features could help rank stars for follow-up without building a model around a single transit shape.

We assembled 685 K2 light curves from NASA's Mikulski Archive for Space Telescopes: 283 stars with confirmed planets and 402 without confirmed or suspected planets. After removing missing values and outliers, we summarized each light curve with 59 features from the FATS time-series analysis package. Constant and perfectly correlated features were removed, leaving 50 measures of variability, periodicity, distribution shape, and trend.

![Correlation matrix for the time-series features used to classify stellar light curves.](/images/exoplanet-discovery.png)

We compared random forests, support-vector machines, a linear support-vector classifier, naive Bayes, and lasso regression, with hyperparameters selected through ten-fold cross-validation. The random forest produced the strongest classification result: precision of 0.77, recall of 0.91, an F1 score of 0.83, and mean accuracy of 0.80 ± 0.06. Its errors favored false positives over false negatives, which is useful for a screening system in which missed candidates are more costly than extra follow-up.

This result should not be read as automated discovery of new exoplanets or evidence that astronomy knowledge is unnecessary. The dataset was small, curated, and far more balanced than the underlying archive, where confirmed planets are rare. Labels came from prior confirmation, and the generic features still encode choices about how stellar variability is represented. The project instead demonstrated a computationally modest baseline for triaging light curves and comparing feature-based classifiers. The [source writeup](https://github.com/andrewyarovoi/exoplanet-detection) preserves the data preparation, model comparison, figures, and references.
