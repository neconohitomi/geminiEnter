// ==UserScript==
// @name         Gemini: Enter for newline, Cmd+Enter to send
// @namespace    local
// @version      1.0
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

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.isComposing || event.key !== "Enter") return;

      const editor = event.target.closest(
        '[contenteditable="true"], textarea'
      );
      if (!editor) return;

      // 通常の Enter は Gemini の送信処理を止めて、改行を挿入する
      if (!event.metaKey) {
        event.stopImmediatePropagation();
        event.preventDefault();

        if (editor instanceof HTMLTextAreaElement) {
          const start = editor.selectionStart;
          const end = editor.selectionEnd;
          editor.setRangeText("\n", start, end, "end");
          editor.dispatchEvent(new InputEvent("input", {
            bubbles: true,
            inputType: "insertLineBreak",
            data: "\n",
          }));
        } else {
          document.execCommand("insertLineBreak");
        }
        return;
      }

      // Command+Enter は Gemini の送信ボタンをクリックする
      event.stopImmediatePropagation();
      event.preventDefault();

      const form = editor.closest("form");
      const sendButton =
        form?.querySelector('button[type="submit"]') ??
        document.querySelector(
          'button[aria-label*="送信"], button[aria-label*="Send"]'
        );

      if (sendButton && !sendButton.disabled) {
        sendButton.click();
      }
    },
    true
  );
})();