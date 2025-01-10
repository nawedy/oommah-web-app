import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface PopularPost {
  id: string
  title: string
  author: {
    name: string
    avatar: string
  }
  likes: number
  comments: number
}

interface PopularPostsTableProps {
  posts: PopularPost[]
}

export default function PopularPostsTable({ posts }: PopularPostsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Post</TableHead>
          <TableHead>Likes</TableHead>
          <TableHead>Comments</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div>{post.title}</div>
                  <div className="text-sm text-gray-500">by {post.author.name}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{post.likes}</TableCell>
            <TableCell>{post.comments}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

