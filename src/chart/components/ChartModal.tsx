import { api } from '../../api/http.ts';
import { Button, Input, Modal, Popover, toastLayerRef } from '../../components/index.ts';
import { chartSocket } from '../../sockets/index.ts';
import { createRef } from '../../utils/index.ts';
import { BarChart } from '../BarChart.tsx';
import { chartDataStore, chartStore } from '../store/index.ts';
import type { PopoverInfo } from '../types/index.ts';

import { ChartOptionPanel } from './ChartOptionPanel.tsx';
import { handleCharModalSocketMessage } from '../../sockets/chartModalSocketHandler.ts';
import { openToastMessage } from '../../components/common/Toast.tsx';

type ChartModalProps = {
  chartId: string;
};

export const chartControlsRef = createRef<{ redraw: () => void } | null>(null);

export const ChartModal = ({ chartId }: ChartModalProps) => {
  const { state: chartDataState } = chartDataStore;
  const { state: chartState } = chartStore;

  const chartTitleRef = createRef<HTMLDivElement>(null);
  const inputWrapperRef = createRef<HTMLDivElement>(null);
  const chartContainerRef = createRef<HTMLDivElement>(null);
  const popoverLayerRef = createRef<HTMLDivElement>(null);
  const selectedBarRef = createRef<PopoverInfo | null>(null);

  let isSocketConnected = false;

  const startChartSocket = () => {
    if (isSocketConnected) return;

    isSocketConnected = true;

    handleCharModalSocketMessage(chartId);
  };

  const getPopoverPosition = (barInfo: PopoverInfo) => {
    const layer = popoverLayerRef.current;

    if (!layer) return { left: 8, top: 8 };

    const POPOVER_WIDTH = 220;
    const POPOVER_HEIGHT = 140;
    const GAP = 40;
    const SAFE = 10;

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
          // opacity={targetData.opacity ?? 100}
          onNameInput={(nextName: string) => {
            targetData.name = nextName;

            chartControlsRef.current?.redraw();
          }}
          onValueInput={(nextValue: number) => {
            targetData.value = nextValue;
            chartControlsRef.current?.redraw();
          }}
          // onOpacityInput={(nextOpacity: number) => {
          //   targetData.opacity = nextOpacity;
          //   chartControlsRef.current?.redraw();
          // }}
          onDelete={() => {
            const targetIndex = chartDataState.data.findIndex(data => data.id === targetData.id);
            if (targetIndex !== -1) {
              chartDataState.data.splice(targetIndex, 1);
            }
            chartControlsRef.current?.redraw();
            renderPopover(null);

            void (async () => {
              await api.delete(`/canvas/charts/${targetData.chartId}/${targetData.id}`);
            })();
          }}
          onSave={() => {
            void (async () => {
              await api
                .patch(`/canvas/charts/${targetData.chartId}/${targetData.id}`, {
                  name: targetData.name,
                  value: targetData.value,
                  // opacity: targetData.opacity > 1 ? targetData.opacity / 100 : targetData.opacity,
                })
                .then(res => {
                  openToastMessage({ dom: toastLayerRef.current, type: 'success', message: res.message });
                });
            })();
          }}
        />
      </div>
    );
  };

  const closeTitleInput = () => {
    chartTitleRef.current?.replaceChildren(
      <>
        <div id={`${chartId}-chart-title-display`} class="text-title">
          {chartState.name}
        </div>
        <div onclick={handleChangeTitleClick} class="cursor-pointer">
          ✏️
        </div>
      </>
    );
  };

  const handleChangeTitle = () => {
    void (async () => {
      await api
        .patch(`/canvas/charts/${chartId}`, {
          name: chartState.name,
        })
        .then(res => {
          openToastMessage({ dom: toastLayerRef.current, type: 'success', message: res.message });
        });
    })();

    closeTitleInput();
  };

  const handleChangeTitleClick = () => {
    chartTitleRef.current?.replaceChildren(
      <div ref={inputWrapperRef} class="flex items-center gap-2">
        <Input
          id={`${chartId}-chart-title-input`}
          style="h-10"
          value={chartState.name ?? ''}
          onInput={(e: Event) => {
            const target = e.target as HTMLInputElement;
            chartState.name = target.value;
          }}
        />
        <div class="h-10 w-20">
          <Button label="저장" color="primary" onClick={handleChangeTitle} />
        </div>
      </div>
    );
  };

  return (
    <Modal
      id={chartId}
      onClose={() => {
        chartSocket.leaveChartSession();
        isSocketConnected = false;
      }}
    >
      <div
        class="flex h-full overflow-hidden"
        oneffect={() => {
          startChartSocket();
        }}
      >
        <div class="flex min-w-0 flex-1 flex-col p-10">
          <div ref={chartTitleRef} class="flex items-center gap-2">
            <div id={`${chartId}-chart-title-display`} class="text-title">
              {chartState.name}
            </div>
            <div onclick={handleChangeTitleClick} class="cursor-pointer">
              ✏️
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
