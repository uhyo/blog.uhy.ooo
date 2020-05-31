---
title: JavaScriptのthisは結局何種類あるのか
published: "2020-05-30T09:00+09:00"
updated: "2020-05-31T09:00+09:00"
tags:
  - JavaScript
  - ECMAScript
---

JavaScriptのややこしい機能としてよく槍玉に挙げられるのが**this**です。その特徴のひとつは**状況によって意味（thisの値）が違う**ことであり、これを指して「JavaScriptのthisは4種類」とする説も見られます。

そこで、この記事ではthisが何種類あるのか、**ECMAScript仕様書**を頼りに調べます。ECMAScript仕様書とはJavaScriptという言語を定義する文書であり、JavaScriptの`this`がどのような挙動をするのかも当然定義されています。今回は仕様書の2020年5月26日版ドラフトを参照します。

- https://tc39.es/ecma262/

結論としては、最も大ざっぱに分けると**3種類**、最も細かく分けると**157種類**です。この記事では全種類漏れなくサンプルコード付きで説明します（似たようなやつはまとめて説明します。また、一部観測不能なものがあります）。

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

つまり、基本的には（Otherwise以降の部分）thisというのはグローバルオブジェクト（グローバル変数をプロパティとして持つオブジェクト）です。

```js
// グローバルスコープ
console.log(this === globalThis); // true と表示される
```

ただ、前半を読むと、それ以外の処理系依存（implementation-defined）な方法で作られたオブジェクトでもいいよということです。つまり、あなたが新しいJavaScript処理系を作って、この処理系ではグローバルスコープの`this`は配列なんですよ〜〜〜というような主張をしても許されるということです。

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

```js
// グローバルスコープで
console.log(this === globalThis); // true

(()=> {
  console.log(this === globalThis); // true
})();
```

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

このように仕様書内で間接的な関数呼び出しがされると定義されている箇所は**116箇所**あり、それぞれにおいて、その呼び出しにおいてthisが何になるか（呼び出しによって作られる関数スコープの[[ThisValue]]がどうなるか）が個別に定義されています。これを全て別に数えるならば、この時点で関数呼び出しにおけるthisの種類が最低でも116あることになります。頭が痛いですね。この116種類についてはあとで全部列挙して説明します。

また、[Invoke](https://tc39.es/ecma262/#sec-invoke)という抽象操作があり、これはもCallを内部的に使用しています。上記の116箇所というのはInvokeを経由する場合も含めています。

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

このうち、最後の「組み込み関数・構文を通じて間接的に呼び出された場合」は、さらに細分化して個別のケースを数えると全部で116種類あるのでした。

さらに細分化することもできます。というのは、thisがundefinedやnullになる場合は呼び出される関数がstrictモードかどうかによって関数の中でのthisが変わるのでした。これらを別々に数えるならば、まず上の例のうち4と5は`this`がundefinedとなるためそれぞれ2種類として数えられます。また、9に含まれる116種類のうち、非strict関数がthisをundefinedとして呼ばれる可能性があるものは29個あります。

### 組み込み関数・構文を通じて間接的に呼び出された場合の一覧

上で「116種類」と述べたパターンを全て列挙します。とても長いので折りたたんでおきます。

<details>
  <summary>間接的な呼び出しの一覧</summary>

  **1. オブジェクトがプリミティブに変換される際の`[Symbol.toPrimitive]`呼び出し**

  オブジェクトをプリミティブに変換する際、オブジェクトが`[Symbol.toPrimitive]`メソッドを持っていればそれが呼び出されます。その際の`this`はオブジェクト自身となります（メソッド呼び出しと同様）。

  ```js
  const obj = {
    [Symbol.toPrimitive]() {
      console.log(this === obj);
      return "";
    }
  };
  
  String(obj); // true と表示される
  ```

  **2. オブジェクトがプリミティブに変換される際の`toString`・`valueOf`呼び出し**

  オブジェクトをプリミティブに変換する際に`[Symbol.toPrimitive]`メソッドが無い場合は、代わりに`toString`か`valueOf`が使用されます。これらの場合もオブジェクト自身が`this`になります（メソッド呼び出しと同様）。メソッド名が2つありますが、仕様書の記述が1箇所なので1種類と数えます。

  ```js
  const obj = {
    toString() {
      console.log("toString", this === obj);
      return "";
    },
    valueOf() {
      console.log("valueOf", this === obj);
      return 0;
    }
  };
  
  String(obj); // toString true と表示される
  Number(obj); // valueOf true と表示される
  ```

  **3. Object.prototype.toLocaleString**

  `Object.prototype.toLocaleString`は、呼び出されると自身の`toString`を呼び出してその結果を返すと定義されています（[19.1.3.5 Object.prototype.toLocaleString](https://tc39.es/ecma262/#sec-object.prototype.tolocalestring)）。この際の`toString`呼び出しの`this`はメソッド呼び出しと同様です。

  ```js
  const obj = {
    toString() {
      console.log("toString", this === obj);
      return "";
    }
  };

  obj.toLocaleString(); // toString true と表示される
  ```

  **4. Date.prototype.toJSON**

  `Date.prototype.toJSON`は、自身がinvalid Dateであれば`null`を返し、そうでなければ自身の`toISOString`メソッドを呼び出した結果を返すと定義されています（[20.4.4.37 Date.prototype.toJSON](https://tc39.es/ecma262/#sec-date.prototype.tojson)）。

  ```js
  const date = new Date();
  date.toISOString = function() {
    console.log("toISOString", this === date);
  };

  date.toJSON(); // toISOString true と表示される
  ```

  **5. String.prototype.matchに正規表現以外を渡した場合**

  `String.prototype.match`は正規表現オブジェクトを受け取り、自身がその正規表現にマッチするかどうかを判定するメソッドです（[21.1.3.11 String.prototype.match](https://tc39.es/ecma262/#sec-string.prototype.match)）。
  実は引数として正規表現オブジェクト以外（より正確には`[Symbol.match]`を持たない値）を渡した場合は正規表現がオブジェクトが作成され、さらにそれに対して`[Symbol.match]`メソッドが呼び出されます。この時の`this`は新たに作られた正規表現オブジェクトとなります。

  ```js
  RegExp.prototype[Symbol.match] = function() {
    console.log("[Symbol.match]", this);
    return 123;
  };

  "".match(null); // [Symbol.match] /null/ と表示される
  ```

  **6. String.prototype.matchAllに正規表現以外を渡した場合**

  上記と同様のことが`String.prototype.matchAll`でも発生します。

  ```js
  RegExp.prototype[Symbol.matchAll] = function() {
    console.log("[Symbol.matchAll]", this);
    return 123;
  };

  "".matchAll(444); // [Symbol.matchAll] /444/g と表示される
  ```

  **7. String.prototype.searchに正規表現以外を渡した場合**

  `String.prototype.search`も同様です。

  ```js
  RegExp.prototype[Symbol.search] = function() {
    console.log("[Symbol.search]", this);
    return 123;
  };

  "".search({}); // [Symbol.search] /[object Object]/ と表示される
  ```

  **8. Array.prototype.toLocaleStringによる`toLocaleString`の呼び出し**

  `Array.prototype.toLocaleString`は、自身の各要素に対して`toLocaleString`メソッドを呼び出し、結果を適当なセパレータで繋いだ文字列を返します。このときもメソッド呼び出しと同様に、`this`は各オブジェクトとなります。

  ```js
  const obj = {
    toLocaleString() {
      console.log("toLocaleString", this === obj);
    }
  };

  [obj].toLocaleString(); // toLocaleString true と表示される
  ```

  **9. Promise.allによる`then`の呼び出し**

  `Promise.all`は、与えられた各`Promise`に対して内部的に`then`メソッドを呼び出します。この場合の`this`はメソッド呼び出しと同様です。

  ```js
  const p = Promise.resolve(123);
  p.then = function() {
    console.log("then", this === p);
  };

  Promise.all([p]); // then true と表示される
  ```

  **10. Promise.allSettledによる`then`の呼び出し**

  `Promise.allSettled`も同様に、与えられた各`Promise`に対して内部的に`then`メソッドを呼び出します。この場合の`this`はメソッド呼び出しと同様です。

  ```js
  const p = Promise.resolve(123);
  p.then = function() {
    console.log("then", this === p);
  };

  Promise.allSettled([p]); // then true と表示される
  ```

  **11. Promise.raceによる`then`の呼び出し**

  `Promice.race`も同様です。

  ```js
  const p = Promise.resolve(123);
  p.then = function() {
    console.log("then", this === p);
  };

  Promise.race([p]); // then true と表示される
  ```

  **12. Promise.prototype.catchによる`then`の呼び出し**

  実は、`Promise.prototype.catch`は内部的には`then`を呼び出すだけのメソッドとして定義されています。具体的には、`p.catch(fn)`は内部的には`p.then(undefined, fn)`を実行するだけです。

  ```js
  const p = Promise.resolve(123);
  p.then = function() {
    console.log("then", this === p);
  };

  p.catch(()=> {}); // then true と表示される
  ```

  **13. Promise.prototype.finallyによる`then`の呼び出し**

  実は、`Promise.prototype.finally`も同様に、内部的に`then`を呼び出します。

  ```js
  const p = Promise.resolve(123);
  p.then = function() {
    console.log("then", this === p);
  };

  p.finally(()=> {}); // then true と表示される
  ```

  **14. Then Finally Functionによる`then`の呼び出し**

  Then Finally Functionとは、`Promise.prototype.finally`の呼び出し時に内部的に作られる関数です。この関数は内部的に`Promise.resolve()`相当の処理を実行し、できたPromiseに対して`then`メソッドを呼び出します。このときの`this`は内部的に作られたPromiseとなります。

  ```js
  const p = Promise.resolve();
  let thenFinallyFunction;
  p.then = function(f) {
    thenFinallyFunction = f;
  };
  // ここで thenFinallyFunction にThen Finally Functionが入る
  p.finally(()=> 1234);

  Promise.prototype.then = function() {
    console.log("then", this);
  };

  thenFinallyFunction(); // Promiseがコンソールに表示され、その結果は1234である
  ```

  **15. Catch Finally Functionによる`then`の呼び出し**

  Catch Finally Functionもまた、`Promise.prototype.finally`の呼び出し時に内部的に作られる関数です。この関数も内部的に`Promise.resolve()`相当の処理を実行し、できたPromiseに対して`then`メソッドを呼び出します。このときの`this`は内部的に作られたPromiseとなります。

  ```js
  const p = Promise.resolve();
  let catchFinallyFunction;
  p.then = function(_, f) {
    catchFinallyFunction = f;
  };
  // ここで catchFinallyFunction にCatch Finally Functionが入る
  p.finally(()=> 1234);

  Promise.prototype.then = function() {
    console.log("then", this);
  };

  catchFinallyFunction(); // Promiseがコンソールに表示され、その結果は1234である
  ```

  **16. GetIterator抽象操作による`[Symbol.iterator]`メソッドの呼び出し**

  GetIterator抽象操作（[7.4.1 GetIterator](https://tc39.es/ecma262/#sec-getiterator)）は、オブジェクトからイテレータを得たい場合に使用されます。例えば`for-of`文や、配列リテラルにおけるスプレッド構文`...`の場合に使用されます。このとき、実際にイテレータを得るためにオブジェクトの`[Symbol.iterator]`メソッドが呼び出されます。この場合の`this`はメソッド呼び出しの場合と同様です。

  これを発生させる方法は色々あります（GetIteratorは色々な場面で使われます）が、仕様書でCallを呼んでいるのがGetIteratorの中であることを鑑みて、どれも本質的には同じとみなして1種類と数えています。

  ```js
  const obj = {
    [Symbol.iterator]() {
      console.log("[Symbol.iterator]", this === obj);
      return [1, 2, 3, 4, 5].values();
    }
  };

  [...obj]; // [Symbol.iterator] true と表示される
  ```

  **17. IteratorNext抽象操作による`next`メソッドの呼び出し**

  上述の方法でイテレータが作られたあと、大抵はイテレータの要素が順に取得されます。これは、IteratorNext抽象操作（[7.4.2 IteratorNext](https://tc39.es/ecma262/#sec-iteratornext)）を介してイテレータの`next`メソッドを呼び出すことにより行われます。この場合の`this`はメソッド呼び出しの場合と同様です。

  ```js
  const obj = {
    [Symbol.iterator]() {
      const iterator = {
        next() {
          console.log("next", this === iterator);
          return { done: true };
        }
      }
      return iterator;
    }
  };

  [...obj]; // next true と表示される
  ```

  **18. IteratorClose抽象操作による`return`メソッドの呼び出し**

  イテレータが処理系によって使用され終わったあとは、IteratorClose抽象操作（[7.4.6 IteratorClose](https://tc39.es/ecma262/#sec-iteratorclose)）を介してイテレータの`return`メソッドが呼び出されます（存在すれば）。このときの`this`はメソッド呼び出しと同様です。

  ```js
  const obj = {
    [Symbol.iterator]() {
      const iterator = {
        next() {
          return { done: true };
        },
        return() {
          console.log("return", this === iterator);
        }
      }
      return iterator;
    }
  };

  const [] = obj; // return true と表示される
  ```

  **19. IteratorClose抽象操作による`return`メソッドの呼び出し**

  非同期イテレータの場合、AsyncIteratorClose抽象操作（[7.4.7 AsyncIteratorClose](https://tc39.es/ecma262/#sec-asynciteratorclose)）を介してイテレータの`return`メソッドが呼び出されます（存在すれば）。このときの`this`もメソッド呼び出しと同様です。

  ```js
  const obj = {
    [Symbol.asyncIterator]() {
      const iterator = {
        async next() {
          return { done: false, value: 123 };
        },
        return() {
          console.log("return", this === iterator);
        }
      }
      return iterator;
    }
  };

  (async ()=> {
    for await (const _ of obj) {
      break; // ここで return true と表示される
    }
  })();
  ```

  **20. ゲッタの呼び出し**

  プロパティアクセスを担当するOrdinaryGet抽象操作（[9.1.8.1 OrdinaryGet](https://tc39.es/ecma262/#sec-ordinaryget)）は、プロパティがゲッタを持っていた場合にそのゲッタを呼び出します。このときの`this`はゲッタを持つオブジェクト（レシーバ）となります。

  ```js
  const obj = {
    get foo() {
      console.log("get foo", this === obj);
    }
  };

  obj.foo; // get foo true と表示される
  ```

  **21. セッタの呼び出し**

  同様に、プロパティがセッタを持つ場合は代入時にセッタが呼び出されます（[9.1.9.2 OrdinarySetWithOwnDescriptor](https://tc39.es/ecma262/#sec-ordinarysetwithowndescriptor)）。このときの`this`はゲッタを持つオブジェクト（レシーバ）となります。

  ```js
  const obj = {
    set foo(v) {
      console.log("set foo", this === obj);
    }
  };

  obj.foo = 0; // set foo true と表示される
  ```

  **22. bound function exotic objectを経由した関数呼び出し**

  `Function.prototype.bind`を用いて作られた関数オブジェクトはbound function exotic objectと呼ばれます（[9.4.1 Bound Function Exotic Objects](https://tc39.es/ecma262/#bound-function-exotic-object)）。

  この関数オブジェクトが関数として呼び出された場合、与えられたthisは無視して、`bind`時に指定されていたthisを用いて元の関数を呼び出します。

  ```js
  const obj = {};
  const func = function() {
    console.log("func", this === obj);
  };
  const bound = func.bind(obj);

  bound(); // func true と表示される
  ```

  **23-35. Proxyの各種トラップ呼び出し**

  `Proxy`関連をまとめした。説明をまとめているとはいえ、仕様書で別々に定義されているので別々に数えます。

  Proxyは、オブジェクトに対する基本的な操作にフックすることができる特殊なオブジェクトです。基本的な操作に対するフックはトラップと呼ばれ、Proxyはトラップをまとめたオブジェクト（ハンドラ）によって定義されます。トラップが実際に呼び出される際の`this`はハンドラオブジェクトとなります。
  トラップはgetPrototypeOf, setPrototypeOf, isExtensible, preventExtensions, getOwnPropertyDescriptor, defineProperty, has, get, set, delete, ownKeys, apply, constructの13種類があります。

  次の例はgetトラップの場合です。

  ```js
  const handler = {
    get() {
      console.log("get", this === handler);
      return 0;
    }
  };
  const p = new Proxy({}, handler);
  p.foo; // get true と表示される
  ```

  **36. Proxyのデフォルト動作としての関数呼び出し**

  Proxyでトラップが定義されていない操作は、デフォルトの挙動となります。Proxyオブジェクトが関数として呼び出されることに対してもトラップが定義できますが、トラップがなかった場合は内部的に通常と同様の関数呼び出しが行われます。このときの`this`は、Proxyが関数として呼び出されたときの`this`を引き継ぎます。

  ```js
  const obj = {};
  const p = new Proxy(function () {
    console.log(this === obj);
  }, {});

  p.call(obj); // true と表示される
  ```

  **37. `instanceof`演算子による`[Symbol.hasInstance]`呼び出し**

  `instanceof`演算子は、右辺のオブジェクトが`[Symbol.hasInstance]`メソッドを持っている場合はそれを呼び出します。このときの`this`は右辺のオブジェクトです。

  ```js
  const obj = {
    [Symbol.hasInstance]() {
      console.log("[Symbol.hasInstance]", this === obj);
      return true;
    }
  };

  123 instanceof obj; // [Symbol.hasInstance] true と表示される
  ```

  **38. `for-of`文によるイテレータの`next`呼び出し**

  `for-of`文の実行（[13.7.5.13 Runtime Semantics: ForIn/OfBodyEvaluation](https://tc39.es/ecma262/#sec-runtime-semantics-forin-div-ofbodyevaluation-lhs-stmt-iterator-lhskind-labelset)）においては、`of`の右に渡されたオブジェクトから得られたイテレータに対して`next`メソッドを順に実行することでループが進みます。この呼び出し時の`this`はイテレータオブジェクトです。

  「あれ、`next`はもうIteratorNext抽象操作でやったのでは」とお思いの方もいるでしょうが、`for-of`文の場合は特殊な事情があるため仕様書上別個に定義されています。具体的には、`for-of`文の途中でイテレータの`next`メソッドが再代入されても最初に取得した`next`メソッドを呼び出し続けるという処理です。

  ```js
  const obj = {
    [Symbol.iterator]() {
      const iterator = {
        next() {
          console.log("next", this === iterator);
          return { done: true };
        }
      }
      return iterator;
    }
  };

  for (const _ of obj); // next true と表示される
  ```

  **39-41. `yield*`式による`next`, `throw`, `return`の呼び出し**

  `yield*`式はジェネレータ関数の中で使用できる式で、与えられたオブジェクトに対してイテレートしてその結果を全て`yield`するという式です。そのために`yield*`式からイテレータの`next`メソッドの呼び出しが行われます。このときの`this`はイテレータ自身です。

  また、`yield*`式の最中のジェネレータに対して`throw`や`return`が呼ばれた場合、それを`yield*`でループ中のイテレータに伝播させるため、イテレータの`throw`や`return`が呼ばれます。このときの`this`もイテレータ自身です。

  ```js
  const obj = {
    [Symbol.iterator]() {
      const iterator = {
        next() {
          console.log("next", this === iterator);
          return { value: 0, done: false };
        },
        throw() {
          console.log("throw", this === iterator);
          return {};
        },
        return() {
          console.log("return", this === iterator);
          return {};
        },
      }
      return iterator;
    }
  };

  const gen1 = (function*() {
    yield* obj;
  })();

  gen1.next();  // next true と表示される
  gen1.throw(); // throw true と表示される

  const gen2 = (function*() {
    yield* obj;
  })();

  gen2.next();   // next true と表示される
  gen2.return(); // return true と表示される
  ```

  **42-43. async関数初期化失敗時における内部的なreject呼び出し**

  async関数の結果は常にPromiseです。[14.7.11 Runtime Semantics: EvaluateBody](https://tc39.es/ecma262/#sec-async-function-definitions-EvaluateBody)では、async関数の初期化に失敗した場合にrejectするPromiseを返すための処理が書かれています。初期化の失敗というのは、引数の初期値を計算しようとしたがエラーが発生したという場合に発生します。

  久しぶりに仕様書から当該部分を引用します。4でCall抽象操作が呼ばれているのが分かりますね。第2引数がundefinedなので、この呼び出しではthisがundefinedとなります。

  > 1. Let *promiseCapability* be ! NewPromiseCapability(%Promise%).
  > 2. Let *declResult* be FunctionDeclarationInstantiation(*functionObject*, *argumentsList*).
  > 3. If *declResult* is not an abrupt completion, then
  >     - Perform ! AsyncFunctionStart(*promiseCapability*, *FunctionBody*).
  > 4. Else,
  >     - Perform ! Call(*promiseCapability*.[[Reject]], **undefined**, « *declResult*.[[Value]] »).
  > 5. Return Completion { [[Type]]: return, [[Value]]: *promiseCapability*.[[Promise]], [[Target]]: empty }.

  呼ばれているのは*promiseCapability*.[[Reject]]です。この*promiseCapability*というのはステップ1のNewPromiseCapabilityで作成されています。これはPromiseCapability Record（[25.6.1.1 PromiseCapability Records](https://tc39.es/ecma262/#sec-promisecapability-records)）と呼ばれる概念であり、Promiseオブジェクトと、そのPromiseオブジェクトをresolveまたはrejectするための関数がセットになった仕様書内の概念です。

  今回の*promiseCapability*というのはasync関数の結果のPromiseオブジェクトであり、async関数の初期化に失敗した場合はそれをrejectさせて返しているということになります。つまるところ、*promiseCapability*.[[Reject]]というのは`new Promise((resolve, reject) => { ... })`で得られる`reject`関数です。この関数はPromiseコンストラクタによって内部的に作られます。

  残念ながら、`reject`関数に渡される`this`が何かを観測する手段はありません。観測できないとはいえ、仕様書内で関数呼び出しが行われていることには違いありませんのでこういったものも数に含めています。41-42と2種類あるのは、普通のasync関数とasyncアロー関数が別に定義されているためです。

  **44-45. import()による内部的なresolve・reject呼び出し**

  `import()`はdynamic importの構文であり、結果はPromiseです。結果のPromiseを`resolve`または`reject`させる処理が、前述のPromiseCapabilityを用いて[15.2.1.20 Runtime Semantics: FinishDynamicImport](https://tc39.es/ecma262/#sec-finishdynamicimport)に定義されています。`this`としてはundefinedが渡されますが、観測できません。

  **46-47. Function.prototoype.applyとFunction.prototype.call**

  [19.2.3.1 Function.prototype.apply](https://tc39.es/ecma262/#sec-function.prototype.apply)で定義される`Function.prototype.apply`は、関数の`this`を指定して呼び出す機能を持ちます。また、`Function.prototype.call`も同様です。

  ```js
  const obj = {};
  const func = function() {
    console.log("func", this === obj);
  };

  func.apply(obj); // func true と表示される
  ```

  **48-52. String.prototype.match等に`[Symbol.match]`等を持つオブジェクトを渡した場合**

  `String.prototype.match`（[21.1.3.11 String.prototype.match](https://tc39.es/ecma262/#sec-string.prototype.match)）は5〜7にも出てきましたが、それに`[Symbol.match]`メソッドを持つオブジェクトを渡した場合の挙動は別に定義されています。この場合、そのオブジェクトに対してメソッド呼び出しが行われます。当然、`this`はそのオブジェクト自身です。
  `String.prototype.matchAll`や`String.prototype.search`の場合も同様です。さらに、先ほどは出てきませんでしたが、`String.prototype.replace`と`String.prototype.split`も同様の機能を持ちます。

  ```js
  const obj = {
    [Symbol.match]() {
      console.log("[Symbol.match]", this === obj);
      return 123;
    }
  };
  "".match(obj); // [Symbol.match] true と表示される
  ```

  **53-54. String.prototype.replaceによる置換関数の呼び出し**

  `String.prototype.replace`は文字列の検索・置換を行う関数ですが、置換結果を関数で計算させることができます。これは、`replace`からその関数を呼び出すことで行われます。このときのthisは`undefined`です。

  ```js
  "abc".replace("c", function() {
    "use strict";
    console.log(this === undefined);
  }); // true と表示される
  ```

  52-53と2種類カウントしているのは、`replace`に渡されたのが正規表現オブジェクトか文字列化によって仕様書の定義が別だからです。

  **55. RegExpExec抽象操作による`exec`メソッドの呼び出し**

  正規表現のマッチング処理は、多くの場合RegExpExec抽象操作（[21.2.5.2.1 Runtime Semantics: RegExpExec](https://tc39.es/ecma262/#sec-regexpexec)）を経由して行われます。そして、この抽象操作は正規表現オブジェクトの`exec`メソッドを呼び出します。このときの`this`は当該正規表現オブジェクトです。

  ```js
  const r = /foo/;
  r.exec = function() {
    console.log("exec", this === r);
  };

  r.test("foo"); // exec true と表示される
  ```

  **56-57. `Array.from`によるマップ関数の呼び出し**

  `Array.from`はイテレータやarray-likeなオブジェクトから配列を作る関数ですが、第2引数に関数を与えることで、作られる配列の各要素に対してその関数を呼び出して要素を変換することができます。実は`Array.from`はこの呼び出しにおける`this`を指定する機能を持っており、`Array.from`の第3引数に指定します。

  2種類計上しているのは、渡されたのがイテレータかどうかによって分岐するからです。

  ```js
  const obj = {};
  const func = function() {
    console.log("func", this === obj);
  };

  Array.from("abc", func, obj); // func true と3回表示される
  ```

  **58-68. 配列のメソッドによるコールバック関数の呼び出し**

  配列においては、`Array.prototype.forEach`を始めとする多くのメソッドがコールバック関数を受け取ります。そして、そのコールバック関数呼び出しにおける`this`は、`Array.from`の場合と同様に指定することができます。

  ```js
  const obj = {};
  const func = function() {
    console.log("func", this === obj);
  };

  [1, 2, 3].forEach(func, obj); // func true と3回表示される
  ```

  具体的にはevery, filter, find, findIndex, flat/flatMap, forEach, map, reduce, reduceRight, some, sortの11個を計上しています。flatとflatMapは仕様書上の定義がまとめられているので1種類とカウントします。

  また、sortのみthisを指定する機能がなく、比較関数はthisが`undefined`で呼ばれます。

  **69. Array.prototype.toString**

  `Array.prototype.toString`は、内部的に自身のjoinメソッドを呼び出します。このときの`this`は自分自身です。ちなみに、joinが無い場合は`Object.prototype.toString`にフォールバックします（これは`Object.prototype.toString`が書き換えられていても無視して本来の関数を呼び出します）。

  ```js
  const arr = [1, 2, 3];
  arr.join = function() {
    console.log("join", this === arr);
  };

  arr.toString(); // join true と表示される
  ```

  **70-74. TypedArrayのメソッド**

  TypedArrayとは、`Uint8Array`や`Int32Array`のような型付き配列の総称です。これらも、`Array`と同様に`from`を持ち、マップ関数を呼び出します（2種類計上）。また、filter, map, sort関数がコールバック関数を呼び出すので3種類計上しています（前者2つはthisを指定する機能を持ちます）。他のメソッド（everyなど）も同様の機能を持ちますが、仕様書に「Arrayと同じ」と定義されているのでここでは数に含めません。

  ```js
  const obj = {};
  const func = function() {
    console.log("func", this === obj);
  };

  Uint8Array.of(1, 2, 3).forEach(func, obj); // func true と3回表示される
  ```

  **75. Map・WeakMapコンストラクタによる`set`メソッド呼び出し**

  MapやWeakMapのコンストラクタは配列（やIterable）を受け取って自身の中身を初期化する機能を持ちます。実は、この処理は「空のMapオブジェクトを作成して`set`メソッドを一つずつ呼び出す」という処理で行われています（[23.1.1.2 AddEntriesFromIterable](https://tc39.es/ecma262/#sec-add-entries-from-iterable)）。このときの`this`は作られたMapオブジェクトです。

  ```js
  Map.prototype.set = function() {
    console.log("set", this);
  };

  new Map([["foo", 1], ["bar", 2]]); // "set"の後にMapオブジェクトが表示される
  ```

  **76. `Map.prototype.forEach`**

  `Map.prototype.forEach`もコールバック関数を呼び出す機能を持ち、そのときの`this`を指定できます。

  ```js
  const obj = {};
  const func = function() {
    console.log("func", this === obj);
  };

  new Map([["foo", 1]]).forEach(func, obj); // func true と表示される
  ```

  **77-78. Set・WeakSetコンストラクタによる`add`メソッド呼び出し**

  SetやWeakSetのコンストラクタもMapと同様に初期化時に要素を指定する機能を持ちますが、この時に自身の`add`メソッドを呼び出します。このときの`this`はやはり、作られたSetオブジェクトです。

  ```js
  Set.prototype.add = function() {
    console.log("add", this);
  };

  new Set([1, 2, 3]); // "add"の後にSetオブジェクトが表示される
  ```

  **79. `Map.prototype.forEach`**

  `Set.prototype.forEach`もコールバック関数を呼び出す機能を持ち、そのときの`this`を指定できます。

  ```js
  const obj = {};
  const func = function() {
    console.log("func", this === obj);
  };

  new Set([1]).forEach(func, obj); // func true と表示される
  ```

  **80. `JSON.parse`によるレシーバ関数の呼び出し**

  `JSON.parse`は、実は第2引数として関数を受け取ることができます。この関数は、パース結果を変形するために使うことができます。
  この関数はJSONオブジェクトを構成するそれぞれの値に対して呼ばれます。引数は2つ（キー名と値）で、加工後の値を返すことで値を変換できます。

  さらに、この関数が呼ばれる際の`this`は、与えられたキーを持つ親のオブジェクトとなります。

  ```js
  JSON.parse(`{"a":1,"b":2}`, function(k, v) {
    console.log(this, k, v);
    return v;
  })
  ```

  これを実行すると`console.log`が次のような出力で3回実行されます。

  ```json
  {a: 1, b: 2} "a" 1
  {a: 1, b: 2} "b" 2
  {"": {…}} "" {a: 1, b: 2}
  ```

  最初の呼び出しでは`k`として`"a"`が、`v`として`1`が渡されていることから、パースされたオブジェクトの`"a"`プロパティに対する変換であることが分かります。その次は`"b"`プロパティに対する変換です。このときのthis`{a: 1, b: 2}`というオブジェクトであり、これらのキーを持つオブジェクトがthisとなっていることが分かります。

  3回目の呼び出しは`{"a":1,"b":2}`というオブジェクト全体に対する変換です。この値には“親”がいませんが、実は`JSON.parse`では内部的に`{"": 値}`というオブジェクトを用意しているためこれが親としてthisに与えられます。キーとしても`""`が与えられていることが分かります。

  **81. `JSON.stringify`による`toJSON`の呼び出し**

  `JSON.stringify`は、与えられたオブジェクトが`toJSON`メソッドを持っていた場合にまずそのメソッドを呼び出し、返り値がJSON文字列に変換されます。このときの`this`は与えられたオブジェクト自身です。

  ```js
  const obj = {
    toJSON() {
      console.log("toJSON", this === obj);
      return { foo: 123};
    }
  };

  JSON.stringify(obj); // toJSON true と表示される
  ```

  **82. `JSON.stringify`によるreplacer関数の呼び出し**

  `JSON.stringify`は、`JSON.parse`と同様に第2引数として関数を受け取ることができます。この関数を呼び出す際のthisも、やはり親オブジェクトが与えられます。

  ```js
  JSON.stringify({foo: 123}, function (k, v) {
    console.log(this, k, v);
    return v;
  });
  ```

  結果:

  ```json
  {"": {…}} "" {foo: 123}
  {foo: 123} "foo" 123
  ```

  **83-86. Async-from-Syncイテレータのreturnメソッドとthrowメソッド**

  ここからしばらくPromiseの話が続きますがお付き合いください。

  Async-from-Syncイテレータとは、Asyncイテレータが必要な場面で普通のイテレータが渡された場合に暗黙にアダプタとして作成されるオブジェクトです。この機能により、`for-await-of`文に普通のイテレータを渡しても動作します。
  
  非同期イテレータのメソッドは返り値がPromiseですが、Async-from-Syncイテレータの場合は元が同期的なので即座にPromiseの結果を出すことができます。そして、すでにresolve/rejectされたPromiseを返す場合、仕様書内では前述のPromiseCapabilityが用いられます。そのため、Asyncイテレータのreturnメソッド（[25.1.4.2.2 %AsyncFromSyncIteratorPrototype%.return](https://tc39.es/ecma262/#sec-%asyncfromsynciteratorprototype%.return)）やthrowメソッド（[25.1.4.2.3 %AsyncFromSyncIteratorPrototype%.throw](https://tc39.es/ecma262/#sec-%asyncfromsynciteratorprototype%.throw)）ではPromiseCapabilityの[[Resolve]]や[[Reject]]をthisを`undefined`として呼び出しています。残念ながらこれは観測不可能です。

  **87. Async-from-Syncイテレータのreturnメソッド**

  Async-from-Syncイテレータの`return`メソッドが呼び出された場合、やることはおおよそ「元のイテレータの`return`メソッドを呼び出して結果をPromiseに包む」ということです。ここで、元のイテレータの`return`メソッドの呼び出しが発生します。このときのthisは当然当該イテレータです。

  ```js
  const obj = {
    [Symbol.iterator]() {
      const iterator = {
        next() {
          return {value: 0, done: false};
        },
        return() {
          console.log("return", this === iterator);
        }
      }
      return iterator;
    }
  };

  (async ()=> {
    for await (const _ of obj) {
      break; // return true と表示される
    }
  })();
  ```

  **88. Async-from-Syncイテレータのthrowメソッド**

  Async-from-Syncイテレータの`throw`メソッドも上と同様に、元のイテレータの`throw`メソッドを呼び出します。このときのthisもやはり当該イテレータです。

  ```js
  const obj = {
    [Symbol.iterator]() {
      const iterator = {
        next() {
          return {value: 0, done: false};
        },
        throw() {
          console.log("throw", this === iterator);
        }
      }
      return iterator;
    }
  };

  const g = (async function* () {
    yield* obj;
  })();
  g.next();
  g.throw();
  ```

  **89-91. Asyncジェネレータの内部処理**

  Asyncジェネレータは、`async function*(){ ... }`という宣言および式によって作られるオブジェクトです。Asyncジェネレータ関数では`yield`と`await`を両方使うことができます。これらはPromiseを扱うので、先ほどから何回か出てきているPromiseCapabilityが用いられます。PromiseCapabilityの[[Resolve]]や[[Reject]]メソッドはthisを`undefined`として呼び出すように定められていますが、やはり観測はできません。以下の3種類がこれに当てはまります。

  - [25.5.3.3 AsyncGeneratorResolve](https://tc39.es/ecma262/#sec-asyncgeneratorresolve)
  - [25.5.3.4 AsyncGeneratorReject](https://tc39.es/ecma262/#sec-asyncgeneratorreject)
  - [25.5.3.6 AsyncGeneratorEnqueue](https://tc39.es/ecma262/#sec-asyncgeneratorenqueue)

  **92. Promiseの`then`ハンドラの呼び出し**

  Promiseのthenメソッドでは、Promiseが成功裏に解決された場合に呼び出される関数を指定します。この関数は、thisが`undefined`で呼び出されます（[25.6.2.1 NewPromiseReactionJob](https://tc39.es/ecma262/#sec-newpromisereactionjob)）。

  ```js
  Promise.resolve().then(function() {
    "use strict";
    console.log("then", this === undefined); // then true と表示される
  });
  ```

  **93. Promiseの`resolve`関数によるThenableに対する`then`メソッドの呼び出し**

  Promiseは、結果を他のPromiseに委譲することができます。さらに言えば、委譲先はPromiseでなくとも`then`メソッドを持つオブジェクトならば構いません（このようなオブジェクトをThenableと言います）。Promiseの結果がThenableに対して委譲されるとき、Thenableの`then`メソッドが呼ばれます。このときの`this`は当該Thenableです。

  ```js
  const obj = {
    then() {
      console.log("then", this === obj);
    }
  };
  new Promise((resolve) => resolve(obj)); // then true と表示される
  ```

  **94. Promiseのexecutor関数呼び出し**

  Promiseコンストラクタに渡す関数のことはexecutorと呼ばれます。Promiseコンストラクタを呼び出すとexecutorの呼び出しが発生しますが、このときのthisはundefinedです。

  ```js
  new Promise(function() {
    "use strict";
    console.log("executor", this === undefined);
  }); // executor true と表示される
  ```

  **95-97. `Promise.all`・`Promise.allSettled`・`Promise.race`による`Promise.resolve`呼び出し**

  これらの関数は内部的に`Promise.resolve`を呼び出します。これもある種のメソッド呼び出しであり、このときの`this`は`Promise`です。

  ```js
  Promise.resolve = function() {
    console.log("resolve", this === Promise);
  };

  Promise.all([{}]); // resolve true と表示される
  ```

  **98-99. `Promise.prototype.finally`による関数呼び出し**
  
  `Promise.prototype.finally`に与えられた関数は、Promiseが成功しても失敗しても呼び出されます。この呼び出しの際のthisは`undefined`です。成功時と失敗時で別に定義されているので2種類と数えられます。

  ```js
  Promise.resolve().finally(function() {
    "use strict";
    console.log("finally", this === undefined);
  }); // finally true と表示される
  ```

  **100-115. Promiseの内部処理におけるPromiseCapabilityのメソッド呼び出し**

  上で見た以外にも、Promiseオブジェクトやasync関数自体の内部処理としてPromiseを作ったりPromiseを解決したりすることが多くあります。そのときにやはりPromiseCapabilityが活躍します。案の定、[[Resolve]]や[[Reject]]がthisを`undefined`として呼び出されているところは観測できないのですが。仕様書の以下の箇所で発生します。

  - [25.6.1.1.1 IfAbruptRejectPromise](https://tc39.es/ecma262/#sec-ifabruptrejectpromise)
  - [25.6.2.1 NewPromiseReactionJob](https://tc39.es/ecma262/#sec-newpromisereactionjob) （2箇所）
  - [25.6.2.2 NewPromiseReactionThenableJob](https://tc39.es/ecma262/#sec-newpromiseresolvethenablejob) 
  - [25.6.3.1 Promise](https://tc39.es/ecma262/#sec-promise-executor) 
  - [25.6.4.1.1 Runtime Semantics: PerformPromiseAll](https://tc39.es/ecma262/#sec-performpromiseall)
  - [25.6.4.1.2 Promise.all Resolve Element Functions](https://tc39.es/ecma262/#sec-promise.all-resolve-element-functions)
  - [25.6.4.2.1 Runtime Semantics: PerformPromiseAllSettled](https://tc39.es/ecma262/#sec-performpromiseallsettled)
  - [25.6.4.2.2 Promise.allSettled Resolve Element Functions](https://tc39.es/ecma262/#sec-promise.allsettled-resolve-element-functions)
  - [25.6.4.2.3 Promise.allSettled Reject Element Functions](https://tc39.es/ecma262/#sec-promise.allsettled-reject-element-functions)
  - [25.6.4.5 Promise.reject](https://tc39.es/ecma262/#sec-promise.reject)
  - [25.6.4.6.1 PromiseResolve](https://tc39.es/ecma262/#sec-promise-resolve)
  - [25.7.5.1 AsyncFunctionStart](https://tc39.es/ecma262/#sec-async-functions-abstract-operations-async-function-start) （3箇所）

  **116. `Reflect.apply`による関数呼び出し**

  `Reflect.apply`は`Function.prototype.apply`と類似したメソッドで、関数を指定したthisの値で呼び出す機能を持ちます。

  ```ts
  const obj = {};
  const func = function() {
    console.log("func", this === obj);
  };

  Reflect.apply(func, obj, []); // func true と表示される
  ```

  以上です。

</details>

## 結論

最も細分化して数えた場合、thisは**157種類**です。まとめると次のようになります。ただし、処理系依存で変化するやつは仕方ないのでここではカウントしません。

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
      - strictモード関数（および組み込み関数）の場合: 116種類

157という具体的な数字は、言語仕様の変化によって簡単に変動しますので目安としてご理解ください。
また、そもそもthisの数え方に異論があるという方もいるでしょうから、あくまで一つの考え方であることをご理解ください。

万が一数え間違いを発見された方はぜひお知らせください。
