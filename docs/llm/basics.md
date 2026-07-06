# LLM 基础：Token 与 Embedding

## 1. Tokenization

文本会被切分为 token，再映射为整数 id：

```python
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("gpt2")
ids = tok("hello world")["input_ids"]
print(ids)          # [31373, 995]
print(tok.decode(ids))  # hello world
```

## 2. Embedding 查表

每个 token id 通过 `nn.Embedding` 查到一个向量：

$$
x_t = E_{\text{tok}}[w_t] + E_{\text{pos}}[t]
$$

!!! note "位置编码"
    现代 LLM 常用 RoPE（旋转位置编码），不显式存查表，而是对 Q/K 做旋转。

## 3. 对比表

| 位置编码 | 是否可学 | 外推能力 |
|----------|---------|----------|
| Absolute | 是 | 差 |
| Sinusoidal | 否 | 一般 |
| RoPE | 否 | 好（配合 NTK/YaRN）|

???+ tip "记忆点"
    Embedding 是「词 → 向量」的入口，LLM 的第一步。

---

> Next: Transformer 结构与 Attention。
