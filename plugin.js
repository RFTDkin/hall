// ==========================================
// 柏青哥全能智能外掛系統 V10 (修復排行榜讀取 + 100% 全域日文化)
// ==========================================

// 👇 將呢度換成你嘅 Config 👇
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
// 👆 替換結束 👆

// ==========================================
// 1. 全域中日翻譯字典 (加入剩餘中文字)
// ==========================================
const dict = {
    "柏青哥模擬器": "パチンコシミュレーター",
    "返回主頁": "ホールに戻る",
    "當前轉數": "現在回転数",
    "現在回轉數": "現在回転数",
    "回轉": "回転",
    "本次出玉": "獲得出玉",
    "本次總出玉": "総獲得出玉",
    "累積出玉": "累計出玉",
    "最終出玉": "最終出玉",
    "本次連莊": "連チャン数",
    "連莊數": "連チャン",
    "連莊数": "連チャン",
    "總連莊數": "総連チャン数",
    "前次": "前回",
    "當選回轉數": "初当り回転",
    "當選回轉数": "初当り回転",
    "獲得出玉": "獲得出玉",
    "- 無紀錄 -": "- 履歴なし -",
    "DATA LAMP (最近10次)": "データランプ (直近10回)",
    "紀錄重置": "リセット",
    "遊戲紀錄已重置。": "プレイ履歴をリセットしました。",
    "繼續打玉": "プレイ続行",
    "開始魔法": "遊技開始",
    "開始冒險": "遊技開始",
    "發進 (PLAY)": "遊技開始",
    "LINK START": "遊技開始",
    "等待中...": "待機中...",
    "播放專屬音效": "専用BGM再生",
    "請稍候": "お待ちください",
    "正在播放": "再生中"
};

// 執行介面靜態翻譯
function translateDOM() {
    // 翻譯 body 內嘅文字
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        let text = node.nodeValue;
        let originalText = text;
        for (let [zh, ja] of Object.entries(dict)) {
            if (text.includes(zh)) {
                text = text.replace(new RegExp(zh, 'g'), ja);
            }
        }
        if (text !== originalText) {
            node.nodeValue = text;
        }
    }

    const btnPlay = document.getElementById("btn-play");
    const btnReset = document.getElementById("btn-reset");
    if (btnPlay && btnPlay.innerText.includes("▶️")) btnPlay.innerText = "▶️ 遊技開始";
    if (btnReset) btnReset.innerText = "🔄 リセット";
}

document.addEventListener("DOMContentLoaded", () => {
    
    translateDOM();

    const currentUser = localStorage.getItem("pachinko_current_user");
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const scriptApp = document.createElement('script');
    scriptApp.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
    document.head.appendChild(scriptApp);

    scriptApp.onload = () => {
        const scriptDb = document.createElement('script');
        scriptDb.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js";
        document.head.appendChild(scriptDb);

        scriptDb.onload = () => {
            initPlugin(); 
        };
    };

    function initPlugin() {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();
        const userRef = db.ref('users/' + currentUser);

        userRef.get().then((snapshot) => {
            if (!snapshot.exists()) {
                window.location.href = "login.html";
                return;
            }

            let userData = snapshot.val();
            const todayStr = new Date().toDateString();

            if (userData.last_date !== todayStr) {
                userData.daily_spins = 0;
                userData.last_date = todayStr;
                userRef.update({ daily_spins: 0, last_date: todayStr });
            }

            runMachineLogic(db, userRef, userData);
        });
    }

    function runMachineLogic(db, userRef, userData) {
        const exchangeRate = 3.57; 
        let currentWallet = userData.balance;

        // --- 注入右上角 Header UI ---
        const pluginUI = document.createElement("div");
        pluginUI.style.cssText = "position: fixed; top: 15px; right: 20px; display: flex; flex-direction: column; align-items: flex-end; z-index: 9999; gap: 10px;";
        pluginUI.innerHTML = `
            <a href="index.html" style="background-color: #222; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; border: 1px solid #777; box-shadow: 0 0 10px rgba(0,0,0,0.5);">🏠 ホールに戻る</a>
            
            <div style="background: #111; border: 2px solid #ffca28; color: white; padding: 12px 20px; border-radius: 8px; font-weight: bold; box-shadow: 0 0 15px rgba(255, 202, 40, 0.4); text-align: center; min-width: 160px;">
                👤 <span style="color:#00e5ff;">${currentUser}</span><br>
                💰 所持金<br>
                <span id="global-wallet" style="font-size: 1.4em;">0</span> 円
                <hr style="border: 0; border-top: 1px solid #333; margin: 10px 0;">
                <div style="font-size: 0.9em; color: #fff;">本日の回転数: <br><span id="daily-spins-ui" style="color:#ffeb3b; font-size:1.2em;">${userData.daily_spins}</span> / 4000 回転</div>
            </div>
        `;
        document.body.appendChild(pluginUI);

        const walletEl = document.getElementById("global-wallet");
        const dailySpinsEl = document.getElementById("daily-spins-ui");

        function renderWallet() {
            walletEl.innerText = Math.round(currentWallet).toLocaleString();
            walletEl.style.color = currentWallet >= 0 ? "#00e676" : "#ff5252";
            dailySpinsEl.innerText = userData.daily_spins;
        }
        renderWallet();

        // --- 🌟 關鍵修復：完美還原 V7 讀取機台名邏輯，搵返你嘅 Blue Lock 數據庫！ 🌟 ---
        let originalTitle = document.title;
        let machineName = originalTitle.replace('柏青哥模擬器 (', '').replace(')', '').replace('パチンコシミュレーター (', '').trim() || "Unknown";
        
        // 翻譯 Browser 頂部嘅 Tab 標題
        document.title = originalTitle.replace("柏青哥模擬器", "パチンコシミュレーター");

        let pageText = originalTitle + " " + document.body.innerText;
        let spinCost = 1000 / 17;

        if (pageText.includes("東京喰種 999ver")) spinCost = 1000 / 32;
        else if (pageText.includes("実力至上主義")) spinCost = 1000 / 25;

        // --- 注入「一撃一万発」排行榜 UI ---
        let rightPanel = document.querySelector(".right-panel");
        if (rightPanel) {
            const rankingUI = document.createElement("div");
            rankingUI.className = "data-lamp-container";
            rankingUI.style.marginTop = "20px";
            rankingUI.innerHTML = `
                <h3 class="data-lamp-title" style="color: #ffeb3b; font-size: 1.1em;">🏆 歴代出玉ランキング<br><span style="font-size:0.7em; color:#fff;">(一撃一万発 OVER)</span></h3>
                <table class="data-lamp">
                    <thead>
                        <tr><th>順位</th><th>プレイヤー</th><th>出玉</th><th>日付</th></tr>
                    </thead>
                    <tbody id="machine-ranking-body">
                        <tr><td colspan="4" class="empty-row">データ読込中...</td></tr>
                    </tbody>
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
                    let userColor = rec.user === currentUser ? "#00e5ff" : "#ccc";
                    let tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${rankText}</td>
                        <td style="color:${userColor}; font-weight:bold;">${rec.user}</td>
                        <td style="color:#ff5252; font-weight:bold;">${rec.payout.toLocaleString()}</td>
                        <td style="font-size:0.8em; color:#888;">${rec.date}</td>
                    `;
                    tbody.appendChild(tr);
                });
            });
        }

        function disableMachine() {
            let playBtn = document.getElementById("btn-play");
            if (playBtn) {
                playBtn.disabled = true;
                playBtn.innerText = "⛔ 本日 4000 回転の上限到達";
            }
        }
        setTimeout(() => { if (userData.daily_spins >= 4000) disableMachine(); }, 500);

        // --- 攔截 updateUI 進行扣錢、寫入 Firebase 與萬發判定 ---
        let lastUI_spins = 0;
        let lastUI_payout = 0;

        if (typeof window.updateUI === "function") {
            const originalUpdateUI = window.updateUI;

            window.updateUI = function () {
                originalUpdateUI();

                let spinEl = document.getElementById("ui-spins");
                let payoutEl = document.getElementById("ui-payout");
                if (!spinEl || !payoutEl) return;

                let new_spins = parseInt(spinEl.innerText) || 0;
                let new_payout = parseInt(payoutEl.innerText) || 0;

                let spin_diff = new_spins - lastUI_spins;
                let payout_diff = new_payout - lastUI_payout;

                if (new_payout === 0 && lastUI_payout >= 10000) {
                    const todayDate = new Date();
                    const dateStr = `${todayDate.getMonth() + 1}/${todayDate.getDate()}`;
                    db.ref('machine_rankings/' + machineName).push({
                        user: currentUser,
                        payout: lastUI_payout,
                        date: dateStr
                    });
                }

                if (spin_diff < 0) spin_diff = new_spins;
                if (payout_diff < 0) payout_diff = new_payout;

                let needUpdateCloud = false;

                if (spin_diff > 0) {
                    if (userData.daily_spins >= 4000) {
                        disableMachine();
                        alert("⚠️ お知らせ：本日の上限(4000回転)に達しました！");
                        throw new Error("Daily spin limit reached!");
                    }
                    userData.daily_spins += spin_diff;
                    currentWallet -= (spin_diff * spinCost);
                    needUpdateCloud = true;
                }

                if (payout_diff > 0) {
                    currentWallet += (payout_diff * exchangeRate);
                    needUpdateCloud = true;
                }

                if (needUpdateCloud) {
                    userData.balance = currentWallet;
                    userRef.update({
                        balance: currentWallet,
                        daily_spins: userData.daily_spins
                    });
                }

                renderWallet();
                lastUI_spins = new_spins;
                lastUI_payout = new_payout;

                if (userData.daily_spins >= 4000) disableMachine();
            };
        }

        // ==========================================
        // 注入「影片/音效開關」與「𝕏 分享掣」
        // ==========================================
        const btnContainer = document.querySelector("#btn-reset")?.parentNode;
        if (btnContainer) {
            const toggleDiv = document.createElement("div");
            toggleDiv.style.cssText = "background-color: #111; border: 1px solid #333; padding: 10px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 10px;";
            toggleDiv.innerHTML = `
                <label style="color: #ffca28; font-weight: bold; cursor: pointer;">
                    <input type="checkbox" id="chk-sound" checked style="transform: scale(1.2); margin-right: 5px;"> 📢 音効 / 先バレ
                </label>
                <label style="color: #ffca28; font-weight: bold; cursor: pointer;">
                    <input type="checkbox" id="chk-video" checked style="transform: scale(1.2); margin-right: 5px;"> 🎬 演出動画再生
                </label>
            `;
            btnContainer.parentNode.insertBefore(toggleDiv, btnContainer);

            // 實時強制靜音機制
            setInterval(() => {
                const chkSound = document.getElementById("chk-sound");
                const isMuted = chkSound ? !chkSound.checked : false;
                document.querySelectorAll("audio, video").forEach(media => {
                    media.muted = isMuted;
                });
            }, 500);

            const shareBtn = document.createElement("button");
            shareBtn.id = "btn-share-x";
            shareBtn.innerText = "𝕏 結果をポスト";
            shareBtn.style.cssText = "background-color: #000; color: white; border: 1px solid #555; display: none; margin-left: 5px; box-shadow: 0 0 10px rgba(255,255,255,0.2); cursor: pointer; padding: 12px 25px; font-size: 1.1em; border-radius: 5px; font-weight: bold;";
            
            shareBtn.onclick = () => {
                let payout = document.getElementById("ui-payout").innerText;
                let rushCount = document.getElementById("ui-rush").innerText;
                let text = `【バーチャルパチンコ運試し】\n🎰 機種：${machineName}\n💥 今回の獲得出玉：${payout}玉 (${rushCount}連チャン)\n\n今日のヒキは神レベル！？🔥\n#パチンコ #神引き #パチンコシミュレーター\n`;
                let url = window.location.href; 
                let shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                window.open(shareUrl, '_blank');
            };
            btnContainer.appendChild(shareBtn);

            const playBtn = document.getElementById("btn-play");
            const resetBtn = document.getElementById("btn-reset");

            if (playBtn) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === "attributes" && mutation.attributeName === "disabled") {
                            if (!playBtn.disabled) {
                                let payout = parseInt(document.getElementById("ui-payout").innerText) || 0;
                                if (payout > 0) shareBtn.style.display = "inline-block";
                                playBtn.innerText = "▶️ プレイ続行"; 
                            } else {
                                shareBtn.style.display = "none";
                            }
                        }
                    });
                });
                observer.observe(playBtn, { attributes: true });
            }

            if (resetBtn) {
                resetBtn.addEventListener("click", () => {
                    shareBtn.style.display = "none";
                });
            }
        }
    }
});

// ==========================================
// 終極防卡死攔截器 (Monkey Patching V10)
// ==========================================

const originalPlay = HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play = function() {
    const chkVideo = document.getElementById("chk-video");
    const chkSound = document.getElementById("chk-sound");
    const skipVideo = chkVideo && !chkVideo.checked;
    const skipSound = chkSound && !chkSound.checked;

    if (chkSound && !chkSound.checked) {
        this.muted = true;
    }

    if (skipVideo || skipSound) {
        setTimeout(() => {
            this.dispatchEvent(new Event("ended"));
        }, 10);
        return Promise.resolve();
    }

    return originalPlay.apply(this, arguments);
};

if (typeof window.addLog === "function") {
    const originalAddLog = window.addLog;
    window.addLog = function(text, className = "") {
        const chkVideo = document.getElementById("chk-video");
        const chkSound = document.getElementById("chk-sound");
        const skipVideo = chkVideo && !chkVideo.checked;
        const skipSound = chkSound && !chkSound.checked;
        
        if ((skipVideo || skipSound) && (text.includes("播放") || text.includes("再生") || text.includes("mp4") || text.includes("音效") || text.includes("請稍候"))) {
            
            originalAddLog("⚡ (演出・BGM スキップ設定中)", "color-normal");
            
            const originalSetTimeout = window.setTimeout;
            window.setTimeout = function(callback, ms) {
                if (ms >= 1000) { 
                    return originalSetTimeout(callback, 10);
                }
                return originalSetTimeout(callback, ms);
            };
            
            originalSetTimeout(() => {
                window.setTimeout = originalSetTimeout;
            }, 100);
            
            return; 
        }
        
        let translatedText = text;
        for (let [zh, ja] of Object.entries(dict)) {
            if (translatedText.includes(zh)) {
                translatedText = translatedText.split(zh).join(ja);
            }
        }
        originalAddLog(translatedText, className);
    };
}

setTimeout(() => {
    if (typeof window.playVideoPopupAndWait === "function") {
        const originalPlayVideo = window.playVideoPopupAndWait;
        window.playVideoPopupAndWait = function(mediaElement) {
            const chkVideo = document.getElementById("chk-video");
            const chkSound = document.getElementById("chk-sound");
            if ((chkVideo && !chkVideo.checked) || (chkSound && !chkSound.checked)) {
                return Promise.resolve(); 
            }
            return originalPlayVideo(mediaElement);
        };
    }
}, 100);