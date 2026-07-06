# RL：Policy Gradient 直觉

## 1. 目标函数

策略梯度最大化期望回报：

$$
J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\left[ \sum_{t=0}^{T} \gamma^t r_t \right]
$$

其梯度为：

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\left[ \nabla_\theta \log \pi_\theta(a_t|s_t)\, G_t \right]
$$

## 2. REINFORCE 伪代码

```python
for episode in range(N):
    s = env.reset()
    log_probs, rewards = [], []
    for t in range(T):
        a, lp = policy.act(s)
        s, r, done, _ = env.step(a)
        log_probs.append(lp); rewards.append(r)
        if done: break
    loss = -(lp * G).sum()   # 减去 baseline 见下文
    optim.step(loss)
```

## 3. Baseline 的作用

!!! warning "高方差"
    原始 REINFORCE 方差很大，需要引入 baseline $b(s)$ 减小方差：

$$
\nabla_\theta J = \mathbb{E}\left[ \nabla_\theta \log \pi_\theta(a|s)\,(G_t - b(s)) \right]
$$

常用 baseline = value function $V_\phi(s)$，这就引出了 Actor-Critic。

## 4. 任务清单

- [x] 理解轨迹与回报
- [x] 推导 $\log \pi$ 的梯度
- [ ] 实现 REINFORCE
- [ ] 加入 baseline

---

> 下一节进入 PPO：在 PG 基础上做 clipping。
