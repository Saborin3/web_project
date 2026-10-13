// =========================================================
// 色の設定を切りかえるプログラム
//
// 流れ:
//   1. ページを開いたら、保存してある色を読み込む(なければ標準の色)
//   2. プリセットのボタン or 色選択で色が変わったら
//      → CSS変数を書きかえる → コントラスト比を表示 → 保存する
// =========================================================


// ---------- 1. 設定データ ----------

// 保存するときの名前(ブラウザの localStorage のキー)
const STORAGE_KEY = "color-friendly-settings";

// おすすめの配色(プリセット)
// どれも背景とのコントラスト比が文字7以上・枠3以上になるように選んでいます
const PRESETS = {
  standard: {
    label: "標準",
    colors: { bg: "#ffffff", text: "#1a1a1a", border: "#0072b2", link: "#0057a3", visited: "#6b3fa0" },
  },
  redGreen: {
    label: "赤と緑が見分けにくい方向け",
    colors: { bg: "#ffffff", text: "#000000", border: "#0072b2", link: "#0050a0", visited: "#a14c00" },
  },
  blueYellow: {
    label: "青と黄が見分けにくい方向け",
    colors: { bg: "#ffffff", text: "#000000", border: "#a3003c", link: "#a3003c", visited: "#006b5e" },
  },
  highContrast: {
    label: "ハイコントラスト(黒背景)",
    colors: { bg: "#000000", text: "#ffffff", border: "#ffd400", link: "#ffeb3b", visited: "#66ffff" },
  },
  cream: {
    label: "クリーム色(まぶしさ軽減)",
    colors: { bg: "#fdf6e3", text: "#2b2b2b", border: "#7a5c2e", link: "#0050a0", visited: "#7a3f00" },
  },
  dark: {
    label: "ダーク",
    colors: { bg: "#1e1e1e", text: "#e8e8e8", border: "#56b4e9", link: "#7cc4f0", visited: "#e69f00" },
  },
};

// 最初に使うプリセット
const DEFAULT_PRESET = "standard";

// 色の種類と、CSS変数名・画面に出す名前の対応表
const COLOR_ITEMS = {
  bg:      { cssVar: "--color-bg",      name: "背景" },
  text:    { cssVar: "--color-text",    name: "文字" },
  border:  { cssVar: "--color-border",  name: "枠" },
  link:    { cssVar: "--color-link",    name: "リンク" },
  visited: { cssVar: "--color-visited", name: "訪問済みリンク" },
};

// コントラスト比の目安(WCAG 2.1 の基準)
//   文字・リンク … 4.5 以上
//   枠          … 3 以上
const REQUIRED_RATIO = {
  text: 4.5,
  link: 4.5,
  visited: 4.5,
  border: 3,
};


// ---------- 2. 今の状態 ----------

// 今使っている色(プリセットの色をコピーして使う)
let currentColors = { ...PRESETS[DEFAULT_PRESET].colors };

// 今選ばれているプリセット名(自分で色を変えたら null)
let currentPresetName = DEFAULT_PRESET;


// ---------- 3. 色をページに反映する ----------

// currentColors の内容を CSS変数に書きこむ
function applyColorsToPage() {
  const root = document.documentElement; // <html> 要素

  for (const key in COLOR_ITEMS) {
    root.style.setProperty(COLOR_ITEMS[key].cssVar, currentColors[key]);
  }
}

// 色選択(input type="color")の表示を currentColors に合わせる
function updateColorPickers() {
  for (const key in COLOR_ITEMS) {
    const picker = document.getElementById("pick-" + key);
    picker.value = currentColors[key];
  }
}

// プリセットボタンの「選択中」表示を更新する
function updatePresetButtons() {
  const buttons = document.querySelectorAll("#preset-buttons button");

  buttons.forEach((button) => {
    const isSelected = button.dataset.preset === currentPresetName;
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

// 画面全体を今の状態に合わせて更新する(色を変えたら必ずこれを呼ぶ)
function refreshAll() {
  applyColorsToPage();
  updateColorPickers();
  updatePresetButtons();
  showContrastResults();
  saveSettings();
}


// ---------- 4. コントラスト比の計算 ----------

// "#rrggbb" → 相対輝度(0〜1の明るさ)に変換する
// 計算式は WCAG 2.1 の定義どおり
function getLuminance(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;

  // 人の目の感じ方に合わせて値を補正する
  function toLinear(value) {
    if (value <= 0.03928) {
      return value / 12.92;
    }
    return Math.pow((value + 0.055) / 1.055, 2.4);
  }

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// 2つの色のコントラスト比を求める(1〜21。大きいほど見やすい)
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

// 背景と各色のコントラスト比を一覧で表示する
function showContrastResults() {
  const list = document.getElementById("contrast-results");
  list.innerHTML = ""; // いったん空にする

  for (const key in REQUIRED_RATIO) {
    const ratio = getContrastRatio(currentColors.bg, currentColors[key]);
    const required = REQUIRED_RATIO[key];
    const isOk = ratio >= required;

    // 色だけでなく「OK / NG」の文字と記号で結果を伝える
    const mark = isOk ? "○ OK" : "× NG";
    const item = document.createElement("li");
    item.textContent =
      COLOR_ITEMS[key].name + ":" + ratio.toFixed(2) + " : 1 " +
      "(目安 " + required + " 以上)… " + mark;

    if (!isOk) {
      item.style.fontWeight = "bold";
    }

    list.appendChild(item);
  }
}


// ---------- 5. 保存と読み込み ----------
// localStorage はプライベートモードなどで使えないことがあるので
// try...catch で囲んで、失敗してもページは普通に動くようにしています

function saveSettings() {
  const data = {
    preset: currentPresetName,
    colors: currentColors,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // 保存できなくても困らないので何もしない
  }
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return; // 保存されていなければ標準の色のまま
    }

    const data = JSON.parse(saved);

    // 保存データが正しい形か一応確認してから使う
    if (data.colors && isValidColors(data.colors)) {
      currentColors = { ...data.colors };
      currentPresetName = data.preset ?? null;
    }
  } catch (error) {
    // 読み込めなかったら標準の色のまま
  }
}

// 全部の色が "#rrggbb" の形になっているか調べる
function isValidColors(colors) {
  const pattern = /^#[0-9a-fA-F]{6}$/;

  for (const key in COLOR_ITEMS) {
    if (!pattern.test(colors[key])) {
      return false;
    }
  }
  return true;
}


// ---------- 6. ボタンや色選択が操作されたときの処理 ----------

// プリセットのボタンを作って画面に並べる
function createPresetButtons() {
  const container = document.getElementById("preset-buttons");

  for (const presetName in PRESETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = PRESETS[presetName].label;
    button.dataset.preset = presetName;

    button.addEventListener("click", () => {
      selectPreset(presetName);
    });

    container.appendChild(button);
  }
}

// プリセットを選んだとき
function selectPreset(presetName) {
  currentColors = { ...PRESETS[presetName].colors };
  currentPresetName = presetName;
  refreshAll();
}

// 色選択で色を変えたとき
function setupColorPickers() {
  for (const key in COLOR_ITEMS) {
    const picker = document.getElementById("pick-" + key);

    // "input" は色を動かしている途中でも反応するので、すぐ結果が見える
    picker.addEventListener("input", () => {
      currentColors[key] = picker.value;
      currentPresetName = null; // 自分で選んだのでプリセットではなくなる
      refreshAll();
    });
  }
}

// 「最初の色に戻す」ボタン
function setupResetButton() {
  const button = document.getElementById("reset-button");

  button.addEventListener("click", () => {
    selectPreset(DEFAULT_PRESET);
  });
}


// ---------- 7. ページを開いたときに最初に実行する ----------

function init() {
  createPresetButtons();
  setupColorPickers();
  setupResetButton();
  loadSettings();
  refreshAll();
}

init();
