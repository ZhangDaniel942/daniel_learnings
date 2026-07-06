# 示例：MkDocs Material 渲染效果

> 本页用于演示各种 Markdown 扩展的渲染效果，方便对照调整样式。

## 1. 普通文本与格式

正文段落，包含 **加粗**、*斜体*、`行内代码`、~~删除线~~ 以及 [链接](https://www.mkdocs.org)。

## 2. 表格

| 算法 | 类型 | 优点 | 缺点 |
|------|------|------|------|
| PPO  | On-policy | 稳定 | 样本效率低 |
| DPO  | Offline   | 无需 reward model | 依赖偏好数据 |
| GRPO | On-policy | 节省 critic | 显存压力大 |

## 3. 代码块（带高亮 & 注解）

```python
import torch
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, dim: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(dim, dim * 4),  # (1)
            nn.GELU(),
            nn.Linear(dim * 4, dim),
        )

    def forward(self, x):
        return self.net(x)
```

1. 升维以增加表达力

## 4. Admonition 提示框

!!! note "Note 提示"
    这是一个 note 类型的提示框。

!!! tip "Tip 小技巧"
    使用 `mkdocs serve` 实时预览。

!!! warning "Warning 警告"
    修改 `mkdocs.yml` 后需要重启服务。

!!! danger "Danger 危险"
    不要把 secret 提交进仓库。



> [!CAUTION]
>
> * MDP 通过假设马尔可夫性质的存在来模拟状态转移和奖励。
> * 引入马尔可夫性质主要是为了使问题更容易解决。现实建模简化
> * 如果不假定马尔可夫性质，那么就必须考虑之前的所有状态和行动，而且组合的数量会呈指数级增长。



## 5. 可折叠块（Details）

??? info "点击展开详情"
    这里是默认折叠的内容，点击标题即可展开。

???+ info "默认展开的折叠块"
    加号 `???+` 表示默认展开。

## 6. 标签页（Tabbed）

=== "Python"

    ```python
    print("hello from python")
    ```

=== "Bash"

    ```bash
    echo "hello from bash"
    ```

=== "结果"

    ```
    hello
    ```

## 7. 任务列表

- [x] 搭建 MkDocs 站点
- [x] 配置 Material 主题
- [ ] 整理 LLM / RL 笔记
- [ ] 发布到 GitHub Pages

## 8. 数学公式（MathJax）

行内公式：$J(\theta) = \mathbb{E}_{\pi_\theta}[A(s,a)]$。

块级公式：

$$
\mathcal{L}_{\text{PPO}}(\theta) = \hat{\mathbb{E}}_t \left[
    \min\big( r_t(\theta)\hat{A}_t,\; \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t \big)
\right]
$$

其中 $r_t(\theta) = \dfrac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{\text{old}}}(a_t|s_t)}$。

## 9. 引用与键值列表

`key: value` 形式：

:   算法
    :   PPO

    用途
    :   RLHF

## 10. 分隔与脚注

正文内容[^1]。

[^1]: 这是一个脚注示例。

---

> Keep learning, keep building.
