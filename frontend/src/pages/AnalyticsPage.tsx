import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import type {
  AirlineAirspace,
  CountryAirspace,
  AircraftModel,
} from '../types/aviation';

interface AnalyticsPageProps {
  airlines: AirlineAirspace[];
  countries: CountryAirspace[];
  aircraftModels: AircraftModel[];
  loading: boolean;
}

const DONUT_COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#818cf8', '#f43f5e', '#64748b'];

export function AnalyticsPage({
  airlines,
  countries,
  aircraftModels,
  loading,
}: AnalyticsPageProps) {
  // 1. Prepare Top 10 Airlines sorted highest-to-lowest
  const topAirlines = useMemo(() => {
    return [...airlines]
      .sort((a, b) => b.activeAircraftCount - a.activeAircraftCount)
      .slice(0, 10);
  }, [airlines]);

  // 2. Prepare Top 5 Countries + group the rest into "Other"
  const countryBreakdown = useMemo(() => {
    const sorted = [...countries].sort(
      (a, b) => b.activeAircraftCount - a.activeAircraftCount
    );
    const top5 = sorted.slice(0, 5).map((c, index) => ({
      name: c.originCountry,
      value: c.activeAircraftCount,
      fill: DONUT_COLORS[index % DONUT_COLORS.length]
    }));
    const otherTotal = sorted
      .slice(5)
      .reduce((sum, c) => sum + c.activeAircraftCount, 0);

    if (otherTotal > 0) {
      top5.push({ name: 'Other Countries', value: otherTotal, fill: DONUT_COLORS[5] });
    }
    return top5;
  }, [countries]);

  // 3. Prepare list of valid Aircraft Models
  const validAircraftModels = useMemo(() => {
    return aircraftModels.filter(
      (m) => m.maxRangeNm != null && m.priceMillionsUsd != null
    );
  }, [aircraftModels]);

  // 4. Prepare Top 5 Avg Cruise Velocity for Airlines sorted highest-to-lowest
  const topAvgCruiseVelocityAirlines = useMemo(() => {
    return [...airlines]
      .sort((a, b) => b.avgVelocityMs - a.avgVelocityMs)
      .slice(0, 5);
  }, [airlines]);

  if (loading) {
    return <div className="empty-state">Loading visual telemetry...</div>;
  }

  return (
    <div className="charts-grid">
      {/* CHART 1: Top 10 Airlines Horizontal Bar Chart */}
      <div className="chart-card">
        <h3 className="chart-title">Top 10 Airlines by Active Aircraft</h3>
        <p className="chart-subtitle">Live airborne fleet count per carrier</p>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={topAirlines}
            layout="vertical"
            margin={{ top: 5, right: 25, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
            <YAxis
              type="category"
              dataKey="airlineName"
              stroke="#e2e8f0"
              fontSize={12}
              width={130}
            />
            <Tooltip
              cursor={{ fill: '#1e293b' }}
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
            />
            <Bar
              dataKey="activeAircraftCount"
              name="Active Aircraft"
              fill="#38bdf8"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CHART 2: Airspace Share by Origin Country Donut Chart */}
      <div className="chart-card">
        <h3 className="chart-title">Airspace Share by Origin Country</h3>
        <p className="chart-subtitle">Top 5 countries vs. rest of world</p>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={countryBreakdown}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* CHART 3: Average Cruise Velocity by Airline */}
      <div className="chart-card">
        <h3 className="chart-title">Aircraft Range (nm) vs Unit Price ($M)</h3>

        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 15, right: 25, left: 25, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="maxRangeNm"
              name="Max Range"
              unit=" nm"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{
                value: 'Max Range (nm)',
                position: 'insideBottom',
                offset: -15,
                fill: '#e2e8f0',
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="priceMillionsUsd"
              name="Unit Price"
              unit="M"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{
                value: 'Unit Price ($M)',
                angle: -90,
                position: 'insideLeft',
                offset: -10,
                style: { textAnchor: 'middle' },
                fill: '#e2e8f0',
                fontSize: 12,
              }}
            />
            <ZAxis
              type="number"
              dataKey="passengerCapacity"
              range={[60, 400]}
              name="Seats"
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
            />
            <Scatter
              name="Aircraft Models"
              data={validAircraftModels}
              fill="#38bdf8"
              fillOpacity={0.8}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* CHART 4: Average Cruise Velocity by Airline */}
      <div className="chart-card">
        <h3 className="chart-title">Average Cruise Velocity by Airline (m/s)</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={topAvgCruiseVelocityAirlines}
            layout="horizontal"
            margin={{ top: 24, right: 25, left: 20, bottom: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              type="category"
              dataKey="airlineName"
              stroke="#e2e8f0"
              tick={{ fill: '#e2e8f0', fontSize: 12 }}
              label={{
                value: 'Airline',
                position: 'insideBottom',
                offset: -12,
                fill: '#e2e8f0',
                fontSize: 12,
              }} 
            />
            <YAxis 
              type="number" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{
                value: 'Average (m/s)',
                angle: -90,
                position: 'insideLeft',
                offset: -10,
                style: { textAnchor: 'middle' },
                fill: '#e2e8f0',
                fontSize: 12,
              }}
            />
            <Tooltip
              cursor={{ fill: '#1e293b' }}
              formatter={(value) => [`${Number(value).toFixed(1)} m/s`, 'Avg Velocity']}
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
            />
            <Bar
              dataKey="avgVelocityMs"
              name="Average Cruise Velocity (m/s)"
              fill="#38bdf8"
              radius={[4, 4, 0, 0]}
              label={{
                fontSize: 10,
                fill: '#f8fafc',
                position: 'top',
                formatter: (x) => `${Number(x).toFixed(1)} m/s`,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}