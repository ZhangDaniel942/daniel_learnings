# PyTorch：Autograd 机制

## 1. 计算图

PyTorch 用动态图：每次前向都构建一张 DAG，反向沿图反向传播梯度。

```python
import torch

x = torch.tensor(2.0, requires_grad=True)
y = x**2 + 3*x + 1     # forward
y.backward()            # backward
print(x.grad)           # dy/dx = 2x+3 = 7
```

## 2. `requires_grad` 与 `grad_fn`

- 叶子张量设 `requires_grad=True` 才会被追踪
- 中间张量带 `.grad_fn`，记录产生它的算子

!!! note "三种停止梯度方式"
    ```python
    z = x.detach()        # 1. 剥离
    with torch.no_grad(): # 2. 上下文
        z = x * 2
    z = x*2; z.requires_grad_(False)  # 3. 就地关闭
    ```

## 3. 链式法则直觉

对 $y = f(g(x))$：

$$
\frac{\partial y}{\partial x} = \frac{\partial y}{\partial g}\cdot\frac{\partial g}{\partial x}
$$

反向时每个算子只需知道「局部雅可比」$\partial\text{out}/\partial\text{in}$，框架自动链式相乘。

## 4. 常见坑

???+ danger "in-place 修改"
    对需要梯度的张量做 in-place 操作会破坏计算图，报 `RuntimeError: one of the variables needed for backward has been modified`。

??? warning "多次 backward"
    默认 `backward()` 会释放图，第二次调用报错。需要 `retain_graph=True` 才能多次反传。

## 5. 手写一个小 autograd

```python
class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data, self.grad = data, 0.0
        self._prev, self._op = set(_children), _op
        self._backward = lambda: None

    def __add__(self, other):
        out = Value(self.data + other.data, (self, other), '+')
        def _bw():
            self.grad += 1 * out.grad
            other.grad += 1 * out.grad
        out._backward = _bw
        return out
    # ... mul / relu ...
```

这是 micrograd 的核心，能帮你建立对 autograd 的直觉。

## 6. 任务清单

- [x] 理解动态图 vs 静态图
- [x] 写一个 micrograd
- [ ] 阅读 `torch/autograd/function.py`
- [ ] 实现自定义 backward

---

> 下一节：把 autograd 串成完整训练循环。
