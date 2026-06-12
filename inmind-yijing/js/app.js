// ===== 數據存儲層 =====
const STORAGE_KEY = 'inmind_gua_records';
function getRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
function addRecord(record) {
  const records = getRecords();
  records.unshift(record);
  saveRecords(records);
}
function deleteRecord(index) {
  const records = getRecords();
  records.splice(index, 1);
  saveRecords(records);
}

// ===== DOM 元素 =====
const tabItems = document.querySelectorAll('.tab-item');
const pages = document.querySelectorAll('.page');
const questionInput = document.getElementById('question-input');
const charCount = document.getElementById('char-count');
const qiguaBtn = document.getElementById('qigua-btn');
const askBtn = document.getElementById('ask-btn');
const qiInitial = document.getElementById('qi-initial');
const qiInput = document.getElementById('qi-input');
const recordList = document.getElementById('record-list');
const emptyState = document.getElementById('empty-state');
const detailPage = document.getElementById('detail-page');
const backBtn = document.getElementById('back-btn');
const detailContent = document.getElementById('detail-content');
const copyBtn = document.getElementById('copy-btn');
const jieguaBtn = document.getElementById('jiegua-btn');
const ritualOverlay = document.getElementById('ritual-overlay');
const toast = document.getElementById('toast');
const modalOverlay = document.getElementById('modal-overlay');
const modalText = document.getElementById('modal-text');
const modalOk = document.getElementById('modal-ok');

// ===== Tab 切換 =====
tabItems.forEach(item => {
  item.addEventListener('click', () => {
    const tab = item.dataset.tab;
    tabItems.forEach(t => t.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
    if (tab === 'lu') renderRecords();
  });
});

// ===== 氣泡按鈕點擊 → 展開輸入區 =====
askBtn.addEventListener('click', () => {
   const wenxin = document.getElementById('wenxin');
  wenxin.style.display = 'none'; // 新增：直接隐藏问心
  
  qiInitial.style.display = 'none';
  qiInput.classList.add('show');
  // focus必須在用戶手勢同步調用中，否則移動端鍵盤不彈出
  questionInput.focus();
});

// ===== 首頁交互 =====
questionInput.addEventListener('input', () => {
  const val = questionInput.value;
  const len = val.length;
  charCount.textContent = len + '/20';
  if (len > 20) {
    charCount.classList.add('over');
    charCount.textContent = (20 - len) + '/20';
  } else {
    charCount.classList.remove('over');
  }
  if (len > 0 && len <= 20) {
    qiguaBtn.classList.add('active');
    qiguaBtn.disabled = false;
  } else {
    qiguaBtn.classList.remove('active');
    qiguaBtn.disabled = true;
  }
});

qiguaBtn.addEventListener('click', () => {
  const question = questionInput.value.trim();
  if (!question || question.length > 20) return;

  // 儀式感留白停頓
  ritualOverlay.classList.add('show');
  setTimeout(() => {
    ritualOverlay.classList.remove('show');

    // 計算卦象（傳入question用於計算R）
    const result = calculateGua(question);
    const gua = GUA_DATA[result.guaIndex - 1];

    // 構建記錄：只存核心欄位，推導結果即時計算
    const record = {
      question: question,
      time: result.timeStr,
      timestamp: result.time.getTime(),
      guaSymbol: gua.symbol,
      guaName: gua.name,
      guaFullName: result.guaFullName,
      dongYao: result.dong,
      dongYaoText: getDongYaoText(result.dong)
    };

    // 保存記錄
    addRecord(record);

    // 清空首頁
    questionInput.value = '';
    charCount.textContent = '0/20';
    charCount.classList.remove('over');
    qiguaBtn.classList.remove('active');
    qiguaBtn.disabled = true;
    qiInput.classList.remove('show');
    qiInitial.style.display = 'flex';

    // 跳轉到詳情頁
    showDetail(record);
  }, 800);
});

// ===== Tab2 卦錄列表 =====
function renderRecords() {
  const records = getRecords();
  if (records.length === 0) {
    emptyState.style.display = 'flex';
    recordList.style.display = 'none';
    return;
  }
  emptyState.style.display = 'none';
  recordList.style.display = 'block';
  recordList.innerHTML = records.map((r, i) => `
    <div class="record-card" data-index="${i}">
      <button class="record-delete" data-index="${i}">×</button>
      <div class="record-time">${r.time}</div>
      <div class="record-gua">
        <span class="gua-symbol">${r.guaSymbol}</span>
        <span class="gua-name">${r.guaName}</span>
        <span class="gua-dot">·</span>
        <span class="gua-dong">${r.dongYaoText}</span>
      </div>
      <div class="record-question">${r.question}</div>
    </div>
  `).join('');

  // 卡片點擊跳轉詳情
  recordList.querySelectorAll('.record-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('record-delete')) return;
      const idx = parseInt(card.dataset.index);
      const records = getRecords();
      showDetail(records[idx]);
    });
  });

  // 刪除按鈕
  recordList.querySelectorAll('.record-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index);
      deleteRecord(idx);
      renderRecords();
    });
  });
}

// ===== 詳情頁 =====
let currentDetailRecord = null;

function showDetail(record) {
  currentDetailRecord = record;

  // 即時重建所有推導結果
  const calc = rebuildFromRecord(record);
  if (!calc) return;

  const ty = calc.tiyong;
  const bn = calc.bian;
  const hu = calc.hu;

  // 解卦區塊：如果有存儲的解卦內容則顯示
  const savedJiegua = record.jieguaText || '';
  const jieguaSection = savedJiegua
    ? `<div class="detail-section" style="margin-top:32px;">
        <div class="detail-section-title">問心解卦</div>
        <div class="detail-section-text jiegua-text-block">${mdToHtml(savedJiegua)}</div>
       </div>`
    : '';

  detailContent.innerHTML = `
    <div class="detail-question">所佔之事：${record.question}</div>
    <div class="detail-time">${record.time}</div>
    <div class="detail-gua-main">
      <div class="detail-gua-symbol">${record.guaSymbol}</div>
      <div class="detail-gua-name">${record.guaName}</div>
    </div>
    <div class="detail-dongyao">${record.dongYaoText}</div>
    <div class="detail-shangxia">上${calc.shangName}下${calc.xiaName} · ${calc.guaFullName || ''}</div>
    <div class="detail-tiyong">
      <div class="detail-tiyong-row">
        <span class="detail-tiyong-label">體卦</span>
        <span class="detail-tiyong-value">${ty.ti || ''}（${ty.tiWx || ''}）</span>
      </div>
      <div class="detail-tiyong-row">
        <span class="detail-tiyong-label">用卦</span>
        <span class="detail-tiyong-value">${ty.yong || ''}（${ty.yongWx || ''}）</span>
      </div>
      <div class="detail-tiyong-row">
        <span class="detail-tiyong-label">生克關係</span>
        <span class="detail-tiyong-grade level-${ty.level || 1}">${ty.grade || ''} · ${ty.relation || ''}</span>
      </div>
      <div class="detail-tiyong-desc">${ty.desc || ''}<br><span style="color:#999">建議：${ty.adv || ''}</span></div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">卦辭</div>
      <div class="detail-section-text">${calc.guaci}</div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">動爻爻辭</div>
      <div class="detail-section-text">${calc.yaoci}</div>
    </div>

    <div class="detail-dynamics">
      <div class="detail-dynamics-header">
        <div class="detail-dynamics-title">問心觀照</div>
        <div class="detail-dynamics-desc">同一件事，不只有一種理解方式。</div>
      </div>
      <div class="detail-dynamics-body">
        <div class="detail-gua-card">
          <div class="detail-gua-card-label">互卦 · 循環機制</div>
          <div class="detail-gua-card-gua">
            <span class="detail-gua-card-symbol">${hu.guaSymbol || ''}</span>
            <span class="detail-gua-card-name">${hu.guaName || ''}</span>
          </div>
          <div class="detail-gua-card-shangxia">上${hu.bianUp || ''}下${hu.bianDown || ''} · ${hu.guaFullName || ''}</div>
          <div class="detail-gua-card-result">${hu.luck || ''} · ${hu.relationText || ''}</div>
        </div>
        <div class="detail-gua-card">
          <div class="detail-gua-card-label">變卦 · 相變趨勢</div>
          <div class="detail-gua-card-gua">
            <span class="detail-gua-card-symbol">${bn.guaSymbol || ''}</span>
            <span class="detail-gua-card-name">${bn.guaName || ''}</span>
          </div>
          <div class="detail-gua-card-shangxia">上${bn.bianUp || ''}下${bn.bianDown || ''} · ${bn.guaFullName || ''}</div>
          <div class="detail-gua-card-result">${bn.luck || ''} · ${bn.relationText || ''}</div>
        </div>
        <div class="detail-gua-card">
          <div class="detail-gua-card-label">綜卦 · 鏡像視角</div>
          <div class="detail-gua-card-gua">
            <span class="detail-gua-card-symbol">${calc.zong.guaSymbol || ''}</span>
            <span class="detail-gua-card-name">${calc.zong.guaName || ''}</span>
          </div>
          <div class="detail-gua-card-shangxia">上${calc.zong.zongUp || ''}下${calc.zong.zongDown || ''} · ${calc.zong.guaFullName || ''}</div>
          <div class="detail-gua-card-result">${calc.zong.tag}</div>
        </div>
        <div class="detail-gua-card">
          <div class="detail-gua-card-label">錯卦 · 陰影分析</div>
          <div class="detail-gua-card-gua">
            <span class="detail-gua-card-symbol">${calc.cuo.guaSymbol || ''}</span>
            <span class="detail-gua-card-name">${calc.cuo.guaName || ''}</span>
          </div>
          <div class="detail-gua-card-shangxia">上${calc.cuo.cuoUp || ''}下${calc.cuo.cuoDown || ''} · ${calc.cuo.guaFullName || ''}</div>
          <div class="detail-gua-card-result">${calc.cuo.tag}</div>
        </div>
      </div>
    </div>
    ${jieguaSection}
  `;

  // 解卦按鈕狀態：已有解卦內容則置灰
  if (savedJiegua) {
    jieguaBtn.classList.add('disabled');
    jieguaBtn.style.opacity = '0.4';
    jieguaBtn.style.pointerEvents = 'none';
  } else {
    jieguaBtn.classList.remove('disabled');
    jieguaBtn.style.opacity = '';
    jieguaBtn.style.pointerEvents = '';
  }

  // 滾動到頂部
  detailContent.scrollTop = 0;
  detailPage.classList.add('show');
}

backBtn.addEventListener('click', () => {
  detailPage.classList.remove('show');
});

copyBtn.addEventListener('click', () => {
  if (!currentDetailRecord) return;

  // 即時重建推導結果用於複製
  const calc = rebuildFromRecord(currentDetailRecord);
  if (!calc) return;

  const ty = calc.tiyong;
  const bn = calc.bian;
  const hu = calc.hu;
  const text = `所佔之事：${currentDetailRecord.question}\n起卦時間：${currentDetailRecord.time}\n卦象：${currentDetailRecord.guaSymbol} ${currentDetailRecord.guaName}\n上${calc.shangName}下${calc.xiaName} · ${currentDetailRecord.dongYaoText}\n\n體卦：${ty.ti || ''}（${ty.tiWx || ''}）\n用卦：${ty.yong || ''}（${ty.yongWx || ''}）\n生克：${ty.grade || ''} · ${ty.relation || ''}\n${ty.desc || ''}\n建議：${ty.adv || ''}\n\n卦辭：${calc.guaci}\n\n動爻爻辭：${calc.yaoci}\n\n互卦：${hu.guaSymbol || ''} ${hu.guaName || ''}\n上${hu.bianUp || ''}下${hu.bianDown || ''} · ${hu.guaFullName || ''}\n${hu.luck || ''} · ${hu.relationText || ''}\n\n變卦：${bn.guaSymbol || ''} ${bn.guaName || ''}\n上${bn.bianUp || ''}下${bn.bianDown || ''} · ${bn.guaFullName || ''}\n${bn.luck || ''} · ${bn.relationText || ''}\n\n綜卦：${calc.zong.guaSymbol || ''} ${calc.zong.guaName || ''}\n上${calc.zong.zongUp || ''}下${calc.zong.zongDown || ''} · ${calc.zong.guaFullName || ''}\n${calc.zong.tag}\n\n錯卦：${calc.cuo.guaSymbol || ''} ${calc.cuo.guaName || ''}\n上${calc.cuo.cuoUp || ''}下${calc.cuo.cuoDown || ''} · ${calc.cuo.guaFullName || ''}\n${calc.cuo.tag}` + (currentDetailRecord.jieguaText ? '\n\n【問心解卦】\n' + currentDetailRecord.jieguaText : '');
  navigator.clipboard.writeText(text).then(() => {
    showToast('複製完畢');
  }).catch(() => {
    // 降級方案
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('複製完畢');
  });
});

// ===== 扣子 API 調用（通過 CF Function 代理，流式接收）=====
async function cozeChat(content, onChunk) {
  let res;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: content })
    });
  } catch (networkErr) {
    throw new Error('網絡請求失敗：' + networkErr.message);
  }

  if (!res.ok) {
    // CF Function 返回JSON錯誤
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || '服務端錯誤 ' + res.status);
    }
    const errText = await res.text().catch(() => '');
    throw new Error('API 錯誤 ' + res.status + '：' + errText.slice(0, 200));
  }

  // 流式讀取 SSE
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let prevLen = 0;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;

      if (trimmed.startsWith('event:')) continue;

      if (trimmed.startsWith('data:')) {
        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr) continue;

        try {
          const evt = JSON.parse(jsonStr);

          // 只處理 assistant 角色的文本消息
          if (evt.role !== 'assistant') continue;

          // 提取文本內容
          let content = evt.content || '';
          if (!content) continue;

          // 過濾末尾JSON垃圾（扣子API偶爾在content末尾附加元數據）
          const jsonGarbageIdx = content.indexOf('{"msg_type"');
          if (jsonGarbageIdx !== -1) {
            content = content.slice(0, jsonGarbageIdx);
          }

          // 防重複：扣子SSE可能返回完整歷史而非增量
          let delta = content;
          if (content.length >= prevLen && content.slice(0, prevLen) === fullText) {
            delta = content.slice(prevLen);
          }

          if (delta) {
            fullText += delta;
            prevLen = fullText.length;
            onChunk(fullText);
          }
        } catch {
          // 忽略無法解析的行
        }
      }
    }
  }

  if (!fullText) {
    throw new Error('流式回覆為空');
  }
  return fullText;
}

// ===== 簡易 Markdown → HTML =====
function mdToHtml(text) {
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

// ===== 解卦按鈕 =====
jieguaBtn.addEventListener('click', async () => {
  if (!currentDetailRecord || currentDetailRecord.jieguaText) return;

  // 置灰按鈕
  jieguaBtn.style.opacity = '0.4';
  jieguaBtn.style.pointerEvents = 'none';

  // 構建 prompt
  const calc = rebuildFromRecord(currentDetailRecord);
  if (!calc) return;
  const ty = calc.tiyong;
  const bn = calc.bian;
  const hu = calc.hu;
  const prompt = `所佔之事：${currentDetailRecord.question}\n起卦時間：${currentDetailRecord.time}\n卦象：${currentDetailRecord.guaSymbol} ${currentDetailRecord.guaName}\n上${calc.shangName}下${calc.xiaName} · ${currentDetailRecord.dongYaoText}\n\n體卦：${ty.ti || ''}（${ty.tiWx || ''}）\n用卦：${ty.yong || ''}（${ty.yongWx || ''}）\n生克：${ty.grade || ''} · ${ty.relation || ''}\n${ty.desc || ''}\n建議：${ty.adv || ''}\n\n卦辭：${calc.guaci}\n\n動爻爻辭：${calc.yaoci}\n\n互卦：${hu.guaSymbol || ''} ${hu.guaName || ''}\n上${hu.bianUp || ''}下${hu.bianDown || ''} · ${hu.guaFullName || ''}\n${hu.luck || ''} · ${hu.relationText || ''}\n\n變卦：${bn.guaSymbol || ''} ${bn.guaName || ''}\n上${bn.bianUp || ''}下${bn.bianDown || ''} · ${bn.guaFullName || ''}\n${bn.luck || ''} · ${bn.relationText || ''}\n\n綜卦：${calc.zong.guaSymbol || ''} ${calc.zong.guaName || ''}\n上${calc.zong.zongUp || ''}下${calc.zong.zongDown || ''} · ${calc.zong.guaFullName || ''}\n${calc.zong.tag}\n\n錯卦：${calc.cuo.guaSymbol || ''} ${calc.cuo.guaName || ''}\n上${calc.cuo.cuoUp || ''}下${calc.cuo.cuoDown || ''} · ${calc.cuo.guaFullName || ''}\n${calc.cuo.tag}`;

  // 在詳情頁底部追加解卦區塊（加載態）
  const section = document.createElement('div');
  section.className = 'detail-section';
  section.style.marginTop = '32px';
  section.id = 'jiegua-live';
  section.innerHTML = `
    <div class="detail-section-title">問心解卦</div>
    <div class="detail-section-text jiegua-text-block">
      <div class="jiegua-loading">問心解卦中<span class="jiegua-dots"></span></div>
    </div>`;
  detailContent.appendChild(section);
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const reply = await cozeChat(prompt, (partial) => {
      // 流式回調：實時更新
      const textBlock = section.querySelector('.jiegua-text-block');
      if (textBlock) textBlock.innerHTML = mdToHtml(partial);
      section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // 完成：存入記錄
    currentDetailRecord.jieguaText = reply;
    // 回寫到 localStorage
    const records = getRecords();
    const idx = records.findIndex(r => r.timestamp === currentDetailRecord.timestamp);
    if (idx !== -1) {
      records[idx].jieguaText = reply;
      saveRecords(records);
    }

    // 最終渲染
    const textBlock = section.querySelector('.jiegua-text-block');
    if (textBlock) textBlock.innerHTML = mdToHtml(reply);
  } catch (err) {
    const textBlock = section.querySelector('.jiegua-text-block');
    if (textBlock) textBlock.innerHTML = '<div class="jiegua-error">解卦失敗：' + err.message + '</div>';
    // 失敗時恢復按鈕
    jieguaBtn.style.opacity = '';
    jieguaBtn.style.pointerEvents = '';
  }
});

// ===== 通用組件 =====
function showToast(msg, duration) {
  toast.textContent = msg;
  toast.classList.add('show');
  toast.style.whiteSpace = 'pre-line';
  setTimeout(() => toast.classList.remove('show'), duration || 1500);
}

function showModal(text) {
  modalText.textContent = text;
  modalOverlay.classList.add('show');
}

modalOk.addEventListener('click', () => {
  modalOverlay.classList.remove('show');
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('show');
});

// ===== 初始化 =====
renderRecords();

// ===== 開場動畫序列 =====
function playIntro() {
  const wenxin = document.getElementById('wenxin');
  const qiInitial = document.getElementById('qi-initial');

  // 1. 問心淡入
  wenxin.classList.add('fade-in');

  // 2. 2秒後淡出
  setTimeout(() => {
    wenxin.classList.remove('fade-in');
    wenxin.classList.add('fade-out');

    // 3. 淡出完成後顯示氣泡按鈕
    setTimeout(() => {
      wenxin.style.display = 'none';
      qiInitial.classList.add('show');
    }, 1000);
  }, 2000);
}

// ===== 落梅粒子系統 =====
function initPlumCanvas() {
  const canvas = document.getElementById('plum-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 極少粒子（5-8片花瓣）
  const petals = [];
  for (let i = 0; i < 6; i++) {
    petals.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 3 + Math.random() * 4,
      speedY: 0.15 + Math.random() * 0.2,
      speedX: -0.1 + Math.random() * 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      opacity: 0.15 + Math.random() * 0.15,
      color: `rgba(180, 130, 100, ${0.15 + Math.random() * 0.15})`
    });
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.1;
      p.rotation += p.rotSpeed;
      if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      drawPetal(p);
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// 啟動
initPlumCanvas();
playIntro();
