---
title: TypeScriptのユニオン型で「あるかもしれない」プロパティを表現するときのTips
published: "2020-08-18T21:15+09:00"
tags:
  - TypeScript
---

TypeScriptのユニオン型はとても強力な機能で、TypeScriptのコードベースでは広く利用されています。
例えば、次のようにすると「`foo`プロパティを持つオブジェクトまたは`bar`プロパティを持つオブジェクト」という型を表現できます。

```ts
type FooObj = { foo: string };
type BarObj = { bar: number };
type FooOrBar = FooObj | BarObj;

const fooObj: FooOrBar = { foo: "uhyohyo" };
const barObj: FooOrBar = { bar: 1234 };
```

## 無いかもしれないプロパティ

上の`FooOrBar`型を持つオブジェクトは、`foo`プロパティを持つかもしれないし持たない（`BarObj`）かもしれません。
これは`bar`も同じで、つまり「あるかもしれない」プロパティです。
逆の言い方をすれば、`foo`や`bar`は「無いかもしれない」プロパティであるとも言えます。

このような場合、TypeScriptは`FooOrBar`型のオブジェクトの`foo`や`bar`にアクセスさせてくれず、コンパイルエラーとしてしまいます。

```ts
function useFooOrBar(obj: FooOrBar) {
  // エラー: Property 'foo' does not exist on type 'FooOrBar'.
  console.log(obj.foo);
}
```

JavaScript的に考えれば、`foo`が無ければプロパティアクセスの結果としては`undefined`となるので、`obj.foo`を例えば`string | undefined`型としてアクセスを許してもいいように思えます。
しかし、そういうわけにもいきません。
なぜなら、TypeScriptは**構造的部分型**を採用しているからです。
より具体的に言えば、`BarObj`は「`foo`を持たない」のではなく「`foo`は型で言及されていないから不明」です。
例えば、次のように`foo`に`number`が入っているオブジェクトも、`BarObj`に入れたり`FooOrBar`に入れることができます。

```ts
const o = { foo: 123, bar: 456 };
const bar: BarObj = o;
const foobar: FooOrBar = o;
```

つまり、`FooOrBar`型の`obj`に対して、`obj.foo`を`string | undefined`型と考えるのは間違いで、正確には「何が入っているか全く不明」なのです。
そのため、TypeScriptはこれをコンパイルエラーとして扱うのです。

## エラーの対処法

ところが、実際には「`BarObj`のときは`foo`は存在しないのだから、`FooOrBar`に対して`foo`でアクセスしたら`string | undefined`にしてほしい」というシチュエーションもあるでしょう。
何より、そうすると`obj.foo`のようなアクセスがコンパイルエラーとならなくなり便利です。

そのための方法は意外と簡単です。
次のように、存在しないプロパティに対して明示的に存在しないことを示せばよいのです。

```ts
type FooObj = {
  foo: string;
  bar?: undefined;
};
type BarObj = {
  foo?: undefined;
  bar: number;
}
type FooOrBar = FooObj | BarObj;
```

こうすると、例えば`BarObj`においては「`foo`プロパティは存在しなくてもよく、存在しても必ず`undefined`である」という意味になります。
この定義ならば、次のように`foo`に`number`が入っているものを`BarObj`に入れようとすればコンパイルエラーとなります。

```ts
const o = { foo: 123, bar: 456 };
// エラー: Type '{ foo: number; bar: number; }' is not assignable to type 'BarObj'.
//          Types of property 'foo' are incompatible.
//            Type 'number' is not assignable to type 'undefined'.
const bar: BarObj = o;
```

また、こうすると`FooOrBar`の`foo`プロパティにしてもエラーは発生せず、次のようなコードが可能になります。
書きやすくて便利ですね。

```ts
function useFooOrBar(obj: FooOrBar) {
  if(obj.foo !== undefined) {
    // ...
  }
}
```

このように、存在しないプロパティを明示するために`プロパティ?: undefined`とするのは便利な小技です。
使いこなしましょう。

## TypeScriptにおける対応

ちなみに、このテクニックはTypeScriptにおける型推論にも組み込まれています。
次のような関数`getFooOrBar`を作った場合を考えてみます。

```ts
function getFooOrBar() {
  if (Math.random() < 0.5) {
    return {
      foo: "foooooo"
    }
  } else {
    return {
      bar: 123
    }
  }
}

const res = getFooOrBar();
// エラーが起きない！
console.log(res.foo);
```

こうすると、`getFooOrBar`の返り値の型は`{ foo: string; bar?: undefined; } | { bar: number; foo?: undefined; }`と推論されます。
型推論の結果に先ほど紹介したテクニックが使われていますね。
これにより、上の例のように`res.foo`にアクセスしてもコンパイルエラーとなりません。

## まとめ

コーディングの快適性まで考えて型定義を書けるようになって、一段上のTypeScript使いを目指しましょう！