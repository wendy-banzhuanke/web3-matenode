import { useEffect } from "react"
import { CountButton } from "~features/count-button"
import { sendToBackground } from "@plasmohq/messaging"
import type { RequestBody, ResponseBody } from "~background/messages/ping"
import { useStorage } from "@plasmohq/storage/hook"
import "~style.css"

function IndexPopup() {
  const [count, setCount] = useStorage<number>("count", 0)

  const sendFunc = async () => {
    console.log("resp====")
    const resp = await sendToBackground<RequestBody, ResponseBody>({
      name: "ping",
      body: {
        id: 123
      }
    })
    console.log(resp)
  }

  return (
    <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-16 plasmo-w-40">
      <CountButton count={count} setCount={setCount} />
      <div>
        <button onClick={sendFunc}>ping</button>
      </div>
    </div>
  )
}

export default IndexPopup
