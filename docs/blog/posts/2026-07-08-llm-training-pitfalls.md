---
date: 2026-07-08
categories:
  - LLM
tags:
  - training
  - pitfalls
---

# LLM 训练踩坑笔记

跑通一个 7B 模型的 SFT 比想象中难，记几个反复犯的错。

<!-- more -->

## 显存

- AdamW 状态 ≈ 2× 参数量，FP32 下 7B 模型光优化器就要 ~56GB
- 用 AdamW8bit / DeepSpeed ZeRO-2 才塞得下
- activation checkpointing 省 30%+ 显存，慢约 20%

!!! tip "先量再训"
    用 `torch.cuda.memory_allocated()` 在第一个 step 后打一次点，心里有数再继续。

## loss 突然 NaN

常见原因：

1. **未 mask padding**，注意力吃到 0 token 导致数值异常
2. **lr 太大**，Adam 二阶矩没热起来就跳飞
3. **bf16 下未用 GradScaler 逻辑**（其实 bf16 不需要 scaler，但 fp16 需要）

```python
if not torch.isfinite(loss):
    print(step, "nan, skipping"); continue
```

## 数据

- tokenizer 的 `pad_token` 没设 → 报错
- chat template 拼错 → loss 收敛但生成全是垃圾
- mixed precision 下 label smoothing 容易溢出

## 任务

- [x] 跑通 1.5B SFT
- [ ] 上 DPO
- [ ] 多卡 DDP

---

> 踩坑才是真学习。
