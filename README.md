# 令和8年 鹿島神宮神幸祭 山車ナビ

昨年の `gezasakuramachi-crypto/dashi-navi` を土台にした、令和8年版の開発用コードです。

## 外部サービスの役割

| サービス | 役割 |
|---|---|
| GitHub Pages | 観客向け山車ナビの画面を公開 |
| Google Maps JavaScript API | 地図、マーカー、交通規制図を表示 |
| iPhone SE2のTraccar Client | 山車側端末のGPS位置を送信 |
| Fly.io上のTraccar | GPS位置を受信・保存し、山車ナビへ提供 |
| Traccar閲覧用トークン | 山車ナビが最新位置を取得する際の認証 |

昨年コードの接続先は `traccar-railway.fly.dev` です。名称に `railway` が含まれますが、GitHubコードではFly.io上のTraccarへ接続しています。

## 画面仕様

- 下部メニューは「山車・交通規制・現在地・ヘルプ」
- 山車メニューには公開中の町内を一覧表示
- 町内を選ぶと対象山車の最新位置へ移動
- 山車マーカーから「ここへ行く・経路図・公式HP」を表示
- インフォメーション・トイレ・駐車場は常時表示
- 現在時刻に該当する交通規制を30秒ごとに再判定
- 交通規制パネルから日付・時間帯の指定表示が可能
- 管理者テストページで通常／テスト表示を確認可能

## 本番公開前に設定する項目

`config.js` で次を設定します。

1. `googleMapsApiKey`：利用元とAPIを制限したGoogle Maps APIキー
2. `positionApi.publicBearer`：令和8年用の位置情報取得トークン
3. `dashis[].routeUrls`：日付別の経路図URL
4. `trafficDays`：正式な規制日・時間・GeoJSON
5. `trafficDays[].published`：正式データ確認後に `true`
6. 参加町内が増えた場合は `dashis` に町内設定を追加

交通規制が未確定の間は `published: false` とし、通常表示に昨年データが出ないようにしています。

Google Maps APIキーはブラウザへ配信されるため、Google Cloud Consoleで次の制限を設定してから登録します。

- アプリケーションの制限：HTTPリファラー
- 許可するウェブサイト：`https://gezasakuramachi-crypto.github.io/dashi-navi/*`
- APIの制限：Maps JavaScript API

## 通常モードとテストモード

- 公開サイト全体のモード：`data/runtime-config.json`
- この端末だけの確認：`admin.html`
- 管理者プレビュー：`index.html?preview=1`

テストモードでは指定した日本時間を現在時刻として扱い、未公開の交通規制データとテスト用山車位置を表示します。画面上には「テスト表示中」と表示されます。

## 自動切替

交通規制は次のタイミングで再判定します。

- 初回表示
- 30秒ごと
- 画面を再表示したとき
- ブラウザへ戻ったとき
- オンラインへ復帰したとき
- 通常／テストモードが変わったとき

時間帯は日本時間で判定し、終了時刻と次の開始時刻が同じ場合は、境界時刻に次の規制へ切り替わります。

## テスト

```bash
node --check app.js
node --check config.js
node tests/traffic-schedule.test.js
```
