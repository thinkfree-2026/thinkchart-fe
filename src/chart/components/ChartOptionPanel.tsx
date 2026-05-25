import { api } from '../../api/http.ts';
import { Button, Input, Toggle } from '../../components/index.ts';
import { chartStore, dataSettingsStore } from '../store/index.ts';

import { chartControlsRef } from './ChartModal.tsx';
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
          name: chartState.name,
          unit: chartState.unit,
        })
        .then(() => {
          chartControlsRef.current?.redraw();
        });
    })();
  };

  return (
    <div class="flex w-[30%] shrink-0 flex-col justify-center gap-4 bg-white/60 p-10">
      <Section>
        <div class="flex flex-col gap-8">
          <FieldRow
            label="값 표시 여부"
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
            label="퍼센트 표시 여부"
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
            label="합 표시 여부"
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
      <Section>
        <div class="flex flex-col gap-4">
          <FieldRow label="차트 제목" />
          <Input
            id={`${chartId}-chart-title-input`}
            value={chartState.name}
            placeholder="차트 제목"
            onInput={e => {
              chartState.name = (e.target as HTMLInputElement).value;
            }}
          />
          <FieldRow label="기준 단위" />
          <Input
            id={`${chartId}-chart-unit-input`}
            value={chartState.unit}
            placeholder="단위를 입력해주세요."
            onInput={e => {
              chartState.unit = (e.target as HTMLInputElement).value;
            }}
          />
        </div>
        <div class="flex flex-col gap-4">
          <FieldRow
            label="X축 이름"
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
            placeholder="X축"
            onInput={e => {
              chartState.xAxisName = (e.target as HTMLInputElement).value;
            }}
          />
          <FieldRow
            label="Y축 이름"
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
            placeholder="Y축"
            onInput={e => {
              chartState.yAxisName = (e.target as HTMLInputElement).value;
            }}
          />
        </div>
      </Section>
      <div class="flex w-full justify-end">
        <div class="h-10 w-full">
          <Button label="저장" color="primary" onClick={onClickedChangeChart} />
        </div>
      </div>
    </div>
  );
};
