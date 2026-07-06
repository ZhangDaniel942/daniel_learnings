---
date: 2026-07-10
categories:
  - RL
tags:
  - resources
  - reading
---

# 强化学习入门资源整理

按难度排序，亲测好用。

<!-- more -->

## 入门（直觉）

- 《强化学习的数学基础》Shusen Wang
- OpenAI Spinning Up（必读，代码清晰）
- 李宏毅 RL 课程（中文友好）

## 进阶（推导）

- Sutton & Barto《Reinforcement Learning: An Introduction》
- CS285 Berkeley（Sergey Levine）
- Silver 的经典 slides

## LLM + RL

| 资源 | 重点 |
|------|------|
| InstructGPT 论文 | RLHF 起源 |
| DPO 论文 | 偏好直接优化 |
| GRPO / DeepSeekMath | 组相对优势 |
| Nemo Aligner | 工程实现 |

!!! info "学习路径建议"
    Spinning Up → Sutton → CS285 → 跟一篇 RLHF/DPO 论文复现。

## 代码库

- `stable-baselines3`：经典算法集合
- `trl`（HuggingFace）：LLM 对齐全家桶
- `verl`：字节，GRPO 训练框架

## 任务

- [x] 读 Spinning Up
- [x] 跑通 PPO on CartPole
- [ ] 跟读 DPO 论文
- [ ] 复现 GRPO 小模型

---

> 别只看视频，写代码才算学过。
