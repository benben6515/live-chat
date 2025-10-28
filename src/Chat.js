import React, { useState, useEffect } from "react"

const Chat = ({ socket, username, room, setShowChat, setRoom }) => {
  const [currentMessage, setCurrentMessage] = useState("")
  const [messageList, setMessageList] = useState([])
  const [copySuccess, setCopySuccess] = useState(false)

  const sendMessage = async () => {
    if (currentMessage.trim() === "") return
    const messageData = {
      userId: socket.id,
      room,
      author: username,
      message: currentMessage,
      time: new Date(Date.now()).toLocaleTimeString(),
    }
    await socket.emit("send_message", messageData)
    setMessageList(prev => [...prev, messageData])
    setCurrentMessage('')
  }

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList(prev => [...prev, data])
    })
  }, [socket])

  useEffect(() => {
    const chatBody = document.getElementById('chat-body')
    chatBody.scrollTop = chatBody.scrollHeight
  }, [messageList])

  const leaveHandler = () => {
    setShowChat(false)
    setRoom('')
    socket.emit("leave_room", { username, room })
  }

  const shareRoomLink = () => {
    const shareUrl = `${window.location.origin}/?room=${encodeURIComponent(room)}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  }

  return (
    <div className='chat-window h-100 w-80 pb-2 border bg-gray-200 border-gray-300 rounded shadow-lg'>
      <div className='chat-header bg-gray-800'>
        <p className='text-green-50 p-2 text-xl leading-6 text-center truncate'>Room: {room}</p>
        <div className='flex justify-center gap-2 pb-2'>
          <button
            className='text-green-50 px-3 py-1 text-sm transition-colors duration-300 hover:bg-blue-500 rounded'
            onClick={shareRoomLink}
            title='Share room link'
          >
            Share
          </button>
          <button
            className='text-green-50 px-3 py-1 text-sm transition-colors duration-300 hover:bg-red-500 rounded'
            onClick={leaveHandler}
          >
            Leave
          </button>
        </div>
      </div>
      {copySuccess && (
        <div className='bg-green-100 text-green-800 px-2 py-1 text-sm text-center'>
          Room link copied to clipboard!
        </div>
      )}
      <div id="chat-body" className='chat-body h-80 ml-1 px-1 py-2 flex flex-col overflow-y-scroll'>
        {messageList.map(({ userId, message, author, time }) => (
          <div 
            key={Math.random().toString(36).slice(2)}
            className={`message flex flex-col ${userId === socket.id ? 'you' : 'other'}`}
          >
            <div className="message-content break-all px-2 py-1">
              {message}
            </div>
            <div className="chat-meta">
              <span className="text-sm">{author === '' ? '神祕訪客' : author}</span>
              <span className="text-xs font-light text-gray-500"> - {time}</span></div>
          </div>
        ))}

      </div>
      <div className='chat-footer'>
        <input
          className='w-64 px-1 ml-1.5 border border-gray-300'
          type='text'
          placeholder='安安...'
          onChange={({ target: { value } }) => setCurrentMessage(value)}
          value={currentMessage}
          onKeyDown={({ key }) => key === 'Enter' && sendMessage()}
        ></input>
        <button onClick={sendMessage} className='w-12 border border-gray-300 transition-colors duration-300 hover:bg-blue-500'>
          ▶
        </button>
      </div>
    </div>
  )
}

export default Chat
