import React from 'react';
import MetricCard from '../common/MetricCard';
import { Clock } from 'lucide-react';

export default function QueuePanel({ data }) {
  const color = (data?.depth ?? 0) > 5 ? 'red' : (data?.depth ?? 0) > 0 ? 'yellow' : 'emerald';

  return (
    <MetricCard
      title="Priority Queue"
      value={data?.depth ?? 0}
      subtitle={
        data?.depth
          ? `${data.depth} message(s) awaiting a QKD key`
          : 'Queue is clear'
      }
      icon={Clock}
      color={color}
    />
  );
}
