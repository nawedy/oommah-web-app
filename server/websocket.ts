import { Server } from 'ws'
import { createServer } from 'http'
import { parse } from 'url'
import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const server = createServer()
const wss = new Server({ noServer: true })

const clients = new Map()

wss.on('connection', (ws, request) => {
  const userId = request.headers['user-id'] as string
  if (userId) {
    clients.set(userId, ws)
  }

  ws.on('message', async (message: string) => {
    const data = JSON.parse(message)
    if (data.type === 'message') {
      // Existing message handling code...
    } else if (data.type === 'read_receipt') {
      // Existing read receipt handling code...
    } else if (data.type === 'message_reaction') {
      // Existing message reaction handling code...
    } else if (data.type === 'delete_message') {
      // Existing delete message handling code...
    } else if (data.type === 'typing_start' || data.type === 'typing_stop') {
      // Existing typing indicator handling code...
    } else if (data.type === 'moderation_notification') {
      const { userId, contentType, contentId, action } = data
      const userWs = clients.get(userId)
      if (userWs) {
        userWs.send(JSON.stringify({
          type: 'moderation_notification',
          contentType,
          contentId,
          action,
        }))
      }
    }
  })

  ws.on('close', () => {
    clients.delete(userId)
  })
})

server.on('upgrade', (request, socket, head) => {
  const { pathname } = parse(request.url)

  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
})

export default server

