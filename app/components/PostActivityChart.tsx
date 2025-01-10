'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface PostActivityChartProps {
  data: {
    date: string
    posts: number
    comments: number
  }[]
}

export default function PostActivityChart({ data }: PostActivityChartProps) {
  return (
    <ChartContainer
      config={{
        posts: {
          label: 'Posts',
          color: 'hsl(var(--chart-1))',
        },
        comments: {
          label: 'Comments',
          color: 'hsl(var(--chart-2))',
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="posts" fill="var(--color-posts)" />
          <Bar dataKey="comments" fill="var(--color-comments)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

