// ==========================================
// パチンコ全能プラグイン V27 (4000制限・広告で+4000・最大ハマリ修復版)
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyBfaLasiMg8AWvKvFONPePt-dIZ46x3yus",
    authDomain: "p-hall.firebaseapp.com",
    databaseURL: "https://p-hall-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "p-hall",
    storageBucket: "p-hall.firebasestorage.app",
    messagingSenderId: "656958771527",
    appId: "1:656958771527:web:baee4ad9c5350ee31e3c62",
    measurementId: "G-46M19VQVY2"
};

// ⚠️ 喺度填入你啱啱申請嘅 Adsterra Direct Link 網址！
const ADSTERRA_DIRECT_LINK = "https://www.effectivecpmnetwork.com/sczzxy44h?key=37be73e9e8ae708b133564c039a61e63"; // 👈 記得換做你嘅 Direct Link 網址

window.latest_payout_for_share = 0;
window.latest_rush_for_share = 0;

const rainbowStyle = document.createElement('style');
rainbowStyle.innerHTML = `
    .rainbow-text {
        background: linear-gradient(270deg, #ff0000, #ff7f00, #ffff00, #00ff00, #00e5ff, #c500ff, #ff0000);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: rainbow-bg 2s linear infinite;
        font-weight: 900;
    }
    @keyframes rainbow-bg {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
    }

    @media screen and (max-width: 768px) {
        #plugin-ui-container {
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            align-items: center !important;
            width: 100% !important;
            margin-bottom: 20px !important;
            flex-direction: column !important;
        }
        #plugin-ui-container > div {
            width: 90% !important;
            max-width: none !important;
        }
    }
`;
document.head.appendChild(rainbowStyle);

const originalAlert = window.alert;
window.alert = function(msg) {
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
    "當選回轉数": "初当り回転",  "獲得出玉": "獲得出玉", "- 無紀錄 -": "- 履歴なし -",
    "DATA LAMP (最近10次)": "データランプ (直近10回)", "(最近10次)": "(直近10回)", "最近10次": "直近10回",
    "紀錄重置": "リセット", "遊戲紀錄已重置。": "プレイ履歴をリセットしました。", "繼續打玉": "プレイ続行",
    "開始魔法": "遊技開始", "開始冒險": "遊技開始", "發進 (PLAY)": "遊技開始",
    "LINK START": "遊技開始", "等待中...": "待機中...", "播放專屬音效": "専用BGM再生",
    "請稍候": "お待ちください", "正在播放": "再生中", "開始打玉": "遊技開始", "含初當": "初当たり含む","遊戲開始": "遊技開始"
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
                const todayStr = new Date().toDateString();

                // 🌟 新一日自動重置邏輯：如果日期唔同，就將日常轉數歸零，最大限制設回預設 4000
                if (userData.last_date !== todayStr) {
                    userData.daily_spins = 0;
                    userData.daily_profit = 0; 
                    userData.max_allowed_spins = 4000; // 預設 4000 轉
                    userData.last_date = todayStr;
                    userRef.update({ daily_spins: 0, daily_profit: 0, max_allowed_spins: 4000, last_date: todayStr });
                }

                // 防老舊帳號無 max_allowed_spins 欄位
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

        const pluginUI = document.createElement("div");
        pluginUI.id = "plugin-ui-container";
        pluginUI.style.cssText = "position: fixed; top: 15px; right: 20px; display: flex; flex-direction: column; align-items: flex-end; z-index: 9999; gap: 10px;";
        
        let displayNameHtml = userData.has_completed 
            ? `<span class="rainbow-text">${currentUserName}</span>` 
            : `<span style="color:#00e5ff;">${currentUserName}</span>`;

        pluginUI.innerHTML = `
            <a href="index.html" style="background-color: #222; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; border: 1px solid #777; box-shadow: 0 0 10px rgba(0,0,0,0.5);">🏠 ホールに戻る</a>
            <div style="background: #111; border: 2px solid #ffca28; color: white; padding: 12px 20px; border-radius: 8px; font-weight: bold; box-shadow: 0 0 15px rgba(255, 202, 40, 0.4); text-align: center; min-width: 160px; max-width: 250px;">
                👤 <span id="ui-username">${displayNameHtml}</span><br>
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
        let machineName = originalTitle.replace('柏青哥模擬器 (', '').replace(')', '').replace('パチンコシミュレーター (', '').trim() || "Unknown";
        document.title = originalTitle.replace("柏青哥模擬器", "パチンコシミュレーター");

        let pageText = originalTitle + " " + document.body.innerText;
        let spinCost = 1000 / 17;
        if (pageText.includes("東京喰種 999ver")) spinCost = 1000 / 32;
        else if (pageText.includes("実力至上主義")) spinCost = 1000 / 25;

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

            db.ref('machine_rankings/' + machineName).on('value', (snapshot) => {
                const tbody = document.getElementById("machine-ranking-body");
                tbody.innerHTML = "";
                if (!snapshot.exists()) {
                    tbody.innerHTML = `<tr><td colspan="4" class="empty-row">一万発達成者なし</td></tr>`;
                    return;
                }
                let records = [];
                snapshot.forEach(child => { records.push(child.val()); });
                records.sort((a, b) => b.payout - a.payout);

                records.slice(0, 10).forEach((rec, idx) => {
                    let rankText = (idx === 0) ? "🥇" : (idx === 1) ? "🥈" : (idx === 2) ? "🥉" : (idx + 1);
                    let userColor = rec.user === currentUserName ? "#00e5ff" : "#ccc";
                    let tr = document.createElement("tr");
                    tr.innerHTML = `<td>${rankText}</td><td style="color:${userColor}; font-weight:bold;">${rec.user}</td><td style="color:#ff5252; font-weight:bold;">${rec.payout.toLocaleString()}</td><td style="font-size:0.8em; color:#888;">${rec.date}</td>`;
                    tbody.appendChild(tr);
                });
            });
        }

        // 🌟 核心：爆轉數上限後，顯示「睇廣告解鎖」按鈕
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
                // 1. 新開 Tab 打開 Direct Link 廣告，原網頁完全不會被跳轉破壞！
                window.open(ADSTERRA_DIRECT_LINK, '_blank');

                // 2. 倒數 15 秒防作弊計時器
                let secondsLeft = 15;
                adBtn.innerText = `⏳ 広告確認中 (${secondsLeft}s)...`;
                
                let countdown = setInterval(() => {
                    secondsLeft--;
                    if (secondsLeft > 0) {
                        adBtn.innerText = `⏳ 広告確認中 (${secondsLeft}s)...`;
                    } else {
                        clearInterval(countdown);
                        // 3. 解鎖成功：上限加 4000
                        userData.max_allowed_spins += 4000;
                        userRef.update({ max_allowed_spins: userData.max_allowed_spins });
                        
                        maxSpinsEl.innerText = userData.max_allowed_spins;
                        adBtn.remove();
                        
                        if (playBtn) {
                            playBtn.disabled = false;
                            playBtn.innerText = "▶️ プレイ続行";
                        }
                        window.alert("🎉 認証成功！上限が +4000回転 追加されました！");
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

                let spinRawText = spinEl.innerText.replace(/,/g, '');
                let matchSpins = spinRawText.match(/\d+/);
                let new_spins = matchSpins ? parseInt(matchSpins[0]) : 0;

                let new_payout = parseInt(payoutEl.innerText.replace(/,/g, '')) || 0;
                let new_rush = rushEl ? (parseInt(rushEl.innerText.replace(/,/g, '')) || 0) : 0;

                if (new_spins > 100 && new_spins > currentMaxHamari) {
                    currentMaxHamari = new_spins;
                    const todayDate = new Date();
                    const dateStr = `${todayDate.getMonth() + 1}/${todayDate.getDate()}`;
                    
                    db.ref('server_records/max_hamari').set({
                        user: currentUserName,
                        spins: new_spins,
                        machine: machineName,
                        date: dateStr
                    });
                }

                if (new_payout > window.latest_payout_for_share) {
                    window.latest_payout_for_share = new_payout;
                    window.latest_rush_for_share = new_rush;
                }

                let spin_diff = new_spins - lastUI_spins;
                let payout_diff = new_payout - lastUI_payout;

                if (new_payout === 0) {
                    completeTriggeredThisRush = false; 
                    if (lastUI_payout >= 10000) { 
                        const todayDate = new Date();
                        const dateStr = `${todayDate.getMonth() + 1}/${todayDate.getDate()}`;
                        db.ref('machine_rankings/' + machineName).push({ user: currentUserName, payout: lastUI_payout, date: dateStr });
                    }
                }

                if (spin_diff < 0) spin_diff = new_spins;
                if (payout_diff < 0) payout_diff = new_payout;

                let needUpdateCloud = false;
                let sessionNetProfit = 0;

                if (spin_diff > 0) {
                    // 🌟 嚴格擋截：如果超過動態上限就上鎖
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
                    
                    userRef.update({
                        balance: currentWallet,
                        daily_spins: userData.daily_spins,
                        daily_profit: userData.daily_profit
                    });
                }

                renderWallet();
                lastUI_spins = new_spins;
                lastUI_payout = new_payout;

                if (new_payout >= 95000 && !completeTriggeredThisRush) {
                    completeTriggeredThisRush = true;
                    if (!userData.has_completed) {
                        userData.has_completed = true;
                        userRef.update({ has_completed: true });
                        document.getElementById("ui-username").innerHTML = `<span class="rainbow-text">${currentUserName}</span>`;
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
    window.addLog = function(text, className = "") {
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
HTMLMediaElement.prototype.play = function() {
    this.muted = true;
    setTimeout(() => { this.dispatchEvent(new Event("ended")); }, 10);
    return Promise.resolve();
};

setTimeout(() => {
    if (typeof window.playVideoPopupAndWait === "function") {
        window.playVideoPopupAndWait = function() { return Promise.resolve(); };
    }
}, 100);