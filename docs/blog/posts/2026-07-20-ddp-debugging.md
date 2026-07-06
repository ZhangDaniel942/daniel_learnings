---
date: 2026-07-20
categories:
  - PyTorch
tags:
  - debugging
  - tips
---

# DDP 多卡调试速查

DDP 跑起来容易，调起来难。速查几个高频问题。

<!-- more -->

## 1. 死锁排查

```bash
py-spy dump --pid <rank0_pid>
```

看到某个 rank 卡在 `ncclAllReduce`，另一个 rank 已经返回 → 流水没对齐。

## 2. 显存不均

某张卡 OOM 而其他卡空闲，通常是：
- loss 只在某 rank 上算了（忘了 DDP 自动同步梯度）
- dataloader 的 ` DistributedSampler` 没设 `drop_last=True`

## 3. 随机性没同步

```python
torch.manual_seed(42 + dist.get_rank())
```

种子全相同会导致数据重复采样，反而掉点。

## 4. checkpoint 存取

!!! warning
    只存 rank 0 的 state_dict，加载时所有 rank 都加载同一份。

## 5. 任务清单

- [x] 加 `find_unused_parameters` 排查
- [x] 同步 BN
- [ ] 测梯度累积 + DDP 组合
- [ ] 上 ZeRO-2

---

> DDP 的核心是「对齐」。
