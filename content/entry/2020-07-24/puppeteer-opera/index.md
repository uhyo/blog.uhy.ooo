---
title: puppeteerでOperaのシークレットウィンドウにタブを開くまで
published: "2020-07-24T22:40+09:00"
tags:
  - puppeteer
  - TypeScript
---

近年、プログラムからブラウザを操作する手段の一つとして**[puppeteer](https://github.com/puppeteer/puppeteer)**が台頭してきています。
これは[Chrome Devtools Protocol](https://chromedevtools.github.io/devtools-protocol/)を用いて作られているためChromiumベースのブラウザ（Chromeなど）専用ですが、それでも多くのユースケースが存在します。

そして、[Opera](https://www.opera.com/)もまたChromiumベースのブラウザですので、puppeteerで操作できるはずです。
しかしOperaを操作するにあたってpuppeteerのドキュメント通りにやってもうまくいかない点があったので、記事に残しておきます。

## 環境

- puppeteer: 5.2.1
- Opera: 69.0.3686.77
- Mac: macOS Mojave 10.14.6

## Operaをpuppeteerで操作するには

Operaとpuppeteerを組み合わせる記事がそもそも見当たらないので、基本的なことも書いておきます。

まず、puppeteerのnpmパッケージにはChromiumを同梱した`puppeteer`と同梱していない`puppeteer-core`があります。
今回はOperaを操作するので`puppeteer-core`があれば十分です。
ただし、Operaは別にインストールしておく必要があります。

Operaをpuppeteerで操作するには、`puppeteer.launch`の`executablePath`オプションにOperaのパスを渡すだけです。
例えばMacの場合はデフォルトだと次のようにすればOperaが起動します。

```ts
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Opera.app/Contents/MacOS/Opera",
});
```

## シークレットモードウィンドウを開く

上で得た`browser`に対して`createIncognitoBrowserContext`メソッドを呼び出すと、シークレットモード用のBrowserContextが得られます。
このタイミングでシークレットモードウィンドウが開きます。

```ts
const context = await browser.createIncognitoBrowserContext();
```

## シークレットモードウィンドウ内でページを開く（うまくいかなかった例）

この状態では、シークレットモードウィンドウの中にページがありません。
そこで、この中にページ（タブ）を作る必要があります。
[公式ドキュメント](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#browsercreateincognitobrowsercontext)によれば、この`context`に対して（通常のBrowserContextと同じように）`newPage`を呼び出せばうまくいくはずですが、なぜか**これではうまくいきませんでした**。
具体的には、`newPage`を呼び出すと新しいタブ（about:blank）が確かに開きますが、`newPage`の結果（変数`page`に入る値）が`null`となってしまい、後続の操作ができません。
また、`context.pages()` APIの結果にもここで作られたタブの情報が得られませんでした。

```ts:title=うまくいかなかった例
// タブが開かれるが page がnullになる
const page = await context.newPage();
```

この記事では、この問題を回避して、シークレットモードウィンドウ内に開いたタブを操作できるようにする方法を見つけたので共有します。

## うまくいった方法

結論としては、`newPage`を使って得られたタブをDevtools Protocolを生で叩くことで新しいページを作成します。
次の関数にまとめました。

```ts
function newPageInContext(context: BrowserContext, url: string) {
  return new Promise<Page>((resolve, reject) => {
    context.once("targetcreated", (target) => {
      target
        .createCDPSession()
        .then(async (session) => {
          await session.send("Page.navigate", {
            url,
          });
          const [page] = (await context.pages()).slice(-1);
          await session.detach();
          resolve(page);
        })
        .catch(reject);
    });
    context.newPage().catch(reject);
  });
}
```

この関数では、まず`context.newPage()`をとにかく呼び出して空のタブを作成します。
このとき、contextに登録しておいた`targetcreated`イベントが発火します。
調べてみると分かりますが、ここで得られる`target`は`type`が`"other"`となっています。
このせいでタブがPageとして認識されず、`newPage`の結果が`null`になったと推測されます。

この関数の肝は、Pageではない存在に対してChrome Devtools Protocol (CDP)を生で喋ることによってPageに変換してあげることです。
そのために`createCDPSession()`を呼び出し、CDPで[Page.navigate](https://chromedevtools.github.io/devtools-protocol/1-3/Page/#method-navigate)を呼び出します。
これにより、開いたタブがそのページに遷移します。
こうするとタブがPage化するらしく、`context.pages()` APIによって今開いたタブが取れるようになります。
よって、これを`newPageInContext`の結果として返せば終了です。

この関数はこのように使えます。

```ts
const page = await newPageInContext(context, "https://example.com/");
```

以上です。

## まとめ

この記事では、Operaをpuppeteerで操作する場合にシークレットウィンドウ内にページを作成すると`context.newPage()`の結果がnullとなってしまう問題の対処法を説明しました。

え、何でOperaでシークレットウィンドウなのかって？　OperaってフリーのVPNが付いてくるじゃないですか。それで（省略されました）