// ==========================================
// パチンコ全能プラグイン V29 (ランキング称号・プロフィール完全対応版)
// ==========================================

const firebaseConfig = window.HallShared.firebaseConfig;

// 👇 🌟 加入呢個 JST 強制轉換函數 🌟 👇
function getJSTDate() {
    const now = new Date();
    // 將本地時間轉為 UTC，再加 9 個鐘 (36,000,000 毫秒) 變為日本時間
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 9));
}
// 👆 🌟 加入完畢 🌟 👆

const ADSTERRA_DIRECT_LINK = "https://www.effectivecpmnetwork.com/sczzxy44h?key=37be73e9e8ae708b133564c039a61e63";

window.latest_payout_for_share = 0;
window.latest_rush_for_share = 0;
window.globalUsersData = {};
window.currentOpenProfileUid = null;

// 🌟 保留極少量機台專用 Modal Layout CSS 🌟
const pluginModalStyle = document.createElement('style');
pluginModalStyle.innerHTML = `
    @media screen and (max-width: 768px) {
        #plugin-ui-container { position: relative !important; top: 0 !important; right: 0 !important; align-items: center !important; width: 100% !important; margin-bottom: 20px !important; flex-direction: column !important; }
        #plugin-ui-container > div { width: 90% !important; max-width: none !important; }
    }
    .profile-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; justify-content: center; align-items: center; animation: fadeIn 0.2s; }
    .profile-card { background: #111; border: 2px solid #444; border-radius: 12px; padding: 25px; width: 90%; max-width: 350px; text-align: center; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.8); border-top: 5px solid #ff1744; }
    .close-btn { position: absolute; top: 10px; right: 15px; cursor: pointer; color: #888; background: none; border: none; font-size: 1.2em; font-weight: bold; }
    .prog-container { margin-top: 15px; text-align: left; }
    .prog-label { font-size: 0.85em; color: #aaa; display: flex; justify-content: space-between; margin-bottom: 5px; }
    .prog-bar-bg { background: #222; border-radius: 10px; height: 10px; width: 100%; overflow: hidden; border: 1px solid #333; }
    .prog-bar-fill { height: 100%; transition: width 0.3s ease-out; }
    .fill-hell { background: #ff1744; box-shadow: 0 0 5px #ff1744; }
    .fill-run { background: #ff9100; box-shadow: 0 0 5px #ff9100; }
    .fill-ichi { background: #ffea00; box-shadow: 0 0 5px #ffea00; }
    .badge-container { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin-top: 20px; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75em; font-weight: bold; border: 1px solid #444; background: #222; color: #666; }
    .badge.active { background: #1a1a1a; border-color: #ffd700; color: #ffd700; box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
    .clickable-name { cursor: pointer; border-bottom: 1px dashed #555; padding-bottom: 2px; transition: 0.2s; }
    .clickable-name:hover { filter: brightness(1.3); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;
document.head.appendChild(pluginModalStyle);

// 🌟 全局獲取玩家名稱與稱號 HTML (包含點擊事件)
window.getPluginPlayerNameHtml = function (userObj, isRank1, uid = null, disableClick = false) {
    const titles = window.globalUsersData || {};
    const equippedTitle = uid && titles[uid] ? titles[uid].equipped_title : "auto";
    return window.HallShared.getTitleHtml(userObj, {
        isRank1,
        uid,
        disableClick,
        equippedTitle,
        onClickName: 'window.showPluginProfile'
    });
};

window.showPluginProfile = function (uid) {
    window.currentOpenProfileUid = uid;
    if (!window.globalUsersData || !window.globalUsersData[uid]) return;

    let u = window.globalUsersData[uid];
    let topUid = null;
    let richArr = Object.keys(window.globalUsersData)
        .map(k => ({ uid: k, balance: window.globalUsersData[k].balance || 0 }))
        .filter(u => u.balance >= 0)
        .sort((a, b) => b.balance - a.balance);
    if (richArr.length > 0) topUid = richArr[0].uid;

    let mockUserObj = {
        name: u.username, balance: u.balance, has_completed: u.has_completed,
        title_hell: u.title_hell, title_godpull: u.title_godpull,
        title_runthrough: u.title_runthrough, is_vip: u.is_vip,
        // 🌟 新增資料對接
        title_bl_legend: u.title_bl_legend, title_ghoul_legend: u.title_ghoul_legend,title_ghoul_charge: u.title_ghoul_charge,
        title_lycoris_legend: u.title_lycoris_legend, title_mushoku_legend: u.title_mushoku_legend,
        equipped_title: u.equipped_title,
        isSelf: firebase.auth().currentUser && firebase.auth().currentUser.uid === uid
    };

    let nameHtml = window.getPluginPlayerNameHtml(mockUserObj, topUid === uid, uid, true);
    let nameEl = document.getElementById('p-modal-name');
    if (nameEl.innerHTML !== nameHtml) nameEl.innerHTML = nameHtml;

    let balText = Math.round(u.balance || 0).toLocaleString();
    let balEl = document.getElementById('p-modal-balance');
    if (balEl.innerText !== balText) balEl.innerText = balText;

    let hC = u.single_hell_count || 0; let rC = u.runthrough_count || 0;
    let hText = `${hC} / 10`; let hTextEl = document.getElementById('p-modal-hell-text');
    if (hTextEl.innerText !== hText) hTextEl.innerText = hText;
    let hFill = `${Math.min((hC / 10) * 100, 100)}%`; let hFillEl = document.getElementById('p-modal-hell-fill');
    if (hFillEl.style.width !== hFill) hFillEl.style.width = hFill;

    let rText = `${rC} / 7`; let rTextEl = document.getElementById('p-modal-run-text');
    if (rTextEl.innerText !== rText) rTextEl.innerText = rText;
    let rFill = `${Math.min((rC / 7) * 100, 100)}%`; let rFillEl = document.getElementById('p-modal-run-fill');
    if (rFillEl.style.width !== rFill) rFillEl.style.width = rFill;

    let bHtml = '';
    bHtml += `<div class="badge ${u.has_completed ? 'active' : ''}">🌈 コンプリート</div>`;
    bHtml += `<div class="badge ${u.balance <= -10000000 ? 'active' : ''}">💀 破産王</div>`;
    bHtml += `<div class="badge ${u.title_godpull ? 'active' : ''}">✨ 神の引き</div>`;
    bHtml += `<div class="badge ${u.title_hell ? 'active' : ''}">怨 単発地獄</div>`;
    bHtml += `<div class="badge ${u.title_runthrough ? 'active' : ''}">⚡ 駆け抜け王</div>`;
    if (u.is_vip) bHtml += `<div class="badge active" style="border-color: #00e5ff; color: #00e5ff; box-shadow: 0 0 8px #00e5ff;">💎 VIP スポンサー</div>`;
    
    // 🌟 新增機種傳說徽章
    if (u.title_bl_legend) bHtml += `<div class="badge active" style="border-color: #00e5ff; color: #00e5ff;">⚽ 俺、はストライカーだ！</div>`;
    if (u.title_ghoul_legend) bHtml += `<div class="badge active" style="border-color: #ff1744; color: #ff1744;">🩸 僕、は喰種だ</div>`;
    if (u.title_ghoul_charge) bHtml += `<div class="badge active" style="border-color: #fff; color: #ff1744; text-shadow: 0 0 5px rgba(255,0,0,0.5);">🥀 何もできないのは…</div>`;
    if (u.title_lycoris_legend) bHtml += `<div class="badge active" style="border-color: #ff5252; color: #ff5252;">💩 ホットでプレミアムうんこ</div>`;
    if (u.title_mushoku_legend) bHtml += `<div class="badge active" style="border-color: #4fc3f7; color: #4fc3f7;">🪄 ロキシーのパンツ御神体</div>`;

    let badgesEl = document.getElementById('p-modal-badges');
    if (badgesEl.innerHTML !== bHtml) badgesEl.innerHTML = bHtml;
    document.getElementById('plugin-profile-modal').style.display = 'flex';

    let selectorEl = document.getElementById('p-modal-title-selector');
    if (firebase.auth().currentUser && firebase.auth().currentUser.uid === uid) {
        let eq = u.equipped_title || "auto";
        let renderKey = `${eq}-${u.has_completed}-${u.title_godpull}-${u.title_runthrough}-${u.title_hell}-${u.is_vip}-${u.title_bl_legend}-${u.title_ghoul_legend}-${u.title_lycoris_legend}-${u.title_mushoku_legend}`;

        if (selectorEl.getAttribute('data-render-key') !== renderKey) {
            let isAuto = eq === "auto"; let isNone = eq === "none"; let isCustom = !isAuto && !isNone;
            let isTop = (topUid === uid);

            selectorEl.innerHTML = `
                <div style="margin-top: 15px; text-align: left; background: #222; padding: 12px; border-radius: 8px; border: 1px solid #444;">
                    <label style="color: #00e5ff; font-size: 0.9em; font-weight: bold; display: block; border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 8px;">🏆 称号表示カスタム</label>
                    <div style="font-size: 0.9em; line-height: 1.8; color: #eee;">
                        <label><input type="radio" name="title_mode" value="auto" ${isAuto ? 'checked' : ''} onchange="window.toggleTitleChecks(this.value)"> 自動 (全て表示)</label><br>
                        <label><input type="radio" name="title_mode" value="none" ${isNone ? 'checked' : ''} onchange="window.toggleTitleChecks(this.value)"> 🚫 非表示</label><br>
                        <label><input type="radio" name="title_mode" value="custom" ${isCustom ? 'checked' : ''} onchange="window.toggleTitleChecks(this.value)"> 🔧 カスタム (複数選択可)</label><br>
                        
                        <div id="custom-title-list" style="margin-left: 25px; margin-top: 5px; padding: 5px 0; border-left: 2px solid #555; padding-left: 10px; ${isCustom ? 'display:block;' : 'display:none;'}">
                            ${isTop && u.has_completed ? `<label><input type="checkbox" class="t-check" value="legend" ${eq.includes('legend') ? 'checked' : ''}> 天上天下</label><br>` : ''}
                            ${u.has_completed ? `<label><input type="checkbox" class="t-check" value="supreme" ${eq.includes('supreme') ? 'checked' : ''}> コンプリート</label><br>` : ''}
                            ${u.title_godpull ? `<label><input type="checkbox" class="t-check" value="godpull" ${eq.includes('godpull') ? 'checked' : ''}> 神の引き</label><br>` : ''}
                            ${u.title_runthrough ? `<label><input type="checkbox" class="t-check" value="runthrough" ${eq.includes('runthrough') ? 'checked' : ''}> 駆け抜け王</label><br>` : ''}
                            ${u.title_hell ? `<label><input type="checkbox" class="t-check" value="hell" ${eq.includes('hell') ? 'checked' : ''}> 単発地獄</label><br>` : ''}
                            ${u.is_vip ? `<label><input type="checkbox" class="t-check" value="ichigeki" ${eq.includes('ichigeki') ? 'checked' : ''}> 💎 VIP 特権 (紫電)</label><br>` : ''}
                            <!-- 🌟 新增機種稱號裝備選項 -->
                            ${u.title_bl_legend ? `<label><input type="checkbox" class="t-check" value="bl_legend" ${eq.includes('bl_legend') ? 'checked' : ''}> ⚽ 俺、はストライカーだ！</label><br>` : ''}
                            ${u.title_ghoul_legend ? `<label><input type="checkbox" class="t-check" value="ghoul_legend" ${eq.includes('ghoul_legend') ? 'checked' : ''}> 🩸 僕、は喰種だ</label><br>` : ''}
                            ${u.title_ghoul_charge ? `<label><input type="checkbox" class="t-check" value="ghoul_charge" ${eq.includes('ghoul_charge') ? 'checked' : ''}> 🥀 何もできないのは、もう嫌なんだ</label><br>` : ''}
                            ${u.title_lycoris_legend ? `<label><input type="checkbox" class="t-check" value="lycoris_legend" ${eq.includes('lycoris_legend') ? 'checked' : ''}> 💩 プレミアムうんこ</label><br>` : ''}
                            ${u.title_mushoku_legend ? `<label><input type="checkbox" class="t-check" value="mushoku_legend" ${eq.includes('mushoku_legend') ? 'checked' : ''}> 🪄 ロキシーのパンツ</label><br>` : ''}
                        </div>
                    </div>
                    <button onclick="window.saveTitleSettings('${uid}')" style="margin-top: 12px; width: 100%; padding: 8px; background: #00e5ff; color: #000; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">💾 設定を保存</button>
                </div>`;
            selectorEl.setAttribute('data-render-key', renderKey);
        }
    } else {
        selectorEl.innerHTML = "";
        selectorEl.removeAttribute('data-render-key');
    }
};

const originalAlert = window.alert;
window.alert = function (msg) {
    let text = typeof msg === 'string' ? msg : msg;
    text = text.replace(/歡迎返嚟/g, "おかえりなさい")
        .replace(/登入成功/g, "ログイン成功")
        .replace(/登出/g, "ログアウト")
        .replace(/溫馨提示/g, "お知らせ")
        .replace(/你今日嘅 5000 轉限額已經打爆咗/g, "本日の上限に達しました")
        .replace(/請獲得出玉後再分享/g, "出玉を獲得してからポストしてください");
    originalAlert(text);
};

const dict = {
    "柏青哥模擬器": "パチンコシミュレーター", "返回主頁": "ホールに戻る", "當前轉數": "現在回転数",
    "現在回轉數": "現在回転数", "回轉": "回転", "本次出玉": "獲得出玉", "本次總出玉": "総獲得出玉",
    "累積出玉": "累計出玉", "最終出玉": "最終出玉", "本次連莊": "連チャン数", "連莊數": "連チャン",
    "連莊数": "連チャン", "總連莊數": "総連チャン数", "前次": "前回", "當選回轉數": "初当り回転",
    "當選回轉数": "初当り回転", "獲得出玉": "獲得出玉", "- 無紀錄 -": "- 履歴なし -",
    "DATA LAMP (最近10次)": "データランプ (直近10回)", "(最近10次)": "(直近10回)", "最近10次": "直近10回",
    "紀錄重置": "リセット", "遊戲紀錄已重置。": "プレイ履歴をリセットしました。", "繼續打玉": "プレイ続行",
    "開始魔法": "遊技開始", "開始冒險": "遊技開始", "發進 (PLAY)": "遊技開始",
    "LINK START": "遊技開始", "等待中...": "待機中...", "播放專屬音效": "専用BGM再生",
    "請稍候": "お待ちください", "正在播放": "再生中", "開始打玉": "遊技開始", "含初當": "初当たり含む", "遊戲開始": "遊技開始"
};

function translateDOM() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        let text = node.nodeValue;
        let originalText = text;
        for (let [zh, ja] of Object.entries(dict)) {
            if (text.includes(zh)) text = text.replace(new RegExp(zh, 'g'), ja);
        }
        if (text !== originalText) node.nodeValue = text;
    }
    const btnPlay = document.getElementById("btn-play");
    if (btnPlay && !btnPlay.disabled && btnPlay.innerText.includes("▶️")) btnPlay.innerText = "▶️ 遊技開始";
}

document.addEventListener("DOMContentLoaded", () => {
    const btnReset = document.getElementById("btn-reset");
    if (btnReset) btnReset.remove();
    translateDOM();

    const scriptApp = document.createElement('script');
    scriptApp.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
    document.head.appendChild(scriptApp);

    scriptApp.onload = () => {
        const scriptAuth = document.createElement('script');
        scriptAuth.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";
        document.head.appendChild(scriptAuth);

        scriptAuth.onload = () => {
            const scriptDb = document.createElement('script');
            scriptDb.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js";
            document.head.appendChild(scriptDb);
            scriptDb.onload = () => { initPlugin(); };
        };
    };

    function initPlugin() {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.database();

        auth.onAuthStateChanged((user) => {
            if (!user) { window.location.href = "login.html"; return; }
            const uid = user.uid;

            const userRef = db.ref('users/' + uid);

            userRef.get().then((snapshot) => {
                if (!snapshot.exists()) { auth.signOut(); window.location.href = "login.html"; return; }
                let userData = snapshot.val();
                let currentUserName = userData.username || "Guest";
                const todayStr = getJSTDate().toDateString();

                if (userData.last_date !== todayStr) {
                    userData.daily_spins = 0;
                    userData.daily_profit = 0;
                    userData.max_allowed_spins = 4000;
                    userData.last_date = todayStr;
                    userRef.update({ daily_spins: 0, daily_profit: 0, max_allowed_spins: 4000, last_date: todayStr });
                }

                if (!userData.max_allowed_spins) {
                    userData.max_allowed_spins = 4000;
                    userRef.update({ max_allowed_spins: 4000 });
                }

                runMachineLogic(db, auth, uid, currentUserName, userRef, userData);
            });
        });
    }

    function runMachineLogic(db, auth, uid, currentUserName, userRef, userData) {
        // ==========================================
        // 💎 VIP 贊助者特權處理
        // ==========================================
        if (userData.is_vip) {
            // 1. 殺死置底廣告區塊
            const adContainer = document.querySelector('div[style*="position: fixed; bottom: 0"]');
            if (adContainer) {
                adContainer.remove(); // 物理消除廣告
            }
            // 2. 解除 5000 轉限制，變成無限轉
            userData.max_allowed_spins = 999999999;
        }

        const exchangeRate = 3.57;
        let currentWallet = userData.balance;

        let currentMaxHamari = 0;
        db.ref('server_records/max_hamari').once('value', (snap) => {
            if (snap.exists()) {
                currentMaxHamari = parseInt(snap.val().spins) || 0;
            }
        });

        // 注入 Profile Modal HTML
        const modalHtml = document.createElement('div');
        modalHtml.id = 'plugin-profile-modal';
        modalHtml.className = 'profile-modal-overlay';
        modalHtml.onclick = function (e) { if (e.target === this) { this.style.display = 'none'; window.currentOpenProfileUid = null; } };
        modalHtml.innerHTML = `
            <div class="profile-card">
                <button class="close-btn" onclick="document.getElementById('plugin-profile-modal').style.display='none'; window.currentOpenProfileUid=null;">✖</button>
                <h3>プレイヤー情報</h3>
                <div id="p-modal-name" style="font-size: 1.5em; margin: 15px 0; color: #fff;">名前</div>
                <div style="font-size: 1.2em; color: #00e5ff; font-weight: bold; margin-bottom: 10px;"><span id="p-modal-balance">0</span> 円</div>
                <div class="prog-container"><div class="prog-label"><span>💀 単発地獄 (10回連続)</span><span id="p-modal-hell-text">0 / 10</span></div><div class="prog-bar-bg"><div id="p-modal-hell-fill" class="prog-bar-fill fill-hell" style="width: 0%;"></div></div></div>
                <div class="prog-container"><div class="prog-label"><span>⚡ 駆け抜け王 (7回連続)</span><span id="p-modal-run-text">0 / 7</span></div><div class="prog-bar-bg"><div id="p-modal-run-fill" class="prog-bar-fill fill-run" style="width: 0%;"></div></div></div>
                <div class="badge-container" id="p-modal-badges"></div>
                <div id="p-modal-title-selector"></div>
            </div>
        `;
        document.body.appendChild(modalHtml);

        const pluginUI = document.createElement("div");
        pluginUI.id = "plugin-ui-container";
        pluginUI.style.cssText = "position: fixed; top: 15px; right: 20px; display: flex; flex-direction: column; align-items: flex-end; z-index: 9999; gap: 10px;";

        pluginUI.innerHTML = `
            <a href="index.html" style="background-color: #222; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; border: 1px solid #777; box-shadow: 0 0 10px rgba(0,0,0,0.5);">🏠 ホールに戻る</a>
            <div style="background: #111; border: 2px solid #ffca28; color: white; padding: 12px 20px; border-radius: 8px; font-weight: bold; box-shadow: 0 0 15px rgba(255, 202, 40, 0.4); text-align: center; min-width: 160px; max-width: 250px;">
                👤 <span id="ui-username" class="clickable-name" onpointerdown="window.showPluginProfile('${uid}')">読込中...</span><br>
                💰 所持金<br>
                <span id="global-wallet" style="font-size: 1.4em;">0</span> 円
                <hr style="border: 0; border-top: 1px solid #333; margin: 10px 0;">
                <div style="font-size: 0.9em; color: #fff;">本日の回転数: <br><span id="daily-spins-ui" style="color:#ffeb3b; font-size:1.2em;">${userData.daily_spins}</span> / <span id="max-spins-ui">${userData.max_allowed_spins}</span> 回転</div>
                <hr style="border: 0; border-top: 1px solid #333; margin: 10px 0;">
                <div style="font-size: 0.75em; color: #ff7b72; text-align: left; font-weight: normal; line-height: 1.4;">※免責事項：当サイトの「円」等は架空のものです。</div>
            </div>
        `;
        document.body.appendChild(pluginUI);

        const walletEl = document.getElementById("global-wallet");
        const dailySpinsEl = document.getElementById("daily-spins-ui");
        const maxSpinsEl = document.getElementById("max-spins-ui");

        function renderWallet() {
            walletEl.innerText = Math.round(currentWallet).toLocaleString();
            walletEl.style.color = currentWallet >= 0 ? "#00e676" : "#ff5252";
            dailySpinsEl.innerText = userData.daily_spins;

            if (userData.is_vip) {
                userData.max_allowed_spins = 999999999;
                maxSpinsEl.innerText = "∞ (VIP)";
            } else {
                maxSpinsEl.innerText = userData.max_allowed_spins;
            }
        }
        renderWallet();

        let originalTitle = document.title;
        let machineName = originalTitle.replace(/【無料】/g, '').replace(/ \| パチンコシミュレーター/g, '').replace(/柏青哥模擬器 \(/g, '').replace('パチンコシミュレーター (', '').replace(/\)/g, '').trim() || "Unknown";
        document.title = originalTitle.replace("柏青哥模擬器", "パチンコシミュレーター");

        let pageText = originalTitle + " " + document.body.innerText;
        let spinCost = 1000 / 16; 

        if (pageText.includes("東京喰種 999ver")) spinCost = 1000 / 32;
        else if (pageText.includes("実力至上主義")) spinCost = 1000 / 29;
        else if (pageText.includes("ソードアート・オンライン")) spinCost = 1000 / 20;
        else if (pageText.includes("タクトオーパス")) spinCost = 1000 / 41;
        else if (pageText.includes("魔女と野獣")) spinCost = 1000 / 28;
        else if (pageText.includes("ユニコーン2") && !pageText.includes("129Ver")) spinCost = 1000 / 30;
        else if (pageText.includes("ギンパラ")) spinCost = 1000 / 22;
        else if (pageText.includes("いせれべ")) spinCost = 1000 / 27;
        else if (pageText.includes("エイティシックス")) spinCost = 1000 / 20;
        else if (pageText.includes("まどか☆マギカ")) spinCost = 1000 / 20;
        else if (pageText.includes("カフェテラス")) spinCost = 1000 / 27;
        else if (pageText.includes("Re:ゼロ") && pageText.includes("129")) spinCost = 1000 / 16;
        else if (pageText.includes("バキ2")) spinCost = 1000 / 16;
        else if (pageText.includes("大工の源さん")) spinCost = 1000 / 18;

        // 🌟 生成排行榜與實時數據同步 🌟
        let currentMachineRankings = [];
        let rightPanel = document.querySelector(".right-panel");
        if (rightPanel) {
            const rankingUI = document.createElement("div");
            rankingUI.className = "data-lamp-container";
            rankingUI.style.marginTop = "20px";
            rankingUI.innerHTML = `
                <h3 class="data-lamp-title" style="color: #ffeb3b; font-size: 1.1em;">🏆 歴代出玉ランキング<br><span style="font-size:0.7em; color:#fff;">(一撃一万発 OVER)</span></h3>
                <table class="data-lamp">
                    <thead><tr><th>順位</th><th>プレイヤー</th><th>出玉</th><th>日付</th></tr></thead>
                    <tbody id="machine-ranking-body"><tr><td colspan="4" class="empty-row">データ読込中...</td></tr></tbody>
                </table>
            `;
            rightPanel.appendChild(rankingUI);
        }

        function renderMachineRankings() {
            const tbody = document.getElementById("machine-ranking-body");
            if (!tbody) return;

            let topUid = null;
            let richArr = Object.keys(window.globalUsersData)
                .map(k => ({ uid: k, balance: window.globalUsersData[k].balance || 0 }))
                .filter(u => u.balance >= 0)
                .sort((a, b) => b.balance - a.balance);
            if (richArr.length > 0) topUid = richArr[0].uid;

            let currentUserObj = window.globalUsersData[uid];
            if (currentUserObj) {
                let mockSelf = {
                    name: currentUserObj.username, balance: currentUserObj.balance,
                    has_completed: currentUserObj.has_completed, title_hell: currentUserObj.title_hell,
                    title_godpull: currentUserObj.title_godpull, title_runthrough: currentUserObj.title_runthrough,
                    is_vip: currentUserObj.is_vip,
                    title_bl_legend: currentUserObj.title_bl_legend || false,
                    title_ghoul_legend: currentUserObj.title_ghoul_legend || false,
                    title_lycoris_legend: currentUserObj.title_lycoris_legend || false,
                    title_mushoku_legend: currentUserObj.title_mushoku_legend || false
                };
                let selfHtml = window.getPluginPlayerNameHtml(mockSelf, topUid === uid, uid, false);
                let uiUserEl = document.getElementById("ui-username");
                if (uiUserEl && uiUserEl.innerHTML !== selfHtml) {
                    uiUserEl.innerHTML = selfHtml;
                }
            }

            if (currentMachineRankings.length === 0) {
                if (tbody.innerHTML !== `<tr><td colspan="4" class="empty-row">一万発達成者なし</td></tr>`) {
                    tbody.innerHTML = `<tr><td colspan="4" class="empty-row">一万発達成者なし</td></tr>`;
                }
                return;
            }

            let rows = tbody.children;
            if (rows.length !== currentMachineRankings.length || (rows.length > 0 && rows[0].cells.length === 1)) {
                let html = "";
                currentMachineRankings.forEach(() => {
                    html += `<tr><td></td><td></td><td></td><td></td></tr>`;
                });
                tbody.innerHTML = html;
                rows = tbody.children;
            }

            currentMachineRankings.forEach((rec, idx) => {
                let rankText = (idx === 0) ? "🥇" : (idx === 1) ? "🥈" : (idx === 2) ? "🥉" : (idx + 1);

                let hitUid = null;
                let hitUserObj = { name: rec.user, has_completed: false };
                for (let u in window.globalUsersData) {
                    if (window.globalUsersData[u].username === rec.user) {
                        hitUid = u;
                        let data = window.globalUsersData[u];
                        hitUserObj = {
                            uid: u, name: data.username, balance: data.balance || 0,
                            has_completed: data.has_completed || false, title_hell: data.title_hell || false,
                            title_godpull: data.title_godpull || false, title_runthrough: data.title_runthrough || false,
                            is_vip: data.is_vip || false, isSelf: (auth.currentUser && auth.currentUser.uid === u)
                        };
                        break;
                    }
                }

                let nameHtml = window.getPluginPlayerNameHtml(hitUserObj, hitUid === topUid, hitUid, false);
                let row = rows[idx];

                if (row.cells[0].innerText !== rankText.toString()) row.cells[0].innerText = rankText;

                if (row.cells[1].innerHTML !== nameHtml) {
                    row.cells[1].innerHTML = nameHtml;
                    row.cells[1].style.fontWeight = "bold";
                }

                let payoutText = rec.payout.toLocaleString();
                if (row.cells[2].innerText !== payoutText) {
                    row.cells[2].innerText = payoutText;
                    row.cells[2].style.color = "#ff5252";
                    row.cells[2].style.fontWeight = "bold";
                }

                if (row.cells[3].innerText !== rec.date) {
                    row.cells[3].innerText = rec.date;
                    row.cells[3].style.fontSize = "0.8em";
                    row.cells[3].style.color = "#888";
                }
            });
        }

        // ==========================================
        // 🚨 極限慳流量架構：精準讀取
        // ==========================================
        window.globalUsersData = {};
        let topUid = null;

        async function fetchRankingsAndUsers() {
            try {
                const rankSnap = await db.ref('machine_rankings/' + machineName)
                    .orderByChild('payout')
                    .limitToLast(10)
                    .once('value');

                currentMachineRankings = [];
                if (rankSnap.exists()) {
                    rankSnap.forEach(child => { currentMachineRankings.push(child.val()); });
                    currentMachineRankings.reverse();
                }

                let promises = [];

                promises.push(
                    db.ref('users').orderByChild('balance').limitToLast(1).once('value').then(snap => {
                        if (snap.exists()) {
                            snap.forEach(child => {
                                topUid = child.key;
                                window.globalUsersData[child.key] = child.val();
                            });
                        }
                    })
                );

                if (uid) {
                    promises.push(
                        db.ref('users/' + uid).once('value').then(snap => {
                            if (snap.exists()) {
                                let u = snap.val();
                                window.globalUsersData[uid] = u;
                                let needsUpdate = false;
                                let updates = {};
                                if ((u.single_hell_count || 0) >= 10 && !u.title_hell) { updates.title_hell = true; u.title_hell = true; needsUpdate = true; }
                                if ((u.runthrough_count || 0) >= 7 && !u.title_runthrough) { updates.title_runthrough = true; u.title_runthrough = true; needsUpdate = true; }
                                if (needsUpdate && firebase.auth().currentUser && firebase.auth().currentUser.uid === uid) {
                                    db.ref(`users/${uid}`).update(updates).catch(e => console.warn(e));
                                }
                            }
                        })
                    );
                }

                let uniqueNames = [...new Set(currentMachineRankings.map(r => r.user))];
                uniqueNames.forEach(name => {
                    promises.push(
                        db.ref('users').orderByChild('username').equalTo(name).once('value').then(snap => {
                            if (snap.exists()) {
                                snap.forEach(child => {
                                    window.globalUsersData[child.key] = child.val();
                                });
                            }
                        })
                    );
                });

                await Promise.all(promises);

                if (uid && !window._isMyProfileListening) {
                    window._isMyProfileListening = true;
                    db.ref('users/' + uid).on('value', snap => {
                        if (snap.exists()) {
                            window.globalUsersData[uid] = snap.val();
                            if (window.currentOpenProfileUid === uid) {
                                window.showPluginProfile(uid);
                            }
                        }
                    });
                }

                renderMachineRankings();
                if (window.currentOpenProfileUid) window.showPluginProfile(window.currentOpenProfileUid);

            } catch (error) {
                console.error("データの読み込みに失敗しました:", error);
            }
        }

        fetchRankingsAndUsers();

        function disableMachine(msgText = "⛔ 本日の上限に達しました") {
            let playBtn = document.getElementById("btn-play");
            if (playBtn) {
                playBtn.disabled = true;
                playBtn.innerText = msgText;
            }
            showRewardAdButton();
        }

        function showRewardAdButton() {
            if (document.getElementById("btn-reward-ad")) return;
            const playBtn = document.getElementById("btn-play");
            const container = playBtn ? playBtn.parentNode : null;
            if (!container) return;

            const adBtn = document.createElement("button");
            adBtn.id = "btn-reward-ad";
            adBtn.innerText = "📺 広告を見て +4000回転 解鎖";
            adBtn.style.cssText = "background-color: #ff9100; color: #fff; border: 1px solid #ffea00; box-shadow: 0 0 10px #ff9100;";

            adBtn.onclick = () => {
                adBtn.disabled = true;
                window.open(ADSTERRA_DIRECT_LINK, '_blank');

                let secondsLeft = 15;
                adBtn.innerText = `⏳ 広告確認中 (${secondsLeft}s)...`;

                let countdown = setInterval(() => {
                    secondsLeft--;
                    if (secondsLeft > 0) {
                        adBtn.innerText = `⏳ 広告確認中 (${secondsLeft}s)...`;
                    } else {
                        clearInterval(countdown);
                        userData.max_allowed_spins += 4000;
                        userRef.update({ max_allowed_spins: userData.max_allowed_spins }).then(() => {
                            window.alert("🎉 認証成功！上限が +4000回転 追加されました！\n(システムを再起動します)");
                            window.location.reload();
                        });
                    }
                }, 1000);
            };
            container.appendChild(adBtn);
        }

        setTimeout(() => { if (userData.daily_spins >= userData.max_allowed_spins) disableMachine(); }, 500);

        let lastUI_spins = 0;
        let lastUI_payout = 0;
        let completeTriggeredThisRush = false;

        if (typeof window.updateUI === "function") {
            const originalUpdateUI = window.updateUI;
            window.updateUI = function () {
                const todayStr = getJSTDate().toDateString();
                if (userData.last_date !== todayStr) {
                    userData.daily_spins = 0;
                    userData.daily_profit = 0;
                    userData.last_date = todayStr;
                    userRef.update({ daily_spins: 0, daily_profit: 0, last_date: todayStr });
                    
                    let playBtn = document.getElementById("btn-play");
                    if (playBtn && playBtn.disabled) {
                        playBtn.disabled = false;
                        playBtn.innerText = "▶️ 遊技開始";
                    }
                    let adBtn = document.getElementById("btn-reward-ad");
                    if (adBtn) adBtn.remove();
                }
                
                originalUpdateUI();
                translateDOM();

                let spinEl = document.getElementById("ui-spins");
                let payoutEl = document.getElementById("ui-payout");
                let rushEl = document.getElementById("ui-rush");

                if (!spinEl || !payoutEl) return;

                let isRushUI = spinEl.innerText.includes('中') || spinEl.innerText.includes('/') || spinEl.innerText.includes('残') || spinEl.innerText.includes('BATTLE') || spinEl.innerText.includes('RUSH') || spinEl.innerText.includes('ST');

                let new_spins;
                if (isRushUI) {
                    new_spins = lastUI_spins;
                } else {
                    let spinRawText = spinEl.innerText.replace(/,/g, '');
                    let matchSpins = spinRawText.match(/\d+/);
                    new_spins = matchSpins ? parseInt(matchSpins[0]) : 0;
                }

                let new_payout = parseInt(payoutEl.innerText.replace(/,/g, '')) || 0;
                let new_rush = rushEl ? (parseInt(rushEl.innerText.replace(/,/g, '')) || 0) : 0;

                if (new_spins > 100 && new_spins > currentMaxHamari) {
                    currentMaxHamari = new_spins;
                    const todayDate = getJSTDate();
                    const dateStr = `${todayDate.getMonth() + 1}/${todayDate.getDate()}`;

                    db.ref('server_records/max_hamari').transaction((currentData) => {
                        if (currentData === null || new_spins > currentData.spins) {
                            return { user: currentUserName, spins: new_spins, machine: machineName, date: dateStr };
                        }
                        return;
                    });
                }

                if (new_payout > window.latest_payout_for_share) {
                    window.latest_payout_for_share = new_payout;
                    window.latest_rush_for_share = new_rush;
                }

                let spin_diff = new_spins - lastUI_spins;
                let payout_diff = new_payout - lastUI_payout;

                if (new_payout === 0) {
                    let alreadySaved = completeTriggeredThisRush;
                    completeTriggeredThisRush = false;

                    if (lastUI_payout >= 10000 && !alreadySaved) {
                        const todayDate = getJSTDate();
                        const dateStr = `${todayDate.getMonth() + 1}/${todayDate.getDate()}`;
                        const dateKey = `${todayDate.getFullYear()}_${todayDate.getMonth() + 1}_${todayDate.getDate()}`;

                        db.ref('machine_rankings/' + machineName).push({ user: currentUserName, payout: lastUI_payout, date: dateStr });

                        db.ref('server_records/daily_best').transaction((curr) => {
                            if (!curr || curr.date !== dateStr || lastUI_payout > curr.payout) {
                                return { uid: uid, user: currentUserName, payout: lastUI_payout, date: dateStr, processed: false };
                            }
                            return;
                        });

                        db.ref(`server_records/daily_bests_log/${dateKey}`).transaction((curr) => {
                            if (!curr || lastUI_payout > curr.payout) {
                                return { uid: uid, user: currentUserName, payout: lastUI_payout, date: dateStr, processed: false };
                            }
                            return;
                        });
                    }
                }

                if (spin_diff < 0) spin_diff = 0;
                else if (spin_diff > 100) spin_diff = 1;
                if (payout_diff < 0) payout_diff = new_payout;

                let needUpdateCloud = false;
                let sessionNetProfit = 0;

                if (spin_diff > 0) {
                    if (userData.daily_spins >= userData.max_allowed_spins) {
                        disableMachine();
                        window.alert("⚠️ お知らせ：本日の上限に達しました！広告を見て枠を増やせます。");
                        throw new Error("Daily spin limit reached!");
                    }
                    userData.daily_spins += spin_diff;
                    let cost = spin_diff * spinCost;
                    currentWallet -= cost;
                    sessionNetProfit -= cost;
                    needUpdateCloud = true;
                }

                if (payout_diff > 0) {
                    let gain = payout_diff * exchangeRate;
                    currentWallet += gain;
                    sessionNetProfit += gain;
                    needUpdateCloud = true;
                }

                if (needUpdateCloud) {
                    userData.balance = currentWallet;
                    userData.daily_profit = (userData.daily_profit || 0) + sessionNetProfit;
                    userRef.update({ balance: currentWallet, daily_spins: userData.daily_spins, daily_profit: userData.daily_profit });
                }

                renderWallet();
                lastUI_spins = new_spins;
                lastUI_payout = new_payout;

                if (new_payout >= 95000 && !completeTriggeredThisRush) {
                    completeTriggeredThisRush = true;
                    const todayDate = getJSTDate();
                    const dateStr = `${todayDate.getMonth() + 1}/${todayDate.getDate()}`;
                    const dateKey = `${todayDate.getFullYear()}_${todayDate.getMonth() + 1}_${todayDate.getDate()}`;

                    db.ref('machine_rankings/' + machineName).push({ user: currentUserName, payout: new_payout, date: dateStr });

                    db.ref('server_records/daily_best').transaction((curr) => {
                        if (!curr || curr.date !== dateStr || new_payout > curr.payout) {
                            return { uid: uid, user: currentUserName, payout: new_payout, date: dateStr, processed: false };
                        }
                        return;
                    });

                    db.ref(`server_records/daily_bests_log/${dateKey}`).transaction((curr) => {
                        if (!curr || new_payout > curr.payout) {
                            return { uid: uid, user: currentUserName, payout: new_payout, date: dateStr, processed: false };
                        }
                        return;
                    });

                    if (!userData.has_completed) {
                        userData.has_completed = true;
                        userRef.update({ has_completed: true });
                        window.alert("🎉【コンプリート機能 発動】🎉\n95,000発達成おめでとうございます！\n名誉の証として、プレイヤー名が虹色に輝くようになりました！\n\n※コンプリート機能により、現在のRUSHは強制終了となります。");
                    } else {
                        window.alert("🎉【コンプリート機能 発動】🎉\n95,000発到達！\n\n※コンプリート機能により、現在のRUSHは強制終了となります。");
                    }
                    setTimeout(() => {
                        let playBtn = document.getElementById("btn-play");
                        if (playBtn) playBtn.disabled = false;
                        window.updateUI();
                    }, 100);
                }

                if (userData.daily_spins >= userData.max_allowed_spins) disableMachine();
            };
        }

        function getShareText(payout, rushCount) {
            const compText = payout >= 95000 ? "\n🎉【完成全機種挑戰！】🎉" : "";
            return `【一撃獲得 ${payout.toLocaleString()} 玉！】${compText}\n🎰 機種：${machineName}\n💥 本次出玉：${payout.toLocaleString()} 玉（${rushCount} 連莊）\n\n你今日嘅運氣有幾勁？🔥\n#柏青哥模擬器 #柏青哥 #網頁版柏青哥 #免費遊戲 #神抽`;
        }

        function getThreadsShareUrl(text) {
            return `https://www.threads.com/intent/post?text=${encodeURIComponent(`${text}\n\n${window.location.href}`)}`;
        }

        function openThreadsShare(text, shareWindow = null) {
            const shareUrl = getThreadsShareUrl(text);
            if (shareWindow && !shareWindow.closed) {
                shareWindow.location.href = shareUrl;
                shareWindow.focus();
                return;
            }
            const openedWindow = window.open(shareUrl, '_blank');
            if (!openedWindow) {
                window.alert('ポップアップがブロックされました。ブラウザのポップアップ許可後、もう一度お試しください。');
            }
        }

        function createShareCardBlob(payout, rushCount) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                canvas.width = 1200;
                canvas.height = 630;
                const context = canvas.getContext('2d');
                if (!context) {
                    resolve(null);
                    return;
                }

                const background = context.createLinearGradient(0, 0, 1200, 630);
                background.addColorStop(0, '#090b16');
                background.addColorStop(0.55, '#17102d');
                background.addColorStop(1, '#5b1729');
                context.fillStyle = background;
                context.fillRect(0, 0, canvas.width, canvas.height);

                context.globalAlpha = 0.2;
                context.fillStyle = '#ffca28';
                context.beginPath();
                context.arc(1030, 80, 190, 0, Math.PI * 2);
                context.fill();
                context.fillStyle = '#00e5ff';
                context.beginPath();
                context.arc(120, 590, 150, 0, Math.PI * 2);
                context.fill();
                context.globalAlpha = 1;

                context.strokeStyle = '#ffca28';
                context.lineWidth = 4;
                context.strokeRect(28, 28, 1144, 574);
                context.textBaseline = 'middle';
                context.fillStyle = '#ffca28';
                context.font = 'bold 32px "Noto Sans JP", sans-serif';
                context.fillText('🎰 バーチャル パチンコホール', 70, 90);

                context.fillStyle = '#ffffff';
                context.font = 'bold 48px "Noto Sans JP", sans-serif';
                const title = machineName.length > 24 ? `${machineName.slice(0, 24)}…` : machineName;
                context.fillText(title, 70, 170);

                context.fillStyle = '#ffeb3b';
                context.font = '900 106px "Noto Sans JP", sans-serif';
                context.fillText(`${payout.toLocaleString()} 玉`, 70, 330);

                context.fillStyle = '#ffffff';
                context.font = 'bold 38px "Noto Sans JP", sans-serif';
                context.fillText(`${rushCount.toLocaleString()} 連莊`, 75, 415);
                context.fillStyle = payout >= 95000 ? '#ff80ab' : '#9cefff';
                context.font = 'bold 30px "Noto Sans JP", sans-serif';
                context.fillText(payout >= 95000 ? '🎉 完成全機種挑戰！' : '一擊戦績達成！', 75, 500);

                context.fillStyle = '#c9d1d9';
                context.font = '24px "Noto Sans JP", sans-serif';
                context.fillText('免費網頁版柏青哥模擬器', 760, 550);
                canvas.toBlob(resolve, 'image/png');
            });
        }

        function downloadShareCard() {
            const payout = window.latest_payout_for_share || 0;
            const rushCount = window.latest_rush_for_share || 0;
            if (payout < 10000) {
                window.alert("一万発を達成してから画像を保存してください！");
                return;
            }
            createShareCardBlob(payout, rushCount).then((blob) => {
                if (!blob) return;
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `pachinko-result-${payout}.png`;
                link.click();
                setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            });
        }

        const playBtn = document.getElementById("btn-play");
        const btnContainer = playBtn ? playBtn.parentNode : null;

        if (btnContainer) {
            const shareBtn = document.createElement("button");
            shareBtn.id = "btn-share-x";
            shareBtn.innerText = "𝕏 一万発達成！ポストする";
            shareBtn.style.cssText = "background-color: #000; color: #ffca28; border: 2px solid #ffca28; display: none; margin-left: 5px; box-shadow: 0 0 15px rgba(255, 202, 40, 0.6); cursor: pointer; padding: 12px 25px; font-size: 1.1em; border-radius: 5px; font-weight: bold;";

            shareBtn.onclick = () => {
                let payout = window.latest_payout_for_share || 0;
                let rushCount = window.latest_rush_for_share || 0;
                if (payout < 10000) { window.alert("一万発を達成してからポストしてください！"); return; }
                const text = `【一撃一万発達成！】\n🎰 機種：${machineName}\n💥 今回の獲得出玉：${payout.toLocaleString()}玉 (${rushCount}連チャン)\n\n今日のヒキは神レベル！？🔥\n#パチンコ #神引き #一万発 #パチンコシミュレーター`;
                let url = window.location.href;
                let shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                window.open(shareUrl, '_blank');
            };
            btnContainer.appendChild(shareBtn);

            const threadsBtn = document.createElement("button");
            threadsBtn.id = "btn-share-threads";
            threadsBtn.innerText = "🧵 Threadsで戦績をシェア";
            threadsBtn.style.cssText = "background-color: #17102d; color: #ffca28; border: 2px solid #ffca28; display: none; margin-left: 5px; box-shadow: 0 0 12px rgba(255, 202, 40, 0.35); cursor: pointer; padding: 12px 20px; font-size: 1.1em; border-radius: 5px; font-weight: bold;";
            threadsBtn.onclick = async () => {
                const payout = window.latest_payout_for_share || 0;
                const rushCount = window.latest_rush_for_share || 0;
                if (payout < 10000) { window.alert("一万発を達成してからシェアしてください！"); return; }
                const text = getShareText(payout, rushCount);
                const shareWindow = window.open('about:blank', '_blank');
                if (navigator.share && navigator.canShare) {
                    const blob = await createShareCardBlob(payout, rushCount);
                    const file = blob ? new File([blob], `pachinko-result-${payout}.png`, { type: 'image/png' }) : null;
                    if (file && navigator.canShare({ files: [file] })) {
                        try {
                            if (shareWindow && !shareWindow.closed) shareWindow.close();
                            await navigator.share({ title: 'パチンコ実績', text, url: window.location.href, files: [file] });
                            return;
                        } catch (error) {
                            if (error.name === 'AbortError') return;
                        }
                    }
                }
                openThreadsShare(text, shareWindow);
            };
            btnContainer.appendChild(threadsBtn);

            const imageBtn = document.createElement("button");
            imageBtn.id = "btn-save-share-image";
            imageBtn.innerText = "🖼️ 戦績画像を保存";
            imageBtn.style.cssText = "background-color: #17102d; color: #ffca28; border: 2px solid #ffca28; display: none; margin-left: 5px; box-shadow: 0 0 12px rgba(255, 202, 40, 0.35); cursor: pointer; padding: 12px 20px; font-size: 1.1em; border-radius: 5px; font-weight: bold;";
            imageBtn.onclick = downloadShareCard;
            btnContainer.appendChild(imageBtn);

            if (playBtn) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === "attributes" && mutation.attributeName === "disabled") {
                            let sBtn = document.getElementById("btn-share-x");
                            let threadsShareBtn = document.getElementById("btn-share-threads");
                            let saveImageBtn = document.getElementById("btn-save-share-image");
                            if (!playBtn.disabled) {
                                playBtn.innerText = "▶️ プレイ続行";
                                const canShare = window.latest_payout_for_share >= 10000;
                                if (sBtn) sBtn.style.display = canShare ? "inline-block" : "none";
                                if (threadsShareBtn) threadsShareBtn.style.display = canShare ? "inline-block" : "none";
                                if (saveImageBtn) saveImageBtn.style.display = canShare ? "inline-block" : "none";
                            } else {
                                if (sBtn) sBtn.style.display = "none";
                                if (threadsShareBtn) threadsShareBtn.style.display = "none";
                                if (saveImageBtn) saveImageBtn.style.display = "none";
                                window.latest_payout_for_share = 0;
                                window.latest_rush_for_share = 0;
                            }
                        }
                    });
                });
                observer.observe(playBtn, { attributes: true });
            }
        }
    }
});

if (typeof window.addLog === "function") {
    const originalAddLog = window.addLog;
    window.addLog = function (text, className = "") {
        if (text.includes("播放") || text.includes("再生") || text.includes("mp4") || text.includes("音效") || text.includes("請稍候")) {
            return;
        }
        let translatedText = text;
        translatedText = translatedText.replace(/STOCK獲得！(\d+)玉 \(剩餘 (\d+)轉\)/g, "STOCK獲得！$1玉 (残り $2回転)");
        translatedText = translatedText.replace(/剩餘 (\d+) 轉/g, "残り $1 回転");
        translatedText = translatedText.replace(/獲得 (\d+) 玉/g, "$1 玉獲得");
        translatedText = translatedText.replace(/大當り！ (\d+)連莊/g, "大当り！ $1連チャン");

        for (let [zh, ja] of Object.entries(dict)) {
            if (translatedText.includes(zh)) translatedText = translatedText.split(zh).join(ja);
        }
        originalAddLog(translatedText, className);
    };
}

const originalPlay = HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play = function () {
    this.muted = true;
    setTimeout(() => { this.dispatchEvent(new Event("ended")); }, 10);
    return Promise.resolve();
};

setTimeout(() => {
    if (typeof window.playVideoPopupAndWait === "function") {
        window.playVideoPopupAndWait = function () { return Promise.resolve(); };
    }
}, 100);

// ==========================================
// 🏆 全自動稱號判定系統 (Log Interceptor)
// ==========================================
window._lastLoggedSpins = 0; 
window._lastHellCountedSpin = -1; 

setTimeout(() => {
    if (typeof window.addLog === "function") {
        const originalAddLog = window.addLog;
        window.addLog = function (text, className = "") {
            if (text.includes("播放") || text.includes("再生") || text.includes("mp4") || text.includes("音效") || text.includes("請稍候")) {
                return;
            }

            let translatedText = text;
            translatedText = translatedText.replace(/STOCK獲得！(\d+)玉 \(剩餘 (\d+)轉\)/g, "STOCK獲得！$1玉 (残り $2回転)");
            translatedText = translatedText.replace(/剩餘 (\d+) 轉/g, "残り $1 回転");
            translatedText = translatedText.replace(/獲得 (\d+) 玉/g, "$1 玉獲得");
            translatedText = translatedText.replace(/大當り！ (\d+)連莊/g, "大当り！ $1連チャン");

            for (let [zh, ja] of Object.entries(dict)) {
                if (translatedText.includes(zh)) translatedText = translatedText.split(zh).join(ja);
            }

            originalAddLog(translatedText, className);

            try {
                const user = firebase.auth().currentUser;
                if (!user) return;
                const titleDb = firebase.database();
                const uid = user.uid;
                const machineTitle = document.querySelector('h1') ? document.querySelector('h1').innerText : "";
                const rushEl = document.getElementById('ui-rush');
                const rushCount = rushEl ? parseInt(rushEl.innerText) : 0;

                let spinMatch = translatedText.match(/\[\s*(\d+)\s*(?:回轉|回転)/);
                if (spinMatch && !translatedText.includes("ST") && !translatedText.includes("残保留") && !translatedText.includes("電サポ")) {
                    window._lastLoggedSpins = parseInt(spinMatch[1]);
                }
                let actualSpins = window._lastLoggedSpins || 0;

                const pageName = location.pathname.split('/').pop().toLowerCase();
                const heavyMachinePages = new Set(['bluelock.html', 'edens.html', 'eva.html', 'ghoul399.html', 'ghoul999.html', 'hokuto10.html', 'hokuto11.html', 'mushoku.html', 'seed.html', 'slime.html', 'takt.html', 'majo.html']);
                const isHeavyMachine = heavyMachinePages.has(pageName) || /(?:399|999|エヴァンゲリオン|北斗|無職転生|EDENS|SEED|転生したらスライム|takt|タクト|魔女と野獣)/i.test(machineTitle);

                const isCharge = /チャージ|CHARGE/i.test(translatedText);
                const isRushChallengeEnter = /(チャレンジ|JUDGE|CZ|時短).*?(突入|開始)/.test(translatedText)
                    || /(突入|開始).*?(チャレンジ|JUDGE|CZ|時短)/.test(translatedText);
                const isRealRushEnter = /(RUSH|IMPACT MODE|BATTLE|LT|右打ち).*?(突入|直行|開始)/.test(translatedText) && !/チャレンジ|JUDGE|CZ|非突入|失敗/.test(translatedText);

                // ✨ 神の引き
                if (isRealRushEnter && actualSpins === 1 && isHeavyMachine) {
                    titleDb.ref('users/' + uid).update({ title_godpull: true });
                    window._lastLoggedSpins = 0;
                }

                // ⚡ 駆け抜け王
                const isRushChallengeFailure = /チャレンジ失敗|CZ失敗|JUDGE失敗|時短終了|任務失敗|チャンスタイム終了|昇格失敗/.test(translatedText);
                const isRushEnd = /RUSH\s*終了|IMPACT MODE終了|ST抜け|ST終了|LT終了|決着.*RUSH終了|BATTLE敗北|バトル敗北|ボールを奪われた.*転落|ST.*スルー.*終了|ST駆け抜け.*終了|魂神の一撃.*失敗|敗北.*転落.*終了|(?:振り分け|退学).*通常へ転落|アルティメット終了|ワルプルギス終了/.test(translatedText)
                    && !isRushChallengeFailure;
                const isRunthroughExplicit = /駆け抜け|スルー/.test(translatedText) && !isRushChallengeFailure;

                if (isRushEnd || isRunthroughExplicit) {
                    if (isRunthroughExplicit || rushCount <= 1) {
                        titleDb.ref('users/' + uid + '/runthrough_count').transaction(count => {
                            let newCount = (count || 0) + 1;
                            if (newCount >= 7) titleDb.ref('users/' + uid).update({ title_runthrough: true });
                            return newCount;
                        });
                    } else {
                        titleDb.ref('users/' + uid + '/runthrough_count').set(0);
                    }
                }

                // 💀 単発地獄
                const isNormalLoss = !isRushEnd && !isRunthroughExplicit
                    && (
                        isRushChallengeFailure
                        || /通常へ戻る|通常終了|通常へ|RUSH非突入/.test(translatedText)
                        || (/(CHARGE|チャージ)/i.test(translatedText) && !/突入|開始|昇格|成功/.test(translatedText))
                    );

                if (isNormalLoss) {
                    if (rushCount <= 1 && actualSpins !== window._lastHellCountedSpin) {
                        window._lastHellCountedSpin = actualSpins; 
                        titleDb.ref('users/' + uid + '/single_hell_count').transaction(count => {
                            let newCount = (count || 0) + 1;
                            if (newCount >= 10) titleDb.ref('users/' + uid).update({ title_hell: true });
                            return newCount;
                        });
                    }
                }

                if (isRealRushEnter || translatedText.includes("継続") || translatedText.includes("連)") || rushCount >= 2) {
                    titleDb.ref('users/' + uid + '/single_hell_count').set(0);
                }

                // ==========================================
                // 🌟 第三步：4 大機種傳說稱號判定系統 🌟
                // ==========================================
                const isBlueLock = pageName.includes("bluelock") || machineTitle.includes("ブルーロック");
                const isGhoul = pageName.includes("ghoul") || machineTitle.includes("東京喰種");
                const isLycoris = pageName.includes("lycoris") || machineTitle.includes("リコリス");
                const isMushoku = pageName.includes("mushoku") || machineTitle.includes("無職転生");

                // 👇👇👇 完美修復：優先讀取 (計 XXX玉)，防止畀 +3000玉 呃咗 👇👇👇
                let noCommaText = translatedText.replace(/,/g, '');
                let earnedBalls = 0;
                let matchTotal = noCommaText.match(/\(計\s*(\d+)玉\)/);
                if (matchTotal) {
                    earnedBalls = parseInt(matchTotal[1]); // 優先拎總數
                } else {
                    let matchSingle = noCommaText.match(/(\d+)玉/);
                    earnedBalls = matchSingle ? parseInt(matchSingle[1]) : 0; // 無總數先拎普通數字
                }
                // 👆👆👆 修復完畢 👆👆👆

                // 1. ⚽ Blue Lock
                if (isBlueLock) {
                    if (translatedText.includes("全回転") || translatedText.includes("7500だけじゃ、終われない")) {
                        titleDb.ref('users/' + uid).update({ title_bl_legend: true });
                        window.alert("🎉 伝説の称号【俺、はストライカーだ！】を獲得しました！\nプロフィールから装備できます！");
                    }
                }
                
                // 2. 🩸 東京喰種
                if (isGhoul) {
                    // 第一個稱號：30,000玉 (僕、は喰種だ)
                    if (earnedBalls >= 30000) {
                        titleDb.ref('users/' + uid).update({ title_ghoul_legend: true });
                        if (!window._ghoul_awarded) {
                            window._ghoul_awarded = true; 
                            setTimeout(() => {
                                window.alert("🎉 伝説の称号【僕、は喰種だ】を獲得しました！\nプロフィールから装備できます！");
                            }, 1500); 
                        }
                    }
                    
                    // 第二個稱號：Charge昇格 (何もできないのは、もう嫌なんだ)
                    if (/(チャージ|CHARGE).*?(昇格)/.test(translatedText)) {
                        titleDb.ref('users/' + uid).update({ title_ghoul_charge: true });
                        if (!window._ghoul_charge_awarded) {
                            window._ghoul_charge_awarded = true; 
                            setTimeout(() => {
                                window.alert("🎉 伝説の称号【何もできないのは、もう嫌なんだ】を獲得しました！\nプロフィールから装備できます！");
                            }, 1500); 
                        }
                    }
                }

                // 3. 💩 Lycoris Recoil
                if (isLycoris) {
                    if (earnedBalls >= 30000) {
                        titleDb.ref('users/' + uid).update({ title_lycoris_legend: true });
                        
                        // 👇 新增防重複鎖 + 延遲彈出
                        if (!window._lycoris_awarded) {
                            window._lycoris_awarded = true; // 鎖定，防止同一局彈兩次
                            setTimeout(() => {
                                window.alert("🎉 伝説の称号【ホットでプレミアムうんこ】を獲得しました！\nプロフィールから装備できます！");
                            }, 1500); // 延遲 1.5 秒，等畫面印完晒所有上乗せ先彈
                        }
                    }
                }

                // 4. 🪄 無職転生
                if (isMushoku) {
                    if (isRushEnd || isNormalLoss) {
                        window._mushoku_6000_count = 0;
                    }
                    if (earnedBalls === 6000) {
                        window._mushoku_6000_count = (window._mushoku_6000_count || 0) + 1;
                        if (window._mushoku_6000_count >= 5) {
                            titleDb.ref('users/' + uid).update({ title_mushoku_legend: true });
                            window.alert("🎉 伝説の称号【ロキシーのパンツ御神体】を獲得しました！\nプロフィールから装備できます！");
                        }
                    }
                }
            } catch (error) {
                console.error('[Title interceptor] Error:', error);
            }
        };
    }
}, 2000);

window.toggleTitleChecks = function (mode) {
    window.HallShared.toggleTitleChecks(mode);
};

window.saveTitleSettings = function (uid) {
    window.HallShared.saveTitleSettings(uid)
        .then(saved => { if (saved) { alert("✅ 称号の表示設定を保存しました！"); location.reload(); } });
};