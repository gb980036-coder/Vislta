
// ==================== 数据存储模块 ====================
const STORAGE_KEY = 'chat_app_data';

const defaultAppData = {
  myProfile: {
    nickname: '我',
    avatar: ''
  },
  contacts: [],
  groups: [],
  chatRecords: {},
  letters: [],
  wordGroups: [
    { id: 'default', name: '默认', color: '#89b8e8', disabled: false, _collapsed: false, items: [] }
  ],
  currentWordGroupId: 'default',
  myEmojis: [],
  otherEmojis: [],
  statusWords: ['在线', '忙碌', '离开', '请勿打扰', '手机在线', '电脑在线'],
  settings: {
    darkMode: false,
    autoTheme: false,
    themeColor: 'blue',
    bubbleStyle: 'standard',
    msgFontSize: 15,
    bubbleSizeLevel: 1,
    avatarSize: 42,
    chatBgImage: '',
    chatBgPreset: 'none',
    chatBgOpacity: 20,
    chatBgBlur: 0,
    chatBgMode: 'cover',
    callBgImage: '',
    callBgPreset: 'none',
    callBgOverlay: 45,
    replyDelayMin: 1,
    replyDelayMax: 3,
    replyCountMin: 1,
    replyCountMax: 3,
    wordsPerMessage: 1,
    quoteReply: true,
    multiSentence: false,
    multiSentenceSeps: '，。~！',
    typingText: '',
    showMsgAvatar: true,
    showMsgSenderName: true,
    msgTimeMode: 'tap',
    showReadStatus: true,
    readText: '已读',
    readNoReplyText: '已读，对方不想回',
    sendSoundEnabled: true,
    sendSoundId: 'send_pop',
    sendSoundRandom: false,
    sendSoundPool: ['send_pop', 'send_swoosh', 'send_ding'],
    customFontUrl: '',
    customFontFamily: '',
    surveyAnswerMinSec: 4,
    surveyAnswerMaxSec: 10,
    surveyAnswerExpireSec: 60,
    letterDelayMin: 1,
    letterDelayMax: 24,
    letterWordCountMin: 3,
    letterWordCountMax: 5,
    statusInterval: 30,
    autoCall: false,
    dndEnabled: false,
    dndStart: '22:00',
    dndEnd: '08:00',
    desktopNotify: true, quietNotify: false, quietStart: '23:00', quietEnd: '07:00',
    keepAlive: true,
    timedMsgEnabled: false,
    keywordRules: '',
    letterDeliverDelay: 0,
    timedMsgInterval: 30,
    // ===== 铃声与音效 =====
    soundEnabled: true,
    soundVolume: 80,
    ringtoneCall: 'call_classic',
    ringtoneMsg: 'msg_default',
    ringtoneGroup: 'grp_default',
    ringtoneSystem: 'sys_default',
    ringtoneRedpacket: 'redpacket',
    ringtoneMoments: 'moments_reply',
    momentsNotifyDnd: false,
    // ===== 朋友圈 =====
    autoMoments: false,
    autoMomentsInterval: 30,
    momentsBgImage: '',
    // ===== AI 红包行为 =====
    aiRedPacket: true,
    aiRedPacketChance: 8
  },
  convSettings: {},
  unreadMap: {},
  // ===== 钱包 & 红包 =====
  walletBalance: 1000,
  redPackets: {},
  redPacketRecords: [],
  // ===== 朋友圈 =====
  moments: [],
  momentsDraft: null,
  momentsUnread: 0,
  // ===== 自定义铃声 =====
  customRingtones: [],
  // ===== 记事本 & 待办 =====
  notes: [],
  todos: [],
  // ===== 收藏夹 =====
  favorites: [],
  // ===== 会话输入草稿 =====
  chatDrafts: {},
  music: [],
  currentMusicId: '',
  pinnedConversations: {}, // 会话置顶 { 'contact_xxx' | 'group_xxx': true }
  surveyTemplates: {},
  surveyLibrary: {},
  mySurveyLibrary: {},
  currentChatId: null,
  currentChatType: null // 'contact' or 'group'
};
let appData = JSON.parse(JSON.stringify(defaultAppData));

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      appData = { ...appData, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('加载数据失败', e);
  }
  // 确保数据结构完整
  // 数据迁移：旧版 wordCategories + words -> wordGroups
  if (appData.wordCategories && !appData.wordGroups) {
    const colors = ['#89b8e8', '#b8a8e0', '#86c9b4', '#d8b89c', '#e8a5b8', '#6ec2bc', '#8e9ce0', '#e8a880'];
    appData.wordGroups = appData.wordCategories.map((cat, idx) => ({
      id: 'cat_' + Date.now() + '_' + idx,
      name: cat,
      color: colors[idx % colors.length],
      disabled: false,
      _collapsed: false,
      items: appData.words && appData.words[cat] ? appData.words[cat] : []
    }));
    // 迁移 currentCategory
    if (appData.currentCategory) {
      const found = appData.wordGroups.find(g => g.name === appData.currentCategory);
      appData.currentWordGroupId = found ? found.id : appData.wordGroups[0].id;
    } else {
      appData.currentWordGroupId = appData.wordGroups[0].id;
    }
    delete appData.wordCategories;
    delete appData.words;
    delete appData.currentCategory;
  }
  if (!appData.wordGroups || appData.wordGroups.length === 0) {
    appData.wordGroups = [{ id: 'default', name: '默认', color: '#89b8e8', disabled: false, _collapsed: false, items: [] }];
    appData.currentWordGroupId = 'default';
  }
  if (!appData.currentWordGroupId) {
    appData.currentWordGroupId = appData.wordGroups[0].id;
  }
  if (!appData.myEmojis) appData.myEmojis = [];
  if (!appData.otherEmojis) appData.otherEmojis = [];
  if (!appData.statusWords || appData.statusWords.length === 0) {
    appData.statusWords = ['在线', '忙碌', '离开', '请勿打扰', '手机在线', '电脑在线'];
  }
  if (!appData.letters) appData.letters = [];
  if (!appData.groups) appData.groups = [];
  if (!appData.chatRecords) appData.chatRecords = {};
  if (!appData.contacts) appData.contacts = [];
  
  // ===== 新模块数据迁移与脏字段修复 =====
  if (typeof appData.walletBalance !== 'number' || !isFinite(appData.walletBalance) || appData.walletBalance < 0) appData.walletBalance = 1000;
  if (!appData.redPackets || typeof appData.redPackets !== 'object') appData.redPackets = {};
  if (!Array.isArray(appData.redPacketRecords)) appData.redPacketRecords = [];
  if (!Array.isArray(appData.moments)) appData.moments = [];
  if (!Array.isArray(appData.customRingtones)) appData.customRingtones = [];
  if (!Array.isArray(appData.notes)) appData.notes = [];
  if (!Array.isArray(appData.todos)) appData.todos = [];
  if (!Array.isArray(appData.favorites)) appData.favorites = [];
  if (!appData.chatDrafts || typeof appData.chatDrafts !== 'object') appData.chatDrafts = {};
  if (typeof appData.momentsUnread !== 'number' || appData.momentsUnread < 0) appData.momentsUnread = 0;
  // 朋友圈动态结构修复
  appData.moments.forEach(m => {
    if (!m.id) m.id = 'mom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    if (!Array.isArray(m.images)) m.images = [];
    if (!Array.isArray(m.likes)) m.likes = [];
    if (!Array.isArray(m.comments)) m.comments = [];
    if (!Array.isArray(m.viewers)) m.viewers = [];
    if (!m.visibility) m.visibility = 'public';
    if (!Array.isArray(m.visibleIds)) m.visibleIds = [];
    if (typeof m.time !== 'number') m.time = Date.now();
  });
  // 红包结构修复
  Object.values(appData.redPackets).forEach(rp => {
    if (typeof rp.totalAmount !== 'number' || rp.totalAmount < 0) rp.totalAmount = 0;
    if (typeof rp.remainAmount !== 'number' || rp.remainAmount < 0) rp.remainAmount = 0;
    if (typeof rp.remainCount !== 'number' || rp.remainCount < 0) rp.remainCount = 0;
    if (!Array.isArray(rp.claimedBy)) rp.claimedBy = [];
    if (!rp.status) rp.status = rp.remainCount > 0 ? 'active' : 'done';
  });
  // 红包流水修复
  appData.redPacketRecords = appData.redPacketRecords.filter(r => r && typeof r.amount === 'number' && isFinite(r.amount)).map(r => {
    if (!['send', 'receive', 'refund', 'transfer_out', 'transfer_in'].includes(r.type)) r.type = 'receive';
    if (typeof r.time !== 'number') r.time = Date.now();
    return r;
  });
  // 联系人/群 新字段懒初始化标记
  appData.contacts.forEach(c => {
    if (typeof c.walletBalance !== 'number' || c.walletBalance < 0) c.walletBalance = 500;
    if (!c.ringtoneCall) c.ringtoneCall = '';
    if (!c.ringtoneMsg) c.ringtoneMsg = '';
    if (typeof c.msgDnd !== 'boolean') c.msgDnd = false;
  });
  appData.groups.forEach(g => {
    if (!g.groupRingtone) g.groupRingtone = '';
    if (typeof g.groupDnd !== 'boolean') g.groupDnd = false;
  });
  // 设置项修复
  const s = appData.settings;
  if (typeof s.soundEnabled !== 'boolean') s.soundEnabled = true;
  if (typeof s.soundVolume !== 'number' || s.soundVolume < 0 || s.soundVolume > 100) s.soundVolume = 80;
  if (!s.ringtoneCall) s.ringtoneCall = 'call_classic';
  if (typeof s.keywordRules !== 'string') s.keywordRules = '';
  if (typeof s.letterDeliverDelay !== 'number') s.letterDeliverDelay = 0;
  if (!s.ringtoneMsg) s.ringtoneMsg = 'msg_default';
  if (!s.ringtoneGroup) s.ringtoneGroup = 'grp_default';
  if (!s.ringtoneSystem) s.ringtoneSystem = 'sys_default';
  if (typeof s.momentsNotifyDnd !== 'boolean') s.momentsNotifyDnd = false;
  if (typeof s.autoMoments !== 'boolean') s.autoMoments = false;
  if (typeof s.autoMomentsInterval !== 'number' || s.autoMomentsInterval < 1) s.autoMomentsInterval = 30;
  if (s.momentsBgImage === undefined) s.momentsBgImage = '';
  
  // 数据迁移：旧版 letterWordCount 单值 -> letterWordCountMin/Max 范围
  if (appData.settings && appData.settings.letterWordCount !== undefined && appData.settings.letterWordCountMin === undefined) {
    const oldVal = appData.settings.letterWordCount;
    appData.settings.letterWordCountMin = Math.max(1, oldVal - 1);
    appData.settings.letterWordCountMax = oldVal;
    delete appData.settings.letterWordCount;
  }
  // 数据迁移：新增 themeColor / bubbleStyle / msgFontSize / bubbleSizeLevel / avatarSize / chatBg 默认值
  if (appData.settings) {
    if (!appData.settings.themeColor) appData.settings.themeColor = 'blue';
    if (!appData.settings.bubbleStyle) appData.settings.bubbleStyle = 'standard';
    // 校验气泡样式有效性，已移除的样式自动回退到标准圆角
    const validBubbleStyles = ['standard', 'minimal', 'vintage', 'emboss', 'pixel'];
    if (!validBubbleStyles.includes(appData.settings.bubbleStyle)) {
      appData.settings.bubbleStyle = 'standard';
    }
    if (!appData.settings.msgFontSize) appData.settings.msgFontSize = 15;
    if (appData.settings.bubbleSizeLevel === undefined) appData.settings.bubbleSizeLevel = 1;
    if (!appData.settings.avatarSize) appData.settings.avatarSize = 42;
    if (appData.settings.chatBgImage === undefined) appData.settings.chatBgImage = '';
    if (appData.settings.chatBgPreset === undefined) appData.settings.chatBgPreset = 'none';
    if (appData.settings.chatBgOpacity === undefined) appData.settings.chatBgOpacity = 20;
    if (appData.settings.chatBgBlur === undefined) appData.settings.chatBgBlur = 0;
    if (appData.settings.chatBgMode === undefined) appData.settings.chatBgMode = 'cover';
    if (appData.settings.callBgImage === undefined) appData.settings.callBgImage = '';
    if (appData.settings.callBgPreset === undefined) appData.settings.callBgPreset = 'none';
    if (appData.settings.callBgOverlay === undefined) appData.settings.callBgOverlay = 45;
    if (appData.settings.timedMsgEnabled === undefined) appData.settings.timedMsgEnabled = false;
    if (appData.settings.timedMsgInterval === undefined) appData.settings.timedMsgInterval = 30;
    if (!appData.settings.timedMsgInterval) appData.settings.timedMsgInterval = 30;
    if (appData.settings.multiSentence === undefined) appData.settings.multiSentence = false;
    if (appData.settings.multiSentenceSeps === undefined) appData.settings.multiSentenceSeps = '，。~！';
    if (appData.settings.typingText === undefined) appData.settings.typingText = '';
    if (appData.settings.showMsgAvatar === undefined) appData.settings.showMsgAvatar = true;
    if (appData.settings.showMsgSenderName === undefined) appData.settings.showMsgSenderName = true;
    if (appData.settings.msgTimeMode === undefined) appData.settings.msgTimeMode = 'tap';
    if (appData.settings.showReadStatus === undefined) appData.settings.showReadStatus = true;
    if (appData.settings.readText === undefined) appData.settings.readText = '已读';
    if (appData.settings.readNoReplyText === undefined) appData.settings.readNoReplyText = '已读，对方不想回';
    if (appData.settings.sendSoundEnabled === undefined) appData.settings.sendSoundEnabled = true;
    if (appData.settings.sendSoundId === undefined) appData.settings.sendSoundId = 'send_pop';
    if (appData.settings.sendSoundRandom === undefined) appData.settings.sendSoundRandom = false;
    if (!Array.isArray(appData.settings.sendSoundPool) || appData.settings.sendSoundPool.length === 0) appData.settings.sendSoundPool = ['send_pop', 'send_swoosh', 'send_ding'];
    if (appData.settings.customFontUrl === undefined) appData.settings.customFontUrl = '';
    if (appData.settings.customFontFamily === undefined) appData.settings.customFontFamily = '';
    if (appData.settings.aiRedPacket === undefined) appData.settings.aiRedPacket = true;
    if (typeof appData.settings.aiRedPacketChance !== 'number' || appData.settings.aiRedPacketChance < 1 || appData.settings.aiRedPacketChance > 100) appData.settings.aiRedPacketChance = 8;
    // 问卷对方作答参数（延迟范围 / 作答时限）
    if (typeof appData.settings.surveyAnswerMinSec !== 'number' || appData.settings.surveyAnswerMinSec < 1) appData.settings.surveyAnswerMinSec = 4;
    if (typeof appData.settings.surveyAnswerMaxSec !== 'number' || appData.settings.surveyAnswerMaxSec < appData.settings.surveyAnswerMinSec) appData.settings.surveyAnswerMaxSec = Math.max(10, appData.settings.surveyAnswerMinSec);
    if (typeof appData.settings.surveyAnswerExpireSec !== 'number' || appData.settings.surveyAnswerExpireSec < 0) appData.settings.surveyAnswerExpireSec = 60;
    // 清理已废弃的问卷间隔配置（时机已改为完全随机）
    delete appData.settings.surveyAutoInterval;
  }
  if (!appData.convSettings) appData.convSettings = {};
  // 清理会话配置中废弃的问卷间隔字段（时机已改为完全随机）
  Object.values(appData.convSettings).forEach(cs => { delete cs.surveyAutoInterval; });
  if (!appData.wordUsage) appData.wordUsage = {};
  if (!appData.unreadMap) appData.unreadMap = {};
  if (!appData.pinnedConversations) appData.pinnedConversations = {};
  if (!appData.surveyTemplates) appData.surveyTemplates = {};
  if (!appData.surveyLibrary) appData.surveyLibrary = {};
  if (!appData.mySurveyLibrary) appData.mySurveyLibrary = {};
}

let __saveTimer = null;
function flushSaveData() {
  if (__saveTimer) { clearTimeout(__saveTimer); __saveTimer = null; }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  } catch (e) {
    console.error('保存数据失败', e);
    showToast('保存数据失败');
  }
}

// 高频操作合并写，减少卡顿；关页前会自动落盘
function saveData() {
  if (__saveTimer) clearTimeout(__saveTimer);
  __saveTimer = setTimeout(flushSaveData, 300);
}

window.addEventListener('pagehide', flushSaveData);
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') flushSaveData();
});

// ==================== 工具函数 ====================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const oneDay = 24 * 60 * 60 * 1000;
  
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return Math.floor(diff / (60 * 1000)) + '分钟前';
  if (diff < oneDay && date.getDate() === now.getDate()) {
    return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
  }
  if (diff < 2 * oneDay) return '昨天';
  if (diff < 7 * oneDay) {
    const days = ['周日','周一','周二','周三','周四','周五','周六'];
    return days[date.getDay()];
  }
  return (date.getMonth() + 1) + '/' + date.getDate();
}

function formatFullTime(timestamp) {
  const date = new Date(timestamp);
  return date.getFullYear() + '-' + 
    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
    date.getDate().toString().padStart(2, '0') + ' ' +
    date.getHours().toString().padStart(2, '0') + ':' +
    date.getMinutes().toString().padStart(2, '0');
}

// 日期分割线文案：今天 / 昨天 / 星期X / 具体日期
function formatDateDivider(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMsg = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfMsg) / oneDay);
  
  if (dayDiff === 0) return '今天';
  if (dayDiff === 1) return '昨天';
  if (dayDiff === 2) return '前天';
  if (dayDiff > 0 && dayDiff < 7) {
    const days = ['周日','周一','周二','周三','周四','周五','周六'];
    return days[date.getDay()];
  }
  const y = date.getFullYear() === now.getFullYear() ? '' : date.getFullYear() + '年';
  return y + (date.getMonth() + 1) + '月' + date.getDate() + '日';
}

function showToast(msg, duration = 2000) {
  const toast = document.getElementById('toast');
  if (toast.classList.contains('show')) {
    // 队列化：当前有提示显示时，暂存待展示，依次播放不互相覆盖
    toastQueue.push({ msg, duration });
    return;
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    // 300ms 过渡动画后播放下一条
    setTimeout(() => {
      const next = toastQueue.shift();
      if (next) showToast(next.msg, next.duration);
    }, 320);
  }, duration);
}

// Toast 待播队列
const toastQueue = [];

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

function getAvatarHTML(avatar, name, size = '') {
  const sizeClass = size ? `avatar-${size}` : '';
  if (avatar) {
    return `<div class="avatar ${sizeClass}"><img src="${avatar}" alt=""></div>`;
  }
  return `<div class="avatar ${sizeClass}">${getInitial(name)}</div>`;
}

function getGroupAvatarHTML(group) {
  const members = group.memberIds.slice(0, 4);
  let html = '<div class="group-avatar">';
  members.forEach(id => {
    const contact = appData.contacts.find(c => c.id === id);
    const name = contact ? contact.name : '?';
    if (contact && contact.avatar) {
      html += `<div class="ga-item"><img src="${contact.avatar}" alt=""></div>`;
    } else {
      html += `<div class="ga-item">${getInitial(name)}</div>`;
    }
  });
  // 补齐空位
  for (let i = members.length; i < 4; i++) {
    html += '<div class="ga-item" style="background:var(--bg-tertiary);"></div>';
  }
  html += '</div>';
  return html;
}

// 文件转base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 下载JSON文件
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 随机整数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 随机选择数组元素
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ==================== 主题系统 ====================
function applyTheme() {
  const root = document.documentElement;
  // 添加过渡类实现平滑切换
  root.classList.add('theme-transition');
  if (appData.settings.darkMode) {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.setAttribute('data-theme', 'light');
  }
  // 过渡结束后移除类
  setTimeout(() => {
    root.classList.remove('theme-transition');
  }, 450);
  
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.classList.toggle('active', appData.settings.darkMode);
  
  const autoToggle = document.getElementById('autoThemeToggle');
  if (autoToggle) autoToggle.classList.toggle('active', appData.settings.autoTheme);
  
  // 应用主题配色
  if (appData.settings.themeColor && appData.settings.themeColor !== 'blue') {
    document.documentElement.setAttribute('data-theme-color', appData.settings.themeColor);
  }
  const colorBtns = document.querySelectorAll('#themeColorGroup .theme-swatch');
  colorBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === (appData.settings.themeColor || 'blue'));
  });
  
  // 应用气泡样式
  if (appData.settings.bubbleStyle && appData.settings.bubbleStyle !== 'standard') {
    document.documentElement.setAttribute('data-bubble-style', appData.settings.bubbleStyle);
  }
  const styleBtns = document.querySelectorAll('#bubbleStyleGroup .bubble-style-card');
  styleBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === (appData.settings.bubbleStyle || 'standard'));
  });
  
  // 应用消息字体大小
  renderMusicList();
  const kwInputEl = document.getElementById('keywordRulesInput');
  if (kwInputEl) kwInputEl.value = appData.settings.keywordRules || '';
  const ldDelayEl = document.getElementById('letterDeliverDelay');
  if (ldDelayEl) ldDelayEl.value = appData.settings.letterDeliverDelay || 0;
  if (appData.settings.msgFontSize) {
    document.documentElement.style.setProperty('--msg-font-size', appData.settings.msgFontSize + 'px');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeInput = document.getElementById('fontSizeInput');
    if (fontSizeSlider) fontSizeSlider.value = appData.settings.msgFontSize;
    if (fontSizeInput) fontSizeInput.value = appData.settings.msgFontSize;
  }
  
  // 应用气泡尺寸
  const bubbleSizeLevel = appData.settings.bubbleSizeLevel !== undefined ? appData.settings.bubbleSizeLevel : 1;
  applyBubbleSize(bubbleSizeLevel);
  const bubbleSizeSlider = document.getElementById('bubbleSizeSlider');
  const bubbleSizeLabel = document.getElementById('bubbleSizeLabel');
  if (bubbleSizeSlider) bubbleSizeSlider.value = bubbleSizeLevel;
  if (bubbleSizeLabel) bubbleSizeLabel.textContent = getBubbleSizeLabel(bubbleSizeLevel);
  
  // 应用头像大小
  if (appData.settings.avatarSize) {
    document.documentElement.style.setProperty('--avatar-size', appData.settings.avatarSize + 'px');
    const avatarSizeSlider = document.getElementById('avatarSizeSlider');
    const avatarSizeInput = document.getElementById('avatarSizeInput');
    if (avatarSizeSlider) avatarSizeSlider.value = appData.settings.avatarSize;
    if (avatarSizeInput) avatarSizeInput.value = appData.settings.avatarSize;
  }
  
  // 应用聊天背景图
  applyChatBg();
}

// 预设背景渐变映射
const bgPresets = {
  'none': null,
  'blue-sky': 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
  'purple-dream': 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #c4b5fd 100%)',
  'mint-fresh': 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
  'warm-sunset': 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
  'sakura': 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
  'ocean-deep': 'linear-gradient(180deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)',
  'night-star': 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)',
  'paper': 'linear-gradient(135deg, #faf8f5 0%, #f5f0e8 100%)',
  'forest': 'linear-gradient(180deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)'
};

function applyChatBg() {
  const root = document.documentElement;

  // 生效配置：当前会话独立背景优先，否则全局设置
  const bg = getEffectiveChatBg();

  // 确定背景来源：自定义图片优先，其次预设，最后无背景
  let bgImage = 'none';
  let bgRepeat = 'no-repeat';
  let hasBackground = false;

  if (bg.image) {
    // 自定义图片
    bgImage = `url("${bg.image}")`;
    hasBackground = true;
  } else if (bg.preset && bg.preset !== 'none' && bgPresets[bg.preset]) {
    // 预设背景
    bgImage = bgPresets[bg.preset];
    hasBackground = true;
  }

  // 背景模式处理
  const mode = bg.mode || 'cover';
  let bgSize = mode;
  if (mode === 'repeat') {
    bgSize = 'auto';
    bgRepeat = 'repeat';
  } else if (mode === 'auto') {
    bgSize = 'auto';
  }

  root.style.setProperty('--chat-bg-image', bgImage);
  root.style.setProperty('--chat-bg-mode', bgSize);
  root.style.setProperty('--chat-bg-repeat', bgRepeat);

  // 背景模糊
  const blur = bg.blur || 0;
  root.style.setProperty('--chat-bg-blur', blur + 'px');

  // 背景浓度（遮罩透明度）
  const opacity = bg.opacity !== undefined ? bg.opacity : 20;
  const isDark = appData.settings.darkMode;
  const overlayAlpha = hasBackground ? (100 - opacity) / 100 * 0.75 : 0;
  const overlayColor = isDark ? '30, 35, 42' : '246, 250, 255';
  root.style.setProperty('--chat-bg-overlay', `rgba(${overlayColor}, ${overlayAlpha})`);

  // 更新UI - 预设背景选中状态（仅聊天背景选择器，避免误改通话背景选中态）
  const presetItems = document.querySelectorAll('#bgPresets .bg-preset-item');
  presetItems.forEach(item => {
    const preset = item.dataset.preset;
    const isActive = !bg.image && bg.preset === preset;
    item.classList.toggle('active', isActive);
  });

  // 更新UI - 预览区
  const preview = document.getElementById('bgUploadPreview');
  const resetBtn = document.getElementById('resetChatBgBtn');
  const opacitySlider = document.getElementById('chatBgOpacity');
  const opacityVal = document.getElementById('chatBgOpacityVal');
  const blurSlider = document.getElementById('chatBgBlur');
  const blurVal = document.getElementById('chatBgBlurVal');

  if (preview) {
    if (bg.image) {
      preview.style.backgroundImage = `url("${bg.image}")`;
      preview.classList.add('has-image');
    } else {
      preview.style.backgroundImage = '';
      preview.classList.remove('has-image');
    }
  }

  if (resetBtn) {
    const hasCustom = bg.image || (bg.preset && bg.preset !== 'none') || bg.blur > 0 || bg.opacity !== 20 || bg.mode !== 'cover';
    resetBtn.style.display = hasCustom ? 'flex' : 'none';
  }

  if (opacitySlider) opacitySlider.value = opacity;
  if (opacityVal) opacityVal.textContent = opacity + '%';
  if (blurSlider) blurSlider.value = blur;
  if (blurVal) blurVal.textContent = blur + 'px';

  // 更新背景模式按钮选中状态
  const modeBtns = document.querySelectorAll('.bg-mode-btn');
  modeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

function applyCallBg(targetKey) {
  const modal = document.getElementById('callModal');
  const layer = document.getElementById('callBgLayer');
  const overlay = modal ? modal.querySelector('.call-bg-overlay') : null;
  if (!modal || !layer || !overlay) return;

  // 视觉层：通话发起时可指定目标会话 key，用该会话的独立背景
  const bg = getEffectiveCallBg(targetKey);

  // 确定背景来源：自定义图片优先，其次预设，最后无背景
  let bgv = 'none';
  let hasBackground = false;
  if (bg.image) {
    bgv = `url("${bg.image}")`;
    hasBackground = true;
  } else if (bg.preset && bg.preset !== 'none' && bgPresets[bg.preset]) {
    bgv = bgPresets[bg.preset];
    hasBackground = true;
  }

  if (hasBackground) {
    layer.style.backgroundImage = bgv;
    layer.style.backgroundSize = 'cover';
    layer.style.backgroundPosition = 'center';
    modal.classList.add('has-bg');
    // 遮罩浓度：保证文字可读性
    const op = bg.overlay !== undefined ? bg.overlay : 45;
    const a1 = (op / 100 * 0.72).toFixed(2);
    const a2 = (op / 100 * 0.9).toFixed(2);
    overlay.style.background = `linear-gradient(160deg, rgba(22, 32, 50, ${a1}) 0%, rgba(13, 19, 33, ${a2}) 100%)`;
  } else {
    layer.style.backgroundImage = 'none';
    overlay.style.background = '';
    modal.classList.remove('has-bg');
  }

  // 设置页 UI 同步：始终反映"当前会话"的生效配置（与视觉层可能不同）
  const ui = targetKey ? getEffectiveCallBg() : bg;
  const presetItems = document.querySelectorAll('#callBgPresets .bg-preset-item');
  presetItems.forEach(item => {
    const isActive = !ui.image && ui.preset === item.dataset.preset;
    item.classList.toggle('active', isActive);
  });

  // 更新预览区与重置按钮
  const preview = document.getElementById('callBgUploadPreview');
  const resetBtn = document.getElementById('resetCallBgBtn');
  const overlaySlider = document.getElementById('callBgOverlaySlider');
  const overlayVal = document.getElementById('callBgOverlayVal');

  if (preview) {
    if (ui.image) {
      preview.style.backgroundImage = `url("${ui.image}")`;
      preview.classList.add('has-image');
    } else {
      preview.style.backgroundImage = '';
      preview.classList.remove('has-image');
    }
  }

  const op = ui.overlay !== undefined ? ui.overlay : 45;
  if (resetBtn) {
    const hasCustom = ui.image || (ui.preset && ui.preset !== 'none') || op !== 45;
    resetBtn.style.display = hasCustom ? 'flex' : 'none';
  }
  if (overlaySlider) overlaySlider.value = op;
  if (overlayVal) overlayVal.textContent = op + '%';
}

function getBubbleSizeLabel(level) {
  const labels = ['偏小紧凑', '标准', '宽松大气泡'];
  return labels[level] || '标准';
}

function applyBubbleSize(level) {
  const sizes = [
    { y: '7px', x: '10px', img: '170px' },   // 偏小紧凑
    { y: '10px', x: '14px', img: '220px' },  // 标准
    { y: '14px', x: '18px', img: '260px' },  // 宽松大气泡
  ];
  const size = sizes[level] || sizes[1];
  document.documentElement.style.setProperty('--bubble-padding-y', size.y);
  document.documentElement.style.setProperty('--bubble-padding-x', size.x);
  document.documentElement.style.setProperty('--bubble-max-w', size.img);
}

function initTheme() {
  if (appData.settings.autoTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    appData.settings.darkMode = prefersDark;
  }
  applyTheme();
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (appData.settings.autoTheme) {
      appData.settings.darkMode = e.matches;
      applyTheme();
      saveData();
    }
  });
}

// ==================== 页面切换 ====================
let currentPage = 'chat';

function switchPage(pageName) {
  if (currentPage === pageName) return;
  
  document.querySelectorAll('.tab-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });
  
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active', 'prev');
  });
  
  const currentEl = document.getElementById(currentPage + 'Page');
  const nextEl = document.getElementById(pageName + 'Page');
  
  const tabOrder = ['chat', 'contacts', 'moments', 'letters', 'settings'];
  const currentIdx = tabOrder.indexOf(currentPage);
  const nextIdx = tabOrder.indexOf(pageName);
  
  if (nextIdx > currentIdx) {
    currentEl.classList.add('prev');
    nextEl.classList.add('active');
  } else {
    nextEl.classList.add('prev');
    setTimeout(() => {
      nextEl.classList.remove('prev');
      nextEl.classList.add('active');
    }, 10);
  }
  
  currentPage = pageName;
  window.currentPage = pageName;
  
  // 页面特定刷新
  if (pageName === 'contacts') renderContacts();
  if (pageName === 'letters') renderLetters();
  if (pageName === 'moments') { clearMomentsUnread(); renderMomentsPage(); }
  if (pageName === 'settings') { renderAllNewPanels(); updateMyAvatarPreview(); }
}

// 触摸滑动切换页面
let touchStartX = 0;
let touchStartY = 0;

document.getElementById('pageContainer').addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.getElementById('pageContainer').addEventListener('touchend', (e) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX;
  const deltaY = e.changedTouches[0].clientY - touchStartY;
  
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
    const tabOrder = ['chat', 'contacts', 'moments', 'letters', 'settings'];
    const currentIdx = tabOrder.indexOf(currentPage);
    
    if (deltaX < 0 && currentIdx < tabOrder.length - 1) {
      switchPage(tabOrder[currentIdx + 1]);
    } else if (deltaX > 0 && currentIdx > 0) {
      switchPage(tabOrder[currentIdx - 1]);
    }
  }
}, { passive: true });

// ==================== Tab栏事件 ====================
document.querySelectorAll('.tab-item').forEach(item => {
  item.addEventListener('click', () => {
    switchPage(item.dataset.page);
  });
});

// ==================== 折叠面板 ====================
document.querySelectorAll('.collapsible-header').forEach(header => {
  header.addEventListener('click', () => {
    header.parentElement.classList.toggle('open');
  });
});

// ==================== Toggle开关 ====================
function initToggles() {
  document.getElementById('darkModeToggle').addEventListener('click', function() {
    if (appData.settings.autoTheme) {
      appData.settings.autoTheme = false;
      document.getElementById('autoThemeToggle').classList.remove('active');
    }
    appData.settings.darkMode = !appData.settings.darkMode;
    this.classList.toggle('active', appData.settings.darkMode);
    applyTheme();
    saveData();
  });
  
  document.getElementById('autoThemeToggle').addEventListener('click', function() {
    appData.settings.autoTheme = !appData.settings.autoTheme;
    this.classList.toggle('active', appData.settings.autoTheme);
    if (appData.settings.autoTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      appData.settings.darkMode = prefersDark;
      document.getElementById('darkModeToggle').classList.toggle('active', prefersDark);
      applyTheme();
    }
    saveData();
  });
  
  // 主题配色切换
  document.querySelectorAll('#themeColorGroup .theme-swatch').forEach(btn => {
    btn.addEventListener('click', function() {
      const color = this.dataset.color;
      const prevColor = appData.settings.themeColor;
      appData.settings.themeColor = color;
      
      // 暗夜主题自动切换深色模式
      if (color === 'midnight' && !appData.settings.darkMode) {
        appData.settings.darkMode = true;
        applyTheme();
      } else if (prevColor === 'midnight' && color !== 'midnight' && appData.settings.darkMode) {
        // 从暗夜切出时，关闭深色模式
        appData.settings.darkMode = false;
        applyTheme();
      } else {
        applyThemeColor(color);
      }
      
      // 更新激活状态
      document.querySelectorAll('#themeColorGroup .theme-swatch').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      saveData();
    });
  });
  
  // 气泡样式切换
  document.querySelectorAll('#bubbleStyleGroup .bubble-style-card').forEach(btn => {
    btn.addEventListener('click', function() {
      const style = this.dataset.style;
      appData.settings.bubbleStyle = style;
      applyBubbleStyle(style);
      // 更新激活状态
      document.querySelectorAll('#bubbleStyleGroup .bubble-style-card').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      saveData();
    });
  });
  
  function applyThemeColor(color) {
    const root = document.documentElement;
    // 添加过渡类
    root.classList.add('theme-transition');
    if (color === 'blue') {
      root.removeAttribute('data-theme-color');
    } else {
      root.setAttribute('data-theme-color', color);
    }
    // 过渡结束后移除类
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 450);
  }
  
  function applyBubbleStyle(style) {
    const root = document.documentElement;
    if (style === 'standard') {
      root.removeAttribute('data-bubble-style');
    } else {
      root.setAttribute('data-bubble-style', style);
    }
  }
  
  // 消息字体大小滑块
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeInput = document.getElementById('fontSizeInput');
  if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', function() {
      const size = parseFloat(this.value);
      appData.settings.msgFontSize = size;
      document.documentElement.style.setProperty('--msg-font-size', size + 'px');
      if (fontSizeInput) fontSizeInput.value = size;
    });
    fontSizeSlider.addEventListener('change', function() {
      saveData();
    });
  }
  if (fontSizeInput) {
    fontSizeInput.addEventListener('change', function() {
      let size = parseFloat(this.value);
      if (isNaN(size)) size = 15;
      size = Math.max(5, Math.min(20, size));
      size = Math.round(size * 2) / 2; // 对齐0.5步长
      appData.settings.msgFontSize = size;
      document.documentElement.style.setProperty('--msg-font-size', size + 'px');
      if (fontSizeSlider) fontSizeSlider.value = size;
      this.value = size;
      saveData();
    });
  }
  
  // 气泡尺寸滑块
  const bubbleSizeSlider = document.getElementById('bubbleSizeSlider');
  const bubbleSizeLabel = document.getElementById('bubbleSizeLabel');
  if (bubbleSizeSlider) {
    bubbleSizeSlider.addEventListener('input', function() {
      const level = parseInt(this.value);
      appData.settings.bubbleSizeLevel = level;
      applyBubbleSize(level);
      if (bubbleSizeLabel) bubbleSizeLabel.textContent = getBubbleSizeLabel(level);
    });
    bubbleSizeSlider.addEventListener('change', function() {
      saveData();
    });
  }
  
  // 头像大小滑块
  const avatarSizeSlider = document.getElementById('avatarSizeSlider');
  const avatarSizeInput = document.getElementById('avatarSizeInput');
  if (avatarSizeSlider) {
    avatarSizeSlider.addEventListener('input', function() {
      const size = parseInt(this.value);
      appData.settings.avatarSize = size;
      document.documentElement.style.setProperty('--avatar-size', size + 'px');
      if (avatarSizeInput) avatarSizeInput.value = size;
    });
    avatarSizeSlider.addEventListener('change', function() {
      saveData();
    });
  }
  if (avatarSizeInput) {
    avatarSizeInput.addEventListener('change', function() {
      let size = parseInt(this.value);
      if (isNaN(size)) size = 42;
      size = Math.max(28, Math.min(60, size));
      appData.settings.avatarSize = size;
      document.documentElement.style.setProperty('--avatar-size', size + 'px');
      if (avatarSizeSlider) avatarSizeSlider.value = size;
      this.value = size;
      saveData();
    });
  }
  
  // 聊天背景图上传
  const bgUploadArea = document.getElementById('bgUploadArea');
  const chatBgInput = document.getElementById('chatBgInput');
  const resetChatBgBtn = document.getElementById('resetChatBgBtn');
  const chatBgOpacity = document.getElementById('chatBgOpacity');
  const chatBgOpacityVal = document.getElementById('chatBgOpacityVal');
  const chatBgBlur = document.getElementById('chatBgBlur');
  const chatBgBlurVal = document.getElementById('chatBgBlurVal');
  const bgPresetsEl = document.getElementById('bgPresets');
  const bgModeSelector = document.getElementById('bgModeSelector');
  
  // 图片压缩函数
  function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          // 计算缩放比例
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          // 创建canvas进行压缩
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          // 输出为JPEG格式
          const compressedData = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedData);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  if (bgUploadArea && chatBgInput) {
    bgUploadArea.addEventListener('click', function() {
      chatBgInput.click();
    });
    chatBgInput.addEventListener('change', async function(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件');
        return;
      }
      try {
        // 自动压缩图片
        const compressed = await compressImage(file, 800, 0.7);
        setChatBgProp('image', compressed);
        // 使用自定义图片时清除预设选择
        setChatBgProp('preset', 'none');
        applyChatBg();
        saveData();
        showToast('背景图设置成功');
      } catch (err) {
        // 压缩失败则使用原图
        const reader = new FileReader();
        reader.onload = function(ev) {
          setChatBgProp('image', ev.target.result);
          setChatBgProp('preset', 'none');
          applyChatBg();
          saveData();
          showToast('背景图设置成功');
        };
        reader.readAsDataURL(file);
      }
      // 重置input以便重复上传同一张图
      chatBgInput.value = '';
    });
  }
  
  // 预设背景点击
  if (bgPresetsEl) {
    bgPresetsEl.addEventListener('click', function(e) {
      const presetItem = e.target.closest('.bg-preset-item');
      if (!presetItem) return;
      const preset = presetItem.dataset.preset;
      setChatBgProp('preset', preset);
      // 选择预设时清除自定义图片
      if (preset !== 'none' || !getEffectiveChatBg().image) {
        setChatBgProp('image', '');
      }
      applyChatBg();
      saveData();
    });
  }
  
  // 重置背景
  if (resetChatBgBtn) {
    resetChatBgBtn.addEventListener('click', function() {
      // 重置当前生效目标（会话级独立时仅重置该会话）
      setChatBgProp('image', '');
      setChatBgProp('preset', 'none');
      setChatBgProp('opacity', 20);
      setChatBgProp('blur', 0);
      setChatBgProp('mode', 'cover');
      applyChatBg();
      saveData();
      showToast(isChatBgPerConv() ? '已恢复该会话默认背景' : '已恢复默认背景');
    });
  }
  
  // 背景浓度
  if (chatBgOpacity) {
    chatBgOpacity.addEventListener('input', function() {
      const val = parseInt(this.value);
      setChatBgProp('opacity', val);
      applyChatBg();
      if (chatBgOpacityVal) chatBgOpacityVal.textContent = val + '%';
    });
    chatBgOpacity.addEventListener('change', function() {
      saveData();
    });
  }
  
  // 背景模糊
  if (chatBgBlur) {
    chatBgBlur.addEventListener('input', function() {
      const val = parseInt(this.value);
      setChatBgProp('blur', val);
      applyChatBg();
      if (chatBgBlurVal) chatBgBlurVal.textContent = val + 'px';
    });
    chatBgBlur.addEventListener('change', function() {
      saveData();
    });
  }
  
  // 背景模式
  if (bgModeSelector) {
    bgModeSelector.addEventListener('click', function(e) {
      const modeBtn = e.target.closest('.bg-mode-btn');
      if (!modeBtn) return;
      const mode = modeBtn.dataset.mode;
      setChatBgProp('mode', mode);
      applyChatBg();
      saveData();
    });
  }
  
  // ===== 通话背景图上传 =====
  const callBgUploadArea = document.getElementById('callBgUploadArea');
  const callBgInput = document.getElementById('callBgInput');
  const resetCallBgBtn = document.getElementById('resetCallBgBtn');
  const callBgPresetsEl = document.getElementById('callBgPresets');
  const callBgOverlaySlider = document.getElementById('callBgOverlaySlider');
  const callBgOverlayVal = document.getElementById('callBgOverlayVal');
  
  if (callBgUploadArea && callBgInput) {
    callBgUploadArea.addEventListener('click', function() {
      callBgInput.click();
    });
    callBgInput.addEventListener('change', async function(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件');
        return;
      }
      try {
        const compressed = await compressImage(file, 800, 0.7);
        setCallBgProp('image', compressed);
        setCallBgProp('preset', 'none');
        applyCallBg();
        saveData();
        showToast('通话背景图设置成功');
      } catch (err) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          setCallBgProp('image', ev.target.result);
          setCallBgProp('preset', 'none');
          applyCallBg();
          saveData();
          showToast('通话背景图设置成功');
        };
        reader.readAsDataURL(file);
      }
      callBgInput.value = '';
    });
  }
  
  // 通话预设背景点击
  if (callBgPresetsEl) {
    callBgPresetsEl.addEventListener('click', function(e) {
      const presetItem = e.target.closest('.bg-preset-item');
      if (!presetItem) return;
      const preset = presetItem.dataset.preset;
      setCallBgProp('preset', preset);
      if (preset !== 'none' || !getEffectiveCallBg().image) {
        setCallBgProp('image', '');
      }
      applyCallBg();
      saveData();
    });
  }
  
  // 重置通话背景
  if (resetCallBgBtn) {
    resetCallBgBtn.addEventListener('click', function() {
      // 重置当前生效目标（会话级独立时仅重置该会话）
      setCallBgProp('image', '');
      setCallBgProp('preset', 'none');
      setCallBgProp('overlay', 45);
      applyCallBg();
      saveData();
      showToast(isCallBgPerConv() ? '已恢复该会话默认通话背景' : '已恢复默认通话背景');
    });
  }
  
  // 通话背景遮罩浓度
  if (callBgOverlaySlider) {
    callBgOverlaySlider.addEventListener('input', function() {
      const val = parseInt(this.value);
      setCallBgProp('overlay', val);
      applyCallBg();
      if (callBgOverlayVal) callBgOverlayVal.textContent = val + '%';
    });
    callBgOverlaySlider.addEventListener('change', function() {
      saveData();
    });
  }
  
  const msToggleInit = document.getElementById('multiSentenceToggle');
  if (msToggleInit) msToggleInit.classList.toggle('active', !!appData.settings.multiSentence);
  const qrToggleInit = document.getElementById('quoteReplyToggle');
  if (qrToggleInit) qrToggleInit.classList.toggle('active', !!appData.settings.quoteReply);
  document.getElementById('multiSentenceToggle').addEventListener('click', function() {
    appData.settings.multiSentence = !appData.settings.multiSentence;
    this.classList.toggle('active', appData.settings.multiSentence);
    saveData();
    showToast(appData.settings.multiSentence ? '已开启连句模式：多条回复合并为一条' : '已关闭连句模式');
  });
  const mssInput = document.getElementById('multiSentenceSeps');
  if (mssInput) {
    mssInput.value = appData.settings.multiSentenceSeps || '，。~！';
    mssInput.addEventListener('change', () => {
      appData.settings.multiSentenceSeps = mssInput.value || '，。~！';
      saveData();
    });
  }
  const ttInput = document.getElementById('typingTextInput');
  if (ttInput) {
    ttInput.value = appData.settings.typingText || '';
    ttInput.addEventListener('change', () => {
      appData.settings.typingText = ttInput.value.trim();
      saveData();
      showToast('正在输入文案已更新');
    });
  }
  const rncInput = document.getElementById('readNoReplyChance');
  if (rncInput) {
    rncInput.addEventListener('change', () => {
      if (!appData.currentChatId) { showToast('请先选择一个会话'); return; }
      const convSet = getConvSettings(appData.currentChatType, appData.currentChatId);
      let v = parseInt(rncInput.value);
      if (isNaN(v)) v = 50;
      v = Math.max(0, Math.min(100, v));
      convSet.readNoReplyChance = v;
      rncInput.value = v;
      saveData();
      showToast('已读不回概率：' + v + '%');
    });
  }
  document.getElementById('quoteReplyToggle').addEventListener('click', function() {
    appData.settings.quoteReply = !appData.settings.quoteReply;
    this.classList.toggle('active', appData.settings.quoteReply);
    saveData();
  });

  // ===== 消息显示设置（头像/名称/时间戳/已读） =====
  const smaToggle = document.getElementById('showMsgAvatarToggle');
  if (smaToggle) {
    smaToggle.classList.toggle('active', appData.settings.showMsgAvatar !== false);
    smaToggle.addEventListener('click', function() {
      appData.settings.showMsgAvatar = !appData.settings.showMsgAvatar;
      this.classList.toggle('active', appData.settings.showMsgAvatar);
      saveData();
      renderChatMessages();
    });
  }
  const msnToggle = document.getElementById('showMsgSenderNameToggle');
  if (msnToggle) {
    msnToggle.classList.toggle('active', appData.settings.showMsgSenderName !== false);
    msnToggle.addEventListener('click', function() {
      appData.settings.showMsgSenderName = !appData.settings.showMsgSenderName;
      this.classList.toggle('active', appData.settings.showMsgSenderName);
      saveData();
      renderChatMessages();
    });
  }
  const mtmSelect = document.getElementById('msgTimeModeSelect');
  if (mtmSelect) {
    mtmSelect.value = appData.settings.msgTimeMode || 'tap';
    mtmSelect.addEventListener('change', () => {
      appData.settings.msgTimeMode = mtmSelect.value;
      expandedTimeIdxs.clear();
      saveData();
      renderChatMessages();
    });
  }
  const srsToggle = document.getElementById('showReadStatusToggle');
  if (srsToggle) {
    srsToggle.classList.toggle('active', appData.settings.showReadStatus !== false);
    srsToggle.addEventListener('click', function() {
      appData.settings.showReadStatus = !appData.settings.showReadStatus;
      this.classList.toggle('active', appData.settings.showReadStatus);
      saveData();
      renderChatMessages();
    });
  }
  const rtInput = document.getElementById('readTextInput');
  if (rtInput) {
    rtInput.value = appData.settings.readText || '已读';
    rtInput.addEventListener('change', () => {
      appData.settings.readText = rtInput.value.trim() || '已读';
      saveData();
      renderChatMessages();
    });
  }
  const rnrtInput = document.getElementById('readNoReplyTextInput');
  if (rnrtInput) {
    rnrtInput.value = appData.settings.readNoReplyText || '已读，对方不想回';
    rnrtInput.addEventListener('change', () => {
      appData.settings.readNoReplyText = rnrtInput.value.trim() || '已读，对方不想回';
      saveData();
      renderChatMessages();
    });
  }
  // 自定义字体（CSS font-family + @import URL）
  const cffInput = document.getElementById('customFontFamilyInput');
  const cfuInput = document.getElementById('customFontUrlInput');
  const cfBtn = document.getElementById('applyCustomFontBtn');
  if (cffInput && cfuInput && cfBtn) {
    cffInput.value = appData.settings.customFontFamily || '';
    cfuInput.value = appData.settings.customFontUrl || '';
    cfBtn.addEventListener('click', () => {
      appData.settings.customFontFamily = cffInput.value.trim();
      appData.settings.customFontUrl = cfuInput.value.trim();
      saveData();
      applyCustomFont();
      showToast('字体已应用');
    });
  }
  
  // 已读不回（按联系人独立记录）
  document.getElementById('readNoReplyToggle').addEventListener('click', function() {
    if (!appData.currentChatId) {
      showToast('请先选择一个会话');
      return;
    }
    const convSet = getConvSettings(appData.currentChatType, appData.currentChatId);
    convSet.readNoReply = !convSet.readNoReply;
    this.classList.toggle('active', convSet.readNoReply);
    saveData();
    showToast(convSet.readNoReply ? '已开启：对方可能已读不回' : '已关闭：恢复正常回复');
  });
  
  // 定时主动消息（按会话独立配置）
  document.getElementById('timedMsgToggle').addEventListener('click', function() {
    if (!appData.currentChatId) {
      showToast('请先选择一个会话');
      return;
    }
    const convSet = getConvSettings(appData.currentChatType, appData.currentChatId);
    convSet.timedEnabled = !convSet.timedEnabled;
    appData.settings.timedMsgEnabled = convSet.timedEnabled;
    this.classList.toggle('active', convSet.timedEnabled);
    saveData();
    restartTimedMsgTimer();
    showToast(convSet.timedEnabled ? '定时消息已开启' : '定时消息已关闭');
  });
  
  // 定时间隔（1~180分钟）
  const timedIntervalInput = document.getElementById('timedMsgInterval');
  if (timedIntervalInput) {
    timedIntervalInput.addEventListener('change', function() {
      let val = parseInt(this.value) || 30;
      val = Math.max(1, Math.min(180, val));
      this.value = val;
      appData.settings.timedMsgInterval = val;
      if (appData.currentChatId) {
        const convSet = getConvSettings(appData.currentChatType, appData.currentChatId);
        convSet.timedInterval = val;
        restartTimedMsgTimer();
      }
      saveData();
    });
  }
  
  // 对方主动发问卷（按会话独立配置，时机完全随机）
  document.getElementById('surveyAutoToggle').addEventListener('click', function() {
    if (!appData.currentChatId) {
      showToast('请先选择一个会话');
      return;
    }
    const convSet = getConvSettings(appData.currentChatType, appData.currentChatId);
    convSet.surveyAutoEnabled = !convSet.surveyAutoEnabled;
    delete convSet.surveyAutoInterval; // 清理废弃的间隔配置
    this.classList.toggle('active', convSet.surveyAutoEnabled);
    saveData();
    restartSurveyAutoTimer();
    refreshConvSettingsUI();
    
    if (convSet.surveyAutoEnabled) {
      const libKey = getSurveyTemplateKey();
      const lib = (appData.surveyLibrary[libKey] || [])
        .filter(i => i.enabled !== false && (i.questions || []).length > 0);
      showToast(lib.length > 0 ? '已开启：对方会在随机时机主动发问卷' : '已开启：问卷库为空，入库后对方才会主动发');
    } else {
      showToast('已关闭对方主动发问卷');
    }
  });
  
  document.getElementById('autoCallToggle').addEventListener('click', function() {
    appData.settings.autoCall = !appData.settings.autoCall;
    this.classList.toggle('active', appData.settings.autoCall);
    saveData();
    if (appData.settings.autoCall) {
      scheduleAutoCall();
    }
  });
  
  document.getElementById('desktopNotifyToggle').addEventListener('click', function () {
    const el = this;
    if (appData.settings.desktopNotify) {
      appData.settings.desktopNotify = false;
      el.classList.remove('active');
      saveData();
      return;
    }
    requestNotificationPermission().then(function (granted) {
      appData.settings.desktopNotify = !!granted;
      el.classList.toggle('active', !!granted);
      saveData();
    });
  });
  
  // 初始回填开关状态
  document.getElementById('desktopNotifyToggle').classList.toggle('active', !!appData.settings.desktopNotify);

  // 到点自动静音
  const qtEl = document.getElementById('quietToggle');
  if (qtEl) {
    qtEl.classList.toggle('active', !!appData.settings.quietNotify);
    qtEl.addEventListener('click', function () {
      appData.settings.quietNotify = !appData.settings.quietNotify;
      this.classList.toggle('active', !!appData.settings.quietNotify);
      saveData();
    });
  }
  const qsEl = document.getElementById('quietStart');
  const qeEl = document.getElementById('quietEnd');
  if (qsEl) {
    qsEl.value = appData.settings.quietStart || '23:00';
    qsEl.addEventListener('change', function () { appData.settings.quietStart = this.value || '23:00'; saveData(); });
  }
  if (qeEl) {
    qeEl.value = appData.settings.quietEnd || '07:00';
    qeEl.addEventListener('change', function () { appData.settings.quietEnd = this.value || '07:00'; saveData(); });
  }

  document.getElementById('keepAliveToggle').addEventListener('click', function() {
    appData.settings.keepAlive = !appData.settings.keepAlive;
    this.classList.toggle('active', appData.settings.keepAlive);
    saveData();
  });

  // ===== 按会话独立设置开关（聊天背景 / 通话背景 / 词条库） =====
  const chatBgPerConvEl = document.getElementById('chatBgPerConvToggle');
  if (chatBgPerConvEl) chatBgPerConvEl.addEventListener('click', toggleChatBgPerConv);
  const callBgPerConvEl = document.getElementById('callBgPerConvToggle');
  if (callBgPerConvEl) callBgPerConvEl.addEventListener('click', toggleCallBgPerConv);
  const convWordsToggleEl = document.getElementById('convWordsToggle');
  if (convWordsToggleEl) convWordsToggleEl.addEventListener('click', toggleConvWordsIndependent);
  
  // 输入框设置
  ['replyDelayMin', 'replyDelayMax', 'replyCountMin', 'replyCountMax', 'wordsPerMessage',
   'letterDelayMin', 'letterDelayMax', 'letterWordCountMin', 'letterWordCountMax', 'statusInterval'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = appData.settings[id] || el.value;
      el.addEventListener('change', () => {
        appData.settings[id] = parseInt(el.value) || 1;
        saveData();
      });
    }
  });
}

// ==================== 模态弹窗系统 ====================
function showModal(title, bodyContent, footerContent = '', options = {}) {
  const container = document.getElementById('modalContainer');
  const modalId = 'modal_' + generateId();
  
  const modalHTML = `
    <div class="modal-overlay show" id="${modalId}" onclick="if(event.target===this)closeModal('${modalId}')">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <div class="close-btn" onclick="closeModal('${modalId}')"><i class="fas fa-times"></i></div>
        </div>
        <div class="modal-body">${bodyContent}</div>
        ${footerContent ? `<div class="modal-footer">${footerContent}</div>` : ''}
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', modalHTML);
  
  // ESC关闭
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal(modalId);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
  
  return modalId;
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
}

// ==================== 下拉菜单 ====================
document.addEventListener('click', (e) => {
  document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
    if (!menu.parentElement.contains(e.target)) {
      menu.classList.remove('show');
    }
  });
});

document.querySelectorAll('.dropdown').forEach(dropdown => {
  const btn = dropdown.querySelector('.add-btn, .action-btn');
  const menu = dropdown.querySelector('.dropdown-menu');
  if (btn && menu) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 关闭其他下拉菜单
      document.querySelectorAll('.dropdown-menu.show').forEach(m => {
        if (m !== menu) m.classList.remove('show');
      });
      menu.classList.toggle('show');
    });
  }
});

// ==================== 联系人模块 ====================
let newContactAvatarData = '';
let randomAvatarColors = [
  '#89b8e8', '#b8a8e0', '#86c9b4', '#d8b89c', '#e8a5b8',
  '#6ec2bc', '#8e9ce0', '#e8a880', '#f0a4b4', '#78c4a8'
];

function generateRandomAvatar(name) {
  const color = randomAvatarColors[Math.floor(Math.random() * randomAvatarColors.length)];
  const initial = getInitial(name || '新');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="${color}" rx="12"/>
    <text x="50" y="50" text-anchor="middle" dy=".35em" fill="#fff" font-size="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600">${initial}</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function openAddContactModal(contact = null) {
  const isEdit = !!contact;
  // 获取已有分组
  const groups = [...new Set(appData.contacts.map(c => c.group || '朋友'))];
  
  const body = `
    <div class="form-group">
      <label>头像</label>
      <div class="avatar-upload-row">
        <div id="newContactAvatarPreview" class="avatar avatar-lg">${contact?.avatar ? `<img src="${contact.avatar}">` : getInitial(contact?.name || '新')}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-secondary" onclick="document.getElementById('newContactAvatar').click()">
            <i class="fas fa-upload"></i> 上传
          </button>
          <button class="avatar-random-btn" onclick="randomContactAvatar()">
            <i class="fas fa-dice"></i> 随机
          </button>
        </div>
        <input type="file" id="newContactAvatar" accept="image/*" style="display:none;" onchange="handleNewContactAvatar(event)">
      </div>
    </div>
    <div class="form-group">
      <label>昵称 *</label>
      <input type="text" class="input" id="newContactName" value="${contact?.name || ''}" placeholder="请输入昵称" oninput="updateContactAvatarPreview()">
    </div>
    <div class="form-group">
      <label>状态签名</label>
      <input type="text" class="input" id="newContactStatus" value="${contact?.status || ''}" placeholder="个性签名">
    </div>
    <div class="form-group">
      <label>分组标签</label>
      <div class="group-select-wrapper" id="groupSelectWrapper">
        <input type="text" class="input" id="newContactGroup" value="${contact?.group || '朋友'}" placeholder="选择或输入分组" 
               onclick="toggleGroupDropdown()" oninput="filterGroupOptions()">
        <div class="select-dropdown" id="groupDropdown">
          ${groups.map(g => `<div class="select-option" onclick="selectGroupOption('${g}')">${g}</div>`).join('')}
        </div>
      </div>
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="saveContact(${isEdit ? `'${contact.id}'` : 'null'})">${isEdit ? '保存' : '添加'}</button>
  `;
  
  window.currentModalId = showModal(isEdit ? '编辑联系人' : '添加联系人', body, footer);
  newContactAvatarData = contact?.avatar || '';
}

function randomContactAvatar() {
  const name = document.getElementById('newContactName').value.trim();
  newContactAvatarData = generateRandomAvatar(name);
  document.getElementById('newContactAvatarPreview').innerHTML = `<img src="${newContactAvatarData}">`;
}

function updateContactAvatarPreview() {
  const name = document.getElementById('newContactName').value.trim();
  const preview = document.getElementById('newContactAvatarPreview');
  if (!newContactAvatarData && preview.querySelector('img') === null) {
    preview.textContent = getInitial(name || '新');
  }
}

function toggleGroupDropdown() {
  const dropdown = document.getElementById('groupDropdown');
  const willShow = !dropdown.classList.contains('show');
  dropdown.classList.toggle('show');
  event.stopPropagation();
  
  if (willShow) {
    // 添加全局点击关闭监听
    setTimeout(() => {
      document.addEventListener('click', closeGroupDropdownOnOutside);
    }, 0);
  }
}

function closeGroupDropdownOnOutside(e) {
  const wrapper = document.getElementById('groupSelectWrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeGroupDropdown();
  }
}

function closeGroupDropdown() {
  const dropdown = document.getElementById('groupDropdown');
  if (dropdown) dropdown.classList.remove('show');
  document.removeEventListener('click', closeGroupDropdownOnOutside);
}

function filterGroupOptions() {
  const input = document.getElementById('newContactGroup').value.toLowerCase();
  const dropdown = document.getElementById('groupDropdown');
  const options = dropdown.querySelectorAll('.select-option');
  let hasMatch = false;
  options.forEach(opt => {
    const match = opt.textContent.toLowerCase().includes(input);
    opt.style.display = match ? '' : 'none';
    if (match) hasMatch = true;
  });
  dropdown.classList.add('show');
}

function selectGroupOption(group) {
  document.getElementById('newContactGroup').value = group;
  closeGroupDropdown();
}

function handleNewContactAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    fileToBase64(file).then(base64 => {
      newContactAvatarData = base64;
      document.getElementById('newContactAvatarPreview').innerHTML = `<img src="${base64}">`;
    });
  }
}

function saveContact(contactId) {
  const name = document.getElementById('newContactName').value.trim();
  if (!name) {
    showToast('请输入昵称');
    return;
  }
  
  const status = document.getElementById('newContactStatus').value.trim();
  const group = document.getElementById('newContactGroup').value.trim() || '朋友';
  
  if (contactId) {
    // 编辑
    const contact = appData.contacts.find(c => c.id === contactId);
    if (contact) {
      contact.name = name;
      contact.status = status;
      contact.group = group;
      if (newContactAvatarData) contact.avatar = newContactAvatarData;
    }
  } else {
    // 新增
    const newContact = {
      id: generateId(),
      name,
      status: status || randomPick(appData.statusWords),
      group,
      avatar: newContactAvatarData || '',
      createdAt: Date.now()
    };
    appData.contacts.push(newContact);
    // 初始化聊天记录
    appData.chatRecords['contact_' + newContact.id] = [];
  }
  
  newContactAvatarData = '';
  saveData();
  closeModal(window.currentModalId);
  renderConversations();
  renderContacts();
  showToast(contactId ? '已保存' : '添加成功');
}

function deleteContact(contactId) {
  if (!confirm('确定删除该联系人吗？聊天记录也会被删除。')) return;
  
  appData.contacts = appData.contacts.filter(c => c.id !== contactId);
  delete appData.chatRecords['contact_' + contactId];
  delete appData.convSettings['contact_' + contactId];
  delete appData.unreadMap['contact_' + contactId];
  delete appData.surveyTemplates['contact_' + contactId];
  delete appData.surveyLibrary['contact_' + contactId];
  delete appData.mySurveyLibrary['contact_' + contactId];
  if (appData.currentChatId === contactId && appData.currentChatType === 'contact') {
    stopSurveyAutoTimer();
  }
  
  // 从群聊中移除
  appData.groups.forEach(g => {
    g.memberIds = g.memberIds.filter(id => id !== contactId);
  });
  
  if (appData.currentChatId === contactId && appData.currentChatType === 'contact') {
    appData.currentChatId = null;
    appData.currentChatType = null;
    renderChatMessages();
  }
  
  saveData();
  renderConversations();
  renderContacts();
  showToast('已删除');
}

function viewContactInfo() {
  if (!appData.currentChatId || appData.currentChatType !== 'contact') return;
  
  const contact = appData.contacts.find(c => c.id === appData.currentChatId);
  if (!contact) return;
  
  const body = `
    <div style="text-align:center;margin-bottom:14px;">
      ${getAvatarHTML(contact.avatar, contact.name, 'lg')}
      <div style="font-size:18px;font-weight:500;margin-top:10px;">${contact.name}</div>
      <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${contact.status || '暂无签名'}</div>
      <div style="font-size:12px;color:var(--text-tertiary);margin-top:4px;">分组：${contact.group} · 钱包 ¥${fmtMoney(getContactWallet(contact.id))}</div>
    </div>
    <div class="profile-quick-row">
      <div class="profile-quick-btn" onclick="closeModal(currentModalId);momentsFilter='${contact.id}';syncMomentsFilterBtn();switchPage('moments')"><i class="fas fa-camera"></i>朋友圈</div>
      <div class="profile-quick-btn" onclick="closeModal(currentModalId);switchPage('settings');openPanelById('notesCollapsible');switchNotesTab('notes')"><i class="fas fa-pen-nib"></i>记事本</div>
      <div class="profile-quick-btn" onclick="closeModal(currentModalId);switchPage('settings');openPanelById('notesCollapsible');switchNotesTab('todos')"><i class="fas fa-list-check"></i>待办</div>
      <div class="profile-quick-btn" onclick="openContactWalletModal('${contact.id}')"><i class="fas fa-wallet"></i>钱包</div>
    </div>
    <div class="ring-set-row"><label>来电铃声</label>
      <select onchange="setContactRingtone('${contact.id}','ringtoneCall',this.value)">
        <option value="" ${!contact.ringtoneCall ? 'selected' : ''}>跟随全局</option>
        ${getRingtoneOptionsHtml(contact.ringtoneCall)}
      </select>
    </div>
    <div class="ring-set-row"><label>消息提示音</label>
      <select onchange="setContactRingtone('${contact.id}','ringtoneMsg',this.value)">
        <option value="" ${!contact.ringtoneMsg ? 'selected' : ''}>跟随全局</option>
        ${getRingtoneOptionsHtml(contact.ringtoneMsg)}
      </select>
    </div>
    <div class="ring-set-row" style="border-bottom:1px solid var(--border-color);padding-bottom:12px;">
      <label>私聊免打扰</label>
      <div class="toggle ${contact.msgDnd ? 'active' : ''}" style="margin-left:auto;" onclick="toggleContactMsgDnd('${contact.id}')"></div>
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>
    <button class="btn btn-primary" onclick="closeModal(currentModalId);openAddContactModal(appData.contacts.find(c=>c.id==='${contact.id}'))">编辑</button>
  `;
  
  window.currentModalId = showModal('联系人资料', body, footer);
}

// ==================== 群聊模块 ====================
let groupMemberSearchKeyword = '';
let groupMemberFilterGroup = 'all';
let newGroupAvatarData = '';
let groupSelectedMemberIds = [];

function openCreateGroupModal(group = null) {
  const isEdit = !!group;
  const groups = [...new Set(appData.contacts.map(c => c.group || '朋友'))];
  groupSelectedMemberIds = group?.memberIds ? [...group.memberIds] : [];
  groupMemberSearchKeyword = '';
  groupMemberFilterGroup = 'all';
  
  const body = `
    <div class="form-group">
      <label>群名称 *</label>
      <input type="text" class="input" id="newGroupName" value="${group?.name || ''}" placeholder="请输入群名称">
    </div>
    <div class="form-group">
      <label>群头像</label>
      <div class="avatar-upload-row">
        <div id="newGroupAvatarPreview" class="avatar avatar-lg">${group?.avatar ? `<img src="${group.avatar}">` : '群'}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-secondary" onclick="document.getElementById('newGroupAvatar').click()">
            <i class="fas fa-upload"></i> 上传
          </button>
          <button class="avatar-random-btn" onclick="generateGroupAvatar()">
            <i class="fas fa-magic"></i> 生成
          </button>
        </div>
        <input type="file" id="newGroupAvatar" accept="image/*" style="display:none;" onchange="handleNewGroupAvatar(event)">
      </div>
    </div>
    <div class="form-group">
      <label>群成员</label>
      
      <!-- 已选成员栏 -->
      <div class="member-selected-bar" id="memberSelectedBar" style="display:none;">
        <div class="member-selected-avatars" id="selectedAvatars"></div>
        <span class="member-selected-count">已选 <span id="selectedCount">0</span> 人</span>
      </div>
      
      <!-- 工具栏：搜索 + 操作按钮 -->
      <div class="group-member-toolbar">
        <div class="search-box" style="margin:0;">
          <i class="fas fa-search"></i>
          <input type="text" id="memberSearchInput" placeholder="搜索联系人" oninput="filterGroupMembers()">
        </div>
        <div class="action-btns">
          <button onclick="selectAllMembers()">全选</button>
          <button onclick="invertMembers()">反选</button>
          <button onclick="clearMembers()">清空</button>
        </div>
      </div>
      
      <!-- 分组筛选 -->
      ${groups.length > 1 ? `
      <div class="group-filter-tabs" id="groupFilterTabs">
        <div class="group-filter-tab active" data-group="all" onclick="filterCreateGroupByGroup('all')">全部</div>
        ${groups.map(g => `<div class="group-filter-tab" data-group="${g}" onclick="filterCreateGroupByGroup('${g}')">${g}</div>`).join('')}
      </div>
      ` : ''}
      
      <div class="member-selector" id="memberSelector">
        ${renderMemberCheckboxes()}
      </div>
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="saveGroup(${isEdit ? `'${group.id}'` : 'null'})">${isEdit ? '保存' : '创建'}</button>
  `;
  
  window.currentModalId = showModal(isEdit ? '管理群聊' : '创建群聊', body, footer);
  newGroupAvatarData = group?.avatar || '';
  
  // 初始化已选状态
  setTimeout(() => {
    updateSelectedMembersBar();
  }, 10);
}

function renderMemberCheckboxes() {
  if (appData.contacts.length === 0) {
    return '<div class="member-empty-tip">暂无联系人，请先添加联系人</div>';
  }
  
  const keyword = groupMemberSearchKeyword.toLowerCase();
  const filterGroup = groupMemberFilterGroup;
  
  const filtered = appData.contacts.filter(c => {
    const matchKeyword = c.name.toLowerCase().includes(keyword);
    const matchGroup = filterGroup === 'all' || (c.group || '朋友') === filterGroup;
    return matchKeyword && matchGroup;
  });
  
  if (filtered.length === 0) {
    return '<div class="member-empty-tip">没有匹配的联系人</div>';
  }
  
  return filtered.map(c => `
    <label class="member-checkbox">
      <input type="checkbox" value="${c.id}" ${groupSelectedMemberIds.includes(c.id) ? 'checked' : ''} onchange="toggleMemberSelection('${c.id}')">
      ${getAvatarHTML(c.avatar, c.name, 'sm')}
      <span>${c.name}</span>
    </label>
  `).join('');
}

function toggleMemberSelection(id) {
  const idx = groupSelectedMemberIds.indexOf(id);
  if (idx > -1) {
    groupSelectedMemberIds.splice(idx, 1);
  } else {
    groupSelectedMemberIds.push(id);
  }
  updateSelectedMembersBar();
}

function filterGroupMembers() {
  groupMemberSearchKeyword = document.getElementById('memberSearchInput').value;
  document.getElementById('memberSelector').innerHTML = renderMemberCheckboxes();
}

function filterCreateGroupByGroup(group) {
  groupMemberFilterGroup = group;
  document.querySelectorAll('#groupFilterTabs .group-filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.group === group);
  });
  document.getElementById('memberSelector').innerHTML = renderMemberCheckboxes();
}

function selectAllMembers() {
  const keyword = groupMemberSearchKeyword.toLowerCase();
  const filterGroup = groupMemberFilterGroup;
  
  const filtered = appData.contacts.filter(c => {
    const matchKeyword = c.name.toLowerCase().includes(keyword);
    const matchGroup = filterGroup === 'all' || (c.group || '朋友') === filterGroup;
    return matchKeyword && matchGroup;
  });
  
  filtered.forEach(c => {
    if (!groupSelectedMemberIds.includes(c.id)) {
      groupSelectedMemberIds.push(c.id);
    }
  });
  
  document.getElementById('memberSelector').innerHTML = renderMemberCheckboxes();
  updateSelectedMembersBar();
}

function invertMembers() {
  const keyword = groupMemberSearchKeyword.toLowerCase();
  const filterGroup = groupMemberFilterGroup;
  
  const filteredIds = appData.contacts
    .filter(c => {
      const matchKeyword = c.name.toLowerCase().includes(keyword);
      const matchGroup = filterGroup === 'all' || (c.group || '朋友') === filterGroup;
      return matchKeyword && matchGroup;
    })
    .map(c => c.id);
  
  filteredIds.forEach(id => {
    const idx = groupSelectedMemberIds.indexOf(id);
    if (idx > -1) {
      groupSelectedMemberIds.splice(idx, 1);
    } else {
      groupSelectedMemberIds.push(id);
    }
  });
  
  document.getElementById('memberSelector').innerHTML = renderMemberCheckboxes();
  updateSelectedMembersBar();
}

function clearMembers() {
  groupSelectedMemberIds = [];
  document.getElementById('memberSelector').innerHTML = renderMemberCheckboxes();
  updateSelectedMembersBar();
}

function updateSelectedMembersBar() {
  const bar = document.getElementById('memberSelectedBar');
  const countEl = document.getElementById('selectedCount');
  const avatarsEl = document.getElementById('selectedAvatars');
  
  if (!bar) return;
  
  const count = groupSelectedMemberIds.length;
  if (countEl) countEl.textContent = count;
  
  if (count > 0) {
    bar.style.display = 'flex';
    // 显示前5个头像
    const displayContacts = appData.contacts.filter(c => groupSelectedMemberIds.includes(c.id)).slice(0, 5);
    const extra = count - 5;
    avatarsEl.innerHTML = displayContacts.map(c => getAvatarHTML(c.avatar, c.name, 'xs')).join('') +
      (extra > 0 ? `<div class="avatar avatar-xs" style="background:var(--bg-tertiary);color:var(--text-tertiary);font-size:10px;">+${extra}</div>` : '');
  } else {
    bar.style.display = 'none';
  }
}

function generateGroupAvatar() {
  const name = document.getElementById('newGroupName').value.trim() || '群';
  const color = randomAvatarColors[Math.floor(Math.random() * randomAvatarColors.length)];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="${color}" rx="12"/>
    <text x="50" y="50" text-anchor="middle" dy=".35em" fill="#fff" font-size="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600">${name.charAt(0)}</text>
  </svg>`;
  newGroupAvatarData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  document.getElementById('newGroupAvatarPreview').innerHTML = `<img src="${newGroupAvatarData}">`;
}

function handleNewGroupAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    fileToBase64(file).then(base64 => {
      newGroupAvatarData = base64;
      document.getElementById('newGroupAvatarPreview').innerHTML = `<img src="${base64}">`;
    });
  }
}

function saveGroup(groupId) {
  const name = document.getElementById('newGroupName').value.trim();
  if (!name) {
    showToast('请输入群名称');
    return;
  }
  
  const memberIds = groupSelectedMemberIds;
  if (memberIds.length < 2) {
    showToast('请至少选择2位成员');
    return;
  }
  
  if (groupId) {
    const group = appData.groups.find(g => g.id === groupId);
    if (group) {
      group.name = name;
      group.memberIds = memberIds;
      if (newGroupAvatarData) group.avatar = newGroupAvatarData;
    }
  } else {
    const newGroup = {
      id: generateId(),
      name,
      memberIds,
      avatar: newGroupAvatarData || '',
      createdAt: Date.now()
    };
    appData.groups.push(newGroup);
    appData.chatRecords['group_' + newGroup.id] = [];
  }
  
  newGroupAvatarData = '';
  groupSelectedMemberIds = [];
  saveData();
  closeModal(window.currentModalId);
  renderConversations();
  renderContacts();
  showToast(groupId ? '已保存' : '创建成功');
}

function deleteGroup(groupId) {
  if (!confirm('确定解散该群聊吗？聊天记录也会被删除。')) return;
  
  appData.groups = appData.groups.filter(g => g.id !== groupId);
  delete appData.chatRecords['group_' + groupId];
  delete appData.convSettings['group_' + groupId];
  delete appData.unreadMap['group_' + groupId];
  delete appData.surveyTemplates['group_' + groupId];
  delete appData.surveyLibrary['group_' + groupId];
  delete appData.mySurveyLibrary['group_' + groupId];
  stopTimedMsgTimer();
  stopSurveyAutoTimer();
  
  if (appData.currentChatId === groupId && appData.currentChatType === 'group') {
    appData.currentChatId = null;
    appData.currentChatType = null;
    renderChatMessages();
  }
  
  saveData();
  renderConversations();
  renderContacts();
  showToast('群聊已解散');
}

// ==================== 会话列表 ====================
function getConversations() {
  const conversations = [];
  
  // 联系人会话
  appData.contacts.forEach(contact => {
    const key = 'contact_' + contact.id;
    const records = appData.chatRecords[key] || [];
    const lastMsg = records[records.length - 1];
    const conv = {
      id: contact.id,
      type: 'contact',
      key,
      name: contact.name,
      avatar: contact.avatar,
      lastTime: lastMsg ? lastMsg.time : contact.createdAt,
      unread: appData.unreadMap[key] || 0,
      lastMsg: lastMsg || null,
      pinned: !!appData.pinnedConversations[key]
    };
    conv.preview = formatConvPreview(conv, lastMsg);
    conversations.push(conv);
  });
  
  // 群聊会话
  appData.groups.forEach(group => {
    const key = 'group_' + group.id;
    const records = appData.chatRecords[key] || [];
    const lastMsg = records[records.length - 1];
    const conv = {
      id: group.id,
      type: 'group',
      key,
      name: group.name,
      avatar: group.avatar,
      isGroup: true,
      groupData: group,
      memberCount: group.memberIds.length,
      lastTime: lastMsg ? lastMsg.time : group.createdAt,
      unread: appData.unreadMap[key] || 0,
      lastMsg: lastMsg || null,
      pinned: !!appData.pinnedConversations[key]
    };
    conv.preview = formatConvPreview(conv, lastMsg);
    conversations.push(conv);
  });
  
  // 置顶优先，同组内按最后消息时间排序
  conversations.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.lastTime - a.lastTime;
  });
  
  return conversations;
}

function formatLastMsg(msg) {
  if (msg.type === 'image') return msg.isEmoji ? '[表情包]' : '[图片]';
  if (msg.type === 'transfer') return `[转账] ¥${fmtMoney(msg.amount)}`;
  if (msg.type === 'poke') return '[戳一戳]';
  if (msg.type === 'survey') {
    const title = (msg.survey && msg.survey.title) ? msg.survey.title : '问卷';
    const short = title.length > 8 ? title.substring(0, 8) + '…' : title;
    return `[问卷] ${short}`;
  }
  if (msg.type === 'call') {
    const short = (msg.content || '通话').length > 14 ? (msg.content || '').substring(0, 14) + '…' : msg.content;
    return `[通话] ${short}`;
  }
  if (msg.content && msg.content.length > 20) {
    return msg.content.substring(0, 20) + '...';
  }
  return msg.content || '';
}

// 会话列表消息预览：带上发送者标识（我: / 群内成员名: ）
function formatConvPreview(conv, lastMsg) {
  if (!lastMsg) return '暂无消息';
  const base = formatLastMsg(lastMsg);
  if (isSelf(lastMsg.sender)) return `我: ${base}`;
  if (conv.isGroup && lastMsg.type !== 'poke') {
    const member = appData.contacts.find(c => c.id === lastMsg.sender);
    const name = member ? member.name : '';
    if (name) {
      const shortName = name.length > 6 ? name.substring(0, 6) + '…' : name;
      return `${shortName}: ${base}`;
    }
  }
  return base;
}

function renderConversations() {
  const list = document.getElementById('conversationList');
  const conversations = getConversations();
  const searchTerm = document.getElementById('convSearch')?.value?.toLowerCase() || '';
  
  // 会话搜索：同时匹配名称与历史消息内容
  let filtered = conversations;
  if (searchTerm) {
    filtered = conversations.filter(c => {
      if (c.name.toLowerCase().includes(searchTerm)) return true;
      const records = appData.chatRecords[c.key] || [];
      return records.some(m => (m.content || '').toLowerCase().includes(searchTerm));
    });
  }
  
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comment-slash"></i>
        <p>${searchTerm ? '没有匹配的会话' : '暂无会话'}</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = filtered.map(conv => `
    <div class="conversation-item ${appData.currentChatId === conv.id && appData.currentChatType === conv.type ? 'active' : ''} ${conv.pinned ? 'pinned' : ''}" 
         data-conv-key="${conv.key}"
         onclick="selectConversation('${conv.id}', '${conv.type}')">
      <div class="conv-avatar-wrap">
        ${conv.isGroup ? getGroupAvatarHTML(conv.groupData) : getAvatarHTML(conv.avatar, conv.name)}
        ${conv.pinned ? '<div class="pin-badge" title="已置顶"><i class="fas fa-thumbtack"></i></div>' : ''}
      </div>
      <div class="conv-info">
        <div class="conv-name">
          <span class="conv-name-text">${conv.name}</span>
          ${conv.isGroup ? `<span class="conv-member-count"><i class="fas fa-user-friends"></i> ${conv.memberCount}</span>` : ''}
        </div>
        <div class="conv-msg">${conv.preview}</div>
      </div>
      <div class="conv-side">
        <div class="conv-time">${formatTime(conv.lastTime)}</div>
        ${conv.unread > 0 ? `<div class="badge">${conv.unread}</div>` : ''}
        <div class="conv-more-btn" onclick="openConvMenu(event, '${conv.key}')" title="会话操作"><i class="fas fa-ellipsis-h"></i></div>
      </div>
    </div>
  `).join('');
}

// 会话操作菜单（置顶/取消置顶）
function openConvMenu(event, key) {
  event.stopPropagation();
  const isPinned = !!appData.pinnedConversations[key];
  const unread = appData.unreadMap[key] || 0;
  window.__convMenuKey = key;
  
  const menu = document.getElementById('convContextMenu');
  const btn = event.currentTarget;
  const rect = btn.getBoundingClientRect();
  
  menu.innerHTML = `
    <div class="conv-menu-item" onclick="toggleConvPin('${key}')">
      <i class="fas fa-thumbtack"></i> ${isPinned ? '取消置顶' : '置顶该会话'}
    </div>
    ${unread > 0 ? `
    <div class="conv-menu-item" onclick="markConvRead('${key}')">
      <i class="fas fa-check-double"></i> 标记已读（${unread > 99 ? '99+' : unread}）
    </div>` : ''}
    <div class="conv-menu-item" onclick="toggleConvDnd('${key}')">
      <i class="fas fa-bell-slash"></i> ${isConvDnd(key) ? '取消免打扰' : '消息免打扰'}
    </div>
    <div class="conv-menu-item" onclick="clearConvHistoryByKey('${key}')">
      <i class="fas fa-eraser"></i> 清空聊天记录
    </div>
  `;
  menu.classList.add('show');
  
  // 定位到按钮下方，限制在可视区域内
  const menuH = menu.offsetHeight || 44;
  let top = rect.bottom + 6;
  if (top + menuH > window.innerHeight - 10) top = rect.top - menuH - 6;
  let left = rect.left - 8;
  if (left < 10) left = 10;
  menu.style.top = top + 'px';
  menu.style.left = Math.min(left, window.innerWidth - 10 - menu.offsetWidth) + 'px';
}

function closeConvMenu() {
  const menu = document.getElementById('convContextMenu');
  if (menu) menu.classList.remove('show');
}

function toggleConvPin(key) {
  if (appData.pinnedConversations[key]) {
    delete appData.pinnedConversations[key];
    showToast('已取消置顶');
  } else {
    appData.pinnedConversations[key] = true;
    showToast('已置顶该会话');
  }
  saveData();
  closeConvMenu();
  renderConversations();
}

// 标记会话为已读（清除未读角标）
function markConvRead(key) {
  if (appData.unreadMap[key]) {
    delete appData.unreadMap[key];
    saveData();
    showToast('已标记为已读');
  }
  closeConvMenu();
  renderConversations();
}

// 按会话键清空聊天记录（从会话菜单触发，支持非当前会话）
function clearConvHistoryByKey(key) {
  const records = appData.chatRecords[key] || [];
  if (records.length === 0) {
    showToast('该会话暂无聊天记录');
    closeConvMenu();
    return;
  }
  window.__clearConvKey = key;
  closeConvMenu();
  const body = `<p style="color:var(--text-secondary);line-height:1.7;">确定要清空该会话的 <strong>${records.length}</strong> 条聊天记录吗？此操作不可恢复。</p>`;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-danger" onclick="closeModal(currentModalId);confirmClearConvByKey()">清空</button>
  `;
  window.currentModalId = showModal('清空聊天记录', body, footer);
}

function confirmClearConvByKey() {
  const key = window.__clearConvKey;
  if (!key) return;
  delete appData.chatRecords[key];
  if (appData.unreadMap[key]) delete appData.unreadMap[key];
  saveData();
  // 若清空的是当前会话，刷新消息区
  const viewingKey = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  if (viewingKey === key) {
    renderChatMessages();
  }
  renderConversations();
  showToast('聊天记录已清空');
}

// 点击其他区域关闭会话菜单
document.addEventListener('click', (e) => {
  const menu = document.getElementById('convContextMenu');
  if (menu && menu.classList.contains('show') && !e.target.closest('#convContextMenu') && !e.target.closest('.conv-more-btn')) {
    closeConvMenu();
  }
});

function selectConversation(id, type) {
  // 切换前保存旧会话输入草稿
  saveCurrentDraft();
  appData.currentChatId = id;
  appData.currentChatType = type;
  
  const chatTitle = document.getElementById('chatTitle');
  const chatInputArea = document.getElementById('chatInputArea');
  
  if (type === 'contact') {
    const contact = appData.contacts.find(c => c.id === id);
    chatTitle.textContent = contact ? contact.name : '';
  } else {
    const group = appData.groups.find(g => g.id === id);
    chatTitle.textContent = group ? group.name : '';
  }
  chatTitle.removeAttribute('title');

  chatInputArea.style.display = 'flex';
  
  // 清除该会话未读标记
  const key = (type === 'group' ? 'group_' : 'contact_') + id;
  if (appData.unreadMap[key]) {
    delete appData.unreadMap[key];
    saveData();
  }
  
  // 清空待引用状态
  clearPendingQuote(true);

  // 切换会话：重置新消息角标与滚动状态
  newMsgsWhileAway = 0;
  userScrolledUp = false;
  const badgeReset = document.getElementById('newMsgBadge');
  if (badgeReset) badgeReset.style.display = 'none';

  renderConversations();
  renderChatMessages();

  // 切换会话：应用该会话的独立聊天背景
  applyChatBg();
  // 刷新词条库显示（独立词库按会话切换）
  renderWordCategories();
  renderWordList();
  // 刷新"按会话独立"三个开关状态
  refreshPerConvUI();
  
  // 重建当前会话的定时消息计时器（切换联系人时重置）
  restartTimedMsgTimer();
  // 重建当前会话的对方主动发问卷计时器
  restartSurveyAutoTimer();
  // 刷新设置面板中"当前会话"相关配置显示
  refreshConvSettingsUI();
  // 加载当前会话的问卷模板
  loadSurveyTemplate();
  
  // 恢复新会话输入草稿
  restoreCurrentDraft();
  
  // 移动端隐藏侧边栏
  if (window.innerWidth <= 640) {
    document.getElementById('conversationSidebar').classList.remove('show');
  }
}

// 搜索
document.getElementById('convSearch').addEventListener('input', renderConversations);

// 移动端返回按钮
document.getElementById('chatBackBtn').addEventListener('click', () => {
  document.getElementById('conversationSidebar').classList.add('show');
});

// 滚动监听：更新"回到底部"按钮显隐
document.getElementById('chatMessages').addEventListener('scroll', () => {
  updateScrollBottomUI(document.getElementById('chatMessages'));
});

// ==================== 聊天消息 ====================
// 追踪"正在上滑浏览历史"状态与新消息计数
let newMsgsWhileAway = 0;
let userScrolledUp = false;

function isScrolledAway(container) {
  return container.scrollHeight - container.scrollTop - container.clientHeight > 200;
}

// 更新"回到底部"按钮显隐与新消息角标
function updateScrollBottomUI(container) {
  const btn = document.getElementById('scrollBottomBtn');
  const badge = document.getElementById('newMsgBadge');
  if (!btn || !container) return;
  const away = isScrolledAway(container);
  userScrolledUp = away;
  btn.classList.toggle('show', away);
  if (!away) {
    newMsgsWhileAway = 0;
    if (badge) {
      badge.style.display = 'none';
      badge.textContent = '0';
    }
  }
}

// 平滑滚动到底部（点击浮动按钮时）
function scrollToBottomSmooth() {
  const container = document.getElementById('chatMessages');
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}

// 点击消息展开的时间戳状态（按会话隔离，不持久化）
let expandedTimeIdxs = new Set();
let expandedTimeKey = '';

function renderChatMessages() {
  const container = document.getElementById('chatMessages');
  
  if (!appData.currentChatId) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comments"></i>
        <p>选择一个联系人开始聊天</p>
      </div>
    `;
    container.__msgCount = 0;
    updateScrollBottomUI(container);
    return;
  }
  
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const messages = appData.chatRecords[key] || [];

  // 点击显示的时间戳按会话隔离，切换会话后清空展开状态
  if (expandedTimeKey !== key) { expandedTimeIdxs.clear(); expandedTimeKey = key; }

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comment"></i>
        <p>还没有消息，开始聊天吧</p>
      </div>
    `;
    container.__msgCount = 0;
    updateScrollBottomUI(container);
    return;
  }
  
  // 记录渲染前的滚动状态：用户上滑浏览历史时，新消息不强制拉到底部
  const prevMsgCount = container.__msgCount || 0;
  const wasAway = userScrolledUp && isScrolledAway(container);
  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
  
  let html = '';
  let lastTime = 0;
  let lastDateStr = '';
  let lastMyMsgIdx = -1;
  
  // 找到最后一条当前视角"自己"消息的索引（用于显示已读状态）
  const selfId = getSelfId();
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === selfId) { lastMyMsgIdx = i; break; }
  }
  
  messages.forEach((msg, idx) => {
    // 跨天时显示日期分割线（今天/昨天/星期/具体日期）
    const msgDate = new Date(msg.time);
    const dateStr = msgDate.getFullYear() + '-' + (msgDate.getMonth() + 1) + '-' + msgDate.getDate();
    if (dateStr !== lastDateStr) {
      html += `<div class="msg-date-divider"><span>${formatDateDivider(msg.time)}</span></div>`;
      lastDateStr = dateStr;
    }
    // 同一天内间隔超过30分钟补时间提示（仅"自动显示"模式）
    if ((appData.settings.msgTimeMode || 'tap') === 'auto' && msg.time - lastTime > 30 * 60 * 1000) {
      html += `<div class="msg-time">${formatFullTime(msg.time).split(' ')[1]}</div>`;
    }
    lastTime = msg.time;
    
    const isMine = isSelf(msg.sender);
    
    if (msg.type === 'poke') {
      html += `<div class="poke-msg">${msg.content}</div>`;
      return;
    }
    
    // 已撤回消息：显示系统提示
    if (msg.recalled) {
      const who = isSelf(msg.sender)
        ? '你'
        : (appData.contacts.find(c => c.id === msg.sender)?.name || '对方');
      html += `<div class="recall-msg"><i class="fas fa-ban"></i> ${who}撤回了一条消息</div>`;
      return;
    }
    
    let senderName = '';
    if (appData.currentChatType === 'group' && !isMine && appData.settings.showMsgSenderName !== false) {
      const contact = appData.contacts.find(c => c.id === msg.sender);
      senderName = contact ? contact.name : '未知';
    }
    
    const selCls = multiSelectMode && selectedMsgIdxs.has(idx) ? ' selected' : '';
    const selClick = multiSelectMode ? ` onclick="toggleMsgSelect(${idx})"` : '';
    html += `
      <div class="msg-row ${isMine ? 'mine' : 'other'}${multiSelectMode ? ' selectable' : ''}${selCls}" data-msg-index="${idx}"${selClick}>
        ${getSenderAvatar(msg)}
        <div class="msg-content">
          ${senderName ? `<div class="msg-sender">${senderName}</div>` : ''}
          ${msg.quote ? renderQuoteBubble(msg.quote) : ''}
          ${renderMessageBubble(msg, idx)}
          ${msg.forwarded ? `<div class="msg-read-status"><i class="fas fa-share"></i> 转发</div>` : ''}
          ${isMine && idx === lastMyMsgIdx && msg.readStatus && appData.settings.showReadStatus !== false ? 
            `<div class="msg-read-status ${msg.readStatus}">${msg.readStatus === 'read-noreply' ? escapeHtml(appData.settings.readNoReplyText || '已读，对方不想回') : escapeHtml(appData.settings.readText || '已读')}</div>` : ''}
          ${expandedTimeIdxs.has(idx) ? `<div class="msg-tap-time">${formatFullTime(msg.time)}</div>` : ''}
          ${msg.reactions && msg.reactions.length > 0 ? renderMsgReactions(msg.reactions, idx) : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  container.__msgCount = messages.length;

  // 多选模式：在消息区顶部显示操作条
  const oldBar = document.getElementById('msgSelectBar');
  if (oldBar) oldBar.remove();
  if (multiSelectMode) {
    const bar = document.createElement('div');
    bar.className = 'msg-select-bar';
    bar.id = 'msgSelectBar';
    bar.innerHTML = `
      <span><i class="fas fa-check-double"></i> 已选 ${selectedMsgIdxs.size} 条</span>
      <span style="flex:1;"></span>
      <button style="background:rgba(255,255,255,.2);color:#fff;" onclick="exitMultiSelectMode()">取消</button>
      <button style="background:rgba(255,80,80,.9);color:#fff;" onclick="confirmMultiDelete()"><i class="fas fa-trash"></i> 删除</button>
      <button style="background:#fff;color:var(--primary);" onclick="confirmMultiForward()">转发</button>
    `;
    container.parentNode.insertBefore(bar, container);
  }

  if (wasAway && messages.length > prevMsgCount) {
    // 用户正在浏览历史：保持视口位置，累计新消息数并显示角标
    newMsgsWhileAway += messages.length - prevMsgCount;
    const badge = document.getElementById('newMsgBadge');
    if (badge) {
      badge.textContent = newMsgsWhileAway > 99 ? '99+' : newMsgsWhileAway;
      badge.style.display = '';
    }
    // 补偿新增内容高度，让视口停留在原本浏览的位置
    container.scrollTop = container.scrollHeight - container.clientHeight - distanceFromBottom;
  } else {
    container.scrollTop = container.scrollHeight;
  }
  updateScrollBottomUI(container);
}
function getSenderAvatar(msg) {
  if (appData.settings.showMsgAvatar === false) return '';
  if (isSelf(msg.sender)) {
    return getAvatarHTML(getSelfAvatar(), getSelfName());
  }
  const contact = appData.contacts.find(c => c.id === msg.sender);
  if (contact) return getAvatarHTML(contact.avatar, contact.name);
  return '<div class="avatar">?</div>';
}

function renderQuoteBubble(quote, level = 0) {
  const sender = isSelf(quote.sender) ? getSelfName() :
    (appData.contacts.find(c => c.id === quote.sender)?.name || '');
  const content = quote.type === 'image' ? '[图片]' :
    (quote.type === 'survey' ? '[问卷]' :
    (quote.content?.substring(0, 30) || ''));
  const nested = (level < 1 && quote.quote) ? renderQuoteBubble(quote.quote, level + 1) : '';
  return `<div class="bubble quote">${nested}<strong>${sender}：</strong>${content}</div>`;
}

function renderMessageBubble(msg, idx) {
  if (msg.type === 'image') {
    // 判断是否为表情包（来自表情库的base64小图，无气泡背景直接展示）
    const isEmoji = !!msg.isEmoji;
    return `<div class="bubble ${isEmoji ? 'emoji-msg' : ''}"><img class="msg-img" src="${msg.content}" onclick="openImagePreview('${msg.content}')" alt="表情包"></div>`;
  }
  if (msg.type === 'call') {
    return `<div class="bubble"><i class="fas fa-phone"></i> ${msg.content}</div>`;
  }
  if (msg.type === 'survey') {
    return renderSurveyBubble(msg);
  }
  if (msg.type === 'redpacket') {
    return renderRedPacketBubble(msg.rpId);
  }
  if (msg.type === 'transfer') {
    return renderTransferBubble(msg);
  }
  if (msg.type === 'moments_share') {
    return renderMomentsShareBubble(msg);
  }
  return `<div class="bubble">${escapeHtml(msg.content)}</div>`;
}

// ==================== 问卷消息渲染 ====================
function renderSurveyBubble(msg) {
  const s = msg.survey || {};
  const qs = s.questions || [];
  const answers = s.answers;
  const fromMe = isSelf(msg.sender);
  // 对方发来的且未作答 → 显示"作答"按钮
  const pending = !answers && !fromMe;
  // 我发起的且对方未回 → 等待提示
  const waiting = !answers && fromMe;
  
  // 状态标签
  let statusTag = '';
  if (answers) {
    statusTag = '<span class="survey-status-tag answered"><i class="fas fa-check"></i> 已作答</span>';
  } else if (pending) {
    statusTag = '<span class="survey-status-tag pending"><i class="fas fa-pen"></i> 待作答</span>';
  } else if (waiting) {
    statusTag = s.expired
      ? '<span class="survey-status-tag expired"><i class="fas fa-times-circle"></i> 已过期未作答</span>'
      : '<span class="survey-status-tag waiting"><i class="fas fa-hourglass-half"></i> 等待对方</span>';
  }
  
  let inner = `
    <div class="survey-head">
      <i class="fas fa-clipboard-list"></i>
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;">${escapeHtml(s.title || '问卷')}</span>
      ${statusTag}
    </div>
  `;
  
  qs.forEach((q, i) => {
    let ansHTML = '';
    if (answers && answers[i] !== undefined) {
      const ans = Array.isArray(answers[i]) ? answers[i] : [answers[i]];
      ansHTML = `<br><span class="q-ans">答：${ans.map(a => escapeHtml(String(a))).join('、')}</span>`;
    }
    inner += `<div class="survey-q"><span class="q-label">Q${i + 1}</span>${escapeHtml(q.text || '')}${ansHTML}</div>`;
  });
  
  if (pending) {
    const idx = getMsgIndexById(msg);
    inner += `<button class="survey-btn" onclick="openSurveyAnswerModal(${idx})"><i class="fas fa-pen"></i> 作答问卷</button>`;
  }
  
  return `<div class="bubble survey-bubble">${inner}</div>`;
}

function getMsgIndexById(msg) {
  if (!appData.currentChatId) return -1;
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const records = appData.chatRecords[key] || [];
  return records.findIndex(m => m.time === msg.time && m.sender === msg.sender);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 当前视角的"自己"ID
function getSelfId() { return 'me'; }

// 当前视角的"自己"名称
function getSelfName() { return appData.myProfile.nickname || '我'; }

// 当前视角的"自己"头像
function getSelfAvatar() { return appData.myProfile.avatar; }

// 判断某 authorId 是否是当前视角的"自己"
function isSelf(authorId) { return authorId === 'me'; }

// 已废弃，固定返回 false
function isSimulating() { return false; }

// ==================== 发送消息 ====================
function sendMessage() {
  const input = document.getElementById('messageInput');
  const content = input.value.trim();
  if (!content || !appData.currentChatId) return;
  
  const msg = {
    type: 'text',
    content,
    sender: 'me',
    time: Date.now()
  };
  
  // 携带待发送的引用
  if (pendingQuote) {
    msg.quote = { ...pendingQuote };
    clearPendingQuote();
  }
  
  addMessage(msg);
  
  input.value = '';
  autoResizeTextarea();
  clearCurrentDraft();
  
  // 对方自动回复
  scheduleReply();
}



// ==================== 引用消息 ====================
let pendingQuote = null;

// 长按/右键菜单选择引用
function quoteMessageFromMenu() {
  hideMsgContextMenu();
  if (msgMenuTargetIndex < 0) return;
  
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const records = appData.chatRecords[key] || [];
  const msg = records[msgMenuTargetIndex];
  if (!msg) return;
  
  pendingQuote = {
    sender: msg.sender,
    content: msg.type === 'image' ? '[表情包/图片]' : (msg.type === 'survey' ? '[问卷]' : msg.content),
    type: msg.type
  };
  renderQuotePreviewBar();
}

// 删除单条消息（本地删除，无撤回提示）
function deleteMessageFromMenu() {
  hideMsgContextMenu();
  if (msgMenuTargetIndex < 0) return;
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const records = appData.chatRecords[key] || [];
  if (!records[msgMenuTargetIndex]) return;
  if (!confirm('确定删除这条消息吗？')) return;
  records.splice(msgMenuTargetIndex, 1);
  saveData();
  renderChatMessages();
  renderConversations();
  showToast('已删除');
}

// 点击自己发送的消息：快捷存入字卡库（存入前可修改）
function saveWordFromMenu() {
  hideMsgContextMenu();
  if (msgMenuTargetIndex < 0) return;
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const msg = (appData.chatRecords[key] || [])[msgMenuTargetIndex];
  if (!msg || msg.type !== 'text') return;
  const groups = getActiveWordGroups();
  const body = `
    <div class="form-group">
      <label>字卡内容（存入前可修改）</label>
      <textarea class="textarea" id="saveWordContent" rows="3">${escapeHtml(msg.content)}</textarea>
    </div>
    <div class="form-group">
      <label>存入分组</label>
      <select class="input" id="saveWordGroup" style="width:100%;">
        ${groups.map(g => `<option value="${g.id}" ${g.id === getActiveWordGroupId() ? 'selected' : ''}>${escapeHtml(g.name)}</option>`).join('')}
      </select>
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="confirmSaveWordFromMenu()">存入字卡库</button>
  `;
  window.currentModalId = showModal('存入字卡库', body, footer);
}

function confirmSaveWordFromMenu() {
  const content = document.getElementById('saveWordContent').value.trim();
  const groupId = document.getElementById('saveWordGroup').value;
  if (!content) { showToast('内容不能为空'); return; }
  const group = getActiveWordGroups().find(g => g.id === groupId);
  if (!group) { showToast('分组不存在'); return; }
  if (!group.items) group.items = [];
  if (group.items.includes(content)) { showToast('该字卡已存在'); return; }
  group.items.push(content);
  saveData();
  renderWordCategories();
  renderWordList();
  closeModal(window.currentModalId);
  showToast('已存入字卡库「' + group.name + '」');
}

function clearPendingQuote(silent) {
  pendingQuote = null;
  if (!silent) renderQuotePreviewBar();
  else {
    const bar = document.getElementById('quotePreviewBar');
    if (bar) bar.classList.remove('show');
  }
}

function renderQuotePreviewBar() {
  const bar = document.getElementById('quotePreviewBar');
  const textEl = document.getElementById('quotePreviewText');
  if (!bar || !textEl) return;
  
  if (pendingQuote) {
    const sender = isSelf(pendingQuote.sender) ? '我' : 
      (appData.contacts.find(c => c.id === pendingQuote.sender)?.name || '对方');
    const content = pendingQuote.type === 'text' ? 
      (pendingQuote.content?.substring(0, 40) || '') : pendingQuote.content;
    textEl.innerHTML = `<strong>${escapeHtml(sender)}：</strong>${escapeHtml(content)}`;
    bar.classList.add('show');
  } else {
    bar.classList.remove('show');
  }
}

// ==================== 消息长按/右键菜单 ====================
let msgMenuTargetIndex = -1;
let longPressTimer = null;

function showMsgContextMenu(x, y, msgIndex) {
  const menu = document.getElementById('msgContextMenu');
  if (!menu) return;
  msgMenuTargetIndex = msgIndex;
  
  // 按消息状态显示/隐藏菜单项
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const msg = (appData.chatRecords[key] || [])[msgIndex];
  const recallItem = document.getElementById('menuRecallItem');
  const saveImgItem = document.getElementById('menuSaveImgItem');
  if (recallItem) recallItem.style.display = (msg && canRecallMsg(msg)) ? '' : 'none';
  if (saveImgItem) saveImgItem.style.display = (msg && msg.type === 'image' && !msg.recalled) ? '' : 'none';
  const copyItem = document.getElementById('menuCopyTextItem');
  if (copyItem) copyItem.style.display = (msg && msg.type === 'text' && !msg.recalled) ? '' : 'none';
  // 存入字卡库：仅自己的文本消息
  const saveWordItem = document.getElementById('menuSaveWordItem');
  if (saveWordItem) saveWordItem.style.display = (msg && isSelf(msg.sender) && msg.type === 'text' && !msg.recalled) ? '' : 'none';
  
  menu.classList.add('show');
  menu.style.display = 'block';
  menu.style.visibility = 'hidden';
  
  // 边界限制在可视窗口内
  const rect = menu.getBoundingClientRect();
  let left = Math.min(x, window.innerWidth - rect.width - 8);
  let top = Math.min(y, window.innerHeight - rect.height - 8);
  left = Math.max(8, left);
  top = Math.max(8, top);
  
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
  menu.style.visibility = 'visible';
}

function hideMsgContextMenu() {
  const menu = document.getElementById('msgContextMenu');
  if (menu) {
    menu.classList.remove('show');
    menu.style.display = 'none';
  }
  // 注意：不要在此重置 msgMenuTargetIndex，菜单项onclick先隐藏菜单再读索引，重置会导致所有菜单动作失效
}

// 绑定消息区域：右键 + 长按弹出引用菜单
(function initMsgContextMenu() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  
  container.addEventListener('contextmenu', (e) => {
    const row = e.target.closest('.msg-row');
    if (row && row.dataset.msgIndex !== undefined) {
      e.preventDefault();
      showMsgContextMenu(e.clientX, e.clientY, parseInt(row.dataset.msgIndex));
    }
  });
  
  container.addEventListener('touchstart', (e) => {
    const row = e.target.closest('.msg-row');
    if (!row || row.dataset.msgIndex === undefined) return;
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    const idx = parseInt(row.dataset.msgIndex);
    longPressTimer = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(15);
      showMsgContextMenu(x, y, idx);
    }, 500);
  }, { passive: true });
  
  container.addEventListener('touchend', () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  }, { passive: true });
  container.addEventListener('touchmove', () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  }, { passive: true });
  
  // 点击消息切换时间戳显示（"点击消息显示"模式下生效）
  container.addEventListener('click', (e) => {
    if (multiSelectMode) return;
    if ((appData.settings.msgTimeMode || 'tap') !== 'tap') return;
    const row = e.target.closest('.msg-row');
    if (!row || row.dataset.msgIndex === undefined) return;
    // 不拦截气泡上的交互元素（红包/问卷/图片/按钮等）
    if (e.target.closest('[onclick],button,a,img,input,textarea,select')) return;
    const idx = parseInt(row.dataset.msgIndex);
    if (expandedTimeIdxs.has(idx)) expandedTimeIdxs.delete(idx);
    else expandedTimeIdxs.add(idx);
    renderChatMessages();
  });

  // 点击其他区域关闭菜单
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('msgContextMenu');
    if (menu && !menu.contains(e.target)) hideMsgContextMenu();
  });
  document.addEventListener('scroll', hideMsgContextMenu, true);
})();

function addMessage(msg) {
  if (!appData.currentChatId) return;
  addMessageTo(appData.currentChatType, appData.currentChatId, msg);
}

// 向指定会话写入消息（切换联系人后仍正确归属，不串频道）
function addMessageTo(chatType, chatId, msg) {
  if (!chatId) return;
  
  const key = (chatType === 'group' ? 'group_' : 'contact_') + chatId;
  if (!appData.chatRecords[key]) {
    appData.chatRecords[key] = [];
  }
  appData.chatRecords[key].push(msg);
  saveData();
  
  const isViewing = appData.currentChatId === chatId && appData.currentChatType === chatType;
  if (isViewing) {
    renderChatMessages();
  } else {
    // 非当前会话：累计未读
    appData.unreadMap[key] = (appData.unreadMap[key] || 0) + 1;
    saveData();
  }
  renderConversations();
  
  // 消息提示音
  if (!isSelf(msg.sender) && !msg._noSound) {
    const soundType = chatType === 'group' ? 'msg_group' : 'msg_private';
    playNotifySound(soundType, { chatId });
  }

  // 己方发送音效
  if (isSelf(msg.sender) && !msg._noSound) playSendSound();
  
  // 桌面通知（会话免打扰时不弹）
  const dndConv = chatType === 'group'
    ? (appData.groups.find(x => x.id === chatId) || {}).groupDnd
    : (appData.contacts.find(x => x.id === chatId) || {}).msgDnd;
  if (appData.settings.desktopNotify && !isSelf(msg.sender) && !dndConv) {
    let notifyName = '新消息';
    if (chatType === 'group') {
      const g = appData.groups.find(x => x.id === chatId);
      notifyName = g ? g.name : notifyName;
    } else {
      const c = appData.contacts.find(x => x.id === chatId);
      notifyName = c ? c.name : notifyName;
    }
    showNotification(notifyName, msgNotifyPreview(msg), {
      tag: 'chat-' + chatType + '-' + chatId + '-' + Date.now(), force: true, // 同一会话通知替换更新，不堆积
      onClick: () => { selectConversation(chatId, chatType); switchPage('chat'); }
    });
  }
}

// 自动调整输入框高度
function autoResizeTextarea() {
  const textarea = document.getElementById('messageInput');
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

document.getElementById('messageInput').addEventListener('input', autoResizeTextarea);

// 发送按钮
document.getElementById('sendBtn').addEventListener('click', sendMessage);

// 回车发送，Shift+回车换行
document.getElementById('messageInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ==================== 自动回复 ====================
let replyTimer = null;

// 获取指定会话的独立配置（已读不回/定时消息）
function getConvSettings(chatType, chatId) {
  const key = (chatType === 'group' ? 'group_' : 'contact_') + chatId;
  if (!appData.convSettings[key]) appData.convSettings[key] = {};
  return appData.convSettings[key];
}

// ==================== 按会话独立配置（聊天背景 / 通话背景 / 词条库） ====================
// 获取会话键
function getConvKey(chatType, chatId) {
  return (chatType === 'group' ? 'group_' : 'contact_') + chatId;
}

// 读取会话配置（不存在时不创建，返回 null）
function peekConvSettings(chatType, chatId) {
  if (!chatType || !chatId) return null;
  return appData.convSettings[getConvKey(chatType, chatId)] || null;
}

// 当前会话显示名
function getCurrentConvName() {
  if (!appData.currentChatId) return '';
  if (appData.currentChatType === 'group') {
    return appData.groups.find(g => g.id === appData.currentChatId)?.name || '';
  }
  return appData.contacts.find(c => c.id === appData.currentChatId)?.name || '';
}

// ---------- 聊天背景 ----------
function isChatBgPerConv() {
  const cs = peekConvSettings(appData.currentChatType, appData.currentChatId);
  return !!(cs && cs.chatBgIndependent);
}

// 获取当前生效的聊天背景配置（会话级优先，回退全局）
function getEffectiveChatBg() {
  const cs = peekConvSettings(appData.currentChatType, appData.currentChatId);
  if (cs && cs.chatBgIndependent && cs.chatBg) {
    return {
      image: cs.chatBg.image || '',
      preset: cs.chatBg.preset || 'none',
      opacity: cs.chatBg.opacity !== undefined ? cs.chatBg.opacity : 20,
      blur: cs.chatBg.blur !== undefined ? cs.chatBg.blur : 0,
      mode: cs.chatBg.mode || 'cover',
      perConv: true
    };
  }
  return {
    image: appData.settings.chatBgImage || '',
    preset: appData.settings.chatBgPreset || 'none',
    opacity: appData.settings.chatBgOpacity !== undefined ? appData.settings.chatBgOpacity : 20,
    blur: appData.settings.chatBgBlur !== undefined ? appData.settings.chatBgBlur : 0,
    mode: appData.settings.chatBgMode || 'cover',
    perConv: false
  };
}

// 写入聊天背景属性（自动分发到会话级或全局）
function setChatBgProp(field, value) {
  if (isChatBgPerConv() && appData.currentChatId) {
    const cs = getConvSettings(appData.currentChatType, appData.currentChatId);
    if (!cs.chatBg) cs.chatBg = {};
    cs.chatBg[field] = value;
  } else {
    const map = { image: 'chatBgImage', preset: 'chatBgPreset', opacity: 'chatBgOpacity', blur: 'chatBgBlur', mode: 'chatBgMode' };
    appData.settings[map[field]] = value;
  }
}

// ---------- 通话背景 ----------
function isCallBgPerConv() {
  const cs = peekConvSettings(appData.currentChatType, appData.currentChatId);
  return !!(cs && cs.callBgIndependent);
}

// 获取生效的通话背景配置（可指定目标会话 key，通话发起时使用）
function getEffectiveCallBg(targetKey) {
  const cs = targetKey ? (appData.convSettings[targetKey] || null)
    : peekConvSettings(appData.currentChatType, appData.currentChatId);
  if (cs && cs.callBgIndependent && cs.callBg) {
    return {
      image: cs.callBg.image || '',
      preset: cs.callBg.preset || 'none',
      overlay: cs.callBg.overlay !== undefined ? cs.callBg.overlay : 45,
      perConv: true
    };
  }
  return {
    image: appData.settings.callBgImage || '',
    preset: appData.settings.callBgPreset || 'none',
    overlay: appData.settings.callBgOverlay !== undefined ? appData.settings.callBgOverlay : 45,
    perConv: false
  };
}

// 写入通话背景属性（自动分发到会话级或全局）
function setCallBgProp(field, value) {
  if (isCallBgPerConv() && appData.currentChatId) {
    const cs = getConvSettings(appData.currentChatType, appData.currentChatId);
    if (!cs.callBg) cs.callBg = {};
    cs.callBg[field] = value;
  } else {
    const map = { image: 'callBgImage', preset: 'callBgPreset', overlay: 'callBgOverlay' };
    appData.settings[map[field]] = value;
  }
}

// ---------- 词条库 ----------
function isConvWordsEnabled() {
  const cs = peekConvSettings(appData.currentChatType, appData.currentChatId);
  return !!(cs && cs.wordsIndependent);
}

// 按会话取生效词库（供回复/回信生成使用）
function getWordGroupsForKey(chatType, chatId) {
  const cs = peekConvSettings(chatType, chatId);
  if (cs && cs.wordsIndependent && Array.isArray(cs.wordGroups) && cs.wordGroups.length > 0) {
    return cs.wordGroups;
  }
  return appData.wordGroups;
}

// 设置页当前生效的词库数组（受"按联系人独立"开关控制）
function getActiveWordGroups() {
  if (isConvWordsEnabled() && appData.currentChatId) {
    const cs = getConvSettings(appData.currentChatType, appData.currentChatId);
    if (!Array.isArray(cs.wordGroups) || cs.wordGroups.length === 0) {
      cs.wordGroups = [{ id: 'default', name: '默认', color: '#89b8e8', disabled: false, _collapsed: false, items: [] }];
    }
    return cs.wordGroups;
  }
  return appData.wordGroups;
}

// 当前生效库的选中分类 ID
function getActiveWordGroupId() {
  if (isConvWordsEnabled() && appData.currentChatId) {
    const cs = getConvSettings(appData.currentChatType, appData.currentChatId);
    if (!cs.currentWordGroupId || !(cs.wordGroups || []).some(g => g.id === cs.currentWordGroupId)) {
      cs.currentWordGroupId = (cs.wordGroups || [])[0]?.id || 'default';
    }
    return cs.currentWordGroupId;
  }
  return appData.currentWordGroupId;
}

function setActiveWordGroupId(id) {
  if (isConvWordsEnabled() && appData.currentChatId) {
    getConvSettings(appData.currentChatType, appData.currentChatId).currentWordGroupId = id;
  } else {
    appData.currentWordGroupId = id;
  }
}

// ---------- 三个独立开关的切换 ----------
function toggleChatBgPerConv() {
  if (!appData.currentChatId) {
    showToast('请先在聊天页选择一个会话');
    return;
  }
  const cs = getConvSettings(appData.currentChatType, appData.currentChatId);
  if (!cs.chatBgIndependent) {
    // 首次开启：以当前生效背景为起点，方便在其基础上修改
    if (!cs.chatBg) {
      const cur = getEffectiveChatBg();
      cs.chatBg = { image: cur.image, preset: cur.preset, opacity: cur.opacity, blur: cur.blur, mode: cur.mode };
    }
    cs.chatBgIndependent = true;
    showToast('已为「' + getCurrentConvName() + '」启用独立聊天背景');
  } else {
    cs.chatBgIndependent = false;
    showToast('已恢复全局聊天背景');
  }
  saveData();
  applyChatBg();
  refreshPerConvUI();
}

function toggleCallBgPerConv() {
  if (!appData.currentChatId) {
    showToast('请先在聊天页选择一个会话');
    return;
  }
  const cs = getConvSettings(appData.currentChatType, appData.currentChatId);
  if (!cs.callBgIndependent) {
    if (!cs.callBg) {
      const cur = getEffectiveCallBg();
      cs.callBg = { image: cur.image, preset: cur.preset, overlay: cur.overlay };
    }
    cs.callBgIndependent = true;
    showToast('已为「' + getCurrentConvName() + '」启用独立通话背景');
  } else {
    cs.callBgIndependent = false;
    showToast('已恢复全局通话背景');
  }
  saveData();
  applyCallBg();
  refreshPerConvUI();
}

function toggleConvWordsIndependent() {
  if (!appData.currentChatId) {
    showToast('请先在聊天页选择一个会话');
    return;
  }
  const cs = getConvSettings(appData.currentChatType, appData.currentChatId);
  if (!cs.wordsIndependent) {
    // 首次开启：从全局词库复制一份作为起点
    if (!Array.isArray(cs.wordGroups) || cs.wordGroups.length === 0) {
      cs.wordGroups = JSON.parse(JSON.stringify(appData.wordGroups));
      cs.currentWordGroupId = cs.wordGroups[0]?.id || 'default';
    }
    cs.wordsIndependent = true;
    showToast('已为「' + getCurrentConvName() + '」启用独立词库');
  } else {
    cs.wordsIndependent = false;
    showToast('已恢复使用全局词库');
  }
  saveData();
  renderWordCategories();
  renderWordList();
  refreshPerConvUI();
}

// 刷新"按会话独立"三个开关的显示状态
function refreshPerConvUI() {
  const name = getCurrentConvName();
  const hasConv = !!appData.currentChatId;

  const wordsToggle = document.getElementById('convWordsToggle');
  if (wordsToggle) {
    wordsToggle.classList.toggle('active', isConvWordsEnabled());
    const desc = document.getElementById('convWordsDesc');
    if (desc) desc.textContent = hasConv
      ? (isConvWordsEnabled() ? `当前：${name} 的专属词库` : `当前：全局词库（未对 ${name} 单独设置）`)
      : '请先在聊天页选择一个会话';
  }

  const chatBgToggle = document.getElementById('chatBgPerConvToggle');
  if (chatBgToggle) {
    chatBgToggle.classList.toggle('active', isChatBgPerConv());
    const desc = document.getElementById('chatBgPerConvDesc');
    if (desc) desc.textContent = hasConv
      ? (isChatBgPerConv() ? `仅对 ${name} 的聊天界面生效` : '关闭时修改全局背景（所有会话共用）')
      : '请先在聊天页选择一个会话';
  }

  const callBgToggle = document.getElementById('callBgPerConvToggle');
  if (callBgToggle) {
    callBgToggle.classList.toggle('active', isCallBgPerConv());
    const desc = document.getElementById('callBgPerConvDesc');
    if (desc) desc.textContent = hasConv
      ? (isCallBgPerConv() ? `仅对 ${name} 的通话生效` : '关闭时修改全局通话背景（所有联系人共用）')
      : '请先在聊天页选择一个会话';
  }
}

function isViewingChat(chatType, chatId) {
  return appData.currentChatId === chatId && appData.currentChatType === chatType;
}

// 标记对方已读我的最后一条消息
function markMyMsgRead(chatType, chatId, mode) {
  const key = (chatType === 'group' ? 'group_' : 'contact_') + chatId;
  const records = appData.chatRecords[key] || [];
  for (let i = records.length - 1; i >= 0; i--) {
    if (isSelf(records[i].sender)) {
      records[i].readStatus = mode; // 'read-reply' | 'read-noreply'
      break;
    }
  }
}

function scheduleReply() {
  // 在调度时捕获目标会话，防止切换联系人后消息串频道
  const targetType = appData.currentChatType;
  const targetId = appData.currentChatId;
  if (!targetId) return;
  
  if (replyTimer) clearTimeout(replyTimer);
  
  const convSet = getConvSettings(targetType, targetId);
  
  // 已读不回：按概率选择不回复，仅标记已读
  const rnc = convSet.readNoReplyChance !== undefined ? convSet.readNoReplyChance : 50;
  if (targetType !== 'group' && convSet.readNoReply && Math.random() * 100 < rnc) {
    replyTimer = setTimeout(() => {
      markMyMsgRead(targetType, targetId, 'read-noreply');
      saveData();
      if (isViewingChat(targetType, targetId)) renderChatMessages();
      renderConversations();
    }, randomInt(1, 2) * 1000);
    return;
  }
  
  const { replyDelayMin, replyDelayMax, replyCountMin, replyCountMax, wordsPerMessage } = appData.settings;
  const delay = randomInt(replyDelayMin, replyDelayMax) * 1000;
  
  // 显示正在输入（仅当前正在查看该会话时）
  if (isViewingChat(targetType, targetId)) {
    showTypingIndicator(targetType, targetId);
  }
  
  replyTimer = setTimeout(() => {
    if (isViewingChat(targetType, targetId)) hideTypingIndicator();
    if (targetType !== 'group') {
      markMyMsgRead(targetType, targetId, 'read-reply');
    }
    generateReply(targetType, targetId, replyCountMin, replyCountMax, wordsPerMessage);
    if (isViewingChat(targetType, targetId)) renderChatMessages();
  }, delay);
}


// ==================== 输入区辅助 ====================

function showTypingIndicator(chatType, chatId) {
  const container = document.getElementById('chatMessages');
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
  if (!container || !isViewingChat(chatType, chatId)) return;
  
  const senderInfo = getReplySender(chatType, chatId);
  const typingText = (appData.settings.typingText || '').trim();
  const typingHTML = `
    <div class="msg-row other" id="typingIndicator">
      ${appData.settings.showMsgAvatar !== false ? getAvatarHTML(senderInfo.avatar, senderInfo.name) : ''}
      <div class="bubble">
        ${typingText ? `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:3px;">${escapeHtml(typingText)}</div>` : ''}
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', typingHTML);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

function getReplySender(chatType, chatId) {
  if (chatType === 'group') {
    const group = appData.groups.find(g => g.id === chatId);
    if (group && group.memberIds.length > 0) {
      const randomId = randomPick(group.memberIds);
      const contact = appData.contacts.find(c => c.id === randomId);
      return {
        id: randomId,
        name: contact?.name || '未知',
        avatar: contact?.avatar || ''
      };
    }
  }
  const contact = appData.contacts.find(c => c.id === chatId);
  return {
    id: chatId,
    name: contact?.name || '',
    avatar: contact?.avatar || ''
  };
}

function generateReply(chatType, chatId, countMin, countMax, wordsPerMsg) {
  if (!chatId) return;
  chatType = chatType || appData.currentChatType;
  
  const count = randomInt(countMin, countMax);
  const key = (chatType === 'group' ? 'group_' : 'contact_') + chatId;
  const messages = appData.chatRecords[key] || [];
  
  // 获取该会话生效词库（独立词库优先）中所有启用分类的词条
  let allWords = [];
  getWordGroupsForKey(chatType, chatId).forEach(g => {
    pushGroupWords(g, allWords);
  });

  // 关键词触发：命中规则就直接回设定好的那句
  const kwReply = matchKeywordReply(chatType, chatId);
  if (kwReply) {
    allWords = [kwReply];
  } else if (allWords.length === 0) {
    allWords.push('你好', '嗯嗯', '好的', '哈哈', '是的', '没错', '这样啊', '有道理');
  }

  // 记一次使用，供“常用”排序
  const pickWord = () => { const w = randomPick(allWords); bumpWordUsage(w); return w; };

  // 连句模式：多条回复合并为一条，随机符号分隔，看起来像一条消息
  if (appData.settings.multiSentence && count > 1) {
    setTimeout(() => {
      const exists = chatType === 'group'
        ? appData.groups.some(g => g.id === chatId)
        : appData.contacts.some(c => c.id === chatId);
      if (!exists) return;
      const senderInfo = getReplySender(chatType, chatId);
      const seps = (appData.settings.multiSentenceSeps || '，。~！').split('').filter(s => s);
      const parts = [];
      for (let j = 0; j < count; j++) {
        let part = '';
        for (let k = 0; k < wordsPerMsg; k++) part += pickWord();
        parts.push(part);
      }
      let content = parts[0];
      for (let j = 1; j < parts.length; j++) {
        content += (seps.length ? randomPick(seps) : '，') + parts[j];
      }
      const msg = { type: 'text', content, sender: senderInfo.id, time: Date.now() };
      addMessageTo(chatType, chatId, msg);
    }, randomInt(300, 800));
    return;
  }

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      // 会话可能已被删除，校验存在
      const exists = chatType === 'group'
        ? appData.groups.some(g => g.id === chatId)
        : appData.contacts.some(c => c.id === chatId);
      if (!exists) return;
      
      const senderInfo = getReplySender(chatType, chatId);
      
      // 构建消息内容
      let content = '';
      for (let j = 0; j < wordsPerMsg; j++) {
        content += pickWord();
      }
      
      const msg = {
        type: 'text',
        content,
        sender: senderInfo.id,
        time: Date.now()
      };
      
      // 引用回复：从我的近十条消息中随机挑选一条引用
      if (appData.settings.quoteReply && Math.random() < 0.3 && messages.length > 0) {
        const myMsgs = messages.filter(m => isSelf(m.sender) && !m.recalled && m.type === 'text').slice(-10);
        if (myMsgs.length > 0) {
          const pick = randomPick(myMsgs);
          msg.quote = {
            sender: pick.sender,
            content: pick.content,
            type: pick.type
          };
        }
      }
      
      // 表情消息
      if (appData.otherEmojis.length > 0 && Math.random() < 0.2) {
        msg.type = 'image';
        msg.content = randomPick(appData.otherEmojis);
      }

      
      // 通过 addMessageTo 归属到捕获的会话（不随切换串频道）
      addMessageTo(chatType, chatId, msg);
    }, i * randomInt(500, 1500));
  }

  // AI 小概率主动发红包（消耗对方自身钱包余额）
  if (appData.settings.aiRedPacket && Math.random() * 100 < (appData.settings.aiRedPacketChance || 8)) {
    const aiSender = getReplySender(chatType, chatId);
    if (aiSender && aiSender.id) {
      trackManagedTimeout('aiRpSend', () => aiSendRedPacket(chatType, chatId, aiSender.id), (count + 1) * 1000 + randomInt(500, 2000));
    }
  }
}

// ==================== 词条统计 / 关键词触发 ====================
function bumpWordUsage(w) {
  if (!w) return;
  if (!appData.wordUsage) appData.wordUsage = {};
  appData.wordUsage[w] = (appData.wordUsage[w] || 0) + 1;
  saveData();
}

function parseKeywordRules() {
  const raw = appData.settings.keywordRules || '';
  return raw.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    const i = line.indexOf('=>');
    if (i < 0) return null;
    const kw = line.slice(0, i).trim();
    const reply = line.slice(i + 2).trim();
    return (kw && reply) ? { kw, reply } : null;
  }).filter(Boolean);
}

function matchKeywordReply(chatType, chatId) {
  const rules = parseKeywordRules();
  if (!rules.length) return '';
  const key = (chatType === 'group' ? 'group_' : 'contact_') + chatId;
  const recs = appData.chatRecords[key] || [];
  const last = [...recs].reverse().find(m => isSelf(m.sender) && m.type === 'text' && m.content);
  if (!last) return '';
  const hit = rules.find(r => last.content.includes(r.kw));
  return hit ? hit.reply : '';
}

// ==================== 会话免打扰 ====================
function parseConvKey(key) {
  if (key.indexOf('group_') === 0) return { type: 'group', id: key.slice(6) };
  return { type: 'contact', id: key.slice(8) };
}

function isConvDnd(key) {
  const p = parseConvKey(key);
  const item = p.type === 'group'
    ? appData.groups.find(x => x.id === p.id)
    : appData.contacts.find(x => x.id === p.id);
  return !!(item && (p.type === 'group' ? item.groupDnd : item.msgDnd));
}

function toggleConvDnd(key) {
  const p = parseConvKey(key);
  const item = p.type === 'group'
    ? appData.groups.find(x => x.id === p.id)
    : appData.contacts.find(x => x.id === p.id);
  if (!item) return;
  if (p.type === 'group') item.groupDnd = !item.groupDnd;
  else item.msgDnd = !item.msgDnd;
  saveData();
  closeConvMenu();
  renderConversations();
  showToast((p.type === 'group' ? item.groupDnd : item.msgDnd) ? '已开启免打扰' : '已关闭免打扰');
}

// ==================== 数据备份 ====================
function exportAllData() {
  flushSaveData();
  const data = JSON.stringify(appData, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date();
  const stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
  a.href = url;
  a.download = '传讯全量备份-' + stamp + '.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  showToast('已导出');
}

function restoreAllData(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    let d = null;
    try { d = JSON.parse(reader.result); } catch (e) { showToast('这个文件读不了'); return; }
    if (!d || typeof d !== 'object' || Array.isArray(d)) { showToast('不是备份文件'); return; }
    const choice = prompt('恢复哪部分？填数字\n1 全部（覆盖现有）\n2 只恢复聊天记录\n3 只恢复词条库\n4 只恢复设置\n取消就不恢复', '1');
    if (!choice) return;
    if (choice === '1') {
      if (!confirm('会覆盖现在的全部数据，确定？')) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
      location.reload();
      return;
    }
    if (choice === '2') {
      if (!d.chatRecords) { showToast('备份里没有聊天记录'); return; }
      appData.chatRecords = d.chatRecords;
      appData.unreadMap = d.unreadMap || {};
    } else if (choice === '3') {
      if (!Array.isArray(d.wordGroups)) { showToast('备份里没有词条库'); return; }
      appData.wordGroups = d.wordGroups;
      appData.currentWordGroupId = d.currentWordGroupId || (d.wordGroups[0] && d.wordGroups[0].id) || 'default';
      if (d.wordUsage) appData.wordUsage = d.wordUsage;
    } else if (choice === '4') {
      if (!d.settings) { showToast('备份里没有设置'); return; }
      appData.settings = Object.assign({}, appData.settings, d.settings);
    } else {
      showToast('没这个选项');
      return;
    }
    flushSaveData();
    showToast('已恢复，正在刷新');
    setTimeout(function () { location.reload(); }, 600);
  };
  reader.readAsText(file);
}

// ==================== 音乐播放器 ====================
function musicApiUrl(id, type) {
  return 'https://api.injahow.cn/meting/?server=netease&type=' + type + '&id=' + encodeURIComponent(id);
}

function parseNeteaseId(raw) {
  if (!raw) return '';
  const m = raw.match(/[?&#]id=(\d+)/) || raw.match(/song\/(\d+)/) || raw.match(/^\s*(\d{5,})\s*$/);
  return m ? m[1] : '';
}

function fmtTime(sec) {
  sec = Math.floor(sec || 0);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function openMusicSheet() {
  const panel = document.getElementById('musicPanel');
  const mask = document.getElementById('musicMask');
  if (!panel) return;
  renderMusicList();
  if (mask) mask.style.display = 'block';
  panel.style.transform = 'translate(-50%,0)';
}

function closeMusicSheet() {
  const panel = document.getElementById('musicPanel');
  const mask = document.getElementById('musicMask');
  if (panel) panel.style.transform = 'translate(-50%,105%)';
  if (mask) setTimeout(function () { mask.style.display = 'none'; }, 320);
}

function toggleMusicPanel() {
  const mask = document.getElementById('musicMask');
  if (mask && mask.style.display === 'block') closeMusicSheet();
  else openMusicSheet();
}

function addMusicFromInput() {
  const el = document.getElementById('musicInput');
  if (!el) return;
  const raw = (el.value || '').trim();
  if (!raw) return;
  const id = parseNeteaseId(raw);
  if (!id) { showToast('没认出歌曲ID，复制带 id= 的链接'); return; }
  let name = '';
  const quoted = raw.match(/《([^》]+)》/);
  if (quoted) name = quoted[1].trim();
  if (!Array.isArray(appData.music)) appData.music = [];
  const exist = appData.music.find(function (m) { return m.id === id; });
  if (!exist) appData.music.unshift({ id: id, name: name || ('网易云 ' + id), artist: '', addedAt: Date.now() });
  el.value = '';
  saveData();
  playMusic(id);
  fetchMusicInfo(id);
}

function fetchMusicInfo(id) {
  fetch(musicApiUrl(id, 'song')).then(function (r) { return r.json(); }).then(function (list) {
    const info = Array.isArray(list) ? list[0] : list;
    if (!info || !info.name) return;
    const m = (appData.music || []).find(function (x) { return x.id === id; });
    if (!m) return;
    m.name = info.name;
    m.artist = info.artist || '';
    if (info.pic) m.pic = String(info.pic).replace(/^http:/, 'https:');
    saveData();
    renderMusicList();
    if (appData.currentMusicId === id) updateMusicHero();
  }).catch(function () {});
}

function updateMusicHero() {
  const id = appData.currentMusicId;
  const m = (appData.music || []).find(function (x) { return x.id === id; });
  const titleEl = document.getElementById('musicTitle');
  const artistEl = document.getElementById('musicArtist');
  const cover = document.getElementById('musicCover');
  if (titleEl) titleEl.textContent = m ? m.name : '还没选歌';
  if (artistEl) artistEl.textContent = (m && m.artist) ? m.artist : (m ? '未知歌手' : '贴个链接开始');
  if (cover) {
    if (m && m.pic) {
      cover.style.backgroundImage = 'url(' + m.pic + ')';
      cover.innerHTML = '';
    } else {
      cover.style.backgroundImage = 'linear-gradient(135deg,#8fb8e8,#b9a8e8)';
      cover.innerHTML = '<i class="fas fa-music"></i>';
    }
  }
}

function setMusicPlayIcon(playing) {
  const btn = document.getElementById('musicPlayBtn');
  if (btn) btn.innerHTML = '<i class="fas fa-' + (playing ? 'pause' : 'play') + '"></i>';
}

function updateMusicProgress() {
  const au = document.getElementById('musicAudio');
  const seek = document.getElementById('musicSeek');
  const cur = document.getElementById('musicCur');
  const dur = document.getElementById('musicDur');
  if (!au) return;
  const d = au.duration || 0;
  if (seek) seek.value = d ? Math.round((au.currentTime / d) * 1000) : 0;
  if (cur) cur.textContent = fmtTime(au.currentTime);
  if (dur) dur.textContent = fmtTime(d);
}

function seekMusic(v) {
  const au = document.getElementById('musicAudio');
  if (!au || !au.duration) return;
  au.currentTime = (v / 1000) * au.duration;
}

function playMusic(id) {
  const box = document.getElementById('musicPlayerBox');
  if (!box || !id) return;
  appData.currentMusicId = id;
  updateMusicHero();
  box.innerHTML = '<audio id="musicAudio" preload="none" src="' + musicApiUrl(id, 'url') + '"></audio>';
  const au = document.getElementById('musicAudio');
  if (au) {
    au.addEventListener('timeupdate', updateMusicProgress);
    au.addEventListener('loadedmetadata', updateMusicProgress);
    au.addEventListener('play', function () { setMusicPlayIcon(true); });
    au.addEventListener('pause', function () { setMusicPlayIcon(false); });
    au.addEventListener('ended', musicNext);
    au.addEventListener('error', function () { setMusicPlayIcon(false); showToast('这首歌播不了，换一首试试'); });
    const pr = au.play();
    if (pr && pr.catch) pr.catch(function () {});
  }
  saveData();
  renderMusicList();
}

function toggleMusicPlay() {
  const au = document.getElementById('musicAudio');
  if (!au) { if (appData.currentMusicId) playMusic(appData.currentMusicId); return; }
  if (au.paused) {
    const pr = au.play();
    if (pr && pr.catch) pr.catch(function () {});
  } else {
    au.pause();
  }
}

function musicStep(delta) {
  const list = appData.music || [];
  if (!list.length) return;
  let i = list.findIndex(function (m) { return m.id === appData.currentMusicId; });
  if (i < 0) i = 0;
  i = (i + delta + list.length) % list.length;
  playMusic(list[i].id);
}

function musicPrev() { musicStep(-1); }
function musicNext() { musicStep(1); }

function renameMusic(id) {
  const m = (appData.music || []).find(function (x) { return x.id === id; });
  if (!m) return;
  const v = prompt('歌名', m.name || '');
  if (v === null) return;
  m.name = v.trim() || m.name;
  saveData();
  renderMusicList();
  if (appData.currentMusicId === id) updateMusicHero();
}

function removeMusic(index) {
  if (!Array.isArray(appData.music)) return;
  appData.music.splice(index, 1);
  saveData();
  renderMusicList();
  showToast('已删除');
}

function renderMusicList() {
  const list = document.getElementById('musicList');
  if (!list) return;
  if (Array.isArray(appData.music)) {
    appData.music.forEach(function (m) {
      if (!m.tried && /^网易云 \d+$/.test(m.name || '')) { m.tried = true; fetchMusicInfo(m.id); }
    });
  }
  if (!Array.isArray(appData.music) || appData.music.length === 0) {
    list.innerHTML = '<div style="font-size:12px;color:var(--text-tertiary);padding:8px 0;">还没歌。上面贴个链接吧</div>';
    return;
  }
  list.innerHTML = appData.music.map(function (m, i) {
    const active = m.id === appData.currentMusicId;
    const color = active ? 'color:var(--accent-color,#3a7bd5);font-weight:600;' : '';
    const label = m.name + (m.artist ? ' - ' + m.artist : '');
    return '<div style="display:flex;align-items:center;gap:6px;padding:8px 0;border-top:1px solid var(--border-color);">'
      + '<span style="flex:1;min-width:0;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' + color + '" onclick="playMusic(\'' + m.id + '\')">' + escapeHtml(label) + '</span>'
      + '<button class="btn btn-secondary" style="padding:3px 8px;font-size:11px;" onclick="renameMusic(\'' + m.id + '\')">名</button>'
      + '<button class="btn btn-danger" style="padding:3px 8px;font-size:11px;" onclick="removeMusic(' + i + ')">删</button>'
      + '</div>';
  }).join('');
}

function showStorageUsage() {
  flushSaveData();
  const raw = localStorage.getItem(STORAGE_KEY) || '';
  const kb = new Blob([raw]).size / 1024;
  const text = kb > 1024 ? (kb / 1024).toFixed(2) + ' MB' : kb.toFixed(1) + ' KB';
  showToast('本地占用约 ' + text);
}

// 【继续】按钮：对方立即主动发言（可连续点击）
function triggerContinue() {
  if (!appData.currentChatId) {
    showToast('请先选择一个会话');
    return;
  }
  const targetType = appData.currentChatType;
  const targetId = appData.currentChatId;
  const { replyCountMin, replyCountMax, wordsPerMessage } = appData.settings;

  // 已读不回：点击说话按钮时对方也可能按概率不回复
  const convSet = getConvSettings(targetType, targetId);
  const rnc = convSet.readNoReplyChance !== undefined ? convSet.readNoReplyChance : 50;
  if (targetType !== 'group' && convSet.readNoReply && Math.random() * 100 < rnc) {
    showTypingIndicator(targetType, targetId);
    setTimeout(() => {
      hideTypingIndicator();
      showToast('对方已读，但不想回复');
    }, randomInt(800, 1600));
    return;
  }

  showTypingIndicator(targetType, targetId);
  setTimeout(() => {
    hideTypingIndicator();
    generateReply(targetType, targetId, replyCountMin, replyCountMax, wordsPerMessage);
  }, randomInt(600, 1200));
}

// ==================== 定时主动消息 ====================
let timedMsgTimer = null;

function stopTimedMsgTimer() {
  if (timedMsgTimer) {
    clearTimeout(timedMsgTimer);
    timedMsgTimer = null;
  }
}

function restartTimedMsgTimer() {
  stopTimedMsgTimer();
  if (!appData.currentChatId) return;
  
  const convSet = getConvSettings(appData.currentChatType, appData.currentChatId);
  if (!convSet.timedEnabled) return;
  
  let interval = convSet.timedInterval || appData.settings.timedMsgInterval || 30;
  interval = Math.max(1, Math.min(180, interval));
  
  scheduleNextTimedMsg(interval);
}

function scheduleNextTimedMsg(intervalMinutes) {
  const targetType = appData.currentChatType;
  const targetId = appData.currentChatId;
  if (!targetId) return;
  
  // 在设定分钟数内随机一个时机触发（轻量化：只用一个 setTimeout，触发后重新调度）
  const randomMinutes = randomInt(1, Math.max(1, Math.round(intervalMinutes)));
  timedMsgTimer = setTimeout(() => {
    // 会话仍存在才发送
    const exists = targetType === 'group'
      ? appData.groups.some(g => g.id === targetId)
      : appData.contacts.some(c => c.id === targetId);
    if (exists) {
      const { wordsPerMessage } = appData.settings;
      generateReply(targetType, targetId, 1, 2, wordsPerMessage);
    }
    // 继续下一轮（若该会话的定时开关仍开启且仍是当前会话），每轮重新随机时机
    const convSet = getConvSettings(targetType, targetId);
    if (convSet.timedEnabled && appData.currentChatId === targetId && appData.currentChatType === targetType) {
      scheduleNextTimedMsg(intervalMinutes);
    }
  }, randomMinutes * 60 * 1000);
}

// 刷新设置面板中"当前会话"相关配置显示
function refreshConvSettingsUI() {
  const readToggle = document.getElementById('readNoReplyToggle');
  const readDesc = document.getElementById('readNoReplyDesc');
  const timedToggle = document.getElementById('timedMsgToggle');
  const timedInput = document.getElementById('timedMsgInterval');
  const timedDesc = document.getElementById('timedMsgDesc');
  const surveyToggle = document.getElementById('surveyAutoToggle');
  const surveyDesc = document.getElementById('surveyAutoDesc');
  
  if (!appData.currentChatId) {
    if (readDesc) readDesc.textContent = '对方可能已读但不回复（按联系人独立记录）';
    if (timedDesc) timedDesc.textContent = '范围 1 ~ 180，当前会话独立配置';
    if (surveyDesc) surveyDesc.textContent = '开启后对方会在完全随机的时机主动发问卷，时机不受我方控制（按会话独立）';
    if (surveyToggle) surveyToggle.classList.remove('active');
    return;
  }
  
  const convSet = getConvSettings(appData.currentChatType, appData.currentChatId);
  const target = appData.currentChatType === 'group'
    ? appData.groups.find(g => g.id === appData.currentChatId)
    : appData.contacts.find(c => c.id === appData.currentChatId);
  const targetName = target ? target.name : '当前会话';
  
  if (readToggle) readToggle.classList.toggle('active', !!convSet.readNoReply);
  if (readDesc) readDesc.textContent = `「${targetName}」可能已读但不回复`;
  const rncInput2 = document.getElementById('readNoReplyChance');
  if (rncInput2) rncInput2.value = convSet.readNoReplyChance !== undefined ? convSet.readNoReplyChance : 50;
  const rncDesc = document.getElementById('readNoReplyChanceDesc');
  if (rncDesc) rncDesc.textContent = `0~100，当前：「${targetName}」`;
  if (timedToggle) timedToggle.classList.toggle('active', !!convSet.timedEnabled);
  if (timedInput && convSet.timedInterval) timedInput.value = convSet.timedInterval;
  if (timedDesc) timedDesc.textContent = `范围 1 ~ 180，当前：「${targetName}」`;
  if (surveyToggle) surveyToggle.classList.toggle('active', !!convSet.surveyAutoEnabled);
  if (surveyDesc) surveyDesc.textContent = convSet.surveyAutoEnabled
    ? `「${targetName}」会在随机时机主动发问卷（时机完全随机，不受控制）`
    : '开启后对方会在完全随机的时机主动发问卷，时机不受我方控制';

  // 对方作答参数回填
  const ansMin = document.getElementById('surveyAnsMinInput');
  const ansMax = document.getElementById('surveyAnsMaxInput');
  const ansExpire = document.getElementById('surveyAnsExpireInput');
  if (ansMin) ansMin.value = appData.settings.surveyAnswerMinSec;
  if (ansMax) ansMax.value = appData.settings.surveyAnswerMaxSec;
  if (ansExpire) ansExpire.value = appData.settings.surveyAnswerExpireSec;
}

// 保存"对方作答"参数（延迟范围 / 作答时限）
function setSurveyAnswerCfg() {
  const min = Math.max(1, parseInt(document.getElementById('surveyAnsMinInput')?.value) || 4);
  let max = Math.max(1, parseInt(document.getElementById('surveyAnsMaxInput')?.value) || 10);
  const expire = Math.max(0, parseInt(document.getElementById('surveyAnsExpireInput')?.value) || 0);
  if (max < min) max = min;
  appData.settings.surveyAnswerMinSec = Math.min(min, 3600);
  appData.settings.surveyAnswerMaxSec = Math.min(max, 3600);
  appData.settings.surveyAnswerExpireSec = Math.min(expire, 86400);
  saveData();
  document.getElementById('surveyAnsMinInput').value = appData.settings.surveyAnswerMinSec;
  document.getElementById('surveyAnsMaxInput').value = appData.settings.surveyAnswerMaxSec;
  document.getElementById('surveyAnsExpireInput').value = appData.settings.surveyAnswerExpireSec;
  showToast('对方作答参数已保存');
}

// ==================== 调查问卷模块 ====================
let surveyEditorData = [];

function getSurveyTemplateKey() {
  return (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
}

// 加载当前会话的问卷模板到编辑器
function loadSurveyTemplate() {
  const tpl = appData.surveyTemplates[getSurveyTemplateKey()];
  if (tpl) {
    document.getElementById('surveyTitleInput').value = tpl.title || '';
    surveyEditorData = JSON.parse(JSON.stringify(tpl.questions || []));
  } else {
    document.getElementById('surveyTitleInput').value = '';
    surveyEditorData = [];
  }
  renderSurveyEditor();
  renderSurveyLibrary();
  renderMySurveyLibrary();
}

function saveSurveyTemplate() {
  const title = document.getElementById('surveyTitleInput').value.trim();
  appData.surveyTemplates[getSurveyTemplateKey()] = {
    title,
    questions: JSON.parse(JSON.stringify(surveyEditorData))
  };
  saveData();
}

function renderSurveyEditor() {
  const list = document.getElementById('surveyEditorList');
  if (!list) return;
  
  if (surveyEditorData.length === 0) {
    list.innerHTML = '<div style="font-size:12px;color:var(--text-tertiary);padding:6px 0 10px;">尚未添加问题，点击下方"添加问题"开始编辑</div>';
    return;
  }
  
  list.innerHTML = surveyEditorData.map((q, qi) => `
    <div class="survey-editor-q">
      <div class="q-head">
        <span style="font-size:12px;color:var(--primary);font-weight:600;flex-shrink:0;">Q${qi + 1}</span>
        <input type="text" class="input" placeholder="输入问题" value="${escapeAttr(q.text || '')}" oninput="updateSurveyQText(${qi}, this.value)">
        <select class="q-type-sel" onchange="updateSurveyQType(${qi}, this.value)">
          <option value="single" ${q.type !== 'multi' ? 'selected' : ''}>单选</option>
          <option value="multi" ${q.type === 'multi' ? 'selected' : ''}>多选</option>
        </select>
        <div class="opt-del" title="删除问题" onclick="delSurveyQuestion(${qi})"><i class="fas fa-trash"></i></div>
      </div>
      ${(q.options || []).map((opt, oi) => `
        <div class="survey-opt-row">
          <span class="opt-idx">${oi + 1}</span>
          <input type="text" class="input" placeholder="选项内容" value="${escapeAttr(opt)}" oninput="updateSurveyOpt(${qi}, ${oi}, this.value)">
          <div class="opt-del" onclick="delSurveyOption(${qi}, ${oi})"><i class="fas fa-times"></i></div>
        </div>
      `).join('')}
      <button class="survey-add-btn" onclick="addSurveyOption(${qi})"><i class="fas fa-plus"></i> 添加选项</button>
    </div>
  `).join('');
}

function escapeAttr(text) {
  return String(text || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addSurveyQuestion() {
  surveyEditorData.push({ text: '', type: 'single', options: ['', ''] });
  renderSurveyEditor();
}

function delSurveyQuestion(qi) {
  surveyEditorData.splice(qi, 1);
  renderSurveyEditor();
}

function updateSurveyQText(qi, val) { surveyEditorData[qi].text = val; }
function updateSurveyQType(qi, val) { surveyEditorData[qi].type = val; }
function updateSurveyOpt(qi, oi, val) { surveyEditorData[qi].options[oi] = val; }
function delSurveyOption(qi, oi) {
  surveyEditorData[qi].options.splice(oi, 1);
  renderSurveyEditor();
}
function addSurveyOption(qi) {
  surveyEditorData[qi].options.push('');
  renderSurveyEditor();
}

// 校验并构建可发送的问卷数据
function buildValidSurvey() {
  const title = document.getElementById('surveyTitleInput').value.trim() || '调查问卷';
  const questions = surveyEditorData
    .map(q => ({
      text: (q.text || '').trim(),
      type: q.type || 'single',
      options: (q.options || []).map(o => o.trim()).filter(o => o)
    }))
    .filter(q => q.text && q.options.length >= 2);
  
  if (questions.length === 0) {
    showToast('请至少完善一道题（题目+两个选项）');
    return null;
  }
  return { title, questions };
}

// 我方 → 对方发起问卷（对方延时自动作答）
// 对方延时自动作答（支持自定义延迟范围与作答时限）
function schedulePeerSurveyAnswer(targetType, targetId, myMsg, survey) {
  const min = Math.max(1, appData.settings.surveyAnswerMinSec || 4);
  const max = Math.max(min, appData.settings.surveyAnswerMaxSec || 10);
  const expireSec = Math.max(0, appData.settings.surveyAnswerExpireSec || 0);
  const delay = randomInt(min, max);

  const doAnswer = () => {
    const exists = targetType === 'group'
      ? appData.groups.some(g => g.id === targetId)
      : appData.contacts.some(c => c.id === targetId);
    if (!exists) return;
    if (myMsg.survey && myMsg.survey.expired) return; // 已超时限，不再作答
    const senderInfo = getReplySender(targetType, targetId);
    const answers = survey.questions.map(q => {
      if (q.type === 'multi') {
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        const n = randomInt(1, Math.min(2, q.options.length));
        return shuffled.slice(0, n);
      }
      return [randomPick(q.options)];
    });
    addMessageTo(targetType, targetId, {
      type: 'survey',
      content: '[问卷作答] ' + survey.title,
      sender: senderInfo.id,
      time: Date.now(),
      survey: { ...survey, answers }
    });
  };

  // 作答时限：超时未答则该问卷标记过期
  if (expireSec > 0) {
    trackManagedTimeout('surveyExpire', () => {
      if (myMsg.survey && !myMsg.survey.expired) {
        myMsg.survey.expired = true;
        saveData();
        if (isViewingChat(targetType, targetId)) renderChatMessages();
      }
    }, expireSec * 1000);
  }
  trackManagedTimeout('surveyAnswer', doAnswer, delay * 1000);
}

function sendSurveyToContact() {
  if (!appData.currentChatId) { showToast('请先选择一个会话'); return; }
  const survey = buildValidSurvey();
  if (!survey) return;
  
  saveSurveyTemplate();
  
  const targetType = appData.currentChatType;
  const targetId = appData.currentChatId;
  
  const myMsg = {
    type: 'survey',
    content: '[问卷] ' + survey.title,
    sender: getSelfId(),
    time: Date.now(),
    survey
  };
  addMessage(myMsg);

  showToast('问卷已发送，等待对方作答');
  schedulePeerSurveyAnswer(targetType, targetId, myMsg, survey);
}

// ==================== 对方问卷库（对方可自主选择发送的问卷） ====================
const SURVEY_PRESETS = [
  {
    title: '认识一下你',
    questions: [
      { text: '你平时的作息是？', type: 'single', options: ['早睡早起', '夜猫子', '看心情'] },
      { text: '周末喜欢做什么？', type: 'multi', options: ['宅家', '出门玩', '看电影', '运动', '打游戏'] },
      { text: '你更喜欢哪种聊天方式？', type: 'single', options: ['语音', '文字', '视频', '都行'] }
    ]
  },
  {
    title: '口味小调查',
    questions: [
      { text: '你能吃辣吗？', type: 'single', options: ['无辣不欢', '微辣可以', '完全不行'] },
      { text: '喜欢的饮品？', type: 'multi', options: ['奶茶', '咖啡', '果汁', '白开水', '汽水'] },
      { text: '甜党还是咸党？', type: 'single', options: ['甜党', '咸党', '都可以'] }
    ]
  },
  {
    title: '心情晴雨表',
    questions: [
      { text: '今天心情怎么样？', type: 'single', options: ['超好', '还不错', '一般般', '有点低落'] },
      { text: '什么会让你开心起来？', type: 'multi', options: ['吃好吃的', '听音乐', '买东西', '被人夸', '睡觉'] },
      { text: '想聊点什么？', type: 'single', options: ['随便聊聊', '分享趣事', '倾诉烦恼', '不想说话'] }
    ]
  },
  {
    title: '默契度测试',
    questions: [
      { text: '你觉得我是什么样的人？', type: 'single', options: ['温柔', '有趣', '靠谱', '神秘'] },
      { text: '我们的默契度打几分？', type: 'single', options: ['满分', '80分', '及格线', '不及格'] },
      { text: '想和我一起做什么？', type: 'multi', options: ['看电影', '吃饭', '旅行', '打游戏', '聊天到深夜'] }
    ]
  }
];

// 对方发问卷前的开场白台词池
const SURVEY_OPENERS = [
  '给你发个小问卷，帮我填一下嘛~',
  '刷到个有趣的问卷，你来试试！',
  '想更了解你一点，填个问卷吧？',
  '闲着也是闲着，帮我做个小调查？',
  '这个问卷只有你能答，来看看！'
];

// 我方作答后对方的反馈台词池
const SURVEY_FEEDBACKS = [
  '看完你的答案了，有点意思~',
  '原来你是这样想的啊！',
  '你的回答我都记下来了哦。',
  '感觉更了解你一点了呢。',
  '答案跟我猜的不太一样，有点意外。',
  '谢谢你的认真作答呀！'
];

// 获取当前会话的对方问卷库
function getSurveyLibrary() {
  if (!appData.currentChatId) return [];
  const key = getSurveyTemplateKey();
  if (!Array.isArray(appData.surveyLibrary[key])) appData.surveyLibrary[key] = [];
  return appData.surveyLibrary[key];
}

// 渲染对方问卷库列表（支持关键词过滤）
function renderSurveyLibrary() {
  const listEl = document.getElementById('surveyLibList');
  if (!listEl) return;
  const lib = getSurveyLibrary();
  
  if (lib.length === 0) {
    listEl.innerHTML = '<div class="survey-empty-tip">对方问卷库还是空的：可「从编辑器存入」「新建对方问卷」或「导入预设」</div>';
    return;
  }
  
  // 关键词过滤：匹配标题与题目内容
  const term = document.getElementById('surveyLibSearch')?.value?.trim().toLowerCase() || '';
  let items = lib;
  if (term) {
    items = lib.filter(item =>
      (item.title || '').toLowerCase().includes(term) ||
      (item.questions || []).some(q => (q.text || '').toLowerCase().includes(term))
    );
  }
  
  if (items.length === 0) {
    listEl.innerHTML = '<div class="survey-empty-tip">没有匹配的问卷</div>';
    return;
  }
  
  listEl.innerHTML = items.map(item => {
    const enabled = item.enabled !== false;
    const qCount = (item.questions || []).length;
    return `
      <div class="survey-lib-item ${enabled ? '' : 'disabled'}">
        <div class="survey-lib-icon"><i class="fas fa-clipboard"></i></div>
        <div class="survey-lib-info">
          <div class="survey-lib-title">${escapeHtml(item.title || '未命名问卷')}</div>
          <div class="survey-lib-meta">${qCount} 道题${enabled ? '' : ' · <span class="lib-disabled-tag">已停用，对方不会选它</span>'}</div>
        </div>
        <div class="survey-lib-actions">
          <button class="survey-lib-btn ${enabled ? 'on' : ''}" title="${enabled ? '停用' : '启用'}" onclick="toggleSurveyLibItem('${item.id}')"><i class="fas fa-toggle-${enabled ? 'on' : 'off'}"></i></button>
          <button class="survey-lib-btn" title="编辑" onclick="openSurveyLibEditor('${item.id}')"><i class="fas fa-pen"></i></button>
          <button class="survey-lib-btn" title="让对方发送这份" onclick="sendSurveyFromContact('${item.id}')"><i class="fas fa-paper-plane"></i></button>
          <button class="survey-lib-btn danger" title="删除" onclick="deleteSurveyLibItem('${item.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== 我方问卷库（我方可建立多个问卷） ====================

// 获取当前会话的我方问卷库
function getMySurveyLibrary() {
  if (!appData.currentChatId) return [];
  const key = getSurveyTemplateKey();
  if (!Array.isArray(appData.mySurveyLibrary[key])) appData.mySurveyLibrary[key] = [];
  return appData.mySurveyLibrary[key];
}

// 渲染我方问卷库列表（支持关键词过滤）
function renderMySurveyLibrary() {
  const listEl = document.getElementById('mySurveyLibList');
  if (!listEl) return;
  const lib = getMySurveyLibrary();
  
  if (lib.length === 0) {
    listEl.innerHTML = '<div class="survey-empty-tip">我方问卷库还是空的：可「从编辑器存入」「新建我方问卷」</div>';
    return;
  }
  
  const term = document.getElementById('mySurveyLibSearch')?.value?.trim().toLowerCase() || '';
  let items = lib;
  if (term) {
    items = lib.filter(item =>
      (item.title || '').toLowerCase().includes(term) ||
      (item.questions || []).some(q => (q.text || '').toLowerCase().includes(term))
    );
  }
  
  if (items.length === 0) {
    listEl.innerHTML = '<div class="survey-empty-tip">没有匹配的问卷</div>';
    return;
  }
  
  listEl.innerHTML = items.map(item => {
    const enabled = item.enabled !== false;
    const qCount = (item.questions || []).length;
    return `
      <div class="survey-lib-item ${enabled ? '' : 'disabled'}">
        <div class="survey-lib-icon"><i class="fas fa-file-alt"></i></div>
        <div class="survey-lib-info">
          <div class="survey-lib-title">${escapeHtml(item.title || '未命名问卷')}</div>
          <div class="survey-lib-meta">${qCount} 道题${enabled ? '' : ' · <span class="lib-disabled-tag">已停用</span>'}</div>
        </div>
        <div class="survey-lib-actions">
          <button class="survey-lib-btn ${enabled ? 'on' : ''}" title="${enabled ? '停用' : '启用'}" onclick="toggleMySurveyLibItem('${item.id}')"><i class="fas fa-toggle-${enabled ? 'on' : 'off'}"></i></button>
          <button class="survey-lib-btn" title="编辑" onclick="openMySurveyLibEditor('${item.id}')"><i class="fas fa-pen"></i></button>
          <button class="survey-lib-btn" title="加载到编辑器" onclick="loadMySurveyToEditor('${item.id}')"><i class="fas fa-download"></i></button>
          <button class="survey-lib-btn" title="直接发送这份" onclick="sendMySurveyById('${item.id}')"><i class="fas fa-paper-plane"></i></button>
          <button class="survey-lib-btn danger" title="删除" onclick="deleteMySurveyLibItem('${item.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

// 从编辑器复制到我方问卷库
function addMySurveyFromEditor() {
  const survey = buildValidSurvey();
  if (!survey) return;
  
  getMySurveyLibrary().push({
    id: generateId(),
    title: survey.title,
    questions: survey.questions,
    enabled: true
  });
  saveSurveyTemplate();
  saveData();
  renderMySurveyLibrary();
  showToast('已存入我方问卷库');
}

// 启用/停用我方问卷库条目
function toggleMySurveyLibItem(libId) {
  const item = getMySurveyLibrary().find(i => i.id === libId);
  if (!item) return;
  item.enabled = item.enabled === false ? true : false;
  saveData();
  renderMySurveyLibrary();
}

// 删除我方问卷库条目
function deleteMySurveyLibItem(libId) {
  if (!confirm('确定从我方问卷库删除该问卷吗？')) return;
  const key = getSurveyTemplateKey();
  appData.mySurveyLibrary[key] = getMySurveyLibrary().filter(i => i.id !== libId);
  saveData();
  renderMySurveyLibrary();
  showToast('已删除');
}

// 加载我方问卷库条目到编辑器
function loadMySurveyToEditor(libId) {
  const item = getMySurveyLibrary().find(i => i.id === libId);
  if (!item) { showToast('问卷不存在'); return; }
  document.getElementById('surveyTitleInput').value = item.title || '';
  surveyEditorData = JSON.parse(JSON.stringify(item.questions || []));
  renderSurveyEditor();
  showToast('已加载到编辑器');
}

// 直接从库中发送指定问卷
function sendMySurveyById(libId) {
  if (!appData.currentChatId) { showToast('请先选择一个会话'); return; }
  const item = getMySurveyLibrary().find(i => i.id === libId);
  if (!item || !item.questions || item.questions.length === 0) {
    showToast('问卷无效');
    return;
  }
  
  const survey = { title: item.title, questions: JSON.parse(JSON.stringify(item.questions)) };
  const targetType = appData.currentChatType;
  const targetId = appData.currentChatId;
  
  const myMsg = {
    type: 'survey',
    content: '[问卷] ' + survey.title,
    sender: getSelfId(),
    time: Date.now(),
    survey
  };
  addMessage(myMsg);

  showToast('问卷已发送，等待对方作答');
  schedulePeerSurveyAnswer(targetType, targetId, myMsg, survey);
}

// 聊天工具栏问卷快捷菜单
// ==================== 设置中心快捷入口 ====================
const SETTINGS_HUB_ITEMS = [
  { id: 'themeCollapsible', icon: 'fa-palette', title: '主题设置' },
  { id: 'chatCollapsible', icon: 'fa-comments', title: '对话参数配置' },
  { id: 'timedMsgCollapsible', icon: 'fa-clock', title: '定时主动消息' },
  { id: 'surveyCollapsible', icon: 'fa-clipboard-list', title: '调查问卷' },
  { id: 'letterCollapsible', icon: 'fa-envelope', title: '信件参数' },
  { id: 'statusCollapsible', icon: 'fa-heart', title: '联系人状态' },
  { id: 'callCollapsible', icon: 'fa-phone', title: '通话设置' },
  { id: 'notifyCollapsible', icon: 'fa-bell', title: '通知设置' },
  { id: 'wordsCollapsible', icon: 'fa-book', title: '词条库管理' },
  { id: 'emojiCollapsible', icon: 'fa-smile', title: '表情管理' },
  { id: 'walletCollapsible', icon: 'fa-wallet', title: '钱包' },
  { id: 'soundCollapsible', icon: 'fa-music', title: '铃声与音效' },
  { id: 'notesCollapsible', icon: 'fa-pen-to-square', title: '记事本&待办' },
  { id: 'favoritesCollapsible', icon: 'fa-star', title: '收藏夹' },
  { id: 'advToolsCollapsible', icon: 'fa-screwdriver-wrench', title: '高级工具' },
  { id: 'backupCollapsible', icon: 'fa-database', title: '数据备份' }
];

function openChatSettingsHub() {
  const body = `
    <div class="settings-hub-grid">
      ${SETTINGS_HUB_ITEMS.map((it, i) => `
        <div class="settings-hub-item" data-hub-idx="${i}">
          <i class="fas ${it.icon}"></i><span>${it.title}</span>
        </div>`).join('')}
    </div>
    <div style="font-size:11px;color:var(--text-tertiary);margin-top:10px;text-align:center;">点击任意项跳转设置页对应面板</div>
  `;
  window.currentModalId = showModal('设置中心', body);
  const grid = document.querySelector('.modal-overlay:last-child .settings-hub-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const item = e.target.closest('[data-hub-idx]');
      if (!item) return;
      jumpToSettingsPanel(SETTINGS_HUB_ITEMS[+item.dataset.hubIdx].id);
    });
  }
}

function jumpToSettingsPanel(panelId) {
  closeModal(currentModalId);
  switchPage('settings');
  openPanelById(panelId);
}

function openSurveyQuickMenu() {
  if (!appData.currentChatId) { showToast('请先选择一个会话'); return; }
  const body = `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <button class="btn btn-primary" style="width:100%;padding:10px;" onclick="closeModal(currentModalId);sendSurveyToContact();">
        <i class="fas fa-paper-plane"></i> 发送编辑器问卷
      </button>
      <button class="btn btn-secondary" style="width:100%;padding:10px;" onclick="closeModal(currentModalId);openMySurveyPicker();">
        <i class="fas fa-clipboard-list"></i> 从我方库选发
      </button>
      <button class="btn btn-secondary" style="width:100%;padding:10px;" onclick="closeModal(currentModalId);openSurveyFromContactPicker();">
        <i class="fas fa-inbox"></i> 让对方选择发送
      </button>
      <div class="setting-desc" style="font-size:11px;text-align:center;">编辑器与问卷库在「设置 → 调查问卷」中管理</div>
    </div>
  `;
  window.currentModalId = showModal('发送问卷', body);
}

// 从我方问卷库中选择发送
function openMySurveyPicker() {
  if (!appData.currentChatId) { showToast('请先选择一个会话'); return; }
  
  const lib = getMySurveyLibrary().filter(i => i.enabled !== false && (i.questions || []).length > 0);
  
  if (lib.length === 0) {
    showToast('我方问卷库为空，请先添加问卷');
    return;
  }
  
  const body = `
    <div class="call-picker-tip">从下方我方问卷库中挑选一份发起：</div>
    ${lib.map(item => `
      <button class="survey-pick-card" onclick="sendMySurveyById('${item.id}'); closeModal(window.mySurveyPickerId);">
        <div class="pick-icon"><i class="fas fa-file-alt"></i></div>
        <div class="pick-info">
          <div class="pick-title">${escapeHtml(item.title || '未命名问卷')}</div>
          <div class="pick-meta">${item.questions.length} 道题 · 点击发送</div>
        </div>
        <i class="fas fa-paper-plane pick-go"></i>
      </button>
    `).join('')}
  `;
  window.mySurveyPickerId = showModal('从库中选择问卷', body);
}

// ===== 我方问卷库条目编辑弹窗 =====
let mySurveyLibEditData = [];
let mySurveyLibEditId = null;

function openMySurveyLibEditor(libId = null) {
  const lib = getMySurveyLibrary();
  const item = libId ? lib.find(i => i.id === libId) : null;
  mySurveyLibEditId = libId;
  mySurveyLibEditData = item
    ? JSON.parse(JSON.stringify(item.questions || []))
    : [{ text: '', type: 'single', options: ['', ''] }];
  
  const body = `
    <div class="form-group">
      <label>问卷标题</label>
      <input type="text" class="input" id="mySurveyLibTitle" value="${escapeAttr(item ? item.title || '' : '')}" placeholder="输入问卷标题">
    </div>
    <div id="mySurveyLibEditList"></div>
    <button class="survey-add-btn" onclick="addMySurveyLibQ()"><i class="fas fa-plus"></i> 添加问题</button>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="saveMySurveyLibItem()">保存</button>
  `;
  window.currentModalId = showModal(item ? '编辑我方问卷' : '新建我方问卷', body, footer);
  renderMySurveyLibEditor();
}

function renderMySurveyLibEditor() {
  const list = document.getElementById('mySurveyLibEditList');
  if (!list) return;
  
  if (mySurveyLibEditData.length === 0) {
    list.innerHTML = '<div class="survey-empty-tip">尚未添加问题，点击下方"添加问题"开始编辑</div>';
    return;
  }
  
  list.innerHTML = mySurveyLibEditData.map((q, qi) => `
    <div class="survey-editor-q">
      <div class="q-head">
        <span style="font-size:12px;color:var(--primary);font-weight:600;flex-shrink:0;">Q${qi + 1}</span>
        <input type="text" class="input" placeholder="输入问题" value="${escapeAttr(q.text || '')}" oninput="updMySurveyLibQText(${qi}, this.value)">
        <select class="q-type-sel" onchange="updMySurveyLibQType(${qi}, this.value)">
          <option value="single" ${q.type !== 'multi' ? 'selected' : ''}>单选</option>
          <option value="multi" ${q.type === 'multi' ? 'selected' : ''}>多选</option>
        </select>
        <div class="opt-del" title="删除问题" onclick="delMySurveyLibQ(${qi})"><i class="fas fa-trash"></i></div>
      </div>
      ${(q.options || []).map((opt, oi) => `
        <div class="survey-opt-row">
          <span class="opt-idx">${oi + 1}</span>
          <input type="text" class="input" placeholder="选项内容" value="${escapeAttr(opt)}" oninput="updMySurveyLibOpt(${qi}, ${oi}, this.value)">
          <div class="opt-del" onclick="delMySurveyLibOpt(${qi}, ${oi})"><i class="fas fa-times"></i></div>
        </div>
      `).join('')}
      <button class="survey-add-btn" onclick="addMySurveyLibOpt(${qi})"><i class="fas fa-plus"></i> 添加选项</button>
    </div>
  `).join('');
}

function addMySurveyLibQ() { mySurveyLibEditData.push({ text: '', type: 'single', options: ['', ''] }); renderMySurveyLibEditor(); }
function delMySurveyLibQ(qi) { mySurveyLibEditData.splice(qi, 1); renderMySurveyLibEditor(); }
function updMySurveyLibQText(qi, val) { mySurveyLibEditData[qi].text = val; }
function updMySurveyLibQType(qi, val) { mySurveyLibEditData[qi].type = val; }
function updMySurveyLibOpt(qi, oi, val) { mySurveyLibEditData[qi].options[oi] = val; }
function delMySurveyLibOpt(qi, oi) { mySurveyLibEditData[qi].options.splice(oi, 1); renderMySurveyLibEditor(); }
function addMySurveyLibOpt(qi) { mySurveyLibEditData[qi].options.push(''); renderMySurveyLibEditor(); }

function saveMySurveyLibItem() {
  const title = document.getElementById('mySurveyLibTitle').value.trim() || '未命名问卷';
  const questions = mySurveyLibEditData
    .map(q => ({
      text: (q.text || '').trim(),
      type: q.type || 'single',
      options: (q.options || []).map(o => o.trim()).filter(o => o)
    }))
    .filter(q => q.text && q.options.length >= 2);
  
  if (questions.length === 0) {
    showToast('请至少完善一道题（题目+两个选项）');
    return;
  }
  
  const lib = getMySurveyLibrary();
  if (mySurveyLibEditId) {
    const item = lib.find(i => i.id === mySurveyLibEditId);
    if (item) {
      item.title = title;
      item.questions = questions;
    }
  } else {
    lib.push({ id: generateId(), title, questions, enabled: true });
  }
  
  saveData();
  renderMySurveyLibrary();
  closeModal(window.currentModalId);
  showToast('已保存到我方问卷库');
}

// ==================== 我方问卷库 END ====================

// 从我方编辑器复制到对方问卷库
function addSurveyLibFromEditor() {
  const survey = buildValidSurvey();
  if (!survey) return;
  
  getSurveyLibrary().push({
    id: generateId(),
    title: survey.title,
    questions: survey.questions,
    enabled: true
  });
  saveSurveyTemplate();
  saveData();
  renderSurveyLibrary();
  showToast('已存入对方问卷库');
}

// 启用/停用对方问卷库条目
function toggleSurveyLibItem(libId) {
  const item = getSurveyLibrary().find(i => i.id === libId);
  if (!item) return;
  item.enabled = item.enabled === false ? true : false;
  saveData();
  renderSurveyLibrary();
}

// 删除对方问卷库条目
function deleteSurveyLibItem(libId) {
  if (!confirm('确定从对方问卷库删除该问卷吗？')) return;
  const key = getSurveyTemplateKey();
  appData.surveyLibrary[key] = getSurveyLibrary().filter(i => i.id !== libId);
  saveData();
  renderSurveyLibrary();
  showToast('已删除');
}

// ===== 对方问卷库条目编辑弹窗 =====
let surveyLibEditData = [];
let surveyLibEditId = null;

function openSurveyLibEditor(libId = null) {
  const lib = getSurveyLibrary();
  const item = libId ? lib.find(i => i.id === libId) : null;
  surveyLibEditId = libId;
  surveyLibEditData = item
    ? JSON.parse(JSON.stringify(item.questions || []))
    : [{ text: '', type: 'single', options: ['', ''] }];
  
  const body = `
    <div class="form-group">
      <label>问卷标题</label>
      <input type="text" class="input" id="surveyLibTitle" value="${escapeAttr(item ? item.title || '' : '')}" placeholder="输入问卷标题">
    </div>
    <div id="surveyLibEditList"></div>
    <button class="survey-add-btn" onclick="addSurveyLibQ()"><i class="fas fa-plus"></i> 添加问题</button>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="saveSurveyLibItem()">保存</button>
  `;
  window.currentModalId = showModal(item ? '编辑对方问卷' : '新建对方问卷', body, footer);
  renderSurveyLibEditor();
}

function renderSurveyLibEditor() {
  const list = document.getElementById('surveyLibEditList');
  if (!list) return;
  
  if (surveyLibEditData.length === 0) {
    list.innerHTML = '<div class="survey-empty-tip">尚未添加问题，点击下方"添加问题"开始编辑</div>';
    return;
  }
  
  list.innerHTML = surveyLibEditData.map((q, qi) => `
    <div class="survey-editor-q">
      <div class="q-head">
        <span style="font-size:12px;color:var(--primary);font-weight:600;flex-shrink:0;">Q${qi + 1}</span>
        <input type="text" class="input" placeholder="输入问题" value="${escapeAttr(q.text || '')}" oninput="updSurveyLibQText(${qi}, this.value)">
        <select class="q-type-sel" onchange="updSurveyLibQType(${qi}, this.value)">
          <option value="single" ${q.type !== 'multi' ? 'selected' : ''}>单选</option>
          <option value="multi" ${q.type === 'multi' ? 'selected' : ''}>多选</option>
        </select>
        <div class="opt-del" title="删除问题" onclick="delSurveyLibQ(${qi})"><i class="fas fa-trash"></i></div>
      </div>
      ${(q.options || []).map((opt, oi) => `
        <div class="survey-opt-row">
          <span class="opt-idx">${oi + 1}</span>
          <input type="text" class="input" placeholder="选项内容" value="${escapeAttr(opt)}" oninput="updSurveyLibOpt(${qi}, ${oi}, this.value)">
          <div class="opt-del" onclick="delSurveyLibOpt(${qi}, ${oi})"><i class="fas fa-times"></i></div>
        </div>
      `).join('')}
      <button class="survey-add-btn" onclick="addSurveyLibOpt(${qi})"><i class="fas fa-plus"></i> 添加选项</button>
    </div>
  `).join('');
}

function addSurveyLibQ() { surveyLibEditData.push({ text: '', type: 'single', options: ['', ''] }); renderSurveyLibEditor(); }
function delSurveyLibQ(qi) { surveyLibEditData.splice(qi, 1); renderSurveyLibEditor(); }
function updSurveyLibQText(qi, val) { surveyLibEditData[qi].text = val; }
function updSurveyLibQType(qi, val) { surveyLibEditData[qi].type = val; }
function updSurveyLibOpt(qi, oi, val) { surveyLibEditData[qi].options[oi] = val; }
function delSurveyLibOpt(qi, oi) { surveyLibEditData[qi].options.splice(oi, 1); renderSurveyLibEditor(); }
function addSurveyLibOpt(qi) { surveyLibEditData[qi].options.push(''); renderSurveyLibEditor(); }

function saveSurveyLibItem() {
  const title = document.getElementById('surveyLibTitle').value.trim() || '未命名问卷';
  const questions = surveyLibEditData
    .map(q => ({
      text: (q.text || '').trim(),
      type: q.type || 'single',
      options: (q.options || []).map(o => o.trim()).filter(o => o)
    }))
    .filter(q => q.text && q.options.length >= 2);
  
  if (questions.length === 0) {
    showToast('请至少完善一道题（题目+两个选项）');
    return;
  }
  
  const lib = getSurveyLibrary();
  if (surveyLibEditId) {
    const item = lib.find(i => i.id === surveyLibEditId);
    if (item) {
      item.title = title;
      item.questions = questions;
    }
  } else {
    lib.push({ id: generateId(), title, questions, enabled: true });
  }
  
  saveData();
  renderSurveyLibrary();
  closeModal(window.currentModalId);
  showToast('已保存到对方问卷库');
}

// 预设问卷导入
function showSurveyPresetPicker() {
  const body = SURVEY_PRESETS.map((p, i) => `
    <button class="survey-pick-card" onclick="importSurveyPreset(${i})">
      <div class="pick-icon"><i class="fas fa-box-open"></i></div>
      <div class="pick-info">
        <div class="pick-title">${escapeHtml(p.title)}</div>
        <div class="pick-meta">${p.questions.length} 道题 · 点击导入到对方问卷库</div>
      </div>
      <i class="fas fa-chevron-right pick-go"></i>
    </button>
  `).join('');
  window.surveyPresetModalId = showModal('导入预设问卷', body);
}

function importSurveyPreset(idx) {
  const p = SURVEY_PRESETS[idx];
  if (!p) return;
  
  getSurveyLibrary().push({
    id: generateId(),
    title: p.title,
    questions: JSON.parse(JSON.stringify(p.questions)),
    enabled: true
  });
  saveData();
  renderSurveyLibrary();
  
  if (window.surveyPresetModalId) {
    closeModal(window.surveyPresetModalId);
    window.surveyPresetModalId = null;
  }
  showToast('已导入「' + p.title + '」');
}

// ===== 让对方选择发送问卷 =====
function openSurveyFromContactPicker() {
  if (!appData.currentChatId) { showToast('请先选择一个会话'); return; }
  
  const target = appData.currentChatType === 'group'
    ? appData.groups.find(g => g.id === appData.currentChatId)
    : appData.contacts.find(c => c.id === appData.currentChatId);
  const targetName = target ? target.name : '对方';
  const lib = getSurveyLibrary().filter(i => i.enabled !== false && (i.questions || []).length > 0);
  
  if (lib.length === 0) {
    showToast('对方问卷库为空，请先在上方添加问卷');
    return;
  }
  
  const body = `
    <div class="call-picker-tip">「${escapeHtml(targetName)}」将从下方问卷中挑选一份发给你；点「让对方自主选择」则由TA随机挑选。</div>
    <button class="call-all-btn" onclick="sendSurveyFromContact('random')">
      <i class="fas fa-dice"></i> 让对方自主选择（随机）
    </button>
    ${lib.map(item => `
      <button class="survey-pick-card" onclick="sendSurveyFromContact('${item.id}')">
        <div class="pick-icon"><i class="fas fa-clipboard-list"></i></div>
        <div class="pick-info">
          <div class="pick-title">${escapeHtml(item.title || '未命名问卷')}</div>
          <div class="pick-meta">${item.questions.length} 道题 · 指定对方发送这份</div>
        </div>
        <i class="fas fa-paper-plane pick-go"></i>
      </button>
    `).join('')}
  `;
  window.surveyPickModalId = showModal('对方发送问卷', body);
}

// 对方发送问卷（libId 为 'random' 时由对方自主随机挑选）
function sendSurveyFromContact(libId) {
  if (!appData.currentChatId) { showToast('请先选择一个会话'); return; }
  
  const lib = getSurveyLibrary();
  let item;
  if (libId === 'random') {
    const enabled = lib.filter(i => i.enabled !== false && (i.questions || []).length > 0);
    if (enabled.length === 0) { showToast('对方问卷库为空'); return; }
    item = randomPick(enabled);
  } else {
    item = lib.find(i => i.id === libId);
    if (!item) { showToast('问卷不存在'); return; }
  }
  
  // 关闭选择弹窗
  if (window.surveyPickModalId) {
    closeModal(window.surveyPickModalId);
    window.surveyPickModalId = null;
  }
  
  const targetType = appData.currentChatType;
  const targetId = appData.currentChatId;
  const survey = { title: item.title, questions: JSON.parse(JSON.stringify(item.questions)) };
  
  showToast('对方正在挑选问卷…');
  
  // 对方先发一条开场白，再发送问卷
  setTimeout(() => {
    const exists = targetType === 'group'
      ? appData.groups.some(g => g.id === targetId)
      : appData.contacts.some(c => c.id === targetId);
    if (!exists) return;
    
    const senderInfo = getReplySender(targetType, targetId);
    addMessageTo(targetType, targetId, {
      type: 'text',
      content: randomPick(SURVEY_OPENERS),
      sender: senderInfo.id,
      time: Date.now()
    });
    
    // 稍后发送问卷本体
    setTimeout(() => {
      const stillExists = targetType === 'group'
        ? appData.groups.some(g => g.id === targetId)
        : appData.contacts.some(c => c.id === targetId);
      if (!stillExists) return;
      
      addMessageTo(targetType, targetId, {
        type: 'survey',
        content: '[问卷] ' + survey.title,
        sender: getReplySender(targetType, targetId).id,
        time: Date.now(),
        survey
      });
    }, randomInt(800, 1800));
  }, randomInt(1500, 3500));
}

// ==================== 对方随时主动发问卷（定时随机） ====================
let surveyAutoTimer = null;

function stopSurveyAutoTimer() {
  if (surveyAutoTimer) {
    clearTimeout(surveyAutoTimer);
    surveyAutoTimer = null;
  }
}

function restartSurveyAutoTimer() {
  stopSurveyAutoTimer();
  if (!appData.currentChatId) return;
  
  const convSet = getConvSettings(appData.currentChatType, appData.currentChatId);
  if (!convSet.surveyAutoEnabled) return;
  
  scheduleNextSurveyAuto();
}

// 完全随机延迟：1 ~ 180 分钟内任一时刻，由对方"自己决定"，不受我方控制
function randomSurveyDelayMs() {
  return randomInt(1, 180) * 60 * 1000;
}

function scheduleNextSurveyAuto() {
  const targetType = appData.currentChatType;
  const targetId = appData.currentChatId;
  if (!targetId) return;
  
  const delay = randomSurveyDelayMs();
  surveyAutoTimer = setTimeout(() => {
    const exists = targetType === 'group'
      ? appData.groups.some(g => g.id === targetId)
      : appData.contacts.some(c => c.id === targetId);
    
    if (exists) {
      const libKey = (targetType === 'group' ? 'group_' : 'contact_') + targetId;
      const lib = (appData.surveyLibrary[libKey] || [])
        .filter(i => i.enabled !== false && (i.questions || []).length > 0);
      
      // 问卷库非空时对方才主动发送（空库本轮跳过，等待问卷入库）
      if (lib.length > 0) {
        const item = randomPick(lib);
        const survey = { title: item.title, questions: JSON.parse(JSON.stringify(item.questions)) };
        const senderInfo = getReplySender(targetType, targetId);
        
        addMessageTo(targetType, targetId, {
          type: 'text',
          content: randomPick(SURVEY_OPENERS),
          sender: senderInfo.id,
          time: Date.now()
        });
        
        setTimeout(() => {
          const stillExists = targetType === 'group'
            ? appData.groups.some(g => g.id === targetId)
            : appData.contacts.some(c => c.id === targetId);
          if (!stillExists) return;
          
          addMessageTo(targetType, targetId, {
            type: 'survey',
            content: '[问卷] ' + survey.title,
            sender: getReplySender(targetType, targetId).id,
            time: Date.now(),
            survey
          });
        }, randomInt(800, 1800));
      }
    }
    
    // 继续下一轮（开关仍开启且仍是当前会话），下一轮时机再次完全随机
    const convSet = getConvSettings(targetType, targetId);
    if (convSet.surveyAutoEnabled && appData.currentChatId === targetId && appData.currentChatType === targetType) {
      scheduleNextSurveyAuto();
    }
  }, delay);
}

// 打开作答弹窗
function openSurveyAnswerModal(msgIndex) {
  if (!appData.currentChatId) return;
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const records = appData.chatRecords[key] || [];
  const msg = records[msgIndex];
  if (!msg || !msg.survey) return;
  
  const s = msg.survey;
  const body = `
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;">
      <i class="fas fa-clipboard-list" style="color:var(--primary);"></i>
      ${escapeHtml(s.title || '问卷')} · 共 ${s.questions.length} 题
    </div>
    ${s.questions.map((q, qi) => `
      <div class="survey-answer-q">
        <div class="q-title">${qi + 1}. ${escapeHtml(q.text)}<span class="q-type-tag">${q.type === 'multi' ? '多选' : '单选'}</span></div>
        ${q.options.map((opt, oi) => `
          <label class="survey-answer-opt">
            <input type="${q.type === 'multi' ? 'checkbox' : 'radio'}" name="survey_q_${qi}" value="${escapeAttr(opt)}">
            <span>${escapeHtml(opt)}</span>
          </label>
        `).join('')}
      </div>
    `).join('')}
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="submitSurveyAnswer(${msgIndex})">提交问卷</button>
  `;
  
  window.currentModalId = showModal('作答问卷', body, footer);
}

// 提交我的作答，结果以消息形式保存
function submitSurveyAnswer(msgIndex) {
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const records = appData.chatRecords[key] || [];
  const msg = records[msgIndex];
  if (!msg || !msg.survey) return;
  
  // 收集答案
  const answers = msg.survey.questions.map((q, qi) => {
    const selected = Array.from(document.querySelectorAll(`input[name="survey_q_${qi}"]:checked`)).map(el => el.value);
    return selected;
  });
  
  // 校验单选题必答
  for (let i = 0; i < answers.length; i++) {
    if (msg.survey.questions[i].type !== 'multi' && answers[i].length === 0) {
      showToast(`第 ${i + 1} 题为单选题，请选择答案`);
      return;
    }
  }
  
  closeModal(window.currentModalId);
  
  addMessage({
    type: 'survey',
    content: '[问卷作答] ' + (msg.survey.title || '问卷'),
    sender: getSelfId(),
    time: Date.now(),
    survey: { ...msg.survey, answers }
  });
  
  showToast('问卷已提交');
  scheduleReply();
  
  // 对方延时对作答给出反馈（引用作答内容）
  const targetType = appData.currentChatType;
  const targetId = appData.currentChatId;
  const answeredTitle = msg.survey.title || '问卷';
  setTimeout(() => {
    const exists = targetType === 'group'
      ? appData.groups.some(g => g.id === targetId)
      : appData.contacts.some(c => c.id === targetId);
    if (!exists) return;
    
    const senderInfo = getReplySender(targetType, targetId);
    addMessageTo(targetType, targetId, {
      type: 'text',
      content: randomPick(SURVEY_FEEDBACKS),
      sender: senderInfo.id,
      time: Date.now(),
      quote: {
        sender: getSelfId(),
        content: '[问卷作答] ' + answeredTitle,
        type: 'text'
      }
    });
  }, randomInt(3, 8) * 1000);
}

// ==================== 悬浮通话窗拖拽 ====================
let floatingCallJustDragged = false;

(function initFloatingCallDrag() {
  const floatEl = document.getElementById('floatingCall');
  const handle = document.getElementById('callDragHandle');
  if (!floatEl || !handle) return;
  
  let dragging = false;
  let moved = false;
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;
  let rafId = null;
  let pendingPos = null;
  
  function onDown(e) {
    dragging = true;
    moved = false;
    const point = e.touches ? e.touches[0] : e;
    startX = point.clientX;
    startY = point.clientY;
    const rect = floatEl.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    // 首次拖拽切换为 left/top 定位
    floatEl.style.right = 'auto';
    floatEl.style.left = startLeft + 'px';
    floatEl.style.top = startTop + 'px';
    floatEl.classList.add('dragging');
    if (e.cancelable) e.preventDefault();
  }
  
  function applyPos() {
    if (pendingPos) {
      floatEl.style.left = pendingPos.x + 'px';
      floatEl.style.top = pendingPos.y + 'px';
      pendingPos = null;
    }
    rafId = null;
  }
  
  function onMove(e) {
    if (!dragging) return;
    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - startX;
    const dy = point.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    
    const rect = floatEl.getBoundingClientRect();
    // 边界限制在可视窗口内
    let x = Math.max(4, Math.min(startLeft + dx, window.innerWidth - rect.width - 4));
    let y = Math.max(4, Math.min(startTop + dy, window.innerHeight - rect.height - 4));
    
    // rAF 节流，拖拽顺滑
    pendingPos = { x, y };
    if (!rafId) rafId = requestAnimationFrame(applyPos);
    
    if (e.cancelable) e.preventDefault();
  }
  
  function onUp() {
    if (!dragging) return;
    dragging = false;
    floatEl.classList.remove('dragging');
    if (moved) {
      floatingCallJustDragged = true;
      setTimeout(() => { floatingCallJustDragged = false; }, 100);
    }
  }
  
  handle.addEventListener('mousedown', onDown);
  handle.addEventListener('touchstart', onDown, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchend', onUp);
})();

function onFloatingCallClick() {
  if (floatingCallJustDragged) return;
  expandCall();
}

// ==================== 表情面板 ====================
const defaultEmojis = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃',
  '😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
  '🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫',
  '🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬',
  '😮‍💨','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕',
  '🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳',
  '🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯',
  '😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢',
  '😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤',
  '😡','😠','🤬','😈','👿','💀','💩','🤡','👹','👺'
];

let currentEmojiTab = 'emoji';

function renderEmojiPanel() {
  const grid = document.getElementById('emojiGrid');
  
  if (currentEmojiTab === 'emoji') {
    grid.innerHTML = defaultEmojis.map(emoji => 
      `<div class="emoji-item" onclick="insertEmoji('${emoji}')">${emoji}</div>`
    ).join('');
  } else {
    if (appData.myEmojis.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="padding:20px;"><i class="fas fa-face-smile" style="font-size:32px;"></i><p>暂无自定义表情</p></div>';
    } else {
      grid.innerHTML = appData.myEmojis.map((emoji, idx) => 
        `<div class="emoji-item custom-emoji-item" onclick="sendEmoji(${idx})">
          <img src="${emoji}" alt="">
        </div>`
      ).join('');
    }
  }
}

function insertEmoji(emoji) {
  const input = document.getElementById('messageInput');
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const value = input.value;
  input.value = value.substring(0, start) + emoji + value.substring(end);
  input.selectionStart = input.selectionEnd = start + emoji.length;
  input.focus();
  autoResizeTextarea();
}

function sendEmoji(idx) {
  if (!appData.currentChatId) return;
  
  addMessage({
    type: 'image',
    content: appData.myEmojis[idx],
    sender: getSelfId(),
    time: Date.now(),
    isEmoji: true
  });
  
  document.getElementById('emojiPanel').classList.remove('show');
  document.getElementById('emojiBtn').classList.remove('active');
  
  scheduleReply();
}

// 继续按钮：对方立即主动发言
document.getElementById('continueBtn').addEventListener('click', triggerContinue);

// 问卷快捷入口
document.getElementById('surveyBtn').addEventListener('click', openSurveyQuickMenu);

document.getElementById('emojiBtn').addEventListener('click', () => {
  const panel = document.getElementById('emojiPanel');
  const btn = document.getElementById('emojiBtn');
  panel.classList.toggle('show');
  btn.classList.toggle('active');
  if (panel.classList.contains('show')) {
    renderEmojiPanel();
  }
});

document.querySelectorAll('.emoji-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentEmojiTab = tab.dataset.tab;
    renderEmojiPanel();
  });
});

// ==================== 图片上传 ====================
document.getElementById('imageBtn').addEventListener('click', () => {
  document.getElementById('imageUpload').click();
});

document.getElementById('imageUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && appData.currentChatId) {
    fileToBase64(file).then(base64 => {
      addMessage({
        type: 'image',
        content: base64,
        sender: getSelfId(),
        time: Date.now()
      });
      scheduleReply();
    });
  }
  e.target.value = '';
});

// ==================== 图片预览 ====================
function openImagePreview(src) {
  document.getElementById('previewImage').src = src;
  document.getElementById('imagePreview').classList.add('show');
}

function closeImagePreview() {
  document.getElementById('imagePreview').classList.remove('show');
}

// ==================== 戳一戳 ====================
function pokeContact() {
  if (!appData.currentChatId) return;
  
  let content;
  if (appData.currentChatType === 'group') {
    const group = appData.groups.find(g => g.id === appData.currentChatId);
    content = `我戳了戳群成员`;
  } else {
    const contact = appData.contacts.find(c => c.id === appData.currentChatId);
    content = `我戳了戳 ${contact?.name || ''}`;
  }
  
  addMessage({
    type: 'poke',
    content,
    sender: getSelfId(),
    time: Date.now()
  });
  
  // 对方可能回戳
  if (Math.random() < 0.5) {
    const pokeType = appData.currentChatType;
    const pokeId = appData.currentChatId;
    setTimeout(() => {
      const senderInfo = getReplySender(pokeType, pokeId);
      addMessageTo(pokeType, pokeId, {
        type: 'poke',
        content: `${senderInfo.name} 戳了戳你`,
        sender: senderInfo.id,
        time: Date.now()
      });
    }, randomInt(500, 2000));
  }
}

// ==================== 清空聊天记录 ====================
function clearChatHistory() {
  if (!appData.currentChatId) return;
  if (!confirm('确定清空当前聊天记录吗？')) return;
  
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  appData.chatRecords[key] = [];
  saveData();
  renderChatMessages();
  renderConversations();
  showToast('已清空');
}

// ==================== 通讯录页面 ====================
let currentGroupFilter = 'all';

function renderContacts() {
  const list = document.getElementById('contactsList');
  const searchTerm = document.getElementById('contactSearch')?.value?.toLowerCase() || '';
  
  // 渲染分组标签
  const groups = [...new Set(appData.contacts.map(c => c.group || '未分组'))];
  const groupTabs = document.getElementById('groupTabs');
  groupTabs.innerHTML = `
    <div class="group-tab ${currentGroupFilter === 'all' ? 'active' : ''}" onclick="filterByGroup('all')">全部</div>
    ${groups.map(g => 
      `<div class="group-tab ${currentGroupFilter === g ? 'active' : ''}" onclick="filterByGroup('${g}')">${g}</div>`
    ).join('')}
  `;
  
  // 过滤联系人
  let filtered = appData.contacts;
  if (currentGroupFilter !== 'all') {
    filtered = filtered.filter(c => c.group === currentGroupFilter);
  }
  if (searchTerm) {
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(searchTerm) ||
      (c.status && c.status.toLowerCase().includes(searchTerm))
    );
  }
  
  // 按名称排序
  filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  
  // 群聊部分
  let html = '';
  if (currentGroupFilter === 'all' && appData.groups.length > 0) {
    html += `<div class="section-title">群聊 <span class="section-count">${appData.groups.length}</span></div>`;
    html += appData.groups.map(group => `
      <div class="contact-item" onclick="onGroupClick('${group.id}')">
        ${getGroupAvatarHTML(group)}
        <div class="contact-info">
          <div class="contact-name">${group.name}</div>
          <div class="contact-status">${group.memberIds.length} 位成员</div>
        </div>
        <div class="contact-tag">群聊</div>
      </div>
    `).join('');
    html += `<div class="section-title">联系人 <span class="section-count">${filtered.length}</span></div>`;
  }
  
  if (filtered.length === 0) {
    const isFiltering = currentGroupFilter !== 'all' || !!searchTerm;
    html += `
      <div class="empty-state">
        <i class="fas fa-${isFiltering ? 'user-slash' : 'address-book'}"></i>
        <p>${isFiltering ? '没有匹配的联系人' : '还没有联系人'}</p>
        ${!isFiltering ? `
        <div class="empty-actions">
          <div class="quick-add-btn contact-btn" onclick="openAddContactModal()">
            <i class="fas fa-user-plus"></i><span class="btn-label">新建联系人</span>
          </div>
          <div class="quick-add-btn group-btn" onclick="openCreateGroupModal()">
            <i class="fas fa-users"></i><span class="btn-label">创建群聊</span>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  } else {
    html += filtered.map(contact => `
      <div class="contact-item" onclick="onContactClick('${contact.id}')">
        ${getAvatarHTML(contact.avatar, contact.name)}
        <div class="contact-info">
          <div class="contact-name">${contact.name}</div>
          <div class="contact-status">${contact.status || '暂无签名'}</div>
        </div>
        <div class="contact-tag">${contact.group || '未分组'}</div>
      </div>
    `).join('');
  }
  
  list.innerHTML = html;
}

function filterByGroup(group) {
  currentGroupFilter = group;
  renderContacts();
}

function onContactClick(contactId) {
  const contact = appData.contacts.find(c => c.id === contactId);
  if (!contact) return;
  
  const body = `
    <div style="text-align:center;margin-bottom:14px;">
      ${getAvatarHTML(contact.avatar, contact.name, 'lg')}
      <div style="font-size:18px;font-weight:500;margin-top:10px;">${contact.name}</div>
      <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${contact.status || '暂无签名'}</div>
      <div style="font-size:12px;color:var(--text-tertiary);margin-top:4px;">分组：${contact.group || '未分组'} · 钱包 ¥${fmtMoney(getContactWallet(contactId))}</div>
    </div>
    <div class="profile-quick-row">
      <div class="profile-quick-btn" onclick="closeModal(currentModalId);momentsFilter='${contactId}';syncMomentsFilterBtn();switchPage('moments')"><i class="fas fa-camera"></i>朋友圈</div>
      <div class="profile-quick-btn" onclick="closeModal(currentModalId);switchPage('settings');openPanelById('notesCollapsible');switchNotesTab('notes')"><i class="fas fa-pen-nib"></i>记事本</div>
      <div class="profile-quick-btn" onclick="closeModal(currentModalId);switchPage('settings');openPanelById('notesCollapsible');switchNotesTab('todos')"><i class="fas fa-list-check"></i>待办</div>
      <div class="profile-quick-btn" onclick="openContactWalletModal('${contactId}')"><i class="fas fa-wallet"></i>钱包</div>
    </div>
    <div class="ring-set-row"><label>来电铃声</label>
      <select onchange="setContactRingtone('${contactId}','ringtoneCall',this.value)">
        <option value="" ${!contact.ringtoneCall ? 'selected' : ''}>跟随全局</option>
        ${getRingtoneOptionsHtml(contact.ringtoneCall)}
      </select>
    </div>
    <div class="ring-set-row"><label>消息提示音</label>
      <select onchange="setContactRingtone('${contactId}','ringtoneMsg',this.value)">
        <option value="" ${!contact.ringtoneMsg ? 'selected' : ''}>跟随全局</option>
        ${getRingtoneOptionsHtml(contact.ringtoneMsg)}
      </select>
    </div>
    <div class="ring-set-row" style="border-bottom:1px solid var(--border-color);padding-bottom:12px;">
      <label>私聊免打扰</label>
      <div class="toggle ${contact.msgDnd ? 'active' : ''}" style="margin-left:auto;" onclick="toggleContactMsgDnd('${contactId}')"></div>
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>
    <button class="btn btn-primary" onclick="closeModal(currentModalId);selectConversation('${contact.id}','contact');switchPage('chat');">发消息</button>
    <button class="btn btn-secondary" onclick="closeModal(currentModalId);openAddContactModal(appData.contacts.find(c=>c.id==='${contact.id}'))">编辑</button>
    <button class="btn btn-danger" onclick="closeModal(currentModalId);deleteContact('${contact.id}')">删除</button>
  `;
  
  window.currentModalId = showModal('联系人详情', body, footer);
}

function onGroupClick(groupId) {
  const group = appData.groups.find(g => g.id === groupId);
  if (!group) return;
  
  const memberNames = group.memberIds.map(id => {
    const c = appData.contacts.find(ct => ct.id === id);
    return c ? c.name : '未知';
  }).join('、');
  
  const body = `
    <div style="text-align:center;margin-bottom:14px;">
      <div style="display:flex;justify-content:center;">${getGroupAvatarHTML(group)}</div>
      <div style="font-size:18px;font-weight:500;margin-top:10px;">${group.name}</div>
      <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${group.memberIds.length} 位成员</div>
      <div style="font-size:12px;color:var(--text-tertiary);margin-top:8px;line-height:1.5;">成员：${memberNames || '暂无成员'}</div>
    </div>
    <div class="ring-set-row"><label>群消息提示音</label>
      <select onchange="setGroupRingtone('${group.id}',this.value)">
        <option value="" ${!group.groupRingtone ? 'selected' : ''}>跟随全局</option>
        ${getRingtoneOptionsHtml(group.groupRingtone)}
      </select>
    </div>
    <div class="ring-set-row" style="border-bottom:1px solid var(--border-color);padding-bottom:12px;">
      <label>群会话免打扰</label>
      <div class="toggle ${group.groupDnd ? 'active' : ''}" style="margin-left:auto;" onclick="toggleGroupDnd('${group.id}')"></div>
    </div>
    <div class="setting-desc" style="font-size:11px;">开启后群消息不播提示音；红包领取通知音效不受群免打扰控制</div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>
    <button class="btn btn-primary" onclick="closeModal(currentModalId);selectConversation('${group.id}','group');switchPage('chat');">发消息</button>
    <button class="btn btn-secondary" onclick="closeModal(currentModalId);openCreateGroupModal(appData.groups.find(g=>g.id==='${group.id}'))">管理</button>
    <button class="btn btn-danger" onclick="closeModal(currentModalId);deleteGroup('${group.id}')">解散</button>
  `;
  
  window.currentModalId = showModal('群聊详情', body, footer);
}

document.getElementById('contactSearch').addEventListener('input', renderContacts);

// 信件搜索输入即时过滤
document.getElementById('letterSearch').addEventListener('input', renderLetters);

// ==================== 信件模块 ====================
// 信件筛选状态：all / pending / replied
let letterFilter = 'all';

function setLetterFilter(filter) {
  letterFilter = filter;
  document.querySelectorAll('#letterFilterTabs .letter-filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });
  renderLetters();
}

// 获取信件状态：pending 等待回信 / sent 已寄出（超时未回）/ replied 已回复
function getLetterStatus(letter) {
  if (letter.replied) return 'replied';
  if (letter.replyAt > Date.now()) return 'pending';
  return 'sent';
}

function renderLetters() {
  const list = document.getElementById('lettersList');
  const searchTerm = document.getElementById('letterSearch')?.value?.trim().toLowerCase() || '';

  // 更新筛选标签上的数量角标
  const counts = { all: appData.letters.length, pending: 0, replied: 0 };
  appData.letters.forEach(l => {
    const st = getLetterStatus(l);
    if (st === 'pending') counts.pending++;
    if (st === 'replied') counts.replied++;
  });
  document.querySelectorAll('#letterFilterTabs .letter-filter-tab').forEach(tab => {
    const cnt = counts[tab.dataset.filter] || 0;
    const label = tab.dataset.filter === 'all' ? '全部' : tab.dataset.filter === 'pending' ? '等待回信' : '已回复';
    tab.innerHTML = label + (cnt > 0 ? `<span class="tab-count">${cnt}</span>` : '');
  });

  if (appData.letters.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-envelope-open"></i>
        <p>还没有信件</p>
        <p class="empty-subtitle">点击右上角写一封信</p>
      </div>
    `;
    return;
  }
  
  // 按时间倒序
  let sorted = [...appData.letters].sort((a, b) => b.createdAt - a.createdAt);

  // 状态筛选
  if (letterFilter !== 'all') {
    sorted = sorted.filter(l => getLetterStatus(l) === letterFilter);
  }

  // 关键词搜索：标题 / 内容 / 收件人 / 回信内容
  if (searchTerm) {
    sorted = sorted.filter(l =>
      (l.title || '').toLowerCase().includes(searchTerm) ||
      (l.content || '').toLowerCase().includes(searchTerm) ||
      (l.recipient || '').toLowerCase().includes(searchTerm) ||
      (l.replyContent || '').toLowerCase().includes(searchTerm)
    );
  }

  if (sorted.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>${searchTerm ? '没有匹配的信件' : '该分类下暂无信件'}</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = sorted.map(letter => {
    let statusText, statusClass, extraMeta = '';
    if (letter.deliverAt && letter.deliverAt > Date.now()) {
      const leftMin = Math.max(1, Math.round((letter.deliverAt - Date.now()) / 60000));
      statusText = '在途';
      statusClass = 'sent';
      extraMeta = `<span class="letter-eta"><i class="far fa-clock"></i> 约 ${leftMin} 分钟后送达</span>`;
    } else if (letter.replied) {
      statusText = '已回复';
      statusClass = 'replied';
    } else if (letter.replyAt > Date.now()) {
      statusText = '等待回信';
      statusClass = 'pending';
      // 显示预计回信时间
      const waitMs = letter.replyAt - Date.now();
      const waitHrs = waitMs / (60 * 60 * 1000);
      const eta = waitHrs >= 1
        ? `约 ${Math.floor(waitHrs)} 小时${Math.round(waitHrs % 1 * 60) > 0 ? ' ' + Math.round(waitHrs % 1 * 60) + ' 分' : ''}后`
        : `约 ${Math.max(1, Math.round(waitMs / (60 * 1000)))} 分钟后`;
      extraMeta = `<span class="letter-eta"><i class="far fa-clock"></i> ${eta}回信</span>`;
    } else {
      statusText = '已寄出';
      statusClass = 'sent';
    }
    
    // 预览转义并截断，防止长内容破坏布局
    const previewRaw = (letter.content || '').replace(/\s+/g, ' ').trim();
    const preview = previewRaw.length > 60 ? previewRaw.substring(0, 60) + '…' : previewRaw;
    
    return `
      <div class="letter-item" onclick="openLetterDetail('${letter.id}')">
        <div class="letter-title">
          <span>${escapeHtml(letter.title || '无标题')}</span>
          <span class="letter-status ${statusClass}">${statusText}</span>
        </div>
        <div class="letter-preview">${escapeHtml(preview)}</div>
        <div class="letter-meta">
          <span>${formatFullTime(letter.createdAt)}</span>
          <span>收件人：${escapeHtml(letter.recipient || '未知')}</span>
          ${letter.readAt ? '<span>· 对方已读</span>' : ''}
          ${extraMeta}
        </div>
      </div>
    `;
  }).join('');
}

function openWriteLetterModal() {
  const contactOptions = appData.contacts.map(c => 
    `<option value="${c.id}">${c.name}</option>`
  ).join('');
  
  const body = `
    <div class="form-group">
      <label>收件人</label>
      <select class="select" id="letterRecipient">
        ${contactOptions || '<option value="">请先添加联系人</option>'}
      </select>
    </div>
    <div class="form-group">
      <label>标题</label>
      <input type="text" class="input" id="letterTitle" placeholder="信件标题（可选）">
    </div>
    <div class="form-group">
      <label>内容 <span class="letter-word-count" id="letterWordCount">0 字</span></label>
      <textarea class="textarea" id="letterContent" placeholder="写下你想说的话..." rows="6" oninput="updateLetterWordCount()"></textarea>
    </div>
    <div class="form-group">
      <label>回信延迟（小时）</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="number" class="input" id="letterDelayInput" value="${appData.settings.letterDelayMin}" min="0" style="width:80px;">
        <span style="color:var(--text-secondary);">~</span>
        <input type="number" class="input" id="letterDelayMaxInput" value="${appData.settings.letterDelayMax}" min="1" style="width:80px;">
        <span style="color:var(--text-secondary);font-size:12px;">小时后回信</span>
      </div>
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="sendLetter()">寄出</button>
  `;
  
  window.currentModalId = showModal('写新信', body, footer);
}

// 信件字数统计
function updateLetterWordCount() {
  const el = document.getElementById('letterWordCount');
  const textarea = document.getElementById('letterContent');
  if (!el || !textarea) return;
  const len = textarea.value.length;
  el.textContent = len + ' 字';
  el.classList.toggle('warn', len > 500);
}

function sendLetter() {
  const recipientId = document.getElementById('letterRecipient').value;
  if (!recipientId) {
    showToast('请选择收件人');
    return;
  }
  
  const content = document.getElementById('letterContent').value.trim();
  if (!content) {
    showToast('请输入信件内容');
    return;
  }
  
  const title = document.getElementById('letterTitle').value.trim();
  const delayMin = parseInt(document.getElementById('letterDelayInput').value) || appData.settings.letterDelayMin;
  const delayMax = parseInt(document.getElementById('letterDelayMaxInput').value) || appData.settings.letterDelayMax;
  
  const contact = appData.contacts.find(c => c.id === recipientId);
  
  const letter = {
    id: generateId(),
    recipientId,
    recipient: contact?.name || '未知',
    title,
    content,
    createdAt: Date.now(),
    deliverAt: Date.now() + Math.max(0, appData.settings.letterDeliverDelay || 0) * 60 * 1000,
    replyAt: Date.now() + randomInt(delayMin, delayMax) * 60 * 60 * 1000,
    replied: false,
    replyContent: ''
  };
  
  appData.letters.push(letter);
  saveData();
  closeModal(window.currentModalId);
  renderLetters();
  showToast('信件已寄出');
  
  // 安排回信
  scheduleLetterReply(letter.id);
}

function scheduleLetterReply(letterId) {
  const letter = appData.letters.find(l => l.id === letterId);
  if (!letter || letter.replied) return;
  
  const delay = letter.replyAt - Date.now();
  if (delay <= 0) {
    generateLetterReply(letterId);
    return;
  }
  
  setTimeout(() => {
    generateLetterReply(letterId);
  }, Math.min(delay, 2147483000)); // 防止setTimeout溢出
}

function generateLetterReply(letterId) {
  const letter = appData.letters.find(l => l.id === letterId);
  if (!letter || letter.replied) return;
  
  // 从收件人的生效词库生成回信（独立词库优先，只使用启用的分类）
  const allWords = [];
  getWordGroupsForKey('contact', letter.recipientId).forEach(g => {
    pushGroupWords(g, allWords);
  });
  
  const wordCountMin = appData.settings.letterWordCountMin || 3;
  const wordCountMax = appData.settings.letterWordCountMax || 5;
  const wordCount = Math.floor(Math.random() * (wordCountMax - wordCountMin + 1)) + wordCountMin;
  let reply = '';
  for (let i = 0; i < wordCount; i++) {
    reply += randomPick(allWords.length > 0 ? allWords : ['你好', '嗯嗯', '好的']);
    if (Math.random() < 0.3) reply += '，';
    else if (Math.random() < 0.2) reply += '。';
  }
  if (!reply.endsWith('。')) reply += '。';
  
  letter.replied = true;
  letter.replyContent = reply;
  letter.repliedAt = Date.now();
  saveData();
  renderLetters();
  
  if (appData.settings.desktopNotify) {
    showNotification('收到回信', `来自${letter.recipient}的回信`, {
      tag: 'letter-reply', force: true,
      onClick: () => switchPage('letters')
    });
  }
}

function openLetterDetail(letterId) {
  const letter = appData.letters.find(l => l.id === letterId);
  if (!letter) return;
  if (!letter.readAt) { letter.readAt = Date.now(); saveData(); renderLetters(); }
  
  const replyHTML = letter.replied ? `
    <div class="letter-reply">
      <div class="reply-label">${letter.recipient} 的回信</div>
      <div class="letter-body">${letter.replyContent}</div>
      <div style="font-size:11px;color:var(--text-tertiary);margin-top:10px;text-align:right;">
        ${formatFullTime(letter.repliedAt)}
      </div>
    </div>
  ` : `
    <div style="text-align:center;padding:20px;color:var(--text-secondary);">
      <i class="fas fa-clock" style="font-size:32px;margin-bottom:8px;"></i>
      <p>等待回信中...</p>
      <p style="font-size:12px;">预计 ${formatFullTime(letter.replyAt)} 左右收到回信</p>
    </div>
  `;
  
  const body = `
    <div class="letter-detail">
      <div class="letter-header">
        <h3>${letter.title || '无标题'}</h3>
        <div class="meta">
          收件人：${letter.recipient} · ${formatFullTime(letter.createdAt)}
        </div>
      </div>
      <div class="letter-body">${letter.content}</div>
      ${replyHTML}
    </div>
  `;
  
  const footer = `
    <button class="btn btn-danger" onclick="deleteLetter('${letter.id}')">删除</button>
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>
  `;
  
  window.currentModalId = showModal('信件详情', body, footer);
}

function deleteLetter(letterId) {
  if (!confirm('确定删除这封信吗？')) return;
  
  appData.letters = appData.letters.filter(l => l.id !== letterId);
  saveData();
  closeModal(window.currentModalId);
  renderLetters();
  showToast('已删除');
}

// ==================== 设置 - 头像 ====================
function openAvatarSetting() {
  const body = `
    <div style="text-align:center;">
      <div id="avatarSettingPreview" style="width:100px;height:100px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 20px;overflow:hidden;">
        ${appData.myProfile.avatar ? `<img src="${appData.myProfile.avatar}" style="width:100%;height:100%;object-fit:cover;">` : getInitial(appData.myProfile.nickname)}
      </div>
      <button class="btn btn-primary" onclick="document.getElementById('avatarUpload').click()">
        <i class="fas fa-upload"></i> 上传头像
      </button>
      <input type="file" id="avatarUpload" accept="image/*" style="display:none;" onchange="handleAvatarUpload(event)">
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>
  `;
  
  window.currentModalId = showModal('我的头像', body, footer);
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (file) {
    fileToBase64(file).then(base64 => {
      appData.myProfile.avatar = base64;
      saveData();
      document.getElementById('avatarSettingPreview').innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover;">`;
      updateMyAvatarPreview();
      renderChatMessages();
      showToast('头像已更新');
    });
  }
}

function updateMyAvatarPreview() {
  const preview = document.getElementById('myAvatarPreview');
  if (preview) {
    if (appData.myProfile.avatar) {
      preview.innerHTML = `<img src="${appData.myProfile.avatar}" alt="">`;
    } else {
      preview.textContent = getInitial(appData.myProfile.nickname);
    }
  }
  // 同步昵称显示
  const nameEl = document.getElementById('myNicknameText');
  if (nameEl) nameEl.textContent = appData.myProfile.nickname || '我';
}

function openNicknameSetting() {
  const body = `
    <div class="form-group">
      <label>昵称</label>
      <input type="text" class="input" id="nicknameInput" value="${appData.myProfile.nickname}" placeholder="请输入昵称">
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="saveNickname()">保存</button>
  `;
  
  window.currentModalId = showModal('修改昵称', body, footer);
}

function saveNickname() {
  const nickname = document.getElementById('nicknameInput').value.trim();
  if (!nickname) {
    showToast('请输入昵称');
    return;
  }
  
  appData.myProfile.nickname = nickname;
  saveData();
  document.getElementById('myNicknameText').textContent = nickname;
  updateMyAvatarPreview();
  closeModal(window.currentModalId);
  showToast('昵称已更新');
}

// ==================== 设置 - 状态词库 ====================
function openStatusWordsModal() {
  const body = `
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <input type="text" class="input" id="newStatusWord" placeholder="输入新的状态词">
      <button class="btn btn-primary" style="padding:8px 16px;" onclick="addStatusWord()">添加</button>
    </div>
    <div id="statusWordsList" style="max-height:300px;overflow-y:auto;">
      ${renderStatusWordsList()}
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>
  `;
  
  window.currentModalId = showModal('状态词库管理', body, footer);
}

function renderStatusWordsList() {
  return appData.statusWords.map((word, idx) => `
    <div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color);gap:8px;">
      <span style="flex:1;">${word}</span>
      <button class="btn btn-danger" style="padding:4px 8px;font-size:12px;" onclick="deleteStatusWord(${idx})">删除</button>
    </div>
  `).join('');
}

function addStatusWord() {
  const input = document.getElementById('newStatusWord');
  const word = input.value.trim();
  if (!word) return;
  if (appData.statusWords.includes(word)) {
    showToast('该状态词已存在');
    return;
  }
  appData.statusWords.push(word);
  saveData();
  input.value = '';
  document.getElementById('statusWordsList').innerHTML = renderStatusWordsList();
}

function deleteStatusWord(idx) {
  if (appData.statusWords.length <= 1) {
    showToast('至少保留一个状态词');
    return;
  }
  appData.statusWords.splice(idx, 1);
  saveData();
  document.getElementById('statusWordsList').innerHTML = renderStatusWordsList();
}

// ==================== 设置 - 免打扰 ====================
function openDNDSetting(event) {
  if (event) event.stopPropagation();
  
  const body = `
    <div class="form-group">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <label style="margin:0;">启用免打扰</label>
        <div class="toggle ${appData.settings.dndEnabled ? 'active' : ''}" id="dndToggle" onclick="this.classList.toggle('active');appData.settings.dndEnabled=this.classList.contains('active');saveData();"></div>
      </div>
    </div>
    <div class="form-group">
      <label>开始时间</label>
      <input type="time" class="input" id="dndStartInput" value="${appData.settings.dndStart}">
    </div>
    <div class="form-group">
      <label>结束时间</label>
      <input type="time" class="input" id="dndEndInput" value="${appData.settings.dndEnd}">
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="saveDNDSetting()">保存</button>
  `;
  
  window.currentModalId = showModal('免打扰设置', body, footer);
}

function saveDNDSetting() {
  appData.settings.dndStart = document.getElementById('dndStartInput').value;
  appData.settings.dndEnd = document.getElementById('dndEndInput').value;
  appData.settings.dndEnabled = document.getElementById('dndToggle').classList.contains('active');
  saveData();
  updateDNDText();
  closeModal(window.currentModalId);
  showToast('已保存');
}

function updateDNDText() {
  const el = document.getElementById('dndText');
  if (el) {
    if (appData.settings.dndEnabled) {
      el.textContent = `${appData.settings.dndStart} - ${appData.settings.dndEnd}`;
    } else {
      el.textContent = '未设置';
    }
  }
}

// ==================== 词条库管理 ====================
let currentMenuGroupId = null;

function getCurrentWordGroup() {
  const groups = getActiveWordGroups();
  return groups.find(g => g.id === getActiveWordGroupId()) || groups[0];
}

// 收集分组中未屏蔽的词条（供回复/回信/朋友圈等抽取使用，屏蔽字卡不参与）
function pushGroupWords(g, arr) {
  if (!g.disabled && g.items) {
    const blocked = g.blocked || [];
    if (blocked.length === 0) arr.push(...g.items);
    else g.items.forEach(w => { if (!blocked.includes(w)) arr.push(w); });
  }
}

function renderWordCategories() {
  const list = document.getElementById('wordCategoryList');
  const activeGroups = getActiveWordGroups();
  const activeId = getActiveWordGroupId();
  list.innerHTML = activeGroups.map(group => {
    const isActive = activeId === group.id;
    const count = group.items ? group.items.length : 0;
    return `
      <div class="word-group-item ${isActive ? 'active' : ''} ${group.disabled ? 'disabled' : ''}" 
           onclick="switchWordGroup('${group.id}')"
           style="--group-color: ${group.color};">
        <span class="group-dot" style="background: ${group.color};"></span>
        <span class="group-name">${escapeHtml(group.name)}</span>
        <span class="group-count">${count}</span>
        <div class="group-menu" onclick="event.stopPropagation(); toggleGroupMenu(event, '${group.id}')">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
    `;
  }).join('') + `
    <div class="word-group-item add-group" onclick="addWordGroup()">
      <i class="fas fa-plus"></i> 新建分类
    </div>
  `;
}

function switchWordGroup(id) {
  const group = getActiveWordGroups().find(g => g.id === id);
  if (!group || group.disabled) return;
  setActiveWordGroupId(id);
  if (typeof wordSelected !== 'undefined') wordSelected.clear(); // 切换分类清空选择
  saveData();
  renderWordCategories();
  renderWordList();
  closeAllGroupMenus();
}

function toggleGroupMenu(e, id) {
  const menu = document.getElementById('globalGroupMenu');
  const group = getActiveWordGroups().find(g => g.id === id);
  const isOpen = menu.classList.contains('show') && currentMenuGroupId === id;
  
  closeAllGroupMenus();
  
  if (!isOpen && group) {
    currentMenuGroupId = id;
    
    // 更新菜单中的启用/禁用文字和图标
    const toggleText = document.getElementById('menuToggleText');
    const toggleIcon = menu.querySelectorAll('div')[1].querySelector('i');
    if (group.disabled) {
      toggleText.textContent = '启用';
      toggleIcon.className = 'fas fa-eye';
    } else {
      toggleText.textContent = '禁用';
      toggleIcon.className = 'fas fa-eye-slash';
    }
    
    // 计算菜单位置
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 130;
    let left = rect.right - menuWidth + 8;
    let top = rect.bottom + 6;
    
    // 防止超出右边界
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }
    // 防止超出左边界
    if (left < 10) left = 10;
    
    // 防止超出底部
    const menuHeight = 120;
    if (top + menuHeight > window.innerHeight - 10) {
      top = rect.top - menuHeight - 6;
    }
    
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    
    // 延迟添加show类以触发过渡动画
    requestAnimationFrame(() => {
      menu.classList.add('show');
    });
  }
}

function closeAllGroupMenus() {
  const menu = document.getElementById('globalGroupMenu');
  if (menu) menu.classList.remove('show');
  currentMenuGroupId = null;
}

document.addEventListener('click', closeAllGroupMenus);

// 滚动和窗口大小改变时关闭菜单
window.addEventListener('scroll', closeAllGroupMenus, true);
window.addEventListener('resize', closeAllGroupMenus);

function addWordGroup() {
  showGroupEditModal(null);
}

function editWordGroup(id) {
  closeAllGroupMenus();
  const group = getActiveWordGroups().find(g => g.id === id);
  if (group) showGroupEditModal(group);
}

function showGroupEditModal(group) {
  const isEdit = !!group;
  const colors = ['#89b8e8', '#b8a8e0', '#86c9b4', '#d8b89c', '#e8a5b8', '#6ec2bc', '#8e9ce0', '#e8a880', '#f0a4b4', '#78c4a8'];
  const selectedColor = group ? group.color : colors[0];
  
  const body = `
    <div class="form-group">
      <label>分类名称</label>
      <input type="text" class="input" id="groupNameInput" placeholder="请输入分类名称" value="${isEdit ? escapeHtml(group.name) : ''}">
    </div>
    <div class="form-group">
      <label>分类颜色</label>
      <div class="color-picker">
        ${colors.map(c => `
          <div class="color-option ${c === selectedColor ? 'active' : ''}" 
               style="background: ${c};"
               data-color="${c}"
               onclick="selectGroupColor('${c}')"></div>
        `).join('')}
      </div>
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="saveGroupEdit(${isEdit ? `'${group.id}'` : 'null'})">
      ${isEdit ? '保存' : '创建'}
    </button>
  `;
  
  window.currentModalId = showModal(isEdit ? '编辑分类' : '新建分类', body, footer);
  
  // 初始化颜色选择
  setTimeout(() => {
    window._selectedGroupColor = selectedColor;
  }, 50);
}

function selectGroupColor(color) {
  window._selectedGroupColor = color;
  document.querySelectorAll('.color-option').forEach(el => {
    el.classList.toggle('active', el.dataset.color === color);
  });
}

function saveGroupEdit(id) {
  const name = document.getElementById('groupNameInput').value.trim();
  if (!name) {
    showToast('请输入分类名称');
    return;
  }
  
  const color = window._selectedGroupColor || '#89b8e8';
  const activeGroups = getActiveWordGroups();
  const isEdit = !!id;
  
  if (id) {
    // 编辑
    const group = activeGroups.find(g => g.id === id);
    if (group) {
      group.name = name;
      group.color = color;
    }
  } else {
    // 新建
    const newGroup = {
      id: 'grp_' + Date.now(),
      name: name,
      color: color,
      disabled: false,
      _collapsed: false,
      items: []
    };
    activeGroups.push(newGroup);
    setActiveWordGroupId(newGroup.id);
  }
  
  saveData();
  renderWordCategories();
  renderWordList();
  closeModal(window.currentModalId);
  showToast(isEdit ? '已保存' : '已创建');
}

function toggleGroupDisabled(id) {
  closeAllGroupMenus();
  const activeGroups = getActiveWordGroups();
  const group = activeGroups.find(g => g.id === id);
  if (!group) return;
  group.disabled = !group.disabled;
  // 如果当前选中的分类被禁用，切换到第一个可用分类
  if (group.disabled && getActiveWordGroupId() === id) {
    const firstActive = activeGroups.find(g => !g.disabled);
    if (firstActive) setActiveWordGroupId(firstActive.id);
  }
  saveData();
  renderWordCategories();
  renderWordList();
  showToast(group.disabled ? '已禁用' : '已启用');
}

function deleteWordGroup(id) {
  closeAllGroupMenus();
  const activeGroups = getActiveWordGroups();
  const group = activeGroups.find(g => g.id === id);
  if (!group) return;
  if (activeGroups.length <= 1) {
    showToast('至少保留一个分类');
    return;
  }
  if (!confirm(`确定删除分类"${group.name}"吗？该分类下的所有词条也会被删除。`)) return;
  
  const idx = activeGroups.findIndex(g => g.id === id);
  activeGroups.splice(idx, 1);
  
  // 如果删除的是当前分类，切换到第一个
  if (getActiveWordGroupId() === id) {
    setActiveWordGroupId(activeGroups[0].id);
  }
  
  saveData();
  renderWordCategories();
  renderWordList();
  showToast('已删除');
}

// 字卡库：搜索 / 排序 / 屏蔽 / 批量管理状态
let wordSearchQuery = '';
let wordSortMode = 'default'; // default | asc | desc（仅影响显示）
let wordManageMode = false;
let wordSelected = new Set(); // 存放真实索引

// 生成当前分类的显示列表（含真实索引映射，过滤+排序不影响原始顺序）
function getWordDisplayList() {
  const group = getCurrentWordGroup();
  const words = group ? (group.items || []) : [];
  const blocked = group && group.blocked ? group.blocked : [];
  let list = words.map((w, i) => ({ w, i, blocked: blocked.includes(w) }));
  const q = wordSearchQuery.trim().toLowerCase();
  if (q) list = list.filter(x => x.w.toLowerCase().includes(q));
  if (wordSortMode === 'asc') list = list.slice().sort((a, b) => a.w.localeCompare(b.w, 'zh'));
  else if (wordSortMode === 'desc') list = list.slice().sort((a, b) => b.w.localeCompare(a.w, 'zh'));
  else if (wordSortMode === 'freq') list = list.slice().sort((a, b) => ((appData.wordUsage || {})[b.w] || 0) - ((appData.wordUsage || {})[a.w] || 0) || a.w.localeCompare(b.w, 'zh'));
  return list;
}

function updateWordManageBar() {
  const el = document.getElementById('wordManageCount');
  if (el) el.textContent = wordManageMode ? `已选 ${wordSelected.size} 项` : '';
}

function renderWordList() {
  const list = document.getElementById('wordList');
  const group = getCurrentWordGroup();
  const words = group ? (group.items || []) : [];
  const display = getWordDisplayList();

  if (words.length === 0) {
    list.innerHTML = '<div class="empty-state" style="padding:30px;"><i class="fas fa-book-open" style="font-size:32px;"></i><p>暂无词条，添加一些吧</p></div>';
    updateWordManageBar();
    return;
  }
  if (display.length === 0) {
    list.innerHTML = '<div class="empty-state" style="padding:30px;"><i class="fas fa-search" style="font-size:32px;"></i><p>没有匹配的词条</p></div>';
    updateWordManageBar();
    return;
  }

  list.innerHTML = display.map(x => `
    <div class="word-item ${x.blocked ? 'word-blocked' : ''}">
      ${wordManageMode
        ? `<input type="checkbox" class="word-check" ${wordSelected.has(x.i) ? 'checked' : ''} onchange="toggleWordSelect(${x.i})">`
        : `<span class="word-index">${x.i + 1}</span>`}
      <span class="word-text">${escapeHtml(x.w)}</span>
      <div class="word-actions">
        <button onclick="toggleWordBlocked(${x.i})" title="${x.blocked ? '取消屏蔽' : '屏蔽'}"><i class="fas ${x.blocked ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
        <button onclick="editWord(${x.i})" title="编辑"><i class="fas fa-edit"></i></button>
        <button onclick="openMoveWordsModal(${x.i})" title="移动到别的分类"><i class="fas fa-folder-open"></i></button>
        <button onclick="deleteWord(${x.i})" title="删除"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
  updateWordManageBar();
}

// 屏蔽 / 取消屏蔽单条字卡（屏蔽后不参与回复抽取）
function toggleWordBlocked(idx) {
  const group = getCurrentWordGroup();
  if (!group || !group.items) return;
  if (!group.blocked) group.blocked = [];
  const w = group.items[idx];
  const bi = group.blocked.indexOf(w);
  if (bi >= 0) group.blocked.splice(bi, 1);
  else group.blocked.push(w);
  saveData();
  renderWordList();
  showToast(bi >= 0 ? '已取消屏蔽' : '已屏蔽');
}

// 批量管理模式
function toggleWordManageMode() {
  wordManageMode = !wordManageMode;
  if (!wordManageMode) wordSelected.clear();
  const bar = document.getElementById('wordManageBar');
  const btn = document.getElementById('wordManageBtn');
  if (bar) bar.style.display = wordManageMode ? 'flex' : 'none';
  if (btn) {
    btn.classList.toggle('btn-primary', wordManageMode);
    btn.classList.toggle('btn-secondary', !wordManageMode);
  }
  renderWordList();
}

function toggleWordSelect(idx) {
  if (wordSelected.has(idx)) wordSelected.delete(idx);
  else wordSelected.add(idx);
  updateWordManageBar();
}

function wordSelectAll() {
  const display = getWordDisplayList();
  const allSelected = display.length > 0 && display.every(x => wordSelected.has(x.i));
  display.forEach(x => {
    if (allSelected) wordSelected.delete(x.i);
    else wordSelected.add(x.i);
  });
  renderWordList();
}

// 批量删除选中字卡
function batchDeleteWords() {
  if (wordSelected.size === 0) {
    showToast('请先选择词条');
    return;
  }
  if (!confirm(`确定删除选中的 ${wordSelected.size} 条词条吗？`)) return;
  const group = getCurrentWordGroup();
  [...wordSelected].sort((a, b) => b - a).forEach(i => group.items.splice(i, 1));
  // 清理屏蔽表中已不存在的词
  if (group.blocked) group.blocked = group.blocked.filter(w => group.items.includes(w));
  wordSelected.clear();
  saveData();
  renderWordList();
  renderWordCategories();
  showToast('已删除');
}

// 移动字卡到别的分类（单条传 idx，批量不传参）
function openMoveWordsModal(singleIdx) {
  const group = getCurrentWordGroup();
  const targets = getActiveWordGroups().filter(g => g.id !== group.id);
  if (targets.length === 0) {
    showToast('没有其他分类，请先新建');
    return;
  }
  const idxs = (typeof singleIdx === 'number') ? [singleIdx] : [...wordSelected];
  if (idxs.length === 0) {
    showToast('请先选择词条');
    return;
  }
  window._moveWordIdxs = idxs;
  const body = `
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${targets.map(g => `
        <button class="btn btn-secondary" style="text-align:left;" onclick="confirmMoveWords('${g.id}')">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${g.color};margin-right:8px;"></span>
          ${escapeHtml(g.name)}（${(g.items || []).length} 条）
        </button>
      `).join('')}
    </div>
  `;
  const footer = `<button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>`;
  window.currentModalId = showModal(`移动 ${idxs.length} 条词条到…`, body, footer);
}

function confirmMoveWords(targetId) {
  const group = getCurrentWordGroup();
  const target = getActiveWordGroups().find(g => g.id === targetId);
  const idxs = (window._moveWordIdxs || []).slice().sort((a, b) => b - a);
  if (!target || idxs.length === 0) {
    closeModal(window.currentModalId);
    return;
  }
  if (!target.items) target.items = [];
  let moved = 0;
  idxs.forEach(i => {
    const w = group.items[i];
    if (typeof w === 'string') {
      if (!target.items.includes(w)) target.items.push(w); // 自动去重
      group.items.splice(i, 1);
      moved++;
    }
  });
  if (group.blocked) group.blocked = group.blocked.filter(w => group.items.includes(w));
  wordSelected.clear();
  window._moveWordIdxs = null;
  saveData();
  closeModal(window.currentModalId);
  renderWordCategories();
  renderWordList();
  showToast(`已移动 ${moved} 条到"${target.name}"`);
}

function addWord() {
  const input = document.getElementById('newWordInput');
  const word = input.value.trim();
  if (!word) return;
  
  const group = getCurrentWordGroup();
  if (!group.items) group.items = [];
  
  if (group.items.includes(word)) {
    showToast('该词条已存在');
    return;
  }
  
  group.items.push(word);
  saveData();
  input.value = '';
  renderWordList();
  renderWordCategories();
  showToast('已添加');
}

function editWord(idx) {
  const group = getCurrentWordGroup();
  const words = group.items || [];
  const newWord = prompt('编辑词条：', words[idx]);
  if (newWord === null || !newWord.trim()) return;
  
  words[idx] = newWord.trim();
  saveData();
  renderWordList();
  showToast('已保存');
}

function deleteWord(idx) {
  if (!confirm('确定删除该词条吗？')) return;
  const group = getCurrentWordGroup();
  group.items.splice(idx, 1);
  saveData();
  renderWordList();
  renderWordCategories();
  showToast('已删除');
}

function openImportWordsModal() {
  const body = `
    <div style="margin-bottom:12px;padding:10px 12px;background:var(--primary-soft);border-radius:8px;font-size:12px;color:var(--primary);">
      <i class="fas fa-info-circle"></i> 支持格式：JSON数组、每行一词、【分组名】分行格式、字卡库导出文件。<br>
      批量添加时每一行一个字卡，单独一行写【分组名称】则该行以下内容归入此分组（选"智能识别分类"生效）。
    </div>
    <textarea class="textarea" id="importWordsText" placeholder="粘贴词条内容，或点击下方从文件导入..." rows="6"></textarea>
    <div style="margin-top:10px;display:flex;gap:8px;">
      <input type="file" id="importWordsFile" accept=".json,.txt" style="display:none;" onchange="handleImportWordsFile(event)">
      <button class="btn btn-secondary" style="flex:1;" onclick="document.getElementById('importWordsFile').click()">
        <i class="fas fa-file-import"></i> 从文件导入
      </button>
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color);">
      <div style="font-size:13px;font-weight:500;margin-bottom:8px;">导入方式</div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" style="flex:1;padding:8px;font-size:12px;" onclick="importWordsFromText('current')">
          导入到当前分类
        </button>
        <button class="btn btn-secondary" style="flex:1;padding:8px;font-size:12px;" onclick="importWordsFromText('smart')">
          智能识别分类
        </button>
      </div>
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
  `;
  
  window.currentModalId = showModal('批量导入词条', body, footer);
}

function handleImportWordsFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('importWordsText').value = e.target.result;
  };
  reader.readAsText(file);
}

function importWordsFromText(mode) {
  const text = document.getElementById('importWordsText').value.trim();
  if (!text) {
    showToast('请输入或选择内容');
    return;
  }
  
  let importData = null;
  let isGroupFormat = false;
  
  // 尝试解析JSON
  try {
    importData = JSON.parse(text);
    // 检测是否为带分类的格式
    if (importData.customReplyGroups && Array.isArray(importData.customReplyGroups)) {
      isGroupFormat = true;
    } else if (Array.isArray(importData) && importData.length > 0 && typeof importData[0] === 'object' && importData[0].items) {
      // 直接是分组数组
      isGroupFormat = true;
      importData = { customReplyGroups: importData };
    }
    // 兼容无分类格式：{ customReplies: [...] } / { words: [...] }
    if (!isGroupFormat && importData && !Array.isArray(importData) && typeof importData === 'object') {
      var flat = importData.customReplies || importData.words || importData.replies;
      if (Array.isArray(flat)) importData = flat;
    }
  } catch (e) {
    // 不是JSON，按纯文本处理（支持【分组名】行：该行为分组，以下内容归入当前分组）
    const lines = text.split('\n');
    const hasGroupHeaders = lines.some(l => /^【.+】\s*$/.test(l.trim()));
    if (hasGroupHeaders) {
      const groups = [];
      let cur = null;
      lines.forEach(l => {
        const t = l.trim();
        if (!t) return;
        const m = t.match(/^【(.+)】\s*$/);
        if (m) {
          cur = { name: m[1].trim(), items: [] };
          groups.push(cur);
        } else {
          if (!cur) {
            cur = { name: '未分组', items: [] };
            groups.push(cur);
          }
          if (!cur.items.includes(t)) cur.items.push(t); // 自动去重
        }
      });
      importData = { customReplyGroups: groups };
      isGroupFormat = true;
    } else {
      importData = lines.map(w => w.trim()).filter(w => w);
    }
  }
  
  let totalCount = 0;
  let groupCount = 0;
  
  if (isGroupFormat && mode === 'smart') {
    // 智能识别：按分类导入（导入到当前生效库）
    const groups = importData.customReplyGroups;
    const activeGroups = getActiveWordGroups();
    groups.forEach(grp => {
      if (!grp.items || !Array.isArray(grp.items)) return;
      
      // 查找同名分类，没有则新建
      let existing = activeGroups.find(g => g.name === grp.name);
      if (!existing) {
        existing = {
          id: 'grp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          name: grp.name,
          color: grp.color || getRandomColor(),
          disabled: grp.disabled || false,
          _collapsed: grp._collapsed || false,
          items: []
        };
        activeGroups.push(existing);
        groupCount++;
      }
      
      if (!existing.items) existing.items = [];
      
      grp.items.forEach(w => {
        if (typeof w === 'string' && w.trim() && !existing.items.includes(w.trim())) {
          existing.items.push(w.trim());
          totalCount++;
        }
      });
    });
    
    showToast(`导入 ${totalCount} 条词条，${groupCount > 0 ? '新建 ' + groupCount + ' 个分类' : '合并到已有分类'}`);
  } else {
    // 导入到当前分类
    let words = [];
    if (Array.isArray(importData)) {
      words = importData;
    } else if (isGroupFormat) {
      // 带分类格式但选择了导入当前分类，提取所有词条
      importData.customReplyGroups.forEach(grp => {
        if (grp.items && Array.isArray(grp.items)) {
          words = words.concat(grp.items);
        }
      });
    }
    
    const group = getCurrentWordGroup();
    if (!group.items) group.items = [];
    
    words.forEach(w => {
      if (typeof w === 'string' && w.trim() && !group.items.includes(w.trim())) {
        group.items.push(w.trim());
        totalCount++;
      }
    });
    
    showToast(`成功导入 ${totalCount} 条词条到"${group.name}"`);
  }
  
  saveData();
  renderWordCategories();
  renderWordList();
  closeModal(window.currentModalId);
}

function getRandomColor() {
  const colors = ['#89b8e8', '#b8a8e0', '#86c9b4', '#d8b89c', '#e8a5b8', '#6ec2bc', '#8e9ce0', '#e8a880'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function exportWords() {
  // 导出为 customReplyGroups 格式，兼容字卡库格式（导出当前生效库）
  const allWords = [];
  const customReplyGroups = getActiveWordGroups().map(g => ({
    id: g.id,
    name: g.name,
    color: g.color,
    disabled: g.disabled,
    items: g.items || [],
    _collapsed: g._collapsed
  }));
  
  customReplyGroups.forEach(g => {
    allWords.push(...g.items);
  });
  
  const exportData = {
    exportDate: new Date().toISOString(),
    modules: ['replies'],
    customReplies: allWords,
    customReplyGroups: customReplyGroups,
    _groupExport: true,
    _groupExportType: 'replies'
  };
  
  const convSuffix = isConvWordsEnabled() ? '_' + getCurrentConvName() : '';
  downloadJSON(exportData, '词条库' + convSuffix + '_' + new Date().toISOString().slice(0,10) + '.json');
  showToast('已导出 ' + allWords.length + ' 条词条' + (isConvWordsEnabled() ? '（' + getCurrentConvName() + ' 专属）' : ''));
}

// 导出为 TXT（【分组名】分行格式，每行一个字卡，可用"智能识别分类"原样导回）
function exportWordsTxt() {
  const groups = getActiveWordGroups();
  const lines = [];
  groups.forEach(g => {
    lines.push(`【${g.name}】`);
    (g.items || []).forEach(w => lines.push(w));
    lines.push('');
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const convSuffix = isConvWordsEnabled() ? '_' + getCurrentConvName() : '';
  a.download = '字卡库' + convSuffix + '_' + new Date().toISOString().slice(0,10) + '.txt';
  a.click();
  URL.revokeObjectURL(a.href);
  const total = groups.reduce((s, g) => s + (g.items ? g.items.length : 0), 0);
  showToast('已导出 ' + total + ' 条字卡（TXT）');
}

function clearWords() {
  const group = getCurrentWordGroup();
  if (!confirm(`确定清空分类"${group.name}"下的所有词条吗？`)) return;
  group.items = [];
  saveData();
  renderWordList();
  renderWordCategories();
  showToast('已清空');
}

function clearAllWords() {
  const groups = getActiveWordGroups();
  let total = 0;
  groups.forEach(g => { if (g.items) total += g.items.length; });
  if (!total) { showToast('词条已经是空的'); return; }
  const scope = isConvWordsEnabled() ? '当前联系人的专属词库' : '全局词库';
  if (!confirm(`确定清空${scope}里的全部 ${total} 条词条吗？
所有分类一起清，分类本身保留。`)) return;
  groups.forEach(g => { g.items = []; });
  saveData();
  renderWordList();
  renderWordCategories();
  showToast('已清空 ' + total + ' 条词条');
}

// ==================== 表情管理 ====================
function openAddMyEmojiModal() {
  openAddEmojiModal('my');
}

function openAddOtherEmojiModal() {
  openAddEmojiModal('other');
}

function openAddEmojiModal(type) {
  const body = `
    <p style="margin-bottom:12px;font-size:13px;color:var(--text-secondary);">
      选择图片添加到${type === 'my' ? '我的' : '对方'}表情库
    </p>
    <input type="file" id="emojiUploadInput" accept="image/*" multiple style="display:none;" onchange="handleEmojiUpload(event, '${type}')">
    <div style="text-align:center;padding:30px;border:2px dashed var(--border-color);border-radius:8px;cursor:pointer;" 
         onclick="document.getElementById('emojiUploadInput').click()">
      <i class="fas fa-cloud-upload-alt" style="font-size:36px;color:var(--text-tertiary);margin-bottom:8px;display:block;"></i>
      <p style="color:var(--text-secondary);">点击或拖拽上传图片</p>
      <p style="font-size:12px;color:var(--text-tertiary);margin-top:4px;">支持多选</p>
    </div>
  `;
  
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>
  `;
  
  window.currentModalId = showModal(`添加${type === 'my' ? '我的' : '对方'}表情`, body, footer);
}

function handleEmojiUpload(event, type) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  
  Promise.all(files.map(file => fileToBase64(file))).then(emojis => {
    if (type === 'my') {
      appData.myEmojis.push(...emojis);
    } else {
      appData.otherEmojis.push(...emojis);
    }
    saveData();
    renderEmojiLists();
    closeModal(window.currentModalId);
    showToast(`已添加 ${emojis.length} 个表情`);
  });
}

function renderEmojiLists() {
  const myList = document.getElementById('myEmojiList');
  const otherList = document.getElementById('otherEmojiList');
  
  if (myList) {
    if (appData.myEmojis.length === 0) {
      myList.innerHTML = '<div class="empty-state" style="padding:20px;grid-column:1/-1;"><p style="font-size:12px;">暂无表情</p></div>';
    } else {
      myList.innerHTML = appData.myEmojis.map((emoji, idx) => `
        <div class="emoji-item custom-emoji-item" style="position:relative;" onclick="deleteEmoji('my', ${idx})">
          <img src="${emoji}" alt="">
          <div style="position:absolute;top:0;right:0;width:16px;height:16px;background:var(--danger);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:0;transition:opacity 0.2s;" class="emoji-del-btn">
            <i class="fas fa-times"></i>
          </div>
        </div>
      `).join('');
    }
  }
  
  if (otherList) {
    if (appData.otherEmojis.length === 0) {
      otherList.innerHTML = '<div class="empty-state" style="padding:20px;grid-column:1/-1;"><p style="font-size:12px;">暂无表情</p></div>';
    } else {
      otherList.innerHTML = appData.otherEmojis.map((emoji, idx) => `
        <div class="emoji-item custom-emoji-item" style="position:relative;" onclick="deleteEmoji('other', ${idx})">
          <img src="${emoji}" alt="">
          <div style="position:absolute;top:0;right:0;width:16px;height:16px;background:var(--danger);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;" class="emoji-del-btn">
            <i class="fas fa-times"></i>
          </div>
        </div>
      `).join('');
    }
  }
}

function deleteEmoji(type, idx) {
  if (!confirm('确定删除该表情吗？')) return;
  if (type === 'my') {
    appData.myEmojis.splice(idx, 1);
  } else {
    appData.otherEmojis.splice(idx, 1);
  }
  saveData();
  renderEmojiLists();
  showToast('已删除');
}

function clearMyEmojis() {
  if (!confirm('确定清空我的所有表情吗？')) return;
  appData.myEmojis = [];
  saveData();
  renderEmojiLists();
  showToast('已清空');
}

function clearOtherEmojis() {
  if (!confirm('确定清空对方所有表情吗？')) return;
  appData.otherEmojis = [];
  saveData();
  renderEmojiLists();
  showToast('已清空');
}

// ==================== 数据备份 ====================
function exportAllData() {
  downloadJSON(appData, 'Vislta备份_' + new Date().toISOString().slice(0,10) + '.json');
  showToast('已导出全部数据');
}

function importAllData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (typeof data !== 'object' || data === null) throw new Error('格式错误');
      if (!confirm('导入将覆盖现有数据（自动校验并修复脏字段），确定继续吗？')) return;
      
      appData = { ...appData, ...data };
      loadData();   // loadData 内含全部字段校验与自动修复逻辑
      saveData();
      location.reload();
    } catch (err) {
      showToast('文件格式错误');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function clearAllDataConfirm() {
  if (!confirm('警告：此操作将删除所有数据，包括联系人、聊天记录、信件、词条等，且不可恢复！确定继续吗？')) return;
  if (!confirm('真的要清空全部数据吗？')) return;
  
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ==================== 通话 ====================
let callState = {
  active: false,
  type: 'outgoing', // outgoing, incoming, connected
  chatType: 'contact', // 'contact' 或 'group'
  chatId: null,
  members: [], // 参与通话的成员 [{id, name, avatar}]
  contactId: null,
  contactName: '',
  contactAvatar: '',
  startTime: 0,
  timerInterval: null,
  muted: false,
  minimized: false
};

function startCall() {
  if (callState.active) {
    showToast('当前已有通话进行中');
    return;
  }
  if (!appData.currentChatId) {
    showToast('请先选择一个联系人或群聊');
    return;
  }
  
  if (appData.currentChatType === 'group') {
    // 群聊：弹出成员选择器（可指定成员或多人通话）
    openGroupCallPicker();
  } else if (appData.currentChatType === 'contact') {
    const contact = appData.contacts.find(c => c.id === appData.currentChatId);
    if (!contact) return;
    beginCall('contact', contact.id);
  }
}

// ===== 群聊通话成员选择器 =====
function openGroupCallPicker() {
  const group = appData.groups.find(g => g.id === appData.currentChatId);
  if (!group) return;
  
  // 清理残留的选择器弹窗（含关闭动画期间的所有情况，避免出现重复ID）
  document.querySelectorAll('#modalContainer .call-member-list').forEach(list => {
    const overlay = list.closest('.modal-overlay');
    if (overlay) overlay.remove();
  });
  window.callPickerModalId = null;
  
  const members = group.memberIds
    .map(id => appData.contacts.find(c => c.id === id))
    .filter(Boolean);
  
  if (members.length === 0) {
    showToast('该群聊暂无可通话的成员');
    return;
  }
  
  const body = `
    <div class="call-picker-tip">勾选成员后点击「呼叫选中成员」进行指定通话（选1人为单聊通话，多人则为多人通话）；也可直接发起全员多人通话。</div>
    <button class="call-all-btn" onclick="startGroupCallFromPicker('all')">
      <i class="fas fa-users"></i> 全员多人通话（${members.length}人）
    </button>
    <div class="call-member-list" id="callMemberList">
      ${members.map(m => `
        <label class="call-member-item" data-id="${m.id}" onclick="toggleCallMemberItem(this, event)">
          <input type="checkbox" class="call-member-check" value="${m.id}">
          <span class="call-member-avatar">${m.avatar ? `<img src="${m.avatar}" alt="">` : getInitial(m.name)}</span>
          <span class="call-member-name">${escapeHtml(m.name)}</span>
        </label>`).join('')}
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="closeCallPicker()">取消</button>
    <button class="btn btn-primary" onclick="startGroupCallFromPicker('selected')"><i class="fas fa-phone"></i> 呼叫选中成员</button>
  `;
  window.callPickerModalId = showModal('发起群聊通话 · ' + escapeHtml(group.name), body, footer);
}

function toggleCallMemberItem(labelEl, event) {
  // 点击整行切换勾选状态（点击checkbox本身时交给原生处理）
  if (event.target.classList.contains('call-member-check')) return;
  event.preventDefault();
  const cb = labelEl.querySelector('.call-member-check');
  cb.checked = !cb.checked;
  labelEl.classList.toggle('checked', cb.checked);
}

function closeCallPicker() {
  if (window.callPickerModalId) {
    closeModal(window.callPickerModalId);
    window.callPickerModalId = null;
  }
}

function startGroupCallFromPicker(mode) {
  const group = appData.groups.find(g => g.id === appData.currentChatId);
  if (!group) return;
  
  let memberIds;
  if (mode === 'all') {
    memberIds = group.memberIds.filter(id => appData.contacts.find(c => c.id === id));
  } else {
    // 限定在当前选择器弹窗内读取勾选状态，避免与其他弹窗串扰
    const pickerEl = window.callPickerModalId ? document.getElementById(window.callPickerModalId) : null;
    if (!pickerEl) return;
    pickerEl.querySelectorAll('.call-member-item').forEach(labelEl => {
      const cb = labelEl.querySelector('.call-member-check');
      labelEl.classList.toggle('checked', cb.checked);
    });
    memberIds = Array.from(pickerEl.querySelectorAll('.call-member-check:checked')).map(i => i.value);
  }
  
  if (!memberIds.length) {
    showToast('请至少勾选1位成员');
    return;
  }
  
  closeCallPicker();
  beginCall('group', group.id, memberIds);
}

// ===== 发起通话（联系人与群聊统一入口）=====
function beginCall(chatType, chatId, memberIds = []) {
  if (callState.active) return;
  
  // 解析通话成员
  let members = [];
  if (chatType === 'group') {
    members = memberIds.map(id => {
      const c = appData.contacts.find(x => x.id === id);
      return c ? { id: c.id, name: c.name, avatar: c.avatar } : null;
    }).filter(Boolean);
    if (members.length === 0) return;
  }
  
  let displayName = '';
  let displayAvatar = '';
  if (chatType === 'group') {
    const group = appData.groups.find(g => g.id === chatId);
    if (!group) return;
    if (members.length === 1) {
      // 指定单人通话：显示该成员
      displayName = members[0].name;
      displayAvatar = members[0].avatar;
    } else {
      // 多人通话：显示群名称与群头像
      displayName = group.name;
      displayAvatar = group.avatar;
    }
  } else {
    const contact = appData.contacts.find(c => c.id === chatId);
    if (!contact) return;
    displayName = contact.name;
    displayAvatar = contact.avatar;
    members = [{ id: contact.id, name: contact.name, avatar: contact.avatar }];
  }
  
  callState = {
    active: true,
    type: 'outgoing',
    chatType,
    chatId,
    members,
    contactId: members.length === 1 ? members[0].id : null,
    contactName: displayName,
    contactAvatar: displayAvatar,
    startTime: 0,
    timerInterval: null,
    muted: false,
    minimized: false
  };
  
  updateCallUI();
  document.getElementById('callModal').classList.add('show');
  document.getElementById('callAcceptBtn').style.display = 'none';

  // 应用该会话的独立通话背景（会话级优先，回退全局）
  applyCallBg(getConvKey(chatType, chatId));

  // 对方自动接听
  setTimeout(() => {
    if (callState.active && callState.type === 'outgoing') {
      acceptCall();
    }
  }, randomInt(2000, 5000));
}

// 获取当前通话记录写入的key
function getCallRecordKey() {
  return (callState.chatType === 'group' ? 'group_' : 'contact_') + callState.chatId;
}

function acceptCall() {
  if (!callState.active) return;

  // 记录接听前的通话方向（呼入的通话记录归对方一侧）
  const wasIncoming = callState.type === 'incoming';

  // 接听后停止来电铃声
  stopAllSounds();

  callState.type = 'connected';
  callState.startTime = Date.now();
  
  document.getElementById('callStatus').textContent = '通话中...';
  document.getElementById('callTimer').style.display = 'block';
  document.getElementById('callAcceptBtn').style.display = 'none';
  
  // 开始计时
  callState.timerInterval = setInterval(updateCallTimer, 1000);
  
  // 写入聊天记录
  const key = getCallRecordKey();
  let callContent, callSender;
  if (callState.chatType === 'group') {
    const names = callState.members.map(m => m.name);
    callContent = callState.members.length > 1
      ? `发起多人语音通话（${callState.members.length}人：${names.join('、')}）`
      : `发起语音通话（与 ${names[0]}）`;
    callSender = getSelfId();
  } else if (wasIncoming) {
    // 对方打来的电话：记录归对方一侧
    callContent = '语音通话（呼入）';
    callSender = callState.contactId;
  } else {
    callContent = '语音通话（呼出）';
    callSender = getSelfId();
  }
  if (!appData.chatRecords[key]) appData.chatRecords[key] = [];
  appData.chatRecords[key].push({
    type: 'call',
    content: callContent,
    sender: callSender,
    time: Date.now()
  });
  saveData();
  renderChatMessages();
  renderConversations();
}

function updateCallTimer() {
  const elapsed = Math.floor((Date.now() - callState.startTime) / 1000);
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');
  const timeStr = `${mins}:${secs}`;
  
  document.getElementById('callTimer').textContent = timeStr;
  document.getElementById('floatingCallTime').textContent = timeStr;
}

function hangUp() {
  if (!callState.active) return;
  
  // 挂断通话：立刻停止全部音效
  stopAllSounds();
  
  if (callState.timerInterval) {
    clearInterval(callState.timerInterval);
  }
  
  // 写入通话结束记录
  if (callState.type === 'connected') {
    const key = getCallRecordKey();
    const elapsed = Math.floor((Date.now() - callState.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const durationStr = mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
    
    let endContent;
    if (callState.chatType === 'group') {
      const names = callState.members.map(m => m.name);
      endContent = callState.members.length > 1
        ? `多人语音通话 ${durationStr}（${callState.members.length}人：${names.join('、')}）`
        : `与 ${names[0]} 语音通话 ${durationStr}`;
    } else {
      endContent = `语音通话 ${durationStr}`;
    }
    
    if (appData.chatRecords[key]) {
      const lastMsg = appData.chatRecords[key][appData.chatRecords[key].length - 1];
      if (lastMsg && lastMsg.type === 'call') {
        lastMsg.content = endContent;
      }
    }
    saveData();
    renderChatMessages();
    renderConversations();
  }
  
  callState.active = false;
  callState.minimized = false;
  callState.members = [];
  
  document.getElementById('callModal').classList.remove('show');
  document.getElementById('floatingCall').classList.remove('show');
  
  // 重置UI
  document.getElementById('callAcceptBtn').style.display = '';
  document.getElementById('callTimer').style.display = 'none';
  document.getElementById('callAvatar').style.display = '';
  document.getElementById('callAvatarsGrid').style.display = 'none';
  document.getElementById('callAvatarsGrid').innerHTML = '';
  document.getElementById('callMembersCount').style.display = 'none';
  // 重置静音按钮
  const muteBtn = document.getElementById('callMuteBtn');
  if (muteBtn) {
    muteBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    muteBtn.style.background = 'rgba(255,255,255,0.2)';
  }
}

function toggleMute() {
  callState.muted = !callState.muted;
  const btn = document.getElementById('callMuteBtn');
  btn.innerHTML = callState.muted ? '<i class="fas fa-microphone-slash"></i>' : '<i class="fas fa-microphone"></i>';
  btn.style.background = callState.muted ? 'var(--danger)' : 'rgba(255,255,255,0.2)';
}

function minimizeCall() {
  if (!callState.active) return;
  callState.minimized = true;
  document.getElementById('callModal').classList.remove('show');
  document.getElementById('floatingCall').classList.add('show');
  
  // 悬浮窗名称：群聊多人通话显示「群名 · N人通话」
  const isGroupMulti = callState.chatType === 'group' && callState.members.length > 1;
  document.getElementById('floatingCallName').textContent = isGroupMulti
    ? `${callState.contactName} · ${callState.members.length}人通话`
    : callState.contactName;
  const avatarEl = document.getElementById('floatingCallAvatar');
  if (callState.contactAvatar) {
    avatarEl.innerHTML = `<img src="${callState.contactAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else {
    avatarEl.textContent = getInitial(callState.contactName);
  }
}

function expandCall() {
  if (!callState.active || !callState.minimized) return;
  callState.minimized = false;
  document.getElementById('floatingCall').classList.remove('show');
  document.getElementById('callModal').classList.add('show');
}

function updateCallUI() {
  document.getElementById('callName').textContent = callState.contactName;
  const avatarEl = document.getElementById('callAvatar');
  const gridEl = document.getElementById('callAvatarsGrid');
  const countEl = document.getElementById('callMembersCount');
  const isMulti = callState.chatType === 'group' && callState.members.length > 1;
  
  if (isMulti) {
    // 多人通话：显示成员头像网格（最多展示4个，超出显示+N）
    avatarEl.style.display = 'none';
    gridEl.style.display = 'grid';
    const shown = callState.members.slice(0, 4);
    let gridHTML = shown.map((m, i) => `
      <div class="call-avatar-cell">
        <div class="call-avatar-tile" style="--tile-delay:${(i * 0.25).toFixed(2)}s">${m.avatar ? `<img src="${m.avatar}" alt="">` : getInitial(m.name)}</div>
        <div class="cell-name">${escapeHtml(m.name)}</div>
      </div>`).join('');
    if (callState.members.length > 4) {
      gridHTML += `
        <div class="call-avatar-cell">
          <div class="tile-extra">+${callState.members.length - 4}</div>
          <div class="cell-name">更多成员</div>
        </div>`;
    }
    gridEl.innerHTML = gridHTML;
    countEl.style.display = 'inline-block';
    countEl.textContent = `共 ${callState.members.length} 人参与通话`;
  } else {
    // 单人通话：显示单个头像
    avatarEl.style.display = '';
    gridEl.style.display = 'none';
    gridEl.innerHTML = '';
    if (callState.chatType === 'group' && callState.members.length === 1) {
      // 群内指定单人通话：标注来源群聊
      const group = appData.groups.find(g => g.id === callState.chatId);
      countEl.style.display = 'inline-block';
      countEl.textContent = `来自群聊 · ${group ? group.name : ''}`;
    } else {
      countEl.style.display = 'none';
      countEl.textContent = '';
    }
    if (callState.contactAvatar) {
      avatarEl.innerHTML = `<img src="${callState.contactAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      avatarEl.textContent = getInitial(callState.contactName);
    }
  }
  
  if (callState.type === 'outgoing') {
    document.getElementById('callStatus').textContent = isMulti ? '正在呼叫成员加入...' : '正在呼叫...';
    document.getElementById('callAcceptBtn').style.display = 'none';
  } else if (callState.type === 'incoming') {
    document.getElementById('callStatus').textContent = isMulti ? '邀请你加入多人通话...' : '来电...';
    document.getElementById('callAcceptBtn').style.display = '';
  }
}

// 聊天页面通话按钮
document.getElementById('chatCallBtn').addEventListener('click', startCall);

// ==================== 自动来电 ====================
let autoCallTimer = null;

function scheduleAutoCall() {
  if (!appData.settings.autoCall || appData.contacts.length === 0) return;
  
  if (autoCallTimer) clearTimeout(autoCallTimer);
  
  const delay = randomInt(60, 300) * 1000; // 1-5分钟后
  
  autoCallTimer = setTimeout(() => {
    if (!appData.settings.autoCall) return;
    if (isDNDTime()) {
      scheduleAutoCall();
      return;
    }
    triggerIncomingCall();
  }, delay);
}

function isDNDTime() {
  if (!appData.settings.dndEnabled) return false;
  
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  
  const [startH, startM] = appData.settings.dndStart.split(':').map(Number);
  const [endH, endM] = appData.settings.dndEnd.split(':').map(Number);
  
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  
  if (startMins <= endMins) {
    return currentMins >= startMins && currentMins < endMins;
  } else {
    // 跨天
    return currentMins >= startMins || currentMins < endMins;
  }
}

function triggerIncomingCall() {
  if (callState.active) return;
  
  const contact = randomPick(appData.contacts);
  if (!contact) return;
  
  callState = {
    active: true,
    type: 'incoming',
    chatType: 'contact',
    chatId: contact.id,
    members: [{ id: contact.id, name: contact.name, avatar: contact.avatar }],
    contactId: contact.id,
    contactName: contact.name,
    contactAvatar: contact.avatar,
    startTime: 0,
    timerInterval: null,
    muted: false,
    minimized: false
  };
  
  updateCallUI();
  document.getElementById('callModal').classList.add('show');

  // 应用该联系人的独立通话背景（会话级优先，回退全局）
  applyCallBg(getConvKey('contact', contact.id));

  // 播放来电铃声（联系人专属优先，ended事件无缝循环）
  startCallRingtone(resolveSoundId('call', { contactId: contact.id }));

  if (appData.settings.desktopNotify) {
    showNotification('来电', `${contact.name} 来电中...`, {
      tag: 'incoming-call', force: true,
      onClick: () => { selectConversation(contact.id, 'contact'); switchPage('chat'); }
    });
  }
  
  // 响铃超时自动挂断
  setTimeout(() => {
    if (callState.active && callState.type === 'incoming') {
      hangUp();
      // 写入未接来电
      const key = 'contact_' + callState.contactId;
      if (!appData.chatRecords[key]) appData.chatRecords[key] = [];
      appData.chatRecords[key].push({
        type: 'call',
        content: '未接来电',
        sender: callState.contactId,
        time: Date.now()
      });
      saveData();
      renderChatMessages();
      renderConversations();
    }
  }, 30000);
  
  // 安排下一次
  scheduleAutoCall();
}

// ==================== 桌面通知 ====================
let swRegisterPromise = null;
const _notifyClickHandlers = {};
let _notifyClickSeq = 0;

function registerNotificationWorker() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  if (swRegisterPromise) return swRegisterPromise;
  swRegisterPromise = navigator.serviceWorker.register('sw.js')
    .then(function (reg) {
      return Promise.race([
        navigator.serviceWorker.ready,
        new Promise(function (resolve) {
          setTimeout(function () { resolve(reg.active ? reg : null); }, 1500);
        })
      ]);
    })
    .catch(function () {
      swRegisterPromise = null;
      return null;
    });
  return swRegisterPromise;
}

function requestNotificationPermission() {
  return new Promise(function (resolve) {
    if (!('Notification' in window)) { showToast('这个浏览器不支持通知'); return resolve(false); }
    if (Notification.permission === 'granted') { registerNotificationWorker(); return resolve(true); }
    if (Notification.permission === 'denied') { showToast('通知被拦了，去浏览器站点设置里放开'); return resolve(false); }
    let settled = false;
    const done = function (perm) {
      if (settled) return;
      settled = true;
      if (perm === 'granted') {
        registerNotificationWorker();
        showToast('通知开了');
        resolve(true);
      } else {
        showToast('没给权限，弹不出来');
        resolve(false);
      }
    };
    try {
      const p = Notification.requestPermission(done);
      if (p && typeof p.then === 'function') p.then(done);
    } catch (e) { resolve(false); }
  });
}

function isQuietNow() {
  try {
    if (!appData.settings.quietNotify) return false;
    var s = appData.settings.quietStart || '23:00';
    var e = appData.settings.quietEnd || '07:00';
    var now = new Date();
    var cur = now.getHours() * 60 + now.getMinutes();
    var ps = s.split(':'), pe = e.split(':');
    var a = parseInt(ps[0], 10) * 60 + parseInt(ps[1] || '0', 10);
    var bb = parseInt(pe[0], 10) * 60 + parseInt(pe[1] || '0', 10);
    if (isNaN(a) || isNaN(bb) || a === bb) return false;
    return a < bb ? (cur >= a && cur < bb) : (cur >= a || cur < bb);
  } catch (err) { return false; }
}
function ntfSay(t){
  var d=document.getElementById('ntfBar');
  if(!d){d=document.createElement('div');d.id='ntfBar';d.style.cssText='position:fixed;left:0;right:0;top:0;z-index:99999;background:rgba(0,140,0,.95);color:#fff;font-size:12px;line-height:18px;padding:4px 8px;font-family:monospace;white-space:nowrap;overflow:hidden;';document.body.appendChild(d);}
  if(!t){ d.style.display='none'; return; }
  d.style.display='';
  d.textContent=t;
}
function showNotification(title, body, options) {
  options = options || {};
  if (!('Notification' in window)) { ntfSay('无 Notification'); return; }
  if (Notification.permission !== 'granted') { ntfSay('权限=' + Notification.permission); return; }
  if (!options.force && document.visibilityState === 'visible') { ntfSay('前台跳过'); return; }
  if (!options.noQuiet && isQuietNow()) { return; }
  ;
  const tag = options.tag || 'chat-app';

  let clickId = null;
  if (typeof options.onClick === 'function') {
    clickId = ++_notifyClickSeq;
    _notifyClickHandlers[clickId] = options.onClick;
    setTimeout(function () { delete _notifyClickHandlers[clickId]; }, 30000);
  }

  const opt = {
    body: body || '',
    tag: tag,
    renotify: true,
    silent: false,
    data: { url: location.href, clickId: clickId }
  };

  const fallback = function () {
    ntfSay('SW发不出去，走兜底');
    try {
      const n = new Notification(title, opt);
      n.onclick = function () {
        try { window.focus(); } catch (e) {}
        if (typeof options.onClick === 'function') options.onClick();
        n.close();
      };
      setTimeout(function () { n.close(); }, 8000);
    } catch (e) {}
  };

  registerNotificationWorker().then(function (reg) {
    if (reg && typeof reg.showNotification === 'function') {
      return reg.showNotification(title, opt).then(function(){ ntfSay(''); }).catch(fallback);
    }
    throw new Error('no sw');
  }).catch(fallback);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', function (event) {
    const d = event.data;
    if (!d || d.type !== 'notification-click') return;
    const id = d.data && d.data.clickId;
    const fn = id && _notifyClickHandlers[id];
    if (fn) {
      try { fn(); } catch (e) {}
      delete _notifyClickHandlers[id];
    }
  });
}

function testDesktopNotification() {
  if (!('Notification' in window)) { showToast('浏览器不支持通知'); return; }
  if (Notification.permission === 'denied') { showToast('通知被浏览器拦了，去站点设置里放开'); return; }
  if (Notification.permission !== 'granted') {
    requestNotificationPermission().then(function (granted) {
      if (granted) showNotification('Vislta 测试通知', '能弹出来就说明通了。', { tag: 'test', noQuiet: true, force: true });
    });
    return;
  }
  showNotification('Vislta 测试通知', '能弹出来就说明通了。', { tag: 'test', force: true });
  showToast('发了，看通知栏');
}

// ==================== 应用内通知预览 ====================
// 消息内容 → 通知预览文本
function msgNotifyPreview(msg) {
  if (msg.type === 'image') return msg.isEmoji ? '[表情包]' : '[图片]';
  if (msg.type === 'survey') return '[问卷]';
  if (msg.type === 'redpacket') return '[红包]';
  if (msg.type === 'transfer') return `[转账] ¥${fmtMoney(msg.amount)}`;
  if (msg.type === 'call') return '[通话]';
  if (msg.type === 'poke') return msg.content || '[戳一戳]';
  if (msg.type === 'moments_share') return '[朋友圈动态]';
  return msg.content || '';
}

// ==================== 后台保活 ====================
function keepAlive() {
  if (!appData.settings.keepAlive) return;
  // 简单保活：定期触发一个事件
  setInterval(() => {
    // 检查是否有需要触发的信件回复
    appData.letters.forEach(letter => {
      if (!letter.replied && letter.replyAt <= Date.now()) {
        generateLetterReply(letter.id);
      }
    });
  }, 60000);
}

// ==================== 初始化默认数据 ====================
function initSampleData() {
  // 不初始化任何示例数据，保持空白
}


// ==================== 音效引擎（WebAudio全合成，无外部文件） ====================
let soundCtx = null;
const soundBufferCache = {};   // soundId -> AudioBuffer
let activeSoundSrcs = [];      // 播放中的源节点
let callLoopCtx = null;        // { soundId, src, stopped }

function getSoundCtx() {
  if (!soundCtx) {
    try { soundCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { soundCtx = null; }
  }
  return soundCtx;
}

// 首次用户交互解锁音频（兼容浏览器自动播放限制）
function unlockSoundEngine() {
  const ctx = getSoundCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
['click', 'touchstart', 'keydown'].forEach(evt => {
  window.addEventListener(evt, unlockSoundEngine, { passive: true });
});

// 内置音效定义：notes = [频率, 起始秒, 时长秒]
const builtinSoundDefs = {
  call_classic:  { name: '经典铃声', notes: [[784,0,0.3],[988,0.35,0.3],[784,0.7,0.3],[988,1.05,0.3],[784,1.4,0.3],[988,1.75,0.3]] },
  call_sunny:    { name: '晴朗', notes: [[659,0,0.25],[784,0.28,0.25],[880,0.56,0.25],[1046,0.84,0.35],[880,1.24,0.25],[1046,1.52,0.4]] },
  call_digital:  { name: '数码', notes: [[1200,0,0.12],[900,0.15,0.12],[1200,0.3,0.12],[900,0.45,0.12],[1200,0.6,0.12],[900,0.75,0.12],[1200,0.9,0.12],[900,1.05,0.12]] },
  msg_default:   { name: '默认提示', notes: [[1046,0,0.15],[1318,0.16,0.2]] },
  msg_ding:      { name: '叮', notes: [[1318,0,0.12],[1760,0.1,0.28]] },
  msg_soft:      { name: '轻柔', notes: [[880,0,0.2],[1108,0.18,0.32]] },
  grp_default:   { name: '默认提示', notes: [[784,0,0.12],[988,0.13,0.2]] },
  grp_pop:       { name: '泡泡', notes: [[587,0,0.1],[784,0.11,0.1],[988,0.22,0.22]] },
  sys_default:   { name: '默认通知', notes: [[1046,0,0.1],[1318,0.12,0.1],[1568,0.24,0.22]] },
  sys_chime:     { name: '风铃', notes: [[1568,0,0.3],[1318,0.15,0.3],[1046,0.3,0.42]] },
  redpacket:     { name: '红包音效', notes: [[880,0,0.1],[1108,0.1,0.1],[1318,0.2,0.1],[1568,0.3,0.35]] },
  moments_reply: { name: '评论提示', notes: [[1174,0,0.12],[1568,0.13,0.28]] },
  survey_notify: { name: '问卷提示', notes: [[659,0,0.15],[880,0.16,0.15],[1318,0.32,0.32]] },
  send_pop:      { name: '发送·啵', notes: [[988,0,0.08],[1318,0.07,0.12]] },
  send_swoosh:   { name: '发送·嗖', notes: [[523,0,0.06],[784,0.05,0.06],[1174,0.1,0.1]] },
  send_ding:     { name: '发送·叮', notes: [[1568,0,0.14]] }
};

// 按类别分组（设置面板下拉用）
const soundCategories = [
  { key: 'call',     label: '来电铃声',   setting: 'ringtoneCall' },
  { key: 'private',  label: '私聊消息提示音', setting: 'ringtoneMsg' },
  { key: 'group',    label: '群消息提示音', setting: 'ringtoneGroup' },
  { key: 'system',   label: '系统通知音效', setting: 'ringtoneSystem' }
];

// base64(dataURL) -> ArrayBuffer
function dataUrlToArrayBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const bin = atob(base64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

// 合成模式 -> AudioBuffer（OfflineAudioContext渲染，缓存）
function renderPatternToBuffer(def) {
  const total = Math.max(...def.notes.map(n => n[1] + n[2])) + 0.15;
  const offline = new OfflineAudioContext(1, Math.ceil(44100 * total), 44100);
  def.notes.forEach(([freq, t, d]) => {
    const osc = offline.createOscillator();
    const g = offline.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    osc.connect(g); g.connect(offline.destination);
    osc.start(t); osc.stop(t + d + 0.05);
  });
  return offline.startRendering();
}

// 自定义铃声 -> AudioBuffer
async function decodeCustomRingtone(cr) {
  const ctx = getSoundCtx();
  if (!ctx) return null;
  const buf = await ctx.decodeAudioData(dataUrlToArrayBuffer(cr.data));
  return buf;
}

async function getSoundBuffer(soundId) {
  if (soundBufferCache[soundId]) return soundBufferCache[soundId];
  const ctx = getSoundCtx();
  if (!ctx) return null;
  let buf = null;
  if (builtinSoundDefs[soundId]) {
    buf = await renderPatternToBuffer(builtinSoundDefs[soundId]);
  } else if (soundId && soundId.startsWith('custom_')) {
    const cr = appData.customRingtones.find(r => r.id === soundId);
    if (cr) { try { buf = await decodeCustomRingtone(cr); } catch (e) { buf = null; } }
  }
  if (buf) soundBufferCache[soundId] = buf;
  return buf;
}

function getSoundVolume() {
  const v = Number(appData.settings.soundVolume);
  return (isFinite(v) && v >= 0 && v <= 100 ? v : 80) / 100;
}

// 播放一个音效（loop=true 时通过 ended 事件无缝循环）
async function playSoundBuffer(soundId, opts = {}) {
  const ctx = getSoundCtx();
  if (!ctx) return null;
  if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) {} }
  const buf = await getSoundBuffer(soundId);
  if (!buf) return null;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = opts.volume !== undefined ? opts.volume : getSoundVolume();
  src.connect(g); g.connect(ctx.destination);
  src.start();
  activeSoundSrcs.push(src);
  src.addEventListener('ended', () => {
    const i = activeSoundSrcs.indexOf(src);
    if (i > -1) activeSoundSrcs.splice(i, 1);
  });
  return src;
}

// ---- 来电铃声循环（ended事件驱动，不用原生loop） ----
async function startCallRingtone(soundId) {
  stopCallRingtone();
  const ctx = getSoundCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) {} }
  const buf = await getSoundBuffer(soundId);
  if (!buf) return;
  callLoopCtx = { soundId, stopped: false };
  const playOnce = () => {
    if (!callLoopCtx || callLoopCtx.stopped || callLoopCtx.soundId !== soundId) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = getSoundVolume();
    src.connect(g); g.connect(ctx.destination);
    src.start();
    activeSoundSrcs.push(src);
    src.addEventListener('ended', () => {
      const i = activeSoundSrcs.indexOf(src);
      if (i > -1) activeSoundSrcs.splice(i, 1);
      // ended事件无缝循环
      if (callLoopCtx && !callLoopCtx.stopped) setTimeout(playOnce, 350);
    });
  };
  playOnce();
}

function stopCallRingtone() {
  if (callLoopCtx) { callLoopCtx.stopped = true; callLoopCtx = null; }
}

// 停止全部音效（页面切后台/挂断时调用）
function stopAllSounds() {
  stopCallRingtone();
  activeSoundSrcs.forEach(s => { try { s.stop(); } catch (e) {} });
  activeSoundSrcs = [];
  stopPreviewSound();
}

// ---- 预览（不受免打扰约束） ----
let previewSrc = null;
async function playPreviewSound(soundId) {
  stopPreviewSound();
  const src = await playSoundBuffer(soundId, { volume: getSoundVolume() });
  if (src) previewSrc = src;
}
function stopPreviewSound() {
  if (previewSrc) { try { previewSrc.stop(); } catch (e) {} previewSrc = null; }
}

// ---- 多层免打扰校验（优先级从高到低） ----
function isGlobalDndNow() {
  const s = appData.settings;
  if (!s.dndEnabled) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = String(s.dndStart || '22:00').split(':').map(Number);
  const [eh, em] = String(s.dndEnd || '08:00').split(':').map(Number);
  const start = (sh || 0) * 60 + (sm || 0), end = (eh || 0) * 60 + (em || 0);
  return start <= end ? (cur >= start && cur < end) : (cur >= start || cur < end);
}

// soundType: 'call' | 'msg_private' | 'msg_group' | 'system' | 'redpacket' | 'moments' | 'survey'
function shouldPlaySound(soundType, opts = {}) {
  if (!appData.settings.soundEnabled) return false;            // ① 音效总开关
  if (isGlobalDndNow()) return false;                          // ② 全局免打扰时段
  // ③ 会话独立免打扰：仅该会话消息提示音静音
  if (soundType === 'msg_private' && opts.chatId) {
    const c = appData.contacts.find(x => x.id === opts.chatId);
    if (c && c.msgDnd) return false;
  }
  if (soundType === 'msg_group' && opts.chatId) {
    const g = appData.groups.find(x => x.id === opts.chatId);
    if (g && g.groupDnd) return false;
  }
  // ④ 朋友圈通知独立免打扰：仅屏蔽朋友圈评论回复音效
  if (soundType === 'moments' && appData.settings.momentsNotifyDnd) return false;
  // 红包、问卷通知音效不受朋友圈免打扰限制 —— 直接放行
  return true;
}

// 解析某类别当前生效的铃声ID（联系人/群专属优先）
function resolveSoundId(soundType, opts = {}) {
  const s = appData.settings;
  if (soundType === 'call' && opts.contactId) {
    const c = appData.contacts.find(x => x.id === opts.contactId);
    if (c && c.ringtoneCall) return c.ringtoneCall;
  }
  if (soundType === 'msg_private' && opts.chatId) {
    const c = appData.contacts.find(x => x.id === opts.chatId);
    if (c && c.ringtoneMsg) return c.ringtoneMsg;
  }
  if (soundType === 'msg_group' && opts.chatId) {
    const g = appData.groups.find(x => x.id === opts.chatId);
    if (g && g.groupRingtone) return g.groupRingtone;
  }
  switch (soundType) {
    case 'call': return s.ringtoneCall || 'call_classic';
    case 'msg_private': return s.ringtoneMsg || 'msg_default';
    case 'msg_group': return s.ringtoneGroup || 'grp_default';
    case 'system': return s.ringtoneSystem || 'sys_default';
    case 'redpacket': return 'redpacket';
    case 'moments': return s.ringtoneMoments || 'moments_reply';
    case 'survey': return 'survey_notify';
  }
  return 'sys_default';
}

// 播放通知音效（带免打扰校验）
async function playNotifySound(soundType, opts = {}) {
  if (!shouldPlaySound(soundType, opts)) return;
  const id = resolveSoundId(soundType, opts);
  await playSoundBuffer(id);
}

// 下拉选项：内置 + 自定义
function getRingtoneOptionsHtml(selected) {
  let html = '';
  Object.keys(builtinSoundDefs).forEach(id => {
    html += `<option value="${id}" ${id === selected ? 'selected' : ''}>${builtinSoundDefs[id].name}</option>`;
  });
  if (appData.customRingtones.length > 0) {
    html += '<optgroup label="自定义铃声">';
    appData.customRingtones.forEach(r => {
      html += `<option value="${r.id}" ${r.id === selected ? 'selected' : ''}>${escapeHtml(r.name)}</option>`;
    });
    html += '</optgroup>';
  }
  return html;
}

// ==================== 钱包 & 红包系统 ====================
function fmtMoney(n) { return (Math.round(Number(n || 0) * 100) / 100).toFixed(2); }

// 金额校验：非数字/负数/零 拦截，返回两位小数或 null
function validateAmount(v) {
  const n = parseFloat(v);
  if (isNaN(n) || !isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function getMyWallet() { return Math.round((appData.walletBalance || 0) * 100) / 100; }
function setMyWallet(v) { appData.walletBalance = Math.round(v * 100) / 100; saveData(); }
function addMyWallet(delta) { setMyWallet(getMyWallet() + Math.round(delta * 100) / 100); }

function getContactWallet(contactId) {
  const c = appData.contacts.find(x => x.id === contactId);
  if (!c) return 0;
  if (typeof c.walletBalance !== 'number' || c.walletBalance < 0) c.walletBalance = 500;
  return Math.round(c.walletBalance * 100) / 100;
}
function addContactWallet(contactId, delta) {
  const c = appData.contacts.find(x => x.id === contactId);
  if (!c) return;
  if (typeof c.walletBalance !== 'number') c.walletBalance = 500;
  c.walletBalance = Math.round((c.walletBalance + delta) * 100) / 100;
  saveData();
}

// 红包流水
function addWalletRecord(type, amount, peer, rpId) {
  appData.redPacketRecords.unshift({
    time: Date.now(), type, amount: Math.round(amount * 100) / 100, peer: peer || '', rpId: rpId || null
  });
  if (appData.redPacketRecords.length > 500) appData.redPacketRecords.length = 500;
  saveData();
}

// 群红包随机分金额（保留两位小数，保证剩余可分）
function randomSplitAmount(remainAmount, remainCount) {
  if (remainCount <= 1) return Math.round(remainAmount * 100) / 100;
  const avg = remainAmount / remainCount;
  let amt = avg * (0.4 + Math.random() * 1.2);
  const maxAmt = remainAmount - (remainCount - 1) * 0.01;
  amt = Math.max(0.01, Math.min(amt, maxAmt));
  return Math.round(amt * 100) / 100;
}

const rpCovers = [
  { id: 'classic', name: '经典橙', css: 'linear-gradient(135deg,#f7a44e,#e8742e)', icon: 'fa-gift' },
  { id: 'red',     name: '喜庆红', css: 'linear-gradient(135deg,#f5504e,#c93431)', icon: 'fa-fire' },
  { id: 'blue',    name: '静谧蓝', css: 'linear-gradient(135deg,#5b9df9,#3a6fe0)', icon: 'fa-coins' },
  { id: 'green',   name: '生机绿', css: 'linear-gradient(135deg,#5ec98f,#2f9d63)', icon: 'fa-leaf' },
  { id: 'pink',    name: '浪漫粉', css: 'linear-gradient(135deg,#f08fb0,#d05a8a)', icon: 'fa-heart' }
];
function getRpCover(id) { return rpCovers.find(c => c.id === id) || rpCovers[0]; }

let rpDraft = { cover: 'classic' };

// 红包 / 转账 合并弹窗
function openMoneyModal(defaultTab = 'rp') {
  if (!appData.currentChatId) { showToast('请先选择一个会话'); return; }
  const isGroup = appData.currentChatType === 'group';
  const balance = getMyWallet();
  const peerName = getCurrentConvName();
  rpDraft = { cover: 'classic', count: isGroup ? 3 : 1 };
  const tab = (isGroup || defaultTab !== 'tf') ? 'rp' : 'tf';

  const rpPane = `
    <div style="padding:10px 12px;background:var(--bg-tertiary);border-radius:10px;margin-bottom:12px;">
      <div style="font-size:12px;color:var(--text-secondary);">当前余额（我的钱包）</div>
      <div style="font-size:22px;font-weight:700;color:#e8433f;">¥ ${fmtMoney(balance)}</div>
    </div>
    <div class="form-group">
      <label>金额（元）${isGroup ? '（总金额，按份数随机分配）' : ''}</label>
      <input type="number" class="input" id="rpAmountInput" placeholder="0.00" min="0.01" step="0.01">
    </div>
    ${isGroup ? `
    <div class="form-group">
      <label>份数</label>
      <input type="number" class="input" id="rpCountInput" value="3" min="1" step="1">
    </div>` : ''}
    <div class="form-group">
      <label>留言</label>
      <input type="text" class="input" id="rpMsgInput" placeholder="恭喜发财，大吉大利" maxlength="30">
    </div>
    <div class="form-group">
      <label>红包封面</label>
      <div class="rp-cover-options" id="rpCoverOptions">
        ${rpCovers.map(c => `
          <div class="rp-cover-opt ${c.id === 'classic' ? 'active' : ''}" data-cover="${c.id}" style="background:${c.css};"
               onclick="selectRpCover('${c.id}')"><i class="fas ${c.icon}"></i> ${c.name}</div>
        `).join('')}
      </div>
    </div>
    <div class="setting-desc" style="font-size:11px;">对方：${escapeHtml(peerName)} · 红包24小时未领完将自动退回</div>
    <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="confirmSendRedPacket()">塞钱进红包</button>
  `;

  const tfPane = isGroup ? '' : `
    <div style="padding:10px 12px;background:var(--bg-tertiary);border-radius:10px;margin-bottom:12px;">
      <div style="font-size:12px;color:var(--text-secondary);">当前余额（我的钱包）</div>
      <div style="font-size:22px;font-weight:700;color:#ef8f2e;">¥ ${fmtMoney(balance)}</div>
    </div>
    <div class="form-group">
      <label>转账金额（元）</label>
      <input type="number" class="input" id="tfAmountInput" placeholder="0.00" min="0.01" step="0.01">
    </div>
    <div class="form-group">
      <label>转账说明</label>
      <input type="text" class="input" id="tfNoteInput" placeholder="转账" maxlength="20">
    </div>
    <div class="setting-desc" style="font-size:11px;">收款方：${escapeHtml(peerName)} · 对方将在几秒内自动确认收款</div>
    <button class="btn btn-primary" style="width:100%;margin-top:12px;background:#ef8f2e;border-color:#ef8f2e;" onclick="confirmTransfer()">转账</button>
  `;

  const body = `
    ${isGroup ? '' : `
    <div class="money-tabs">
      <div class="money-tab ${tab === 'rp' ? 'active' : ''}" id="moneyTabRp" onclick="switchMoneyTab('rp')">发红包</div>
      <div class="money-tab ${tab === 'tf' ? 'active' : ''}" id="moneyTabTf" onclick="switchMoneyTab('tf')">转账</div>
    </div>`}
    <div id="moneyPaneRp" style="display:${tab === 'rp' ? 'block' : 'none'};">${rpPane}</div>
    ${isGroup ? '' : `<div id="moneyPaneTf" style="display:${tab === 'tf' ? 'block' : 'none'};">${tfPane}</div>`}
  `;
  const footer = `<button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>`;
  window.currentModalId = showModal('红包 / 转账', body, footer);
}

function switchMoneyTab(tab) {
  const rpTab = document.getElementById('moneyTabRp');
  const tfTab = document.getElementById('moneyTabTf');
  const rpPane = document.getElementById('moneyPaneRp');
  const tfPane = document.getElementById('moneyPaneTf');
  if (!rpPane) return;
  if (rpTab) rpTab.classList.toggle('active', tab === 'rp');
  if (tfTab) tfTab.classList.toggle('active', tab === 'tf');
  rpPane.style.display = tab === 'rp' ? 'block' : 'none';
  if (tfPane) tfPane.style.display = tab === 'tf' ? 'block' : 'none';
}

function selectRpCover(id) {
  rpDraft.cover = id;
  document.querySelectorAll('#rpCoverOptions .rp-cover-opt').forEach(el => {
    el.classList.toggle('active', el.dataset.cover === id);
  });
}

function confirmSendRedPacket() {
  const amount = validateAmount(document.getElementById('rpAmountInput')?.value);
  if (!amount) { showToast('请输入正确的金额（正数，两位小数）'); return; }
  const isGroup = appData.currentChatType === 'group';
  let count = 1;
  if (isGroup) {
    count = parseInt(document.getElementById('rpCountInput')?.value);
    if (!count || count < 1) { showToast('请输入正确的份数'); return; }
    count = Math.min(count, 100);
  }
  if (amount < count * 0.01) { showToast('金额不足以分配'); return; }
  const message = (document.getElementById('rpMsgInput')?.value || '').trim() || '恭喜发财，大吉大利';

  const senderId = 'me';
  const walletNow = getMyWallet();
  if (walletNow < amount) { showToast('余额不足，无法发送'); return; }

  // 扣除余额
  addMyWallet(-amount);

  const rpId = 'rp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  appData.redPackets[rpId] = {
    id: rpId, sender: senderId, chatType: appData.currentChatType, chatId: appData.currentChatId,
    totalAmount: amount, count, remainCount: count, remainAmount: amount,
    message, cover: rpDraft.cover, time: Date.now(), expireAt: Date.now() + 24 * 3600 * 1000,
    claimedBy: [], status: 'active'
  };

  const peerName = getCurrentConvName();
  addWalletRecord('send', amount, peerName, rpId);

  addMessageTo(appData.currentChatType, appData.currentChatId, {
    type: 'redpacket', rpId, sender: senderId, time: Date.now(), content: message
  });

  closeModal(window.currentModalId);
  showToast('红包已发出');
  // 我发的红包：AI 定时来领取
  scheduleAiClaims(rpId);
  refreshWalletPanel();
}

// AI 领取我发的红包（逐份延迟领取）
function scheduleAiClaims(rpId) {
  const rp = appData.redPackets[rpId];
  if (!rp) return;
  const claimOne = () => {
    const p = appData.redPackets[rpId];
    if (!p || p.status !== 'active' || p.remainCount <= 0) return;
    // 私聊红包：对方可能拒收（每个红包只掷一次骰）
    if (p.chatType !== 'group' && !p.rejectRolled) {
      p.rejectRolled = true;
      if (Math.random() < PEER_REJECT_CHANCE) {
        const c = appData.contacts.find(x => x.id === p.chatId);
        const refundAmt = p.remainAmount;
        p.rejected = true;
        p.status = 'done';
        p.remainAmount = 0;
        setMyWallet(getMyWallet() + refundAmt);
        addWalletRecord('refund', refundAmt, c ? c.name : '');
        const key0 = 'contact_' + p.chatId;
        if (!appData.chatRecords[key0]) appData.chatRecords[key0] = [];
        appData.chatRecords[key0].push({
          type: 'poke',
          content: `${c ? c.name : '对方'} 拒收了你的红包，金额已退回 ¥${fmtMoney(refundAmt)}`,
          sender: p.chatId, time: Date.now()
        });
        saveData();
        if (appData.currentChatId === p.chatId && appData.currentChatType === p.chatType) renderChatMessages();
        renderConversations();
        showToast('对方拒收了红包，金额已退回');
        if (shouldPlaySound('redpacket', {})) playSoundBuffer('redpacket');
        if (window.currentPage === 'settings') refreshWalletPanel();
        return;
      }
      saveData();
    }
    // 领取人：群聊从成员里随机，私聊为对方
    let claimerId;
    if (p.chatType === 'group') {
      const g = appData.groups.find(x => x.id === p.chatId);
      const pool = (g ? g.memberIds : []).filter(id => id !== p.sender);
      if (pool.length === 0) pool.push(...appData.contacts.map(c => c.id).slice(0, 1));
      claimerId = pool[Math.floor(Math.random() * pool.length)] || appData.contacts[0]?.id;
    } else {
      claimerId = p.chatId;
    }
    const c = appData.contacts.find(x => x.id === claimerId);
    if (!c) return;
    const amount = p.count === 1 ? p.remainAmount : randomSplitAmount(p.remainAmount, p.remainCount);
    p.remainAmount = Math.round((p.remainAmount - amount) * 100) / 100;
    p.remainCount -= 1;
    p.claimedBy.push({ who: claimerId, amount, time: Date.now() });
    addContactWallet(claimerId, amount);
    if (p.remainCount <= 0) { p.remainAmount = 0; p.status = 'done'; }
    saveData();

    // 系统消息 + 领取通知音效（不受朋友圈免打扰限制，仅受总开关/全局免打扰限制）
    const key = (p.chatType === 'group' ? 'group_' : 'contact_') + p.chatId;
    if (!appData.chatRecords[key]) appData.chatRecords[key] = [];
    appData.chatRecords[key].push({ type: 'poke', content: `${c.name} 领取了${isSelf(p.sender) ? '你的' : '红包'}红包 ¥${fmtMoney(amount)}`, sender: claimerId, time: Date.now() });
    saveData();
    if (appData.currentChatId === p.chatId && appData.currentChatType === p.chatType) renderChatMessages();
    renderConversations();
    if (shouldPlaySound('redpacket', {})) playSoundBuffer('redpacket');
    if (window.currentPage === 'settings') refreshWalletPanel();

    if (appData.redPackets[rpId] && appData.redPackets[rpId].status === 'active') {
      trackManagedTimeout('rpClaims', claimOne, randomInt(3000, 12000));
    }
  };
  trackManagedTimeout('rpClaims', claimOne, randomInt(3000, 10000));
}

// ==================== AI 主动发红包（消耗对方自身钱包） ====================
function aiSendRedPacket(chatType, chatId, senderId) {
  const sender = appData.contacts.find(c => c.id === senderId);
  if (!sender) return;
  // 会话可能已被删除
  const exists = chatType === 'group'
    ? appData.groups.some(g => g.id === chatId)
    : appData.contacts.some(c => c.id === chatId);
  if (!exists) return;

  const balance = getContactWallet(senderId);
  if (balance < 1) return; // 余额不足1元不发

  // 金额：余额的 5%~20%，至少1元，最多50元且不超余额
  let amount = Math.round(balance * (0.05 + Math.random() * 0.15) * 100) / 100;
  amount = Math.max(1, Math.min(amount, 50, balance));

  const isGroup = chatType === 'group';
  const count = isGroup ? randomInt(2, 5) : 1;
  if (amount < count * 0.01) return;

  addContactWallet(senderId, -amount);
  // AI发红包也记录流水（对方出账）
  addWalletRecord('send', amount, sender.name, rpId);

  const rpId = 'rp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  appData.redPackets[rpId] = {
    id: rpId, sender: senderId, chatType, chatId,
    totalAmount: amount, count, remainCount: count, remainAmount: amount,
    message: randomPick(['恭喜发财，大吉大利', '手气红包', '一点心意', '发个红包开心一下', '看看谁是运气王']),
    cover: rpCovers[Math.floor(Math.random() * rpCovers.length)].id,
    time: Date.now(), expireAt: Date.now() + 24 * 3600 * 1000,
    claimedBy: [], status: 'active'
  };
  saveData();
  addMessageTo(chatType, chatId, {
    type: 'redpacket', rpId, sender: senderId, time: Date.now(),
    content: appData.redPackets[rpId].message
  });
  showToast(`${sender.name} 发了一个红包，快去领取`);
  // 群红包：其他AI成员稍后陆续来抢
  if (isGroup) scheduleAiClaims(rpId);
  if (window.currentPage === 'settings') refreshWalletPanel();
}

function toggleAiRedPacket() {
  appData.settings.aiRedPacket = !appData.settings.aiRedPacket;
  saveData();
  refreshWalletPanel();
  showToast(appData.settings.aiRedPacket ? 'AI随机发红包已开启' : 'AI随机发红包已关闭');
}

function setAiRedPacketChance(v) {
  const n = parseInt(v);
  if (!n || n < 1 || n > 100) { showToast('概率范围 1~100'); refreshWalletPanel(); return; }
  appData.settings.aiRedPacketChance = n;
  saveData();
  refreshWalletPanel();
  showToast('触发概率已设为 ' + n + '%');
}

// 红包状态判定
function getRpView(rpId) {
  const rp = appData.redPackets[rpId];
  if (!rp) return null;
  const selfId = 'me';
  const mineSent = rp.sender === selfId;
  const myClaim = rp.claimedBy.find(c => c.who === selfId);
  let state;
  if (rp.rejected) state = 'rejected';
  else if (rp.status === 'expired' || Date.now() > rp.expireAt) state = 'expired';
  else if (rp.remainCount <= 0) state = 'done';
  else if (myClaim) state = 'claimed';
  else if (mineSent) state = 'mine';
  else state = 'claimable';
  return { rp, mineSent, myClaim, state };
}

// 红包消息气泡渲染（renderMessageBubble 调用）
function renderRedPacketBubble(rpId) {
  const v = getRpView(rpId);
  if (!v) return '<div class="bubble">[红包已失效]</div>';
  const { rp, state, myClaim } = v;
  const cover = getRpCover(rp.cover);
  let subText = '';
  if (state === 'rejected') subText = '对方已拒收，金额已退回';
  else if (state === 'expired') subText = '已过期';
  else if (state === 'done') subText = rp.count > 1 ? `${rp.count}/${rp.count} 已被领完` : '已被领取';
  else if (state === 'claimed') subText = `已领取 ¥${fmtMoney(myClaim.amount)}`;
  else if (state === 'mine') subText = `${rp.count - rp.remainCount}/${rp.count} 已领取`;
  else subText = '领取红包';
  const stateCls = (state === 'expired' || state === 'done') ? (state === 'done' && !myClaim ? 'done' : (state === 'expired' ? 'expired' : '')) : '';
  return `
    <div class="rp-bubble ${state === 'expired' || state === 'rejected' ? 'expired' : ''} ${state === 'done' && !myClaim ? 'done' : ''}" onclick="openRedPacketDetail('${rpId}')">
      <div class="rp-bubble-top">
        <div class="rp-cover-icon" style="background:${cover.css};color:#fff;"><i class="fas ${cover.icon}"></i></div>
        <div style="min-width:0;">
          <div class="rp-bubble-msg">${escapeHtml(rp.message || '恭喜发财，大吉大利')}</div>
          <div class="rp-bubble-sub">${subText}</div>
        </div>
      </div>
      <div class="rp-bubble-bottom"><i class="fas fa-gift"></i> 红包 · 24小时未领完退回</div>
    </div>
  `;
}

// 红包详情/领取弹窗
function openRedPacketDetail(rpId) {
  const v = getRpView(rpId);
  if (!v) return;
  const { rp, state, myClaim, mineSent } = v;
  const cover = getRpCover(rp.cover);
  const senderName = isSelf(rp.sender) ? getSelfName() :
    (appData.contacts.find(c => c.id === rp.sender)?.name || '对方');

  let body = `
    <div style="text-align:center;padding:20px 0 10px;background:${cover.css};border-radius:12px;margin-bottom:14px;">
      <div style="color:#fff;font-size:14px;">${escapeHtml(senderName)} 的红包</div>
      <div style="color:rgba(255,255,255,.9);font-size:12px;margin-top:4px;">${escapeHtml(rp.message || '恭喜发财，大吉大利')}</div>
      <div style="color:#fff;font-size:13px;margin-top:12px;">
        ${state === 'claimed' ? `已领取 <b style="font-size:26px;">¥${fmtMoney(myClaim.amount)}</b>` :
          (state === 'claimable' ? '点击下方按钮领取' :
           (state === 'mine' ? `已领取 ${rp.count - rp.remainCount}/${rp.count} 份` :
            (state === 'rejected' ? '对方已拒收，红包金额已退回' :
             (state === 'done' ? '手慢了，红包已被领完' : '红包已过期，金额已退回')))) }
      </div>
    </div>
    <div class="rp-detail-row"><span>总金额</span><span>¥ ${fmtMoney(rp.totalAmount)}</span></div>
    <div class="rp-detail-row"><span>份数</span><span>${rp.count} 份（剩 ${Math.max(0, rp.remainCount)} 份）</span></div>
    ${rp.claimedBy.length > 0 ? `
      <div class="panel-section-title" style="margin:10px 0 4px;">领取记录</div>
      ${rp.claimedBy.map(cl => {
        const nm = isSelf(cl.who) ? getSelfName() : (appData.contacts.find(c => c.id === cl.who)?.name || '未知');
        return `<div class="rp-record-row"><span>${escapeHtml(nm)}</span><span class="amt in">+¥${fmtMoney(cl.amount)}</span></div>`;
      }).join('')}` : ''}
  `;

  let footer = `<button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>`;
  if (state === 'claimable') {
    footer = `<button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>
      <button class="btn btn-primary" style="background:#e8433f;" onclick="claimRedPacket('${rpId}')"><i class="fas fa-gift"></i> 领取</button>`;
  }
  window.currentModalId = showModal('红包详情', body, footer);
}

// 我方领取红包
function claimRedPacket(rpId) {
  const v = getRpView(rpId);
  if (!v || v.state !== 'claimable') return;
  const { rp } = v;
  const amount = rp.count === 1 ? rp.remainAmount : randomSplitAmount(rp.remainAmount, rp.remainCount);
  rp.remainAmount = Math.round((rp.remainAmount - amount) * 100) / 100;
  rp.remainCount -= 1;
  const selfId = 'me';
  rp.claimedBy.push({ who: selfId, amount, time: Date.now() });
  if (rp.remainCount <= 0) { rp.remainAmount = 0; rp.status = 'done'; }
  addMyWallet(amount); addWalletRecord('receive', amount, isSelf(rp.sender) ? '' : (appData.contacts.find(c => c.id === rp.sender)?.name || ''), rpId);
  saveData();

  // 红包领取音效（不受朋友圈免打扰/群免打扰限制）
  if (shouldPlaySound('redpacket', {})) playSoundBuffer('redpacket');

  closeModal(window.currentModalId);
  showToast(`已领取红包 ¥${fmtMoney(amount)}`);
  renderChatMessages();
  refreshWalletPanel();
  // 如果还有剩余份数，重新打开红包详情让用户看到最新状态
  if (rp.status === 'active' && rp.remainCount > 0) {
    setTimeout(() => openRedPacketDetail(rpId), 200);
  }
}

// 红包过期退回（24小时）
function refundExpiredRedPackets() {
  const now = Date.now();
  let changed = false;
  Object.values(appData.redPackets).forEach(rp => {
    if (rp.status === 'active' && now > rp.expireAt && rp.remainCount > 0) {
      rp.status = 'expired';
      const refund = rp.remainAmount;
      if (rp.sender === 'me') {
        addMyWallet(refund);
        addWalletRecord('refund', refund, '', rp.id);
      } else {
        addContactWallet(rp.sender, refund);
      }
      rp.remainAmount = 0;
      // 系统提示消息
      const key = (rp.chatType === 'group' ? 'group_' : 'contact_') + rp.chatId;
      if (appData.chatRecords[key]) {
        appData.chatRecords[key].push({ type: 'poke', content: '红包已过期，剩余金额已退回', sender: 'system', time: Date.now() });
      }
      changed = true;
    }
  });
  if (changed) {
    saveData();
    if (appData.currentChatId) renderChatMessages();
    if (window.currentPage === 'settings') refreshWalletPanel();
  }
}

// 过期检查定时器（60秒一次）
function startRedPacketExpireTimer() {
  if (managedTimers.rpExpire) clearInterval(managedTimers.rpExpire);
  managedTimers.rpExpire = setInterval(refundExpiredRedPackets, 60 * 1000);
}

// 分项导出：红包流水
function exportRedPacketRecords() {
  if (appData.redPacketRecords.length === 0) { showToast('暂无红包流水'); return; }
  downloadJSON(appData.redPacketRecords, '红包流水_' + new Date().toISOString().slice(0, 10) + '.json');
  showToast('已导出红包流水');
}

// ---- 钱包设置面板 ----
function refreshWalletPanel() {
  const body = document.getElementById('walletPanelBody');
  if (!body) return;
  const records = appData.redPacketRecords.slice(0, 30);
  const typeLabel = { send: '发出', receive: '收到', refund: '退回', transfer_out: '转账支出', transfer_in: '转账收款' };
  body.innerHTML = `
    <div class="wallet-balance-card">
      <div class="wallet-balance-label"><i class="fas fa-wallet"></i> 我的钱包余额</div>
      <div class="wallet-balance-val">¥ ${fmtMoney(getMyWallet())}</div>
      <div class="wallet-quick-row">
        <button class="wallet-quick-btn" onclick="openWalletModifyModal()">修改余额</button>
        <button class="wallet-quick-btn" onclick="resetMyWallet()">重置余额</button>
      </div>
    </div>
    <div class="panel-section-title">联系人钱包（对方红包余额）
      <span>
        <button class="mini-btn" onclick="openBatchContactWalletModal()">批量修改</button>
        <button class="mini-btn" style="color:var(--danger);margin-left:8px;" onclick="resetAllContactWallets()">全部重置</button>
      </span>
    </div>
    ${appData.contacts.length === 0 ? '<div class="empty-mini">暂无联系人</div>' : `
    <div class="contact-wallet-list">
      ${appData.contacts.map(c => {
        return `
        <div class="contact-wallet-row ${getContactWallet(c.id) < 10 ? 'low-balance' : ''}">
          ${getAvatarHTML(c.avatar, c.name)}
          <div class="nm">
            <div class="n">${escapeHtml(c.name)}</div>
            <div class="b">¥ ${fmtMoney(getContactWallet(c.id))}</div>
          </div>
          <button class="cw-op-btn" onclick="openContactWalletModal('${c.id}')">修改</button>
          <button class="cw-op-btn danger" onclick="resetContactWallet('${c.id}')">重置</button>
        </div>`;
      }).join('')}
    </div>`}
    <div class="wallet-stats-row">
      <span>联系人总计 ${appData.contacts.length} 人</span>
      <span>合计余额 <span class="v">¥${fmtMoney(appData.contacts.reduce((s, c) => s + getContactWallet(c.id), 0))}</span></span>
    </div>
    <div class="setting-desc" style="padding:2px 14px 6px;font-size:11px;">修改对方余额不影响我方钱包；对方视角发红包将消耗其余额</div>
    <div class="panel-section-title">AI 红包行为</div>
    <div class="setting-item">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">AI随机发红包</div>
        <div class="setting-desc">聊天中对方小概率主动发红包，消耗其自身余额</div>
      </div>
      <div class="toggle ${appData.settings.aiRedPacket ? 'active' : ''}" onclick="toggleAiRedPacket()"></div>
    </div>
    ${appData.settings.aiRedPacket ? `
    <div class="setting-item">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">触发概率</div>
        <div class="setting-desc">每次对方回复时判定，范围 1~100</div>
      </div>
      <div style="display:flex;align-items:center;gap:4px;padding-right:12px;">
        <input type="number" class="input" style="width:64px;text-align:center;" min="1" max="100" value="${appData.settings.aiRedPacketChance}" onchange="setAiRedPacketChance(this.value)">%
      </div>
    </div>` : ''}
    <div class="panel-section-title">红包流水记录
      <span>
        <button class="mini-btn" onclick="exportRedPacketRecords()">导出</button>
        <button class="mini-btn" style="color:var(--danger);margin-left:8px;" onclick="clearRpRecords()">清空</button>
      </span>
    </div>
    ${records.length === 0 ? '<div class="empty-mini">暂无红包流水</div>' : records.map(r => `
      <div class="rp-record-row" style="margin:6px 12px;">
        <div style="min-width:0;">
          <div style="color:var(--text-primary);">${typeLabel[r.type] || r.type} ${r.peer ? '· ' + escapeHtml(r.peer) : ''}</div>
          <div style="color:var(--text-tertiary);font-size:11px;">${formatFullTime(r.time)}</div>
        </div>
        <span class="amt ${['receive', 'transfer_in'].includes(r.type) ? 'in' : 'out'}">${['send', 'transfer_out'].includes(r.type) ? '-' : '+'}¥${fmtMoney(r.amount)}</span>
      </div>
    `).join('')}
  `;
}

function openWalletModifyModal() {
  const body = `
    <div class="form-group">
      <label>新的余额（元）</label>
      <input type="number" class="input" id="newWalletVal" placeholder="0.00" min="0" step="0.01" value="${fmtMoney(getMyWallet())}">
    </div>
    ${quickAmountBtnsHTML('newWalletVal', 'myw')}
    <div class="setting-desc">金额需为非负数字，保留两位小数</div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="confirmWalletModify()">保存</button>
  `;
  window.currentModalId = showModal('修改钱包余额', body, footer);
}

function confirmWalletModify() {
  const n = validateBalance(document.getElementById('newWalletVal')?.value);
  if (n === null) { showToast('请输入正确的金额（非负数字）'); return; }
  setMyWallet(n);
  closeModal(window.currentModalId);
  showToast('余额已更新');
  refreshWalletPanel();
}

function resetMyWallet() {
  if (!confirm('确定将余额重置为 ¥1000.00 吗？')) return;
  setMyWallet(1000);
  showToast('余额已重置');
  refreshWalletPanel();
}

// ---- 联系人钱包管理（修改对方红包余额） ----
// 余额校验：允许0，非负数字，保留两位小数；非法返回 null
function validateBalance(v) {
  const n = parseFloat(v);
  if (isNaN(n) || !isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

// 公共快捷金额按钮HTML（inputId: 目标输入框id, prefix: 按钮前缀避免冲突）
function quickAmountBtnsHTML(inputId, prefix) {
  const p = prefix || 'q';
  return `
    <div class="form-group">
      <label>快捷设置</label>
      <div class="wallet-quick-row" style="margin-top:0;">
        <button class="wallet-quick-btn flat" onclick="setQuickAmt('${inputId}',100,'${p}')">¥100</button>
        <button class="wallet-quick-btn flat" onclick="setQuickAmt('${inputId}',500,'${p}')">¥500</button>
        <button class="wallet-quick-btn flat" onclick="setQuickAmt('${inputId}',1000,'${p}')">¥1000</button>
        <button class="wallet-quick-btn flat" onclick="setQuickAmt('${inputId}',9999,'${p}')">¥9999</button>
      </div>
      <label style="margin-top:8px;">快捷充值（在当前基础上增加）</label>
      <div class="wallet-quick-row" style="margin-top:0;">
        <button class="wallet-quick-btn flat" onclick="addQuickAmt('${inputId}',50,'${p}')">+¥50</button>
        <button class="wallet-quick-btn flat" onclick="addQuickAmt('${inputId}',100,'${p}')">+¥100</button>
        <button class="wallet-quick-btn flat" onclick="addQuickAmt('${inputId}',500,'${p}')">+¥500</button>
        <button class="wallet-quick-btn flat" onclick="addQuickAmt('${inputId}',1000,'${p}')">+¥1000</button>
      </div>
    </div>`;
}

// 快捷设置绝对金额
function setQuickAmt(inputId, amt, prefix) {
  const el = document.getElementById(inputId);
  if (el) el.value = amt.toFixed(2);
  // 更新增量基准
  if (prefix) window['_base_' + prefix] = amt;
}

// 快捷增量：在当前输入框值基础上叠加
function addQuickAmt(inputId, amt, prefix) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const cur = validateBalance(el.value) || 0;
  el.value = (cur + amt).toFixed(2);
}

function setContactWallet(contactId, v) {
  const c = appData.contacts.find(x => x.id === contactId);
  if (!c) return;
  const n = Math.round(v * 100) / 100;
  if (isNaN(n) || !isFinite(n) || n < 0) return;
  c.walletBalance = n;
  saveData();
}

function openContactWalletModal(contactId) {
  const c = appData.contacts.find(x => x.id === contactId);
  if (!c) return;
  const body = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
      ${getAvatarHTML(c.avatar, c.name)}
      <div style="min-width:0;">
        <div style="font-size:15px;font-weight:600;color:var(--text-primary);">${escapeHtml(c.name)}</div>
        <div style="font-size:12px;color:#e8433f;font-weight:600;">当前余额 ¥ ${fmtMoney(getContactWallet(contactId))}</div>
      </div>
    </div>
    <div class="form-group">
      <label>新的余额（元）</label>
      <input type="number" class="input" id="newContactWalletVal" placeholder="0.00" min="0" step="0.01" value="${fmtMoney(getContactWallet(contactId))}">
    </div>
    ${quickAmountBtnsHTML('newContactWalletVal', 'cw')}
    <div class="setting-desc">金额需为非负数字，保留两位小数。修改的是「${escapeHtml(c.name)}」的虚拟钱包，不影响我方钱包余额。</div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="confirmContactWalletModify('${contactId}')">保存</button>
  `;
  window.currentModalId = showModal('修改对方钱包余额', body, footer);
}

function confirmContactWalletModify(contactId) {
  const n = validateBalance(document.getElementById('newContactWalletVal')?.value);
  if (n === null) { showToast('请输入正确的金额（非负数字）'); return; }
  const c = appData.contacts.find(x => x.id === contactId);
  setContactWallet(contactId, n);
  closeModal(window.currentModalId);
  showToast(`「${c ? c.name : '联系人'}」余额已更新为 ¥${fmtMoney(n)}`);
  refreshWalletPanel();
}

function resetContactWallet(contactId) {
  const c = appData.contacts.find(x => x.id === contactId);
  if (!c) return;
  if (!confirm(`确定将「${c.name}」的余额重置为 ¥500.00 吗？`)) return;
  setContactWallet(contactId, 500);
  showToast(`「${c.name}」余额已重置`);
  refreshWalletPanel();
}

function resetAllContactWallets() {
  if (appData.contacts.length === 0) { showToast('暂无联系人'); return; }
  if (!confirm(`确定将全部 ${appData.contacts.length} 位联系人的余额重置为 ¥500.00 吗？`)) return;
  appData.contacts.forEach(c => { c.walletBalance = 500; });
  saveData();
  showToast('全部联系人余额已重置');
  refreshWalletPanel();
}

function openBatchContactWalletModal() {
  if (appData.contacts.length === 0) { showToast('暂无联系人'); return; }
  const body = `
    <div class="form-group">
      <label>统一设置全部联系人余额（元）</label>
      <input type="number" class="input" id="batchWalletVal" placeholder="0.00" min="0" step="0.01" value="500.00">
    </div>
    ${quickAmountBtnsHTML('batchWalletVal', 'bw')}
    <div class="setting-desc">将一次性应用到全部 ${appData.contacts.length} 位联系人。金额需为非负数字，保留两位小数，不影响我方钱包。</div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="confirmBatchContactWallet()">应用</button>
  `;
  window.currentModalId = showModal('批量修改联系人钱包', body, footer);
}

function confirmBatchContactWallet() {
  const n = validateBalance(document.getElementById('batchWalletVal')?.value);
  if (n === null) { showToast('请输入正确的金额（非负数字）'); return; }
  appData.contacts.forEach(c => { c.walletBalance = n; });
  saveData();
  closeModal(window.currentModalId);
  showToast(`已将 ${appData.contacts.length} 位联系人余额设为 ¥${fmtMoney(n)}`);
  refreshWalletPanel();
}

function clearRpRecords() {
  if (appData.redPacketRecords.length === 0) { showToast('暂无流水可清空'); return; }
  if (!confirm('确定清空全部红包流水记录吗？')) return;
  appData.redPacketRecords = [];
  saveData();
  showToast('红包流水已清空');
  refreshWalletPanel();
}


// ==================== 朋友圈模块 ====================
let momentsFilter = null; // null=全部 | 'mine' | contactId
let pubDraftImages = [];  // 发布弹窗内的图片
let pubDraftVis = 'public';
let pubDraftVisibleIds = [];

function getMomentById(id) { return appData.moments.find(m => m.id === id); }

// 渲染朋友圈页面（头像/昵称/背景）
function renderMomentsPage() {
  // 对方视角下显示对方的头像和昵称，不显示我方信息
  const avatarEl = document.getElementById('momentsMyAvatar');
  if (avatarEl) avatarEl.innerHTML = getAvatarHTML(getSelfAvatar(), getSelfName(), 'lg');
  const nameEl = document.getElementById('momentsMyName');
  if (nameEl) nameEl.textContent = getSelfName();
  applyMomentsBg();
  renderMomentsFeed();
}

function applyMomentsBg() {
  const cover = document.getElementById('momentsCover');
  if (!cover) return;
  const bg = appData.settings.momentsBgImage;
  if (bg) {
    cover.style.background = `url("${bg}") center/cover no-repeat`;
  } else {
    cover.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
}

// 背景设置弹窗
function openMomentsBgModal() {
  const body = `
    <div class="avatar-upload-row">
      <div class="avatar avatar-lg" id="momentsBgPreview" style="border-radius:10px;width:120px;height:70px;background:${appData.settings.momentsBgImage ? `url('${appData.settings.momentsBgImage}') center/cover` : 'linear-gradient(135deg,#667eea,#764ba2)'};"></div>
      <div style="display:flex;gap:8px;flex-direction:column;">
        <button class="btn btn-secondary" onclick="document.getElementById('momentsBgFile').click()"><i class="fas fa-upload"></i> 上传背景图</button>
        ${appData.settings.momentsBgImage ? '<button class="btn btn-danger" onclick="resetMomentsBg()">恢复默认背景</button>' : ''}
      </div>
      <input type="file" id="momentsBgFile" accept="image/*" style="display:none;" onchange="handleMomentsBgUpload(event)">
    </div>
    <div class="setting-desc" style="margin-top:10px;">自定义朋友圈顶部背景图</div>
  `;
  const footer = `<button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>`;
  window.currentModalId = showModal('朋友圈背景', body, footer);
}

async function handleMomentsBgUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('请选择图片文件'); return; }
  try {
    const compressed = await compressImage(file, 900, 0.75);
    appData.settings.momentsBgImage = compressed;
    saveData();
    applyMomentsBg();
    closeModal(window.currentModalId);
    showToast('朋友圈背景已更新');
  } catch (e) {
    showToast('图片处理失败');
  }
  event.target.value = '';
}

function resetMomentsBg() {
  appData.settings.momentsBgImage = '';
  saveData();
  applyMomentsBg();
  closeModal(window.currentModalId);
  showToast('已恢复默认背景');
}

// 过滤切换：全部 → 我的 → 各联系人
function cycleMomentsFilter() {
  const selfId = getSelfId();
  const authors = [...new Set(appData.moments.map(m => m.authorId).filter(a => a !== selfId))];
  const states = [null, 'mine', ...authors];
  const curIdx = states.indexOf(momentsFilter);
  momentsFilter = states[(curIdx + 1) % states.length];
  const btn = document.getElementById('momentsFilterBtn');
  if (btn) {
    if (momentsFilter === null) btn.innerHTML = '<i class="fas fa-filter"></i> 全部';
    else if (momentsFilter === 'mine') btn.innerHTML = `<i class="fas fa-user"></i> 我的`;
    else {
      const c = appData.contacts.find(x => x.id === momentsFilter);
      btn.innerHTML = `<i class="fas fa-user"></i> ${escapeHtml(c ? c.name : 'TA')}`;
    }
  }
  renderMomentsFeed();
}

// 当前视角能看到该动态吗
function canISeeMoment(m) {
  if (m.authorId === getSelfId()) return true;
  if (m.visibility === 'private') return false;
  if (m.visibility === 'friends') return m.visibleIds.length === 0 || true;
  return true;
}

const visLabel = { public: '公开', friends: '部分可见', private: '仅自己可见' };

// 渲染动态流
function renderMomentsFeed() {
  const feed = document.getElementById('momentsFeed');
  if (!feed) return;
  let list = [...appData.moments].sort((a, b) => b.time - a.time);
  if (momentsFilter === 'mine') list = list.filter(m => m.authorId === getSelfId());
  else if (momentsFilter) list = list.filter(m => m.authorId === momentsFilter);

  if (list.length === 0) {
    feed.innerHTML = '<div class="moment-empty"><i class="fas fa-camera-retro"></i>还没有朋友圈动态<br><span style="font-size:12px;">发布一条动态试试吧</span></div>';
    return;
  }

  feed.innerHTML = list.map(m => renderMomentCard(m, false)).join('');
}

// 渲染单条动态卡片（detail=true 时在弹窗内展示全部评论）
function renderMomentCard(m, detail) {
  const selfId = getSelfId();
  const isMine = m.authorId === selfId;
  const author = isMine
    ? { name: getSelfName(), avatar: getSelfAvatar() }
    : (appData.contacts.find(c => c.id === m.authorId) || { name: '未知联系人', avatar: '' });
  const liked = m.likes.includes(selfId);
  const comments = m.comments;
  const shownComments = detail ? comments : comments.slice(-4);
  const hiddenCount = Math.max(0, comments.length - shownComments.length);

  const imgCols = m.images.length === 1 ? 1 : (m.images.length === 2 || m.images.length === 4 ? 2 : 3);
  const imgGrid = m.images.length > 0 ? `
    <div class="moment-img-grid cols-${imgCols}">
      ${m.images.map((img, i) => `
        <img src="${img}" alt="动态图片${i + 1}"
             onclick="openImagePreview('${img}')"
             oncontextmenu="event.preventDefault();saveMomentsImage('${img}');return false;"
             ontouchstart="momentImgTouchStart('${img}')"
             ontouchend="momentImgTouchEnd()"
             ontouchmove="momentImgTouchEnd()">
      `).join('')}
    </div>` : '';

  const viewerText = m.viewers.length > 0
    ? `<i class="fas fa-eye"></i> ${m.viewers.slice(0, 3).map(v => escapeHtml(v.name)).join('、')}${m.viewers.length > 3 ? ` 等${m.viewers.length}人看过` : ' 看过'}`
    : '';

  return `
    <div class="moment-card">
      <div class="moment-head">
        ${getAvatarHTML(author.avatar, author.name)}
        <div class="moment-author">
          <div class="moment-author-name">${escapeHtml(author.name)}</div>
          <div class="moment-time">
            ${formatFullTime(m.time)}
            <span class="moment-vis-tag"><i class="fas ${m.visibility === 'private' ? 'fa-lock' : (m.visibility === 'friends' ? 'fa-user-group' : 'fa-globe')}"></i> ${visLabel[m.visibility]}</span>
          </div>
        </div>
        ${isMine ? `<button class="moment-del-btn" title="删除" onclick="deleteMoment('${m.id}')"><i class="fas fa-trash"></i></button>` : ''}
      </div>
      ${m.text ? `<div class="moment-text">${escapeHtml(m.text)}</div>` : ''}
      ${imgGrid}
      ${viewerText ? `<div class="moment-viewers">${viewerText}${!detail && m.viewers.length > 0 ? `<span class="mc-more" onclick="openMomentDetail('${m.id}')" style="margin-left:auto;">全部访客</span>` : ''}</div>` : ''}
      <div class="moment-actions">
        <button class="moment-action-btn ${liked ? 'liked' : ''}" onclick="toggleMomentLike('${m.id}')">
          <i class="fas fa-thumbs-up"></i> ${liked ? '已赞' : '赞'} ${m.likes.length > 0 ? m.likes.length : ''}
        </button>
        <button class="moment-action-btn" onclick="openMomentCommentInput('${m.id}')"><i class="fas fa-comment"></i> 评论 ${comments.length > 0 ? comments.length : ''}</button>
        <button class="moment-action-btn" onclick="shareMomentToChat('${m.id}')"><i class="fas fa-share"></i> 转发</button>
        ${!detail && comments.length > 4 ? `<button class="moment-action-btn" onclick="openMomentDetail('${m.id}')"><i class="fas fa-ellipsis"></i> 详情</button>` : ''}
      </div>
      ${comments.length > 0 ? `
      <div class="moment-comments">
        ${hiddenCount > 0 ? `<div class="mc-more" onclick="openMomentDetail('${m.id}')">展开全部${comments.length}条评论</div>` : ''}
        ${shownComments.map(cm => renderMomentComment(m, cm)).join('')}
      </div>` : ''}
    </div>
  `;
}

// 渲染单条评论（二级嵌套回复 + @标记）
function renderMomentComment(m, cm) {
  const isMine = isSelf(cm.authorId);
  const name = isMine ? getSelfName() :
    (appData.contacts.find(c => c.id === cm.authorId)?.name || '未知');
  const replyTag = cm.replyTo
    ? `<span class="mc-reply-tag">回复 <span class="mc-name" onclick="openMomentCommentInput('${m.id}','${cm.id}')">@${escapeHtml(getCommentAuthorName(m, cm.replyTo))}</span></span>`
    : '';
  return `
    <div class="mc-row">
      <span class="mc-name" onclick="openMomentCommentInput('${m.id}','${cm.id}')">${escapeHtml(name)}</span>
      ${replyTag}：${escapeHtml(cm.text)}
      ${isMine ? `<span class="mc-del" onclick="deleteMomentComment('${m.id}','${cm.id}')">删除</span>` : ''}
    </div>
  `;
}

function getCommentAuthorName(m, commentId) {
  const cm = m.comments.find(c => c.id === commentId);
  if (!cm) return '';
  return isSelf(cm.authorId) ? getSelfName() :
    (appData.contacts.find(c => c.id === cm.authorId)?.name || '未知');
}

// ---------- 发布弹窗（含草稿自动保存/恢复） ----------
function openMomentsPublishModal() {
  const draft = appData.momentsDraft;
  pubDraftImages = draft && Array.isArray(draft.images) ? [...draft.images] : [];
  pubDraftVis = draft ? (draft.visibility || 'public') : 'public';
  pubDraftVisibleIds = draft && Array.isArray(draft.visibleIds) ? [...draft.visibleIds] : [];
  const draftText = draft ? (draft.text || '') : '';
  const pubIdentityHint = '';

  const body = `
    ${pubIdentityHint}
    <div class="form-group">
      <label>这一刻的想法（可留空发纯图片）</label>
      <textarea class="textarea" id="pubMomentText" rows="3" maxlength="500" placeholder="分享此刻..." oninput="saveMomentsDraftLive()">${escapeHtml(draftText)}</textarea>
    </div>
    <div class="form-group">
      <label>图片（可发纯文字，最多9张）</label>
      <div class="pub-img-thumbs" id="pubImgThumbs"></div>
      ${pubDraftImages.length < 9 ? `<div class="pub-img-add" onclick="document.getElementById('pubImgFile').click()"><i class="fas fa-plus"></i></div>` : ''}
      <input type="file" id="pubImgFile" accept="image/*" multiple style="display:none;" onchange="handlePubImgUpload(event)">
    </div>
    <div class="form-group">
      <label>谁可以看</label>
      <div class="pub-vis-select">
        <div class="pub-vis-btn ${pubDraftVis === 'public' ? 'active' : ''}" data-vis="public" onclick="setPubVis('public')"><i class="fas fa-globe"></i> 公开</div>
        <div class="pub-vis-btn ${pubDraftVis === 'friends' ? 'active' : ''}" data-vis="friends" onclick="setPubVis('friends')"><i class="fas fa-user-group"></i> 部分好友</div>
        <div class="pub-vis-btn ${pubDraftVis === 'private' ? 'active' : ''}" data-vis="private" onclick="setPubVis('private')"><i class="fas fa-lock"></i> 仅自己</div>
      </div>
    </div>
    <div id="pubFriendPicker" style="display:${pubDraftVis === 'friends' ? 'block' : 'none'};">
      <div class="setting-desc" style="margin-bottom:4px;">勾选可见的好友（不选则全部好友可见）</div>
      <div class="pub-friend-chips">
        ${appData.contacts.map(c => `
          <div class="pub-friend-chip ${pubDraftVisibleIds.includes(c.id) ? 'active' : ''}" data-cid="${c.id}" onclick="togglePubVisFriend('${c.id}')">${escapeHtml(c.name)}</div>
        `).join('')}
      </div>
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="saveMomentsDraftAndClose()">存草稿</button>
    <button class="btn btn-primary" onclick="publishMoment()">发表</button>
  `;
  window.currentModalId = showModal('发表朋友圈', body, footer);
  renderPubThumbs();
}

function renderPubThumbs() {
  const box = document.getElementById('pubImgThumbs');
  if (!box) return;
  box.innerHTML = pubDraftImages.map((img, i) => `
    <div class="pub-img-thumb">
      <img src="${img}">
      <div class="rm" onclick="removePubImg(${i})"><i class="fas fa-times"></i></div>
    </div>
  `).join('');
  const addBtn = document.querySelector('#modalContainer .pub-img-add');
  if (addBtn) addBtn.style.display = pubDraftImages.length >= 9 ? 'none' : 'flex';
}

async function handlePubImgUpload(event) {
  const files = [...event.target.files];
  event.target.value = '';
  for (const file of files) {
    if (pubDraftImages.length >= 9) { showToast('最多9张图片'); break; }
    if (!file.type.startsWith('image/')) continue;
    try {
      const compressed = await compressImage(file, 900, 0.75);
      pubDraftImages.push(compressed);
    } catch (e) {}
  }
  renderPubThumbs();
  saveMomentsDraftLive();
}

function removePubImg(i) {
  pubDraftImages.splice(i, 1);
  renderPubThumbs();
  saveMomentsDraftLive();
}

function setPubVis(v) {
  pubDraftVis = v;
  document.querySelectorAll('.pub-vis-btn').forEach(el => {
    el.classList.toggle('active', el.dataset.vis === v);
  });
  const picker = document.getElementById('pubFriendPicker');
  if (picker) picker.style.display = v === 'friends' ? 'block' : 'none';
  saveMomentsDraftLive();
}

function togglePubVisFriend(cid) {
  const i = pubDraftVisibleIds.indexOf(cid);
  if (i > -1) pubDraftVisibleIds.splice(i, 1); else pubDraftVisibleIds.push(cid);
  document.querySelectorAll(`.pub-friend-chip[data-cid="${cid}"]`).forEach(el => {
    el.classList.toggle('active', pubDraftVisibleIds.includes(cid));
  });
  saveMomentsDraftLive();
}

// 实时保存草稿（任何输入变化都保存，关闭弹窗自动保留）
function saveMomentsDraftLive() {
  const textEl = document.getElementById('pubMomentText');
  appData.momentsDraft = {
    text: textEl ? textEl.value : '',
    images: [...pubDraftImages],
    visibility: pubDraftVis,
    visibleIds: [...pubDraftVisibleIds]
  };
  saveData();
}

function saveMomentsDraftAndClose() {
  saveMomentsDraftLive();
  closeModal(window.currentModalId);
  showToast('草稿已保存，下次打开自动恢复');
}

// 发表
function publishMoment() {
  saveMomentsDraftLive();
  const d = appData.momentsDraft;
  if (!d.text.trim() && d.images.length === 0) { showToast('请输入文字或添加图片'); return; }
  const authorId = 'me';
  const authorName = appData.myProfile.nickname || '我';
  const authorAvatar = appData.myProfile.avatar;
  appData.moments.unshift({
    id: 'mom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    authorId, authorName, authorAvatar,
    text: d.text.trim(), images: [...d.images],
    visibility: d.visibility, visibleIds: [...d.visibleIds],
    time: Date.now(), likes: [], comments: [], viewers: []
  });
  appData.momentsDraft = null;
  saveData();
  closeModal(window.currentModalId);
  showToast('朋友圈已发表');
  renderMomentsFeed();
  // AI 联系人稍后来浏览/点赞/评论我发的动态
  scheduleAiBrowseDelay(true);
}

// ---------- 互动 ----------
function toggleMomentLike(id) {
  const m = getMomentById(id);
  if (!m) return;
  const selfId = getSelfId();
  const i = m.likes.indexOf(selfId);
  if (i > -1) { m.likes.splice(i, 1); } else { m.likes.push(selfId); }
  saveData();
  renderMomentsFeed();
}

// 评论输入弹窗（replyTo 可选）
function openMomentCommentInput(id, replyTo) {
  const m = getMomentById(id);
  if (!m) return;
  let replyHint = '';
  if (replyTo) {
    replyHint = `<div class="setting-desc" style="margin-bottom:8px;">回复 @${escapeHtml(getCommentAuthorName(m, replyTo))}</div>`;
  }
  const body = `
    ${replyHint}
    <div class="form-group">
      <textarea class="textarea" id="momentCommentText" rows="3" maxlength="200" placeholder="说点什么..."></textarea>
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="submitMomentComment('${id}', ${replyTo ? `'${replyTo}'` : 'null'})">发送</button>
  `;
  window.currentModalId = showModal('评论', body, footer);
  setTimeout(() => document.getElementById('momentCommentText')?.focus(), 100);
}

function submitMomentComment(id, replyTo) {
  const m = getMomentById(id);
  const el = document.getElementById('momentCommentText');
  if (!m || !el) return;
  const text = el.value.trim();
  if (!text) { showToast('请输入评论内容'); return; }
  const authorId = 'me';
  const cm = {
    id: 'cmc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    authorId, text, replyTo: replyTo || null, time: Date.now()
  };
  m.comments.push(cm);
  saveData();
  closeModal(window.currentModalId);
  renderMomentsFeed();
  showToast('评论已发表');

  // 我回复了 AI 的评论 → AI 有概率二次回复
  if (replyTo) {
    const replied = m.comments.find(c => c.id === replyTo);
    if (replied && !isSelf(replied.authorId)) {
      if (Math.random() < 0.5) {
        trackManagedTimeout('momentsReplys', () => aiReplyToComment(m.id, cm.id), randomInt(2500, 8000));
      }
    }
  }
}

function deleteMoment(id) {
  const m = getMomentById(id);
  if (!m) return;
  if (!isSelf(m.authorId)) return;
  if (!confirm('确定删除这条朋友圈动态吗？')) return;
  appData.moments = appData.moments.filter(x => x.id !== id);
  saveData();
  renderMomentsFeed();
  showToast('动态已删除');
}

function deleteMomentComment(id, commentId) {
  const m = getMomentById(id);
  if (!m) return;
  const cm = m.comments.find(c => c.id === commentId);
  if (!cm) return;
  if (!isSelf(cm.authorId)) return;
  if (!confirm('确定删除这条评论吗？')) return;
  // 同时移除对该评论的回复
  m.comments = m.comments.filter(c => c.id !== commentId && c.replyTo !== commentId);
  saveData();
  renderMomentsFeed();
  showToast('评论已删除');
}

// 动态详情（全部评论 + 完整访客浏览记录）
function openMomentDetail(id) {
  const m = getMomentById(id);
  if (!m) return;
  const viewers = m.viewers;
  const body = `
    ${renderMomentCard(m, true)}
    <div class="panel-section-title">访客浏览记录（${viewers.length}）</div>
    ${viewers.length === 0 ? '<div class="empty-mini">暂无访客记录</div>' : viewers.map(v => `
      <div class="rp-record-row" style="margin:6px 0;">
        <span>${escapeHtml(v.name)}</span>
        <span style="font-size:11px;color:var(--text-tertiary);">${formatFullTime(v.time)}</span>
      </div>
    `).join('')}
  `;
  const footer = `<button class="btn btn-secondary" onclick="closeModal(currentModalId)">关闭</button>`;
  window.currentModalId = showModal('动态详情', body, footer, { wide: true });
}

// 转发分享到聊天会话
function shareMomentToChat(id) {
  const m = getMomentById(id);
  if (!m) return;
  const authorName = isSelf(m.authorId) ? getSelfName() :
    (appData.contacts.find(c => c.id === m.authorId)?.name || '未知');
  const targets = [
    ...appData.contacts.map(c => ({ key: 'contact_' + c.id, name: c.name, avatar: c.avatar, type: 'contact', id: c.id })),
    ...appData.groups.map(g => ({ key: 'group_' + g.id, name: g.name + '（群）', avatar: g.avatar, type: 'group', id: g.id }))
  ];
  const body = `
    <div class="setting-desc" style="margin-bottom:8px;">选择要转发到的会话：</div>
    <div class="conv-pick-list">
      ${targets.length === 0 ? '<div class="empty-mini">暂无可转发的会话</div>' : targets.map(t => `
        <div class="conv-pick-item" onclick="confirmShareMoment('${id}', '${t.type}', '${t.id}')">
          ${getAvatarHTML(t.avatar, t.name)}
          <span class="nm">${escapeHtml(t.name)}</span>
          <i class="fas fa-chevron-right" style="color:var(--text-tertiary);font-size:12px;"></i>
        </div>
      `).join('')}
    </div>
  `;
  const footer = `<button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>`;
  window.currentModalId = showModal('转发动态', body, footer);
}

function confirmShareMoment(momentId, chatType, chatId) {
  const m = getMomentById(momentId);
  if (!m) return;
  const authorName = isSelf(m.authorId) ? getSelfName() :
    (appData.contacts.find(c => c.id === m.authorId)?.name || '未知');
  closeModal(window.currentModalId);
  addMessageTo(chatType, chatId, {
    type: 'moments_share', momentId,
    sender: 'me',
    time: Date.now(),
    content: `[朋友圈] ${authorName}：${(m.text || '').slice(0, 40) || '[图片]'}`
  });
  showToast('已转发到会话');
}

// ---------- 图片长按保存 + 震动 ----------
let momentsImgPressTimer = null;
function momentImgTouchStart(img) {
  momentImgPressTimer = setTimeout(() => {
    if (navigator.vibrate) navigator.vibrate(50);
    saveMomentsImage(img);
  }, 600);
}
function momentImgTouchEnd() {
  if (momentsImgPressTimer) { clearTimeout(momentsImgPressTimer); momentsImgPressTimer = null; }
}

function saveMomentsImage(dataUrl) {
  try {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = '朋友圈图片_' + Date.now() + '.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('图片已保存至本地');
  } catch (e) {
    showToast('保存失败');
  }
}

// ---------- 小红点角标 ----------
function updateMomentsBadge() {
  const badge = document.getElementById('momentsBadge');
  if (!badge) return;
  const n = appData.momentsUnread || 0;
  badge.textContent = n > 99 ? '99+' : n;
  badge.style.display = n > 0 ? '' : 'none';
}
function bumpMomentsUnread(n) {
  appData.momentsUnread = (appData.momentsUnread || 0) + (n || 1);
  saveData();
  updateMomentsBadge();
}
function clearMomentsUnread() {
  if (appData.momentsUnread) {
    appData.momentsUnread = 0;
    saveData();
  }
  updateMomentsBadge();
}

// ---------- AI 朋友圈行为 ----------
// AI 定时发布 + 浏览我方动态
function scheduleAiMomentsTimer() {
  if (managedTimers.aiMoments) clearInterval(managedTimers.aiMoments);
  if (!appData.settings.autoMoments) return;
  const intervalMin = Math.max(1, appData.settings.autoMomentsInterval || 30);
  managedTimers.aiMoments = setInterval(aiMomentsTick, intervalMin * 60 * 1000);
}

function aiMomentsTick() {
  if (Math.random() < 0.5 && appData.contacts.length > 0) {
    aiPostMoment();
  } else {
    aiBrowseMyMoments();
  }
}

// AI 发布朋友圈（内容优先取其独立词库）
function aiPostMoment() {
  const c = appData.contacts[Math.floor(Math.random() * appData.contacts.length)];
  if (!c) return;
  const groups = getWordGroupsForKey('contact', c.id);
  const words = [];
  groups.forEach(g => pushGroupWords(g, words));

  let text;
  if (words.length > 0) {
    const cnt = randomInt(2, 4);
    const parts = [];
    for (let i = 0; i < cnt; i++) parts.push(randomPick(words));
    text = parts.join('，') + randomPick(['！', '。', '~', '～']);
  } else {
    text = randomPick(['今天天气真好', '又是元气满满的一天', '随便走走', '生活需要仪式感', '记录一下今天', '分享好心情', '晚安世界', '忙碌的一周终于结束了']);
  }

  appData.moments.unshift({
    id: 'mom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    authorId: c.id, authorName: c.name, authorAvatar: c.avatar,
    text, images: [], visibility: 'public', visibleIds: [],
    time: Date.now(), likes: [], comments: [], viewers: []
  });
  saveData();
  // AI 发动态 → 小红点
  bumpMomentsUnread(1);
  if (window.currentPage === 'moments') renderMomentsFeed();
}

// 我发布动态后，AI 延迟浏览
function scheduleAiBrowseDelay() {
  if (appData.contacts.length === 0) return;
  const delay = randomInt(4000, 15000);
  const t = setTimeout(() => { aiBrowseMyMoments(); managedTimers.aiBrowse = null; }, delay);
  managedTimers.aiBrowse = t;
}

// AI 浏览我的动态：写访客记录 + 随机点赞 + 词库评论
function aiBrowseMyMoments() {
  const myMoments = appData.moments.filter(m => isSelf(m.authorId));
  if (myMoments.length === 0 || appData.contacts.length === 0) return;
  const m = myMoments[Math.floor(Math.random() * myMoments.length)];
  const c = appData.contacts[Math.floor(Math.random() * appData.contacts.length)];
  if (!c || !m) return;

  // 访客记录（同一人不重复写）
  if (!m.viewers.some(v => v.id === c.id)) {
    m.viewers.push({ id: c.id, name: c.name, time: Date.now() });
  }

  let interacted = false;
  // 随机点赞（未点过时 65% 概率）
  if (!m.likes.includes(c.id) && Math.random() < 0.65) {
    m.likes.push(c.id);
    interacted = true;
  }
  // 评论：优先读联系人独立词条库，无独立读全局，再无词条则只点赞不输出文字
  const cs = peekConvSettings('contact', c.id);
  let wordSource = null;
  if (cs && cs.wordsIndependent && Array.isArray(cs.wordGroups) && cs.wordGroups.length > 0) {
    wordSource = cs.wordGroups;
  } else if (appData.wordGroups.length > 0) {
    wordSource = appData.wordGroups;
  }
  const words = [];
  (wordSource || []).forEach(g => pushGroupWords(g, words));

  if (words.length > 0 && Math.random() < 0.5) {
    const cnt = randomInt(1, 2);
    const parts = [];
    for (let i = 0; i < cnt; i++) parts.push(randomPick(words));
    m.comments.push({
      id: 'cmc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      authorId: c.id, text: parts.join('，'), replyTo: null, time: Date.now()
    });
    interacted = true;
  }

  saveData();
  if (interacted) {
    bumpMomentsUnread(1);
    // 朋友圈评论/点赞通知音效（受朋友圈独立免打扰控制）
    playNotifySound('moments', {});
  }
  if (window.currentPage === 'moments') renderMomentsFeed();
}

// AI 二次回复我的评论
function aiReplyToComment(momentId, myCommentId) {
  const m = getMomentById(momentId);
  if (!m) return;
  const myCm = m.comments.find(c => c.id === myCommentId);
  if (!myCm) return;
  // 找到我回复的那条AI评论的作者
  const targetId = myCm.replyTo ? (m.comments.find(c => c.id === myCm.replyTo)?.authorId) : null;
  const aiId = targetId || (appData.contacts.length > 0 ? appData.contacts[Math.floor(Math.random() * appData.contacts.length)].id : null);
  if (!aiId) return;
  const c = appData.contacts.find(x => x.id === aiId);
  if (!c) return;

  // 词库优先（独立 → 全局）
  const cs = peekConvSettings('contact', c.id);
  let wordSource = (cs && cs.wordsIndependent && Array.isArray(cs.wordGroups) && cs.wordGroups.length > 0) ? cs.wordGroups : appData.wordGroups;
  const words = [];
  (wordSource || []).forEach(g => pushGroupWords(g, words));
  if (words.length === 0) return; // 无词条只点赞不输出文字

  const cnt = randomInt(1, 2);
  const parts = [];
  for (let i = 0; i < cnt; i++) parts.push(randomPick(words));
  m.comments.push({
    id: 'cmc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    authorId: c.id, text: parts.join('，'), replyTo: myCommentId, time: Date.now()
  });
  saveData();
  bumpMomentsUnread(1);
  playNotifySound('moments', {});
  if (window.currentPage === 'moments') renderMomentsFeed();
}

// 分项导出：朋友圈动态
function exportMomentsData() {
  if (appData.moments.length === 0) { showToast('暂无朋友圈动态'); return; }
  downloadJSON(appData.moments, '朋友圈动态_' + new Date().toISOString().slice(0, 10) + '.json');
  showToast('已导出朋友圈动态');
}


// ==================== 统一定时器管理 ====================
const managedTimers = { rpExpire: null, aiMoments: null, aiBrowse: null, rpClaims: [], momentsReplys: [] };

// 托管一次性定时器：执行后自动从数组移除，避免句柄堆积
function trackManagedTimeout(key, fn, delay) {
  const arr = Array.isArray(managedTimers[key]) ? managedTimers[key] : (managedTimers[key] = []);
  // 数组上限保护：超过50个时清理最早的一半
  if (arr.length > 50) arr.splice(0, 25);
  const t = setTimeout(() => {
    const i = arr.indexOf(t);
    if (i > -1) arr.splice(i, 1);
    fn();
  }, delay);
  arr.push(t);
  return t;
}

function stopAllManagedTimers() {
  Object.keys(managedTimers).forEach(k => {
    const t = managedTimers[k];
    if (Array.isArray(t)) {
      t.forEach(x => { try { clearTimeout(x); } catch (e) {} });
      managedTimers[k] = [];
    } else if (t) {
      try { clearInterval(t); } catch (e) { try { clearTimeout(t); } catch (e2) {} }
      managedTimers[k] = null;
    }
  });
}

// 页面切后台：立刻停止全部音效
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAllSounds();
});

// 页面卸载：清除全部定时器 + 停止音效，避免内存泄漏
window.addEventListener('beforeunload', () => {
  stopAllManagedTimers();
  stopAllSounds();
  if (typeof stopTimedMsgTimer === 'function') stopTimedMsgTimer();
  if (typeof stopCallRing === 'function') stopCallRing();
});

// ==================== 消息撤回 / 转发 / 收藏 ====================
// 通过菜单目标索引取消息
function getMsgByMenuIndex() {
  if (msgMenuTargetIndex < 0 || !appData.currentChatId) return null;
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const records = appData.chatRecords[key] || [];
  const msg = records[msgMenuTargetIndex];
  return msg ? { key, records, msg } : null;
}

// 撤回时间校验：仅发送后2分钟内
function canRecallMsg(msg) {
  if (msg.sender !== 'me') return false;
  if (msg.recalled) return false;
  return (Date.now() - msg.time) <= 2 * 60 * 1000;
}

function recallMessageFromMenu() {
  hideMsgContextMenu();
  const ctx = getMsgByMenuIndex();
  if (!ctx) return;
  const { msg } = ctx;
  if (msg.sender !== 'me') { showToast('只能撤回自己发送的消息'); return; }
  if (Date.now() - msg.time > 2 * 60 * 1000) { showToast('发送超过2分钟，无法撤回'); return; }
  msg.recalled = true;
  saveData();
  renderChatMessages();
  showToast('消息已撤回');
}

// 收藏消息
// 渲染消息的表情回应
function renderMsgReactions(reactions, msgIdx) {
  // 合并相同表情
  const grouped = {};
  reactions.forEach(r => {
    if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, bySelf: false };
    grouped[r.emoji].count++;
    if (r.by === getSelfId()) grouped[r.emoji].bySelf = true;
  });
  
  return `<div class="msg-reactions">${
    Object.entries(grouped).map(([emoji, info]) =>
      `<span class="msg-reaction-chip" onclick="toggleReaction(${msgIdx}, '${emoji}')">${emoji}<span class="reaction-count">${info.count}</span></span>`
    ).join('')
  }</div>`;
}

// 切换表情回应（点击已有回应chip）
function toggleReaction(msgIdx, emoji) {
  addReactionToMsg(msgIdx, emoji);
}

// 复制消息文本到剪贴板
function copyTextFromMenu() {
  hideMsgContextMenu();
  const ctx = getMsgByMenuIndex();
  if (!ctx) return;
  const { msg } = ctx;
  if (msg.type !== 'text') { showToast('只能复制文本消息'); return; }
  
  const text = msg.content || '';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('已复制到剪贴板');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); showToast('已复制到剪贴板'); }
  catch { showToast('复制失败'); }
  document.body.removeChild(ta);
}

// 表情回应快捷面板
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

function addReactionFromMenu() {
  hideMsgContextMenu();
  const ctx = getMsgByMenuIndex();
  if (!ctx) return;
  
  const body = `
    <div class="reaction-picker-grid">
      ${QUICK_REACTIONS.map(emoji => `
        <button class="reaction-pick-btn" onclick="addReactionToMsg(${ctx.idx}, '${emoji}'); closeModal(window.currentModalId);">
          ${emoji}
        </button>
      `).join('')}
    </div>
  `;
  window.currentModalId = showModal('选择回应表情', body);
}

function addReactionToMsg(msgIdx, emoji) {
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const records = appData.chatRecords[key] || [];
  if (msgIdx < 0 || msgIdx >= records.length) return;
  
  const msg = records[msgIdx];
  if (!msg.reactions) msg.reactions = [];
  
  // 同一表情只保留一次，再次点击取消
  const exist = msg.reactions.findIndex(r => r.emoji === emoji && r.by === getSelfId());
  if (exist >= 0) {
    msg.reactions.splice(exist, 1);
    showToast('已取消回应');
  } else {
    msg.reactions.push({ emoji, by: getSelfId(), time: Date.now() });
    showToast('已回应');
  }
  
  saveData();
  renderChatMessages();
  
  // 对方有概率回应
  if (Math.random() < 0.4 && exist < 0) {
    setTimeout(() => {
      const targetType = appData.currentChatType;
      const targetId = appData.currentChatId;
      const exists = targetType === 'group'
        ? appData.groups.some(g => g.id === targetId)
        : appData.contacts.some(c => c.id === targetId);
      if (!exists) return;
      
      const senderInfo = getReplySender(targetType, targetId);
      const otherReactions = QUICK_REACTIONS.filter(e => e !== emoji);
      const replyEmoji = Math.random() < 0.5 ? emoji : otherReactions[Math.floor(Math.random() * otherReactions.length)];
      
      if (!msg.reactions) msg.reactions = [];
      msg.reactions.push({ emoji: replyEmoji, by: senderInfo.id, time: Date.now() });
      saveData();
      renderChatMessages();
    }, randomInt(2, 6) * 1000);
  }
}

function favoriteMessageFromMenu() {
  hideMsgContextMenu();
  const ctx = getMsgByMenuIndex();
  if (!ctx) return;
  const { msg } = ctx;
  if (msg.recalled) { showToast('该消息已撤回'); return; }
  const senderName = isSelf(msg.sender) ? getSelfName() :
    (appData.contacts.find(c => c.id === msg.sender)?.name || '');
  appData.favorites.unshift({
    id: 'fav_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    type: msg.type, content: msg.content, senderName,
    chatName: getCurrentConvName(), msgTime: msg.time, favTime: Date.now(),
    quote: msg.quote ? { sender: msg.quote.sender, content: msg.quote.content } : null
  });
  if (appData.favorites.length > 200) appData.favorites.length = 200;
  saveData();
  showToast('已加入收藏夹');
}

function unfavoriteMsg(favId) {
  if (!confirm('确定取消收藏该消息吗？')) return;
  appData.favorites = appData.favorites.filter(f => f.id !== favId);
  saveData();
  renderFavoritesPanel();
  showToast('已取消收藏');
}

// 单条转发
function forwardMessageFromMenu() {
  hideMsgContextMenu();
  const ctx = getMsgByMenuIndex();
  if (!ctx) return;
  if (ctx.msg.recalled) { showToast('该消息已撤回'); return; }
  openForwardModal([msgMenuTargetIndex]);
}

// 多选模式
let multiSelectMode = false;
let selectedMsgIdxs = new Set();

function startMultiSelectMode() {
  hideMsgContextMenu();
  if (!appData.currentChatId) { showToast('请先选择一个会话'); return; }
  multiSelectMode = true;
  selectedMsgIdxs = new Set();
  renderChatMessages();
}

function exitMultiSelectMode() {
  multiSelectMode = false;
  selectedMsgIdxs = new Set();
  renderChatMessages();
}

function toggleMsgSelect(idx) {
  if (selectedMsgIdxs.has(idx)) selectedMsgIdxs.delete(idx); else selectedMsgIdxs.add(idx);
  renderChatMessages();
}

// 多选删除
function confirmMultiDelete() {
  if (selectedMsgIdxs.size === 0) { showToast('请先选择要删除的消息'); return; }
  if (!confirm(`确定删除选中的 ${selectedMsgIdxs.size} 条消息吗？`)) return;
  
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const records = appData.chatRecords[key] || [];
  
  // 从大到小排序，避免索引偏移
  const idxs = [...selectedMsgIdxs].sort((a, b) => b - a);
  idxs.forEach(idx => {
    if (idx >= 0 && idx < records.length) {
      records.splice(idx, 1);
    }
  });
  
  saveData();
  exitMultiSelectMode();
  renderMessages();
  showToast(`已删除 ${idxs.length} 条消息`);
}

// 多选后转发
function confirmMultiForward() {
  if (selectedMsgIdxs.size === 0) { showToast('请先点选要转发的消息'); return; }
  openForwardModal([...selectedMsgIdxs]);
}

// 选择目标会话弹窗
function openForwardModal(msgIdxList) {
  const targets = [
    ...appData.contacts.map(c => ({ name: c.name, avatar: c.avatar, type: 'contact', id: c.id })),
    ...appData.groups.map(g => ({ name: g.name + '（群）', avatar: g.avatar, type: 'group', id: g.id }))
  ];
  const body = `
    <div class="setting-desc" style="margin-bottom:8px;">已选 ${msgIdxList.length} 条消息，转发到：</div>
    <div class="conv-pick-list">
      ${targets.length === 0 ? '<div class="empty-mini">暂无可转发的会话</div>' : targets.map(t => `
        <div class="conv-pick-item" onclick='doForwardMessages(${JSON.stringify(msgIdxList)}, "${t.type}", "${t.id}")'>
          ${getAvatarHTML(t.avatar, t.name)}
          <span class="nm">${escapeHtml(t.name)}</span>
          <i class="fas fa-share" style="color:var(--primary);font-size:12px;"></i>
        </div>
      `).join('')}
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId);exitMultiSelectMode()">取消</button>
  `;
  window.currentModalId = showModal('转发消息', body, footer);
}

function doForwardMessages(msgIdxList, targetType, targetId) {
  const srcKey = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const records = appData.chatRecords[srcKey] || [];
  const valid = msgIdxList.map(i => records[i]).filter(m => m && !m.recalled);
  if (valid.length === 0) { showToast('没有可转发的消息'); return; }
  closeModal(window.currentModalId);
  const sender = 'me';
  valid.forEach(m => {
    const copy = { ...m, sender, time: Date.now(), forwarded: true };
    delete copy.readStatus;
    addMessageTo(targetType, targetId, copy);
  });
  exitMultiSelectMode();
  showToast(`已转发 ${valid.length} 条消息`);
}

// 长按菜单：保存图片
function saveImageFromMenu() {
  hideMsgContextMenu();
  const ctx = getMsgByMenuIndex();
  if (!ctx || ctx.msg.type !== 'image' || !ctx.msg.content) return;
  if (navigator.vibrate) navigator.vibrate(50);
  saveMomentsImage(ctx.msg.content);
}

// ==================== 会话消息搜索 ====================
function toggleMsgSearch(show) {
  const bar = document.getElementById('msgSearchBar');
  const results = document.getElementById('msgSearchResults');
  if (!bar) return;
  bar.style.display = show ? 'flex' : 'none';
  if (!show) {
    results.style.display = 'none';
    results.innerHTML = '';
    document.getElementById('msgSearchInput').value = '';
  } else {
    document.getElementById('msgSearchInput').focus();
  }
}

function runMsgSearch() {
  const kw = document.getElementById('msgSearchInput')?.value?.trim().toLowerCase();
  const results = document.getElementById('msgSearchResults');
  if (!appData.currentChatId || !kw) { results.style.display = 'none'; results.innerHTML = ''; return; }
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const records = appData.chatRecords[key] || [];
  const hits = [];
  records.forEach((m, idx) => {
    if (m.recalled) return;
    if (m.type === 'text' && m.content && m.content.toLowerCase().includes(kw)) hits.push({ idx, m });
  });
  if (hits.length === 0) {
    results.innerHTML = '<div class="msr-item" style="color:var(--text-tertiary);">没有匹配的消息</div>';
    results.style.display = 'block';
    return;
  }
  results.innerHTML = hits.slice(0, 50).map(h => {
    const sender = isSelf(h.m.sender) ? getSelfName() :
      (appData.contacts.find(c => c.id === h.m.sender)?.name || '');
    const pos = h.m.content.toLowerCase().indexOf(kw);
    const snippet = h.m.content.substring(Math.max(0, pos - 12), Math.min(h.m.content.length, pos + kw.length + 20));
    const hl = snippet.replace(new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<b>$1</b>');
    return `
      <div class="msr-item" onclick="jumpToMsg(${h.idx})">
        <div class="t">${escapeHtml(sender)} · ${formatFullTime(h.m.time)}</div>
        <div class="c">...${escapeHtml(snippet).replace(new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<b>$1</b>')}...</div>
      </div>
    `;
  }).join('');
  results.style.display = 'block';
}

function jumpToMsg(idx) {
  const container = document.getElementById('chatMessages');
  const row = container.querySelector(`[data-msg-index="${idx}"]`);
  if (!row) { showToast('消息已不在当前视图'); return; }
  container.querySelectorAll('.msg-row.search-hit').forEach(r => r.classList.remove('search-hit'));
  row.scrollIntoView({ block: 'center', behavior: 'smooth' });
  row.classList.add('search-hit');
  setTimeout(() => row.classList.remove('search-hit'), 1800);
}

// ==================== 转账 ====================
function confirmTransfer() {
  const amount = validateAmount(document.getElementById('tfAmountInput')?.value);
  if (!amount) { showToast('请输入正确的金额（正数，两位小数）'); return; }
  if (getMyWallet() < amount) { showToast('我的钱包余额不足'); return; }
  const note = (document.getElementById('tfNoteInput')?.value || '').trim().slice(0, 20) || '转账';
  const chatType = appData.currentChatType;
  const chatId = appData.currentChatId;
  const peerName = getCurrentConvName();
  setMyWallet(getMyWallet() - amount);
  addWalletRecord('transfer_out', amount, peerName);
  closeModal(currentModalId);
  addMessageTo(chatType, chatId, {
    type: 'transfer', amount, note, transferStatus: 'pending',
    content: `[转账] ¥${fmtMoney(amount)}`,
    sender: getSelfId(), time: Date.now()
  });
  showToast('转账已发出');
  // 对方 2~6 秒后确认收款或拒收
  trackManagedTimeout('transferAccept', () => {
    if (Math.random() < PEER_REJECT_CHANCE) rejectTransfer(chatType, chatId);
    else acceptTransfer(chatType, chatId);
  }, randomInt(2000, 6000));
}

// 对方拒收概率（转账 / 私聊红包通用）
const PEER_REJECT_CHANCE = 0.2;

function acceptTransfer(chatType, chatId) {
  const key = (chatType === 'group' ? 'group_' : 'contact_') + chatId;
  const msgs = appData.chatRecords[key] || [];
  const msg = [...msgs].reverse().find(m => m.type === 'transfer' && m.transferStatus === 'pending' && isSelf(m.sender));
  if (!msg) return;
  msg.transferStatus = 'received';
  msg.content = `[转账] ¥${fmtMoney(msg.amount)}（已收款）`;
  addContactWallet(chatId, msg.amount);
  addWalletRecord('transfer_in', msg.amount, getSelfName());
  saveData();
  // 对方侧"已收款"回执聊天记录
  addMessageTo(chatType, chatId, {
    type: 'transfer', amount: msg.amount, note: msg.note, transferStatus: 'received',
    content: `[转账] ¥${fmtMoney(msg.amount)}（已收款）`,
    sender: chatId, time: Date.now()
  });
  renderChatMessages();
  renderConversations();
  const c = appData.contacts.find(x => x.id === chatId);
  showToast(`${c ? c.name : '对方'} 已收款 ¥${fmtMoney(msg.amount)}`);
  playSoundBuffer('msg_private', { volume: 0.5 });
}

// 对方拒收转账：退回我的钱包 + 对方侧"已退还"回执
function rejectTransfer(chatType, chatId) {
  const key = (chatType === 'group' ? 'group_' : 'contact_') + chatId;
  const msgs = appData.chatRecords[key] || [];
  const msg = [...msgs].reverse().find(m => m.type === 'transfer' && m.transferStatus === 'pending' && isSelf(m.sender));
  if (!msg) return;
  msg.transferStatus = 'rejected';
  msg.content = `[转账] ¥${fmtMoney(msg.amount)}（已退还）`;
  setMyWallet(getMyWallet() + msg.amount);
  const c = appData.contacts.find(x => x.id === chatId);
  addWalletRecord('refund', msg.amount, c ? c.name : '');
  saveData();
  addMessageTo(chatType, chatId, {
    type: 'transfer', amount: msg.amount, note: msg.note, transferStatus: 'rejected',
    content: `[转账] ¥${fmtMoney(msg.amount)}（已退还）`,
    sender: chatId, time: Date.now()
  });
  renderChatMessages();
  renderConversations();
  showToast(`${c ? c.name : '对方'} 拒收了转账，金额已退回`);
  playSoundBuffer('msg_private', { volume: 0.5 });
}

function renderTransferBubble(msg) {
  const received = msg.transferStatus === 'received';
  const rejected = msg.transferStatus === 'rejected';
  return `<div class="bubble transfer-bubble ${received ? 'received' : ''} ${rejected ? 'rejected' : ''}">
    <div class="tf-row">
      <div class="tf-icon"><i class="fas fa-exchange-alt"></i></div>
      <div style="min-width:0;">
        <div class="tf-amount">¥${fmtMoney(msg.amount)}</div>
        <div class="tf-note">${escapeHtml(msg.note || '转账')}</div>
      </div>
    </div>
    <div class="tf-status">${received ? '已收款' : (rejected ? '已退还' : '待收款')}</div>
  </div>`;
}

// 朋友圈转发卡片气泡
function renderMomentsShareBubble(msg) {
  const m = getMomentById(msg.momentId);
  const authorName = m ? (isSelf(m.authorId) ? getSelfName() :
    (appData.contacts.find(c => c.id === m.authorId)?.name || '')) : '';
  const text = m ? (m.text || '[图片动态]') : (msg.content || '[朋友圈动态]');
  const imgs = m && m.images.length > 0 ? `<img src="${m.images[0]}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-top:6px;">` : '';
  return `
    <div class="bubble" style="padding:10px;min-width:180px;cursor:pointer;" onclick="switchPage('moments')">
      <div style="font-size:11px;color:var(--text-tertiary);"><i class="fas fa-camera"></i> 朋友圈 · ${escapeHtml(authorName)}</div>
      <div style="font-size:13px;margin-top:4px;line-height:1.5;">${escapeHtml(text.slice(0, 60))}</div>
      ${imgs}
    </div>
  `;
}

// ==================== 会话输入草稿 ====================
let draftSaveTimer = null;

function saveCurrentDraft() {
  if (!appData.currentChatId) return;
  const input = document.getElementById('messageInput');
  if (!input) return;
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const val = input.value;
  if (val) {
    appData.chatDrafts[key] = val;
  } else {
    delete appData.chatDrafts[key];
  }
  // 防抖持久化（避免每敲一个字全量写localStorage）
  if (draftSaveTimer) clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(() => saveData(), 600);
}

function restoreCurrentDraft() {
  if (!appData.currentChatId) return;
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  const input = document.getElementById('messageInput');
  if (input) {
    input.value = appData.chatDrafts[key] || '';
    autoResizeTextarea();
  }
}

function clearCurrentDraft() {
  if (!appData.currentChatId) return;
  const key = (appData.currentChatType === 'group' ? 'group_' : 'contact_') + appData.currentChatId;
  delete appData.chatDrafts[key];
  saveData();
}

// ==================== 记事本 & 待办 ====================
let notesTab = 'notes';

function renderNotesPanel() {
  const body = document.getElementById('notesPanelBody');
  if (!body) return;
  body.innerHTML = `
    <div class="note-tabs">
      <div class="note-tab ${notesTab === 'notes' ? 'active' : ''}" onclick="switchNotesTab('notes')"><i class="fas fa-pen-nib"></i> 记事本</div>
      <div class="note-tab ${notesTab === 'todos' ? 'active' : ''}" onclick="switchNotesTab('todos')"><i class="fas fa-list-check"></i> 待办</div>
    </div>
    ${notesTab === 'notes' ? renderNotesList() : renderTodosList()}
  `;
}

function switchNotesTab(t) { notesTab = t; renderNotesPanel(); }

function renderNotesList() {
  return `
    <div style="padding:10px 12px 0;">
      <button class="btn btn-primary" style="width:100%;" onclick="openNoteEditModal()"><i class="fas fa-plus"></i> 新建笔记</button>
    </div>
    ${appData.notes.length === 0 ? '<div class="empty-mini">还没有笔记</div>' : appData.notes.map(n => `
      <div class="note-item">
        <div class="note-item-title">
          <span>${escapeHtml(n.title || '无标题')}</span>
          <span class="note-ops">
            <span onclick="openNoteEditModal('${n.id}')"><i class="fas fa-edit"></i> 编辑</span>
            <span onclick="deleteNote('${n.id}')" style="color:var(--danger);"><i class="fas fa-trash"></i> 删除</span>
          </span>
        </div>
        ${n.content ? `<div class="note-item-content">${escapeHtml(n.content)}</div>` : ''}
        <div class="note-item-time">创建于 ${formatFullTime(n.createdAt)}</div>
      </div>
    `).join('')}
  `;
}

function renderTodosList() {
  const undone = appData.todos.filter(t => !t.done);
  const done = appData.todos.filter(t => t.done);
  const renderTodo = t => `
    <div class="todo-item ${t.done ? 'done' : ''}">
      <div class="todo-check" onclick="toggleTodo('${t.id}')"><i class="fas fa-check"></i></div>
      <div class="todo-text">${escapeHtml(t.text)}</div>
      <span style="color:var(--text-tertiary);font-size:11px;cursor:pointer;" onclick="deleteTodo('${t.id}')"><i class="fas fa-trash"></i></span>
    </div>
  `;
  return `
    <div style="padding:10px 12px 0;display:flex;gap:8px;">
      <input type="text" class="input" id="newTodoInput" placeholder="输入新的待办事项..." style="flex:1;" onkeydown="if(event.key==='Enter')addTodoFromPanel()">
      <button class="btn btn-primary" onclick="addTodoFromPanel()"><i class="fas fa-plus"></i></button>
    </div>
    ${appData.todos.length === 0 ? '<div class="empty-mini">暂无待办事项</div>' : `
      ${undone.length > 0 ? '<div class="panel-section-title">未完成（' + undone.length + '）</div>' + undone.map(renderTodo).join('') : ''}
      ${done.length > 0 ? '<div class="panel-section-title">已完成（' + done.length + '）</div>' + done.map(renderTodo).join('') : ''}
    `}
  `;
}

function openNoteEditModal(noteId) {
  const n = noteId ? appData.notes.find(x => x.id === noteId) : null;
  const body = `
    <div class="form-group">
      <label>标题</label>
      <input type="text" class="input" id="noteTitleInput" placeholder="笔记标题" maxlength="50" value="${n ? escapeHtml(n.title) : ''}">
    </div>
    <div class="form-group">
      <label>正文</label>
      <textarea class="textarea" id="noteContentInput" rows="5" placeholder="记录内容...">${n ? escapeHtml(n.content) : ''}</textarea>
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal(currentModalId)">取消</button>
    <button class="btn btn-primary" onclick="saveNoteEdit(${noteId ? `'${noteId}'` : 'null'})">保存</button>
  `;
  window.currentModalId = showModal(n ? '编辑笔记' : '新建笔记', body, footer);
}

function saveNoteEdit(noteId) {
  const title = document.getElementById('noteTitleInput').value.trim();
  const contentV = document.getElementById('noteContentInput').value.trim();
  if (!title && !contentV) { showToast('请输入标题或内容'); return; }
  if (noteId) {
    const n = appData.notes.find(x => x.id === noteId);
    if (n) { n.title = title; n.content = contentV; }
  } else {
    appData.notes.unshift({ id: 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), title, content: contentV, createdAt: Date.now() });
  }
  saveData();
  closeModal(window.currentModalId);
  renderNotesPanel();
  showToast('笔记已保存');
}

function deleteNote(noteId) {
  if (!confirm('确定删除这条笔记吗？')) return;
  appData.notes = appData.notes.filter(n => n.id !== noteId);
  saveData();
  renderNotesPanel();
  showToast('笔记已删除');
}

function addTodoFromPanel() {
  const input = document.getElementById('newTodoInput');
  const text = input ? input.value.trim() : '';
  if (!text) { showToast('请输入待办内容'); return; }
  appData.todos.unshift({ id: 'todo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), text, done: false, createdAt: Date.now() });
  saveData();
  renderNotesPanel();
  showToast('待办已添加');
}

function toggleTodo(todoId) {
  const t = appData.todos.find(x => x.id === todoId);
  if (!t) return;
  t.done = !t.done;
  saveData();
  renderNotesPanel();
}

function deleteTodo(todoId) {
  if (!confirm('确定删除该待办吗？')) return;
  appData.todos = appData.todos.filter(t => t.id !== todoId);
  saveData();
  renderNotesPanel();
}

// ==================== 收藏夹面板 ====================
function renderFavoritesPanel() {
  const body = document.getElementById('favoritesPanelBody');
  if (!body) return;
  if (appData.favorites.length === 0) {
    body.innerHTML = '<div class="empty-mini" style="padding:24px;">还没有收藏消息<br>长按消息 → 收藏 即可加入收藏夹</div>';
    return;
  }
  body.innerHTML = appData.favorites.map(f => `
    <div class="fav-item">
      <div class="fav-item-head">
        <span class="src"><i class="fas fa-comment"></i> ${escapeHtml(f.chatName || '')} · ${escapeHtml(f.senderName || '')}</span>
        <span>${formatFullTime(f.msgTime)}</span>
        <span class="fav-unfav" onclick="unfavoriteMsg('${f.id}')">取消收藏</span>
      </div>
      <div class="fav-item-content">
        ${f.type === 'image' ? `<img src="${f.content}" onclick="openImagePreview('${f.content}')">` :
          (f.type === 'file' ? `<i class="fas fa-file"></i> ${escapeHtml(f.content || '')}` :
           (f.type === 'redpacket' ? '<i class="fas fa-gift" style="color:#e8433f;"></i> [红包] ' + escapeHtml(f.content || '') :
            escapeHtml(f.content || '')))}
      </div>
    </div>
  `).join('');
}

// ==================== 铃声与音效面板 ====================
function refreshSoundPanel() {
  const body = document.getElementById('soundPanelBody');
  if (!body) return;
  const s = appData.settings;
  body.innerHTML = `
    <div class="setting-item">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">音效总开关</div>
        <div class="setting-desc">关闭后全部静音</div>
      </div>
      <div class="toggle ${s.soundEnabled ? 'active' : ''}" onclick="toggleSoundMaster()"></div>
    </div>
    <div class="setting-item" style="flex-direction:column;align-items:stretch;">
      <div class="setting-content" style="padding-left:60px;padding-bottom:4px;">
        <div class="setting-label">音量调节</div>
        <div class="setting-desc" id="soundVolumeDesc">${s.soundVolume}%</div>
      </div>
      <input type="range" class="vol-slider" min="0" max="100" value="${s.soundVolume}" oninput="setSoundVolume(this.value)">
    </div>
    ${soundCategories.map(cat => `
      <div class="sound-card">
        <div class="sound-card-head">
          <div class="sound-card-title"><i class="fas fa-bell" style="color:var(--primary);"></i> ${cat.label}</div>
          <button class="sound-mini-btn play" onclick="previewSoundFromPanel('${s[cat.setting]}')"><i class="fas fa-play"></i> 预览</button>
          <button class="sound-mini-btn" onclick="stopPreviewSound()"><i class="fas fa-stop"></i> 停止</button>
        </div>
        <div class="sound-select-row">
          <select onchange="setCategoryRingtone('${cat.setting}', this.value)">
            ${getRingtoneOptionsHtml(s[cat.setting])}
          </select>
        </div>
      </div>
    `).join('')}
    <div class="setting-item">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">朋友圈通知免打扰</div>
        <div class="setting-desc">开启后朋友圈评论/点赞不播提示音（红包、问卷不受限）</div>
      </div>
      <div class="toggle ${s.momentsNotifyDnd ? 'active' : ''}" onclick="toggleMomentsNotifyDnd()"></div>
    </div>
    <div class="panel-section-title">朋友圈自动发布</div>
    <div class="setting-item">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">AI定时自动发朋友圈</div>
        <div class="setting-desc">随机联系人按词库自动发布动态</div>
      </div>
      <div class="toggle ${s.autoMoments ? 'active' : ''}" onclick="toggleAutoMoments()"></div>
    </div>
    ${s.autoMoments ? `
    <div class="setting-item">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">发布间隔（分钟）</div>
        <div class="setting-desc">每隔多久可能触发一次</div>
      </div>
      <input type="number" class="input" style="width:70px;text-align:center;" min="1" max="240" value="${s.autoMomentsInterval}" onchange="setAutoMomentsInterval(this.value)">
    </div>` : ''}
    <div class="panel-section-title">发送音效</div>
    <div class="setting-item">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">发送消息音效</div>
        <div class="setting-desc">发送消息时播放音效</div>
      </div>
      <div class="toggle ${s.sendSoundEnabled ? 'active' : ''}" onclick="toggleSendSound()"></div>
    </div>
    ${s.sendSoundEnabled ? `
    <div class="sound-card">
      <div class="sound-card-head">
        <div class="sound-card-title"><i class="fas fa-paper-plane" style="color:var(--primary);"></i> 音效选择</div>
        <button class="sound-mini-btn play" onclick="previewSoundFromPanel('${s.sendSoundId}')"><i class="fas fa-play"></i> 预览</button>
        <button class="sound-mini-btn" onclick="stopPreviewSound()"><i class="fas fa-stop"></i> 停止</button>
      </div>
      <div class="sound-select-row">
        <select onchange="setSendSoundId(this.value)">
          ${getRingtoneOptionsHtml(s.sendSoundId)}
        </select>
      </div>
    </div>
    <div class="setting-item">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">随机播放</div>
        <div class="setting-desc">每次发送从音效池中随机播放一个</div>
      </div>
      <div class="toggle ${s.sendSoundRandom ? 'active' : ''}" onclick="toggleSendSoundRandom()"></div>
    </div>
    ${s.sendSoundRandom ? `
    <div style="padding:0 14px 8px;">
      <div class="setting-desc" style="font-size:11px;margin-bottom:4px;">音效池（勾选参与随机的音效）</div>
      ${getSendSoundPoolOptions().map(o => `
        <label style="display:flex;align-items:center;gap:8px;padding:5px 2px;font-size:13px;color:var(--text-primary);cursor:pointer;">
          <input type="checkbox" style="accent-color:var(--primary);" ${s.sendSoundPool.includes(o.id) ? 'checked' : ''} onchange="toggleSendSoundPool('${o.id}')"> ${escapeHtml(o.name)}
        </label>
      `).join('')}
    </div>` : ''}` : ''}
    <div class="panel-section-title">自定义铃声（mp3 / wav）</div>
    <div style="padding:0 12px 8px;">
      <button class="btn btn-secondary" style="width:100%;" onclick="document.getElementById('ringtoneUpload').click()"><i class="fas fa-upload"></i> 上传自定义铃声</button>
      <input type="file" id="ringtoneUpload" accept=".mp3,.wav,audio/*" style="display:none;" onchange="handleRingtoneUpload(event)">
    </div>
    ${appData.customRingtones.length === 0 ? '<div class="empty-mini">暂无自定义铃声</div>' : appData.customRingtones.map(r => `
      <div class="custom-ring-row">
        <i class="fas fa-music" style="color:var(--primary);"></i>
        <span class="nm">${escapeHtml(r.name)}</span>
        <button class="sound-mini-btn play" onclick="previewSoundFromPanel('${r.id}')"><i class="fas fa-play"></i></button>
        <button class="sound-mini-btn" style="color:var(--danger);border-color:var(--danger);" onclick="deleteCustomRingtone('${r.id}')"><i class="fas fa-trash"></i></button>
      </div>
    `).join('')}
    <div class="setting-desc" style="padding:4px 14px 10px;font-size:11px;">免打扰优先级：音效总开关 &gt; 全局免打扰时段 &gt; 会话独立免打扰 &gt; 朋友圈通知免打扰；红包/问卷音效不受朋友圈免打扰限制</div>
  `;
}

// ==================== 发送音效 ====================
function playSendSound() {
  const s = appData.settings;
  if (!s.soundEnabled || s.sendSoundEnabled === false) return;
  let id = s.sendSoundId || 'send_pop';
  if (s.sendSoundRandom && Array.isArray(s.sendSoundPool) && s.sendSoundPool.length > 0) {
    id = randomPick(s.sendSoundPool);
  }
  playSoundBuffer(id);
}

function toggleSendSound() {
  appData.settings.sendSoundEnabled = !appData.settings.sendSoundEnabled;
  saveData();
  refreshSoundPanel();
  showToast(appData.settings.sendSoundEnabled ? '发送音效已开启' : '发送音效已关闭');
}

function setSendSoundId(v) {
  appData.settings.sendSoundId = v;
  saveData();
  refreshSoundPanel();
}

function toggleSendSoundRandom() {
  appData.settings.sendSoundRandom = !appData.settings.sendSoundRandom;
  saveData();
  refreshSoundPanel();
}

function getSendSoundPoolOptions() {
  const opts = Object.keys(builtinSoundDefs).map(id => ({ id, name: builtinSoundDefs[id].name }));
  appData.customRingtones.forEach(r => opts.push({ id: r.id, name: r.name + '（自定义）' }));
  return opts;
}

function toggleSendSoundPool(id) {
  const pool = appData.settings.sendSoundPool;
  const i = pool.indexOf(id);
  if (i >= 0) {
    if (pool.length <= 1) {
      showToast('音效池至少保留一个');
      refreshSoundPanel();
      return;
    }
    pool.splice(i, 1);
  } else {
    pool.push(id);
  }
  saveData();
  refreshSoundPanel();
}

function toggleSoundMaster() {
  appData.settings.soundEnabled = !appData.settings.soundEnabled;
  if (!appData.settings.soundEnabled) stopAllSounds();
  saveData();
  refreshSoundPanel();
  showToast(appData.settings.soundEnabled ? '音效已开启' : '音效已全部静音');
}

function setSoundVolume(v) {
  appData.settings.soundVolume = Math.max(0, Math.min(100, parseInt(v) || 0));
  const desc = document.getElementById('soundVolumeDesc');
  if (desc) desc.textContent = appData.settings.soundVolume + '%';
  saveData();
}

function setCategoryRingtone(setting, value) {
  appData.settings[setting] = value;
  saveData();
  showToast('铃声已更新');
}

function toggleMomentsNotifyDnd() {
  appData.settings.momentsNotifyDnd = !appData.settings.momentsNotifyDnd;
  saveData();
  refreshSoundPanel();
}

function toggleAutoMoments() {
  appData.settings.autoMoments = !appData.settings.autoMoments;
  saveData();
  refreshSoundPanel();
  scheduleAiMomentsTimer();
}

function setAutoMomentsInterval(v) {
  const n = parseInt(v);
  if (!n || n < 1) { showToast('请输入有效间隔'); refreshSoundPanel(); return; }
  appData.settings.autoMomentsInterval = Math.min(240, n);
  saveData();
  scheduleAiMomentsTimer();
  showToast('间隔已更新');
}

function previewSoundFromPanel(soundId) {
  playPreviewSound(soundId);
}

function handleRingtoneUpload(event) {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  if (!/\.(mp3|wav)$/i.test(file.name) && !file.type.startsWith('audio/')) { showToast('仅支持 mp3 / wav 音频'); return; }
  if (file.size > 2 * 1024 * 1024) { showToast('音频不能超过2MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const id = 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    appData.customRingtones.push({ id, name: file.name, data: e.target.result });
    saveData();
    refreshSoundPanel();
    showToast('自定义铃声已上传，可在各铃声下拉中选择');
  };
  reader.readAsDataURL(file);
}

function deleteCustomRingtone(id) {
  if (!confirm('确定删除该自定义铃声吗？')) return;
  appData.customRingtones = appData.customRingtones.filter(r => r.id !== id);
  delete soundBufferCache[id];
  // 清理引用了该铃声的配置，回退默认
  ['ringtoneCall', 'ringtoneMsg', 'ringtoneGroup', 'ringtoneSystem'].forEach(k => {
    if (appData.settings[k] === id) appData.settings[k] = { ringtoneCall: 'call_classic', ringtoneMsg: 'msg_default', ringtoneGroup: 'grp_default', ringtoneSystem: 'sys_default' }[k];
  });
  appData.contacts.forEach(c => { if (c.ringtoneCall === id) c.ringtoneCall = ''; if (c.ringtoneMsg === id) c.ringtoneMsg = ''; });
  appData.groups.forEach(g => { if (g.groupRingtone === id) g.groupRingtone = ''; });
  saveData();
  refreshSoundPanel();
  showToast('已删除');
}

// ==================== 高级工具面板 ====================
function renderAdvToolsPanel() {
  const body = document.getElementById('advToolsPanelBody');
  if (!body) return;
  body.innerHTML = `
    <div class="setting-item" onclick="resetThemeStyleOnly()">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">一键重置主题样式配置</div>
        <div class="setting-desc">仅重置主题/气泡/字体等样式参数，保留全部业务数据</div>
      </div>
      <i class="fas fa-palette" style="color:var(--text-tertiary);"></i>
    </div>
    <div class="panel-section-title">分项导出</div>
    <div class="setting-item" onclick="exportWordLibraryOnly()">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">导出词条库</div>
        <div class="setting-desc">导出全局词库JSON</div>
      </div>
      <i class="fas fa-download" style="color:var(--text-tertiary);"></i>
    </div>
    <div class="setting-item" onclick="exportMomentsData()">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">导出朋友圈动态</div>
        <div class="setting-desc">含点赞/评论/访客记录</div>
      </div>
      <i class="fas fa-download" style="color:var(--text-tertiary);"></i>
    </div>
    <div class="setting-item" onclick="exportRedPacketRecords()">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label">导出红包流水</div>
        <div class="setting-desc">红包收支记录JSON</div>
      </div>
      <i class="fas fa-download" style="color:var(--text-tertiary);"></i>
    </div>
    <div class="panel-section-title">配置重置</div>
    <div class="setting-item" onclick="resetSettingsOnly()">
      <div class="setting-content" style="padding-left:60px;">
        <div class="setting-label" style="color:var(--warning, #e6a23c);">仅重置设置配置</div>
        <div class="setting-desc">恢复默认设置，保留联系人/聊天/朋友圈/红包/笔记等数据</div>
      </div>
      <i class="fas fa-rotate-left" style="color:var(--text-tertiary);"></i>
    </div>
    <div class="setting-desc" style="padding:4px 14px 10px;font-size:11px;">「清空全部数据」在下方数据备份面板中，两者相互独立</div>
  `;
}

// 仅重置主题样式（保留业务数据）
function resetThemeStyleOnly() {
  if (!confirm('确定重置主题样式配置吗？（主题色/深色模式/气泡样式/字体大小/背景等将恢复默认，业务数据不受影响）')) return;
  const keep = {
    themeColor: 'blue', darkMode: false, autoTheme: false,
    bubbleStyle: 'standard', msgFontSize: 15, bubbleSizeLevel: 1, avatarSize: 42,
    chatBgImage: '', chatBgPreset: 'none', chatBgOpacity: 20, chatBgBlur: 0, chatBgMode: 'cover',
    callBgImage: '', callBgPreset: 'none', callBgOverlay: 45
  };
  Object.assign(appData.settings, keep);
  saveData();
  applyTheme();
  applyChatBg();
  applyCallBg();
  showToast('主题样式已重置');
}

// 仅重置设置配置（保留业务数据）
function resetSettingsOnly() {
  if (!confirm('确定将全部设置恢复默认吗？联系人、聊天记录、朋友圈、红包、笔记等数据会完整保留。')) return;
  const businessKeys = ['contacts', 'groups', 'chatRecords', 'convSettings', 'letters', 'moments', 'momentsDraft',
    'redPackets', 'redPacketRecords', 'walletBalance', 'customRingtones', 'notes', 'todos', 'favorites',
    'chatDrafts', 'myEmojis', 'otherEmojis', 'wordGroups', 'statusWords', 'surveyTemplates', 'surveyLibrary', 'mySurveyLibrary',
    'myProfile', 'unreadMap', 'pinnedConversations'];
  const backup = {};
  businessKeys.forEach(k => { backup[k] = appData[k]; });
  localStorage.removeItem(STORAGE_KEY);
  appData = JSON.parse(JSON.stringify(defaultAppData || appData));
  businessKeys.forEach(k => { if (backup[k] !== undefined) appData[k] = backup[k]; });
  saveData();
  showToast('设置已重置，业务数据已保留');
  setTimeout(() => location.reload(), 800);
}

// 词库单独导出
function exportWordLibraryOnly() {
  const data = { wordGroups: appData.wordGroups, convSettings: appData.convSettings };
  downloadJSON(data, '词条库_' + new Date().toISOString().slice(0, 10) + '.json');
  showToast('已导出词条库');
}

// 汇总渲染所有新面板
function renderAllNewPanels() {
  refreshWalletPanel();
  refreshSoundPanel();
  renderNotesPanel();
  renderFavoritesPanel();
  renderAdvToolsPanel();
}


// ==================== 联系人/群 铃声与免打扰设置 ====================
function setContactRingtone(contactId, field, value) {
  const c = appData.contacts.find(x => x.id === contactId);
  if (!c) return;
  c[field] = value;
  saveData();
  showToast(value ? '专属铃声已设置' : '已恢复跟随全局');
}

function toggleContactMsgDnd(contactId) {
  const c = appData.contacts.find(x => x.id === contactId);
  if (!c) return;
  c.msgDnd = !c.msgDnd;
  saveData();
  showToast(c.msgDnd ? '已开启该联系人私聊免打扰' : '已关闭私聊免打扰');
  // 刷新可能打开的资料弹窗状态
  const modal = document.querySelector('#modalContainer .modal');
  if (modal) {
    const toggles = modal.querySelectorAll('.toggle');
    toggles.forEach(t => { if (t.getAttribute('onclick')?.includes(contactId)) t.classList.toggle('active', c.msgDnd); });
  }
}

function setGroupRingtone(groupId, value) {
  const g = appData.groups.find(x => x.id === groupId);
  if (!g) return;
  g.groupRingtone = value;
  saveData();
  showToast(value ? '群专属提示音已设置' : '已恢复跟随全局');
}

function toggleGroupDnd(groupId) {
  const g = appData.groups.find(x => x.id === groupId);
  if (!g) return;
  g.groupDnd = !g.groupDnd;
  saveData();
  showToast(g.groupDnd ? '已开启群会话免打扰（红包领取音效不受限）' : '已关闭群会话免打扰');
  const modal = document.querySelector('#modalContainer .modal');
  if (modal) {
    const toggles = modal.querySelectorAll('.toggle');
    toggles.forEach(t => { if (t.getAttribute('onclick')?.includes(groupId)) t.classList.toggle('active', g.groupDnd); });
  }
}

// 打开设置页指定折叠面板
function openPanelById(panelId) {
  setTimeout(() => {
    const panel = document.getElementById(panelId);
    if (panel) {
      document.querySelectorAll('.collapsible').forEach(c => c.classList.remove('open'));
      panel.classList.add('open');
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (panelId === 'notesCollapsible') renderNotesPanel();
    if (panelId === 'favoritesCollapsible') renderFavoritesPanel();
  }, 150);
}

// 同步朋友圈过滤按钮文字（供资料页快捷入口调用）
function syncMomentsFilterBtn() {
  const btn = document.getElementById('momentsFilterBtn');
  if (!btn) return;
  if (momentsFilter === null) btn.innerHTML = '<i class="fas fa-filter"></i> 全部';
  else if (momentsFilter === 'mine') btn.innerHTML = '<i class="fas fa-user"></i> 我的';
  else {
    const c = appData.contacts.find(x => x.id === momentsFilter);
    btn.innerHTML = `<i class="fas fa-user"></i> ${escapeHtml(c ? c.name : 'TA')}`;
  }
}

// ==================== 新工具栏按钮绑定 ====================
(function initNewToolbar() {
  // 红包 / 转账 合并入口
  const rpBtn = document.getElementById('redpacketBtn');
  if (rpBtn) rpBtn.addEventListener('click', () => openMoneyModal('rp'));
  // 会话搜索
  const searchBtn = document.getElementById('chatSearchBtn');
  if (searchBtn) searchBtn.addEventListener('click', () => {
    const bar = document.getElementById('msgSearchBar');
    toggleMsgSearch(bar.style.display === 'none');
  });
  const searchInput = document.getElementById('msgSearchInput');
  if (searchInput) searchInput.addEventListener('input', runMsgSearch);
  // 输入草稿实时保存
  const msgInput = document.getElementById('messageInput');
  if (msgInput) msgInput.addEventListener('input', saveCurrentDraft);
})();

// 自定义字体：注入 @import 与 font-family 覆盖（作用于全局与气泡）
function applyCustomFont() {
  const s = appData.settings;
  let st = document.getElementById('customFontStyle');
  if (!st) {
    st = document.createElement('style');
    st.id = 'customFontStyle';
    document.head.appendChild(st);
  }
  let css = '';
  if (s.customFontUrl) css += `@import url("${s.customFontUrl}");\n`;
  if (s.customFontFamily) {
    css += `body, .bubble, .msg-content, .word-text, input, textarea, button, select { font-family: ${s.customFontFamily} !important; }\n`;
  }
  st.textContent = css;
}

// ==================== 应用初始化 ====================
function init() {
  loadData();
  initTheme();
  applyCustomFont();
  initToggles();
  initSampleData();
  
  // 应用通话背景图
  applyCallBg();
  
  // 渲染初始页面
  renderConversations();
  renderContacts();
  renderLetters();
  updateMyAvatarPreview();
  document.getElementById('myNicknameText').textContent = appData.myProfile.nickname;
  updateDNDText();
  
  // 渲染设置页内容
  renderWordCategories();
  renderWordList();
  renderEmojiLists();
  
  // 初始化新增模块
  refreshConvSettingsUI();
  loadSurveyTemplate();
  const timedIntervalEl = document.getElementById('timedMsgInterval');
  if (timedIntervalEl && !timedIntervalEl.value) timedIntervalEl.value = appData.settings.timedMsgInterval;
  // 恢复对方主动发问卷计时器（时机完全随机）
  restartSurveyAutoTimer();
  
  // 启动自动来电
  if (appData.settings.autoCall) {
    scheduleAutoCall();
  }
  
  // 后台保活
  keepAlive();
  
  // ===== 新模块初始化 =====
  startRedPacketExpireTimer();          // 红包过期定时退回
  scheduleAiMomentsTimer();             // AI定时发朋友圈
  updateMomentsBadge();                 // 朋友圈小红点
  renderAllNewPanels();                 // 设置页新面板
  applyMomentsBg();                     // 朋友圈背景
  window.currentPage = currentPage;
  
  // 检查未回复的信件
  appData.letters.forEach(letter => {
    if (!letter.replied) {
      scheduleLetterReply(letter.id);
    }
  });
  
  // 开场动画结束后移除遮罩
  setTimeout(() => {
    const sp = document.getElementById('splashOverlay');
    if (sp) sp.remove();
  }, 2900);

  console.log('Vislta 已初始化');
}

// 启动
init();

// 开关迁移：有权限但开关是关的，自动打开一次
if (!appData.settings.ntfMigrated) {
  try {
    if (('Notification' in window) && Notification.permission === 'granted') appData.settings.desktopNotify = true;
  } catch (e) {}
  appData.settings.ntfMigrated = true;
  saveData();
}

if ('serviceWorker' in navigator) { window.addEventListener('load', function () { registerNotificationWorker(); }); }

// 通知状态矫正：开了却没权限就回弹，开了有权限就重新注册
setTimeout(function () {
  try {
    const dn = document.getElementById('desktopNotifyToggle');
    if (!('Notification' in window)) return;
    if (appData.settings.desktopNotify && Notification.permission !== 'granted') {
      appData.settings.desktopNotify = false;
      saveData();
      if (dn) dn.classList.remove('active');
    } else if (appData.settings.desktopNotify) {
      registerNotificationWorker();
      if (dn) dn.classList.add('active');
    }
  } catch (e) {}
}, 800);
