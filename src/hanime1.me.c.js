// ==UserScript==
// @name         AnimeGetterC
// @namespace    https://penyo.net/
// @version      1.0.0
// @description  下载里番！
// @author       Penyo
// @match        https://hanime1.me/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hanime1.me
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  /**
   * @returns {Promise<Window>}
   */
  async function open(addr) {
    const page = window.open(addr, "_blank");
    while (1) {
      if (page.document.readyState === "complete") {
        return page;
      } else {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
  }

  async function dl(addr, filename) {
    const rpc = {
      host: "http://localhost",
      port: 16800,
      path: "/jsonrpc",
      token: "114514",
    };

    const resp = await fetch(`${rpc.host}:${rpc.port}${rpc.path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: new Date().getTime(),
        jsonrpc: "2.0",
        method: "aria2.addUri",
        params: [
          `token:${rpc.token}`,
          [addr],
          {
            out: filename,
          },
        ],
      }),
    });

    if (resp.error) {
      console.error("下载失败：", filename);
    } else {
      console.debug("下载成功：", filename);
    }
  }

  const buttonStart = document.createElement("button");
  buttonStart.innerText = "抓取本页";
  buttonStart.style.cssText = `
    display: fixed;
    z-index: 999;
    left: 0;
    top: 0;
  `;
  buttonStart.onclick = run;
  document.body.appendChild(buttonStart);

  async function run() {
    const urlsOfVideoWC = Array.from(
      document.querySelectorAll(".home-rows-videos-wrapper > a")
    ).map((a) => a.href);

    for (const urlOfVideoWC of urlsOfVideoWC) {
      const videoWC = await open(urlOfVideoWC);
      const ja = videoWC.document
        .querySelector("h3")
        .textContent.replace("[中文字幕]", "")
        .trim();
      videoWC.close();

      const videoDL = await open(urlOfVideoWC.replace("watch", "download"));
      const zh = videoDL.document.querySelector("h3").textContent.trim();
      const time = videoDL.document
        .querySelector("p")
        .textContent.substring(0, 10);
      const addr = videoDL.document.querySelector(".exoclick-popunder").href;
      videoDL.close();

      dl(addr, `[${time}] ${ja}（${zh}）.mp4`);
    }
  }
})();