/** AI 讲解（F13）：调用后端生成讲解词，并用阿素音色朗读。 */

export type ExplainInstruction = '常规' | '细一点' | '给孩子听'

export interface ExplainParams {
  city: string
  dynasty: string
  type: string
  description: string
  painters: string
  instruction: ExplainInstruction
}

export async function explain(data: ExplainParams): Promise<string> {
  const resp = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!resp.ok) throw new Error('AI 讲解失败')
  const json = await resp.json()
  return json.text ?? ''
}

export async function ttsAudioUrl(text: string): Promise<string> {
  const resp = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!resp.ok) throw new Error('语音合成失败')
  const blob = await resp.blob()
  return URL.createObjectURL(blob)
}
