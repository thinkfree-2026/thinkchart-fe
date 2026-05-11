import { createRef } from '../../utils/index.ts';

type SliderProps = {
  id?: string;
  min?: number;
  max?: number;
  value?: number;
  onInput?: (value: number) => void;
};

export const Slider = ({ id = 'slider', min = 0, max = 100, value = 100, onInput }: SliderProps = {}) => {
  const tooltipRef = createRef<HTMLOutputElement>(null);
  const sliderRef = createRef<HTMLInputElement>(null);

  const showTooltip = () => {
    tooltipRef?.current?.classList.remove('opacity-0');
  };

  const hideTooltip = () => {
    tooltipRef?.current?.classList.add('opacity-0');
  };

  const updateSliderUI = (slider: HTMLInputElement) => {
    const current = Number(slider.value);
    const min = Number(slider.min);
    const max = Number(slider.max);

    if (min === max) return;

    const percent = ((current - min) / (max - min)) * 100;

    if (tooltipRef.current) {
      tooltipRef.current.textContent = String(current);
      tooltipRef.current.style.left = `${percent}%`;
    }
  };

  const handleSliderInput = (e: Event) => {
    const slider = e.target as HTMLInputElement;
    const nextValue = Number(slider.value);

    showTooltip();
    updateSliderUI(slider);
    onInput?.(nextValue);
  };

  return (
    <div class="relative pt-2">
      <output
        id={`${id}-tooltip`}
        ref={tooltipRef}
        class="pointer-events-none absolute top-0 -translate-x-1/2 rounded bg-primary px-1.5 py-0.5 text-[10px] leading-none text-white opacity-0 transition-opacity"
      >
        {value}
      </output>
      <input
        id={id}
        ref={sliderRef}
        oneffect={(sliderElement: HTMLInputElement) => {
          updateSliderUI(sliderElement);
          return updateSliderUI(sliderElement);
        }}
        type="range"
        min={min}
        max={max}
        value={value}
        oninput={handleSliderInput}
        onmousedown={showTooltip}
        onmouseup={hideTooltip}
        onblur={hideTooltip}
        class="h-1.5 w-full cursor-pointer rounded-full accent-primary"
      />
    </div>
  );
};
