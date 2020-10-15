---
title: 作って理解するBabelマクロ
published: "2020-05-23T04:00+09:00"
tags:
  - JavaScript
  - Babel
  - babel-plugin-macros
---

Babelは今どきのJavaScript開発には欠かせないパーツのひとつです。その主な使い道は、新しいJavaScriptの文法を古いJavaScriptに変換するトランスパイラとしてのものでしょう。しかし、Babelをより広範に**マクロ**の機構として使おうという動きもあります。それを担うのが`babel-plugin-macros`というプラグインです。

ここで言うマクロとは、大ざっぱに言えばプログラムを生成するための機構であり、特にソースコード中に書かれるもののことです。例えばC言語などに見られる`#define`は原始的なマクロであると言えます。最近の言語ではRustが強力なマクロの機構を持ち、Rustの文法を逸脱したトークン列をソースコード中に書くことができます。そのようなプログラムはマクロによってRustプログラムに変換されます。マクロを用いることで、通常の言語機能では不可能なメタプログラミングを実現することができます。

このように、ランタイムの処理だけでは実現不可能なことをJavaScriptプログラムでもやりたいというのが、Babelでマクロ機構を実現する動機となります。ただ、Babelの場合、BabelがJavaScriptプログラムを取り扱うトランスパイラであるという性質上、マクロと言えどもJavaScriptの文法を逸脱することはできません。それでもなおマクロ的なことを行いたいユースケースがあるらしく、npmには`babel-plugin-macros`キーワードを持つパッケージが100以上公開されています。

最近では、いつのまにかstyled-componentsが`babel-plugin-macros`に対応しており、ドキュメントからも言及されています。ですから、特にReact使いの方は、名前だけは知っているという方も多いでしょう。しかし、その割に日本語の資料が乏しい分野です。筆者が発見した日本語資料は下記の一つだけでした。

- [babel-plugin-macrosは何がすごいのか](https://qiita.com/oedkty/items/65c2d29f9e34bed9ac17)

そこで、この記事ではBabelマクロの意義やその作り方を含めて解説します。実際に作ったマクロはこちらです。

- [infinite-recursion.macro](https://github.com/uhyo/infinite-recursion.macro)

## `babel-plugin-macros`パッケージは何をするのか

先ほどから名前が挙がっている[babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros)ですが、これは名前を見れば分かる通りBabelプラグインです。
これはマクロのベースとなる機構を提供するプラグインであり、**このプラグインを設定しておけば、全てのBabelマクロが使える**点を売りにしています。

Babelによるマクロ機構は自分でBabelプラグインを書けば実現できることですが、Babelプラグインを有効化するにはBabelのコンフィグに手を加える必要があります。様々なマクロを使いたい場合はBabelのコンフィグが煩雑化することになりますね。また、Create React AppのようにBabelのコンフィグを触らせてくれない環境では好きなBabelプラグインを使うことができません。

この問題を、`babel-plugin-macros`が間に入ることで解決します。実際、すでにCreate React AppはBabelの設定に`babel-plugin-macros`を導入しており（experimentalとされていますが）、Babelマクロでできる範囲に限られはするものの、Babelのコンフィグをいじれなくてもプログラムをかなり自由に変換できるようになっています。

### マクロの適用

`babel-plugin-macros`は、**インポート**を起点としてプログラム変換を行います。具体的には、`.macro`または`/macro`で終わる名前のモジュールからインポートした場合、マクロを使用したと見なされます。このような名前のパッケージはプログラム変換の実装をエクスポートしており、`babel-plugin-macros`がそれを動的にロードして、プログラム変換を適用するという流れです。

このため、典型的にはマクロは`.macro`で終わる名前のパッケージとしてリリースされることになります。また、`style-components/macro`のように既存のパッケージの一部としてマクロを含むことも可能です。

### Babelプラグインとの比較

Babelマクロはインポートを起点とするというのが絶妙な点であり、これは全ファイルに問答無用で適用される一般的なBabelプラグインとは異なる特徴です。

一般的なBabelマクロは、マクロからインポートされたものを使用している部分に対してのみプログラム変換を行います。これにより、トランスパイルというよりはメタプログラミング・コンパイル時計算のような使用感となります。やっていることは同じプログラム変換ではありますが、目指すゴールは一般的なBabelプラグインとは違うということが分かりますね。

また、実装しやすさという観点で見ると、Babelマクロの方が手軽です。一度`babel-plugin-macros`を設定してしまえば、あとは適切なパス（`.macro`か`/macro`で終わる）に関数をエクスポートするファイルを配置すればそれでマクロとなります。プラグインのお作法に従わなければならない一般のBabelプラグインと比べると、プロジェクト独自の変換を定義しやすくなっている点も魅力的です。

## Babelマクロを作ってみた

ここまで解説したようなことは、先ほど紹介した日本語記事にも書いてあります。この記事では次のステップに進むために、Babelマクロの作り方を解説します。

結論から言えば、Babelマクロを作るという作業はほとんど通常のBabelプラグインを作る作業と変わりません。ユーザーから見た使い勝手は異なりますが、裏の仕組みは変わらないのです。

### 今回作ったもの

今回作ったのは[infinite-recursion.macro](https://github.com/uhyo/infinite-recursion.macro)というマクロで、これは擬似的に関数が無限に再帰することを可能にするものです。

というのも、普通のJavaScript実行環境では関数の再帰の回数には上限があり、数万回も再帰すればランタイムエラーが発生してしまいます。

```js
function sum(upTo) {
  return upTo <= 0 ? 0 : upTo + sum(upTo - 1);
}
 
// RangeError: Maximum call stack size exceeded
console.log(sum(1e6));
```

基本的にこれの回避は不可能で、再帰を使わないで同じ処理をするようにプログラムを書き換えるしか回避方法はありません。
しかし、再帰で書いた方がプログラムが分かりやすくなる場面がありますよね。
そこで、このマクロが提供する`infinite`で関数をラップすることにより、どれだけ再帰させてもエラーが発生しなくなります。

```js
import { infinite } from "infinite-recursion.macro";
 
const sum = infinite(function sum(upTo) {
  return upTo <= 0 ? 0 : upTo + sum(upTo - 1);
});
 
// 500000500000
console.log(sum(1e6));
```

### 再帰回数の上限を撤廃する仕組み

上記のようなことがどのように実現されているかについては、Babelマクロですから当然ながらプログラム変換です。今回作るマクロでは、このプログラムが次のように変換されます。

```js
import { makeInfinite as _makeInfinite } from "infinite-recursion.macro/lib/runtime";
 
const sum = _makeInfinite(function* sum(upTo) {
  return upTo <= 0 ? 0 : upTo + yield [upTo - 1];
});
 
// 500000500000
console.log(sum(1e6));
```

やっていることは、`infinite`という関数を`makeInfinite`で置き換えること、`infinite`でラップされた関数をジェネレータ関数に変えること、そして再帰呼び出しを`yield`式に変えることです。
関数がジェネレータ関数に書き換えられたことでこれは再帰関数ではなくなり、`_makeInfinite`が裏でループを使って再帰の挙動を再現することで、元の再帰関数と同じ挙動を実現します。

実は、ジェネレータ関数を使って再帰を再現することに関しては筆者の既存記事ですでに説明しています。

- [JavaScriptで無限に再帰したい](https://qiita.com/uhyo/items/21e2dc2b9b139473d859)

このマクロでは再帰関数をジェネレータ関数に書き換えるところを自動化して、より自然・宣言的な形で無限に再帰できることを目指しています。

### マクロの作り方

では、いよいよ本題のマクロの作り方に入りましょう。

まず、先ほども説明したように、インポートのパスが`.macro`か`/macro`で終わっていれば`babel-plugin-macros`によってマクロであると認識されます。このパスからマクロの実装をエクスポートします。先ほどの例では`infinite-recursion.macro`から`infinite`関数をインポートしているように見えますが、実際にはそんな関数は`infinite-recursion.macro`からエクスポートされていません。このパッケージからエクスポートされているのはマクロの実装のみであり、そのマクロがまるで`infinite`という関数が存在するかのように見せかけたプログラム変換を行うのです。

[マクロ実装の本体](https://github.com/uhyo/infinite-recursion.macro/blob/master/src/index.ts)は次のような形をしています（TypeScriptかつCommonJSなので懐かしの`export =`構文が出てきています）。

```ts
export = createMacro(({ references, state, babel, source }) => {
  // ...
});
```

これは関数を`createMacro`で囲った形であり、この関数がマクロの実装本体です。この関数は、マクロがインポートされるたびに呼び出されます。そして、マクロから何がインポートされて、どこで使われているかの情報が`references`に与えられます。例えば、マクロから`infinite`がインポートされていた場合は、`references.infinite`に`NodePath`の配列が入っています。これを見て`infinite`が使われている箇所を適切に変換するのがマクロの役目です。なお、`NodePath`というのはBabelの概念であり、ASTノードの位置を指し示す感じのオブジェクトです。

ここから先は、普通のBabelプラグインを作る場合と何も変わりません。マクロで提供したい機能に応じて愚直にASTを変換することになります。
例えば、`infinite`の機能を提供する部分の序盤は以下のようになっています。ここで、`path`というのが`infinite`が使用されている場所を表す`NodePath`です。

```ts
const { node, parentPath } = path;
if (parentPath.isCallExpression() && parentPath.node.callee === node) {
  // infinite(...)
  const { node: parent } = parentPath;
  const args = parent.arguments;
  if (args.length !== 1) {
    // invalid
    continue;
  }
  const [firstArg] = args;
  if (!checkForNamedFunctionExpression(firstArg)) {
    continue;
  }
  // ...
}
```

今回見たいのは`infinite`が関数として使われている場合なので、`infinite`が`infinite(...)`の形で使われているかを調べます。それが最初の`if`文の条件です。この条件が満たされる場合、さらに`infinite`の引数が1つかどうかをチェックします。その次の`checkForNamedFunctionExpression`というのは、`infinite`の引数が`function 関数名(...) { ... }`という形かどうかをチェックしています。

このことから分かるように、厳密にこの形で`infinite`を使用しないとうまく動作しません。BabelマクロはJavaScriptの文法を持ったDSLみたいなものですから、これはまあ仕方のないことです。使い方を間違ったら適当にエラーが出るでしょう。

残りの部分はこれですね。詳細は省略しますが、`handleRecFunc`というのは関数式の中身の再帰呼び出しを`yield`式に書き換えて、さらに関数式をジェネレータ関数に変更する処理です。
そのあとの部分は`makeInfinite`を読み込むimport文を追加する処理です。
今回の変換はランタイムが必要なので、それは`infinite-recursion.macro/lib/runtime`という別の場所から実際にエクスポートしています。
最後に、インポートした`makeInfinite`で`infinite`を置き換えれば完成です。

```ts
const funcPath = (parentPath.get("arguments.0") as unknown) as NodePath<
  FunctionExpression
>;
const res = handleRecFunc(firstArg.id, funcPath);
if (!res) {
  continue;
}
// wrap with runtime
const programScope = path.scope.getProgramParent();
programScope.path;
const programPath = programScope.path as NodePath<Program>;
const importDecl = importRuntime(programPath, source);
const runRecursiveLoc = importInDecl(
  importDecl,
  programScope,
  "makeInfinite"
);
// replace infinite(...) with makeInfinite(...)
path.replaceWith(runRecursiveLoc);
```

以上がマクロの実装方法でした。

## まとめ・所感

この記事では`babel-plugin-macros`をベースに作られるBabelマクロについて解説し、実装例を示しました。このプラグインはBabelのプラグインシステムの上にさらにもう一段独自のプラグインシステムを重ねるようなもので、マクロのインポートを基点に動作するという特徴を持ちます。マクロの実装者からすれば、マクロを定義するのがとても簡単で、またインポートされたものが使用された場所をリストアップしてくれるのが便利ですが、そこから先は通常のBabelプラグインと同様にASTの変換としてマクロを実装することになります。

Babelを通さないと実行できないJavaScriptプログラムはどうなのと思われる方もいるかもしれませんが、そもそもWebpackに頼っていればその時点で大差ない話ですから、あまり気にしなくても良いのではないかというのが個人的な意見です。
Babelマクロはとても手軽に作れるので、うまく使えば強力な武器となります。

また、TypeScriptで高度な型を扱うのが好きな方はBabelマクロが肌に合うかもしれません。というのも、高度なTypeScriptプログラムでは「型定義だけ辻褄を合わせておいて内部実装は`any`とかを使っている」というようなことが発生しがちですが、Babelマクロはそれをさらに発展させて「インターフェースだけ辻褄を合わせておいて内部実装はトランスパイル時に何とかする」と見ることもできるからです。

できないと諦めていたことも、Babelマクロなら自然にできるかもしれません。ぜひ選択肢の一つとして持っておきましょう。