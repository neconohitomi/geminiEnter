// ==UserScript==
// @name         Gemini: Enter for newline, Cmd+Enter to send
// @namespace    local
// @version      2.0.2
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

  function isAiMode() {
    // Google AI モードのURL判定
    return location.pathname.startsWith("/ai") ||
      new URLSearchParams(location.search).get("udm") === "50";
  }

  document.addEventListener("keydown", (event) => {
    if (event.isComposing || event.key !== "Enter") return;

    const editor = event.target.closest(
      '[contenteditable="true"], textarea'
    );
    if (!editor) return;

    const isGemini = location.hostname === "gemini.google.com";
    const isGoogleAiMode =
        location.hostname === "www.google.com" &&
        editor.matches(
        '[data-xid="aim-mars-input-plate"] textarea[aria-label="質問する"]'
      );

    // Gemini と Google AI モード以外ではキー操作を変更しない
    if (!isGemini && !isGoogleAiMode) return;

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
  }, true);
})();