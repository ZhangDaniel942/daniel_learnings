# PyTorch：标准训练循环

## 1. 最小骨架

```python
model = MLP(dim=64).cuda()
opt = torch.optim.AdamW(model.parameters(), lr=3e-4)
loss_fn = nn.CrossEntropyLoss()

for epoch in range(EPOCHS):
    model.train()
    for x, y in train_loader:
        x, y = x.cuda(), y.cuda()
        opt.zero_grad()
        logits = model(x)
        loss = loss_fn(logits, y)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        opt.step()
```

## 2. 各步骤作用

| 步骤 | 作用 |
|------|------|
| `model.train()` | 启用 dropout / BN 更新统计 |
| `zero_grad()` | 清掉上次累积的 `.grad` |
| `backward()` | 自动求梯度 |
| `clip_grad_norm_` | 防梯度爆炸 |
| `opt.step()` | 用梯度更新参数 |
| `model.eval()` | 关 dropout，BN 用历史统计 |

!!! tip "为什么 zero_grad 必不可少"
    PyTorch 默认梯度 **累加**，不清零会把多个 batch 的梯度混在一起。这是为支持多步反传（如 GAN、梯度累积）设计的。

## 3. 梯度累积（模拟大 batch）

显存不够时，分多次前向反传再统一 step：

```python
accum = 4
opt.zero_grad()
for i, (x, y) in enumerate(loader):
    loss = loss_fn(model(x), y) / accum
    loss.backward()
    if (i+1) % accum == 0:
        clip_grad_norm_(model.parameters(), 1.0)
        opt.step()
        opt.zero_grad()
```

## 4. 混合精度

```python
from torch.amp import autocast, GradScaler
scaler = GradScaler()
for x, y in loader:
    opt.zero_grad()
    with autocast('cuda'):
        loss = loss_fn(model(x), y)
    scaler.scale(loss).backward()
    scaler.step(opt); scaler.update()
```

=== "FP32"
    - 稳定，但慢、占显存
=== "AMP (FP16)"
    - 快 ~2x，省显存
    - 需 GradScaler 防 underflow
=== "BF16"
    - 同 AMP 但范围大、不需 scaler
    - Ampere+ GPU 推荐

## 5. 验证 & 保存

```python
@torch.no_grad()
def evaluate(model, loader):
    model.eval()
    correct = 0
    for x, y in loader:
        correct += (model(x.cuda()).argmax(1) == y.cuda()).sum()
    return correct / len(loader.dataset)

torch.save({'model': model.state_dict(),
            'opt':   opt.state_dict(),
            'epoch': epoch}, f'ckpt/{epoch}.pt')
```

??? warning "BN 的 eval 陷阱"
    单样本评估时 BN 会出错——要么 `eval()`，要么改用 LN/GroupNorm。

## 6. 任务清单

- [x] 跑通 MNIST 训练
- [x] 加梯度累积
- [ ] 加混合精度
- [ ] 接 DDP 多卡

---

> 至此：autograd → 训练循环 → 可以接 LLM 微调了。
