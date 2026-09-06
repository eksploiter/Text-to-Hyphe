figma.showUI(__html__, {
  width: 360,
  height: 360,
  themeColors: true
});

function collectTextNodes(selection) {
  let textNodes = [];

  for (const node of selection) {
    // 선택한 레이어 자체가 텍스트인 경우
    if (node.type === "TEXT") {
      textNodes.push(node);
    }

    // 선택한 Frame/Group 내부의 모든 텍스트 찾기
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

figma.ui.onmessage = async (msg) => {
  if (msg.type === "close") {
    figma.closePlugin();
    return;
  }

  if (msg.type !== "rename") {
    return;
  }

  const selection = figma.currentPage.selection;

  // 아무것도 선택하지 않은 경우
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: "result",
      status: "error",
      message: "프레임 또는 레이어를 먼저 선택해주세요."
    });

    return;
  }

  const textNodes = collectTextNodes(selection);

  // 텍스트 레이어가 없는 경우
  if (textNodes.length === 0) {
    figma.ui.postMessage({
      type: "result",
      status: "error",
      message: "선택한 영역 안에 텍스트 레이어가 없습니다."
    });

    return;
  }

  let changedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const textNode of textNodes) {
    try {
      // 숨겨진 텍스트 제외 옵션
      if (msg.excludeHidden && !textNode.visible) {
        skippedCount++;
        continue;
      }

      // 이미 "-"인 경우 제외
      if (msg.skipExisting && textNode.name === "-") {
        skippedCount++;
        continue;
      }

      /*
       * 중요!
       *
       * textNode.characters = "-"
       * → 화면에 보이는 실제 텍스트가 바뀜
       *
       * textNode.name = "-"
       * → 왼쪽 Layers 패널의 이름만 바뀜
       */

      textNode.name = "-";

      changedCount++;

    } catch (error) {

      console.error(
        `레이어 이름 변경 실패: ${textNode.name}`,
        error
      );

      failedCount++;
    }
  }

  figma.ui.postMessage({
    type: "result",
    status:
      failedCount > 0
        ? "warning"
        : "success",

    message:
      `레이어 이름 변경 ${changedCount}개` +
      (skippedCount
        ? ` · 제외 ${skippedCount}개`
        : "") +
      (failedCount
        ? ` · 실패 ${failedCount}개`
        : "")
  });
};
