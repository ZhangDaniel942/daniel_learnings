# RL：PPO 关键点

## 1. 重要性比

用旧策略采样、新策略评估，需做重要性修正：

$$
r_t(\theta) = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{\text{old}}}(a_t|s_t)}
$$

## 2. Clipped 目标

$$
\mathcal{L}^{\text{CLIP}}(\theta) = \hat{\mathbb{E}}_t\left[
\min\big( r_t(\theta)\hat{A}_t,\; \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t \big)
\right]
$$

=== "直觉"
    把 $r_t$ 限制在 $[1-\epsilon, 1+\epsilon]$，防止单步更新过大。

=== "实现"
    ```python
    surr1 = ratio * adv
    surr2 = torch.clamp(ratio, 1-eps, 1+eps) * adv
    loss  = -torch.min(surr1, surr2).mean()
    ```

## 3. 总损失

$$
\mathcal{L}^{\text{PPO}} =
\mathcal{L}^{\text{CLIP}}
- c_1 \mathcal{L}^{\text{VF}}
+ c_2 S[\pi_\theta]
$$

!!! info "三项含义"
    - **CLIP**：策略目标
    - **VF**：价值函数 MSE
    - **$S$**：熵正则，鼓励探索

## 4. 常见超参

| 超参 | 典型值 |
|------|--------|
| $\epsilon$ | 0.1 ~ 0.3 |
| epochs/batch | 4 ~ 10 |
| $\gamma$ | 0.99 |
| GAE $\lambda$ | 0.95 |

??? danger "常见坑"
    不要在新策略上重新采样再算 ratio —— 那就不是 off-policy 修正了。

---

> 后续：DPO / GRPO 在 LLM 上的延伸。
