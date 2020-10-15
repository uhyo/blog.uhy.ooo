---
title: setTimeoutに大きい数値を与えるとどうなる？　仕様を読んで完全理解
published: "2020-09-06T14:45+09:00"
tags:
  - JavaScript
  - ECMAScript
  - WebIDL
  - HTML
---

JavaScriptでは`setTimeout`という関数を使うことができます。
しかし、実はこの関数は言語仕様（ECMAScript）に組み込まれているものではありません。
ブラウザ上で動くJavaScriptの場合、`setTimeout`は[HTMLの仕様](https://html.spec.whatwg.org/multipage/webappapis.html#windoworworkerglobalscope-mixin)によって定義されています。
このHTMLの仕様はHTMLとは名ばかりの巨大な仕様で、今時のブラウザの挙動をほぼ全て規定しているといっても過言ではありません。

さて、`setTimeout`にとても大きな数値を渡したときの挙動に関するツイートをTwitterで見かけました。
曰く、`setTimeout`に渡す数値は32ビット整数しかサポートされていないというのです。
試してみると、次のようなものは確かに一瞬でタイマーが呼ばれてしまい、想定した挙動とは違うように思えます。

```js
setTimeout(() => {
  console.log(`${2 ** 53 / 1000}秒経ちました！`);
}, 2 ** 53);

setTimeout(() => {
  console.log('無限の彼方');
}, Infinity);
```

実際、`setTimeout`が32ビット整数しかサポートしていないというのはその通りです。
では、それはブラウザが実装をサボったからでしょうか？
否、「**`setTimeout`は32ビット整数しかサポートしない**」ということが仕様でちゃんと定められており、ブラウザはそれに従っているだけなのです。
この記事では、そのことを仕様書を読みながら確かめていきます。

## setTimeoutのインターフェースを調べる

仕様リーディングの出発点は、HTML仕様書で定義されている`setTimeout`のインターフェースを見ることです。
そのためには、[WindowOrWorkerGlobalScope mixin](https://html.spec.whatwg.org/multipage/webappapis.html#windoworworkerglobalscope-mixin)の定義を見ることになります。
これは、HTML仕様によって定義されているグローバル変数の一覧と思っていただければ構いません。
より正確には、その中でも特にWindow（通常のWebページ内のグローバル変数）とWorkerGlobalScope（WebWorker内のスクリプト内のグローバル変数）のどちらでも使えるものがここで定義されています。

よく見ると、次のようなインターフェース定義が見て取れます。

```
long setTimeout(TimerHandler handler, optional long timeout = 0, any... arguments);
```

フィーリングで読むと、`setTimeout`の最初の引数は`TimerHandler`型の値であり、次の引数はオプショナルで`long`型の値、そして省略された場合のデフォルト値は0である……と読めます。
ここで怪しいのは、引数`timeout`の型が`long`と書かれていることです。
数値の型として`long`という概念はJavaScriptにはありませんが、これは一体どういうことなのでしょうか。

## WebIDLでlongの仕様を調べる

実は、上記のような記法の意味それ自体も**WebIDL**として仕様化されています。
つまり、`long`の意味もWebIDL仕様を読めば分かるということです。

まず、`long`の意味は[WebIDL仕様書の3.10.7 longの項](https://www.w3.org/TR/WebIDL-1/#idl-long)に書かれています。
そこから引用します。

> The long type is a signed integer type that has values in the range [−2147483648, 2147483647].

つまり、`long`というのは-2147483648以上2147483647以下の整数を表すと定義されています。
これはまさに符号付き32ビット整数のことを指しています。
こうなると、`setTimeout`が32ビット整数しかサポートしていないのは確実ですね。

ここで生じる次の疑問は、`long`型と定義されている値にその範囲外の値を渡した場合に何が起きるのかということです。
実は、これもWebIDL仕様によって定義されています。
WebIDLにはECMAScript Mappingという節があり、WebIDLで定義された関数や型がJavaScriptでどのような振る舞いをするのかが厳密に定められています。
WebIDL自体はJavaScript以外の言語からも解釈できるように作られていますが、現在ではもっぱらWebIDLで定義されたAPIを実装するのはJavaScript上のことなので、JavaScriptが特別扱いされて厳密な定義が与えられているのです。

さて、`long`型のJavaScriptにおける振る舞いは[WebIDL仕様書の4.2.8 longの項](https://www.w3.org/TR/WebIDL-1/#es-long)で定義されています。

> An ECMAScript value V is converted to an IDL long value by running the following algorithm:

とあるように、ECMAScript (JavaScript) の値VがWebIDLで言う`long`の値（32ビット符号付き整数）に変換されるときの挙動がここで定義されています。
1〜5までのステップがありますが、`setTimeout`の引数の場合は2と3は関係ありません。
よって、`setTimeout`の引数に渡された値は次の3ステップで`long`に変換されることになります。

> - Initialize x to ToNumber(V).
> - Set x to ToInt32(x).
> - Return the IDL long value that represents the same numeric value as x.

要するに、ToNumberでまずVを数値に変換し、それにさらにToInt32を噛ませると書いてありますね。

## ECMAScript仕様書でToInt32の定義を調べる

実は、ToNumberやToInt32の定義はECMAScript仕様書に書いてあります。
ToNumberはその名前の通り与えられた値を数値に変換する操作です。
問題はToInt32で、こちらも名前の通り、与えられた数値を32ビット整数に変換する操作であることが伺えます。
これがどうなっているか調べれば、大きな数値がどのように`long`に変換されるのかいよいよ明らかになりますね。

ということで見てみましょう。ToInt32の定義は[ECMAScript仕様書の7.1.6 ToInt32(argument)の項](https://tc39.es/ecma262/#sec-toint32)にあります。
短いので全文引用します。

> 1. Let number be ? ToNumber(argument).
> 2. If number is NaN, +0, -0, +∞, or -∞, return +0.
> 3. Let int be the Number value that is the same sign as number and whose magnitude is floor(abs(number)).
> 4. Let int32bit be int modulo 2<sup>32</sup>.
> 5. If int32bit ≥ 2<sup>31</sup>, return int32bit - 2<sup>32</sup>; otherwise return int32bit.

ステップ2からは、NaNや無限大が+0に変換されることが見て取れます。
`Infinity`を`setTimeout`に渡したときに一瞬でタイマーが呼ばれたのは、`Infinity`が0に変換されたからであることが分かりますね。
ステップ3は、小数を整数に変換する処理です。
ステップ4は、intを2<sup>32</sup>で割った余りをint32bitにすると言っています。
ここが値を32ビット整数に変換する本命の部分です。
ちなみに、「int module 2<sup>32</sup>」という言葉の意味は[5.2.5 Mathematical Operations](https://tc39.es/ecma262/#sec-mathematical-operations)で厳密に定義されています。
このままだと場合によっては32ビット整数の範囲におさまらない（[2<sup>31</sup>, 2<sup>32</sup>)の範囲に入る）ことがあるので、その場合は[-2<sup>31</sup>, 2<sup>31</sup>)の範囲に移します。
これがステップ5です。

以上のことから、`2 ** 53`を`setTimeout`に渡したときに一瞬でタイマーが発火した理由も明らかになります。
2<sup>53</sup>を2<sup>32</sup>で割った余りは0なので、ToInt32により0に変換されたからです。

より中途半端な値を渡すと、中途半端な値に変換されます。
例えば、`2 ** 53 + 3000`を`setTimeout`に渡すと、2<sup>32</sup>で割った余りが3000になるので3秒後に発火するでしょう。

```js
setTimeout(() => {
  console.log(`3秒経ちました！`);
}, 2 ** 53 + 3000);
```

## 結果が負の数になったときは？

`ToInt32`の結果が負の数になることもあります。
例えば`2 ** 31 + 1000`を渡した場合です。

```js
setTimeout(() => {
  console.log('この場合はどうなる？');
}, 2 ** 31 + 1000);
```

実はこの場合は一瞬で発火します。
その理由を知るには、HTML仕様書の`setTimeout`の定義に舞い戻る必要があります。
具体的には、[timer initialization steps](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timer-initialisation-steps)を見ます。
これは長いので全文引用はしませんが、ステップ10に次のように書いてあります。

> 10. If timeout is less than 0, then set timeout to 0.

ここで、負の数は0として扱われることが分かります。
なぜ負の数をサポートしないのに`long`という型なのか（WebIDLには`unsigned long`型も定義されています）という疑問が残りますが、それはおそらく歴史的経緯でしょう。

## まとめ

以上により、`setTimeout`に大きな数値を与えたときの挙動を完全に理解できましたね。
完全に理解するには、HTML仕様書・WebIDL仕様書・ECMAScript仕様書の3つを渡り歩く必要がありました。
まさに3つの仕様書の美しいコラボレーションと言えます。

## 余談: node.jsの場合

ところで、node.js（あとDenoなど）にも`setTimeout`が存在します。
しかし、`setTimeout`はHTML仕様書で定義されている概念だったので、node.jsの`setTimeout`はHTML仕様書に縛られません。
ブラウザに合わせてnode.jsが気を利かせて`setTimeout`を実装してくれているのです。
つまり、ここまで解説した内容にnode.jsが律儀に従う義理は無いということです。

実際、node.jsの`setTimeout`は、HTML仕様書に定義されているのとは多少異なる挙動をします。
[Node.jsのsetTimeoutのドキュメント](https://nodejs.org/dist/latest-v12.x/docs/api/timers.html#timers_settimeout_callback_delay_args)を読んでみると、与えられる数値に関して次のような記述があります。

> When delay is larger than 2147483647 or less than 1, the delay will be set to 1. Non-integer delays are truncated to an integer.

つまり、2147483647（2<sup>31</sup>-1）より大きいか1より小さい数値は全て1として扱われると言うことです。
32ビット整数の範囲をサポートするという点は共通していますが、2<sup>32</sup>で割った余りを取るといった挙動はありません。
実際、次のコードをnode.jsで実行すると、3秒待つのではなく一瞬で実行されます。

```js
setTimeout(() => {
  console.log(`3秒経ちました！`);
}, 2 ** 53 + 3000);
```
