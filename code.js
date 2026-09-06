const UI_HTML = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 20px;
      font: 12px/1.5 Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--figma-color-text);
      background: var(--figma-color-bg);
    }

    h2 {
      margin: 0 0 8px;
      font-size: 16px;
    }

    p {
      margin: 0 0 16px;
      color: var(--figma-color-text-secondary);
    }

    label {
      display: flex;
      gap: 8px;
      align-items: center;
      margin: 10px 0;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 20px;
    }

    button {
      border: 0;
      border-radius: 6px;
      padding: 9px 12px;
      cursor: pointer;
      font: inherit;
    }

    #rename {
      flex: 1;
      color: var(--figma-color-text-onbrand);
      background: var(--figma-color-bg-brand);
    }

    #close {
      color: var(--figma-color-text);
      background: var(--figma-color-bg-secondary);
    }

    #result {
      min-height: 20px;
      margin-top: 14px;
    }
  </style>
</head>

<body>

  <h2>텍스트 레이어 이름 변경</h2>

  <p>
    선택한 프레임/그룹/레이어 안의 텍스트 레이어 이름을
    <b>-</b> 로 변경합니다.
    화면의 실제 문구는 변경하지 않습니다.
  </p>

  <label>
    <input id="excludeHidden" type="checkbox">
    숨겨진 텍스트 레이어 제외
  </label>

  <label>
    <input id="skipExisting" type="checkbox" checked>
    이미 이름이 "-"인 레이어 제외
  </label>

  <div class="actions">
    <button id="rename">변경하기</button>
    <button id="close">닫기</button>
  </div>

  <div id="result"></div>

  <script>

    document.getElementById("rename").onclick = () => {

      parent.postMessage(
        {
          pluginMessage: {
            type: "rename",

            excludeHidden:
              document.getElementById("excludeHidden").checked,

            skipExisting:
              document.getElementById("skipExisting").checked
          }
        },
        "*"
      );

    };


    document.getElementById("close").onclick = () => {

      parent.postMessage(
        {
          pluginMessage: {
            type: "close"
          }
        },
        "*"
      );

    };


    onmessage = (event) => {

      const msg = event.data.pluginMessage;

      if (!msg || msg.type !== "result") {
        return;
      }

      const el = document.getElementById("result");

      el.textContent = msg.message || "";

    };

  </script>

</body>
</html>
`;


/* =========================
   UI 실행
========================= */

figma.showUI(UI_HTML, {
  width: 360,
  height: 360,
  themeColors: true
});


/* =========================
   선택 영역의 TEXT 수집
========================= */

function collectTextNodes(selection) {

  let textNodes = [];

  for (const node of selection) {

    // 선택한 레이어 자체가 텍스트인 경우
    if (node.type === "TEXT") {
      textNodes.push(node);
    }

    // 선택한 Frame / Group / Component 내부 탐색
    if ("findAll" in node) {

      const children = node.findAll(
        (child) => child.type === "TEXT"
      );

      textNodes.push(...children);

    }

  }

  // 중복 제거
  return [...new Set(textNodes)];

}


/* =========================
   UI 메시지 처리
========================= */

figma.ui.onmessage = async (msg) => {

  /* 닫기 */

  if (msg.type === "close") {

    figma.closePlugin();

    return;

  }


  /* rename 이외 메시지는 무시 */

  if (msg.type !== "rename") {
    return;
  }


  const selection = figma.currentPage.selection;


  /* 아무것도 선택하지 않은 경우 */

  if (selection.length === 0) {

    figma.ui.postMessage({

      type: "result",

      status: "error",

      message:
        "프레임 또는 레이어를 먼저 선택해주세요."

    });

    return;

  }


  /* TEXT 레이어 수집 */

  const textNodes =
    collectTextNodes(selection);


  /* 텍스트가 없는 경우 */

  if (textNodes.length === 0) {

    figma.ui.postMessage({

      type: "result",

      status: "error",

      message:
        "선택한 영역 안에 텍스트 레이어가 없습니다."

    });

    return;

  }


  let changedCount = 0;

  let skippedCount = 0;

  let failedCount = 0;


  /* =========================
     레이어 이름 변경
  ========================= */

  for (const textNode of textNodes) {

    try {

      /* 숨겨진 TEXT 제외 */

      if (
        msg.excludeHidden &&
        !textNode.visible
      ) {

        skippedCount++;

        continue;

      }


      /* 이미 "-"이면 제외 */

      if (
        msg.skipExisting &&
        textNode.name === "-"
      ) {

        skippedCount++;

        continue;

      }


      /*
       * 중요
       *
       * characters를 변경하면
       * 실제 화면의 텍스트가 변경됨.
       *
       * name만 변경해야
       * Layers 패널 이름만 변경됨.
       */

      textNode.name = "-";


      changedCount++;

    }

    catch (error) {

      console.error(
        `레이어 이름 변경 실패: ${textNode.name}`,
        error
      );

      failedCount++;

    }

  }


  /* =========================
     결과 반환
  ========================= */

  figma.ui.postMessage({

    type: "result",

    status:
      failedCount > 0
        ? "warning"
        : "success",

    message:

      `레이어 이름 변경 ${changedCount}개`

      +

      (
        skippedCount
          ? ` · 제외 ${skippedCount}개`
          : ""
      )

      +

      (
        failedCount
          ? ` · 실패 ${failedCount}개`
          : ""
      )

  });

};
