// ==========================================
// 柏青哥全能智能外掛系統 V7 (Firebase 雲端版 + 萬發排行榜)
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

document.addEventListener("DOMContentLoaded", () => {

    const currentUser = localStorage.getItem("pachinko_current_user");
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // 1. 動態載入 Firebase Scripts
    const scriptApp = document.createElement('script');
    scriptApp.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
    document.head.appendChild(scriptApp);

    scriptApp.onload = () => {
        const scriptDb = document.createElement('script');
        scriptDb.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js";
        document.head.appendChild(scriptDb);

        scriptDb.onload = () => {
            initPlugin(); // Firebase 載入完成，啟動外掛
        };
    };

    function initPlugin() {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();
        const userRef = db.ref('users/' + currentUser);

        // 提取雲端數據
        userRef.get().then((snapshot) => {
            if (!snapshot.exists()) {
                window.location.href = "login.html";
                return;
            }

            let userData = snapshot.val();
            const todayStr = new Date().toDateString();

            // 每日限額重置
            if (userData.last_date !== todayStr) {
                userData.daily_spins = 0;
                userData.last_date = todayStr;
                userRef.update({ daily_spins: 0, last_date: todayStr });
            }

            runMachineLogic(db, userRef, userData);
        });
    }

    function runMachineLogic(db, userRef, userData) {
        const exchangeRate = 3.57; // 固定 28玉交換
        let currentWallet = userData.balance;

        // --- 2. 注入右上角 Header UI ---
        const pluginUI = document.createElement("div");
        pluginUI.style.cssText = "position: fixed; top: 15px; right: 20px; display: flex; flex-direction: column; align-items: flex-end; z-index: 9999; gap: 10px;";
        pluginUI.innerHTML = `
            <a href="index.html" style="background-color: #222; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; border: 1px solid #777; box-shadow: 0 0 10px rgba(0,0,0,0.5);">🏠 返回主頁</a>
            
            <div style="background: #111; border: 2px solid #ffca28; color: white; padding: 12px 20px; border-radius: 8px; font-weight: bold; box-shadow: 0 0 15px rgba(255, 202, 40, 0.4); text-align: center; min-width: 160px;">
                👤 <span style="color:#00e5ff;">${currentUser}</span><br>
                💰 擁有金錢<br>
                <span id="global-wallet" style="font-size: 1.4em;">0</span> 円
                <hr style="border: 0; border-top: 1px solid #333; margin: 10px 0;">
                <div style="font-size: 0.9em; color: #fff;">今日已打: <br><span id="daily-spins-ui" style="color:#ffeb3b; font-size:1.2em;">${userData.daily_spins}</span> / 4000 轉</div>
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

        // --- 3. 智能判斷機台資訊與回轉成本 ---
        let pageText = document.title + " " + document.body.innerText;
        let machineName = document.title.replace('柏青哥模擬器 (', '').replace(')', '').trim() || "Unknown";
        let spinCost = 1000 / 17;

        if (pageText.includes("東京喰種 999ver")) spinCost = 1000 / 32;
        else if (pageText.includes("実力至上主義")) spinCost = 1000 / 25;

        // --- 4. 智能控制音效 ---
        if (!pageText.includes("ブルーロック") && !pageText.includes("DMDP") && !pageText.includes("もののがたり")) {
            let vid = document.getElementById("jackpot-media");
            if (vid) vid.remove();
            if (typeof game !== 'undefined' && typeof game.check_and_play_media === "function") {
                game.check_and_play_media = function () { };
            }
        }

        // --- 5. 注入「一撃一万発」排行榜 UI (只限機台頁面) ---
        let rightPanel = document.querySelector(".right-panel");
        if (rightPanel) {
            const rankingUI = document.createElement("div");
            rankingUI.className = "data-lamp-container";
            rankingUI.style.marginTop = "20px";
            rankingUI.innerHTML = `
                <h3 class="data-lamp-title" style="color: #ffeb3b; font-size: 1.1em;">🏆 歷代出玉排行榜<br><span style="font-size:0.7em; color:#fff;">(一撃一万発 OVER)</span></h3>
                <table class="data-lamp">
                    <thead>
                        <tr><th>名次</th><th>玩家</th><th>出玉</th><th>日期</th></tr>
                    </thead>
                    <tbody id="machine-ranking-body">
                        <tr><td colspan="4" class="empty-row">讀取數據中...</td></tr>
                    </tbody>
                </table>
            `;
            rightPanel.appendChild(rankingUI);

            // 實時讀取該機台的萬發紀錄
            db.ref('machine_rankings/' + machineName).on('value', (snapshot) => {
                const tbody = document.getElementById("machine-ranking-body");
                tbody.innerHTML = "";
                if (!snapshot.exists()) {
                    tbody.innerHTML = `<tr><td colspan="4" class="empty-row">暫無破萬發紀錄</td></tr>`;
                    return;
                }

                let records = [];
                snapshot.forEach(child => { records.push(child.val()); });

                // 按出玉由高至低排序
                records.sort((a, b) => b.payout - a.payout);

                // 顯示 Top 10
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

        // --- 6. 防呆機制 ---
        function disableMachine() {
            let playBtn = document.getElementById("btn-play");
            if (playBtn) {
                playBtn.disabled = true;
                playBtn.innerText = "⛔ 今日 4000 轉已滿";
            }
        }
        setTimeout(() => { if (userData.daily_spins >= 4000) disableMachine(); }, 500);

        // --- 7. 攔截 updateUI 進行扣錢、寫入 Firebase 與萬發判定 ---
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

                // 【核心突破】：偵測 RUSH 完結 / 歸零
                if (new_payout === 0 && lastUI_payout >= 10000) {
                    // 如果歸零前嘅出玉超過一萬，即刻寫入專屬排行榜資料庫
                    const todayDate = new Date();
                    const dateStr = `${todayDate.getMonth() + 1}/${todayDate.getDate()}`; // 格式: 6/14[cite: 1]

                    db.ref('machine_rankings/' + machineName).push({
                        user: currentUser,
                        payout: lastUI_payout,
                        date: dateStr
                    });
                }

                if (spin_diff < 0) spin_diff = new_spins;
                if (payout_diff < 0) payout_diff = new_payout;

                let needUpdateCloud = false;

                // 處理轉數扣錢
                if (spin_diff > 0) {
                    if (userData.daily_spins >= 4000) {
                        disableMachine();
                        alert("⚠️ 溫馨提示：你今日嘅 4000 轉限額已經打爆咗！");
                        throw new Error("Daily spin limit reached!");
                    }
                    userData.daily_spins += spin_diff;
                    currentWallet -= (spin_diff * spinCost);
                    needUpdateCloud = true;
                }

                // 處理出玉加錢
                if (payout_diff > 0) {
                    currentWallet += (payout_diff * exchangeRate);
                    needUpdateCloud = true;
                }

                // 上傳至 Firebase
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
    }
});