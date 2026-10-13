# 色の見え方に合わせて選べるサイト

背景・文字・枠・リンクの色を、ページの中で自分の見やすい色に変えられるサイトです。
色覚の多様性(色覚異常)に配慮したおすすめ配色も用意しています。

## できること

- おすすめ配色(プリセット)をボタン1つで切りかえ
  - 標準 / 赤と緑が見分けにくい方向け / 青と黄が見分けにくい方向け / ハイコントラスト / クリーム色 / ダーク
- 背景・文字・枠・リンク・訪問済みリンクの色を1色ずつ自由に選択
- 背景との **コントラスト比** を自動計算し、WCAG 2.1 の目安を満たすか「OK / NG」で表示
- 選んだ色はブラウザに保存され、次に開いたときも同じ色で表示

## 色だけに頼らない工夫

- リンクには常に下線をつける
- 選択中のプリセットは太字+二重線で示す
- 判定結果は「○ OK / × NG」の文字で示す
- キーボード操作時は太い枠でフォーカス位置を表示

## ファイル構成

```
.
├── index.html   … ページの中身(見本の文章と設定パネル)
├── style.css    … 見た目。色はすべて CSS変数(--color-○○)で管理
├── script.js    … 色の切りかえ・コントラスト比の計算・保存
├── README.md    … この説明
└── LICENSE      … ライセンス(MIT)
```

## 仕組み

1. `style.css` の `:root` に色を CSS変数としてまとめて定義
2. ページ内の色はすべて `var(--color-○○)` で参照
3. `script.js` が CSS変数の値を書きかえることで、ページ全体の色が一度に変わる
4. 設定は `localStorage` に保存

### プリセットを追加するには

`script.js` の `PRESETS` に1行足すだけです。

```js
myPreset: {
  label: "ボタンに出す名前",
  colors: { bg: "#ffffff", text: "#000000", border: "#0072b2", link: "#0050a0", visited: "#a14c00" },
},
```

## 使い方(ローカル)

`index.html` をブラウザで開くだけで動きます。ライブラリやビルドは不要です。

## GitHub Pages で公開する

1. GitHub で新しいリポジトリを作成(例:`color-friendly-site`)
2. このフォルダのファイルを push
   ```bash
   git init
   git add .
   git commit -m "最初のコミット"
   git branch -M main
   git remote add origin https://github.com/<ユーザー名>/color-friendly-site.git
   git push -u origin main
   ```
3. リポジトリの **Settings → Pages** を開く
4. **Source** を「Deploy from a branch」、ブランチを `main` / `/(root)` にして保存
5. 数分後、`https://<ユーザー名>.github.io/color-friendly-site/` で公開されます

## 参考

- [WCAG 2.1 コントラスト比の定義(W3C)](https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio)
- 配色の一部は Okabe & Ito のカラーユニバーサルデザイン配色を参考にしています

## ライセンス

MIT License(詳しくは `LICENSE` を参照)
