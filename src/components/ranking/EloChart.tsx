'use client';

import { useEffect, useRef } from 'react';

interface EloChartProps {
  data: number[];
  labels?: string[];
  height?: number;
}

export function EloChart({ data, height = 200 }: EloChartProps) {
  const canvasRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const svg = canvasRef.current;
    const width = svg.clientWidth;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Calculate min and max with some padding
    const minElo = Math.min(...data);
    const maxElo = Math.max(...data);
    const padding_elo = (maxElo - minElo) * 0.1 || 100;
    const minY = minElo - padding_elo;
    const maxY = maxElo + padding_elo;
    const range = maxY - minY;

    // Create points for the line chart
    const points = data.map((elo, index) => ({
      x: padding + (index / (data.length - 1 || 1)) * chartWidth,
      y: height - padding - ((elo - minY) / range) * chartHeight,
      elo,
    }));

    // Create polyline path
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Add background gradient (defs)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'eloGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#10B981');
    stop1.setAttribute('stop-opacity', '0.3');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#10B981');
    stop2.setAttribute('stop-opacity', '0');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Add grid lines
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * chartHeight;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.toString());
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', (width - padding).toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#1f1f1f');
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);

      // Y-axis label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const eloValue = Math.round(maxY - (i / 4) * range);
      label.setAttribute('x', '5');
      label.setAttribute('y', (y + 4).toString());
      label.setAttribute('font-size', '10');
      label.setAttribute('fill', '#9CA3AF');
      label.textContent = eloValue.toString();
      gridGroup.appendChild(label);
    }
    svg.appendChild(gridGroup);

    // Add area under the curve
    const areePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    areePath.setAttribute(
      'd',
      `${pathData} L ${padding + chartWidth} ${height - padding} L ${padding} ${height - padding} Z`,
    );
    areePath.setAttribute('fill', 'url(#eloGradient)');
    svg.appendChild(areePath);

    // Add line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.setAttribute('points', pathData);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#10B981');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(line);

    // Add data points
    points.forEach((point, _index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x.toString());
      circle.setAttribute('cy', point.y.toString());
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#10B981');
      circle.setAttribute('stroke', '#0c0c0c');
      circle.setAttribute('stroke-width', '2');

      // Add tooltip on hover
      circle.style.cursor = 'pointer';
      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('r', '6');
        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        tooltip.textContent = `${point.elo} ELO`;
        circle.appendChild(tooltip);
      });
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', '4');
      });

      svg.appendChild(circle);
    });

    // Add axes
    const axisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Y-axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', padding.toString());
    yAxis.setAttribute('y1', padding.toString());
    yAxis.setAttribute('x2', padding.toString());
    yAxis.setAttribute('y2', (height - padding).toString());
    yAxis.setAttribute('stroke', '#1f1f1f');
    yAxis.setAttribute('stroke-width', '1');
    axisGroup.appendChild(yAxis);

    // X-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', padding.toString());
    xAxis.setAttribute('y1', (height - padding).toString());
    xAxis.setAttribute('x2', (width - padding).toString());
    xAxis.setAttribute('y2', (height - padding).toString());
    xAxis.setAttribute('stroke', '#1f1f1f');
    xAxis.setAttribute('stroke-width', '1');
    axisGroup.appendChild(xAxis);

    svg.appendChild(axisGroup);
  }, [data, height]);

  return (
    <div className="w-full bg-[#161616] rounded-lg p-4 border border-[#1f1f1f]">
      <svg ref={canvasRef} width="100%" height={height} className="w-full" />
    </div>
  );
}
