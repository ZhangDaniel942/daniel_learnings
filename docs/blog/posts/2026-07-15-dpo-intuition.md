---
date: 2026-07-15
categories:
  - LLM
tags:
  - training
  - tips
---

# DPO 训练的几个直觉

复现 DPO 时最容易卡住的几个理解点。

<!-- more -->

## 1. 它不是在训 reward model

很多人以为 DPO 还在学一个隐式 reward，其实它**直接**对策略做偏好最大化，reward 只是推导过程的中间量。

## 2. $\beta$ 的物理意义

$$
\mathcal{L}_{\text{DPO}} = -\log\sigma\!\left(
\beta \log\frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)}
- \beta \log\frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)}
\right)
$$

- $\beta$ 大 → 强约束，贴近 ref，学得慢但稳
- $\beta$ 小 → 自由度高，易过拟合偏好数据

## 3. ref 模型不能省

去掉 ref 项就退化成纯 likelihood ratio，会无脑放大 $y_w$ 的概率，崩成乱码。

!!! tip "经验值"
    小模型 $\beta \in [0.1, 0.5]$，配合 1~2 epochs 就够。

## 4. 任务清单

- [x] 推导 DPO 目标
- [ ] 跑通一个小型 DPO
- [ ] 对比不同 $\beta$

---

> 下一篇写 GRPO 的组内优势。
