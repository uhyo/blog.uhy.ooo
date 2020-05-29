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

結論としては、最も大ざっぱに分けると**3種類**、最も細かく分けると**149種類**です。

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

つまり、あなたが新しいJavaScript処理系を作って、この処理系ではグローバルスコープの`this`は配列なんですよ〜〜〜というような主張をしても許されるということです。

ただし注意していただきたいのは、これは必ずしも処理系に自由があるわけ**ではない**ということです。引用部分の先頭に“if the host requires that ...”とあることから分かるように、JavaScriptを一部として組み込んだ別の仕様 (host) によってグローバルオブジェクトとかthisが何であるか定められていなければいけません。例えばウェブブラウザの場合はECMAScript仕様書に加えてHTML仕様書にも従わなければならず、これがhostに相当します。実際、HTML仕様書では[7.1.1 Creating browsing contexts](https://html.spec.whatwg.org/multipage/browsers.html#creating-browsing-contexts)において以下の記述があり、グローバルスコープの`this`は当該ブラウジングコンテキストにおけるWindowProxyオブジェクトでなければならないと定められています。

> 7. Let realm execution context be the result of creating a new JavaScript realm given agent and the following customizations:
>     - For the global object, create a new Window object.
>     - For the global **this** binding, use *browsingContext*'s WindowProxy object.

とはいえ、全く新しい仕様を打ち立てて好き勝手にthisを定義することもできるわけですから、可能性は無限大です。これはもう何種類とかそういった話ではないような気がしますが、とりあえず先に進みましょう。

### 関数スコープ

明らかに、一番話がややこしそうなのは関数スコープ（function Environment Record）ですね。ここが今回の本題です。まず先ほどの表を見返してみましょう。

| スコープ | HasThisBinding() | GetThisBinding() |
|:--|:--|:--|
| function Environment Record | 自身の[[ThisBindingStatus]]がlexicalなら**false**、そうでなければ**true**を返す。 | 自身の[[ThisValue]]を返す。ただし、自身の[[ThisBindingStatus]]がuninitializedならReferenceErrorが発生する。

まず、関数は[[ThisBindingStatus]]という状態を持ちます。[8.1.1.3 Function Environment Records](https://tc39.es/ecma262/#sec-function-environment-records)によれば、これはlexical, initializd, uninitializedの3種類の値をとります。このうち、thisの値を（[[ThisValue]]）を得ることができるのはinitializedの場合だけです。

それでは、function Environment Recordがどのように作られるのか、そしてそのとき[[ThisBindingStatus]]や[[ThisValue]]がどうなるのか調べます。

実は、function Environment Recordは[NewFunctionEnvironment(F, newTarget)](https://tc39.es/ecma262/#sec-newfunctionenvironment)を介して作られます。ここで*F*は関数オブジェクトであり、*newTarget*はその名の通り`new.target`に相当するものです。関数内のスコープというのは関数が呼び出された際に実体化されますから、関数が呼び出された際にNewFunctionEnviromentが（仕様書上の内部処理として）実行されることになります。
NewFunctionEnvironmentの定義の中で重要な部分を抜粋します。

> 5. If *F*.[[ThisMode]] is lexical, set *env*.[[ThisBindingStatus]] to lexical.
> 6. Else, set *env*.[[ThisBindingStatus]] to uninitialized.

これによれば、関数のスコープが作られた段階では[[ThisBindingStatus]]はlexicalかuninitializedであり、それはF.[[ThisMode]]がlexicalかどうかによって決まります。[Table 27: Internal Slots of ECMAScript Function Objects](https://tc39.es/ecma262/#table-27)には、関数オブジェクトの[[ThisMode]]について次のように書かれています。これによれば、[[ThisMode]]はlexical, strict, globalのいずれかです。

> Defines how `this` references are interpreted within the formal parameters and code body of the function. lexical means that `this` refers to the **this** value of a lexically enclosing function. strict means that the **this** value is used exactly as provided by an invocation of the function. global means that a **this** value of **undefined** or **null** is interpreted as a reference to the global object, and any other **this** value is first passed to ToObject.

ここは本題ではないので結論から言ってしまえば、アロー関数は[[ThisMode]]がlexicalであり、そうでない関数はstrictモードかどうかによってstrictかglobalになります。つまり、NewFunctionEnvironmentで作られる関数スコープは、アロー関数の場合は[[ThisBindingState]]がlexicalであり、そうでない場合は[[ThisBindingState]]がuninitializedになります。

この時点で、**アロー関数内のthis**について説明がついたことになります。アロー関数内の関数スコープは[[ThisBindingStatus]]がlexicalとなりますから、これはHasThisBinding()がfalseを返す、すなわち自身のthisを持たないスコープとなります。

これが意味することは、アロー関数の中で参照されたthisはその外側のスコープに探しに行かれるということです。言い方を変えれば、アロー関数内のthisはその外側のthisと同じです。

一方で、アロー関数以外の場合は[[ThisBindingState]]はuninitializedとなりますが、値の名前が示唆するようにこれは一時的なものであり、のちのちinitializedに変わります。[[ThisBindingState]]で仕様書を検索すると、この操作は[8.1.1.3.1 BindThisValue(V)](https://tc39.es/ecma262/#sec-bindthisvalue)で定義されていることが分かります。

> **8.1.1.3.1 BindThisValue(*V*)**
> 1. Let envRec be the function Environment Record for which the method was invoked.
> 2. Assert: envRec.[[ThisBindingStatus]] is not lexical.
> 3. If envRec.[[ThisBindingStatus]] is initialized, throw a ReferenceError exception.
> 4. Set envRec.[[ThisValue]] to V.
> 5. Set envRec.[[ThisBindingStatus]] to initialized.
> 6. Return V.

そこで、次はBindThisValueを呼び出している箇所を探すことになりますね。関数呼び出しについては深い話題なので、ここからをステップ3としましょう。

## ステップ3. 関数呼び出しにおけるthis

BindThisValueが呼び出される箇所は2つあり、1つは[9.2.1.2 OrdinaryCallBindThis(*F*, *calleeContext*, *thisArgument*)](https://tc39.es/ecma262/#sec-ordinarycallbindthis)です。これが関数スコープのthisをセットする箇所ですが、引数を見るとわかる通り関数にセットされるべきthisはすでに*thisArgument*として渡されています。OrdinaryCallBindThisが行なっているのは、「**非strictモードの関数においては、thisが`null`または`undefined`ならば[[ThisValue]]はグローバルオブジェクトになる**」という処理です。この変換が*thisArgument*に対して行われたあとにBindThisValueが呼び出されます。なお、strictモードの関数では、thisが`null`や`undefined`の場合はそのままそれが[[ThisValue]]になります。

言い換えれば、非strictモードの関数ではその中でthisが`null`や`undefined`になることはあり得ないということです。これは非strictモード関数の顕著な特徴です。

さて、OrdinaryCallBindThisは関数オブジェクトが持つ内部メソッドである[[Construct]]（[9.2.2 [[Construct]]](https://tc39.es/ecma262/#sec-ecmascript-function-objects-construct-argumentslist-newtarget)）および[[Call]]（[9.2.1 [[Call]]](https://tc39.es/ecma262/#sec-ecmascript-function-objects-call-thisargument-argumentslist)）から依存されています。名前からわかる通り、前者は関数がコンストラクタとして呼び出された場合、後者は普通に呼び出された場合です。コンストラクタの場合は後回しにして、ここでは後者を見ていきます。[[Call]]のシグネチャは[[Call]] (*thisArgument*, *argumentsList*) なので、thisの値はさらに外側から供給されることになります。

ただし、仕様書内で[[Call]]を直接呼んでいる箇所はなく、「オブジェクトの[[Call]]内部メソッドを呼ぶ。呼べない場合はTypeErrorが発生」として定義される抽象操作Call（[7.3.13 Call (*F*, *V* [, *argumentsList* ])](https://tc39.es/ecma262/#sec-call)）を経由して呼ばれます。たらい回しにもそろそろ飽きてきた頃かと思いますが、もう少しでゴールなのでお付き合いください。

抽象操作Callは「関数を呼び出す」という操作を表すものですから、例えば`func()`というようなプログラムを評価した場合は最終的にこのCall抽象操作が呼ばれます（[12.3.6.2 Runtime Semantics: EvaluateCall](https://tc39.es/ecma262/#sec-evaluatecall)）。

しかし、Callが使われるのはそれだけに限りません。関数呼び出しの構文を明示的に用いなくても、内部動作として暗黙のうちに関数が呼び出される場合があります。例えばfor-of文では、与えられたオブジェクトの`[Symbol.iterator]`メソッドが暗黙のうちに呼び出されてイテレータが生成されます。さらに、そのイテレータの`next`メソッドを繰り返し呼び出すことでイテレータの要素が順番にループされます。

```js
// このコードではfor-of文による暗黙の関数呼び出しが6回発生する
const arr = [1, 2, 3, 4, 5];
for (const elm of arr) {
  console.log(elm);
}
```

別の例としては、`Array.prototype.forEach`のような組み込み関数がコールバック関数を受け取る場合が挙げられます。組み込み関数がどのようにコールバック関数を呼び出すかは仕様書によって定義され、プログラム中に明示的に関数呼び出しの構文が現れることはありません。実際、`forEach`の定義（[22.1.3.12 Array.prototype.forEach ](https://tc39.es/ecma262/#sec-array.prototype.foreach)）の中ではCallが使われています。

```js
const arr = [1, 2, 3, 4, 5];
// forEachによって内部的に関数呼び出しが発生する
arr.forEach(elm => {
  console.log(elm);
});
```

このような場合も含めると、仕様書内でCallを使用している箇所は**109箇所**あり、それぞれにおいて、その呼び出しにおいてthisが何になるか（呼び出しによって作られる関数スコープの[[ThisValue]]がどうなるか）が個別に定義されています。これを全て別に数えるならば、この時点で関数呼び出しにおけるthisの種類が最低でも109あることになります。頭が痛いですね。

### 関数呼び出し構文による関数呼び出し

これで終わりとすることもできますがそれは少し乱暴なので、関数呼び出し構文を用いた直接的な関数呼び出しをピックアップします。関数呼び出しの構文（`func(arg)`のような）の評価は[12.3.6.2 Runtime Semantics: EvaluateCall (*func*, *ref*, *arguments*, *tailPosition*)](https://tc39.es/ecma262/#sec-evaluatecall)で定義されています。ここで、refというのは`func(arg)`の`func`部分の評価結果です。一番最初にその関数呼び出しにおけるthisの値（thisValue）が決められますので、その部分を抜粋します。

> 1. If Type(*ref*) is Reference, then
>     - If IsPropertyReference(*ref*) is true, then
>       - Let *thisValue* be GetThisValue(*ref*).
>     - Else,
>       - Assert: the base of *ref* is an Environment Record.
>       - Let *refEnv* be GetBase(*ref*).
>       - Let *thisValue* be *refEnv*.WithBaseObject().
> 2. Else,
>     - Let *thisValue* be undefined.

詳細は省きますが、見たところ3種類の分岐があります。さらに、IsPropertyReference(ref)がtrueだった場合に呼び出されるGetThisValue(ref)の結果が実は2種類あり、refEnv.WithBaseObject()の結果も場合により2種類に大別できますから、関数呼び出し構文によって関数が呼び出された場合、その中でのthisは**5種類**あります。その5種類とは、以下の通りです。

**1. 関数がプロパティアクセスで得られた場合:** thisはプロパティを持つオブジェクトになります。次の例の場合、関数が`obj.method`で呼び出されていますので、呼び出された関数の中で`this`は`obj`になります。ちなみに、この`obj`のことをレシーバと呼びますので、この場合thisにはレシーバが入ると説明できます。

```js
const obj = {
  method: function() {
    console.log(this === obj);
  }
};

obj.method(); // true が表示される
```

**2. 関数がsuperプロパティアクセスで得られた場合:** thisの値は外側の値（superプロパティアクセスが行われた場所でのthisの値）と同じになります。

```js
class Base {
  getThis() {
    return this;
  }
}

class Super extends Base {
  test() {
    console.log(this === super.getThis());
  }
}

(new Super()).test(); // true が表示される
```

**3. with文のスコープに属する変数に対するアクセスによって得られた関数の場合:** with文に与えられたオブジェクトがthisとなります。

```js
const obj = {
  method: function() {
    console.log(this === obj);
  }
};

with(obj) {
  method(); // true が表示される
}
```

**4. with文のスコープ以外に属する変数に対するアクセスによって得られた関数の場合:** thisはundefinedとなります。ただし、前述の機構により、非strictモードの関数の場合はthisはグローバルオブジェクトとなります。

```js
// 非strictモードのコード
const func = function() {
  console.log(this === globalThis);
};
const strictFunc = function() {
  "use strict";
  console.log(this === undefined);
}

func();       // true が表示される
strictFunc(); // true が表示される
```

**5. 変数アクセス・プロパティアクセス以外の方法で得られた関数の場合:** 上と同様にthisはundefined（またはグローバルオブジェクト）となります。

```js
// 非strictモードのコード
const obj = {
  method: function() {
    console.log(this === globalThis);
  },
  strictMethod: function() {
    "use strict";
    console.log(this === undefined);
  }
};

// コンマ演算子を経由することでReferenceではなく値にする
(0, obj.method)();       // true が表示される
(0, obj.strictMethod)(); // true が表示される
```

以上が関数呼び出し構文において起こりうる5種類のthisについての説明です。

### new呼び出しにおけるthis

次のテーマはnew呼び出し、すなわち`new func(...)`という構文の場合です。すでに説明した通り、OrdinaryCallBindThis抽象操作は関数オブジェクトが持つ内部メソッドである[[Construct]]（[9.2.2 [[Construct]]](https://tc39.es/ecma262/#sec-ecmascript-function-objects-construct-argumentslist-newtarget)）からも呼び出されます。[[Call]]の場合とは異なり、コンストラクタとして関数が呼び出された場合にthisを設定する処理は[[Construct]]内部メソッドの中に書かれています。関係する場所を抜粋します。

> 4. Let *kind* be *F*.[[ConstructorKind]].
> 5. If *kind* is base, then
>     - Let *thisArgument* be ? OrdinaryCreateFromConstructor(*newTarget*, "%Object.prototype%").
> 
> （中略）
> 8. If *kind* is base, perform OrdinaryCallBindThis(*F*, *calleeContext*, *thisArgument*).
> 9. Let *constructorEnv* be the LexicalEnvironment of *calleeContext*.
> 10. Let *result* be OrdinaryCallEvaluateBody(*F*, *argumentsList*).

Fというのが`new`で呼び出される関数であることに注意すると、[[Construct]]の処理はその[[ConstructorKind]]（これはbaseかderivedの2種類をとります）がbaseかどうかによって変化することが分かります。特に、baseの場合はthisとなるものがOrdinaryCreateFromConstructor抽象操作（[9.1.13 OrdinaryCreateFromConstructor](https://tc39.es/ecma262/#sec-ordinarycreatefromconstructor)）によって作られることが分かります。

詳細は省きますが、これは「コンストラクタの中ではthisは新しく作られたインスタンスである」というよく知られた挙動に対応します。言うまでもなく、OrdinaryCreateFromConstructorが実際にインスタンスを作る処理です。

さて、[[ConstructorKind]]がbaseである場合と述べましたが、baseでない（derivedである）のはどんな時でしょうか。答えは、`extends`を使って宣言されたクラス（サブクラス）のコンストラクタである場合です。サブクラスのコンストラクタでは、`super()`呼び出しを行う必要があり、実はこのときに初めてthisが初期化されます（[12.3.7.1 Runtime Semantics: Evaluation](https://tc39.es/ecma262/#sec-super-keyword-runtime-semantics-evaluation)）。なお、少し前に「BindThisValueを呼び出している箇所は2つ」と述べましたが、もう一箇所がここです。

このような仕様になっている理由は、JavaScriptではコンストラクタ内で`return`文を使うことで`new`の結果を上書きできるからです。このため、親クラスのコンストラクタを呼び出してみないと上書きが発生するかどうか分かりません。上書きが発生した場合は、上書き後の結果が子クラスのコンストラクタ内のthisになります。

ちなみに、ずっと前に「[[ThisBindingStatus]]がuninitializedの場合にthisを参照するとReferenceErrorが発生する」と言うことを紹介しましたが、その具体例が「子クラスのコンストラクタ内で`super()`呼び出しより前にthisを参照した場合」です。

```js
class Base {}
class Super extends Base {
  constructor() {
    console.log(this); // ReferenceErrorが発生
    super();
  }
}

new Super();
```

結論としては、これは数え方が難しいですが、関数がコンストラクタとして呼び出された場合のthisの挙動は3種類あります。子クラスのコンストラクタの場合は状況に応じて「ReferenceErrorになる」か「`super()`の結果がthisになる」の2つであり、それ以外の場合はコンストラクタ呼び出しの時点でインスタンスとしてthisが用意されます。

## ステップ4. thisの種類を数える

ここまでの解説でthisの仕様を網羅できました。では、thisの種類を数えてみましょう。お察しの通り、色々な数え方が可能であり、数え方によって当然数が異なります。

### 最も大雑把な分類

最も大雑把な分類は、**thisが由来するスコープの種類**による分類です。この場合thisは3種類に分類できます。

1. モジュールスコープに由来するthis（常にundefined）。
2. グローバルスコープに由来するthis（通常はグローバルオブジェクトだがホスト依存）。
3. 関数スコープに由来するthis。

グローバルスコープに由来するthisは原則としてグローバルオブジェクトですが、ホストという上位概念によって自由に定義される余地があるため無限の可能性があります。まあ、それは流石に無茶ですから、とりあえず1種類としておきましょう。

### 呼び出され方に着目して関数スコープを細分化する

関数スコープはこの記事で長々と説明したように、細分化の余地があります。**関数の呼び出され方**に着目すれば、以下のように分類できます。それぞれの場合thisがどうなるかはこの記事で説明済みなので省略します。

1. メソッド呼び出しの場合。
2. superメソッド呼び出しの場合。
3. with文のスコープに由来する変数を関数として呼び出した場合。
4. 上記以外の変数を関数として呼び出した場合。
5. プロパティアクセス・変数以外の方法で得た関数を呼び出した場合。
6. サブクラスのコンストラクタ以外を`new`で呼び出した場合。
7. サブクラスのコンストラクタを`new`で呼び出した場合（`super()`前）。
8. サブクラスのコンストラクタを`new`で呼び出した場合（`super()`後）。
9. 組み込み関数・構文を通じて間接的に呼び出された場合。

このうち、最後の「組み込み関数・構文を通じて間接的に呼び出された場合」は、さらに細分化して個別のケースを数えると全部で108種類あります。

さらに細分化することもできます。というのは、thisがundefinedやnullになる場合は呼び出される関数がstrictモードかどうかによって関数の中でのthisが変わるのでした。これらを別々に数えるならば、まず上の例のうち4と5は`this`がundefinedとなるためそれぞれ2種類として数えられます。また、9に含まれる108種類のうち、非strict関数がthisをundefinedとして呼ばれる可能性があるものは29個あります。

## 結論

最も細分化して数えた場合、thisは**149種類**です。まとめると次のようになります。ただし、処理系依存で変化するやつは仕方ないのでここではカウントしません。

- モジュールスコープに由来するthis
- グローバルスコープに由来するthis
- 関数スコープに由来するthis
  - メソッド呼び出しの場合
  - superメソッド呼び出しの場合
  - with文のスコープに由来する変数を関数として呼び出した場合
  - 上記以外の変数を関数として呼び出した場合
      - 非strictモード関数の場合
      - strictモード関数の場合
  - プロパティアクセス・変数以外の方法で得た関数を呼び出した場合
      - 非strictモード関数の場合
      - strictモード関数の場合
  - サブクラスのコンストラクタ以外を`new`で呼び出した場合
  - サブクラスのコンストラクタを`new`で呼び出した場合（`super()`前）
  - サブクラスのコンストラクタを`new`で呼び出した場合（`super()`後）
  - 組み込み関数・構文を通じて間接的に呼び出された場合
      - 非strictモード関数の場合: 29種類
      - strictモード関数（および組み込み関数）の場合: 108種類

149という具体的な数字は、言語仕様の変化によって簡単に変動しますので目安としてご理解ください。
また、そもそもthisの数え方に異論があるという方もいるでしょうから、あくまで一つの考え方であることをご理解ください。

万が一数え間違いを発見された方はぜひお知らせください。

### Q&A

- Q. `Function.prototype.apply`とかは？
- A. 108種類の中に入ってます。

- Q. `Function.prototype.bind`は？
- A. 108種類の中に入ってます。

