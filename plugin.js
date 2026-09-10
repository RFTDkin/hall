// ==========================================
// パチンコ全能プラグイン V29 (ランキング称号・プロフィール完全対応版)
// ==========================================

const firebaseConfig = window.HallShared.firebaseConfig;

const ADSTERRA_DIRECT_LINK = "https://www.effectivecpmnetwork.com/sczzxy44h?key=37be73e9e8ae708b133564c039a61e63";

window.latest_payout_for_share = 0;
window.latest_rush_for_share = 0;
window.globalUsersData = {};
window.currentOpenProfileUid = null;

// 🌟 將所有稱號特效及 Modal CSS 注入到機台頁面 🌟
const globalPluginStyle = document.createElement('style');
globalPluginStyle.innerHTML = `
    /* 稱號共用 */
    .title-effect { position: relative; display: inline-block; white-space: nowrap; }
    
    /* 虹色コンプリート */
    .effect-rainbow { background: linear-gradient(270deg, #ff0000, #ff7f00, #ffff00, #00ff00, #00e5ff, #c500ff, #ff0000); background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: rainbow-bg 2s linear infinite; font-weight: 900; }
    @keyframes rainbow-bg { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }

/* 2. サーバーの覇者：天上天下 終極霸氣銘牌 */
    .effect-supreme {
        position: relative; isolation: isolate; padding: 6px 20px; color: #fff8d8; border: 1px solid #f6d36c; border-radius: 2px;
        background: linear-gradient(180deg, rgba(92, 55, 4, .94), rgba(30, 16, 0, .96) 48%, rgba(106, 65, 5, .92));
        box-shadow: 0 0 0 2px #281801, 0 0 0 3px rgba(247, 201, 73, .62), 0 0 18px rgba(255, 189, 31, .72), inset 0 1px 0 rgba(255,255,255,.52), inset 0 -10px 16px rgba(0,0,0,.45);
        overflow: visible; font-weight: bold;
        margin-top: 18px; 
        animation: sovereign-main-aura 3.8s ease-in-out infinite;
    }

    .effect-supreme::before {
        content: ''; position: absolute; z-index: -1; top: 50%; left: -22px; right: -22px; height: 1px; transform: translateY(-50%);
        background: linear-gradient(90deg, transparent, #f6d36c 12%, #ffefad 22%, transparent 35%, transparent 65%, #ffefad 78%, #f6d36c 88%, transparent);
        box-shadow: 0 -7px 10px rgba(255, 196, 45, .24), 0 7px 10px rgba(255, 196, 45, .24);
    }

    .effect-supreme::after {
        content: '天上天下';
        position: absolute;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        font-family: "Noto Serif JP", "Yu Mincho", "MS PMincho", "Hiragino Mincho Pro", serif; 
        font-size: 14px;
        font-weight: 900;
        letter-spacing: 5px;
        text-indent: 5px;
        background: linear-gradient(110deg, #ffd700 0%, #ffea00 15%, #ffffff 25%, #ffb300 35%, #ffd700 50%, #ffea00 65%, #ffffff 75%, #ffb300 85%, #ffd700 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 4px #fff, 0 0 10px #ffea00, 0 0 18px #ff9100;
        filter: drop-shadow(0 1px 0 #8a6906) drop-shadow(0 2px 0 #5e4702) drop-shadow(0 3px 2px rgba(0,0,0,0.9));
        animation: supreme-glitter-text 2s linear infinite;
        z-index: 10;
    }

    @keyframes supreme-glitter-text {
        0% { background-position: 0% 50%; filter: drop-shadow(0 1px 0 #8a6906) drop-shadow(0 2px 0 #5e4702) drop-shadow(0 3px 2px rgba(0,0,0,0.9)) drop-shadow(0 0 5px rgba(255,234,0,0.3)); }
        50% { filter: drop-shadow(0 1px 0 #8a6906) drop-shadow(0 2px 0 #5e4702) drop-shadow(0 3px 2px rgba(0,0,0,0.9)) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 25px rgba(255,215,0,0.8)); }
        100% { background-position: -200% 50%; filter: drop-shadow(0 1px 0 #8a6906) drop-shadow(0 2px 0 #5e4702) drop-shadow(0 3px 2px rgba(0,0,0,0.9)) drop-shadow(0 0 5px rgba(255,234,0,0.3)); }
    }

    @keyframes sovereign-main-aura {
        0%, 100% { box-shadow: 0 0 0 2px #281801, 0 0 0 3px rgba(247, 201, 73, .62), 0 0 18px rgba(255, 189, 31, .72), inset 0 1px 0 rgba(255,255,255,.52), inset 0 -10px 16px rgba(0,0,0,.45); }
        50% { box-shadow: 0 0 0 2px #281801, 0 0 0 3px rgba(247, 201, 73, .9), 0 0 35px rgba(255, 23, 68, .8), inset 0 1px 0 rgba(255,255,255,.7), inset 0 -10px 16px rgba(0,0,0,.6); transform: scale(1.02); }
    }
    /* 破産王 */
    .effect-bankrupt { color: #dd8a48; letter-spacing: .13em; text-shadow: 1px 1px 0 #4b1d0b, 3px 4px 0 #090604, 0 0 5px rgba(157, 54, 15, .52); background: linear-gradient(100deg, #7d2c12 0%, #e89450 26%, #ffbd73 44%, #9d3717 52%, #e48743 66%, #64200e 100%); background-size: 180% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: .55px #361207; animation: bankrupt-fade 4.8s ease-in-out infinite; font-weight: 900; }
    .effect-bankrupt::after { content: ''; position: absolute; inset: -10% 1%; pointer-events: none; opacity: .96; background: linear-gradient(110deg, transparent 0 20%, #260b05 20.5% 23%, transparent 23.5% 100%), linear-gradient(72deg, transparent 0 39%, #3a1006 39.5% 42.5%, transparent 43% 100%), linear-gradient(118deg, transparent 0 58%, #260b05 58.5% 61%, transparent 61.5% 100%), linear-gradient(66deg, transparent 0 76%, #431307 76.5% 79%, transparent 79.5% 100%); filter: drop-shadow(1px 0 0 rgba(255, 194, 113, .34)); }
    @keyframes bankrupt-fade { 0%, 100% { opacity: .82; background-position: 0% 50%; } 48% { opacity: 1; background-position: 100% 50%; } }

    /* 単発地獄 */
    .effect-hell { color: #e3d6d8; text-shadow: 0 0 2px #fff, 2px 0 7px rgba(210, 14, 45, .78), -2px 0 7px rgba(85, 0, 12, .9); animation: hell-echo 3.2s steps(1, end) infinite; font-weight: bold; }
    .effect-hell::before, .effect-hell::after { content: attr(data-text); position: absolute; inset: 0; pointer-events: none; opacity: 0; }
    .effect-hell::before { color: #ff214e; transform: translateX(-2px); animation: hell-ghost 3.2s steps(1, end) infinite; }
    .effect-hell::after { color: #580012; transform: translateX(3px); animation: hell-ghost 3.2s steps(1, end) .08s infinite; }
    @keyframes hell-echo { 0%, 72%, 100% { transform: translateX(0); } 74% { transform: translateX(-2px); } 76% { transform: translateX(2px); } 78% { transform: translateX(-1px); } }
    @keyframes hell-ghost { 0%, 72%, 100% { opacity: 0; } 74%, 78% { opacity: .72; } }

    /* 神の引き */
    .effect-godpull { color: #f6fdff; letter-spacing: .1em; text-shadow: 0 0 2px #fff, 0 0 7px #9cefff, 0 0 18px #397cff, 0 0 30px rgba(132, 78, 255, .58); animation: god-pulse 2.8s ease-in-out infinite; font-weight: bold; }
    .effect-godpull::before { content: ''; position: absolute; z-index: -1; inset: -8px -13px; border: 1px solid rgba(145, 226, 255, .68); border-radius: 50%; box-shadow: 0 0 11px rgba(65, 158, 255, .58), inset 0 0 12px rgba(129, 87, 255, .27); opacity: .25; animation: miracle-ring 2.8s ease-out infinite; }
    .effect-godpull::after { content: '✦'; position: absolute; z-index: 1; right: -9px; top: -11px; color: #e9fdff; font-size: 10px; text-shadow: 0 0 7px #45c9ff, 0 0 13px #7d5cff; animation: miracle-star 2.8s ease-in-out infinite; }
    @keyframes god-pulse { 0%, 100% { filter: brightness(1); } 48% { filter: brightness(1.48); } }
    @keyframes miracle-ring { 0% { opacity: .78; transform: scale(.42); } 60%, 100% { opacity: 0; transform: scale(1.22); } }
    @keyframes miracle-star { 0%, 42%, 100% { opacity: .18; transform: scale(.65) rotate(0); } 52% { opacity: 1; transform: scale(1.22) rotate(28deg); } }

    /* 駆け抜け王 */
    .effect-runthrough { color: #fff0c6; text-shadow: -4px 0 0 rgba(255, 61, 19, .22), -9px 0 8px rgba(255, 61, 19, .36), 0 0 8px rgba(255, 178, 64, .75); background: linear-gradient(90deg, #ff431e, #ffbc4b 32%, #fff7d3 48%, #ff7a28 64%, #b51f14); background-size: 190% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: runthrough 1.9s ease-in-out infinite; font-weight: bold; }
    .effect-runthrough::after { content: ''; position: absolute; right: calc(100% + 5px); top: 49%; width: 30px; height: 1px; background: linear-gradient(90deg, transparent, #ff4c24, #ffd169); box-shadow: 0 -4px 7px rgba(255, 84, 30, .7), 0 4px 7px rgba(255, 84, 30, .45); transform-origin: right center; animation: speed-trail 1.9s ease-in-out infinite; }
    @keyframes runthrough { 0%, 100% { background-position: 0% 50%; } 48% { background-position: 100% 50%; } }
    @keyframes speed-trail { 0%, 100% { opacity: .16; transform: scaleX(.35); } 48% { opacity: 1; transform: scaleX(1); } }

    /* 一撃王 (Cyberpunk) */
    .effect-ichigeki { position: relative; display: inline-block; white-space: nowrap; color: #ffffff; font-weight: 900; letter-spacing: .08em; text-shadow: 0 0 5px #d500f9, 0 0 12px #aa00ff, 2px 2px 0px #311b92, -2px -2px 0px #00e5ff; animation: ichigeki-smash 1.5s infinite; isolation: isolate; }
    .effect-ichigeki::after { content: ''; position: absolute; z-index: -1; top: 50%; left: -15%; right: -15%; height: 50%; transform: translateY(-50%) skewX(-45deg); background: linear-gradient(90deg, transparent, rgba(213, 0, 249, 0.7), #00e5ff, rgba(213, 0, 249, 0.7), transparent); filter: blur(2px); animation: ichigeki-slash 1.5s infinite; }
    @keyframes ichigeki-smash { 0%, 100% { transform: scale(1); text-shadow: 0 0 5px #d500f9, 0 0 12px #aa00ff, 2px 2px 0px #311b92, -2px -2px 0px #00e5ff; } 10% { transform: scale(1.08); text-shadow: 0 0 10px #ffffff, 0 0 20px #00e5ff, 0 0 30px #d500f9, 3px 3px 0px #311b92, -3px -3px 0px #00e5ff; } 25% { transform: scale(1); text-shadow: 0 0 5px #d500f9, 0 0 12px #aa00ff, 2px 2px 0px #311b92, -2px -2px 0px #00e5ff; } }
    @keyframes ichigeki-slash { 0%, 100% { opacity: 0.2; transform: translateY(-50%) skewX(-45deg) scaleX(0.8); } 10% { opacity: 1; transform: translateY(-50%) skewX(-45deg) scaleX(1.1); filter: blur(4px) brightness(1.5); } 25% { opacity: 0.4; transform: translateY(-50%) skewX(-45deg) scaleX(0.9); filter: blur(2px); } }

/* 全稱號：終極形態 */
    .effect-legend { 
        isolation: isolate; padding: 7px 21px; border-radius: 3px; border: 1px solid #ffe69a; 
        background: linear-gradient(180deg, rgba(81, 42, 3, .95), rgba(15, 18, 40, .96), rgba(72, 28, 78, .94)); 
        color: #fff; background-clip: padding-box; text-shadow: 0 0 3px #fff, 0 0 9px #65eaff, 0 0 19px #e975ff; 
        box-shadow: 0 0 0 2px #211300, 0 0 0 3px rgba(255, 205, 76, .68), 0 0 25px rgba(123, 193, 255, .58), inset 0 1px 0 rgba(255,255,255,.62); 
        overflow: visible; font-weight: bold; margin-top: 18px; 
    }
    .effect-legend::before { content: ''; position: absolute; z-index: -1; inset: -13px -28px; border: 1px solid rgba(152, 230, 255, .62); border-radius: 50%; box-shadow: 0 0 19px rgba(112, 178, 255, .54), inset 0 0 18px rgba(241, 126, 255, .2); animation: legend-aura 3.6s ease-in-out infinite; }
    .effect-legend::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(108deg, transparent 35%, rgba(255,255,255,.8) 50%, transparent 65%); transform: translateX(-140%); animation: legend-sweep 3.6s ease-in-out infinite; }

    /* 🌟 終極形態專屬的「天上天下」文字 🌟 */
    .legend-supreme-text {
        position: absolute; top: -18px; left: 50%; transform: translateX(-50%); white-space: nowrap;
        font-family: "Noto Serif JP", "Yu Mincho", "MS PMincho", "Hiragino Mincho Pro", serif; 
        font-size: 14px; font-weight: 900; letter-spacing: 5px; text-indent: 5px;
        background: linear-gradient(110deg, #ffd700 0%, #ffea00 15%, #ffffff 25%, #ffb300 35%, #ffd700 50%, #ffea00 65%, #ffffff 75%, #ffb300 85%, #ffd700 100%);
        background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        text-shadow: 0 0 4px #fff, 0 0 10px #ffea00, 0 0 18px #ff9100;
        filter: drop-shadow(0 1px 0 #8a6906) drop-shadow(0 2px 0 #5e4702) drop-shadow(0 3px 2px rgba(0,0,0,0.9));
        animation: supreme-glitter-text 2s linear infinite; z-index: 10;
    }
    
    @keyframes legend-sweep { 0%, 53% { transform: translateX(-140%); } 78%, 100% { transform: translateX(140%); } }

    /* 🌟 新增：解決機台內歷代排行榜長名字出界問題 🌟 */
    table.data-lamp td:nth-child(2) { 
        max-width: 140px; 
        word-wrap: break-word; 
        word-break: break-all; 
        white-space: normal !important; 
        line-height: 1.4;
    }
    table.data-lamp td:nth-child(2) .title-effect {
        white-space: normal !important;
    }
    /* Modal & UI */
    @media screen and (max-width: 768px) {
        #plugin-ui-container { position: relative !important; top: 0 !important; right: 0 !important; align-items: center !important; width: 100% !important; margin-bottom: 20px !important; flex-direction: column !important; }
        #plugin-ui-container > div { width: 90% !important; max-width: none !important; }
    }
    .profile-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; justify-content: center; align-items: center; animation: fadeIn 0.2s; }
    .profile-card { background: #111; border: 2px solid #444; border-radius: 12px; padding: 25px; width: 90%; max-width: 350px; text-align: center; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.8); border-top: 5px solid #ff1744; }
    .profile-card h3 { margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px; color: #ccc; font-size: 1em; }
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
    #p-modal-name, #ui-username { word-wrap: break-word; word-break: break-all; white-space: normal; line-height: 1.3; }
    #p-modal-name .title-effect, #ui-username .title-effect { white-space: normal !important; }
`;
document.head.appendChild(globalPluginStyle);

// 🌟 全局獲取玩家名稱與稱號 HTML (包含點擊事件)
window.getPluginPlayerNameHtml = function(userObj, isRank1, uid = null, disableClick = false) {
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

// 🌟 全局打開玩家 Profile Modal (加入防打斷更新機制)
window.showPluginProfile = function(uid) {
    window.currentOpenProfileUid = uid;
    if (!window.globalUsersData || !window.globalUsersData[uid]) return;
    
    let u = window.globalUsersData[uid];
    let topUid = null;
    let richArr = Object.keys(window.globalUsersData)
        .map(k => ({uid: k, balance: window.globalUsersData[k].balance || 0}))
        .filter(u => u.balance >= 0)
        .sort((a,b) => b.balance - a.balance);
    if (richArr.length > 0) topUid = richArr[0].uid;

    let mockUserObj = {
        name: u.username,
        balance: u.balance,
        has_completed: u.has_completed,
        title_hell: u.title_hell,
        title_godpull: u.title_godpull,
        title_runthrough: u.title_runthrough,
        title_ichigeki: u.title_ichigeki,
        equipped_title: u.equipped_title, // 🌟 補返裝備設定落去
        isSelf: firebase.auth().currentUser && firebase.auth().currentUser.uid === uid
    };

    // 🌟 核心修復：傳入 uid 代替 null，等系統可以讀到裝備狀態
    let nameHtml = window.getPluginPlayerNameHtml(mockUserObj, topUid === uid, uid, true);
    let nameEl = document.getElementById('p-modal-name');
    if (nameEl.innerHTML !== nameHtml) nameEl.innerHTML = nameHtml;

    let balText = Math.round(u.balance || 0).toLocaleString();
    let balEl = document.getElementById('p-modal-balance');
    if (balEl.innerText !== balText) balEl.innerText = balText;
    
    let hC = u.single_hell_count || 0;
    let rC = u.runthrough_count || 0;
    let iC = u.ichigeki_count || 0;

    let hText = `${hC} / 10`;
    let hTextEl = document.getElementById('p-modal-hell-text');
    if (hTextEl.innerText !== hText) hTextEl.innerText = hText;
    let hFill = `${Math.min((hC/10)*100, 100)}%`;
    let hFillEl = document.getElementById('p-modal-hell-fill');
    if (hFillEl.style.width !== hFill) hFillEl.style.width = hFill;

    let rText = `${rC} / 7`;
    let rTextEl = document.getElementById('p-modal-run-text');
    if (rTextEl.innerText !== rText) rTextEl.innerText = rText;
    let rFill = `${Math.min((rC/7)*100, 100)}%`;
    let rFillEl = document.getElementById('p-modal-run-fill');
    if (rFillEl.style.width !== rFill) rFillEl.style.width = rFill;

    let iText = `${iC} / 10`;
    let iTextEl = document.getElementById('p-modal-ichi-text');
    if (iTextEl.innerText !== iText) iTextEl.innerText = iText;
    let iFill = `${Math.min((iC/10)*100, 100)}%`;
    let iFillEl = document.getElementById('p-modal-ichi-fill');
    if (iFillEl.style.width !== iFill) iFillEl.style.width = iFill;

    let bHtml = '';
    bHtml += `<div class="badge ${u.has_completed ? 'active' : ''}">🌈 コンプリート</div>`;
    bHtml += `<div class="badge ${u.balance <= -10000000 ? 'active' : ''}">💀 破産王</div>`;
    bHtml += `<div class="badge ${u.title_godpull ? 'active' : ''}">✨ 神の引き</div>`;
    bHtml += `<div class="badge ${u.title_hell ? 'active' : ''}">怨 単発地獄</div>`;
    bHtml += `<div class="badge ${u.title_runthrough ? 'active' : ''}">⚡ 駆け抜け王</div>`;
    bHtml += `<div class="badge ${u.title_ichigeki ? 'active' : ''}">💥 一撃王</div>`;
    
    let badgesEl = document.getElementById('p-modal-badges');
    if (badgesEl.innerHTML !== bHtml) badgesEl.innerHTML = bHtml;

    document.getElementById('plugin-profile-modal').style.display = 'flex';

// 🌟 注入多重稱號裝備選單 (加咗 Render Key 防止刷新彈回)
    let selectorEl = document.getElementById('p-modal-title-selector');
    if (firebase.auth().currentUser && firebase.auth().currentUser.uid === uid) {
        let eq = u.equipped_title || "auto";
        let renderKey = `${eq}-${u.has_completed}-${u.title_godpull}-${u.title_runthrough}-${u.title_hell}-${u.title_ichigeki}`;

        if (selectorEl.getAttribute('data-render-key') !== renderKey) {
            let isAuto = eq === "auto";
            let isNone = eq === "none";
            let isCustom = !isAuto && !isNone;
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
                            ${u.title_ichigeki ? `<label><input type="checkbox" class="t-check" value="ichigeki" ${eq.includes('ichigeki') ? 'checked' : ''}> 一撃王</label><br>` : ''}
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

        window.HallShared.settleIchigekiAwards(db).catch(error => console.error('[Ichigeki settlement] 日誌讀取失敗', error));

            const userRef = db.ref('users/' + uid);
            // ... 下面維持原本的 userRef.get() 邏輯 ...

            userRef.get().then((snapshot) => {
                if (!snapshot.exists()) { auth.signOut(); window.location.href = "login.html"; return; }
                let userData = snapshot.val();
                let currentUserName = userData.username || "Guest";
                const todayStr = new Date().toDateString();

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
        const exchangeRate = 3.57;
        let currentWallet = userData.balance;

        let currentMaxHamari = 0;
        db.ref('server_records/max_hamari').on('value', (snap) => {
            if (snap.exists()) {
                currentMaxHamari = parseInt(snap.val().spins) || 0;
            }
        });

        // 注入 Profile Modal HTML
        const modalHtml = document.createElement('div');
        modalHtml.id = 'plugin-profile-modal';
        modalHtml.className = 'profile-modal-overlay';
        modalHtml.onclick = function(e) { if(e.target===this) { this.style.display='none'; window.currentOpenProfileUid=null; } };
        modalHtml.innerHTML = `
            <div class="profile-card">
                <button class="close-btn" onclick="document.getElementById('plugin-profile-modal').style.display='none'; window.currentOpenProfileUid=null;">✖</button>
                <h3>プレイヤー情報</h3>
                <div id="p-modal-name" style="font-size: 1.5em; margin: 15px 0; color: #fff;">名前</div>
                <div style="font-size: 1.2em; color: #00e5ff; font-weight: bold; margin-bottom: 10px;"><span id="p-modal-balance">0</span> 円</div>
                <div class="prog-container"><div class="prog-label"><span>💀 単発地獄 (10回連続)</span><span id="p-modal-hell-text">0 / 10</span></div><div class="prog-bar-bg"><div id="p-modal-hell-fill" class="prog-bar-fill fill-hell" style="width: 0%;"></div></div></div>
                <div class="prog-container"><div class="prog-label"><span>⚡ 駆け抜け王 (7回連続)</span><span id="p-modal-run-text">0 / 7</span></div><div class="prog-bar-bg"><div id="p-modal-run-fill" class="prog-bar-fill fill-run" style="width: 0%;"></div></div></div>
                <div class="prog-container"><div class="prog-label"><span>💥 一撃王 (本日の一撃王 10回)</span><span id="p-modal-ichi-text">0 / 10</span></div><div class="prog-bar-bg"><div id="p-modal-ichi-fill" class="prog-bar-fill fill-ichi" style="width: 0%;"></div></div></div>
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
            maxSpinsEl.innerText = userData.max_allowed_spins;
        }
        renderWallet();

        let originalTitle = document.title;
        let machineName = originalTitle.replace(/【無料】/g, '').replace(/ \| パチンコシミュレーター/g, '').replace(/柏青哥模擬器 \(/g, '').replace('パチンコシミュレーター (', '').replace(/\)/g, '').trim() || "Unknown";
        document.title = originalTitle.replace("柏青哥模擬器", "パチンコシミュレーター");

        let pageText = originalTitle + " " + document.body.innerText;
        let spinCost = 1000 / 17; // 預設：1000円 = 17轉
        
        // 根據 stats.html 參數設定的例外機台
        if (pageText.includes("東京喰種 999ver")) spinCost = 1000 / 32;
        else if (pageText.includes("実力至上主義")) spinCost = 1000 / 25;
        else if (pageText.includes("ソードアート・オンライン")) spinCost = 1000 / 20;
        else if (pageText.includes("タクトオーパス")) spinCost = 1000 / 41;
        else if (pageText.includes("魔女と野獣")) spinCost = 1000 / 28;
        else if (pageText.includes("ユニコーン2")) spinCost = 1000 / 30;
        else if (pageText.includes("ギンパラ")) spinCost = 1000 / 22;

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

            // 🌟 1. 先計算富豪第一名 (為了判斷是否有天上天下稱號)
            let topUid = null;
            let richArr = Object.keys(window.globalUsersData)
                .map(k => ({uid: k, balance: window.globalUsersData[k].balance || 0}))
                .filter(u => u.balance >= 0)
                .sort((a,b) => b.balance - a.balance);
            if (richArr.length > 0) topUid = richArr[0].uid;

            // 🌟 2. 搬到這裡！優先更新右上角自己的稱號顯示 (保護動畫，不受排行榜為空影響)
            let currentUserObj = window.globalUsersData[uid];
            if (currentUserObj) {
                let mockSelf = {
                    name: currentUserObj.username, balance: currentUserObj.balance,
                    has_completed: currentUserObj.has_completed, title_hell: currentUserObj.title_hell,
                    title_godpull: currentUserObj.title_godpull, title_runthrough: currentUserObj.title_runthrough,
                    title_ichigeki: currentUserObj.title_ichigeki, isSelf: false 
                };
                let selfHtml = window.getPluginPlayerNameHtml(mockSelf, topUid === uid, uid, false);
                let uiUserEl = document.getElementById("ui-username");
                if (uiUserEl && uiUserEl.innerHTML !== selfHtml) {
                    uiUserEl.innerHTML = selfHtml;
                }
            }

            // 🌟 3. 現在才判斷排行榜是否為空，如果是空就 return
            if (currentMachineRankings.length === 0) {
                if (tbody.innerHTML !== `<tr><td colspan="4" class="empty-row">一万発達成者なし</td></tr>`) {
                    tbody.innerHTML = `<tr><td colspan="4" class="empty-row">一万発達成者なし</td></tr>`;
                }
                return;
            }

            // 🌟 4. 核心修復：比較行數，如果不對才重建表格框架
            let rows = tbody.children;
            if (rows.length !== currentMachineRankings.length || (rows.length > 0 && rows[0].cells.length === 1)) {
                let html = "";
                currentMachineRankings.forEach(() => {
                    html += `<tr><td></td><td></td><td></td><td></td></tr>`;
                });
                tbody.innerHTML = html;
                rows = tbody.children;
            }

            // 🌟 5. 進行差異更新，只改動有變化的格子
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
                            title_ichigeki: data.title_ichigeki || false, isSelf: (auth.currentUser && auth.currentUser.uid === u)
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

// 監聽全局玩家數據，一旦變動就重繪排行榜與 Modal
        db.ref('users').on('value', snap => {
            let users = snap.val() || {};
            
            // 🌟 自動補發遺漏稱號邏輯 (確保各機台頁面也能自動修復舊數據) 🌟
            for (let uid in users) {
                let u = users[uid];
                let needsUpdate = false;
                let updates = {};

                // 檢查單發地獄 (10次)
                if ((u.single_hell_count || 0) >= 10 && !u.title_hell) {
                    updates.title_hell = true;
                    u.title_hell = true; // 即時更新本地數據顯示
                    needsUpdate = true;
                }
                // 檢查駆け抜け王 (7次)
                if ((u.runthrough_count || 0) >= 7 && !u.title_runthrough) {
                    updates.title_runthrough = true;
                    u.title_runthrough = true;
                    needsUpdate = true;
                }
                // 檢查一擊王 (10次)
                if ((u.ichigeki_count || 0) >= 10 && !u.title_ichigeki) {
                    updates.title_ichigeki = true;
                    u.title_ichigeki = true;
                    needsUpdate = true;
                }

                // 如果有發現達標但未有稱號，即時寫入 Firebase
                if (needsUpdate) {
                    db.ref(`users/${uid}`).update(updates);
                }
            }

            window.globalUsersData = users;
            renderMachineRankings();
            if (window.currentOpenProfileUid) window.showPluginProfile(window.currentOpenProfileUid);
        });

        db.ref('machine_rankings/' + machineName).on('value', (snapshot) => {
            currentMachineRankings = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => { currentMachineRankings.push(child.val()); });
                currentMachineRankings.sort((a, b) => b.payout - a.payout);
                currentMachineRankings = currentMachineRankings.slice(0, 10);
            }
            renderMachineRankings();
        });

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
                    const todayDate = new Date();
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
                        const todayDate = new Date();
                        const dateStr = `${todayDate.getMonth() + 1}/${todayDate.getDate()}`;
                        const dateKey = `${todayDate.getFullYear()}_${todayDate.getMonth() + 1}_${todayDate.getDate()}`; // 👈 新增獨立 Key

                        db.ref('machine_rankings/' + machineName).push({ user: currentUserName, payout: lastUI_payout, date: dateStr });
                        
                        // 兼容舊版 Dashboard 顯示
                        db.ref('server_records/daily_best').transaction((curr) => {
                            if (!curr || curr.date !== dateStr || lastUI_payout > curr.payout) {
                                return { uid: uid, user: currentUserName, payout: lastUI_payout, date: dateStr, processed: false };
                            }
                            return;
                        });

                        // 🌟 寫入新版防覆蓋日誌 🌟
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
                    const todayDate = new Date();
                    const dateStr = `${todayDate.getMonth() + 1}/${todayDate.getDate()}`;
                    const dateKey = `${todayDate.getFullYear()}_${todayDate.getMonth() + 1}_${todayDate.getDate()}`; // 👈 新增獨立 Key

                    db.ref('machine_rankings/' + machineName).push({ user: currentUserName, payout: new_payout, date: dateStr });
                    
                    db.ref('server_records/daily_best').transaction((curr) => {
                        if (!curr || curr.date !== dateStr || new_payout > curr.payout) {
                            return { uid: uid, user: currentUserName, payout: new_payout, date: dateStr, processed: false };
                        }
                        return; 
                    });

                    // 🌟 寫入新版防覆蓋日誌 🌟
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
                let compText = payout >= 95000 ? "\n🎉【コンプリート達成！】🎉" : "";
                let text = `【一撃一万発達成！】${compText}\n🎰 機種：${machineName}\n💥 今回の獲得出玉：${payout.toLocaleString()}玉 (${rushCount}連チャン)\n\n今日のヒキは神レベル！？🔥\n#パチンコ #神引き #一万発 #パチンコシミュレーター\n`;
                let url = window.location.href;
                let shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                window.open(shareUrl, '_blank');
            };
            btnContainer.appendChild(shareBtn);

            if (playBtn) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === "attributes" && mutation.attributeName === "disabled") {
                            let sBtn = document.getElementById("btn-share-x");
                            if (!playBtn.disabled) {
                                playBtn.innerText = "▶️ プレイ続行";
                                if (window.latest_payout_for_share >= 10000 && sBtn) sBtn.style.display = "inline-block";
                            } else {
                                if (sBtn) sBtn.style.display = "none";
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
window._lastLoggedSpins = 0; // 🌟 建立獨立記憶體，死記最新轉數

setTimeout(() => {
    if (typeof window.addLog === "function") {
    const originalAddLog = window.addLog;
    window.addLog = function (text, className = "") {
        // 1. 擋截無用 Log
        if (text.includes("播放") || text.includes("再生") || text.includes("mp4") || text.includes("音效") || text.includes("請稍候")) {
            return;
        }
        
        // 2. 執行翻譯
        let translatedText = text;
        translatedText = translatedText.replace(/STOCK獲得！(\d+)玉 \(剩餘 (\d+)轉\)/g, "STOCK獲得！$1玉 (残り $2回転)");
        translatedText = translatedText.replace(/剩餘 (\d+) 轉/g, "残り $1 回転");
        translatedText = translatedText.replace(/獲得 (\d+) 玉/g, "$1 玉獲得");
        translatedText = translatedText.replace(/大當り！ (\d+)連莊/g, "大当り！ $1連チャン");

        for (let [zh, ja] of Object.entries(dict)) {
            if (translatedText.includes(zh)) translatedText = translatedText.split(zh).join(ja);
        }

        originalAddLog(translatedText, className);

        // 3. 🏆 全自動稱號判定系統 (與翻譯系統同步執行，防止漏單)
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
            // Rush Challenge / CZ / 時短 への突入パターン（本RUSHではない）
            const isRushChallengeEnter = /(チャレンジ|JUDGE|CZ|時短).*?(突入|開始)/.test(translatedText)
                || /(突入|開始).*?(チャレンジ|JUDGE|CZ|時短)/.test(translatedText);
            // 本RUSHへの突入（Rush Challenge・Charge・時短を除く）
            const isRealRushEnter = /(RUSH|IMPACT MODE|BATTLE|LT|右打ち).*?(突入|直行|開始)/.test(translatedText)
                && !isRushChallengeEnter && !isCharge;

            // ✨ 神の引き
            if (isRealRushEnter && actualSpins === 1 && isHeavyMachine) {
                titleDb.ref('users/' + uid).update({ title_godpull: true });
                window._lastLoggedSpins = 0;
            }

            // ⚡ 駆け抜け王 ＆ runthrough_count 管理
            // Rush Challenge 失敗 / 時短失敗 → 単発扱い（runthrough カウント対象外）
            const isRushChallengeFailure = !isCharge
                && /チャレンジ失敗|CZ失敗|JUDGE失敗|時短終了|任務失敗|チャンスタイム終了/.test(translatedText);
            // 本RUSHの終了（Rush Challenge 失敗は除く）
            const isRushEnd = /RUSH\s*終了|IMPACT MODE終了|ST抜け|LT終了|決着.*RUSH終了|BATTLE敗北|バトル敗北|ボールを奪われた.*転落|ST.*スルー.*終了|ST駆け抜け.*終了|魂神の一撃.*失敗|敗北.*転落.*終了|(?:振り分け|退学).*通常へ転落/.test(translatedText)
                && !isRushChallengeFailure;
            const isRunthroughExplicit = /駆け抜け|スルー/.test(translatedText) && !isRushChallengeFailure;

            if (isRushEnd || isRunthroughExplicit) {
                // rushCount === 0 → 本RUSHに入ったが一度も当たらずに終了 → 駆け抜け
                // rushCount >= 1 → 本RUSHで当たりあり → 駆け抜けではない → runthrough_count をリセット
                if (isRunthroughExplicit || rushCount === 0) {
                    titleDb.ref('users/' + uid + '/runthrough_count').transaction(count => {
                        let newCount = (count || 0) + 1;
                        if (newCount >= 7) titleDb.ref('users/' + uid).update({ title_runthrough: true });
                        return newCount;
                    });
                } else {
                    // 本RUSHで当たりあり（駆け抜けではない）→ runthrough_count をリセット
                    titleDb.ref('users/' + uid + '/runthrough_count').set(0);
                }
            }

            // 💀 単発地獄
            // 単発：Rush Challenge 失敗 / 時短失敗 / Charge失敗 / 通常終了（rushCount === 0 のみ）
            // ※単発・Charge はすべて「単機」扱い（単発地獄カウント対象）
            const isNormalLoss = !isRushEnd && !isRunthroughExplicit
                && (isRushChallengeFailure
                    || (isCharge && /失敗|外れ|非突入|通常/.test(translatedText))
                    || (!isCharge && !isRushChallengeEnter
                        && /通常へ戻る|通常終了|通常へ|RUSH非突入/.test(translatedText)
                        && rushCount === 0));
            if (isNormalLoss) {
                titleDb.ref('users/' + uid + '/single_hell_count').transaction(count => {
                    let newCount = (count || 0) + 1;
                    if (newCount >= 10) titleDb.ref('users/' + uid).update({ title_hell: true });
                    return newCount;
                });
            }

            // 🌟 単発地獄カウントリセット
            // 本RUSHに突入した（Rush Challenge ではない）、または連チャン継続中 → リセット
            if (isRealRushEnter || translatedText.includes("継続") || translatedText.includes("連)") || rushCount >= 2) {
                titleDb.ref('users/' + uid + '/single_hell_count').set(0);
            }

        } catch (error) {
            console.error('[Title interceptor] Error:', error);
        }
    };
}
}, 2000);

// 🌟 切換自訂稱號選單顯示/隱藏
window.toggleTitleChecks = function(mode) {
    window.HallShared.toggleTitleChecks(mode);
};

// 🌟 儲存多重稱號設定
window.saveTitleSettings = function(uid) {
    window.HallShared.saveTitleSettings(uid)
    .then(saved => { if (saved) { alert("✅ 称号の表示設定を保存しました！"); location.reload(); } });
};
