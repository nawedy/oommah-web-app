import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface TopUser {
  id: string
  name: string
  username: string
  avatar: string
  postCount: number
  followerCount: number
}

interface TopUsersTableProps {
  users: TopUser[]
}

export default function TopUsersTable({ users }: TopUsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Posts</TableHead>
          <TableHead>Followers</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div>{user.name}</div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{user.postCount}</TableCell>
            <TableCell>{user.followerCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

