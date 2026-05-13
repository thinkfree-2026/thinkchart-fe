import { api } from '../../api/http.ts';
import { Input, Modal, Popover } from '../../components/index.ts';
import { createRef } from '../../utils/index.ts';
import { BarChart } from '../BarChart.tsx';
import { chartDataStore } from '../store/index.ts';
import type { PopoverInfo } from '../types/index.ts';

import { ChartOptionPanel } from './ChartOptionPanel.tsx';

type ChartModalProps = {
  chartId: string;
  chartName: string;
};

export const ChartModal = ({ chartId, chartName }: ChartModalProps) => {
  const { state: chartDataState } = chartDataStore;

  const titleValueRef = createRef<string>(chartName);

  const chartContainerRef = createRef<HTMLDivElement>(null);
  const chartTitleRef = createRef<HTMLDivElement>(null);
  const inputWrapperRef = createRef<HTMLDivElement>(null);

  const popoverLayerRef = createRef<HTMLDivElement>(null);
  const chartControlsRef = createRef<{ redraw: () => void } | null>(null);
  const selectedBarRef = createRef<PopoverInfo | null>(null);

  const getPopoverPosition = (barInfo: PopoverInfo) => {
    const layer = popoverLayerRef.current;

    if (!layer) return { left: 8, top: 8 };

    const POPOVER_WIDTH = 220;
    const POPOVER_HEIGHT = 140;
    const GAP = 40;
    const SAFE = 8;

    const layerWidth = layer.clientWidth;
    const layerHeight = layer.clientHeight;

    const scrollContainer = layer.parentElement?.querySelector(
      '[data-chart-scroll-container="true"]'
    ) as HTMLElement | null;

    const scrollLeft = scrollContainer?.scrollLeft ?? 0;

    const anchorX = barInfo.x - scrollLeft;

    const rightLeft = anchorX + GAP;

    const hasRightRoom = rightLeft + POPOVER_WIDTH <= layerWidth - SAFE;

    const left = hasRightRoom
      ? rightLeft
      : Math.max(SAFE, Math.min(layerWidth - POPOVER_WIDTH - SAFE, anchorX - POPOVER_WIDTH - GAP));

    const top = Math.max(SAFE, Math.min(layerHeight - POPOVER_HEIGHT - SAFE, barInfo.y - POPOVER_HEIGHT / 2));

    return { left, top };
  };

  const renderPopover = (barInfo: PopoverInfo | null) => {
    selectedBarRef.current = barInfo;

    if (!popoverLayerRef.current) return;

    if (!barInfo) {
      popoverLayerRef.current.replaceChildren();
      return;
    }

    const { left, top } = getPopoverPosition(barInfo);

    const targetData = chartDataState.data[barInfo.index];

    popoverLayerRef.current.replaceChildren(
      <div class="pointer-events-auto absolute w-[220px]" style={{ left: `${left}px`, top: `${top}px` }}>
        <Popover
          id={`${chartId}-bar-popover`}
          label={targetData.name}
          value={targetData.value}
          opacity={targetData.opacity ?? 100}
          onNameInput={(nextName: string) => {
            targetData.name = nextName;

            chartControlsRef.current?.redraw();
          }}
          onValueInput={(nextValue: number) => {
            targetData.value = Math.max(0, Math.round(nextValue));

            chartControlsRef.current?.redraw();
          }}
          onOpacityInput={(nextOpacity: number) => {
            targetData.opacity = Math.max(0, Math.min(100, Math.round(nextOpacity)));

            chartControlsRef.current?.redraw();
          }}
          onDelete={async () => {
            targetData.value = 0;
            targetData.opacity = 100;

            chartControlsRef.current?.redraw();

            renderPopover(null);

            await api.delete(`/canvas/charts/${targetData.chartId}/${targetData.id}`);
          }}
          onSave={async () => {
            await api.patch(`/canvas/charts/${targetData.chartId}/${targetData.id}`, {
              name: targetData.name,
              value: targetData.value,
              opacity: targetData.opacity / 100,
            });
          }}
        />
      </div>
    );
  };

  const closeTitleInput = async () => {
    await api.patch(`/canvas/charts/${chartId}`, {
      name: titleValueRef.current,
    });

    chartTitleRef.current?.replaceChildren(
      <div class="text-title" onclick={handleChangeTitleClick}>
        {titleValueRef.current}
      </div>
    );

    document.removeEventListener('click', handleDocumentClick);
  };

  const handleDocumentClick = (e: MouseEvent) => {
    const wrapper = inputWrapperRef.current;

    if (!wrapper) return;

    const target = e.target as Node;

    const isOutside = !wrapper.contains(target);

    if (isOutside) {
      closeTitleInput();
    }
  };

  const handleChangeTitleClick = () => {
    chartTitleRef.current?.replaceChildren(
      <div ref={inputWrapperRef}>
        <Input
          style="h-12"
          value={titleValueRef.current || ''}
          onInput={(e: Event) => {
            const target = e.target as HTMLInputElement;

            titleValueRef.current = target.value;
          }}
        />
      </div>
    );

    setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
    });
  };

  return (
    <Modal id={chartId}>
      <div class="flex h-full overflow-hidden">
        <div class="flex min-w-0 flex-1 flex-col p-10">
          <div ref={chartTitleRef}>
            <div class="text-title" onclick={handleChangeTitleClick}>
              {titleValueRef.current}
            </div>
          </div>
          <div ref={chartContainerRef} class="relative mt-4 h-full min-w-0 overflow-hidden">
            <BarChart
              data={chartDataState.data}
              onBarClick={renderPopover}
              onChartReady={controls => {
                chartControlsRef.current = controls;
              }}
            />
            <div ref={popoverLayerRef} class="pointer-events-none absolute inset-0"></div>
          </div>
        </div>
        <ChartOptionPanel chartId={chartId} />
      </div>
    </Modal>
  );
};
