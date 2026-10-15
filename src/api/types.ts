export type InstanceState =
  | 'notAuthorized'
  | 'authorized'
  | 'blocked'
  | 'starting'
  | 'yellowCard'
  | string

export interface StateInstanceResponse {
  stateInstance: InstanceState
}

type YesNo = 'yes' | 'no'

export interface InstanceSettings {
  webhookUrl?: string
  incomingWebhook?: YesNo
  outgoingMessageWebhook?: YesNo
  outgoingAPIMessageWebhook?: YesNo
}

export interface SetSettingsResponse {
  saveSettings: boolean
}

export interface SendMessageResponse {
  idMessage: string
}

export interface DeleteNotificationResponse {
  result: boolean
  reason?: string
}

export interface SenderData {
  chatId: string
  chatName?: string
  sender?: string
  senderName?: string
  senderContactName?: string
  senderPhoneNumber?: number
}

export interface MessageData {
  typeMessage: string
  textMessageData?: { textMessage: string }
  extendedTextMessageData?: { text: string }
}

export interface NotificationBody {
  typeWebhook: string
  timestamp: number
  idMessage?: string
  senderData?: SenderData
  messageData?: MessageData
}

export interface Notification {
  receiptId: number
  body: NotificationBody
}
