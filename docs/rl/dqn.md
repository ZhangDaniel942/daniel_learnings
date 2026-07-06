# RL：DQN 与经验回放

## 1. 核心思想

用参数化函数 $Q_\theta(s,a)$ 逼近动作价值，通过 Bellman 方程自举训练：

$$
\mathcal{L} = \mathbb{E}_{(s,a,r,s')\sim\mathcal{D}}
\left[\big(r + \gamma\max_{a'} Q_{\theta^-}(s',a') - Q_\theta(s,a)\big)^2\right]
$$

## 2. 关键组件

!!! info "三个 trick"
    1. **Experience Replay**：把 $(s,a,r,s')$ 存进 buffer，随机采样打破相关性
    2. **Target Network** $Q_{\theta^-}$：缓慢更新，稳定目标
    3. **$\varepsilon$-greedy**：平衡探索与利用

## 3. 伪代码

```python
for step in range(N):
    a = eps_greedy(Q, s, eps)
    s2, r, done, _ = env.step(a)
    buf.add(s, a, r, s2, done)
    s = s2

    batch = buf.sample(B)
    s, a, r, s2, done = batch
    with torch.no_grad():
        y = r + gamma * Q_tgt(s2).max(1).values * (1-done)
    loss = F.mse_loss(Q(s).gather(1,a), y.unsqueeze(1))
    optim.step(loss)

    if step % sync == 0:
        Q_tgt.load_state_dict(Q)
```

## 4. 变体一览

| 算法 | 改进点 |
|------|--------|
| Double DQN | 解耦 action 选择与评估，缓解过估 |
| Dueling DQN | 拆 $V(s)$ 与 $A(s,a)$ |
| PER | 优先级经验回放 |
| Rainbow | 上述组合 |

??? warning "过估问题"
    $\max$ 会系统性高估 $Q$，Double DQN 用 $Q_\theta$ 选动作、$Q_{\theta^-}$ 估值来缓解。

## 5. 与 Policy Gradient 对比

| | DQN | PG |
|--|-----|-----|
| 动作空间 | 离散 | 连续/离散均可 |
| on/off-policy | off-policy | on-policy |
| 样本效率 | 高（复用 buffer）| 低 |
| 稳定性 | 较好 | 方差大 |

---

> DQN 适合 Atari 这类离散控制；连续控制见 SAC / PPO。
