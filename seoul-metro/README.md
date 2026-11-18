# SEOUL METRO · 首尔地铁规划

一款原创的浏览器地铁规划小游戏。从 1974 年首尔站—东大门的一小段线路出发，在首尔逐渐扩张的城市中绘制你自己的轨道交通网络。

> 灵感来自 [VinsonFung/city-and-metro](https://github.com/VinsonFung/city-and-metro)，但本仓库是独立开发的同人作品，没有复制原作源代码。原作禁止商业使用，本作品同样仅供非商业游玩与学习。

## 试玩

本仓库启用 GitHub Pages 后，访问：

`https://wxzstudio.github.io/seoul-metro/`

也可以直接下载 `index.html`，用桌面版 Chrome / Edge / Firefox 打开即可游玩，无需安装依赖或构建。

## 玩法

- 点击「建造线路」，依次点击已解锁站点绘制线路；按 `Enter` 或点击「完成线路」确认。
- 每一段消耗资金，跨越汉江会额外收费；线路越长，每月维护成本越高。
- 时间自动推进并解锁新站点、新城区（1974 → 2030）。客流会在网络中寻找最短路径，换乘有时间惩罚。
- 满意度由覆盖率、拥挤度和财务状况决定；完成阶段目标可获得建设补助。
- 支持自动保存、手动保存/读取、JSON 导出/导入。

### 快捷键

| 操作 | 按键 |
| --- | --- |
| 选择 / 建造切换 | `V` / `B` |
| 完成线路 | `Enter` |
| 撤销一段 | `右键` / `Backspace` |
| 取消草稿 | `Esc` |
| 暂停 / 继续 | `空格` |
| 时间流速 | `1` / `2` / `4` |

## 特点

- 单文件 `index.html`：内联 CSS/JS，零构建、零依赖。
- 94 个首尔主要站点，中文译名 + 韩文原名，坐标基于公开站点位置数据做游戏化简化。
- 参考首尔地铁 1—8 号线识别色；线路完全由玩家自行规划。
- 深色玻璃质感界面、汉江地图、列车动画、客流与换乘模拟、阶段目标与城市日志。

## 文件

- `index.html` — 完整游戏
- `LICENSE.txt` — MIT 许可证（仅适用于本项目原创代码）
- `README.md` — 说明

## 数据与署名

- 站点名称与坐标：基于公开的首尔地铁站位置数据，游戏化简化，不代表真实运营数据。
- 线路颜色：参考首尔地铁官方识别色。
- 灵感与玩法方向：[City & Metro](https://github.com/VinsonFung/city-and-metro) · [VinsonFung](https://github.com/VinsonFung)。原作版权归原作者所有。

## 开发

```bash
# 本地试玩
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

也可以直接双击 `index.html`。进度保存在浏览器 `localStorage`，键名 `wxz-seoul-metro-v1`。
