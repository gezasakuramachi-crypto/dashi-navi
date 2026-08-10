# 令和8年 鹿島神宮神幸祭 山車ナビ

昨年の `gezasakuramachi-crypto/dashi-navi` を土台にした、令和8年版の開発用コードです。

## 外部サービスの役割

| サービス | 役割 |
|---|---|
| GitHub Pages | 観客向け山車ナビの画面を公開 |
| Google Maps JavaScript API | 地図、マーカー、交通規制図を表示 |
| iPhone SE2のTraccar Client | 山車側端末のGPS位置を送信 |
| Fly.io上のTraccar | GPS位置を受信・保存 |
| Fly.io上の位置情報API | Traccarから現在地だけを安全に中継 |
| Traccar閲覧用トークン | 位置情報APIだけがTraccarへ接続する認証 |

昨年コードの接続先は `traccar-railway.fly.dev` です。名称に `railway` が含まれますが、GitHubコードではFly.io上のTraccarへ接続しています。

## 画面仕様

- 下部メニューは「山車・交通規制・現在地・ヘルプ」
- 山車メニューには公開中の町内を一覧表示
- 町内を選ぶと対象山車の最新位置へ移動
- 山車メニューから3日分の山車運行表・経路図を表示
- 山車マーカーから「経路図・公式HP」を表示
- 交通規制の表示状態を地図右上へ常時表示
- インフォメーション・トイレ・駐車場は常時表示
- 「自動変更」では現在時刻に該当する交通規制を30秒ごとに再判定
- 9月1日・2日・3日を選ぶと、各時間帯の規制図を固定表示
- 固定表示中は現在時刻による交通規制図の変更を行わない
- 現在地を押したときの青い円は、徒歩で見やすい半径15mで表示
- 管理者テストページで通常／テスト表示を確認可能
- 一般画面は運行時間外に「配信停止中」を表示し、管理用ページでは常時ライブ位置を確認可能

## 本番公開前に設定する項目

`config.js` などで次を設定します。

1. GitHub Actions secret `GOOGLE_MAPS_API_KEY`：利用元とAPIを制限したGoogle Maps APIキー
2. GitHub Actions secret `TRACCAR_TOKEN`：令和8年用の閲覧専用トークン
3. GitHub Actions secret `FLY_API_TOKEN`：位置情報APIのFly.io公開用トークン
4. `trafficDays`：正式な規制日・時間・GeoJSON
5. `trafficDays[].published`：正式データ確認後に `true`
6. 参加町内が増えた場合は `dashis` と位置情報APIの許可端末を追加

交通規制が未確定の間は `published: false` とし、通常表示に未確認データが出ないようにします。

令和8年は9月1日から3日までの3日間です。交通規制図は3日分とも正式公開しています。

| 日付 | 時間帯 | パターン数 |
|---|---|---:|
| 9月1日 | 10:30〜15:30、15:30〜19:30、19:30〜20:30、20:30〜22:00 | 4 |
| 9月2日 | 8:00〜10:00、10:00〜14:00、14:00〜16:00、16:00〜16:30、16:30〜17:00、17:00〜22:00 | 6 |
| 9月3日 | 8:00〜12:30、12:30〜14:00、14:00〜16:30、16:30〜19:00、19:00〜19:30、19:30〜22:00 | 6 |

合計16パターンです。

Google Maps APIキーはブラウザへ配信されるため、Google Cloud Consoleで次の制限を設定してから登録します。

- アプリケーションの制限：HTTPリファラー
- 許可するウェブサイト：`https://gezasakuramachi-crypto.github.io/dashi-navi/*`
- APIの制限：Maps JavaScript API

APIキー本体はリポジトリの `config.js` へ保存しません。`main` ブランチの
公開時に `.github/workflows/deploy-pages.yml` が
`tools/build-pages.mjs` を実行し、GitHub Actions secretの値を公開用
`config.js` にだけ差し込みます。

GitHub Pagesの公開元は、リポジトリの
`Settings` → `Pages` → `Build and deployment` で
`GitHub Actions` を選択します。

## 通常モードとテストモード

- 公開サイト全体のモード：`data/runtime-config.json`
- この端末だけの確認：`admin.html`
- 管理者プレビュー：`index.html?preview=1`

テストモードでは指定した日本時間を現在時刻として扱い、未公開の交通規制データとテスト用山車位置を表示します。画面上には「テスト表示中」と表示されます。

一日連動テスト（`day-test`）では、実際の時計を進めたまま日付だけを祭礼日に置き換えます。2026年8月6日のテストは、同日の0:00から24:00までを9月2日として扱い、終了後は自動で通常モードへ戻ります。

## 山車現在地の公開時間

一般公開ページで山車の現在地を表示する時間は次のとおりです。時間外は「配信停止中」と表示し、位置情報APIへ問い合わせません。

| 日付 | 公開時間 |
|---|---|
| 9月1日 | 10:00〜22:00 |
| 9月2日 | 6:00〜7:00、18:00〜22:00 |
| 9月3日 | 11:30〜22:00 |

`admin.html` 内の管理用地図、または `index.html?admin=1` は、運行時間外もライブ位置を取得します。管理用ページにはログイン認証がないため、URLは関係者内だけで共有します。

## 自動切替

交通規制は次のタイミングで再判定します。

- 初回表示
- 30秒ごと
- 画面を再表示したとき
- ブラウザへ戻ったとき
- オンラインへ復帰したとき
- 通常／テストモードが変わったとき

時間帯は日本時間で判定し、終了時刻と次の開始時刻が同じ場合は、境界時刻に次の規制へ切り替わります。
交通規制パネルで日付を選んだ場合は、その時間帯を固定表示し、「自動変更」を選び直すまで再判定しません。

位置情報中継APIは、Traccarの `/api/positions` から許可端末の最新位置を取得し、端末IDで絞り込みます。同じ位置データは30秒間共有し、閲覧者が増えてもTraccarへの問い合わせが集中しないようにしています。

## テスト

```bash
node --check app.js
node --check config.js
node --check runtime-schedule.js
node tests/traffic-schedule.test.js
node tests/traffic-data.test.js
node tests/runtime-schedule.test.js
node tests/position-schedule.test.js
node --test proxy/server.test.mjs
```
