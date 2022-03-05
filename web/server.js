
const express = require('express')

var io = require('socket.io')
  ({
    path: '/io/webrtc'
  })

const app = express()
const port = 8082

const rooms = {}
const messages = {}

// app.get('/', (req, res) => res.send('Hello World!!!!!'))

//https://expressjs.com/en/guide/writing-middleware.html
app.use(express.static(__dirname + '/build'))
app.get('/', (req, res, next) => { //default room
  res.sendFile(__dirname + '/build/index.html')
})

app.get('/:room', (req, res, next) => {
  res.sendFile(__dirname + '/build/index.html')
  // res.status(200).json({data: 'test'})
})

// ************************************* //
// ************************************* //
app.post('/:room', (req, res, next) => {
  // res.sendFile(__dirname + '/build/index.html')
  console.log(req.body)
  res.status(200).json({ data: req.body })
})

let userList = []

// thêm mới user
const addUser = (user) => (userList = [...userList, user])

const removeUser = (id) => (userList = userList.filter((user) => user.id !== id))

// get list user by room's name
const getListUserByRoom = (room) => userList.filter((user) => user.room === room)

// get user by id
const getUserById = (id) => userList.find((user) => user.id === id)


const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

io.listen(server)

// default namespace
io.on('connection', socket => {
  console.log('connected', socket.id)
})

// https://www.tutorialspoint.com/socket.io/socket.io_namespaces.htm
const peersOnlineUser = io.of('/webrtcPeerOnlineUser')

peersOnlineUser.on('connection', socket => {
  socket.emit("myId", (socket.id))
  socket.on("addUser", (name) => {
    addUser({ id: socket.id, name: name })
    peersOnlineUser.emit("getUserOnline", userList)
  })

  socket.on("sendLinkToCall", ({ senderId, receiverId, link }) => {
    console.log(senderId, receiverId, link)
    const user = getUserById(receiverId)
    peersOnlineUser.to(user.id).emit("getLinkToCall", { senderId, link })
  })


  socket.on('disconnect', () => {
    removeUser(socket.id)
    console.log('disconnect', socket.id)
    peersOnlineUser.emit('getUserOnline', userList)
  })
})


const peers = io.of('/webrtcPeer')

// keep a reference of all socket connections
// let connectedPeers = new Map()

peers.on('connection', socket => {

  const room = socket.handshake.query.room
  console.log("socket.handshake.query.room", socket.handshake.query.room)

  rooms[room] = rooms[room] && rooms[room].set(socket.id, socket) || (new Map()).set(socket.id, socket)
  messages[room] = messages[room] || []

  socket.emit('connection-success', {
    success: socket.id,
    peerCount: rooms[room].size,
    messages: messages[room],
  })

  const broadcast = () => {
    const _connectedPeers = rooms[room]

    for (const [socketID, _socket] of _connectedPeers.entries()) {
      // if (socketID !== socket.id) {
      _socket.emit('joined-peers', {
        peerCount: rooms[room].size, //connectedPeers.size,
        userOnline: rooms
      })
      // }
    }
  }
  broadcast()

  const disconnectedPeer = (socketID) => {
    const _connectedPeers = rooms[room]
    for (const [_socketID, _socket] of _connectedPeers.entries()) {
      _socket.emit('peer-disconnected', {
        peerCount: rooms[room].size,
        socketID
      })
    }
  }

  socket.on('new-message', (data) => {
    console.log('new-message', JSON.parse(data.payload))

    messages[room] = [...messages[room], JSON.parse(data.payload)]
  })

  socket.on('disconnect', () => {
    console.log('disconnected')
    // connectedPeers.delete(socket.id)
    rooms[room].delete(socket.id)
    messages[room] = rooms[room].size === 0 ? null : messages[room]
    disconnectedPeer(socket.id)
  })

  // // ************************************* //
  // // NOT REQUIRED
  // // ************************************* //
  socket.on('socket-to-disconnect', (socketIDToDisconnect) => {
    console.log('disconnected')
    // connectedPeers.delete(socket.id)
    rooms[room].delete(socketIDToDisconnect)
    messages[room] = rooms[room].size === 0 ? null : messages[room]
    disconnectedPeer(socketIDToDisconnect)
  })

  socket.on('onlinePeers', (data) => {
    const _connectedPeers = rooms[room]
    for (const [socketID, _socket] of _connectedPeers.entries()) {
      // don't send to self
      if (socketID !== data.socketID.local) {
        socket.emit('online-peer', socketID)
      }
    }
  })

  socket.on('offer', data => {
    const _connectedPeers = rooms[room]
    for (const [socketID, socket] of _connectedPeers.entries()) {
      // don't send to self
      if (socketID === data.socketID.remote) {
        // console.log('Offer', socketID, data.socketID, data.payload.type)
        socket.emit('offer', {
          sdp: data.payload,
          socketID: data.socketID.local
        }
        )
      }
    }
  })

  socket.on('answer', (data) => {
    const _connectedPeers = rooms[room]
    for (const [socketID, socket] of _connectedPeers.entries()) {
      if (socketID === data.socketID.remote) {
        socket.emit('answer', {
          sdp: data.payload,
          socketID: data.socketID.local
        }
        )
      }
    }
  })

  socket.on('candidate', (data) => {
    const _connectedPeers = rooms[room]
    // send candidate to the other peer(s) if any
    for (const [socketID, socket] of _connectedPeers.entries()) {
      if (socketID === data.socketID.remote) {
        socket.emit('candidate', {
          candidate: data.payload,
          socketID: data.socketID.local
        })
      }
    }
  })

})