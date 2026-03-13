---
title: Using Objects
published: 2026-03-05
description: string 的用法
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

这节课核心是：

- 基础输入输出（`cin` / `cout`）
- `std::string` 作为对象的常见操作
- 文件输入输出（`ifstream` / `ofstream`）
- 正则替换（`regex_replace`）

整体重点是理解“对象 + 成员函数 + 运算符重载”的使用方式。

## 目录

- [概述](#概述)
- [目录](#目录)
- [基础 I/O 示例](#基础-io-示例)
- [Using Objects：string 常用操作](#using-objectsstring-常用操作)
- [文件 I/O（fstream）](#文件-iofstream)
- [正则表达式（regex）](#正则表达式regex)

---

## 基础 I/O 示例

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Please enter your age:" << endl;
    int age;
    cin >> age;
    cout << "Your age is " << age << endl;
    return 0;
}
```

编译执行：

```cpp
g++ main.cpp
./a.out
```

---

## Using Objects：string 常用操作

`string` 不是 C 风格字符数组，而是类对象，可以调用成员函数、也可以用重载运算符。

常见能力：

- 拼接：`+`、`+=`
- 赋值：`=`、`assign`
- 子串：构造子串、`substr`
- 替换：`replace`
- 查找：`find`

示例：

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string str1 = "foo";
    string str2 = "bar";
    string str3 = str1 + str2;
    cout << "str3=" << str3 << endl;

    str2 += str1;
    cout << "str2=" << str2 << endl;

    str3 = "hello world";
    cout << "substr=" << str3.substr(0, 5) << endl;

    string str4 = str3;
    str4.replace(0, 5, "hi");
    cout << "replace=" << str4 << endl;

    string str5 = "Hello, hangzhou city";
    string target = "hangzhou";
    auto pos = str5.find(target);
    if (pos != string::npos) {
        str5.replace(pos, target.length(), "zju");
    }
    cout << str5 << endl;

    return 0;
}
```

---

## 文件 I/O（fstream）

```cpp
#include <fstream>
#include <iostream>
#include <string>
using namespace std;

int main() {
    ofstream fout("output.txt");
    fout << "foo, bar!";
    fout.close();

    ifstream fin("output.txt");
    string a, b;
    fin >> a >> b;
    cout << "a=" << a << endl;
    cout << "b=" << b << endl;
    return 0;
}
```


- `ofstream` 写文件
- `ifstream` 读文件
- 使用 `>>` 读取时按空白分词

---

## 正则表达式（regex）

```cpp
#include <iostream>
#include <regex>
using namespace std;

int main()
{
    string s = "Hello, Students@zju!";
    regex re("a|e|i|o|u");
    string s1 = regex_replace(s, re, "*");
    cout << s << endl;
    cout << s1 << endl;
    return 0;
}
```

速记：

- `regex`：定义匹配模式
- `regex_replace(text, pattern, new_text)`：按模式替换

---
