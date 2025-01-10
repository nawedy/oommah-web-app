'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DateRangePicker } from './DateRangePicker'
import { LineChart, BarChart } from './Charts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import UserGrowthChart from './UserGrowthChart'
import PostActivityChart from './PostActivityChart'
import TopUsersTable from './TopUsersTable'
import PopularPostsTable from './PopularPostsTable'

interface AnalyticsData {
  userStats: {
    totalUsers: number
    newUsers: number
    activeUsers: number
  }
  postStats: {
    totalPosts: number
    newPosts: number
    totalComments: number
    newComments: number
  }
  moderationStats: {
    totalReports: number
    resolvedReports: number
    totalAppeals: number
    approvedAppeals: number
  }
  engagementStats: {
    totalLikes: number
    totalShares: number
  }
  topUsers: Array<{
    id: string
    name: string
    username: string
    image: string
    _count: {
      followers: number
      posts: number
    }
  }>
  topPosts: Array<{
    id: string
    caption: string
    imageUrl: string
    user: {
      name: string
      username: string
    }
    _count: {
      likes: number
      comments: number
    }
  }>
  userGrowthData: any;
  postActivityData: any;
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch(`/api/analytics?from=${dateRange.from?.toISOString()}&to=${dateRange.to?.toISOString()}`)
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      }
    }

    fetchAnalyticsData()
  }, [dateRange])

  if (!analyticsData) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.userStats.newUsers} new users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.postStats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.postStats.newPosts} new posts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.postStats.totalComments}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.postStats.newComments} new comments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              in the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="engagement">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={[
                  { name: 'Likes', value: analyticsData.engagementStats.totalLikes },
                  { name: 'Shares', value: analyticsData.engagementStats.totalShares },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={[
                  { name: 'Total Reports', value: analyticsData.moderationStats.totalReports },
                  { name: 'Resolved Reports', value: analyticsData.moderationStats.resolvedReports },
                  { name: 'Total Appeals', value: analyticsData.moderationStats.totalAppeals },
                  { name: 'Approved Appeals', value: analyticsData.moderationStats.approvedAppeals },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={analyticsData.userGrowthData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Post Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <PostActivityChart data={analyticsData.postActivityData} />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
          </CardHeader>
          <CardContent>
            <TopUsersTable users={analyticsData.topUsers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Popular Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <PopularPostsTable posts={analyticsData.topPosts} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

