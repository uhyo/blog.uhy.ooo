---
title: react-routerで現在のlocationを取得する2種類の方法の使い分け方
published: "2020-06-10T23:50+09:00"
updated: "2020-06-10T23:50+09:00"
tags:
  - React
  - JavaScript
---

SPAを作る際は、URLを変化させたり、URLの変化に反応して画面を変えたりする必要があります。このために使われるのがルーティングライブラリです。Reactにおいては、[react-router](https://reacttraining.com/react-router/)が代表格として知られています。

react-routerでルーティングが制御されている場合、その中のコンポーネントが現在のURLを表すオブジェクトである**location**を得るための方法は大別して2つあります。一つは`useLocation`、もう一つは`useHistory`です。なお、これらのフックはreact-routerのv5.1で追加されました。この記事ではこれ以前の方法は取り扱いません。

この2つの方法のどちらを使っても`location`を得ることは可能ですが、どちらを使うべきかは場合によって明確に異なります。間違った方を使うと、パフォーマンスが低下したり期待通りに動かなかったりという問題が発生することになります。

## `useLocation`と`useHistory`の使い方

さて、`useLocation`はその名の通り現在の`location`を返すフックです。例えば次のようなコンポーネントがあれば、常に現在のURL（パス）を表示し続けるでしょう。

```jsx
const ShowLocation = ()=> {
  const location = useLocation();
  return <div>
    {location.pathname}
  </div>;
}
```

一方、`useHistory`は`history`オブジェクトを返します。このオブジェクトはURLを変えたいときに使える`history.push`といったメソッドを提供しています。例えば、ボタンがクリックされたときに別のURLに移動したい場合は次のような実装ができます。

```jsx
const NextPageButton = ()=> {
  const history = useHistory();
  return <button onClick={()=> {
    history.push('/some/url');
  }}>click me!</button>;
}
```

これらが`useLocation`と`useHistory`の基本的な使い方です。この記事で特に注目したいのは、`history.location`とすることで`history`オブジェクトのプロパティから前述の`location`オブジェクトを取得できるという点です。

これを使うと、`ShowLocation`は次のように書き換えられるように**一見思われます**。

```jsx
const ShowLocation = ()=> {
  const history = useHistory();
  return <div>
    {history.location.pathname}
  </div>;
}
```

お察しの通り、この実装はうまく動きません。実は以前はこの実装でも動きましたが、react-routerの5.2.0（2020年5月12日リリース）からはうまく動かなくなりました。うまく動かないというのは、URLが変わっても`ShowLocation`が再レンダリングされず、常に現在のURLを表示することができないということです。

## `history`は常に同じオブジェクトである

ここでの根本的な問題は、`location`はURLが変わると新しいオブジェクトが作られるのに対して、**`history`は常に同じオブジェクトである**ということです。すなわち、URLが変わっても`useHistory`から返される`history`は常に同じオブジェクトです[^note_history]。ただし、`location`がイミュータブルなものである代わりに、`history`はミュータブルです（ユーザーが勝手に`history`を書き換えることはありませんが）。

[^note_history]: 一応、`Router`が使う`history`を動的に変えるようなことをすれば`history`を変えることも可能でしょう。しかし、そのような状況はあまり発生しません。

具体的には、ページ遷移の際にはURLが変わるので新しい`location`オブジェクトが作られる一方、`history`は同じオブジェクトが引き続き使用されます。このとき、`history.location`は再代入によって書き換えられます。これにより、`history`は同じオブジェクトだが、`history.location`を参照すると常に最新のURLが取得できることになります。

Reactの`useState`フックや`useContext`フックは、その結果が変化したときにコンポーネントを再レンダリングします。そうなると、`useLocation`の返り値はURLが変わるたびに新しいオブジェクトになるため、URLが変わると再レンダリングが発生するのは自然ですね。一方で、`history`オブジェクトは常に同じであるため、`useHistory`の返り値は常に同じオブジェクトです。ならば、URLが変わっても`useHistory`は再レンダリングを発生させないのが妥当に思えます。

特に、Reactにおいて「オブジェクトが常に同じかどうか」という観点はパフォーマンスを考慮すると重要です。実際、`useState`のステート更新関数や`useReducer`の`dispatch`関数などは常に同じであることがAPIリファレンスにで明示されています。

従来（5.2.0より前）の`react-router`では、URLが変わった際に、結果が変わらないのに`useHistory`による再レンダリングが発生していました。5.2.0ではこれが発生しないように改善されたのです。

## `useLocation`と`useHistory`の使い分け方

ここまでで`useLocation`と`useHistory`の違いが分かりましたね。前者はURLが変わると再レンダリングが発生して新しい`location`オブジェクトが得られる一方で、後者の結果である`history`オブジェクトは常に同じであり、そのため`useHistory`はURLが変わっても再レンダリングを起こしません。

ここから言えることは、**レンダリング中に`location`が必要ならば`useLocation`を使い、そうでないなら`useHistory`を使う**べきであるということです。

先ほどの`ShowLocation`はレンダリング中に`location`が必要な例です。実際、レンダリング結果に`location`が影響しています。このような場合、`location`の変化に追随して再レンダリングを行う必要がありますから、`useLocation`を使う必要があります。

```jsx
const ShowLocation = ()=> {
  const location = useLocation();
  return <div>
    {location.pathname}
  </div>;
}
```

一方で、次のコンポーネントを考えてみましょう。

```jsx
const ShowLocationButton = ()=> {
  const location = useLocation();
  const onClick = ()=> {
    alert(location.pathname);
  }
  return <button onClick={onClick}>
    show location
  </div>;
}
```

このボタンをクリックすると、現在のURLがアラートで表示されます。こちらの例では`location`は`onClick`関数の中でのみ使用されています。つまり、実際にレンダリングされる瞬間に`location`は使われないということです。このような場合は`useHistory`で代替できます。

```jsx
const ShowLocationButton = ()=> {
  const history = useHistory();
  const onClick = ()=> {
    alert(history.location.pathname);
  }
  return <button onClick={onClick}>
    show location
  </div>;
}
```

こうすることで、URLが変わっても`ShowLocationButton`は再レンダリングされないため、パフォーマンス的に有利です。さらに、実装としてもこれは問題ありません。`ShowLocationButton`のレンダリング後にURLが変化しても`ShowLocationButton`は再レンダリングされませんが、URLが変わっても`history`は同じものが使い回されるために、`history.location`を参照すれば常に現在のURLとなっています。

## 結論

現在のURLを得るために使える`useLocation`と`useHistory`はそれぞれ異なる特徴を持ち、適切に使い分ける必要があります。

`useLocation`は「URLが変わると再レンダリングされる」という点が特徴です。URLが変わったらレンダリング結果を変化させなければいけない場合は`useLocation`が適切です。

逆に、`useHistory`は「URLが変わっても再レンダリングされない」という特徴を持ちます。現在のURLがレンダリング結果には影響しないが、クリックイベントや`useEffect`といった副作用の中で現在のURLを取得したいという場合は`useHistory`が適切です。

ちなみに、お察しの通り、この記事で扱っていたのはURLが変わっても存在し続けるようなコンポーネントでした。特定のURLでしか表示されないというような場合は正直どちらでも大差ありません。しかし、その場合もこの指針に従うことを強くおすすめします。そうしないと、コードの意図が誤解される恐れがあるからです。

