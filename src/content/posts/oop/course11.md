---
title: Stream
published: 2026-05-07
description: streams、cin、cout、extractor、inserter、manipulator、stream flags、hidden friend、operator<<、operator>>
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

**Streams（流）** 是 C++ 的输入输出抽象。

C 语言主要使用：

```cpp
printf(...);
scanf(...);
```

C++ 引入 stream：

```cpp
cout << x;
cin >> x;
```

stream 的核心特点：

- type-safe：根据变量类型自动选择输入输出方式；
- extensible：可以为用户自定义类型重载 `operator<<` 和 `operator>>`；
- object-oriented：把输入输出设备抽象成对象；
- 支持 chaining：`cout << a << b << c`，`cin >> a >> b >> c`。

## 目录

- [概述](#概述)
- [目录](#目录)
- [为什么使用 streams](#为什么使用-streams)
  - [优点](#优点)
  - [缺点](#缺点)
- [什么是 stream](#什么是-stream)
- [Stream 命名习惯](#stream-命名习惯)
- [Stream operations](#stream-operations)
  - [Extractor](#extractor)
  - [Inserter](#inserter)
  - [Manipulator](#manipulator)
- [Text stream 与 binary stream](#text-stream-与-binary-stream)
- [预定义 streams](#预定义-streams)
- [输入：extractors](#输入extractors)
  - [`operator>>` 的基本用法](#operator-的基本用法)
  - [自定义 extractor](#自定义-extractor)
  - [其他输入函数](#其他输入函数)
- [输出：inserters](#输出inserters)
  - [`operator<<` 的基本用法](#operator-的基本用法-1)
  - [自定义 inserter](#自定义-inserter)
  - [其他输出函数](#其他输出函数)
- [Formatting：manipulators](#formattingmanipulators)
  - [常见 manipulators](#常见-manipulators)
  - [自定义 manipulator](#自定义-manipulator)
  - [Stream flags](#stream-flags)
- [Example：给 Point 重载输入输出](#example给-point-重载输入输出)
  - [为什么 `<<` / `>>` 要写成 free function](#为什么----要写成-free-function)
  - [Hidden friend 写法](#hidden-friend-写法)
  - [完整 Point 示例](#完整-point-示例)
- [Example：组合类型 LineSegment 的输出](#example组合类型-linesegment-的输出)

---

## 为什么使用 streams

### 优点

C++ stream 相比 C 风格 `printf` / `scanf` 的优势：

1. **Type safety**

   `cout << x` 会根据 `x` 的类型选择正确输出方式，不需要手写 `%d`、`%f`、`%s`。

2. **Extensible**

   用户自定义类型也可以支持：

   ```cpp
   cout << point;
   cin >> point;
   ```

   只要重载 `operator<<` 和 `operator>>`。

3. **More object-oriented**

   输入输出设备被统一抽象成 stream object，例如 `cin`、`cout`、`ifstream`、`ostringstream`。

### 缺点

stream 也有代价：

- 语法有时比 `printf` 更啰嗦；
- 可能比 C I/O 慢；
- C++20 后可以用 `std::format` 改善格式化输出的可读性。

如果需要提高 `cin` / `cout` 性能，可以关闭和 C I/O 的同步：

```cpp
std::ios::sync_with_stdio(false);
```

常见竞赛写法还会解除 `cin` 和 `cout` 的绑定：

```cpp
cin.tie(nullptr);
```

---

## 什么是 stream

stream 是对输入输出设备的统一逻辑接口。

可以把它理解成：

```text
程序 <-> stream <-> 设备
```

设备可以是：

- standard input；
- standard output；
- file；
- string buffer；
- 其他 I/O source / sink。

stream 的特点：

- 一维；
- 单向；
- 对 `cin` / `cout` 通常不能随机访问；
- 文件流可以支持一定程度的 random access。

---

## Stream 命名习惯

| 类型 | 输入 | 输出 | 头文件 |
|---|---|---|---|
| Generic stream | `istream` | `ostream` | `<iostream>` |
| File stream | `ifstream` | `ofstream` | `<fstream>` |
| C string stream | `istrstream` | `ostrstream` | `<strstream>` |
| C++ string stream | `istringstream` | `ostringstream` | `<sstream>` |

命名规律：

- `i` 表示 input；
- `o` 表示 output；
- `f` 表示 file；
- `string` 表示以字符串作为流的来源或目标。

:::TIP
`<strstream>` 是旧式 C string stream，现代 C++ 更常用 `<sstream>`。
:::

---

## Stream operations

### Extractor

extractor 从 stream 中读取值。

对应运算符：

```cpp
operator>>
```

例子：

```cpp
cin >> x;
```

含义：从 `cin` 中提取一个值，写入变量 `x`。

### Inserter

inserter 把值插入到 stream 中。

对应运算符：

```cpp
operator<<
```

例子：

```cpp
cout << x;
```

含义：把 `x` 的文本表示写入 `cout`。

### Manipulator

manipulator 修改 stream 的状态。

例子：

```cpp
cout << hex << n;
cout << setw(20) << "OK!";
```

`hex`、`setw(20)` 不直接输出普通数据，而是改变后续输入输出的格式。

---

## Text stream 与 binary stream

stream 可以分成两类。

Text stream：

- 处理文本字符；
- 可能进行字符转换；
- 例如换行符 `\n` 可能转换成操作系统实际的换行表示。

Binary stream：

- 处理原始二进制数据；
- 不做字符层面的转换；
- 常用于保存结构化二进制文件、图片、模型参数等。

本节课主要讲 text stream。

---

## 预定义 streams

C++ 标准库预定义了几个常用 stream：

| stream | 含义 |
|---|---|
| `cin` | standard input |
| `cout` | standard output |
| `cerr` | unbuffered error/debug output |
| `clog` | buffered error/debug output |

`cerr` 通常用于错误和调试信息，因为它不缓冲，输出更及时。

`clog` 也用于错误和调试信息，但它是 buffered。

---

## 输入：extractors

### `operator>>` 的基本用法

```cpp
#include <iostream>
using namespace std;

int main() {
    int i;
    float f;
    char c;
    char buffer[80];

    cin >> c;          // 读取一个字符
    cin >> i;          // 读取一个整数，通常会跳过前导空白
    cin >> f >> buffer; // 读取 float 和 C-style string
}
```

常见类型的输入：

| 表达式类型 | 输入格式 | 类似 C I/O |
|---|---|---|
| `char` | character | `%c` |
| `short`, `int` | integer | `%d` |
| `long` | long decimal integer | `%ld` |
| `float` | floating point | `%g` |
| `double` | double precision floating point | `%lg` |
| `char[]`, `char*` | string | `%s` |
| `void*` | pointer | `%p` |

一般情况下，extractor 会跳过前导 whitespace。

```cpp
int x;
cin >> x;
```

如果输入前面有空格或换行，`>>` 会先跳过，再读取整数。

### 自定义 extractor

自定义输入运算符必须是两个参数的 free function：

```cpp
istream& operator>>(istream& is, T& obj) {
    // read obj from is
    return is;
}
```

要求：

- 第一个参数是 `istream&`；
- 第二个参数是要写入的对象引用，不能是 `const`；
- 返回 `istream&`，用于 chaining。

例如：

```cpp
cin >> a >> b >> c;
```

等价于：

```cpp
((cin >> a) >> b) >> c;
```

每一步都必须返回同一个 stream，下一步才能继续读取。

### 其他输入函数

`get()`：读取下一个字符。

```cpp
int ch;
while ((ch = cin.get()) != EOF) {
    cout.put(ch);
}
```

`get(char* buf, int limit, char delim = '\n')`：

- 读取到 `limit` 个字符，或读到 delimiter 为止；
- 会在 `buf` 末尾追加 `\0`；
- 不会消耗 delimiter。

`getline(char* buf, int limit, char delim = '\n')`：

- 类似 `get`；
- 会消耗 delimiter。

其他函数：

```cpp
int gcount();       // 返回上一次读取的字符数
void putback(char); // 把一个字符放回 stream
char peek();        // 查看下一个字符，但不消耗它
```

---

## 输出：inserters

### `operator<<` 的基本用法

```cpp
#include <iostream>
using namespace std;

int main() {
    int i = 10;
    double d = 3.14;

    cout << i;
    cout << d;
    cout << "hello";
}
```

`ostream` 已经为内置类型提供了输出支持。

常见类型的输出：

| 表达式类型 | 输出格式 | 类似 C I/O |
|---|---|---|
| `char` | character | `%c` |
| `short`, `int` | integer | `%d` |
| `long` | long decimal integer | `%ld` |
| `float` | floating point | `%g` |
| `double` | double precision floating point | `%lg` |
| `char[]`, `char*` | string | `%s` |
| `void*` | pointer | `%p` |

### 自定义 inserter

自定义输出运算符也必须是两个参数的 free function：

```cpp
ostream& operator<<(ostream& os, const T& obj) {
    // write obj to os
    return os;
}
```

要求：

- 第一个参数是 `ostream&`；
- 第二个参数通常是 `const T&`；
- 返回 `ostream&`，用于 chaining。

例如：

```cpp
cout << a << b << c;
```

等价于：

```cpp
((cout << a) << b) << c;
```

### 其他输出函数

`put(char)`：输出单个字符。

```cpp
cout.put('A');
```

`flush()`：强制把缓冲区内容输出。

```cpp
cout << "Enter a number";
cout.flush();
```

`endl` 也会换行并 flush：

```cpp
cout << "hello" << endl;
```

如果只需要换行，通常 `\n` 更轻量：

```cpp
cout << "hello\n";
```

---

## Formatting：manipulators

### 常见 manipulators

需要包含：

```cpp
#include <iomanip>
```

例子：

```cpp
#include <iomanip>
#include <iostream>
using namespace std;

int main() {
    cout << setprecision(2) << 1230.243 << endl;
    cout << setw(20) << "OK!";
}
```

输出大致为：

```text
1.2e+03
                 OK!
```

常见 manipulator：

| manipulator | 作用 | 类型 |
|---|---|---|
| `dec`, `hex`, `oct` | 设置整数进制 | input/output |
| `endl` | 插入换行并 flush | output |
| `flush` | flush stream | output |
| `setw(int)` | 设置字段宽度 | input/output |
| `setfill(ch)` | 设置填充字符 | input/output |
| `setbase(int)` | 设置数字进制 | output |
| `ws` | 跳过 whitespace | input |
| `setprecision(int)` | 设置浮点数精度 | output |
| `setiosflags(long)` | 打开指定 flags | input/output |
| `resetiosflags(long)` | 关闭指定 flags | input/output |

注意：很多 manipulator 的效果会保留一段时间，影响后续 I/O。

```cpp
int n;
cout << "enter number in hexadecimal" << endl;
cin >> hex >> n;
```

这里 `hex` 会让后续输入按十六进制解释。

### 自定义 manipulator

可以自己定义不带参数的 output manipulator。

基本形式：

```cpp
ostream& manip(ostream& out) {
    // change or write something to out
    return out;
}
```

Example ：

```cpp
#include <iostream>
using namespace std;

ostream& tab(ostream& out) {
    return out << '\t';
}

int main() {
    cout << "Hello" << tab << "World!" << endl;
}
```

这会在 `Hello` 和 `World!` 中间插入 tab。

带参数的 manipulator 写法更复杂，本节没有展开。

### Stream flags

stream 内部有 flags，用来控制格式。

| flag | 含义 |
|---|---|
| `ios::skipws` | 跳过前导空白 |
| `ios::left`, `ios::right` | 左 / 右对齐 |
| `ios::internal` | 在符号和值之间填充 |
| `ios::dec`, `ios::oct`, `ios::hex` | 数字进制 |
| `ios::showbase` | 显示进制前缀 |
| `ios::showpoint` | 总是显示小数点 |
| `ios::uppercase` | 使用大写格式 |
| `ios::showpos` | 正数显示 `+` |
| `ios::scientific`, `ios::fixed` | 浮点数格式 |
| `ios::unitbuf` | 每次输出都 flush |

设置方式：

```cpp
setiosflags(flags);
resetiosflags(flags);
```

或者使用 stream member functions：

```cpp
cout.setf(flags);
cout.unsetf(flags);
```

---

## Example：给 Point 重载输入输出

### 为什么 `<<` / `>>` 要写成 free function

希望写出：

```cpp
cout << p;
cin >> p;
```

左操作数分别是：

```cpp
cout  // ostream
cin   // istream
```

如果把 `operator<<` 写成 `Point` 的 member function，调用形式会变成：

```cpp
p.operator<<(cout);
```

这不符合我们要的语法。

而且我们不能去修改标准库的 `ostream` 类，在里面添加一个 `ostream::operator<<(Point)`。

因此用户自定义类型的 stream operator 通常写成 free function：

```cpp
ostream& operator<<(ostream& out, const Point& p);
istream& operator>>(istream& in, Point& p);
```

如果需要访问 private fields，可以声明为 `friend`。

### Hidden friend 写法

把 friend 函数直接写在 class 内部。

```cpp
friend ostream& operator<<(ostream& out, const Point& p) {
    return out << "(" << p.x << ", " << p.y << ")";
}
```

这种函数仍然是 free function，不是 member function。

它被称为 hidden friend 的原因是：

- 函数声明和定义写在类内部；
- 可以访问 private fields；
- 不需要把函数定义散落在外部命名空间里；
- 对与该类型相关的运算符尤其常用。

### 完整 Point 示例

```cpp
#include <iostream>
using namespace std;

class Point {
public:
    Point(int x = 0, int y = 0) : x(x), y(y) {}

    friend ostream& operator<<(ostream& out, const Point& p) {
        return out << "(" << p.x << ", " << p.y << ")";
    }

    friend istream& operator>>(istream& in, Point& p) {
        return in >> p.x >> p.y;
    }

private:
    int x;
    int y;
};

int main() {
    Point a(1, 2);
    cout << a << endl;  // (1, 2)

    Point b;
    cin >> b;           // 输入：7 8
    cout << b << endl;  // (7, 8)
}
```

几个细节：

- `operator<<` 的 `Point` 参数是 `const Point&`，因为输出不修改对象；
- `operator>>` 的 `Point` 参数是 `Point&`，因为输入要修改对象；
- 两个 operator 都返回 stream reference，保证可以 chaining；
- 为了支持 `Point b; cin >> b;`，`Point` 需要 default constructor，这里通过默认参数实现。

---

## Example：组合类型 LineSegment 的输出

组合类型：线段由两个点组成。

```cpp
class LineSegment {
public:
    LineSegment(const Point& start, const Point& end)
        : start(start), end(end) {}

    friend ostream& operator<<(ostream& out, const LineSegment& s) {
        return out << s.start << " - " << s.end;
    }

private:
    Point start;
    Point end;
};
```

完整程序：

```cpp
#include <iostream>
using namespace std;

class Point {
public:
    Point(int x = 0, int y = 0) : x(x), y(y) {}

    friend ostream& operator<<(ostream& out, const Point& p) {
        return out << "(" << p.x << ", " << p.y << ")";
    }

    friend istream& operator>>(istream& in, Point& p) {
        return in >> p.x >> p.y;
    }

private:
    int x;
    int y;
};

class LineSegment {
public:
    LineSegment(const Point& start, const Point& end)
        : start(start), end(end) {}

    friend ostream& operator<<(ostream& out, const LineSegment& s) {
        return out << s.start << " - " << s.end;
    }

private:
    Point start;
    Point end;
};

int main() {
    Point a(3, 5);

    Point b;
    cin >> b;  // 例如输入：6 7

    cout << a << endl;  // (3, 5)
    cout << b << endl;  // (6, 7)

    LineSegment s(a, b);
    cout << s << endl;  // (3, 5) - (6, 7)
}
```

这里体现了 composition 的力量。

`LineSegment` 的输出不需要重新写“点如何输出”的细节：

```cpp
return out << s.start << " - " << s.end;
```

因为 `Point` 已经定义了 `operator<<`，所以 `LineSegment` 可以直接复用它。

这说明：

```text
小类型的抽象做完整后，大类型可以一层一层组合上去。
```

---