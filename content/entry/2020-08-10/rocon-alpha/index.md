---
title: 究極のReact向けルーターライブラリ「Rocon」を作った
published: "2020-08-10T23:00+09:00"
tags:
  - Rocon
  - React
  - TypeScript
---

こんにちは。先月くらいからReact向けのルーターライブラリ「**Rocon**」を作っていて、この度alphaリリースという形で公開まで漕ぎ着けたので宣言します。
現在のところ、以下のURLでチュートリアルを読むことができます。
このチュートリアルサイトはRoconを用いて作られています。

- Roconチュートリアル: https://rocon.uhyohyo.net/

Roconの特徴は**非常に型安全**であることです。
何よりも型安全性・型周りの快適性を優先してAPIが設計されています。
当然、TypeScriptと一緒に使うことが前提です。

また、Roconは[react-router-dom](https://reactrouter.com/web/guides/quick-start)の代替となることを意図しています。
そのため、Roconを使うべきとき・使うべきでないときをまとめると以下のようになります。

**Roconを使うべきとき:**

- 今react-router-dom等を使ってSPAを作っているが型安全性に満足できないとき

**Roconを使うべきでないとき:**

- Next.jsやGatsbyなどのルーティングが組み込まれたフレームワークを使っているとき
- react-router-domの型に不満を感じていないとき

関連ソースコードは以下にあります。良さそうと思ったらぜひスターをお願いします🥺

- Roconのソースコード: https://github.com/uhyo/rocon
- チュートリアルサイトのソースコード: https://github.com/uhyo/rocon-website

## 短いまとめ

忙しい方のために記事の内容を短くまとめました。

既存のルーターライブラリである`react-router`には、文字列ベースでルートが定義されているために、URLが正しいかどうかを型チェックするのが難しいという問題があります。
また、ナビゲーションがルート定義と無関係に行われるため、ナビゲーション先のURLが存在するか・データを不足なく渡しているかを型チェックするのも不可能です。
筆者が開発した**Rocon**では、ルート定義オブジェクトをベースとしてルーティングとナビゲーションの両方を行うという設計により、間違ったナビゲーション先を指定するのを防止します。また、文字列ベースのルート定義をやめることで、それぞれのルートに必要なデータが型で分かるようになり、ナビゲーション時のデータ不足を型エラーとして検知できるようになります。

より詳細な説明が以下に続きます。

## react-routerの問題点

さて、Roconがどんな問題を解決するのかを理解するために、まずreact-routerの問題点を概観します。
Roconの売りは型安全性ですから、主にreact-routerの型（本体には型定義が同梱されていないので正確には`@types/react-router`とその周辺の型ですが）がどうなっているのか見ることになります。

ルーターライブラリの役割は大きく分けて2つです。
一つはルーティング、すなわち**現在のURLを見てどのコンテンツを表示するか決めること**、もう一つはナビゲーション、すなわち**現在のURLを変更すること**です。
筆者はこの両方においてreact-router-domの型安全性は不十分であると感じています（型定義がまずいと言うよりは、型を第一に考えた設計になっていないので仕方ないという感じです）。もちろん、Roconは両方の問題を解決してくれます。

なお、以下で紹介するAPIはreact-router v5のAPIであり、v6ではAPIに大きな変更が入る見込みです。しかし、ここで述べる型周りの設計が大きく変わることは無さそうです。

### ルーティングの型と問題点

react-routerによるルーティングは大まかにはこんな感じです。
`Switch`は「下の`Route`のどれか1つを表示する」と言う意味で、`Route`コンポーネントで実際にマッチングが行われます。

```tsx
<Switch>
  <Route path="/foo">
    <p>現在のURLが/foo以下のときはここが表示される</p>
  </Route>
  <Route path="/bar">
    <p>現在のURLが/bar以下のときはここが表示される</p>
  </Route>
  <Route path="/baz">
    <p>現在のURLが/bar以下のときはここが表示される</p>
  </Route>
  <Route path="/:id">
    <p>/foo, /bar, /baz以外はここが表示される</p>
  </Route>
</Switch>
```

最後の`/:id`というのは、任意の文字列にマッチするという記法です。
例えば`/hoge`というURLならば一番最後の`/:id`にマッチします。

このとき、`hoge`という部分を取得するには、`Route`の下で`useParams`フックを用いて次のようにします。

```tsx
const { id } = useParams();
```

ここに一つ目の問題があります。
現在の型定義では、単にこう書くと`id`の型が`any`となります。
実際には`id`は`string`型のはずですが、そのためには次のように型引数を明示的に書く必要があります。

```tsx
const { id } = useParams<{ id: string }>();
```

また、そもそもここで出てきた`id`という名前は、`/:id`と言う文字列に由来します。
これを型安全に行えというのは無理があり、この`useParams`は実際には存在しないパラメータを好き勝手に取得することができてしまいますね。
これが、文字列ベースでルーティングをする上での型安全性の限界です。

```tsx
// 実際には存在しない (undefinedの) hogehoge を string型として取得できてしまう！
const { id, hogehoge } = useParams<{ id: string; hogehoge: string }>();
```

さらに、同様のことが`location.state`にも言えます。
この`location.state`というのは、ナビゲーション時に次のURLに対してオブジェクトや配列を含む任意のデータを内部的に受け渡すことができるものです（ただし、structured clone algorithmで取り扱えるものに限ります）。
内部的にというのは、内容がURLに含まれないことを意味しています。
このため、URLに直接アクセスされた場合は`location.state`は空（`null`）になります。

`location.state`の内容は、まず`useLocation`フックで`location`を取得して、その`state`プロパティにアクセスすることで得られます。
この`state`の内容はナビゲーション時に決められるものですから、やはり`useLocation`の呼び出し時に内容をこちら側で知る術が無く、結果として`useParams`と同様に自分で`state`の中身を書くことになります。
当然ながら、これも型安全には程遠い状態です。

```tsx
const location = useLocation<{ name: string; age: number }>();

return <p>Hello, {location.state.name}さん{location.state.age}歳</p>;
```

### ナビゲーションの問題点

`react-router-dom`を使用している場合、ナビゲーションは`history.push`や`history.replace`によって行います。
`history`オブジェクトは`useHistory`フックで取得できます。
これは、移動先のパス名やその他の情報を指定することでそこに遷移するという単純なものです。

```ts
// パス名のみ指定
history.push("/foo/bar");
// パス名とlocation.stateを指定
history.push({
  pathname: "/user/profile",
  state: {
    name: "uhyo",
    age: 25
  }
});
```

ここにも、やはり文字列ベースなので遷移先が正しいかどうか型で検証できないという問題があります。
例えば、`/foo/barrrrrr`のような存在しないパスを渡しても型エラーが起きたりはしません。
`/foo/bar`のような単純なパス名のみなら文字列で全部列挙しておくことは可能かもしれませんが、`/:id/profile`のような動的なパス名まで考えると無理があります。
また、`location.state`に相当する情報もこのときに渡します。
渡す情報が足りなかったり型が間違ったりしていても、静的なチェックは何も行われません。
遷移先で、あるはずのデータが`location.state`に入っていないといった形でランタイムに問題が発生することになります。
筆者も、何か変なところでバグるなあと思ったら必要なデータが`location.state`から来ていなかったという経験は何度もあります。

### 問題点のまとめ

以上をまとめると、`react-router-dom`における型安全性の問題は主に2点あります。
一つは、各ルートの定義が文字列ベースであり静的なチェックに限界があるという問題です。
さらに、ルーティングとナビゲーションが無関係に行われているため、必要なデータと渡されるデータの間に齟齬が発生したり、そもそも存在しないパスを指定できてしまうという問題がもう一つあります。

## Roconにおける解決策

Roconは、上に挙げた2つの問題点を解決します。具体的なAPIや使い方などは[チュートリアル](https://rocon.uhyohyo.net/tutorial)を見ていただくとして、ここでは概観を説明します。

### ルートの定義

Roconでは、文字列ベースでのルート定義は行いません。代わりに、いわゆるBuilderパターンを用いて、それぞれのパスをオブジェクトとして定義します。
例えば、`/foo`と`/bar`という2つのルートを定義するには次のように書きます。
このとき、そのルートに対して何がレンダリングされるかを`action`として同時に定義します。

```tsx
const toplevelRoutes = Rocon.Path()
  .route("foo", (route) => route.action(() => <p>This is foo</p>))
  .route("bar", (route) => route.action(() => <p>This is bar</p>));
```

Roconでは各ルートに対してRoute Recordというオブジェクトが作られ、これがそのルートを表すものとして使用されます。
上の例では、`/foo`のRoute Recordは`toplevelRoutes._.foo`として得られます。

ここで登場した`Rocon.Path()`はPath Route Builderと呼ばれるもので、一階層のルート定義を担当します。
`/foo/cat`のような2階層にわたるルートを定義するには、`/cat`に相当するPath Route Builderを`/foo`に対してアタッチします。
Route Recordが`attach`メソッドを持っており、次のように書きます。

```tsx
const toplevelRoutes = Rocon.Path()
  .route("foo")
  .route("bar", (route) => route.action(() => <p>This is bar</p>));

const fooRoutes = toplevelRoutes._.foo.attach(Rocon.Path())
  .route("cat", (route) => route.action(() => <p>I love cats</p>))
  .route("dog", (route) => route.action(() => <p>I love dogs</p>));
```

このコードでは`/foo/cat`, `/foo/dog`, `/bar`の3つのルートが定義されています。
例えば`/foo/cat`に相当するRoute Recordは`fooRoutes._.cat`として得られます。

### 動的なルートの定義

`/:id/profile`のような動的なルートも、Roconでは次のようにして定義できます。

```tsx
const toplevelRoutes = Rocon.Path()
  // :id に相当するルートの定義
  .any("id")

// /:id に相当するルートに /profile をアタッチ
const userRoutes = toplevelRoutes.anyRoute.attach(Rocon.Path())
  .route("profile", (route) => route.action(({ id }) => <p>Your ID is {id}</p>));
```

新たに登場したPath Route Builderの`any`メソッドを使うことで、全ての文字列が当てはまる特殊なルートを作ることができます。
それに対応するRoute Recordもあり、`toplevelRoutes.anyRoute`として得られます。
ここで`"id"`という文字列を渡していますが、これは**match key**です。
`/:id`の部分に当てはまった文字列が、`id`というキーでオブジェクト（**match object**）に保存されます。
そして、match objectは`action`に渡された関数の引数に渡されます。
この機構により、上のサンプルにもあるように、`/:id/profile`にマッチした際のレンダリングには`id`の情報を使うことができます。

当然ながら、この機構は全て型安全に行われます。
具体的には、上の例の`toplevelRoutes.anyRoute`は`ReactRouteRecord<{ id: string }>`という型を持っています。
これにより、このルートにアタッチされた全てのルートにおいて、match objectが`string`型のプロパティ`id`を持っていることが表されています。
当然match objectにないプロパティを使おうとしたら型エラーになります。

以上により、前述の`useParam`の問題がRoconでは解決されていることが分かりました。
また、`location.state`も同様に解決されます。
例えば、`/foo`が`name`と`age`という2つのデータを`location.state`内に持つべきならば、次のように**State Route Builder**を2回アタッチします。

```tsx
const fooRoute = Rocon.Path()
  .route("foo")
  ._.foo
  .attach(Rocon.State("name", isString))
  .attach(Rocon.State("age", isNumber))
  .action(({ name, age }) =>
    <p>Hello, {name}! You are {age} years old.</p>
  );
```

`location.state`もやはりmatch objectの機構を用いており、1つState Route Builderをアタッチするとmatch objectに1つプロパティが追加されます。

### Roconのナビゲーション

次に、Roconのナビゲーションを見てみましょう。
Roconでは、`useNavigate`フックを用いて`navigate`関数を得ることができます。
この関数に目的地のRoute Recordを渡すことで、そのURLに遷移します。
また、Route Recordがmatch objectを要求する場合、それに相当するデータを第2引数で渡す必要があります。
上の`fooRoute`の場合は次のようにして遷移します。

```tsx
const navigate = useNavigate();

navigate(fooRoute.route, {
  name: "uhyo",
  age: 25
});
```

ここでの特徴は、**ナビゲーションのためには目的地のRoute Recordが必要**だということです。
これにより、間違って存在しないルートに遷移させてしまうことはありません。
なぜなら、存在しないルートはそもそもRoute Recordが無いからです。
また、`location.state`など追加のデータが必要な場合は、必要なデータを過不足なく渡すことができます。
ルートに付随するデータはmatch objectの概念に集約されています。
上の例では`fooRoute.route`が`ReactRouteRecord<{ name: string; age: number }>`という型を持っており、このルートのmatch objectが`string`型の`name`プロパティと`number`型の`age`プロパティを持つことが分かります。
このルートに遷移するためには、型に合致するmatch objectを作って渡す必要があります。
このように、あるルートに遷移するためにはどんなデータを渡す必要があるのか型レベルで追跡されているのです。
これにより、データが足りなかったり間違っていたりすると型エラーを出すことが可能になっています。

面白い点は、Route Recordという概念がルーティングにもナビゲーションにも使われていることです。
この設計により、両者が分離しており型安全なナビゲーションができないという問題を解決しています。
また、ルートが持つデータをmatch objectという形に抽象化して扱いやすくしています。

## まとめ

この記事では、型安全性の側面から`react-router`が持っていた問題を解説し、それを解決するために筆者が開発した**Rocon**において問題がどのように解決されているかを解説しました。

Roconは筆者の持てる全力を尽くし、**究極の型安全性**をコンセプトに作られています。
Roconはまだ最初のalphaリリースの段階ですが、コンセプトに共感いただいた方はぜひいじってみてフィードバックを頂けるとたいへんありがたいです。

また、GitHubリポジトリはこちらです。
みなさんのスターをお待ちしています🥺（2回目）

- https://github.com/uhyo/rocon
