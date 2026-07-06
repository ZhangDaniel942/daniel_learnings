# LLM 对齐：SFT → RLHF → DPO

## 1. 三阶段 pipeline

```
Pretrain  →  SFT  →  RM  →  RLHF      (经典路线)
                        ↘  DPO        (绕过 RM)
```

## 2. SFT（监督微调）

在指令数据上做条件语言模型损失：

$$
\mathcal{L}_{\text{SFT}} = -\sum_t \log p_\theta(y_t \mid x, y_{<t})
$$

!!! tip "只算 response 的 loss"
    prompt 部分的 token 通常 mask 掉，不参与 loss。

## 3. RLHF

### 3.1 Reward Model

$$
\mathcal{L}_{\text{RM}} = -\log\sigma(r_\phi(x,y_w) - r_\phi(x,y_l))
$$

$y_w, y_l$ 为同一 prompt 下偏好/不偏好的回复。

### 3.2 PPO 目标

$$
\max_\theta\; \mathbb{E}_{x,y\sim\pi_\theta}\big[ r_\phi(x,y) - \beta\,\mathrm{KL}(\pi_\theta\|\pi_{\text{ref}})\big]
$$

!!! warning "KL 系数 $\beta$"
    太大 → 学不动；太小 → reward hacking，退化成乱码。

## 4. DPO（绕过 RM）

直接用偏好数据优化策略：

$$
\mathcal{L}_{\text{DPO}} = -\log\sigma\!\left(
\beta \log\frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)}
- \beta \log\frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)}
\right)
$$

=== "RLHF"
    - 需训 RM + 在线采样
    - 稳定但工程重
    - 奖励可解释

=== "DPO"
    - 无需 RM，离线训练
    - 训练简单、省显存
    - 易过拟合偏好数据

=== "GRPO"
    - 无 critic，组内相对优势
    - 适合推理类任务
    - DeepSeek-R1 路线

## 5. 任务清单

- [x] 理解 SFT loss masking
- [x] 推导 DPO 目标
- [ ] 复现一个小型 DPO 训练
- [ ] 对比 DPO vs GRPO 在数学任务上效果

---

> 参考：InstructGPT / DPO / DeepSeek-RM / GRPO 论文。
