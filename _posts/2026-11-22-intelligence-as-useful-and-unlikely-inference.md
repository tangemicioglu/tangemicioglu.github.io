---
title: "Intelligence as Useful and Unlikely Inference"
date: 2026-11-22
permalink: /posts/intelligence-as-useful-and-unlikely-inference/
header:
  teaser: /images/intelligence-inferential-efficiency.png
tags: [artificial-intelligence, intelligence, inference]
areas: [agents]
description: >-
  Typically, the people we consider intelligent are those who come up with unexpected, highly impactful insights. Why should AI be any different?
excerpt: >-
  <img src="/images/intelligence-inferential-efficiency.png" alt="Comparison of inferential efficiency at equal levels of knowledge" width="280" loading="lazy"><br>
  Typically, the people we consider intelligent are those who come up with unexpected, highly impactful insights. Why should AI be any different?
---

<figure>
  <img src="{{ '/images/intelligence-inferential-efficiency.png' | relative_url }}" alt="Comparison of inferential efficiency at equal levels of knowledge">
  <figcaption>Even among people with equal knowledge, they aren't necessarily equal in what ideas they come up with based on that knowledge. Capturing this lets us measure the "efficiency" aspect of intelligence.</figcaption>
</figure>

Another Millennium problem got solved [this week](https://alpo.ge/remark.pdf). Theoretical mathematics, which has historically been the stereotype for high-intelligence problem-solving, fell to Big Computer before most other disciplines. Given the ways we ordinarily talk about intelligence, this has been confusing. If AI is at the frontier of math, why is AI not superhuman at all engineering yet? Why do the models still sometimes struggle in mundane tasks, like interpreting visual content? Many have attempted to explain this through the [jagged frontier](https://www.oneusefulthing.org/p/the-shape-of-ai-jaggedness-bottlenecks), but these are generally dissatisfying. Why is it actually jagged? Is it really just domain-specific data scaling? And if it is, why can humans do these things without large-scale data?

One clue, I think, as to what's gone differently than expected is that the [mathematicians lament](https://www.cs.ox.ac.uk/people/leslieann.goldberg/MathsAI.html) that the AI did not need to come up with new abstractions in the process. In a way, the creation of new conceptual machinery, more so than the proofs, is how mathematics evolves and contributes to other fields. Many of the problems AI has solved so far have been in spaces where existing mathematical machinery, sometimes brought together in surprising ways, was sufficient. So, rather than making leaps in logic that lead to entirely new directions, much of the innovation in the proofs has been thanks to the wide base of knowledge current AIs have. Some of these proofs are elegant, such as [Levent Alpöge's Jacobian conjecture counterexample](https://lean4.dev/proofs/jacobian-conjecture), while others are more reminiscent of pre-AI computational proofs, ugly but effective. Many thought that AIs may be able to come up with new solutions by reasoning in dimensions and abstractions that the human mind cannot contemplate, but so far, it has strangely been the opposite -- humanlike reasoning with the entire knowledge of humanity, a mind-meld with computational provers, and unbelievable patience.

## Capability vs. Intelligence

Instead of trying to come up with a score of "mathematical capability," I would like to approach this by understanding what the AI was actually superhuman at. First off, any AI with sufficient compute trivially has **superhuman speed**. They can test ideas faster than humans can, and even if they get it wrong more frequently, in domains with clear verification or feedback, they can make progress. Superhuman speed also lets them seek new information faster, which we will get to later. Secondly, LLM-based approaches give the models **superhuman knowledge**. Imagine if you had at least a vague idea of literally all math ever. The LLMs have been trained by digesting every single book, every paper, every discussion. A neglected idea in a paper from 50 years ago? The model knows it. A random comment nobody responded to on the Erdős problems website? The model knows it, or can use a search engine to see it instantly if relevant. We have underestimated the degree to which knowledge is power.

With that said, I will get to my claim that may be more contentious. I believe that current models, despite having superhuman capabilities in math, do not have **superhuman intelligence**, even in math. That doesn't mean they can't make novel inferences, but rather they are less likely to do so than a human would be if they had internalized the same amount of knowledge. Many of the greatest successes so far have been in centaur configurations in which humans and LLMs work together, leveraging the advantages of both. Others have involved combining superhuman speed and knowledge to solve the problems by virtue of effort. Despite being extraordinarily successful, the LLMs have been limited in how efficiently they use their knowledge. Why? I believe the broader issue is that in pursuit of generality, capability has been conflated with intelligence.

By some definitions of intelligence used across the AI field, my claim is paradoxical, because intelligence has, for several decades, been defined as cross-domain capability. The [Legg & Hutter definition](https://arxiv.org/abs/0712.3329) popularized this notion and also served to justify the use of performance measures across a wide range of tasks. Discussions around the [Yudkowskian definition](https://www.lesswrong.com/posts/yLeEPFnnB9wE7KLx2/efficient-cross-domain-optimization) have also frequently focused on the cross-domain aspect of the definition, while its efficient optimization aspect has been comparatively neglected. Many current indices and scores have been informed by cross-domain performance, trying to map the capability space of AI. I believe that while capability measures are valuable, framing intelligence as generalized capability is increasingly counterproductive.

In the days of game-playing AIs, working across different games was treated as an explicit goal. LLMs began, instead, with inference (in the logical sense rather than ML sense). They inferred the next word to generate based on the given context. Eventually, those inferences became more useful, helping them sustain conversation, take action, and accomplish goals. Cross-domain generality was a downstream effect that emerged from the inference, once it got good enough. This suggests that quality inference was a more fundamental aspect than generalization as a goal in itself.

Beyond this, LLMs also had an incredible amount of knowledge crammed into them via training. The tests that LLMs first succeeded at included SATs, bar exams, and other standardized tests, starting with GPT-4. By [Lenat & Feigenbaum](https://ijcai.org/proceedings/1987/240)'s knowledge principle, the amount of knowledge should have been sufficient for LLMs to become superintelligent. However, most of what LLMs use has been crystallized intelligence, [as others have argued before](https://www.lesswrong.com/posts/Zxw3ZcmSdndpQyJ6M/what-if-llms-are-mostly-crystallized-intelligence). I refer to this as superhuman knowledge to make it more distinct from intelligence. By definitions that are more inclusive of crystallized intelligence, we have already had [AGI since 2023](https://arxiv.org/abs/2303.12712).

## Intelligence as Inferential Reach

So, what is intelligence then? The pursuit of a general AI was heavily inspired by [Spearman's g](https://psychclassics.yorku.ca/Spearman/index.htm), and the various intelligence tests designed to measure it. However, at the end of the day, much of what we obsess over is [Cattell & Horn's fluid intelligence](https://pubmed.ncbi.nlm.nih.gov/5918295/) -- our ability to reason in abstract spaces, recognize patterns, and solve problems. Unfortunately, we suck at measuring it in humans and LLMs alike. Test-taking strategies and knowledge of similar test questions help, regardless of the type of intelligence test being taken. The benefits of practicing for the SAT and the success of GPT-4 on SATs are also evidence that knowledge can go a long way once a baseline level of fluid intelligence is achieved.

I would like to approach the measurement of intelligence from a different direction. In Ancient Greece, rather than our industrialized quantification of intelligence, there was the notion of *daimon*s. Those who had unusually insightful ideas were said to be visited occasionally by spirits. That is, their intelligence was stochastic. Since they did not have standardized testing, many of their problems were open-ended, where stochastic breakthroughs were more salient than mundane inferences in constrained problems. The greatest minds (the ones best at listening to their *daimon*) were the ones who found inspiration frequently.

A more modern way of looking at this is to think of ideas as sampled from a probability distribution of all possible ideas. For whatever reason, someone who is intelligent appears to repeatedly sample from the right tail of the outcome distribution, finding ideas that are unlikely to be found, but also highly useful. They may still have bad ideas, but their personal outcome distribution is skewed, so they often make interesting inferences where others do not. Meanwhile, someone who is otherwise not the smartest may still run into a brilliant idea, because inference is stochastic.

<figure>
  <img src="{{ '/images/intelligence-stochastic-insight.gif' | relative_url }}" alt="Animated illustration of how frequently an agent makes useful inferences">
  <figcaption>An agent that is more intelligent frequently comes up with inferences that are useful to their goals.</figcaption>
</figure>

If we wish to examine fluid intelligence, as [François Chollet has pointed out](https://arxiv.org/abs/1911.01547), it's important to keep baseline knowledge constant. After all, we reason by standing on our pile of knowledge and then trying to reach something new. From our pile, we look at the new information we've gathered, and make inferences based on the patterns in the information we see. Different agents, even with the same prior knowledge and new information, may grasp for different inferences. If one of these agents is more intelligent, they will be more likely to make inferences that are useful for its goals, and that others would be unlikely to do.

Let's call this the **inferential reach** model of intelligence. That is, intelligence is the likelihood of making inferences that are unlikely to be performed within the search space, and that also lead to useful, or preferred, outcomes. A high inferential reach allows you to frequently see connections that others do not, despite having the same baseline level of knowledge. High inferential reach leads to cross-domain optimization, as it lets you infer connections both within and between domains. As you acquire more knowledge, high inferential reach lets you use it more effectively, as you end up making more useful inferences with that knowledge than others would.

This framing complements Chollet's definition of intelligence as skill-acquisition efficiency. If we look at what efficient learning involves, it can be broken into three parts. When we approach an unfamiliar problem, we first gather information, so we can relate it to problems we already understand. Agents differ here, as some information-gathering strategies are better than others. Next, we draw on knowledge, and even when domain-specific knowledge is equal, an agent with broader knowledge has more domains to draw inferences from. Finally, even with equal prior knowledge and information, a more intelligent agent makes more useful inferences from them, and understands the problem faster. Inferential reach is this last component: the part of efficient learning that remains when prior knowledge and information are held constant.

<figure>
  <img src="{{ '/images/intelligence-inference-and-performance.png' | relative_url }}" alt="Diagram connecting prior knowledge, information gathering, and inference to performance">
  <figcaption>Our performance in new tasks is determined by a complex interaction between our ability to gather information, our prior knowledge, and our ability to draw useful and unlikely inferences leveraging both.</figcaption>
</figure>

## Measuring Inferential Reach

I will briefly attempt to formalize inferential reach, although this is the part I am least confident in. At its core, inferential reach can be explained as the average usefulness of an agent's inferences, weighted by how unlikely those inferences are to be independently discovered given the same prior knowledge:

<div markdown="1" style="overflow-x: auto;">

$$  
I_a(K)=  
\mathbb E_{(p,z)\sim G_a(\cdot\mid K)}  
\left[  
u_p(z)\log_2\frac{1}{P_0([z]\mid p,K)}  
\right]  
$$

</div>

Here, $I_a$ is the intelligence of agent $a$ given prior knowledge $K$ for all inferences $z$ across all problems $p$. This is expressed by the expected usefulness $u_p(z)$ multiplied by how unlikely it is for a reference process $P_0([z]\mid p,K)$ to discover an equivalent inference $[z]$, averaged over all inferences made by the agent.

There are many ways in which usefulness and a reference process could be defined. For the purpose of this post, let's say that $P_0([z]\mid p,K)$ is the probability that a group of reference humans with the same knowledge makes equivalent inferences, similar to [ARC-AGI's approach](https://arxiv.org/abs/2409.01374). Meanwhile, let's say usefulness is the [probability of necessity and sufficiency](https://proceedings.mlr.press/v206/li23d.html) for successful outcome $S$, $P(S_z = 1, S_{¬z} = 0)$.

I should emphasize here that inferential reach is computed over all inferences, which is distinct from approaches that calculate based on all solutions, or all actions taken. In practice, how could we measure this? For humans, our best approach is thinking out loud while solving a problem, so that each inference gets recorded. For AI, it could be through chain-of-thought methods.

There are also some alternate formulations that could be done for inferential reach that would bypass the need for a reference process or population. However, many of the traditional alternatives (e.g., Kolmogorov complexity) effectively end up comparing to brute-forcing a problem. I would love to hear ideas on this. 

## Inferences in Closed and Open Problem Spaces
Chess is a much-loved domain for discussions of both human and artificial intelligence. Yet, in humans, studies have shown that [chess expertise only weakly correlates with cognitive abilities](https://www.sciencedirect.com/science/article/pii/S0160289616301593). However, the relationship between fluid reasoning and chess expertise is stronger among younger or less-skilled players. Intelligence is useful up to a point, allowing a player to discover patterns and understand relationships more effectively. Afterward, domain-specific knowledge dominates, and intelligence only becomes useful when they encounter unfamiliar board configurations. Chess experts develop compact neural representations of [board configurations and strategic relationships](https://doi.org/10.1038/s41467-026-74566-z), letting them achieve greater capability regardless of whether they are the smartest player. Experts improve not by extending their fluid reasoning, but by training in as many of these unfamiliar configurations as possible. This is a useful model for the success of AI in many domains. Seen enough Olympiad problems? Written a lot of code? In many domains, you only need a baseline level of intelligence to succeed.

On the flip side, we have chess engines. Aren't these industrial-scale inference machines highly intelligent by this argument? Not necessarily. Inferential reach is determined by the quality of the average inference made, including every move considered even if it is not played. Classical tree-pruning engines evaluate tens of millions of positions per second, almost all of which no player would consider. Thus, we can say that their inferences are highly unlikely, but very low usefulness. These systems succeed by sheer inference volume. This goes back to what I mentioned at the start -- superhuman speed. When you work faster, you get more room for your inferences to be wrong, especially when you have a feedback mechanism telling you which inferences were useful (e.g. by a value function). AlphaZero-style systems are more selective, searching tens of thousands of positions per second, but still fall well short of grandmasters, whose few candidate moves are of much higher in usefulness, some of which would be surprising to an average player.

<figure>
  <img src="{{ '/images/intelligence-chess-inference-efficiency.png' | relative_url }}" alt="Comparison of the reasoning behind the same chess move" width="692">
  <figcaption>Behind the same move, there may be a different number of moves considered. Resource efficiency is one way to handle this, but it often leads instead to discussions of biological systems vs. computer systems. Average inference quality is thus a useful alternative.</figcaption>
</figure>

Now, we can go back to math. Why is it that current AIs thrive in problems where no new abstraction was needed? Similarly to the engine, the AI chains together inferences at a scale that is mind-boggling to humans, even if each step in the chain is not especially surprising. They can also make inferences based on a much wider base of knowledge, enabling them to still make inferences that are beyond a single human's expectations. Verification is harder, because a provable lemma is not necessarily useful to the proof. If they are working with a human expert, the human can assist by inferring which paths are directionally correct to get to an eventual proof. However, due to the stochasticity of inference, simply scaling inference, i.e. having the AI "try harder" or parallelize with multi-agent methods can also be sufficient. On the other hand, when entirely new directions are needed, these are much harder to achieve without greater inferential reach.

Viewing intelligence as inferential reach instead of cross-domain capability also helps explain why the capability frontier is jagged without needing to say one domain is easier than the other. An agent may have more knowledge in some domains (i.e. data scaling), or have better inferential reach in some domains. It's also possible that even without greater knowledge or intelligence, the agent can verify results better, or scale the number of inferences without being more intelligent about it.

<figure>
  <img src="{{ '/images/intelligence-jagged-frontier.gif' | relative_url }}" alt="Animated illustration of the jagged frontier of AI capabilities">
  <figcaption>The jagged frontier is the result of combining aspects of both the agent and the environment, which work together to improve performance.</figcaption>
</figure>

A good way to determine when superhuman inferential reach is achieved is what's been described as the [Einstein test](https://www.nature.com/articles/d41586-026-02804-x) by Demis Hassabis. For an AI to discover general relativity using only knowledge from before 1911, it needs to make leaps in logic that require substantial inferential reach. The eventual inference is both highly unlikely (as other physicists did not discover it) and highly useful. The test is still not perfect, as the AI would have more knowledge than Einstein did, and likely benefit from stochasticity by making more total attempts at inferences, but it's close enough.

Inferential reach also explains why LLMs, despite their vast breadth of knowledge, sometimes have a more surface-level understanding of it. High inferential reach allows us to better digest information, by making more useful inferences across it. Our ability to digest information more efficiently is what lets humans learn without needing massive amounts of data, as LLMs do.

## Conclusion

It may seem that I have argued here that LLMs are less capable than they are. Instead, the fact that so many of the skills we take pride in can be achieved with limited fluid intelligence and humanity's collective knowledge is quite humbling. Meanwhile, comparing the crystallized intelligence of a frontier model with that of humans would be pointless, as AI has clearly far outpaced humans in this regard. As long as both of these hold true, human-AI teams are likely to outperform both human-only teams and AI-only teams.

Some may also interpret what I've written as implying that AIs won't be able to do research. I don't think this is necessarily true either. It's possible that we continue our bitter lesson by discovering that improving AI capabilities is solvable with knowledge rather than intelligence as well. My expectation, though, is that the more novel research breakthroughs will continue to come from human-AI teams. On the other hand, this would also mean that the strangeness of superhuman intelligence hasn't even truly begun yet.

Overall, decoupling capability from intelligence lets us better reason about what combination of cognitive abilities actually leads to a particular capability. How much was domain-specific knowledge? How much of it was reliable feedback and verification? How much of it was access to tools that simplify the space? How much was actually fluid intelligence? These will, of course, be entangled in their own cybernetic loops, but distinguishing them allows us to make sense of the jagged edges of the frontier, and better understand AI and human cognition alike.
