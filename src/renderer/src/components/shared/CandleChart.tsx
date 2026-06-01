import { useCandleChart } from '@renderer/hooks/CandleChart/useCandleChart';

export const CandleChart = ({ data,predict }) => {
  const {
    chartContainerRef
  } = useCandleChart(
    data,
    predict
  );
  return <div ref={chartContainerRef} style={{ width: '100%', position: 'relative' }} />;
};