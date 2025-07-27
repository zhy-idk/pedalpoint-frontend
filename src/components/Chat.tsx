import ChatIcon from "../assets/chat_24dp.svg"

function Chat(){
  return(
    <div>
      <button className="btn btn-lg btn-circle btn-primary fixed bottom-8 left-8 z-10 lg:btn-xl">
        <img src={ChatIcon} alt="Chat icon" />
      </button>
    </div>
  )
}

export default Chat