import { useCandleChart } from '@renderer/hooks/CandleChart/useCandleChart';

export const CandleChart = ({ data }) => {
  const {
    chartContainerRef
  } = useCandleChart(
    data
  );
  return <div ref={chartContainerRef} style={{ width: '100%', position: 'relative' }} />;
};