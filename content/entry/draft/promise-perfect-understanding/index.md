---
title: Promiseを完全に理解する（ES2020版）
published: "2029-07-01T09:00+09:00"
tags:
  - ECMAScript
  - JavaScript
---

JavaScriptに存在する**Promise**という機能は非同期処理を表す標準的な方法で、ES2015からECMAScript標準（JavaScriptの言語仕様）に取り入れられています。
この記事では、Promiseの挙動について完全に理解することを目指します。
参照する言語仕様は、[ECMAScript® 2020 Language Specification](https://tc39.es/ecma262/2020/)です。

## 基礎の基礎

まず、Promiseの基本的な使い方を解説します。
Promiseは、何らかの**非同期処理**（ここではすぐに終わらない処理のことだと思って構いません[^note_async_op]）の実行を開始した際に得られるオブジェクトです。
例えば、最近のブラウザでは[fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)を標準で使用することができます。
お好きなブラウザで適当なウェブページを開き、コンソールを開いて（F12などを押すと開きます）次のように入力して実行してみてください。

[^note_async_op]: より正確には、実行をブロックせずに裏で続行される処理のことを非同期処理と呼びます。JavaScriptでは、一部の例外を除いて時間のかかる処理は非同期処理として行われます。

```js
fetch("/")
```

例えばGoogle Chromeでこれを実行した場合、`Promise {<pending>}`と表示されます。
これは、`fetch("/")`という関数呼び出しの結果として`Promise`オブジェクトが得られたことを意味しています。
中身が`pending`と表示されているのは、`fetch`により実行される非同期処理がまだ完了していないことを意味しています。

この`fetch`はHTTP/HTTPSリクエストを発行するためのAPIです。
通信には必然的に時間がかかるため、`fetch`は非同期処理として実行されます。
そのため、`fetch`は`Promise`オブジェクトを返すのです。
`Promise`オブジェクトが返された瞬間に`pending`となっていたのは、通信を開始した瞬間にすでに終了しているというのはあり得ませんから当然のことです。

### 非同期処理の結果を取得する

非同期処理は実行開始したら`Promise`オブジェクトが得られますが、どちらかと言えば非同期処理の結果を得るほうが重要ですね。
例の`fetch`の場合、非同期処理の結果は当該HTTP/HTTPSリクエストに対するレスポンスです（より正確には、`fetch`の場合はステータスコードとヘッダが返ってきた段階で`Promise`が解決されます。レスポンスボディを得るにはさらに非同期処理が必要です）。

`Promise`オブジェクトに対しては、`then`メソッドを呼び出すことで、非同期処理が完了したときに実行されるべき関数を登録することができます。
具体例としては次のようにすれば、`fetch`により返された`Promise`オブジェクトに対して`then`で関数が登録されるので、レスポンスが返ってき次第`/`に対するリクエストの結果のステータスコードが表示されるでしょう（大抵の場合は`200`となるはずです）。
これは、`Promise`の結果である[Responseオブジェクト](https://developer.mozilla.org/en-US/docs/Web/API/Response)を引数`res`として取得し、その`status`プロパティを表示するという処理を表しています。

```js
fetch("/").then(res => console.log(res.status));
```

このように、`Promise`オブジェクトには結果が伴い、それは非同期処理が完了次第`then`で登録された関数に引き渡されます。
これが最も基本的な`Promise`の使い方です。
`Promise`の結果は非同期処理の結果ですから、どのような非同期処理を行なったかによって異なります。
今回の例の`fetch`の場合は`Response`オブジェクトが結果となります。

### 非同期処理が失敗する場合

`Promise`は、成功 (fulfill) する場合と失敗 (reject) する場合があります（ちなみに、成功と失敗を合わせて settle と呼びます）。
上記のように`then`を使う場合は、成功の場合の処理のみを登録したことになります。
失敗時の処理を登録するには、次のように`catch`メソッドを使うことができます。

```js
fetch("https://example.invalid/").catch(err => console.log(err));
```

この例では、`https://example.invalid/`という存在しないURLに対するリクエストを発行しているため、この非同期処理（`fetch`が返す`Promise`オブジェクト）は失敗します。
その結果、`catch`メソッドで登録した関数に失敗（エラー）を表すオブジェクトが渡されます。
Google Chromeでこれを実行すると、`TypeError: Failed to fetch`と表示されます。

こちらの場合は、失敗時の処理のみが登録され、成功した場合は何も起きません。
成功と失敗両方の場合の処理を登録したい場合は、主に2つの方法があります。
一つは、`then`に2つの関数を渡す方法です。
この場合、最初の引数が成功時の処理、次の引数が失敗時の処理です。

```js
fetch("/").then(
  res => console.log(res.status),
  err => console.log(err)
);
```

もう一つは、メソッドチェーンで`then`と`catch`を順番に呼び出すことです。

```js
fetch("/")
  .then(res => console.log(res.status))
  .catch(err => console.log(err));
```

どちらも期待通りに動きますが、微細な違いは存在します。
それについては後々解説します（TODO: 本当に解説しているか見直す）。

### Promiseチェーン

Promiseの特徴は、`then`や`catch`といったメソッドにより**Promiseチェーン**が形成されるということです。
これは有り体に言えば、`then`や`catch`の返り値は新たな`Promise`オブジェクトだということです。
先ほどの例で`then`を呼び出した後にさらに`catch`を呼び出していましたが、これがまさにPromiseチェーンであり、これが可能となっているのは`then`の返り値が新たな`Promise`オブジェクトだからなのです。

この新たな`Promise`オブジェクトは、`Promise`なので当然成功したり失敗したりし、結果も伴います。
基本的には`then`や`catch`により返される`Promise`は成功し、その結果はメソッドに渡された関数の返り値となります。
試しに`then`を2つ繋げてそのことを確かめてみましょう。

```js
fetch("/")
  .then(res => {
    console.log(res.status);
    return 5000;
  })
  .then(num => console.log(num));
```

これを実行してみると、ステータスコード（`200`とか）とともに`5000`と表示されますね。
これが`console.log(num)`によって表示された部分です。
この挙動を理解するためには、プログラムを次のように書き換えてみると分かりやすいでしょう。
次のプログラムは先ほどのプログラムのメソッドチェーンを分解し、中間変数`p1`と`p2`を作っただけのものです。

```js
const p1 = fetch("/");
const p2 = p1.then(res => {
  console.log(res.status);
  return 5000;
});

p2.then(num => console.log(num));
```

このプログラム中の`p1`と`p2`はいずれも`Promise`オブジェクトです。
まず、`fetch`の結果を表す`Promise`である`p1`の結果は（成功すれば）`Response`オブジェクトとなります。
また、`p1.then`で作られた`Promise`である`p2`の結果は、`p1.then`に渡された関数の返り値となります。
この場合、`p1`が成功した段階で関数が実行されて`5000`が返されるので、その時点で`p2`も成功して`p2`の結果は`5000`となります。
よって、`p2.then`で渡された関数が実行され、`5000`とコンソールに表示されます。

一方で、`then`により作られた`Promise`が失敗する場合もあります。
その一例は、`then`に渡された関数が例外を発生させた場合です。
次の例の場合`p2`の結果は失敗となるので、それに対して`catch`メソッドで登録した関数が呼び出されます。

```ts
const p1 = fetch("/");
const p2 = p1.then(res => {
  console.log(res.status);
  throw new Error("ouch!");
});

p2.catch(err => console.log(err)); // Error: ouch!　と表示される
```

### 処理されなかった結果の伝播

`Promise`に対する`then`メソッドは成功の場合を処理し、`catch`メソッドは失敗の場合を処理します。
ただし、`then`に2つの関数を渡した場合、成功と失敗の両方を処理できます。

処理されなかったほうの結果はそのまま`then`や`catch`の返り値の`Promise`に伝播します。
少し前に出てきたメソッドチェーンの例を失敗するように書き換えてみます。

```js
fetch("https://example.invalid/")
  .then(res => console.log(res.status))
  .catch(err => console.log(err));
```

こちらも変数に分解してみるとこうなります。

```js
const p1 = fetch("https://example.invalid/");
const p2 = p1.then(res => console.log(res.status));

p2.catch(err => console.log(err));
```

これを実際に実行すると、`p1.then`に渡された関数は実行されない一方、`p2.catch`に渡された関数は実行されます。
これは次のように説明できます。
まず、`p1`はいつものように失敗します。
そして、`p2`は`p1.then`によって作られた`Promise`ですが、`then`は成功の場合に反応するのでこの関数は呼び出されません。
その結果、`p2`の結果は`p1`と同じになります。
すなわち、`p1`の失敗を表すエラーオブジェクトを伴って失敗となります。
これにより、`p2.catch`が反応してコンソールにエラーが表示されます。
ちなみに、`p2.catch`の返り値も当然ながら`Promise`です。
今回はこの`Promise`は使われていませんが、この`Promise`の結果は成功となります（結果の値は`console.log`の返り値である`undefined`です）。
なぜなら、`catch`によって作られた`Promise`も`then`と同様に、渡された関数の返り値が結果となるからです。
渡された関数がエラーを発生させたら`Promise`の結果が失敗となるという点も同じです。
