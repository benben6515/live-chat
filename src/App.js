import React, { useState, useEffect } from "react"
import io from "socket.io-client"
import Chat from "./Chat"

// const socket = io.connect("")
const socket = io.connect("http://chat.ben6515.tw")

function App() {
  const [username, setUsername] = useState("")
  const [room, setRoom] = useState("")
  const [error, setError] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [statusList, setStatusList] = useState([])

  const joinRoom = () => {
    if (room.trim() === "") return setError('請選擇一個房間或輸入房間的名字')
    if (username.length > 16 || room.length >= 16) return setError('名字或房間的長度不能超過 16 個字')
    socket.emit("join_room", { username, room })
    setShowChat(true)
  }

  useEffect(() => {
    setError('')
  }, [username, room])

  useEffect(() => {
    socket.on("status", (data) =>{
      setStatusList(prev => [...prev, data])
    })
  }, [])

  useEffect(() => {
    const chatBody = document.getElementById('status-body')
    chatBody.scrollTop = chatBody.scrollHeight
  }, [statusList])

  return (
    <div className='min-h-screen max-w-full grid justify-center items-center'>
      <div className='font-mono grid grid-clos-2 gap-4 justify-center'>
        {!showChat ? (
          <>
            <h2 className='text-lg text-center'>Live Chat</h2>
            <input
              className='shadow-md border border-gray-300 px-2 rounded w-64 h-10'
              type='text'
              placeholder='Name...'
              onChange={({ target: { value } }) => setUsername(value)}
              value={username}
            />
            <input
              className='shadow-md border border-gray-300 px-2 rounded w-64 h-10'
              type='text'
              placeholder='Room ID...'
              onChange={({ target: { value } }) => setRoom(value)}
              value={room}
              list='room-list'
              onKeyDown={({ key }) => key === 'Enter' && joinRoom()}
            />
            <datalist id='room-list'>
              <option value='sweet home'></option>
              <option value='gossip'></option>
              <option value='away from table'></option>
            </datalist>
            <button
              className='shadow-md border border-gray-300 px-2 rounded w-64 h-10 bg-green-400'
              onClick={joinRoom}
            >
              join a room
            </button>
            {error && <div className="text-red-500">{error}</div>}
          </>
        ) : (
          <Chat
            socket={socket}
            username={username}
            room={room}
            setRoom={setRoom}
            setShowChat={setShowChat}
          />
        )}
        <div id="status-body" className="h-20 overflow-y-hidden">
          {statusList.map((status) => (
              <p 
                key={Math.random().toString(26).slice(2)}
                className="text-sm text-gray-500"
              >{status}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
