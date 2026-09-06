async function main() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("프레임 또는 레이어를 선택해주세요.");
    figma.closePlugin();
    return;
  }

  let textNodes = [];

  // 선택한 레이어 자체가 TEXT인 경우 + 하위 TEXT 레이어 모두 찾기
  for (const node of selection) {
    if (node.type === "TEXT") {
      textNodes.push(node);
    }

    if ("findAll" in node) {
      const children = node.findAll(
        (child) => child.type === "TEXT"
      );

      textNodes.push(...children);
    }
  }

  // 중복 제거
  textNodes = [...new Set(textNodes)];

  if (textNodes.length === 0) {
    figma.notify("선택한 영역 안에 텍스트 레이어가 없습니다.");
    figma.closePlugin();
    return;
  }

  let changedCount = 0;
  let failedCount = 0;

  for (const textNode of textNodes) {
    try {
      // 텍스트에 사용된 모든 폰트 로드
      const fontNames = textNode.getRangeAllFontNames(
        0,
        textNode.characters.length
      );

      const uniqueFonts = [
        ...new Map(
          fontNames.map((font) => [
            `${font.family}-${font.style}`,
            font
          ])
        ).values()
      ];

      for (const font of uniqueFonts) {
        await figma.loadFontAsync(font);
      }

      // 실제 텍스트 값을 "-"로 변경
      textNode.characters = "-";

      changedCount++;
    } catch (error) {
      console.error(
        `변경 실패: ${textNode.name}`,
        error
      );

      failedCount++;
    }
  }

  if (failedCount === 0) {
    figma.notify(
      `완료! ${changedCount}개의 텍스트를 "-"로 변경했습니다.`
    );
  } else {
    figma.notify(
      `${changedCount}개 변경 완료 / ${failedCount}개 변경 실패`
    );
  }

  figma.closePlugin();
}

main();
