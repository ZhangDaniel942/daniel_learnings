# LLM：Transformer 与 Self-Attention

## 1. 整体结构

Transformer 由若干层 Block 堆叠，每层包含：

1. **Multi-Head Self-Attention**
2. **Feed-Forward Network (MLP)**
3. 残差连接 + LayerNorm

!!! note "Pre-Norm vs Post-Norm"
    现代 LLM（GPT-2 之后）几乎都用 **Pre-Norm**：`x = x + Attn(LN(x))`，训练更稳定。

## 2. Scaled Dot-Product Attention

$$
\text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

`1/√d_k` 防止内积过大导致 softmax 饱和。

## 3. Multi-Head

把 $d$ 维拆成 $h$ 个头，每个头维度 $d_h = d/h$，并行算 attention 再拼回：

```python
class MHA(nn.Module):
    def __init__(self, d, h):
        super().__init__()
        self.h, self.dh = h, d // h
        self.qkv = nn.Linear(d, 3*d)
        self.o   = nn.Linear(d, d)

    def forward(self, x):           # x: [B, T, d]
        B, T, d = x.shape
        q, k, v = self.qkv(x).chunk(3, dim=-1)
        q = q.view(B, T, self.h, self.dh).transpose(1, 2)
        k = k.view(B, T, self.h, self.dh).transpose(1, 2)
        v = v.view(B, T, self.h, self.dh).transpose(1, 2)
        a = torch.softmax(q @ k.transpose(-2,-1) / self.dh**0.5, -1)
        out = (a @ v).transpose(1,2).reshape(B,T,d)
        return self.o(out)
```

## 4. 位置编码对比

| 方案 | 显式参数 | 外推 |
|------|---------|------|
| Learned abs | 是 | 否 |
| Sinusoidal | 否 | 弱 |
| ALiBi | 否 | 强 |
| RoPE | 否 | 强（+NTK/YaRN）|

???+ tip "为什么需要位置信息"
    Attention 本身对顺序不敏感（permutation-equivariant），必须显式注入位置。

## 5. 计算量直觉

- Attention：$O(T^2 d)$，序列长时显存爆炸
- MLP：$O(T d^2)$，参数主体在这里

??? warning "长上下文瓶颈"
    $T^2$ 的 attention 是长上下文核心瓶颈，催生 Flash Attention / Ring Attention 等。

---

> 下一节：从预训练到对齐 (RLHF/DPO)。
