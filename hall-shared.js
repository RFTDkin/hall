/* Shared hall rules.
 * Keep cross-page title logic here so the lobby and every machine use one source of truth.
 */
(function () {
    'use strict';

    const firebaseConfig = {
        apiKey: "AIzaSyBTEHb2bUZZVLu_zMeBNt7mA_68pQJKRUw",
        authDomain: "p-hall-v2.firebaseapp.com",
        databaseURL: "https://p-hall-v2-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "p-hall-v2",
        storageBucket: "p-hall-v2.firebasestorage.app",
        messagingSenderId: "39092458875",
        appId: "1:39092458875:web:a82f8a48b3509429d759de"
    };

    function getTitleHtml(userObj, options) {
        const opts = options || {};
        const name = userObj.name || "Unknown";
        const isComplete = !!userObj.has_completed;
        const isBankrupt = userObj.balance <= -10000000;
        const isHell = !!userObj.title_hell;
        const isGod = !!userObj.title_godpull;
        const isRunthrough = !!userObj.title_runthrough;
        const isIchigeki = !!userObj.is_vip; 
        // 🌟 新增 4 大機種傳說稱號
        const isBl = !!userObj.title_bl_legend;
        const isGhoul = !!userObj.title_ghoul_legend;
        const isGhoulCharge = !!userObj.title_ghoul_charge;
        const isLycoris = !!userObj.title_lycoris_legend;
        const isMushoku = !!userObj.title_mushoku_legend;

        const isSupreme = isComplete && !!opts.isRank1;
        const isLegend = isSupreme && isBankrupt && isHell && isGod && isRunthrough && isIchigeki;
        const display = userObj.isSelf && opts.showYouLabel ? `${name} (あなた)` : name;
        const eq = opts.equippedTitle || "auto";
        const baseColor = userObj.isSelf ? '#00e5ff' : '#fff';
        let html = display;

        // 🌟 終極形態 HTML (加入血輪眼、底褲、足球、彩色屎、彼岸花)
        const legendHtml = `<span class="title-effect effect-legend"><span class="legend-ghoul-eye" aria-hidden="true"></span><span class="legend-mushoku-pantsu" aria-hidden="true"></span><span class="legend-supreme-text">天上天下</span><span class="legend-royal-lines"></span><span class="legend-runthrough-trail"></span><span class="legend-ichigeki-burst"></span><span class="legend-hell-echo" data-text="${display}"></span><span class="legend-complete">${display}</span><span class="legend-bl-soccer" aria-hidden="true"></span><span class="legend-lycoris-poop" aria-hidden="true"></span><span class="legend-ghoul-flower-left" aria-hidden="true"></span><span class="legend-ghoul-flower-right" aria-hidden="true"></span></span>`;

        if (eq === "none") {
            html = `<span style="color: ${baseColor};">${html}</span>`;
        } else if (eq !== "auto") {
            const selectedTitles = eq.split(',');
            if (selectedTitles.includes("legend") && isLegend) {
                html = legendHtml;
            } else {
                html = selectedTitles.includes("supreme") && isComplete
                    ? `<span class="effect-rainbow" style="display: inline-block; position: relative;">${html}</span>`
                    : `<span style="color: ${baseColor};">${html}</span>`;
                if (selectedTitles.includes("godpull") && isGod) html = `<span class="effect-godpull" style="display: inline-block; position: relative;">${html}</span>`;
                if (selectedTitles.includes("runthrough") && isRunthrough) html = `<span class="effect-runthrough" style="display: inline-block; position: relative;">${html}</span>`;
                if (selectedTitles.includes("ichigeki") && isIchigeki) html = `<span class="effect-ichigeki" style="display: inline-block; position: relative;">${html}</span>`;
                if (selectedTitles.includes("hell") && isHell) html = `<span class="effect-hell" data-text="${display}" style="display: inline-block; position: relative;">${html}</span>`;
                
                // 🌟 自訂裝備判斷
                if (selectedTitles.includes("bl_legend") && isBl) html = `<span class="effect-bl-legend" style="display: inline-block; position: relative;">${html}</span>`;
                if (selectedTitles.includes("ghoul_legend") && isGhoul) html = `<span class="effect-ghoul-legend" style="display: inline-block; position: relative;">${html}</span>`;
                if (selectedTitles.includes("ghoul_charge") && isGhoulCharge) html = `<span class="effect-ghoul-flower" style="display: inline-block; position: relative;">${html}</span>`; // 👈 これを追加
                if (selectedTitles.includes("lycoris_legend") && isLycoris) html = `<span class="effect-lycoris-legend" style="display: inline-block; position: relative;">${html}</span>`;
                if (selectedTitles.includes("mushoku_legend") && isMushoku) html = `<span class="effect-mushoku-legend" style="display: inline-block; position: relative;">${html}</span>`;

                if (selectedTitles.includes("supreme") && isSupreme) html = `<span class="effect-supreme" style="display: inline-block; position: relative;">${html}</span>`;
                html = `<span class="title-effect">${html}</span>`;
            }
        } else if (isLegend) {
            html = legendHtml;
        } else {
            if (isBankrupt) html = `<span class="effect-bankrupt" style="display: inline-block; position: relative;">${html}</span>`;
            else if (isComplete) html = `<span class="effect-rainbow" style="display: inline-block; position: relative;">${html}</span>`;
            else if (!isGod && !isRunthrough && !isIchigeki && !isHell && !isSupreme && !isBl && !isGhoul && !isLycoris && !isMushoku) html = `<span style="color: ${baseColor};">${html}</span>`;
            
            if (isGod) html = `<span class="effect-godpull" style="display: inline-block; position: relative;">${html}</span>`;
            if (isRunthrough) html = `<span class="effect-runthrough" style="display: inline-block; position: relative;">${html}</span>`;
            if (isIchigeki) html = `<span class="effect-ichigeki" style="display: inline-block; position: relative;">${html}</span>`;
            if (isHell) html = `<span class="effect-hell" data-text="${display}" style="display: inline-block; position: relative;">${html}</span>`;
            
            // 🌟 自動疊加判斷
            if (isBl) html = `<span class="effect-bl-legend" style="display: inline-block; position: relative;">${html}</span>`;
            if (isGhoul) html = `<span class="effect-ghoul-legend" style="display: inline-block; position: relative;">${html}</span>`;
            if (isGhoulCharge) html = `<span class="effect-ghoul-flower" style="display: inline-block; position: relative;">${html}</span>`; // 👈 これを追加
            if (isLycoris) html = `<span class="effect-lycoris-legend" style="display: inline-block; position: relative;">${html}</span>`;
            if (isMushoku) html = `<span class="effect-mushoku-legend" style="display: inline-block; position: relative;">${html}</span>`;

            if (isSupreme) html = `<span class="effect-supreme" style="display: inline-block; position: relative;">${html}</span>`;
            html = `<span class="title-effect">${html}</span>`;
        }

        if (opts.uid && !opts.disableClick && typeof opts.onClickName === 'string' && opts.onClickName) {
            return `<span class="clickable-name" onpointerdown="${opts.onClickName}('${opts.uid}')">${html}</span>`;
        }
        return html;
    }

    function toggleTitleChecks(mode) {
        const list = document.getElementById('custom-title-list');
        if (list) list.style.display = mode === 'custom' ? 'block' : 'none';
    }

    function saveTitleSettings(uid) {
        const modeNode = document.querySelector('input[name="title_mode"]:checked');
        if (!modeNode || !window.firebase) return Promise.resolve(false);
        let equippedTitle = "auto";
        if (modeNode.value === "none") equippedTitle = "none";
        else if (modeNode.value === "custom") {
            const selected = Array.from(document.querySelectorAll('.t-check:checked')).map(node => node.value);
            equippedTitle = selected.length ? selected.join(',') : "none";
        }
        return window.firebase.database().ref('users/' + uid).update({ equipped_title: equippedTitle }).then(() => true);
    }

    window.HallShared = Object.freeze({ firebaseConfig, getTitleHtml, toggleTitleChecks, saveTitleSettings });
}());
