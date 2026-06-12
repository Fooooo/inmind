const C = 2697;
const GUA_NAMES = {1:'乾',2:'兌',3:'離',4:'震',5:'巽',6:'坎',7:'艮',8:'坤'};
const WUXING_MAP = {"1":"金","2":"金","3":"火","4":"木","5":"木","6":"水","7":"土","8":"土"};
const SHENGKE_DATA = {
  "用生體": {level:1, grade:"大吉", desc:"外緣助力充足，成事省力", adv:"順勢推進，主動對接資源"},
  "比和":   {level:2, grade:"吉",   desc:"內外氣場相合，環境適配", adv:"守原有根基，就近發展"},
  "體克用": {level:3, grade:"中吉", desc:"事可控，但耗心神精力", adv:"循序漸進，勿急躁冒進"},
  "體生用": {level:4, grade:"損耗", desc:"投入多回報少，持續內耗", adv:"壓縮投入，保守觀望"},
  "用克體": {level:5, grade:"大凶", desc:"外界阻力重重，易遇波折", adv:"暫緩行動，擇機再謀"}
};
const CODE_TO_INDEX = {
  "11": { index: 1, guaFullName: "乾為天" },
  "12": { index: 10, guaFullName: "天澤履" },
  "13": { index: 13, guaFullName: "天火同人" },
  "14": { index: 25, guaFullName: "天雷無妄" },
  "15": { index: 44, guaFullName: "天風姤" },
  "16": { index: 6, guaFullName: "天水訟" },
  "17": { index: 33, guaFullName: "天山遁" },
  "18": { index: 12, guaFullName: "天地否" },
  "21": { index: 43, guaFullName: "澤天夬" },
  "22": { index: 58, guaFullName: "兌為澤" },
  "23": { index: 49, guaFullName: "澤火革" },
  "24": { index: 17, guaFullName: "澤雷隨" },
  "25": { index: 28, guaFullName: "澤風大過" },
  "26": { index: 47, guaFullName: "澤水困" },
  "27": { index: 31, guaFullName: "澤山鹹" },
  "28": { index: 45, guaFullName: "澤地萃" },
  "31": { index: 14, guaFullName: "火天大有" },
  "32": { index: 38, guaFullName: "火澤睽" },
  "33": { index: 30, guaFullName: "離為火" },
  "34": { index: 21, guaFullName: "火雷噬嗑" },
  "35": { index: 50, guaFullName: "火風鼎" },
  "36": { index: 64, guaFullName: "火水未濟" },
  "37": { index: 56, guaFullName: "火山旅" },
  "38": { index: 35, guaFullName: "火地晉" },
  "41": { index: 34, guaFullName: "雷天大壯" },
  "42": { index: 54, guaFullName: "雷澤歸妹" },
  "43": { index: 55, guaFullName: "雷火豐" },
  "44": { index: 51, guaFullName: "震為雷" },
  "45": { index: 32, guaFullName: "雷風恆" },
  "46": { index: 40, guaFullName: "雷水解" },
  "47": { index: 62, guaFullName: "雷山小過" },
  "48": { index: 16, guaFullName: "雷地豫" },
  "51": { index: 9, guaFullName: "風天小畜" },
  "52": { index: 61, guaFullName: "風澤中孚" },
  "53": { index: 37, guaFullName: "風火家人" },
  "54": { index: 42, guaFullName: "風雷益" },
  "55": { index: 57, guaFullName: "巽為風" },
  "56": { index: 59, guaFullName: "風水渙" },
  "57": { index: 53, guaFullName: "風山漸" },
  "58": { index: 20, guaFullName: "風地觀" },
  "61": { index: 5, guaFullName: "水天需" },
  "62": { index: 60, guaFullName: "水澤節" },
  "63": { index: 63, guaFullName: "水火既濟" },
  "64": { index: 3, guaFullName: "水雷屯" },
  "65": { index: 48, guaFullName: "水風井" },
  "66": { index: 29, guaFullName: "坎為水" },
  "67": { index: 39, guaFullName: "水山蹇" },
  "68": { index: 8, guaFullName: "水地比" },
  "71": { index: 26, guaFullName: "山天大畜" },
  "72": { index: 41, guaFullName: "山澤損" },
  "73": { index: 22, guaFullName: "山火賁" },
  "74": { index: 27, guaFullName: "山雷頤" },
  "75": { index: 18, guaFullName: "山風蠱" },
  "76": { index: 4, guaFullName: "山水蒙" },
  "77": { index: 52, guaFullName: "艮為山" },
  "78": { index: 23, guaFullName: "山地剝" },
  "81": { index: 11, guaFullName: "地天泰" },
  "82": { index: 19, guaFullName: "地澤臨" },
  "83": { index: 36, guaFullName: "地火明夷" },
  "84": { index: 24, guaFullName: "地雷復" },
  "85": { index: 46, guaFullName: "地風升" },
  "86": { index: 7, guaFullName: "地水師" },
  "87": { index: 15, guaFullName: "地山謙" },
  "88": { index: 2, guaFullName: "坤為地" }
};

function calculateGua(question) {
  const now = new Date();
  const Y = now.getFullYear();
  const M = now.getMonth() + 1;
  const D = now.getDate();
  const H = now.getHours();
  const Mi = now.getMinutes();
  const R = question.length;

  const A = Y + C + M + R;
  const B = A + D + H + Mi;

  // 上卦序數
  let shang = A % 8;
  if (shang === 0) shang = 8;

  // 下卦序數
  let xia = B % 8;
  if (xia === 0) xia = 8;

  // 動爻序數
  let dong = B % 6;
  if (dong === 0) dong = 6;

  // 使用 CODE_TO_INDEX 映射表查找正確的卦象索引和完整卦名
  const codeKey = String(shang) + String(xia);
  const mapped = CODE_TO_INDEX[codeKey] || { index: 1, guaFullName: "乾為天" };
  const guaIndex = mapped.index;
  const guaFullName = mapped.guaFullName;

  // 體用分析
  const tiyong = analyzeTiYong(shang, xia, dong);

  // ===== 變卦運算 =====
  const dY = numToYao(xia);
  const uY = numToYao(shang);
  const originSixYao = [null, dY[0], dY[1], dY[2], uY[0], uY[1], uY[2]];
  let sixYao = [...originSixYao];
  sixYao[dong] = sixYao[dong] === 1 ? 0 : 1;
  const bianXia = yaoToNum([sixYao[1], sixYao[2], sixYao[3]]);
  const bianShang = yaoToNum([sixYao[4], sixYao[5], sixYao[6]]);
  const yongNum = dong <= 3 ? bianXia : bianShang;
  const yongWx = WUXING_MAP[String(yongNum)];
  const tiWx = tiyong.tiWx;
  const { relationText, luck } = getResult(tiWx, yongWx);
  const bianCode = `${bianShang}${bianXia}`;
  const bianInfo = CODE_TO_INDEX[bianCode] || { index: 1, guaFullName: '乾為天' };
  const bianGua = GUA_DATA[bianInfo.index - 1];
  const bian = {
    shangNum: bianShang,
    xiaNum: bianXia,
    bianUp: GUA_NAMES[bianShang],
    bianDown: GUA_NAMES[bianXia],
    guaFullName: bianInfo.guaFullName,
    guaIndex: bianInfo.index,
    guaSymbol: bianGua ? bianGua.symbol : '',
    guaName: bianGua ? bianGua.name : '',
    yongGuaPos: dong <= 3 ? '下卦' : '上卦',
    yongWx: yongWx,
    tiWx: tiWx,
    relationText: relationText,
    luck: luck
  };

  // ===== 互卦運算 =====
  // 互下卦（內互）：取本卦二、三、四爻
  const huXia = yaoToNum([originSixYao[2], originSixYao[3], originSixYao[4]]);
  // 互上卦（外互）：取本卦三、四、五爻
  const huShang = yaoToNum([originSixYao[3], originSixYao[4], originSixYao[5]]);
  const huYongNum = dong <= 3 ? huXia : huShang;
  const huYongWx = WUXING_MAP[String(huYongNum)];
  const { relationText: huRelationText, luck: huLuck } = getResult(tiWx, huYongWx);
  const huCode = `${huShang}${huXia}`;
  const huInfo = CODE_TO_INDEX[huCode] || { index: 1, guaFullName: '乾為天' };
  const huGua = GUA_DATA[huInfo.index - 1];
  const hu = {
    shangNum: huShang,
    xiaNum: huXia,
    bianUp: GUA_NAMES[huShang],
    bianDown: GUA_NAMES[huXia],
    guaFullName: huInfo.guaFullName,
    guaIndex: huInfo.index,
    guaSymbol: huGua ? huGua.symbol : '',
    guaName: huGua ? huGua.name : '',
    yongGuaPos: dong <= 3 ? '下卦' : '上卦',
    yongWx: huYongWx,
    tiWx: tiWx,
    relationText: huRelationText,
    luck: huLuck
  };

  return {
    shang, xia, dong, guaIndex, guaFullName,
    shangName: GUA_NAMES[shang],
    xiaName: GUA_NAMES[xia],
    tiyong, bian, hu,
    time: now,
    timeStr: formatTime(now)
  };
}

// 體用生克分析
function analyzeTiYong(shang, xia, dong) {
  // 動爻1-3：上卦=體，下卦=用；動爻4-6：下卦=體，上卦=用
  let ti, yong;
  if (dong >= 1 && dong <= 3) {
    ti = shang; yong = xia;
  } else {
    ti = xia; yong = shang;
  }

  const tiWx = WUXING_MAP[String(ti)];
  const yongWx = WUXING_MAP[String(yong)];

  // 生克判斷
  let relation = '';
  if (tiWx === yongWx) {
    relation = '比和';
  } else if (isSheng(yongWx, tiWx)) {
    relation = '用生體';
  } else if (isKe(tiWx, yongWx)) {
    relation = '體克用';
  } else if (isSheng(tiWx, yongWx)) {
    relation = '體生用';
  } else if (isKe(yongWx, tiWx)) {
    relation = '用克體';
  }

  const info = SHENGKE_DATA[relation];
  return {
    ti: GUA_NAMES[ti], tiWx,
    yong: GUA_NAMES[yong], yongWx,
    relation, level: info.level, grade: info.grade,
    desc: info.desc, adv: info.adv
  };
}

// 五行相生：a生b
function isSheng(a, b) {
  const chain = {'木':'火','火':'土','土':'金','金':'水','水':'木'};
  return chain[a] === b;
}
// 五行相剋：a克b
function isKe(a, b) {
  const chain = {'木':'土','土':'水','水':'火','火':'金','金':'木'};
  return chain[a] === b;
}

// ===== 卦數↔三爻轉換 =====
// 先天八卦二進制：乾111 兌110 離101 震100 巽011 坎010 艮001 坤000
const BAGUA_YAO = {
  1: [1,1,1], 2: [1,1,0], 3: [1,0,1], 4: [1,0,0],
  5: [0,1,1], 6: [0,1,0], 7: [0,0,1], 8: [0,0,0]
};
const YAO_TO_NUM = {};
for (const [k,v] of Object.entries(BAGUA_YAO)) {
  YAO_TO_NUM[v.join('')] = parseInt(k);
}

function numToYao(num) {
  return BAGUA_YAO[num] || [0,0,0];
}
function yaoToNum(arr) {
  return YAO_TO_NUM[arr.join('')] || 8;
}

// 生克判斷複用接口
function getResult(tiWx, yongWx) {
  let relation = '';
  if (tiWx === yongWx) {
    relation = '比和';
  } else if (isSheng(yongWx, tiWx)) {
    relation = '用生體';
  } else if (isKe(tiWx, yongWx)) {
    relation = '體克用';
  } else if (isSheng(tiWx, yongWx)) {
    relation = '體生用';
  } else if (isKe(yongWx, tiWx)) {
    relation = '用克體';
  }
  const info = SHENGKE_DATA[relation];
  return { relationText: relation, luck: info.grade };
}

function formatTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}年${m}月${d}日 ${h}:${min}`;
}

function getDongYaoText(dong) {
  const map = {1: '初爻動', 2: '二爻動', 3: '三爻動', 4: '四爻動', 5: '五爻動', 6: '六爻動'};
  return map[dong];
}

function getDongYaoYaoci(gua, dong) {
  // 動爻1-6對應yaoci數組索引0-5
  // 乾卦和坤卦有7條爻辭（含用九/用六），其他卦6條
  if (dong >= 1 && dong <= 6) {
    return gua.yaoci[dong - 1] || '';
  }
  return '';
}

// ===== 反向映射：卦全名 → {shang, xia, guaIndex} =====
const FULLNAME_TO_CODE = {};
for (const [code, info] of Object.entries(CODE_TO_INDEX)) {
  FULLNAME_TO_CODE[info.guaFullName] = {
    shang: parseInt(code[0]),
    xia: parseInt(code[1]),
    guaIndex: info.index
  };
}

// ===== 從歷史記錄重建完整卦象結果 =====
// record 只需包含：guaFullName, dongYao
// 返回對象包含詳情頁所需的一切推導數據
function rebuildFromRecord(record) {
  const code = FULLNAME_TO_CODE[record.guaFullName];
  if (!code) return null;

  const shang = code.shang;
  const xia = code.xia;
  const dong = record.dongYao;
  const guaIndex = code.guaIndex;
  const gua = GUA_DATA[guaIndex - 1];

  // 體用分析
  const tiyong = analyzeTiYong(shang, xia, dong);

  // 變卦運算
  const dY = numToYao(xia);
  const uY = numToYao(shang);
  const originSixYao = [null, dY[0], dY[1], dY[2], uY[0], uY[1], uY[2]];
  let sixYao = [...originSixYao];
  sixYao[dong] = sixYao[dong] === 1 ? 0 : 1;
  const bianXia = yaoToNum([sixYao[1], sixYao[2], sixYao[3]]);
  const bianShang = yaoToNum([sixYao[4], sixYao[5], sixYao[6]]);
  const yongNum = dong <= 3 ? bianXia : bianShang;
  const yongWx = WUXING_MAP[String(yongNum)];
  const tiWx = tiyong.tiWx;
  const { relationText, luck } = getResult(tiWx, yongWx);
  const bianCode = `${bianShang}${bianXia}`;
  const bianInfo = CODE_TO_INDEX[bianCode] || { index: 1, guaFullName: '乾為天' };
  const bianGua = GUA_DATA[bianInfo.index - 1];
  const bian = {
    shangNum: bianShang, xiaNum: bianXia,
    bianUp: GUA_NAMES[bianShang], bianDown: GUA_NAMES[bianXia],
    guaFullName: bianInfo.guaFullName, guaIndex: bianInfo.index,
    guaSymbol: bianGua ? bianGua.symbol : '', guaName: bianGua ? bianGua.name : '',
    yongGuaPos: dong <= 3 ? '下卦' : '上卦',
    yongWx, tiWx, relationText, luck
  };

  // 互卦運算
  const huXia = yaoToNum([originSixYao[2], originSixYao[3], originSixYao[4]]);
  const huShang = yaoToNum([originSixYao[3], originSixYao[4], originSixYao[5]]);
  const huYongNum = dong <= 3 ? huXia : huShang;
  const huYongWx = WUXING_MAP[String(huYongNum)];
  const { relationText: huRelationText, luck: huLuck } = getResult(tiWx, huYongWx);
  const huCode = `${huShang}${huXia}`;
  const huInfo = CODE_TO_INDEX[huCode] || { index: 1, guaFullName: '乾為天' };
  const huGua = GUA_DATA[huInfo.index - 1];
  const hu = {
    shangNum: huShang, xiaNum: huXia,
    bianUp: GUA_NAMES[huShang], bianDown: GUA_NAMES[huXia],
    guaFullName: huInfo.guaFullName, guaIndex: huInfo.index,
    guaSymbol: huGua ? huGua.symbol : '', guaName: huGua ? huGua.name : '',
    yongGuaPos: dong <= 3 ? '下卦' : '上卦',
    yongWx: huYongWx, tiWx, relationText: huRelationText, luck: huLuck
  };

  // ===== 綜卦運算（六爻整體倒置） =====
  const zongSixYao = [null, originSixYao[6], originSixYao[5], originSixYao[4], originSixYao[3], originSixYao[2], originSixYao[1]];
  const zongXia = yaoToNum([zongSixYao[1], zongSixYao[2], zongSixYao[3]]);
  const zongShang = yaoToNum([zongSixYao[4], zongSixYao[5], zongSixYao[6]]);
  const zongCode = `${zongShang}${zongXia}`;
  const zongInfo = CODE_TO_INDEX[zongCode] || { index: 1, guaFullName: '乾為天' };
  const zongGua = GUA_DATA[zongInfo.index - 1];
  const zong = {
    shangNum: zongShang, xiaNum: zongXia,
    zongUp: GUA_NAMES[zongShang], zongDown: GUA_NAMES[zongXia],
    guaFullName: zongInfo.guaFullName, guaIndex: zongInfo.index,
    guaSymbol: zongGua ? zongGua.symbol : '', guaName: zongGua ? zongGua.name : '',
    tag: '視角反轉 · 前因鏈'
  };

  // ===== 錯卦運算（六爻逐位取反） =====
  const cuoSixYao = [null, originSixYao[1] ^ 1, originSixYao[2] ^ 1, originSixYao[3] ^ 1, originSixYao[4] ^ 1, originSixYao[5] ^ 1, originSixYao[6] ^ 1];
  const cuoXia = yaoToNum([cuoSixYao[1], cuoSixYao[2], cuoSixYao[3]]);
  const cuoShang = yaoToNum([cuoSixYao[4], cuoSixYao[5], cuoSixYao[6]]);
  const cuoCode = `${cuoShang}${cuoXia}`;
  const cuoInfo = CODE_TO_INDEX[cuoCode] || { index: 1, guaFullName: '乾為天' };
  const cuoGua = GUA_DATA[cuoInfo.index - 1];
  const cuo = {
    shangNum: cuoShang, xiaNum: cuoXia,
    cuoUp: GUA_NAMES[cuoShang], cuoDown: GUA_NAMES[cuoXia],
    guaFullName: cuoInfo.guaFullName, guaIndex: cuoInfo.index,
    guaSymbol: cuoGua ? cuoGua.symbol : '', guaName: cuoGua ? cuoGua.name : '',
    tag: '對立鏡像 · 隱性面'
  };

  return {
    gua, guaIndex, guaFullName: record.guaFullName,
    shang, xia, dong,
    shangName: GUA_NAMES[shang], xiaName: GUA_NAMES[xia],
    tiyong, bian, hu, zong, cuo,
    guaci: gua.guaci,
    yaoci: getDongYaoYaoci(gua, dong)
  };
}
