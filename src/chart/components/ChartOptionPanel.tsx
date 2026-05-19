import { api } from '../../api/http.ts';
import { Button, Input, openToastMessage, Toggle } from '../../components/index.ts';
import { chartStore, dataSettingsStore } from '../store/index.ts';

import { FieldRow } from './FieldRow.tsx';
import { Section } from './Section.tsx';

type ChartOptionPanelProps = {
  chartId: string;
};

export const ChartOptionPanel = ({ chartId }: ChartOptionPanelProps) => {
  const { state: dataSettingsState } = dataSettingsStore;
  const { state: chartState } = chartStore;

  const onClickedChangeChart = () => {
    void (async () => {
      await api
        .patch(`/canvas/charts/${chartId}`, {
          xAxis: chartState.xAxisName,
          yAxis: chartState.yAxisName,
        })
        .then(res => {
          openToastMessage({ type: 'success', message: res.message });
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
                checked={chartState.showXAxisName}
                onChange={v => {
                  chartState.showXAxisName = v;
                }}
              />
            }
          />
          <Input
            id={`${chartId}-axis-x-input`}
            value={chartState.xAxisName}
            placeholder="X축 이름"
            onInput={e => {
              chartState.xAxisName = (e.target as HTMLInputElement).value;
            }}
          />
          <FieldRow
            label="Y-axis Name"
            toggle={
              <Toggle
                id={`${chartId}-axis-y-toggle`}
                checked={chartState.showYAxisName}
                onChange={v => {
                  chartState.showYAxisName = v;
                }}
              />
            }
          />
          <Input
            id={`${chartId}-axis-y-input`}
            value={chartState.yAxisName}
            placeholder="Y축 이름"
            onInput={e => {
              chartState.yAxisName = (e.target as HTMLInputElement).value;
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
