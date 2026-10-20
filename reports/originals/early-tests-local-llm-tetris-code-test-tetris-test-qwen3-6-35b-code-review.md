# Code Review — Round 8

## ❌ 旋转 bug 仍未修 — 代码未变动

声称已修，但 `index.html` 里仍然是：
```
WK[this.p.rotation]
```

必须改成：
```
WK.normal[this.p.rotation]
```

**具体操作**：在 `index.html` 内联 `<script>` 中，找到 `rotate()` 方法，  
把 `WK[this.p.rotation]` 改成 `WK.normal[this.p.rotation]`。  
全文只有这一处，用编辑器搜索 `WK[this.p.rotation]` 即可定位。
