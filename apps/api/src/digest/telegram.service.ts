import { Injectable } from '@nestjs/common'

@Injectable()
export class TelegramService {
  private readonly token = process.env.TELEGRAM_BOT_TOKEN ?? ''
  private readonly chatId = process.env.TELEGRAM_CHAT_ID ?? ''

  isEnabled() {
    return Boolean(this.token && this.chatId)
  }

  async send(text: string) {
    if (!this.isEnabled()) return
    await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.chatId,
        text,
        disable_web_page_preview: true
      })
    })
  }
}


