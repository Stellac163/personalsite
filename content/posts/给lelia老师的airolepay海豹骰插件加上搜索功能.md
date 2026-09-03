---
type: project
title: 给Lelia老师的airolepay海豹骰插件加上搜索功能
summary: 为了带团时对pl说服大成功遂在原插件的基础上添加了实时联网搜索功能
cover: ''
tags:
  - coding
  - 跑团
published: true
date: '2026-09-03'
---
在阅读了**Lelia**老师的**SealDiceAIroleplay**后大受启发，给私骰装上后，却觉得我key都花钱了不如加点新功能，于是修改版本应运而生。
>  Lelia老师的原文链接：https://github.com/Lelia7OR/SealDiceAIroleplay

在python后端中需要增加一些段落。
如：因为原版本中的chat接口并不使用于搜索功能，在设定完api key后需在代码中加入：

```language

SEARCH_API_URL = "https://api.deepseek.com/responses"  # 支持搜索的官方接口
SEARCH_MODEL = "deepseek-v4-flash"  # 推荐用于日常搜索的模型，也支持 deepseek-v4-pro
```
再在原版本的记忆系统区域后加入这一段：

```language
@app.route('/helpsearch', methods=['POST'])
def helpsearch():
    data = request.json
    msg = data.get('message', '')
    name = data.get('playerName', '访客')

    if not msg:
        return jsonify({'reply': '请输入查询内容。'})

    if name not in search_history:
        search_history[name] = []

    search_history[name].append({'role': 'user', 'content': msg})

    try:
        # 使用官方推荐的 SDK 风格参数，但通过 requests 发送
        payload = {
            "model": SEARCH_MODEL,  # "deepseek-v4-flash"
            "input": msg,  
            "instructions": HELPER_SYSTEM_PROMPT,  
            "tools": [{"type": "web_search_2025_08_26"}],  
            "max_output_tokens": 4096,  
            "stream": False  #明确关闭流式
        }

        resp = requests.post(
            SEARCH_API_URL,  # "https://api.deepseek.com/responses"
            headers={
                'Authorization': f'Bearer {AI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json=payload,
            timeout=60
        )

        result = resp.json()
        print(f"[搜索原始返回] {result}")  # 保留打印便于调试

    
        if hasattr(result, 'output_text'):  # 如果返回对象有 output_text 属性
            reply = result.output_text
        elif 'output_text' in result:  # 如果是字典且包含 output_text 字段
            reply = result['output_text']
        elif 'output' in result and isinstance(result['output'], list):
            # 降级方案：手动从 output 列表中提取文本
            reply = "搜索完成，但未提取到文本。"
            for item in result['output']:
                if item.get('type') == 'message':
                    content_list = item.get('content', [])
                    for content_item in content_list:
                        if content_item.get('type') == 'output_text':
                            reply = content_item.get('text', reply)
                            break
                    break
        elif 'error' in result:
            reply = f"搜索服务错误: {result['error'].get('message', '未知错误')}"
        else:
            # 如果上面都找不到，返回原始结果便于调试
            reply = f"搜索返回了未知格式，请查看终端日志。"

    except requests.exceptions.Timeout:
        reply = "搜索超时，请稍后重试。"
    except Exception as e:
        print(f"[搜索错误] {e}")
        reply = "搜索服务暂时不可用，请稍后再试。"

    search_history[name].append({'role': 'assistant', 'content': reply})
    return jsonify({'reply': reply})
```
**一定要关闭流式，因为海豹骰是直接发完整的qq消息的，不关闭流式会卡死！**

同时别忘了，在js端加上注册新指令的代码：

```language
let extSearch = seal.ext.find('helpsearch');
if (!extSearch) {
    extSearch = seal.ext.new('helpsearch', 'baili', '1.0.0');
    seal.ext.register(extSearch);
}

const cmdSearch = seal.ext.newCmdItemInfo();
cmdSearch.name = 'helpsearch';
cmdSearch.help = '联网搜索，例如：.helpsearch 今天的新闻';
cmdSearch.solve = (ctx, msg, cmdArgs) => {
    const userMessage = cmdArgs.rawArgs;
    if (!userMessage) {
        seal.replyToSender(ctx, msg, '请输入查询内容，例如：.helpsearch 克苏鲁神话');
        return seal.ext.newCmdExecuteResult(true);
    }

    const playerName = ctx.player.name;

    if (WAIT_MSG) {
        seal.replyToSender(ctx, msg, WAIT_MSG);
    }

    fetch(`${FLASK_URL}/helpsearch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, playerName: playerName })
    })
    .then(res => res.json())
    .then(data => {
        seal.replyToSender(ctx, msg, data.reply);
    })
    .catch(() => {
        seal.replyToSender(ctx, msg, ERROR_MSG);
    });

    return seal.ext.newCmdExecuteResult(true);
};
extSearch.cmdMap['helpsearch'] = cmdSearch;
```
把文中代码添加到原版本中就可以使用搜索功能了！
