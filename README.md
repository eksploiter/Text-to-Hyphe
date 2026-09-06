# Layer Masker

Figma 화면의 디자인과 실제 텍스트는 유지하면서,  
선택한 영역의 **텍스트 레이어 이름을 일괄적으로 `-`로 변경하는 Figma Plugin**입니다.

## Overview

Figma에서는 텍스트를 생성하면 해당 텍스트 값이 레이어 이름으로 자동 표시되는 경우가 많습니다.

예를 들어 화면에는 다음과 같은 텍스트가 존재할 수 있습니다.

- 예약고객
- 차량정보
- 예약일시
- 총 결제금액
- 175,000원

이 경우 Layers 패널에도 동일한 내용이 노출됩니다.

**Layer Masker**는 화면에 표시되는 실제 텍스트와 UI에는 영향을 주지 않고,  
Layers 패널에 표시되는 **텍스트 레이어 이름만 `-`로 일괄 변경**합니다.

## Before

```text
Frame
├─ 예약고객
├─ 차량정보
├─ 예약일시
├─ 픽업서비스
├─ 175,000원
└─ 총 결제금액
```

## After

```text
Frame
├─ -
├─ -
├─ -
├─ -
├─ -
└─ -
```

> 화면에 표시되는 실제 텍스트는 변경되지 않습니다.

---

## Features

- 선택한 Frame 내부의 텍스트 레이어 자동 탐색
- 텍스트 레이어 이름을 `-`로 일괄 변경
- 실제 화면의 텍스트 값은 그대로 유지
- 숨겨진 텍스트 레이어 제외 가능
- 이미 `-`로 변경된 레이어 제외 가능
- 변경 / 제외 / 실패한 레이어 수 확인
- Frame, Group 등 기존 UI 구조 유지

---

## How to Use

1. Figma에서 변경하려는 **Frame 또는 Layer를 선택**합니다.
2. `Layer Masker` 플러그인을 실행합니다.
3. 필요한 옵션을 선택합니다.
4. **`레이어 이름 → -`** 버튼을 클릭합니다.
5. 선택한 영역 내부의 텍스트 레이어 이름이 일괄 변경됩니다.

잘못 변경한 경우 Figma의 `Ctrl/Cmd + Z`를 통해 되돌릴 수 있습니다.

---

## How It Works

Layer Masker는 Figma의 실제 텍스트 값인 `characters`를 수정하지 않습니다.

```javascript
textNode.characters
```

대신 Layers 패널에서 사용하는 레이어 이름인 `name`만 변경합니다.

```javascript
textNode.name = "-";
```

따라서 화면에 표시되는 텍스트와 디자인에는 영향을 주지 않습니다.

---

## Project Structure

```text
layer-masker/
├─ manifest.json
├─ code.js
└─ ui.html
```

- `manifest.json` : Figma Plugin 설정
- `code.js` : 레이어 탐색 및 이름 변경 로직
- `ui.html` : Plugin UI

---

## Installation

1. 프로젝트 파일을 다운로드합니다.
2. Figma Desktop을 실행합니다.
3. `Plugins → Development → Import plugin from manifest...`로 이동합니다.
4. 프로젝트의 `manifest.json`을 선택합니다.
5. Development Plugin에서 `Layer Masker`를 실행합니다.

---

## Notes

Layer Masker는 **텍스트 레이어의 이름만 변경**합니다.

텍스트 내용, 위치, 스타일, Auto Layout, Frame, Group, Component 등의  
디자인 구조에는 영향을 주지 않습니다.
