import { useSlider, type UseSliderOptions } from '@npmegar/nonio/react';

const hour = (value: number): string => `${String(Math.floor(value)).padStart(2, '0')}:${value % 1 ? '30' : '00'}`;

const Single = ({ label, unit, ...options }: UseSliderOptions & { label: string; unit?: string }) => {
    const slider = useSlider(options);
    const vertical = slider.orientation === 'vertical';
    return (
        <div {...slider.getRootProps()} className="slider">
            <span {...slider.getLabelProps()} className="slider-label">{label}</span>
            <div {...slider.getTrackProps()} className="slider-track">
                <div {...slider.getRangeProps()} className="slider-fill" style={vertical ? { height: `${slider.rangeEnd}%` } : { width: `${slider.rangeEnd}%` }} />
                <div {...slider.getThumbProps(0)} className="slider-thumb" style={vertical ? { bottom: `${slider.percents[0]}%` } : { left: `${slider.percents[0]}%` }} />
            </div>
            <output className="slider-value" data-testid={`${label.toLowerCase()}-value`}>{options.getValueText?.(slider.value, 0) ?? `${slider.value}${unit ?? ''}`}</output>
        </div>
    );
};

const Window = () => {
    const slider = useSlider({
        defaultValue: [2010, 2015],
        min: 1990,
        max: 2025,
        minDistance: 1,
        dragRange: true,
        getAriaLabel: (index) => (index === 0 ? 'Start year' : 'End year'),
    });
    return (
        <div {...slider.getRootProps()} className="slider">
            <span className="slider-label">Time window</span>
            <div {...slider.getTrackProps()} className="slider-track">
                <div {...slider.getRangeProps()} className="slider-fill" style={{ left: `${slider.rangeStart}%`, width: `${slider.rangeEnd - slider.rangeStart}%` }} />
                {[0, 1].map((index) => <div key={index} {...slider.getThumbProps(index)} className="slider-thumb" style={{ left: `${slider.percents[index]}%` }} />)}
            </div>
            <output className="slider-value" data-testid="window-value">{slider.value.join('–')}</output>
        </div>
    );
};

export const SliderDemo = () => (
    <section className="card piel" data-grana-tono="dia">
        <h2>Slider</h2>
        <p className="hint">Arrows, Page Up/Down and Home/End on each thumb; drag the track, the thumbs or the window between the years.</p>
        <div className="sliders">
            <Single label="Opacity" defaultValue={80} unit=" %" />
            <Single label="Hour" defaultValue={14} min={0} max={23.5} step={0.5} pageStep={3} getValueText={hour} />
            <Window />
            <Single label="Zoom" defaultValue={12} min={0} max={20} orientation="vertical" />
        </div>
    </section>
);
