const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const path = require('path')

app.use(cors())

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../build')))

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://chat.benben.me', 'https://live-chat-production.up.railway.app']
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`)

  socket.on('join_room', (data) => {
    socket.join(data.room)
    console.log(`User with ID: ${socket.id} joined room: ${data.room}`)

    // Notify everyone in the room
    io.to(data.room).emit('status', `${data.username} 加入了房間`)
  })

  socket.on('send_message', (data) => {
    console.log(`Message in room ${data.room}:`, data.message)
    // Send to everyone in the room except sender
    socket.to(data.room).emit('receive_message', data)
  })

  socket.on('leave_room', (data) => {
    console.log(`User with ID: ${socket.id} left room: ${data.room}`)
    io.to(data.room).emit('status', `${data.username} 離開了房間`)
    socket.leave(data.room)
  })

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id)
  })
})

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'))
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`)
})
