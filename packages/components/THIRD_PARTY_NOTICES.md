# Third-party notices

`@upmo-ai/components` is licensed under AGPL-3.0-only (see `LICENSE`). It
depends on the following third-party software, which is installed from npm
alongside the package and is not copied into it. Each keeps its own licence;
the licence text ships in that package.

## Apache ECharts

- Package: `echarts` 6.1.0 (a runtime dependency)
- Used by: `LineChart` with `series`, `DonutChart`, `GroupedBarChart` and
  `ComboChart`, loaded lazily the first time one of them mounts
- Licence: Apache License 2.0
- Source: https://github.com/apache/echarts
- Copyright 2017-2026 The Apache Software Foundation

This product includes software developed at The Apache Software Foundation
(https://www.apache.org/).

The full licence text is in `node_modules/echarts/LICENSE` and the upstream
notice in `node_modules/echarts/NOTICE`. This package does not modify ECharts;
it imports only the line, bar and pie series, the grid, tooltip and aria
components, and the SVG renderer.

ECharts includes code derived from D3 (Copyright 2010-2016 Mike Bostock, BSD
3-Clause); its licence is in `node_modules/echarts/licenses/LICENSE-d3`.

## ZRender

- Package: `zrender` 6.1.0 (a dependency of `echarts`)
- Licence: BSD 3-Clause
- Source: https://github.com/ecomfe/zrender
- Copyright (c) 2017, Baidu Inc. All rights reserved.

The full licence text is in `node_modules/zrender/LICENSE`.
