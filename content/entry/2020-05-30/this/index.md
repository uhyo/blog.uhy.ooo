---
title: JavaScriptのthisは結局何種類あるのか
published: "2020-05-30T09:00+09:00"
tags:
  - JavaScript
  - ECMAScript
---

JavaScriptのややこしい機能としてよく槍玉に挙げられるのが**this**です。その特徴のひとつは**状況によって意味（thisの値）が違う**ことであり、これを指して「JavaScriptのthisは4種類」とする説も見られます。

そこで、この記事ではthisが何種類あるのか、**ECMAScript仕様書**を頼りに調べます。ECMAScript仕様書とはJavaScriptという言語を定義する文書であり、JavaScriptの`this`がどのような挙動をするのかも当然定義されています。今回は仕様書の2020年5月26日版ドラフトを参照します。

- https://tc39.es/ecma262/

## ステップ1. `this`の値はどう取得されるのか

さっそく仕様書を見ていきましょう。今回は`this`の挙動を調べたいので、まず`this`の定義を調べなければいけません。

### `this`の定義を調べる

`this`は式ですから、12章（ECMAScript Language: Expressions）を探せば見つかります。実際、[12.2.2 The `this` Keyword](https://tc39.es/ecma262/#sec-this-keyword)にて定義されています。なお、変数（[12.1 Identifiers](https://tc39.es/ecma262/#sec-identifiers)）とは別個に定義されていることから明らかなように、`this`は変数ではありません。

`this`のRuntime Semantics（`this`が評価されたときに起こることの定義）は次の1行だけで、実際の挙動は[8.3.4 ResolveThisBinding()](https://tc39.es/ecma262/#sec-resolvethisbinding)で定義される抽象操作（*abstract operation*）によって定義されていることがわかります。

> 1. Return ? ResolveThisBinding().

注意点としては、このResolveThisBindingというのは抽象操作、つまり言うなれば仕様書内専用に定義された関数のようなもので、JavaScriptプログラムで扱われる通常の関数とは別物です。

常に`this`はResolveThisBinding()の結果なんだから1種類じゃんと言えなくもありませんが、さすがに大ざっぱすぎますね。ResolveThisBinding()の定義に移りましょう。

## ResolveThisBindingの定義を調べる

ResolveThisBinding()の定義はこうです。

> 1. Let *envRec* be GetThisEnvironment().
> 2. Return ? *envRec*.GetThisBinding().

新しい抽象操作GetThisEnvironment()が登場しました。これは[8.3.3 GetThisEnvironment()](https://tc39.es/ecma262/#sec-getthisenvironment)で定義されています。何だかたらい回しにされている気分ですが、GetThisEnvironment()によって何らかの環境（Environment Record）を得ることができ、それが`this`の中身を知っているということになりそうです。

### GetThisEnvironmentの定義を調べる

GetThisEnvironment()の定義はこうです。

> 1. Let env be the running execution context's LexicalEnvironment.
> 2. Repeat,<br>
> a. Let *exists* be env.HasThisBinding().<br>
> b. If *exists* is true, return *env*.<br>
> c. Let *outer* be *env*.[[OuterEnv]].<br>
> d. Assert: *outer* is not null.<br>
> e. Set *env* to *outer*.

定義にループが登場しましたね。このように、仕様書では関数や抽象操作の挙動が自然言語で表現されます。ポイントは、ここで[running execution context](https://tc39.es/ecma262/#running-execution-context)という概念が登場したことです。これはプログラムの実行状態の情報を持っている仕様書上の存在であり、ここではそこからLexicalEnvironmentを取り出して*env*に入れています。

LexicalEnvironmentとは、ざっくり言えば**プログラムが今いる変数スコープ**のことです。変数スコープのことは仕様書用語で**Environment Record**（環境レコード）と呼ばれます。running execution contextのLexicalEnvironmentは必ず何らかのEnvironment Recordです。環境というのは変数の中身を保持している存在のことを指すやや専門的な用語ですが、ここでは分かりやすく**スコープ**と呼んでいきましょう。

プログラムの各地点は、必ず何らかのスコープの中に居ます。そして、変数が出てきたときはそのスコープを頼りに変数の中身が取得されます。つまり、「今プログラムがどのスコープに居るか」という情報がここで取得されているのです。

ご存知の通り、スコープはネストしています。つまり、あるスコープに存在しない変数が参照されたときは、その外側のスコープが探されます。一番外側のスコープ（グローバルスコープ）まで探しても変数が無かった場合はエラーとなります。

上記の定義の2では、ループによりスコープのチェーンを内側から外側に遡っています。よく読むと*env*.[[OuterEnv]]というものが参照されていますが、このように[[ ]]で表されるものはインターナルスロットです（詳しくは[筆者の過去記事](https://qiita.com/uhyo/items/b63ac11e8ec54d2c3a2b)をご参照ください）。ここでは、*env*.[[OuterEnv]]は*env*のひとつ外側のスコープであると理解すれば問題ありません。

結局このアルゴリズムは、スコープを内側から外側へ辿っていって、*env*.HasThisBinding()を満たすものを見つけたらそのスコープを返すということになります。ちなみに、一番外側のスコープ（グローバルスコープ）はこれを満たすので、このアルゴリズムは必ず何らかのスコープを返します。

ここまでで分かったことは、**そもそも`this`はスコープに結びついている**ことと、**`this`を持つスコープと持たないスコープがある**ということです。実際の`this`の挙動は、「`this`を持つ、今いる場所から見て一番内側のスコープを探して、そのスコープが持つ`this`の値を返す」というものであることが分かりました。

そうなると、「`this`は何種類あるのか」という疑問に答えるには「スコープは何種類あるのか」及び「スコープが持つ`this`の値はどう決まるのか」ということを調べる必要がありそうです。

## ステップ2. スコープの種類

スコープ、すなわちEnvironment Recordは、仕様書の[8.1.1 The Environment Record Type Hierarchy](https://tc39.es/ecma262/#sec-the-environment-record-type-hierarchy)で定義されています。それによれば、Environment Recordは以下の5種類があります。

| 名前 | 説明 |
|:--|:--|
| declarative Environment Record | JavaScriptの構文要素に対応して作られるスコープ全般。 |
| function Environment Record | 関数の中のスコープ。declarative Environment Recordの一種。 |
| module Environment Record | モジュールのトップレベルのスコープ。declarative Environment Recordの一種。 |
| object Environment Record | `with`文で作られる特殊なスコープ。 |
| global Environment Record | グローバルスコープ。 |

これらはそれぞれがクラスのようなもので、これらのEnvironment RecordにおけるHasThisBinding()やGetThisBinding()は別々に定義されています。それを列記すると以下のようになります。

| スコープ | HasThisBinding() | GetThisBinding() |
|:--|:--|:--|
| declarative Environment Record | **false**を返す。 | - |
| function Environment Record | 自身の[[ThisBindingStatus]]がlexicalなら**false**、そうでなければ**true**を返す。 | 自身の[[ThisValue]]を返す。ただし、自身の[[ThisBindingStatus]]がuninitializedならReferenceErrorが発生する。
| module Environment Record | **true**を返す。 | **undefined**を返す。 |
| object Environment Record | **false**を返す。 | - |
| global Environment Record | **true**を返す。 | 自身の[[GlobalThisValue]]を返す。 |

このように、5種類のスコープのうち3つがthisを持っています（ただし、function Environment Recordは持っていない場合もあります）。順番に見ていきましょう

### モジュールスコープ 

上の表のうち、モジュールスコープ（すなわちmodule Environment Record）が一番簡単です。上の表ですでにGetThisBindingが**undefined**を返すと定義されていますね。これが意味することは、モジュールのトップレベルスコープ（関数の外）ではthisは`undefined`になるということです。

```html
<script type="module">
  // ここがモジュールスコープ
  console.log(this); // undefined が表示される

  {
    // ここはブロックスコープ
    console.log(this); // undefined が表示される
  }
</script>
```

この例の2つ目はモジュールスコープではなくブロックスコープの中ですが、このブロックスコープ（declarative Environment Recordの一種）はthisを持ちませんから、先ほど説明した通り、外側に遡ってthisが探されます。今回はすぐ外側にあるモジュールスコープがthisを持っている（undefinedですが）ので、これがthisの評価結果として返されることになります。

### グローバルスコープ

グローバルスコープ（global Environment Record）を見てみましょう。上の表では、GetThisBinding()は自身の[[GlobalThisValue]]を返すとあります。では、グローバルスコープの[[GlobalThisValue]]の中身はどう決まるでしょうか。

仕様書内を検索すると、[NewGlobalEnvironment(G, thisValue)](https://tc39.es/ecma262/#sec-newglobalenvironment)という抽象操作（これは名前からしてglobal Environment Recordを作る操作ですね）に渡された引数*thisValue*の値が[[GlobalThisValue]]にセットされていることが分かります。この*thisValue*の値としては何が渡されるのかを調べていくと、[8.5 InitializeHostDefinedRealm()](https://tc39.es/ecma262/#sec-initializehostdefinedrealm)に行き当たります。

これはRealmを初期化する抽象操作です。Realmの説明はちょっと難しいのですが、JavaScriptコードが属する世界のことだと思ってください。RealmはJavaScript実行環境の初期化の一環として作られます。グローバルスコープもRealmの一部であり、Realmを初期化する際にそのRealmに属するグローバルスコープも初期化されます。

グローバルスコープの[[GlobalThisValue]]が結局何になるかというのは、次に引用する部分に集約されています。

> 8​. If the host requires that the `this` binding in *realm*'s global scope return an object other than the global object, let *thisValue* be such an object created in an implementation-defined manner. Otherwise, let *thisValue* be **undefined**, indicating that realm's global this binding should be the global object.

つまり、基本的には（Otherwise以降の部分）thisというのはグローバルオブジェクト（グローバル変数をプロパティとして持つオブジェクト）ですが、それ以外の処理系依存（implementation-defined）な方法で作られたオブジェクトでもいいよということです。

つまり、あなたが新しいJavaScript処理系を作って、この処理系ではグローバルスコープの`this`は配列なんですよ〜〜〜というような主張をしても許されるということです。これはもう何種類とかそういった話ではないような気がしますが、とりあえず先に進みましょう。

