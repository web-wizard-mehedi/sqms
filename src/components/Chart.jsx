// src/components/Chart.jsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', queues: 120 },
  { day: 'Tue', queues: 200 },
  { day: 'Wed', queues: 150 },
  { day: 'Thu', queues: 278 },
  { day: 'Fri', queues: 189 },
  { day: 'Sat', queues: 239 },
  { day: 'Sun', queues: 349 },
];

function Chart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="queues" stroke="#14b8a6" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default Chart;
