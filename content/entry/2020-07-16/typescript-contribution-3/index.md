---
title: TypeScriptにcontributeした (3) パースエラーのメッセージ改善
published: "2020-07-16T23:30+09:00"
tags:
  - TypeScript
  - OSS
---

最近TypeScript本体にPull Requestを出してマージしてもらいましたので、内容や感想を紹介します。
今回の内容はTypeScript 4.0に含まれる見込みです。

なお、筆者によるTypeScriptへの貢献はこれが3回目となります。
1回目については以下の記事で紹介しています。
2回目についての記事はありません。

- [TypeScriptコンパイラ入門 (1) エラーメッセージを改善しよう](https://qiita.com/uhyo/items/8b7589e925835bad095c) 

## 改善の概要

これまでと同様、今回の改善はエラーメッセージの改善です。
今までと異なる点としては、これまでは型チェックのエラーでしたが今回はパースエラーを取り扱っています。

[元となるissue](https://github.com/microsoft/TypeScript/issues/39548)から引用すると、このようなTypeScriptコードはパースエラーとなります。

```ts
type Foo = string | () => string;

type InstOrConst<T> = T | new () => T;
```

ユニオン型（`S | T`）やインターセクション型（`S & T`）の`T`の部分に関数型を書きたい場合は、生で書くことができません。
そのため、上のような型はパースエラーとなります。
関数型を書きたい場合は、括弧で囲む必要があります。

これがパースエラーとなるのは意図的なもので、次のような場合に結果が分かりにくい（曖昧である）ので敢えて禁止としています。

```ts
type T  = () => string | () => number;
// どちらを意図しているのか分かりにくい
type T1 = (() => string) | (() => number);
type T2 = () => (string | () => number);
```

パースエラーとなるのは意図通りなので問題ありませんが、エラーメッセージに問題がありました。
具体的には、最初の例をコンパイルすると次のようなエラーメッセージとなります。

```
src/index.ts:1:22 - error TS1110: Type expected.

1 type Foo = string | () => string;
                       ~

src/index.ts:1:24 - error TS1005: ';' expected.

1 type Foo = string | () => string;
                         ~~

src/index.ts:3:31 - error TS1005: ';' expected.

3 type InstOrConst<T> = T | new () => T;
                                ~


Found 3 errors.
```

これでは何が問題なのかよく分かりません。
特に、ユニオン型の中に直接関数型を書いてはいけないことを知らない人は混乱してしまいます。

ということで、この場合のエラーメッセージをより分かりやすくするのが今回の改善です。
筆者が出したPull Requestにより、次のようにメッセージが改善されます。

```
test.ts:1:20 - error TS1385: Function type notation must be parenthesized when used in a union type.

1 type Foo = string | () => string;
                     ~~~~~~~~~~~~~

test.ts:3:26 - error TS1386: Constructor type notation must be parenthesized when used in a union type.

3 type InstOrConst<T> = T | new () => T;
                           ~~~~~~~~~~~~


Found 2 errors.
```

このメッセージなら原因が分かりやすいですね。

## やったこと1: パーサーを読む

今回はパースエラーのメッセージ改善なので、パーサー部分（`src/compiler/parser.ts`）に手を入れる必要があります。
これはこれまで触ったことが無かった部分なので、まず2時間ほどコードリーディングを行いました。
[その旨をツイートしたところ](https://twitter.com/uhyo_/status/1281916193813610508)、[突発でtscを読む会になった](https://twitter.com/uhyo_/status/1281924293362741248)ので複数人で通話しながらパーサー部分を読みました。

### ウォーミングアップ

パーサーは、プログラムを前から読み進めて決められた構文通りに解釈し、ASTノードを生成する処理を行います。
TypeScriptのパーサーはいわゆる[再帰下降パーサー](https://ja.wikipedia.org/wiki/%E5%86%8D%E5%B8%B0%E4%B8%8B%E9%99%8D%E6%A7%8B%E6%96%87%E8%A7%A3%E6%9E%90)であり、色々な再帰関数によって構成されています。
以下に、文を一つパースする関数である`parseStatement`関数の一部を引用します（以降で引用するコードは全て、記事執筆時点のmasterであるコミット`db7903041037960f61a3bf5a7bdaf2577f0fbb3a`のコードからの引用です）。

```ts
function parseStatement(): Statement {
    switch (token()) {
        case SyntaxKind.SemicolonToken:
            return parseEmptyStatement();
        case SyntaxKind.OpenBraceToken:
            return parseBlock(/*ignoreMissingOpenBrace*/ false);
        case SyntaxKind.VarKeyword:
            return parseVariableStatement(getNodePos(), hasPrecedingJSDocComment(), /*decorators*/ undefined, /*modifiers*/ undefined);
        case SyntaxKind.LetKeyword:
            if (isLetDeclaration()) {
                return parseVariableStatement(getNodePos(), hasPrecedingJSDocComment(), /*decorators*/ undefined, /*modifiers*/ undefined);
            }
            break;
        case SyntaxKind.FunctionKeyword:
            return parseFunctionDeclaration(getNodePos(), hasPrecedingJSDocComment(), /*decorators*/ undefined, /*modifiers*/ undefined);
        case SyntaxKind.ClassKeyword:
            return parseClassDeclaration(getNodePos(), hasPrecedingJSDocComment(), /*decorators*/ undefined, /*modifiers*/ undefined);
        case SyntaxKind.IfKeyword:
            return parseIfStatement();
        case SyntaxKind.DoKeyword:
            return parseDoStatement();
        case SyntaxKind.WhileKeyword:
            return parseWhileStatement();
        case SyntaxKind.ForKeyword:
        // 後略
```

このように、現在の位置にあるトークン（`token()`）によって処理を分岐させます。
`SyntaxKind`というのはトークンを表すenumです。

例えば、いきなり`;`（`SyntaxKind.SemicolonToken`）があった場合には空文（`;`のみの文）と思われますから、パーサーは空文をパースするモードに移行します。
これは再帰的に関数`parseEmptyStatement`を呼び出すことで表現されます。
同様に、`if`（`SyntaxKind.IfKeyword`）があった場合はif文の始まりであると思われますから、if文のパースを担当する関数（`parseIfStatement`）を再帰的に呼び出します。

本題とは関係ありませんが、`parseIfStatement`の中身もちょっと覗いてみましょう。
あまり長くありませんね。

```ts
function parseIfStatement(): IfStatement {
    const pos = getNodePos();
    parseExpected(SyntaxKind.IfKeyword);
    parseExpected(SyntaxKind.OpenParenToken);
    const expression = allowInAnd(parseExpression);
    parseExpected(SyntaxKind.CloseParenToken);
    const thenStatement = parseStatement();
    const elseStatement = parseOptional(SyntaxKind.ElseKeyword) ? parseStatement() : undefined;
    return finishNode(factory.createIfStatement(expression, thenStatement, elseStatement), pos);
}
```

TypeScript（JavaScript）の文法ではif文は`if ( 式 ) 文`または`if ( 式 ) 文 else 文`という構造をしており、この関数はこれをそのままプログラムに翻訳しただけのように見えます。
ここで出てきた補助関数`parseExpected`は、指定されたトークンを消費して次のトークンに進むという関数で、指定されたのと違うトークンが得られたらパースエラーを発生させます。

先ほどswitch文で分岐したので、`parseExpected(SyntaxKind.IfKeyword);`は失敗しません。
文法では`if`の次は必ず`(`でなければいけませんから、続けて`parseExpected(SyntaxKind.OpenParenToken);`が呼び出されます。
さらに、`parseExpression`により式をパースし、続いて`)`を、さらに`文`をパースします。
その次は`parseOptional`という補助関数を使っていますが、これはあっても良いし無くても良いトークンをパースするときに使われます。
ここでは次が`else`ならば`else 文`をパースし、そうでなければここでif文のパースは終了です。
最後の`finishNode`というのはASTノードが生成されるときの後処理を担当するようです（あまり読んでいない）。

このように、再帰下降パーサーでは「今のトークンを見て次に何をするか決める」「何をするか決めたらその通りに読み進める」という処理が基本となります（たまに先読みなどの複雑な処理が入ることもありますが）。
感想としては、型チェックの部分に比べると処理が単純で読みやすく、コンパイラへの貢献の入門に向いているような気がしました。

### 型をパースする部分を読む

今回は型のパースに関する改善なので、型をパースする部分をじっくりと読みました。
具体的には`parseTypeWorker`関数です。

```ts
function parseTypeWorker(noConditionalTypes?: boolean): TypeNode {
    if (isStartOfFunctionTypeOrConstructorType()) {
        return parseFunctionOrConstructorType();
    }
    const pos = getNodePos();
    const type = parseUnionTypeOrHigher();
    if (!noConditionalTypes && !scanner.hasPrecedingLineBreak() && parseOptional(SyntaxKind.ExtendsKeyword)) {
        // The type following 'extends' is not permitted to be another conditional type
        const extendsType = parseTypeWorker(/*noConditionalTypes*/ true);
        parseExpected(SyntaxKind.QuestionToken);
        const trueType = parseTypeWorker();
        parseExpected(SyntaxKind.ColonToken);
        const falseType = parseTypeWorker();
        return finishNode(factory.createConditionalTypeNode(type, extendsType, trueType, falseType), pos);
    }
    return type;
}
```

ざっくりと読むと、現在の位置に関数型が書かれている（`isStartOfFunctionTypeOrConstructorType()`）ならば関数型をパースします。
この関数は、現在のトークンを見るだけでなく必要に応じて先読みを行います。
というのも、関数型は`(`で始まりますが、それだけだと`(number)`のように関数型以外である可能性もあるため、もう少しを先を読んで関数型であることを断定する必要があります。
例えば、`(arg:`のようにコロンがあれば関数型と断定することができます。

関数型以外ならば、`parseUnionTypeOrHigher()`により関数型以外の型をパースします。
また、そのあとに`extends`があれば条件型 (conditional type) としてパースする処理もここに書かれています。
ということで、次は`parseUnionTypeOrHigher`ですが、このようになっています。

```ts
function parseIntersectionTypeOrHigher(): TypeNode {
    return parseUnionOrIntersectionType(SyntaxKind.AmpersandToken, parseTypeOperatorOrHigher, factory.createIntersectionTypeNode);
}

function parseUnionTypeOrHigher(): TypeNode {
    return parseUnionOrIntersectionType(SyntaxKind.BarToken, parseIntersectionTypeOrHigher, factory.createUnionTypeNode);
}
```

ご覧のように、本体は`parseUnionOrIntersectionType`という関数で、`|`で区切られた型のそれぞれをパースしてリストにまとめてASTノードを作ってくれます。
この関数はインターセクション型のパースにも再利用されていることが分かります。
特に注目すべき点は、第2引数に中身のパースを担当する関数を渡しているところです。
これにより、`parseUnionTypeOrHigher`は「`parseIntersectionTypeOrHigher`によりパースされるもの」を`|`で区切ったものをパースする処理になっていることが分かり、また`parseIntersectionTypeOrHigher`は「`parseTypeOperatorOrHigher`によりパースされるもの」を`&`で区切ったものをパースする処理になっていることが分かります。
ここから、`|`よりも`&`の方が結合度が高いことが分かります。
すなわち、`A & B | C & D`は`(A & B) | (C & D)`として解釈されるいうことです。
再帰下降パーサーでは、基本的に再帰のネストが深くなるほど結合度の高い構文のパース処理になります。
関数名にある`Higher`というのも結合度が高いことを指していると考えられます。

では、本体の`parseUnionOrIntersectionType`に進みます。
筆者が今回手を入れたのもこの関数です。
ここではPRを出す前のコードを示します。

```ts
function parseUnionOrIntersectionType(
    operator: SyntaxKind.BarToken | SyntaxKind.AmpersandToken,
    parseConstituentType: () => TypeNode,
    createTypeNode: (types: NodeArray<TypeNode>) => UnionOrIntersectionTypeNode
): TypeNode {
    const pos = getNodePos();
    const hasLeadingOperator = parseOptional(operator);
    let type = parseConstituentType();
    if (token() === operator || hasLeadingOperator) {
        const types = [type];
        while (parseOptional(operator)) {
            types.push(parseConstituentType());
        }
        type = finishNode(createTypeNode(createNodeArray(types, pos)), pos);
    }
    return type;
}
```

まず見える`let type = parseConstituentType()`の部分で、`T | U`の`T`の部分をパースします。
次のif文で`|`があるかどうかをチェックし、なければユニオン型のASTノードを作らずに`return type;`で`T`をそのまま返します。
`|`があった場合は`types`という配列を作り、`|`が続く限りwhile文で`parseConstituentType()`を呼び出し続けます。
ここで`T | U`の`U`（やそれ以降）がパースされます。
こうなった場合、ユニオン型のASTノードが作られます。
なお、`hasLeadingOperator`という変数がありますが、これは`| T | U`のような構文に対応するためのものです。

ユニオン型やインターセクション以外の処理（`keyof`型とか配列型、あるいは`number`のような単純な型とか）の処理は`parseTypeOperatorOrHigher`に書かれていますが、今回はそこまで踏み込みません。

## やったこと2: parseUnionOrIntersectionTypeの改良

さて、今回`T | U`の`U`の部分に関数型の形が来たときのパースエラーが問題なのでした。
関数型をパースする処理は`parseTypeWorker`の一番最初ですでに済んでいますから、ここでは関数型は考慮されません。
その結果、`U`が`(`で始まった場合その`(`は必ずグルーピングと解釈され、その直後に`)`が来たら型が来るべき位置に`)`が出てきたというパースエラーとなります。
他の場合も何だかんだでパースエラーは避けられません。

今回は`U`の位置に関数型の構文が来たらそれに対して分かりやすいエラーメッセージを出さないといけませんから、この位置に来た関数型の構文を検知することが第一となります。
今回は比較的簡単な実装でこれを行いました。
まず書いたのが次のような関数です（偉そうにコメントが書いてありますが、これは筆者ではなくTypeScriptチームメンバーが書いたものです）。
この関数は今の位置に関数型が書かれているかどうか判定し、書かれているならばそれをパースしてそれに対して親切なエラーメッセージを発生させます。
内部では既出の関数`isStartOfFunctionTypeOrConstructorType`と`parseFunctionOrConstructorType`が使われています。

```ts
function parseFunctionOrConstructorTypeToError(
    isInUnionType: boolean
): TypeNode | undefined {
    // the function type and constructor type shorthand notation
    // are not allowed directly in unions and intersections, but we'll
    // try to parse them gracefully and issue a helpful message.
    if (isStartOfFunctionTypeOrConstructorType()) {
        const type = parseFunctionOrConstructorType();
        let diagnostic: DiagnosticMessage;
        if (isFunctionTypeNode(type)) {
            diagnostic = isInUnionType
                ? Diagnostics.Function_type_notation_must_be_parenthesized_when_used_in_a_union_type
                : Diagnostics.Function_type_notation_must_be_parenthesized_when_used_in_an_intersection_type;
        }
        else {
            diagnostic = isInUnionType
                ? Diagnostics.Constructor_type_notation_must_be_parenthesized_when_used_in_a_union_type
                : Diagnostics.Constructor_type_notation_must_be_parenthesized_when_used_in_an_intersection_type;

        }
        parseErrorAtRange(type, diagnostic);
        return type;
    }
    return undefined;
}
```

この関数は、現在の位置から書かれている関数型を検知したならばそのノードを、検知しなかったならば`undefined`を返すようになっています。

この関数を使うと、先ほどの`parseUnionOrIntersectionType`は次のように書き換えられます（コメントはこの記事向けに筆者が追加したもので、本来のソースコードにはありません）。

```ts
function parseUnionOrIntersectionType(
    operator: SyntaxKind.BarToken | SyntaxKind.AmpersandToken,
    parseConstituentType: () => TypeNode,
    createTypeNode: (types: NodeArray<TypeNode>) => UnionOrIntersectionTypeNode
): TypeNode {
    const pos = getNodePos();
    const isUnionType = operator === SyntaxKind.BarToken;
    const hasLeadingOperator = parseOptional(operator);
    // 変更点1: parseFunctionOrConstructorTypeToError呼び出しを追加
    let type = hasLeadingOperator && parseFunctionOrConstructorTypeToError(isUnionType)
        || parseConstituentType();
    if (token() === operator || hasLeadingOperator) {
        const types = [type];
        while (parseOptional(operator)) {
            // 変更点2: parseFunctionOrConstructorTypeToError呼び出しを追加
            types.push(parseFunctionOrConstructorTypeToError(isUnionType) || parseConstituentType());
        }
        type = finishNode(createTypeNode(createNodeArray(types, pos)), pos);
    }
    return type;
}
```

このように、2箇所に新しく作った関数`parseFunctionOrConstructorTypeToError`への呼び出しを追加しています。
これにより、`T | U`の`U`の位置に関数型の形が来た場合は`parseFunctionOrConstructorTypeToError`によって検知・処理されます。
`||`演算子の使用によって、関数型の形が来なかった場合は従来通りの処理を行うようになっています

## やったこと3: PRを出す

修正内容は以上で、あとはプルリクエストを出すだけです。
今回は出した翌営業日（？）には反応がもらえて、3往復のレビュー後マージされました。
詳しい会話の内容についてはPRを見てください。
方針は良さそうという感触でしたが、正常系（`U`に正しい型が来た場合）よりも前に異常系（`U`に関数型を書こうとした場合）の処理が来ていることによりパフォーマンスへの影響が懸念されました。
しかし、実際にパフォーマンスを計測したところ問題なさそうだったのでマージされました。

印象に残ったのは、コードのスタイルについてもいくつか直されたのですが、意外とテクニカルなスタイルが好まれるなということです（レビュアーによるかもしれませんが）。
例えば、上記のコードには`条件 && 式1 || 式2`というパターンが登場します。
これは、条件が満たされれば`式1 || 式2`を実行し、そうでなければ`式2`になるパターンです。
これはテクニカルすぎるかなと思って`条件 ? (式1 || 式2) : 式2`という形でPRを出したのですが、上の形に修正されました。

## まとめ

今回は初めてパーサー部分への修正に調整しました。
パーサー部分のコードを読むのは初めてでしたが、読みやすいコードなので型チェック周りよりも最初のコントリビューションに向いているかもしれないと思いました。
また、コントリビューションしやすいのはやはりエラーメッセージ関連です。
パースエラー周りのエラーメッセージが分かりにくい部分は探せば色々ありそうですから、密かなコントリビューションチャンスが眠っているのではないでしょうか。

ただ、PRを作る際の実装方針選びは重要です。
前回のコントリビューションの経験からして、一発でいい方針を見せないと、TypeScriptチームからPRへの興味が失われる印象があります。

皆さんも機会を見つけてTypeScriptに貢献してみてはいかがでしょうか。
もちろん筆者も可能なら相談に乗りますよ。

## ライセンス表示

記事に含まれているTypeScriptのソースコードはMicrosoftの著作物であり、[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)に従います。

```
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
```