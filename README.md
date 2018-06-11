# BinOps

A JavaScript library to perform binary operations on 53 bits. Provides replacement for the following operations:

* `~`, the `not` operation
* `&`, the `and` operation
* `|`, the `or` operation
* `^`, the `xor` operation
* `<<`, the `left shift` operation
* `>>>`, the `unsigned right shift` operation

## How to use

Simply include the `binops.js` file in a `<script>` tag, this will declare a `BinOps` variable in your global scope. This is an object possessing the following methods:

* `BinOps.not( Number a )`
* `BinOps.and( Number a, Number b )`
* `BinOps.or( Number a, Number b )`
* `BinOps.xor( Number a, Number b )`
* `BinOps.lshift( Number a, Number n )`
* `BinOps.urshift( Number a, Number n )`

BinOps requires parameters to satisfy some constraints:

* `a` and `b` must be integers between 0 and 2<sup>53</sup> - 1, inclusive
* `n` must be an integer between 0 and 52, inclusive

## Examples

For examples, see the `index.html` file which provides test cases.

## Why the 53 bit limit?

JavaScript can only handle exact integers up to 2<sup>53</sup> - 1, a.k.a [the maximum safe integer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER). Beyond this value, the number will be stored as a float, which is a totally different representation on which bitwise logic cannot apply.</p>

For this reason, BinOps only handles numbers that can fit on 53 bits as unsigned.

## Why `not(0)` does not equal `-1`?

BinOps only works with unsigned integers. Many software and hardware that can handle relative numbers use what’s called [two’s complement representation](https://en.wikipedia.org/wiki/Two%27s_complement). If you’re familiar to it, you’d be expecting `~0 === -1` just like the native JavaScript `~` operator would do. This is because, in two’s complement representation, the leftmost bit is used to represent the number’s sign.

But BinOps only handles unsigned integers and does not use two’s complement representation. Thus, numbers starting with the bit `1` are big positive numbers. Actually, `BinOps.not(0)` is the maximum safe integer, which consists of 53 bits all being `1`.

```"javascript"
Number.MAX_SAFE_INTEGER.toString(2)
// "11111111111111111111111111111111111111111111111111111"
```

## Why not choose string?

Of course I could have chosen to represent binary numbers as strings, which have no intrinsic size limit (to be more correct, the limit is very, veeery far). But I wanted to allow the user to directly pass and receive numbers, without any conversion step.

Beyond the 53 bit threshold, JavaScript does not allow us to correctly manipulate integers, and there are a handful of libraries dedicated to handle large numbers. Maybe some of them handle binary arithmetic too.