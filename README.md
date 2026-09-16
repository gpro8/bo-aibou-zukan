# 相棒図鑑

BushiDAO 相棒（ペット）の静的図鑑。  
Live: https://gpro8.github.io/bushi-aibou-zukan/

## 主 / 絵師が足す・直す（mess しない）

SoT は **`data/entries.json` だけ**。HTML を直さない。

1. 新しい相棒: `entries` にオブジェクトを1つ足す。`id` は英小文字（URL `#sumi`）。
2. 後から足した項目（例: 属性）は既存キーへ。既存キーに無いものは `more: { "属性": "雷・闇" }`。
3. 絵は `art/<id>.png`。巨大すぎる場合は圧縮してから。
4. 空文字 / 空配列は画面に出ない。
5. **出さない:** `Kanamin-BO × BushiDAO` のような誤った共作クレジット。主の名は `owner`。絵師は `artist`（分かれば）。
6. 仮は `"provisional": true`。
7. Angotaro がマージして Pages に載る（今はキュレーション）。

Gi・投票権・NFT は載せない。
