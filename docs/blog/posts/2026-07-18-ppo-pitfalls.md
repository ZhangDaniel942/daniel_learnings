---
date: 2026-07-18
categories:
  - RL
tags:
  - reading
  - pitfalls
---

# PPO 调参的常见坑

PPO 看起来简单，调起来全是坑。记录几个反复犯的错。

<!-- more -->

## 1. advantage 没归一化

```python
adv = (adv - adv.mean()) / (adv.std() + 1e-8)
```

不归一化，不同 batch 的 scale 差异巨大，loss 抖到飞起。

## 2. KL 早停没设

```python
if kl > target_kl * 2:
    break  # 提前结束本轮 epoch
```

不早停，策略漂移过大后续 epoch 全是噪声。

## 3. clip 范围搞混

!!! danger
    `torch.clamp(ratio, 1-eps, 1+eps)` 是对 **ratio** 裁剪，不是对 loss。

## 4. critic 学得比 actor 快

critic loss 系数 $c_1$ 太大 → $V_\phi$ 先收敛，advantage 估计失真。通常 $c_1 \in [0.25, 0.5]$。

## 5. 任务清单

- [x] 加 advantage 归一化
- [x] 加 KL 早停
- [ ] 调 critic 系数
- [ ] 接 GAE

---

> 调参本质是控制策略漂移。
