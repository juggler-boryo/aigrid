declare module "react-calendar-heatmap" {
  import * as React from "react";

  export interface CalendarHeatmapProps {
    values: { date: string; count: number }[];
    startDate: string | Date;
    endDate: string | Date;
    classForValue?: (value: { date: string; count: number } | undefined) => string;
    tooltipDataAttrs?: (value: { date: string; count: number } | undefined) => object;
    showWeekdayLabels?: boolean;
    gutterSize?: number;
    horizontal?: boolean;
  }

  const CalendarHeatmap: React.FC<CalendarHeatmapProps>;
  export default CalendarHeatmap;
}
