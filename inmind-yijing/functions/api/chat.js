// Cloudflare Function：代理扣子API，令牌存於服務端環境變量

// 處理跨域 OPTIONS 預檢
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const COZE_PAT = env.COZE_PAT;
  const BOT_ID   = env.BOT_ID;

  if (!COZE_PAT || !BOT_ID) {
    return new Response(JSON.stringify({ error: '服務端配置缺失，請在CF Dashboard設置環境變量 COZE_PAT 和 BOT_ID' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: '請求格式錯誤' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const prompt = body.prompt;
  if (!prompt) {
    return new Response(JSON.stringify({ error: '缺少 prompt 參數' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const res = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + COZE_PAT
      },
      body: JSON.stringify({
        bot_id: BOT_ID,
        user_id: 'inmind_user_001',
        stream: true,
        auto_save_history: true,
        additional_messages: [{
          role: 'user',
          type: 'question',
          content_type: 'text',
          content: prompt
        }]
      })
    });

    // 直接轉發SSE流回前端
    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: '扣子API請求失敗：' + err.message }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
