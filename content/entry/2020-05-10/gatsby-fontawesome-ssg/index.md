---
title: GatsbyでFont Awesomeを使用するとアイコンの表示が一瞬遅れる問題について
published: "2020-05-10T19:00+09:00"
tags:
  - Gatsby
  - JavaScript
---

Gatsbyは最近流行りの静的サイトジェネレータで、このブログでも使用しています。
Font Awesomeは何か昔から流行っているフリーのアイコン集で、このブログでも使用しています。

両者の組み合わせることも非常によくあるらしく、"Gatsby FontAwesome"などでGoogle検索するとやり方を記した記事がたくさんヒットします。また、[Gatsbyの公式でもFontAwesomeの使用法がアナウンスされています](https://www.gatsbyjs.org/docs/recipes/styling-css/)。

しかし、実際に静的サイトをビルドしてみると、productionビルドでは**アイコンの表示が一瞬遅れる**という問題が発生しました。公式のガイドに罠があるのはとてもつらいですね。また、アイコンが表示されていない間はアイコンに幅がないので、それを考慮せずにCSSを書いていた場合はアイコンの表示に伴ってレイアウトが動きます。とてもつらいですね。

この記事では、この問題に対する対処法を紹介します。よくあるシチュエーションだと思われるわりに（少なくとも軽く調べただけでは）日本語の記事が出てこなかったので記事にしました。

## 環境

この記事の内容は以下の環境で検証しています。バージョンが変わるとうまくいかない可能性があるのでご注意ください。

```json
  "@fortawesome/fontawesome-svg-core": "1.2.28",
  "@fortawesome/react-fontawesome": "0.1.9",
```

アイコンは`@fortawesome/react-fontawesome`からインポートした`FontAwesomeIcon`コンポーネントで表示しています。

## 結論

やることは、**FontAwesome用のCSSをランタイムで追加するのをやめる**です。CSSは静的に最初から読み込んでおきます。

### 設定でランタイムでのCSS追加を無効化する

まず、`@fortawesome/fontawesome-svg-core`を読み込んでいるところで`config.autoAddCss`を`false`にします。この`config`というのは`@fortawesome/fontawesome-svg-core`から読み込めます。

FontAwesome公式のガイドにしたがってライブラリを構築している場合、before/afterは次のようになります。

```ts:title=before
import { library } from "@fortawesome/fontawesome-svg-core"
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { faHome, faRss, faTags } from "@fortawesome/free-solid-svg-icons"

library.add(faHome, faRss, faTags, faTwitter, faGithub);
```

↓

```ts:title=after
import { config, library } from "@fortawesome/fontawesome-svg-core"
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { faHome, faRss, faTags } from "@fortawesome/free-solid-svg-icons"

config.autoAddCss = false;
library.add(faHome, faRss, faTags, faTwitter, faGithub);
```

もしライブラリを使用していない場合、次のコードを適当な場所に書くことになります。

```ts
import { config } from "@fortawesome/fontawesome-svg-core"

config.autoAddCss = false;
```

### 代わりに静的に読み込む

お使いの`gatsby-browser.js`に以下のコードを追加します。

```js
import "@fortawesome/fontawesome-svg-core/styles.css";
```

以上です。こうすると、production buildではFont Awesome用のCSSが生成されたHTMLファイルに含まれるようになります。

## トラブルシューティング

これは自分がはまった別の罠なのですが、ライブラリ生成コードが`gatsby-browser.js`内にある場合は以上の手順を行なってもまだ表示が遅れるので気をつけましょう。こちらの場合はアイコンのSVGが生成されたHTMLにインライン化されていないことが原因です。

