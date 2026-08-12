export {
  Table,
  type TableProps,
  type TableColumn,
  type TableAlign,
} from "./Table.js";
export { KpiTile, type KpiTileProps } from "./KpiTile.js";
/* Three competing rethinks of KpiTile, live side by side in the playground
   until one is chosen; the winner takes the KpiTile name and the other two go. */
export { KpiTileA, type KpiTileAProps, type KpiTileTarget, type KpiTone } from "./KpiTileA.js";
export { KpiTileB, type KpiTileBProps, type KpiTarget } from "./KpiTileB.js";
export { KpiTileC, type KpiTileCProps, type KpiTargetC } from "./KpiTileC.js";
export { KpiTileD, KpiPanelD, type KpiTileDProps, type KpiPanelDProps, type KpiToneD } from "./KpiTileD.js";
export { MetricDelta, type MetricDeltaProps } from "./MetricDelta.js";
export { Sparkline, type SparklineProps } from "./Sparkline.js";
export { TrendChart, type TrendChartProps } from "./TrendChart.js";
export {
  BarChart,
  type BarChartProps,
  type BarChartDatum,
  type BarTone,
} from "./BarChart.js";
export { CompareChart, type CompareChartProps, type CompareSeries } from "./CompareChart.js";
export {
  SummaryCard,
  SummarySplit,
  type SummaryCardProps,
  type SummarySplitProps,
  type SummarySplitPart,
} from "./SummaryCard.js";
export { KeyValue, type KeyValueProps, type KeyValueItem } from "./KeyValue.js";
export { Pagination, type PaginationProps } from "./Pagination.js";
