#!/usr/bin/env python3
"""
生成「阿素」的全部语音 mp3，使用硅基流动（SiliconFlow）语音合成。

配置（环境变量）：
  SILICONFLOW_API_KEY  硅基流动 API Key（必填）
  SILICONFLOW_VOICE    音色名（默认 CosyVoice2 的「龙小春」女声）
  SILICONFLOW_MODEL    模型（默认 FunAudioLLM/CosyVoice2-0.5B）

用法：
  SILICONFLOW_API_KEY=sk-xxx python3 tools/gen_audio.py

生成的文件会覆盖 public/audio/host/ 下的：
  open/play/idle/end/share（5 句场景）
  dyn-*（7 句朝代）
  guide-*（3 句逻辑）
  city-城市-朝代（26 句城市讲解）
"""

import json
import os
import sys
import urllib.request

API_KEY = os.environ.get('SILICONFLOW_API_KEY', '')
VOICE = os.environ.get('SILICONFLOW_VOICE', 'FunAudioLLM/CosyVoice2-0.5B:claire')
MODEL = os.environ.get('SILICONFLOW_MODEL', 'FunAudioLLM/CosyVoice2-0.5B')
# 语速：<1 变慢，>1 变快（硅基流动范围 0.25~4.0）
SPEED = float(os.environ.get('SILICONFLOW_SPEED', '0.9'))
ENDPOINT = 'https://api.siliconflow.cn/v1/audio/speech'

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE, 'src', 'data')
OUT_DIR = os.path.join(BASE, 'public', 'audio', 'host')

# 与 src/hostVoice.ts 保持一致的台词
SCENARIOS = {
    'open': '客官请看，这里是长安。中心往哪走，阿素陪你走一遍。',
    'play': '坐稳了。从长安到上海，一站两息半。',
    'idle': '想看哪座城？图上星落珠盘，点开便是名都。',
    'end': '一千年走完了。回头再看一遍，你会发现南移不是偶然。',
    'share': '这一站看完了，要不要捎一张海报给朋友？',
}

DYNASTIES = {
    'tang': '长安是天下的大都会，宫廷和敦煌画工共用一套粉本。审美，跟着首都走。',
    'wudai': '天下一分，画院跟着政权散到金陵、成都。中心头一回往南挪。',
    'song_n': '汴京把画师收进翰林图画院，山水画，成了完整的宇宙图式。',
    'song_s': '临安偏安，构图从全景缩成「一角半边」。留白里，全是政治。',
    'yuan': '画院没了。苏州、杭州的文人拿起笔，中心头一回离开首都。',
    'ming': '吴门以商养艺，苏州成了头一个靠市场撑起来的艺术中心。',
    'qing': '宫廷、盐商、口岸，三路并进。扬州盐商一句话，就能改画风。',
}

LOGICS = {
    'guide-politics': '跟首都走：朝廷出钱，画院定标准。',
    'guide-culture': '跟文人走：笔在谁手里，中心就在谁那儿。',
    'guide-economy': '跟市场走：谁买画，画家去谁家。',
}


def first_sentence(text: str) -> str:
    idx = text.find('。')
    return text[: idx + 1] if idx >= 0 else text


def add_pauses(text: str) -> str:
    """在每个句号后插入省略号停顿，让句与句之间语义切分清晰。"""
    if text.endswith('。'):
        return text[:-1].replace('。', '。……') + '。'
    return text.replace('。', '。……')


def synth(text: str) -> bytes:
    body = json.dumps({
        'model': MODEL,
        'voice': VOICE,
        'input': add_pauses(text),
        'response_format': 'mp3',
        'sample_rate': 32000,
        'speed': SPEED,
        'gain': 0.0,
    }).encode('utf-8')
    req = urllib.request.Request(ENDPOINT, data=body, method='POST')
    req.add_header('Authorization', f'Bearer {API_KEY}')
    req.add_header('Content-Type', 'application/json')
    with urllib.request.urlopen(req, timeout=60) as resp:
        ctype = resp.headers.get('content-type', '')
        data = resp.read()
        if 'audio' not in ctype and 'octet' not in ctype:
            raise RuntimeError(f'合成失败：{data.decode("utf-8", "ignore")[:200]}')
        return data


def build_jobs() -> dict[str, str]:
    jobs: dict[str, str] = {}
    jobs.update(SCENARIOS)
    jobs.update({f'dyn-{k}': v for k, v in DYNASTIES.items()})
    jobs.update(LOGICS)

    places = json.load(open(os.path.join(DATA_DIR, 'places.json'), encoding='utf-8'))
    centers = json.load(open(os.path.join(DATA_DIR, 'centers.json'), encoding='utf-8'))
    place_name = {p['id']: p['name'] for p in places}
    for c in centers:
        key = f"city-{c['place']}-{c['dynasty']}"
        jobs[key] = f"{place_name[c['place']]}：{first_sentence(c['description'])}"
    return jobs


def main() -> None:
    if not API_KEY:
        print('请先设置 SILICONFLOW_API_KEY 环境变量')
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)
    jobs = build_jobs()
    print(f'音色：{VOICE}　语速：{SPEED}\n共 {len(jobs)} 条，开始合成…')

    for key, text in jobs.items():
        path = os.path.join(OUT_DIR, f'{key}.mp3')
        print(f'合成 {key}.mp3 ← {text}')
        audio = synth(text)
        with open(path, 'wb') as f:
            f.write(audio)
    print('完成。')


if __name__ == '__main__':
    main()
