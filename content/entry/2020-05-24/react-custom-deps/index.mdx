---
title: useEffectのdeps比較関数をカスタムしたくなったときにやること
published: "2020-05-25T09:00+09:00"
tags:
  - React
  - JavaScript
---

Reactにおいて、`useEffect`などいくつかのフックは第2引数として**依存リスト**を取ります。
例えば`useEffect`の場合、レンダリングの度に依存リストのいずれかの値が前回から変化したかどうかがチェックされ、変化していた場合はレンダリング後にコールバック関数が呼び出されます。
具体例としては、次のコンポーネントは`counter`が変化するたびに`console.log`でそれを表示するでしょう。

```js
const Conter = () => {
  const [counter, setCounter] = useState(0);

  useEffect(()=> {
    console.log(counter);
  }, [counter]);

  // ...
}
```

この場合、この`useEffect`の依存リストは`counter`一つということになります。
最初`counter`が`0`だった場合、次の再レンダリング時に`counter`が`0`のままだった場合はコールバック関数は実行されませんが、`counter`が例えば`1`になっていた場合はコールバック関数が実行されます。
この「変化した」という判定は`===`で行われます。
つまり、依存リストのそれぞれの値を前回の値と`===`で比較して、ひとつでも一致しなければ依存リストが変化したと見なされます。

ところが、この一致判定をカスタマイズしたくなることがたまにあるかもしれません。
この記事ではその方法をご紹介します。
基本方針としては、「前の値を保存しておいて自分で比較する」というものになります。

## 結論

結論から言えば、次のようなカスタムフック`useDeps`を定義すればできます。

```ts
function usePreviousValue<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const prevValue = ref.current;
  ref.current = value;
  return prevValue;
}

export function useDeps<Deps extends any[]>(
  deps: Deps,
  compare: (prev: Deps, current: Deps) => boolean
): number {
  const counter = useRef(0);
  const prevDeps = usePreviousValue(deps);
  if (prevDeps === undefined) {
    return counter.current;
  }
  if (!compare(prevDeps, deps)) {
    counter.current++;
  }
  return counter.current;
}
```

型を見て分かるように、`useDeps`の引数は2つです。一つは依存リストであり、もう一つは前回のリストと今回のリストを比較する関数です。この関数は、一致するならば`true`を返すべきです。
返り値は数値（`number`）であり、この値は引数リストが前回と違う場合に、前回と異なる値となります（1増えます）。
これにより、「依存リストが変化したかどうか」という情報が「1つの数値が変化したかどうか」によって表されることになります。
よって、この数値を`useEffect`などの依存リストに使えば目的を達成できます。
例えば、`counter`の値の比較の際に1の位の変化を無視したければ次のように書けます。

```js
const Conter = () => {
  const [counter, setCounter] = useState(0);

  const d = useDeps(
    [counter],
    ([c1], [c2]) => ((c1 / 10) | 0) === ((c2 / 10) | 0)
  );

  useEffect(()=> {
    console.log(counter);
  }, [d]);

  // ...
}
```

こうすることで、`counter`が0〜9の間は`d`が変化せず、`useEffect`のコールバックが呼ばれなくなります。

**注意**: このような`useRef`の使い方はConcurrent Mode下で問題となる可能性があります。対処法など詳しくはこちらの記事をご覧ください。

- [A Concurrent Mode-Safe Version of useRef](https://dev.to/uhyo_/a-concurrent-mode-safe-version-of-useref-1325)

**注意2**: この実装では、再レンダリングが2の53乗回行われるとカウンタが更新されなくなってしまいます（1秒に1回再レンダリングされる場合、約2.85億年後にうまく動作しなくなってしまいます）。長期間稼働するアプリケーションを作る場合は気をつけましょう。対策としては、BigIntを使うという手があります。

## 解説

ほとんど上のコードで説明が終わったようなものですが、一応解説しておきます。この`usePreviousValue`フックは、「現在の値」を渡すと「前回のレンダリング時の値」を返すフックです。ただし、初回は「前回の値」が無いので`undefined`を返します。便利なので、皆さんのコードベースにも常備されているのではないでしょうか。

```ts
function usePreviousValue<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const prevValue = ref.current;
  ref.current = value;
  return prevValue;
}
```

これにより、`useDeps`が「前回の依存リスト」を得ることができます。あとは、`useDeps`が前回の値（`prevDeps`）と今回の値（`deps`）を比較し、違っていれば内部に持っているカウンタ（`counter`）の値を更新します。返り値はこのカウンタの値です。

```ts
export function useDeps<Deps extends any[]>(
  deps: Deps,
  compare: (prev: Deps, current: Deps) => boolean
): number {
  const counter = useRef(0);
  const prevDeps = usePreviousValue(deps);
  if (prevDeps === undefined) {
    return counter.current;
  }
  if (!compare(prevDeps, deps)) {
    counter.current++;
  }
  return counter.current;
}
```

このようにすることで、依存リストが変化したかどうかという情報が、返り値の数値が変化したかどうかに圧縮されます。
例えば最初の返り値は`0`ですが、渡された依存リストが（比較関数による比較の結果として）前回から変化していた場合は、別の数値（`1`とか）が返されるのです。

この考えはそんなに突飛なものではなく、TC39のStage 1プロポーザルである[compiteKey](https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey)も、複数オブジェクトの同一性を1つのオブジェクトで表すという点で類似しています。

今回は`useEffect`と別に`useDeps`を用意しましたが、これを`useEffect`を合体させたフックを必要に応じて作ってもよいでしょう。

## まとめ

Reactにおいて、`useEffect`などに渡す依存リストの比較関数をカスタマイズしたくなったときに使える手法を解説しました。
ポイントは、比較は自分で行い、その結果を表す数値を依存として`useEffect`などに渡すという点です。

依存リストの本来の意味から少し離れている（しEslintの`exhaustive-deps`のようなルールはこれに対応できない）のは否めませんが、`useDeps`のやっていることは依存リストの情報をひとつの数値に抽象化することであり、そう考えればあまり不自然ではないかもしれません。

他にきれいなやり方としては、比較関数ではなく依存リストに対するハッシュ関数を渡し、その結果を依存リストに渡すという手も考えられます。
この場合、行いたい比較に的するようにハッシュ関数を実装することになります。
計算コストがかかりそうだという理由でこの記事ではより軽量な方法を選択しましたが、好みや状況に合わせて決めましょう。