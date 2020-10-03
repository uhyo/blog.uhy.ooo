---
title: "react-wc: Web ComponentsとReactで実現するCSS in JSの形"
published: "2020-10-03T23:45+09:00"
tags:
  - React
---

**CSS in JS**はJavaScriptのコードの中にCSSを書く手法の総称で、CSS Modulesやstyled-componentsなどがよく利用されています。
この記事では、筆者がCSS in JSについて考えてたどり着いた一つの解を紹介します。
また、そのために作ったライブラリ**[react-wc](https://github.com/uhyo/react-wc)**を紹介します。

## Shadow DOMを活用する

筆者がたどり着いた考えは、**Web Components**をそのまま使えばいいじゃんというものです。Web ComponentsはいくつかのWeb標準の総称で、特にここで重要なのは**Shadow DOM**です。

CSS in JSが達成すべき目標の一つはスタイルのローカル化（書いたCSSを特定のコンポーネントに対してのみ適用し、他に影響を与えないこと）ですが、Shadow DOMはこの機能を備えたWeb標準ですから、これを利用することでスタイルのローカル化は達成できます。

なので、与えられたHTMLをShadow DOMの中に入れるだけのReactコンポーネントを作れば簡単なCSS in JSになりそうです。

## `react-wc`のサンプル

`react-wc`では、これを次のようなAPIで行います。

```ts
import { html, slot } from "react-wc";

export const Counters = html`
  <style>
    div {
      display: grid;
      grid: auto-flow / repeat(16, 80px);
      gap: 10px;
    }
  </style>
  <div>${slot()}</div>
`;
```

このように、Shadow DOMの中に入れたいものをタグ付きテンプレートリテラルに入れて呼び出します（`html`という名前はlit-htmlに倣っています。そうするとlit-html用のVSCode拡張がそのままシンタックスハイライティングに使えるのが理由です）。
HTMLの中には`slot()`を埋め込むことができ、これはHTMLの`slot`要素に対応するものです（HTML中に`<slot></slot>`と書いてもいいのですが、このようなAPIにしている理由はTypeScript対応をよくするためです）。

Shadow DOMの機構により、ここで書かれた`style`要素によるdiv要素に対するスタイリングは、同じShadow DOM内の`div`にのみ適用されます。これがスタイルのローカル化です。

このようにして作られた`Counters`はReactコンポーネントとなり、普通に次のように使うことができます。
`Counters`に子要素として渡されたものは`slot()`のところに入ります。この機構も、Shadow DOMの機構（`slot`要素）をそのまま使っています。

```tsx
<Counters>
  <Counter />
  <Counter />
  <Counter />
  <Counter />
</Counters>
```

この`Counters`が実際にレンダリングされると、およそ次のようになります。
`Counters`自体はカスタム要素（今のところ名前は適当なランダム文字列にしています）となり、`Counters`を定義するときに渡されたHTML文字列はそれにアタッチされたShadow DOMの中に入っています。
`Counters`に子として渡されたものはそのままカスタム要素の子となり、描画される際にはShadow DOMの`<slot></slot>`の位置に入ります。

```html
<wc-9pseu4w3rao-1>
  #shadow-root
    <style>
      div {
        display: grid;
        grid: auto-flow / repeat(16, 80px);
        gap: 10px;
      }
    </style>
    <div><slot></slot></div>
  children...
</wc-9pseu4w3rao-1>
```

## 複数のスロットを扱う

Shadow DOMは`<slot name="foo"></slot>`のような名前付きのスロットをサポートしていますが、`react-wc`もこれに対応しています。
次の例のように`slot()`にスロット名を渡すことで利用可能です。

```tsx
export const AppStyle = html`
  <style>
    header {
      border: 1px solid #cccccc;
      padding: 4px;
    }
    p {
      border-bottom: 1px dashed #999999;
    }
  </style>
  <header>${slot("header")}</header>
  <p>Counter value is ${slot("counter")}</p>
  <main>${slot()}</main>
`;
```

使う側は、名前無しのスロット以外はpropsとして中身を渡します。

```tsx
<AppStyle
  header={
    <p>
      <button onClick={() => setCounter((c) => c + 1)}>+1</button>
    </p>
  }
  counter={<CounterValue>{counter}</CounterValue>}
>
  <Counters>
    {[...range(0, 256)].map((i) => (
      <Counter key={i}>{counter}</Counter>
    ))}
  </Counters>
</AppStyle>
```

このように任意のJSX要素を名前付きスロットに入れられるようになっていますが、これが実装上一番苦労させられたところです。
というもの、純粋なWeb Componentsではslotに入れる要素は次のような形で`slot`属性を用いて指定するからです。

```html
<wc-9pseu4w3rao-1>
  #shadow-root
    ...
  <p slot="header">...</p>
  <b slot="counter">...</b>
  ...
</wc-9pseu4w3rao-1>
```

任意のJSX要素を上のような`slot`属性を用いる形に変換してからDOMに吐く作業を`react-wc`が行なっています。

## `react-wc`とCSS in JSの考え方

このように、`react-wc`がやっていることはただShadow DOM付きのコンポーネントを作るだけで、とても単純です。

しかし、これをCSS in JSの手法と見なすといくつかの特徴が見えてきます。
一つは、**スタイルとロジックの完全な分離**です。
`react-wc`が提供する`html`によって作られたコンポーネントは、一切のロジックを持ちません。
これを使ってスタイリングを行うと、必然的にロジックを担当するコンポーネントとスタイルを担当するコンポーネントが分離することになります。
他の方法と比較すると、styled-componentsなどは比較的分離できる傾向にあります。一方、CSS Modulesはあまり分離しません。

次に、**HTML構造とスタイルシートをセットにしたパッケージ化**です。多くのCSS in JSでは「スタイル付けされた一つの要素」が作られますが、`react-wc`の手法では、むしろ「スタイル付けされた**HTML構造**」が提供されます。
先ほどちょっと出てきたこれがいい例ですね。
このコンポーネントは`header`, `p`, `main`からなる構造をパッケージとして提供しています。

```tsx
export const AppStyle = html`
  <style>
    header {
      border: 1px solid #cccccc;
      padding: 4px;
    }
    p {
      border-bottom: 1px dashed #999999;
    }
  </style>
  <header>${slot("header")}</header>
  <p>Counter value is ${slot("counter")}</p>
  <main>${slot()}</main>
`;
```

例えばstyled-componentsなどでも似たようなことは可能ですが、「スタイル付けされたルートコンポーネント」と「そのコンポーネントの内部構造」という2段階の定義が必要になりがちです。
`react-wc`ならば、Shadow DOMの力により一発でパッケージ化できます。

また、どれくらい効果があるのか分かりませんが、仮想DOMが軽量化されるのが個人的に嬉しい点です。
`react-wc`によりShadow DOMに入れられたものは、Reactが管理する仮想DOMの中には現れません。
これにより仮想DOMのdiff計算が軽くなったりしないかなあと思っています。

以上が`react-wc`の良い点ですが、一方で難点もあります。
これはReact向けの想定ですが、JSXによる定義とHTML文字列による定義が混在する点です。
もはやCSS in JSではなく**HTML in JS**になっている気がしますが、Web Componentsを使っているということ、そしてその利点を意識していないと混乱してしまうかもしれません。
一応JSXで定義することも不可能ではありませんが、実装が簡単なのと、TypeScriptの型のクオリティがHTML文字列の方が高くなるため、今のところこうしています。
将来的にJSXでの定義をサポートするかもしれません。

## まとめ

Web ComponentsをCSS in JSに活用するという発想と、それを形にした筆者作のライブラリ`react-wc`を紹介しました。
ReactのCSS in JSに絶対的な解がないというのが定説とされる現状において、新たな形を提示できたのではないかと思います。

似たような発想の既存ライブラリとして[react-shadow](https://github.com/Wildhoney/ReactShadow)がありますが、`react-wc`ではShadow DOMをReactが管理する仮想DOMツリーに入れずに、コンポーネント定義の一部として扱うという決定的な違いがあります。