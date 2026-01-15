import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
  id: number
}
 
export type ResponseBody = {
  message: string
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // const message = await querySomeApi(req.body.id)
 
  res.send({
    message: "哈哈哈哈"
  })
}
 
export default handler