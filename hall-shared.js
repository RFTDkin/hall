/* Shared hall rules.
 * Keep cross-page title logic here so the lobby and every machine use one source of truth.
 */
(function () {
    'use strict';

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

    function getTitleHtml(userObj, options) {
        const opts = options || {};
        const name = userObj.name || "Unknown";
        const isComplete = !!userObj.has_completed;
        const isBankrupt = userObj.balance <= -10000000;
        const isHell = !!userObj.title_hell;
        const isGod = !!userObj.title_godpull;
        const isRunthrough = !!userObj.title_runthrough;
        const isIchigeki = !!userObj.title_ichigeki;
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

        if (opts.uid && !opts.disableClick && typeof opts.onClickName === 'function') {
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

    function settleIchigekiAwards(db, now) {
        const date = now || new Date();
        const todayStr = `${date.getMonth() + 1}/${date.getDate()}`;
        return db.ref('server_records/daily_bests_log').once('value').then(snapshot => {
            const logs = snapshot.val() || {};
            Object.keys(logs).forEach(key => {
                const record = logs[key];
                if (!record || record.date === todayStr || !record.uid) return;
                db.ref(`users/${record.uid}`).transaction(userData => {
                    if (!userData) return;
                    const awards = userData.ichigeki_awards || {};
                    if (awards[key]) return;
                    userData.ichigeki_count = (userData.ichigeki_count || 0) + 1;
                    awards[key] = { date: record.date, payout: record.payout || 0 };
                    userData.ichigeki_awards = awards;
                    return userData;
                }, (error, committed) => {
                    if (!error && committed) db.ref(`server_records/daily_bests_log/${key}/processed`).set(true);
                });
            });
        });
    }

    window.HallShared = Object.freeze({ firebaseConfig, getTitleHtml, toggleTitleChecks, saveTitleSettings, settleIchigekiAwards });
}());
