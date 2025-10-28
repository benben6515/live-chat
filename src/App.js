import React, { useState, useEffect } from "react"
import io from "socket.io-client"
import Chat from "./Chat"

// Connect to same server in production, or localhost:3001 in development
const socket = io.connect(
  process.env.NODE_ENV === 'production'
    ? window.location.origin
    : "http://localhost:3001"
)

function App() {
  const [username, setUsername] = useState("")
  const [room, setRoom] = useState("")
  const [error, setError] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [statusList, setStatusList] = useState([])
  const [showHowToUse, setShowHowToUse] = useState(false)

  const joinRoom = () => {
    if (room?.trim() === "") return setError('請選擇一個房間或輸入房間的名字')
    if (username.length > 16 || room.length >= 16) return setError('名字或房間的長度不能超過 16 個字')
    socket.emit("join_room", { username, room })
    setShowChat(true)
    // Update URL with room parameter
    window.history.pushState({}, '', `/?room=${encodeURIComponent(room)}`)
  }

  useEffect(() => {
    setError('')
  }, [username, room])

  // Read room parameter from URL on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roomParam = urlParams.get('room')
    if (roomParam) {
      setRoom(decodeURIComponent(roomParam))
    }
  }, [])

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
            <button
              className='text-blue-500 underline text-sm mt-2'
              onClick={() => setShowHowToUse(true)}
            >
              How to use
            </button>
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

      {/* How to Use Modal */}
      {showHowToUse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowHowToUse(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">How to Use</h2>
            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-semibold">1. Join a Room</h3>
                <p>Enter your name and choose a room from the list or create a new one.</p>
              </div>
              <div>
                <h3 className="font-semibold">2. Share Room Link</h3>
                <p>Once in a room, click the "Share" button to copy the room link. Share it with friends!</p>
              </div>
              <div>
                <h3 className="font-semibold">3. Join via Link</h3>
                <p>When someone shares a room link with you, the room name will be automatically filled in.</p>
              </div>
              <div>
                <h3 className="font-semibold">4. Chat & Leave</h3>
                <p>Send messages by typing and pressing Enter. Click "Leave" when done.</p>
              </div>
            </div>
            <button
              className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              onClick={() => setShowHowToUse(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
