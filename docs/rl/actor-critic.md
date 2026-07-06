# RL：Actor-Critic 与 GAE

## 1. 为什么需要 Critic

REINFORCE 方差大，引入 value function $V_\phi(s)$ 作 baseline：

$$
\nabla_\theta J = \mathbb{E}\left[\nabla_\theta\log\pi_\theta(a|s)\,(G_t - V_\phi(s))\right]
$$

$A_t = G_t - V_\phi(s)$ 即 **优势函数**。

## 2. A2C / A3C 结构

- **Actor** $\pi_\theta(a|s)$：输出动作分布
- **Critic** $V_\phi(s)$：输出状态价值

```python
class ActorCritic(nn.Module):
    def __init__(self, s_dim, a_dim, h=128):
        super().__init__()
        self.body = nn.Sequential(nn.Linear(s_dim, h), nn.Tanh(),
                                  nn.Linear(h, h), nn.Tanh())
        self.actor = nn.Linear(h, a_dim)
        self.critic = nn.Linear(h, 1)

    def forward(self, s):
        x = self.body(s)
        return self.actor(x), self.critic(x)
```

## 3. GAE（广义优势估计）

用 TD 残差 $\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)$ 指数加权求和：

$$
\hat{A}_t^{\text{GAE}(\gamma,\lambda)} =
(1-\lambda)\sum_{l=0}^{\infty}\lambda^l \hat{A}_t^{(l+1)}
$$

等价形式：

$$
\hat{A}_t = \delta_t + \gamma\lambda\,\hat{A}_{t+1}
$$

| $\lambda$ | 行为 |
|-----------|------|
| 0 | 退化为 TD(0)，偏差大方差小 |
| 1 | 退化为 Monte-Carlo，方差大偏差小 |
| 0.9~0.95 | 常用平衡点 |

???+ tip "GAE 是 PPO 的标配"
    PPO 几乎都用 GAE 估计优势，再配合 clipping 做稳健更新。

## 4. Critic 损失

$$
\mathcal{L}_{\text{VF}} = \big(V_\phi(s_t) - \hat{R}_t\big)^2
$$

其中 $\hat{R}_t = \hat{A}_t + V_\phi(s_t)$ 是 return 估计。

---

> 下一节：DQN —— 当动作空间离散时的另一条路。
