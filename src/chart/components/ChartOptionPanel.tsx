import { api } from '../../api/http.ts';
import { Button, Input, Toggle } from '../../components/index.ts';
import { axisStore, dataSettingsStore } from '../store/index.ts';

import { FieldRow } from './FieldRow.tsx';
import { Section } from './Section.tsx';

type ChartOptionPanelProps = {
  chartId: string;
};

export const ChartOptionPanel = ({ chartId }: ChartOptionPanelProps) => {
  const { state: dataSettingsState } = dataSettingsStore;
  const { state: axisState } = axisStore;

  const onClickedChangeChart = () => {
    void (async () => {
      await api.patch(`/canvas/charts/${chartId}`, {
        xAxis: axisState.xAxisName,
        yAxis: axisState.yAxisName,
      });
    })();
  };

  return (
    <div class="flex w-[30%] shrink-0 flex-col justify-center gap-8 bg-white/60 p-10">
      <Section title="DATA SETTINGS">
        <div class="flex flex-col gap-8">
          <FieldRow
            label="Show Data Values"
            toggle={
              <Toggle
                id={`${chartId}-data-values`}
                checked={dataSettingsState.showDataValues}
                onChange={v => {
                  dataSettingsState.showDataValues = v;
                }}
              />
            }
          />
          <FieldRow
            label="Show Percentage"
            toggle={
              <Toggle
                id={`${chartId}-data-pct`}
                checked={dataSettingsState.showPercentage}
                onChange={v => {
                  dataSettingsState.showPercentage = v;
                }}
              />
            }
          />
          <FieldRow
            label="Show Sum"
            toggle={
              <Toggle
                id={`${chartId}-data-sum`}
                checked={dataSettingsState.showSum}
                onChange={v => {
                  dataSettingsState.showSum = v;
                }}
              />
            }
          />
        </div>
      </Section>
      <div class="h-px w-full bg-gray-200" />
      <Section title="AXES">
        <div class="flex flex-col gap-4">
          <FieldRow
            label="X-axis Name"
            toggle={
              <Toggle
                id={`${chartId}-axis-x-toggle`}
                checked={axisState.showXAxisName}
                onChange={v => {
                  axisState.showXAxisName = v;
                }}
              />
            }
          />
          <Input
            id={`${chartId}-axis-x-input`}
            value={axisState.xAxisName}
            placeholder="X축 이름"
            onInput={e => {
              axisState.xAxisName = (e.target as HTMLInputElement).value;
            }}
          />
          <FieldRow
            label="Y-axis Name"
            toggle={
              <Toggle
                id={`${chartId}-axis-y-toggle`}
                checked={axisState.showYAxisName}
                onChange={v => {
                  axisState.showYAxisName = v;
                }}
              />
            }
          />
          <Input
            id={`${chartId}-axis-y-input`}
            value={axisState.yAxisName}
            placeholder="Y축 이름"
            onInput={e => {
              axisState.yAxisName = (e.target as HTMLInputElement).value;
            }}
          />
        </div>
      </Section>
      <div class="flex w-full justify-end">
        <div class="h-10 w-1/3">
          <Button label="저장" color="primary" onClick={onClickedChangeChart} />
        </div>
      </div>
    </div>
  );
};
