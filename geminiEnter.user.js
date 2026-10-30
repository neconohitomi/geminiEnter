// ==UserScript==
// @name         Gemini: Enter for newline, Cmd+Enter to send
// @namespace    local
// @version      2.0
// @description  Enter inserts a newline; Command+Enter sends the prompt.
// @match        https://gemini.google.com/*
// @match        https://www.google.com/search*
// @match        https://www.google.com/ai*
// @downloadURL  https://raw.githubusercontent.com/neconohitomi/geminiEnter/main/geminiEnter.user.js
// @updateURL    https://raw.githubusercontent.com/neconohitomi/geminiEnter/main/geminiEnter.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(() => {
  "use strict";

  const handleKey = (event) => {
    // 1. スクリプトが生成した「偽装Enter」はここでスルーし、Gemini本体に処理させる
    if (!event.isTrusted) return;

    // 2. 変換中や、Enter以外のキーは無視
    if (event.isComposing || event.key !== "Enter") return;

    // 3. 入力エリアにいる時のみ作動
    const editor = event.target.closest('rich-textarea, [contenteditable="true"], textarea');
    if (!editor) return;

    // 【パターンA】普通の Enter → 改行（大成功している理想の挙動）
    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (event.type === "keydown") {
        document.execCommand("insertLineBreak");
      }
      return;
    }

    // 【パターンB】Cmd + Enter / Ctrl + Enter → 送信
    if (event.metaKey || event.ctrlKey) {
      // Cmd+Enterのイベント自体はここで完全に握りつぶす
      event.preventDefault();
      event.stopImmediatePropagation();

      if (event.type === "keydown") {
        // ボタン探しはやめて、「修飾キーなしの純粋なEnterイベント」を生成してエディタに直接投げる
        // これを受け取ったGemini本体は「通常のEnterが押された」と錯覚して安全に送信処理を行う
        const plainEnter = new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          shiftKey: false,
          ctrlKey: false,
          metaKey: false,
          altKey: false,
          bubbles: true,
          cancelable: true,
          composed: true
        });
        editor.dispatchEvent(plainEnter);
      }
      return;
    }
  };

  // 画面の最優先でイベントを横取り
  window.addEventListener("keydown", handleKey, { capture: true, passive: false });
  window.addEventListener("keyup", handleKey, { capture: true, passive: false });
  window.addEventListener("keypress", handleKey, { capture: true, passive: false });
})();