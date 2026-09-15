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
        const isIchigeki = !!userObj.is_vip; // 🌟 綁定紫電特效畀 VIP
        const isSupreme = isComplete && !!opts.isRank1;
        const isLegend = isSupreme && isBankrupt && isHell && isGod && isRunthrough && isIchigeki;
        const display = userObj.isSelf && opts.showYouLabel ? `${name} (あなた)` : name;
        const eq = opts.equippedTitle || "auto";
        const baseColor = userObj.isSelf ? '#00e5ff' : '#fff';
        let html = display;

        if (eq === "none") {
            html = `<span style="color: ${baseColor};">${html}</span>`;
        } else if (eq !== "auto") {
            const selectedTitles = eq.split(',');
            if (selectedTitles.includes("legend") && isLegend) {
                html = `<span class="title-effect effect-legend"><span class="legend-supreme-text">天上天下</span><span class="legend-royal-lines"></span><span class="legend-runthrough-trail"></span><span class="legend-ichigeki-burst"></span><span class="legend-hell-echo" data-text="${display}"></span><span class="legend-complete">${display}</span></span>`;
            } else {
                html = selectedTitles.includes("supreme") && isComplete
                    ? `<span class="effect-rainbow" style="display: inline-block; position: relative;">${html}</span>`
                    : `<span style="color: ${baseColor};">${html}</span>`;
                if (selectedTitles.includes("godpull") && isGod) html = `<span class="effect-godpull" style="display: inline-block; position: relative;">${html}</span>`;
                if (selectedTitles.includes("runthrough") && isRunthrough) html = `<span class="effect-runthrough" style="display: inline-block; position: relative;">${html}</span>`;
                if (selectedTitles.includes("ichigeki") && isIchigeki) html = `<span class="effect-ichigeki" style="display: inline-block; position: relative;">${html}</span>`;
                if (selectedTitles.includes("hell") && isHell) html = `<span class="effect-hell" data-text="${display}" style="display: inline-block; position: relative;">${html}</span>`;
                if (selectedTitles.includes("supreme") && isSupreme) html = `<span class="effect-supreme" style="display: inline-block; position: relative;">${html}</span>`;
                html = `<span class="title-effect">${html}</span>`;
            }
        } else if (isLegend) {
            html = `<span class="title-effect effect-legend"><span class="legend-supreme-text">天上天下</span><span class="legend-royal-lines"></span><span class="legend-runthrough-trail"></span><span class="legend-ichigeki-burst"></span><span class="legend-hell-echo" data-text="${display}"></span><span class="legend-complete">${display}</span></span>`;
        } else {
            if (isBankrupt) html = `<span class="effect-bankrupt" style="display: inline-block; position: relative;">${html}</span>`;
            else if (isComplete) html = `<span class="effect-rainbow" style="display: inline-block; position: relative;">${html}</span>`;
            else if (!isGod && !isRunthrough && !isIchigeki && !isHell && !isSupreme) html = `<span style="color: ${baseColor};">${html}</span>`;
            if (isGod) html = `<span class="effect-godpull" style="display: inline-block; position: relative;">${html}</span>`;
            if (isRunthrough) html = `<span class="effect-runthrough" style="display: inline-block; position: relative;">${html}</span>`;
            if (isIchigeki) html = `<span class="effect-ichigeki" style="display: inline-block; position: relative;">${html}</span>`;
            if (isHell) html = `<span class="effect-hell" data-text="${display}" style="display: inline-block; position: relative;">${html}</span>`;
            if (isSupreme) html = `<span class="effect-supreme" style="display: inline-block; position: relative;">${html}</span>`;
            html = `<span class="title-effect">${html}</span>`;
        }

        // onClickName is deliberately a JavaScript path string (e.g. showProfile / window.showPluginProfile)
        // so the generated inline handler can work on both the lobby and machine pages.
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
