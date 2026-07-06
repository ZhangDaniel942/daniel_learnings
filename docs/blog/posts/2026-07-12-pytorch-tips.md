---
date: 2026-07-12
categories:
  - PyTorch
tags:
  - tips
  - debugging
---

# PyTorch 调试小技巧

几个每天都会用到、但文档藏得很深的小招。

<!-- more -->

## 1. 看哪一层在吃显存

```python
torch.cuda.empty_cache()
torch.cuda.reset_peak_memory_stats()
# ... 跑一个 step ...
print(torch.cuda.max_memory_allocated() / 1e9, "GB")
```

配合 `torch.cuda.memory._record_memory_history()` 可以定位到具体算子。

## 2. 找到梯度爆炸的那一层

```python
for name, p in model.named_parameters():
    if p.grad is not None and not torch.isfinite(p.grad).all():
        print("nan in", name); break
```

!!! tip "注册 hook 批量看"
    ```python
    for name, p in model.named_parameters():
        p.register_hook(lambda g, n=name: print(n, g.norm().item()) or g)
    ```

## 3. tensor 不共享 storage 的坑

```python
a = torch.randn(4)
b = a.view(2,2)      # 共享 storage，改 b 影响 a
c = a.clone()        # 不共享
```

## 4. dtype 静默不对

混合精度下，`loss.item()` 拿到的是 fp16 scalar，打日志精度不够。统一 `.float().item()`。

## 5. DataLoader 卡住

- `num_workers>0` 在 mac 上要 `multiprocessing_context='fork'`
- 队列满了会假死，调大 `prefetch_factor`

??? warning "DDP 死锁"
    某个 rank 没参与某次 all-reduce 会卡死，排查时用 `py-spy dump --pid <pid>` 看栈。

## 6. 一行性能对比

```python
with torch.profiler.profile(activities=[Profiler.CPU, Profiler.CUDA]) as prof:
    train_step()
print(prof.key_averages().table(sort_by="cuda_time"))
```

---

> 调试是 PyTorch 的真正技能。
