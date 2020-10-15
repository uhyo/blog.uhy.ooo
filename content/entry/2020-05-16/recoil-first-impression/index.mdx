---
title: Facebook製の新しいステート管理ライブラリ「Recoil」を最速で理解する
published: "2020-05-16T02:40+09:00"
tags:
  - React
  - Recoil
  - JavaScript
---

昨日、Facebook製のReact用ステート管理ライブラリ**[Recoil](https://recoiljs.org/)**が発表されました。Facebook製といってもReact公式のステート管理ライブラリとかそういう位置付けではないようですが、それでも大きな注目を集めているのは間違いありません。

そこで、筆者がRecoilに対して思ったことや、筆者の視点から見たRecoilの特徴を記事にまとめました。

なお、この記事の執筆時点では副作用の扱いなどの点はいまいち情報が揃っていません。この記事では速報性を重視し、コアのステート管理部分に絞って考えています。また、まだexperimentalなライブラリなので、今後この記事の内容からRecoilのAPIが変化したとしても悪しからずご了承ください。

この記事を書くときに筆者が色々試していたCodeSandboxはこちらです。

- https://codesandbox.io/s/recoil-sandbox-20200516-v40v7

## 概要

誤解を恐れずに一言でまとめれば、Recoilは**Reduxからreducerを消してフックに最適化したステート管理ライブラリ**です[^note_concept]。

[^note_concept]: 一応書いておきますが、コンセプトの話です。Reduxをフォークした訳ではありませんよ。

そう、Recoilの主要な比較対象はReduxです。なぜなら、パフォーマンスという観点からはRecoilのゴールはReduxと共通しているからです。

グローバルなステート管理（ステートが複数コンポーネントで共有される）においては、ステート更新時に無駄な再レンダリングを発生させないことが肝要です。RecoilもReduxも似たようなアプローチでこの問題に取り組みます。すなわち、Reactが提供するコンテキストに依存しない独自のsubscriptionシステムによって再レンダリングを管理するのです。

### ReduxとRecoilが異なる点

一方で、ReduxとRecoilには大きく異なる点もあります。それは、Reduxではステートの宣言が中央集権的であるのに対して、**Recoilはステートの宣言が局所的**です。

Reduxにおける典型的なステート管理のパターンは、ロジックごとに定義されたreducerたちを`combineReducers`でまとめた巨大なreducerを作り、ステートを使う側は`useSelector`を用い巨大なステートから自分が必要な部分を取り出すというものです。Reduxにおいては個々のステートを宣言する最終目的は「巨大なステートの部品となること」であり、この点が特徴的です。

一方、Recoilでは、個々のステートはそのステートを使いたいコンポーネントたちの間で直接共有されます。一度全部入りのステートを経由しないという点がReduxとの違いです。実際のところ、Recoilも裏ではステートを集約して扱っているかもしれませんが、それは暗黙的に行われ、RecoilのAPIに表面化しません[^note_recoilroot]。

このことからの重要な帰結として、**ステートがcode splittingの対象になる**ことがRecoilの利点として挙げられています。つまり、全てのステートを中央に集約するステップが無いことによって、ステートを使うコンポーネントが読み込まれるまではそのステートも読み込まないということが実現しています。

[^note_recoilroot]: ただし、`RecoilRoot`というコンポーネントをアプリのルート付近に置く必要があり、ここだけ中央集権が露出しています。とはいえ、基本的にRecoilではただおまじないのように`RecoilRoot`を設置するだけでOKのようです。

ちなみに、reducerが無いということは、Recoilにはアクションという概念もありません。個人的にはアクションの無いReduxが欲しいと思っていたので、Recoilが自分の求めていたものではないかと思っています。

### フックと相性が良いAPI

RecoilのAPIはReduxとは大幅に異なる見た目をしていますが、**フックとの相性の良さ**を念頭に設計されているのが見て取れます。フックの良いところは何と言っても**カスタムフック**によるある種のカプセル化が可能な点であり、現代ではコンポーネントのロジックがほとんどカスタムフックに書かれるようになりました。Recoilが提供する各種のフックは、カスタムフックに組み込みやすいように作られています。それどころか、カスタムフックに組み込んでこそ真価を発揮すると言っても過言ではありません。

Reactにおけるカスタムフックは、関数のスコープやモジュールレベルのスコープを活用した多様なカプセル化ができる点が優れています。RecoilのAPIはその全てに適合し、アプリケーションロジックの疎結合化を促進するのです。

この記事でもRecoilの基本的な使い方をこれから紹介していきますが、RecoilのAPIを見た方は「なんだか原始的だ」と思うかもしれません。それは間違った感覚ではありません。Recoilが提供する各種のフックは、カスタムフックのパーツとして使いやすいように設計されているのです。

これは「**シンプル**」という言葉が適していると思います。RecoilのAPIは複雑さを適度に隠蔽しつつ、挙動に疑問の余地がなくかつ単純です。さらに言えば、あとで詳しく説明しますが、RecoilのAPIはReact本体の思想を受け継ぎ**宣言的**な側面も持っています。

## RecoilとReduxが解決する問題

RecoilとReduxが共通する点は、パフォーマンス上の課題を解決するものであるという点でした。Recoilの使い方の説明に入る前に、これについて解説します。

パフォーマンス上の課題とは何かというのは、言い換えれば「`useReducer` + `useContext`でうまくいかないとのはどういう時か」という問いでもあります。これはReduxにも共通する話ですから、Reduxの理解者ですでに知っているという方は次の「Recoilの基本的な使い方」まで飛ばしても構いません。

### React単体での共通ステート管理とその限界

React本体にも、値を複数コンポーネントで共有する手段が用意されています。そう、**コンテキスト**です。React 16.3で導入されたコンテキスト機能では、コンポーネントツリーの上流のコンポーネントが`Provider`に渡した値を下流のコンポーネントが`useContext`で取得することができます。上流の`Provider`に渡された値が変わった場合は、`useContext`でその値を読んでいたコンポーネントが再レンダリングされ、値の変更に追随します。

コンテキストを用いることで、簡易的なグローバルステート管理が実現できます。上流のコンポーネントでは`useState`か`useReducer`を用いて共通ステートを定義しそれをコンテキストに入れることで、下流のコンポーネントでは`useContext`を用いてステートを取得することができます。

小規模なアプリケーションではこの方法でも十分な場合がありますが、パフォーマンスが重視される場合は問題があります。

多くのステートをこの方法で管理する場合、ひとつの選択肢はReduxよろしく全てのステートを詰め込んだオブジェクトでステートを管理し、一つのコンテキストにそのオブジェクトを流すというものです。この場合、Reduxの`useSelector`はこんな感じで再現できます。

```js
const useSelector = (selector) => {
  const allStates = useContext(StateContext);
  return selector(allStates);
};
```

この`useSelector`のパフォーマンス上の問題は、いかなるステートの更新も、`useSelector`を使う全てのコンポーネントの再レンダリングを引き起こすということです。ステートの更新が発生したらそれに関係するコンポーネントのみ再レンダリングされてほしいところ、一つのコンテキストに全ての情報を入れてしまう場合はそれに依存する全てのコンポーネントが再レンダリングされてしまいます。一定以上の規模のアプリではこれは受け入れがたい問題です。

この問題を緩和する策としては、コンテキストを複数に分けるという方法が挙げられます。しかし、`useSelector`を複数用意する必要があり煩雑ですし、より複雑なselectorを使いたい場合には無駄な再レンダリングが避けられない場合があります。

ここでの根本的な問題は、「ステートが更新されたら、そのステートの依存するコンポーネントが必然的に全て再レンダリングされる」点にあります。複雑な状況では、たとえステートが更新されても再レンダリングをしたくない場合がありますね。特に、ステートの値をそのままレンダリングに使うのではなく、ステートから別の値を計算して使う場合にこれが顕著です。

### ステート管理ライブラリによる解決策

ReduxやRecoil、そしてそれに留まらない多くのステート管理ライブラリは「Reactの組み込みのコンテキストを使わない」ことによってこの問題を克服しています。そのために、Reactに頼らない**独自のサブスクリプションの仕組み**を持つことになります。これがステート管理ライブラリが提供する主要な価値であり、それをどのようなAPIで表現するかによってそれぞれのステート管理ライブラリの個性が出ているという状況です。そこに、Recoilは「フックとの相性」「シンプル」「宣言的」といった特徴を提げて参戦したことになります。

Reduxでは、「ステートから別の値を計算」の部分をselectorが担当します。そして、ステートが更新されても、そのステートを基にselectorが計算した値が変化していなければ、コンポーネントの再レンダリングは発生しません。ここにReduxの一番の本質があります。Reactのコンテキストが持つ「コンテキストの値が更新されたらコンポーネントが再レンダリングされる」という挙動に割り込むことはコンテキストを使用している限り不可能であり、Reduxは独自のサブスクリプションによってコンテキストをいわば再実装することでこれを達成しているのです。

もちろん、Recoilも同じ考え方を持っていると考えられます（ソースコードを読んだわけではないので確信があるわけではありませんが、多分合っていると思います）。Recoilにもselectorという概念があり、これはReduxのselectorと一対一に対応するものではありませんが、概ね似た目的を達成するために存在しています。そして、Recoilも、ステートが更新されてもselectorの結果が変わらなければコンポーネントの再レンダリングが発生しないのです。

では、いよいよRecoilのAPIがどのようなものかを見ていきましょう。

## Recoilの基本的な使い方

Recoilの基本的な使い方は[公式のドキュメント](https://recoiljs.org/docs/introduction/core-concepts)を見れば分かるのですが、この記事でもちゃんと説明します。

### Atomを宣言する

Recoilでは、グローバルな（複数コンポーネントで共有される）ステートは**Atom**と呼ばれます。例えば、数値を値に持つ簡単なAtomは、Recoilが提供する`atom`関数を用いてこのように作れます。

```jsx
const counterState = atom({
  key: "counterState",
  default: 0
});
```

Atomの宣言に必要なのは、デフォルト値とkeyのみです。keyというのはAtomを識別する文字列で、グローバルにユニークである必要があります。グローバルなユニーク性が求められるのは心配事が増えて個人的には気に入らないのですが、公式ドキュメントによれば高度なAPIにおいてAtomの一覧のようなものを扱うときに必要なようです。まあ、被ったらランタイムエラーとのことなので許容範囲でしょうか。

このように、Atomの宣言自体は単にステートを宣言するだけであり、そのAtomがどのように使われるかというロジックは含んでいません。これはちょうど、`useState`がデフォルト値のみを受け取ってステートを宣言し、どう使われるのかに関与しないのと同じですね。

### Atomを使う

コンポーネントからAtomを使うには、Recoilが提供する`useRecoilState`を使うのが最も基本的です。例えば、上記の`counterState`は次のように使えます。

```jsx
const CounterButton = () => {
  const [count, setCount] = useRecoilState(counterState);
  return (
    <p>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
    </p>
  );
};
```

このように、`useRecoilState`は`useState`と同様のAPIを持ちます。ただし、デフォルト値を受け取る代わりにすでに定義済みのAtomを引数に受け取ります。返り値は`[count, setCount]`のような2要素配列であり、`count`がそのAtomの現在の値、`setCount`はAtomの値を更新する関数です。
この組は`useState`と全く同じであり、`useState`によって宣言されたコンポーネントローカルなステートと同様の感覚で、`counterState`というグローバルなステートの値を読み書きすることができます。もちろん、この`counterState`はグローバルなステートなので、`CounterButton`コンポーネントを複数設置すればその値は全て連動することになるでしょう。

繰り返しになりますが、Atomの値をどう変化させるかは、そのAtomを`useRecoilState`を用いて使う側に委ねられています。このような設計は、reducerをベースとしたステート管理に比べると幾分原始的に感じられますね。後で触れますが、これはカスタムフックに組み込まれることを意図したデザインであると考えられます。

ここで注目に値するのは、`atom({ ... })`と`useRecoilState(atom)`はどちらも素のReactでいう`useState`の類似物であると説明したことです。実際、この2つはセットで`useState`と同様の働きをします。というのも、通常のReactで「（コンポーネントに属する）ステートを宣言する」というのは`useState`を呼び出すことで行われましたが、Recoilではこれは`atom`によりAtomを宣言する段階と`useRecoilState`によりそのAtomを使用する段階に2つに分かれています。

これは、ステートをグローバルなものにしたことによる必然的な選択です。Reactの`useState`は「ステートを宣言する」役割と「そのステートを使用する」という2つの役割を持っていたと考えられ、Reactではステートはコンポーネントに属するので両者は不可分なものでした。一方、Recoilではステート（Atom）をグローバルなものにしたことにより、ステート（Atom）の宣言と、実際にそのAtomを使うコンポーネントは何かという宣言の2つが別々に行えるようになりました。これが、`atom`と`useRecoilState`という2つのAPIが両方とも`useState`のアナロジーとして説明される理由です。素の`useState`との違いは、1回の`atom`で作られた`Atom`に対して複数回（複数コンポーネントから）`useRecoilState`できるという点ですね。

このAPIはとても宣言的なものであると評することができるでしょう。`atom({ ... })`が行なっているのはステートを作るということだけであり、従来のように「`useState`によって手に入れられるステートの値」などではなく、「ステートそのもの」という概念がここに発生しています。我々は「ステートそのもの」を取り回す事ができるのです。`useRecoilState`の効果は「（既知の）ステートを使う」という宣言であり、`useState`の「ステートを作る」に比べてもなお宣言的度合いが増しています。

### Atomを使うためのその他のフック

ドキュメントでは、`useRecoilState`以外にも`useRecoilValue`と`useSetRecoilState`というフックが紹介されています。これらは`useRecoilState`の用途が制限されたバージョンです。`useRecoilState`が読み書き両対応だったのに対して、`useRecoilValue`は読み取り専用、`useSetRecoilState`は書き込み専用です。

例えば、`counterValue`の値を表示したいだけの場合、次の2つの選択肢があります。

```jsx
// useRecoilStateを使う場合
const [counter] = useRecoilState(counterValue);
// useRecoilValueを使う場合
const counter = useRecoilValue(counterValue);
```

ドキュメントでは、ステートに書き込まない場合は`useRecoilValue`が推奨されていますから、それに従いましょう。
書き込まないのに`useRecoilState`を使うのは、書き込まない変数を`const`ではなく`let`で宣言するようなものです。

とはいえ、プログラムの読みやすさの問題であり、どちらを使っても動作は同じでしょう。

それよりも注目すべきは`useSetRecoilState`のほうです。これは、ステートの値を読まないけど更新はするという場合に使えるフックです。`useRecoilState`と比較するとこうなります。

```jsx
// useRecoilStateを使う場合
const [, setCounter] = useRecoilState(counterValue);
// useSetRecoilStateを使う場合
const setCounter = useSetRecoilState(counterValue);
```

これは一見使い所が無いように見えて、とても重大な意味があります。というのは、`useRecoilState`とは異なり、**`useSetRecoilState`はAtomをsubscribeしません**。つまり、`useSetRecoilState`を用いてAtomへの書き込み権限のみを取得しているコンポーネントは、Atomの値が変わっても再レンダリングされないのです。Atomの値を読まないのだから、Atomの値が変わっても影響を受けないということですね。

これは、無用な再レンダリングを避けつつAtomの更新手段が得られるという貴重なAPIです。素のReactで言えば、`useReducer`のステートは見ないで`dispatch`だけをコンテキストで受け取るのと同じようなものです。この特徴により、`useSetRecoilState`は`useRecoilState`では代替不可能なものとなっています。

また、Atomの値をリセットする関数を取得できる`useResetRecoilState`もあるようです。Atomに関しては「デフォルト値」というパラメータだけはAtomを使う側（`useRecoilState`等のフックを使う側）ではなくAtomの定義そのものに属しますから、この機能が別に用意されていると考えられます。具体的なユースケースはちょっと思い浮かびません。

### useRecoilCallback

最後に、`useRecoilCallback`というフックもあります。これは、Atomへのsubscribeは発生させたくないけどAtomの値を読みたいという贅沢な悩みを解決してくれるフックです。これまでとは毛色が違い、`useRecoilCallback`は**`useCallback`の亜種**です。

例えば、「クリックすると現在の`counterState`の値を表示するボタン」は`useRecoilCallback`を使うと次のように書けます。これは`useRecoilValue`などを使っても作ることができますが、`useRecoilCallback`を使えばこのコンポーネントの再レンダリングを削減することができます。なぜなら、クリックした時に`counterState`の値を取得するようにすれば、`counterState`が変わっても再レンダリングは不要だからです。この「クリックしたときにAtomの値を取得する」を実現するためのAPIが`useRecoilCallback`です。

```jsx
const AlertButton = () => {
  const showAlert = useRecoilCallback(async ({ getPromise }) => {
    const counter = await getPromise(counterState);

    alert(counter);
  }, []);

  return (
    <p>
      <button onClick={showAlert}>Show counter value</button>
    </p>
  );
};
```

`useRecoilCallback`は`useCallback`と同様のインターフェースを持ちます。すなわち、第1引数にコールバック関数を受け取り、第2引数は依存リストです。普通の`useCallback`との違いは、コールバック関数の第1引数のオブジェクトを通じて`getPromise`関数を受け取れるということです（他に`getLoadable`, `set`, `reset`関数も提供されます）。

この`getPromise`関数を用いると、好きなAtomの値を取得することができます。ただし、結果はPromiseとなります。なぜ急にPromiseが出てきたのかといえば、Recoilは非同期なselector（後述）もサポートしているからです。`useRecoilState`などの場合は非同期の扱いはRecoil内部に隠蔽されていますが、`useRecoilCallback`は、いわば副作用に属するようなもう少しローレベルなAPIであるため、このようにPromiseが露出することになります。Atomの値を変えたい場合は`set(state, newValue)`のようにします。

## Selectorを使う

Recoilの基礎的な概念は、Atomの他にもう一つSelectorがあります。Selectorは、**Atomの値から計算された別の値**です。いわゆるcomputed property的なやつですね。Reduxのselectorも、ステートから値を計算するという点では似た概念です。例によって、Selectorの値から別のSelectorを計算する（Selectorを連鎖させる）こともできます。

Recoilでは、AtomとSelectorを合わせて**State**と呼びます。これまでに出てきた`useRecoilState`などのフックは、全てAtomではなくSelectorに対しても使うことができます。AtomとSelectorは値を提供するという点で共通しており、違いは自身が値を持っているか、あるいは他から計算しているかだけです。`useRecoilState`はどちらも区別せずに扱うことができるのです。

Selectorは、Recoilが提供する`selector`関数を用いて作成します。まず宣言するという点でAtomととても類似していますね。

例として、`counterState`の10分の1の整数を表すSelectorを定義してみましょう。

```jsx
const counterState = atom({
  key: "counterState",
  default: 0
});

const roughCounterState = selector({
  key: "roughCounterState",
  get: ({get}) => Math.floor(get(counterState) / 10)
});
```

このように、Selectorの定義には`key`と`get`を含めます。`get`はそのSelectorの値を計算する関数です。`get`関数は引数から`get`を受け取り（ややこしいですね）、その`get`を用いて他のState（AtomまたはSelector）の値を用いることができます。Selectorの値の計算中に`get`されたStateは、そのSelectorからsubscribeされていると見なされます。

今回の場合、`roughCounterState`は`counterState`をsubscribeします。すなわち、`counterState`の値が変わったとき、`roughCounterState`の値も再計算されます。

この`roughCounterState`はSelectorなのでAtomと同様に使うことができ、例えばこんなコンポーネントを書けるでしょう。

```jsx
const RoughButton = () => {
  const roughValue = useRecoilValue(roughCounterState);
  return (
    <p>
      <button>{roughValue}</button>
    </p>
  );
};
```

ポイントは、**`roughCounterState`の値が変わらなければ`RoughButton`は再レンダリングされない**ということです。例えば、`counterState`の値が0→1→2→…→9と変わる間、`roughCounterState`の値は常に0です。よって、`roughCounterState`の値は変わっていないと見なされ、`RoughButton`は再レンダリングされません。`counterState`の値が10になったとき、`roughCounterState`の値は初めて1に変化します。よって、この時初めて`RoughButton`が再レンダリングされます。

このように、Atomの値を直接使わずに何らかの計算を挟んで使用する場合、その計算をSelectorとして定義することで、コンポーネントの再レンダリングを抑制できることがあります。これはReduxのselectorと同じ特徴です。

### 非同期なSelector

実は、Selectorの値の計算は非同期にすることもできるようです。その場合は、次のように`get`の返り値をPromiseにします。

```js
const roughCounterState = selector({
  key: "roughCounterState",
  get: async ({get}) => {
    await sleep(1000);
    return Math.floor(get(counterState) / 10);
  }
});
```

このように、Selector（より一般にはState）はその値が非同期的に計算される可能性があります。`useRecoilCallback`のときに`getPromise`という機能が出てきたのはこれを考慮してのことです。

そうなると、問題となるのは、まだ計算が終わっていない値をコンポーネントが使用しようとした場合です。実はこの場合は**サスペンド**が発生します。サスペンドはRecoilに特有の概念ではなく、Reactの**Concurrent Mode**の概念です。Concurrent Modeについては筆者の既存記事「Concurrent Mode時代のReact設計論」シリーズをご覧ください。

- [Concurrent Mode時代のReact設計論 (1) Concurrent Modeにおける非同期処理](https://qiita.com/uhyo/items/4a6315bfccf387407631)

とにかく、Recoilは、ReactのConcurrent Modeを前提として非同期なSelectorにも対応しているということです。Concurrent Modeについては深入りしたくないので、非同期の話はこの記事ではあまりしません。

なお、`useRecoilStateLoadable`と`useRecoilValueLoadable`という非同期処理に関わるフックもあります。これらは、生のStateの値を取得する代わりに、そのStateの`Loadable`オブジェクトを取得できるものです。`Loadable`オブジェクトについては省略しますが、「Concurrent Mode時代のReact設計論」シリーズで`Fetcher`と呼んでいたものと同じで、Promiseをラップしたオブジェクトです。

### 書き込めるSelector

RecoilのSelectorの特徴は、読み取りだけでなく書き込みもできるということです。ただしこれはオプショナルで、上記のように`get`だけで定義したSelectorは読み取り専用となります。

書き込み可能なSelectorの典型的な動作は、書き込まれたら逆計算を行いその結果を親のAtom（または別のSelector）に書き込むということです。これができることにより、RecoilにおけるSelectorは単なる計算結果という意味を超えて、Atomに対するインターフェースという意味をも備えることができます。

先ほどの`roughCounterState`に書き込み対応を追加するとこうなります。書き込みは、`selector`関数に渡すオブジェクトに`set`プロパティを追加することで行います。

```js
const roughCounterState = selector({
  key: "roughCounterState",
  get: ({get}) => Math.floor(get(counterState) / 10),
  set: ({set}, newValue) => set(counterState, newValue * 10),
});
```

このように、`set`関数は`newValue`を受け取ると共に、他のAtomに書き込むための`set`関数（ややこしい）を受け取ります。この`roughCounterState`は、自身に数値が書き込まれたらその10倍の値を`counterState`に書き込みます。例えば、`roughCounterState`に2が書き込まれたら、`counterState`には20が書き込まれます。

`RoughButton`も書き込み対応にするとこんな感じになります。`RoughButton`を押すと`roughCounterState`の値が1ずつ増やされますから、これは一押しで`counterState`の値を10も増やせるお得なボタンとなります。

```jsx
const RoughButton = () => {
  const [roughValue, setRoughValue] = useRecoilState(roughCounterState);
  return (
    <p>
      <button onClick={()=> setRoughValue(c => c+1)}>{roughValue}</button>
    </p>
  );
};
```

## RecoilのAPIのまとめ

以上で、この記事を書いた時点でRecoilのドキュメントに乗っているAPIは説明し終わりました。

まとめると、値を保持するグローバルなステートとして使用できるAtomと、Atom（または他のSelector）から計算される値を表すSelectorが存在し、この2種を合わせてStateと呼びます[^note_recoilvalue]。そして、`useRecoilState`などのフックはStateを読み書きするのに使用することができます。これらのフックはStateへのサブスクリプションを暗黙に持っており、Stateの値が更新された時のみコンポーネントを再レンダリングされます。

[^note_recoilvalue]: RecoilValueとも呼ばれるようです。

Atomは、コンポーネント間で共有されるグローバルなステートとしてのベーシックな役割を担っています。Atom単体で見たときの利点は、グローバルなステートが沢山あった場合も、必要なAtomのみsubscribeすることができるという点です。Recoilでは、自身に関係ないAtomの値が更新されたとしてもコンポーネントが再レンダリングされることはありません。

Atomの値が更新されたときに毎回再レンダリングが発生するのは困るという場合、Selectorの出番です。Selectorは、Atomとコンポーネントの間に計算を挟むことができます。SelectorをsubscribeするコンポーネントはSelectorの値が変わったときのみ再レンダリングされますから、Atomを生で使うよりもさらに最適化された再レンダリング戦略を実現できます。

## Recoilとカプセル化

これまでの例ではRecoilのAPIを生で使ってきましたが、RecoilのAPIの真価は**カスタムフックの部品として使いやすい**点にあります。これは、RecoilのAPIが、原始的なものであり、かつフックであるという特徴から来ています。

具体例で考えてみましょう。この記事でずっと使ってきた`counterState`の例は、ボタンを押すと必ず値が1ずつ増やされてきました（`RoughButton`は例外ですが）。しかし、`counterState`の定義をみてもそんなことはどこにも書かれていません。もし`counterState`の値を必ず1ずつ増やす必要がある場合、これは無防備です。ということで、実装の詳細を隠蔽することで、1ずつ増やす以外の操作を禁止しなければいけません。

### 普通のステートの場合

これは、普通の`useState`では簡単にできます。こんなカスタムフックを作ればいいのです。

```js
const useCounter = ()=> {
  const [counter, setCounter] = useState(0);
  const increment = useCallback(()=> {
    setCounter(c => c + 1);
  }, []);
  return [counter, increment];
}
```

このフックは数値のステートを作るフックですが、`setCounter`の代わりに`increment`を返り値で提供します。この関数が呼び出されると、ステートは1だけ増やされます。

このステートを一気に2以上増やしたり、あるいは減らしたりするのは不可能です。なぜなら、そのために必要な`setCounter`は、関数`useCounter`内のスコープに隠蔽されていて外から触ることができないからです。これがある種のカプセル化であり、「1ずつ増えるステート」という機能の内部実装に`useState`が使用されていることを隠蔽することで、ステートに対する変な操作を防いでいます。

### グローバルなステートの場合

Recoilでも、これと同じことができます。例によって、`counterState`を隠蔽して1ずつしか増やせないようにしてみましょう。すると、こんな感じになるでしょう。

```js
const counterState = atom({
  key: "counterState",
  defalt: 0;
});

export const useGlobalCounter = () => {
  const [counter, setCounter] = useRecoilState(counterState);
  const increment = useCallback(() => {
    setCounter(c + 1);
  }, []);
  return [counter, increment];
}
```

先ほどと全然変わりませんね。ポイントは、`useGlobalCounter`にこれ見よがしに付いている`export`です。これで`globalCounter.js`みたいな一つのファイルであると想定してください。すると、このファイルからエクスポートされているのは`useGlobalCounter`のみであり、`counterState`はエクスポートされていない、すなわちこのファイル内に隠蔽されています。

これが意味することは、`useGlobalCounter`を使う以外に`counterState`を使う手段がないということです。必然的に、`counterState`の値はやはり1ずつしか増やせません。

このように、原始的なAPIとカスタムフックという道具によって、Stateをファイル（モジュール）のスコープの中に隠蔽する方法によるカプセル化が実現できます。これは、中央集権的なReduxには難しい芸当でしょう。

ある程度の規模のアプリの場合、RecoilのAPIをコンポーネントから直接使うよりもこのようにカスタムフックを通じて使うことの方が多いのではないかと想像できます。Recoilは、カスタムフックの利便性を完全に生かす形でグローバルなステート管理を導入できるのです。

また、改めて見てみると、このように末端のモジュールでAtomを定義するだけでそれがグローバルなステートとして有効化されるというのはとても強力ですね。Reduxのような中央集権的なステート管理ライブラリの煩雑さが大きく削減されているように思えます。

## TypeScriptとの相性

最後に、RecoilとTypeScriptの相性はどうでしょうか。React自体は、公式の型定義が提供されていないとはいえ、TypeScriptとの相性は良いことが知られています。Recoil自体はFlowで型がつけられていますから、型システムとの相性は悪くなさそうですね。

まだRecoilのTypeScript型定義が無さそう（記事を書いている間に作られているかもしれませんが）なのでこれは想像なのですが、TypeScriptでRecoilのAPIに型を付ける上では特に障害はなさそうです。

例えばAtomやSelectorはそれぞれ`Atom<T>`や`Selector<T>`のような型を持てるでしょう。これらは`atom<T>({ ... })`のような形で型引数を使った関数呼び出しで作ると想像されます。ちょうど今の`useState`と同様ですね。

`useRecoilState`などのフックも、どのAtomやSelectorに依存するかを明示的に指定するAPIになっています。よって、苦労なく結果の型を得ることができるでしょう。Reduxの`useSelector`の場合ステート全体の型を`useSelector`が予め知っている必要がありましたが、Recoilではそのような苦労は必要ありません。

SelectorがAtomに依存する場合も、`get(state)`といった形で依存先を明示的に書きますから、`get(state)`の型は容易に推論されます。

このように、RecoilではAPI上で明示的に依存先を書ける（変なメタプログラミングが全く必要ない）ようになっており、TypeScriptフレンドリーに設計されています。

## まとめ

この記事では、現在分かっているRecoilの特徴を整理し、筆者の所感を述べました。

Recoilはグローバルなステート管理におけるパフォーマンス上の問題を解決する事を主要な目的としており、この点はReduxと同様です。

RecoilのAPIはcode splittingが可能で、さらにカスタムフックと相性が良いシンプルなAPIとして設計されており、TypeScriptとの相性も良くなっています。

筆者としてはRecoilはかなりの高評価です。筆者もステート管理に関しては試行錯誤していましたが、これでいいのではと思わされました。