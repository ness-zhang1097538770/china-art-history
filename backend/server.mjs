// 中国艺术史 · AI 讲解后端（极简 Node 服务）
// 作用：代理硅基流动的大模型(LLM)与语音合成(TTS)调用，API Key 只存在后端，不进前端。
import http from 'node:http'

const KEY = process.env.SILICONFLOW_API_KEY
const LLM_MODEL = process.env.SILICONFLOW_LLM_MODEL || 'deepseek-ai/DeepSeek-V3'
const TTS_MODEL = 'FunAudioLLM/CosyVoice2-0.5B'
const TTS_VOICE = process.env.SILICONFLOW_VOICE || 'FunAudioLLM/CosyVoice2-0.5B:claire'
const PORT = Number(process.env.PORT || 3001)

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}')
  } catch {
    return {}
  }
}

function buildPrompt(d) {
  const { city, dynasty, type, description, painters, instruction } = d
  let req = '2-3 句话，口语化、亲切，突出「为什么这座城市成为当时的艺术中心」。'
  if (instruction === '细一点') {
    req = '4-5 句话，讲得更细一些，补充画派与代表画家的细节。'
  } else if (instruction === '给孩子听') {
    req = '2-3 句话，用 8 岁孩子能听懂的语言，生动有趣。'
  }
  return `你是「阿素」，一位温婉的中国艺术史讲解员。请用口语化的方式，向参观者介绍这座城市在当时的艺术地位。

城市：${city}
朝代：${dynasty}
画派类型：${type}
背景：${description}
代表画家：${painters}

要求：${req}
请直接输出讲解词本身，不要加引号、前缀或「阿素：」这类称呼。`
}

async function callLLM(prompt) {
  const resp = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.8,
    }),
  })
  const data = await resp.json()
  if (!resp.ok) throw new Error(`LLM 失败: ${data?.message || resp.status}`)
  return data.choices?.[0]?.message?.content ?? ''
}

async function callTTS(text) {
  const resp = await fetch('https://api.siliconflow.cn/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: TTS_MODEL,
      voice: TTS_VOICE,
      input: text,
      response_format: 'mp3',
      speed: 0.9,
    }),
  })
  if (!resp.ok) throw new Error(`TTS 失败: ${resp.status}`)
  return Buffer.from(await resp.arrayBuffer())
}

const server = http.createServer(async (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.url === '/api/explain' && req.method === 'POST') {
    try {
      const data = await readBody(req)
      const text = await callLLM(buildPrompt(data))
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ text }))
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: String(e) }))
    }
    return
  }

  if (req.url === '/api/tts' && req.method === 'POST') {
    try {
      const data = await readBody(req)
      const audio = await callTTS(data.text)
      res.writeHead(200, { 'Content-Type': 'audio/mpeg' })
      res.end(audio)
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: String(e) }))
    }
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

if (!KEY) {
  console.error('请先设置 SILICONFLOW_API_KEY 环境变量')
  process.exit(1)
}

server.listen(PORT, () => {
  console.log(`阿素 AI 讲解后端已启动：http://localhost:${PORT}`)
})
