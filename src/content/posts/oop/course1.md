---
title: Using Objects
published: 2026-03-05
description: string 的用法
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## Example

```cpp
#include <iostream>
using namespace std; \\ 使用 std 命名空间
int main() {
    cout << "Please enter your age:" << endl;
    int age;
    cin >> age;
    cout << "Your age is " << age << endl;
    return 0;
}
```
编译执行方式：
```cpp
g++ main.cpp
./a.out
```

## Using Objects

### Examples 

```cpp
#include <iostream>
#include<string>
using namespace std;
int main() {
    string str1 = "foo"; // 初始化
    string str2 = "bar";
    string str3 = str1 + str2; // str1 和 str2 是对象，+ 是重载的运算符
    cout << "str3=" << str3 << endl; // 输出 str3=foobar

    str2 += str1; // str2 是对象，+= 是重载的运算符
    cout << "str2=" << str2 << endl; // 输出 str2=barfoo
    str3 = "hello world"; // 重新赋值 str3
    cout << "str3=" << str3 << endl; // 输出 str3=hello world

    string str4("hello zju");
    string str5(str3); // 用 str3 初始化 str5
    string str6(str3,7,5); // 从 str3 的第 7 个字符开始，取 5 个字符，赋值给 str6
    cout << "str4=" << str4 << endl; // 输出 str4=hello zju
    cout << "str5=" << str5 << endl; // 输出 str5=hello world
    cout << "str6=" << str6 << endl; // 输出 str6=world

    string str7 = str3.substr(0,5); // 从 str3 的第 0 个字符开始，取 5 个字符，赋值给 str7
    cout << "str7=" << str7 << endl; // 输出 str7=hello

    string str8 = str3;
    str8.replace(0,5,"hi"); // 从 str8 的第 0 个字符开始，替换 5 个字符为 "hi"
    cout << "str8=" << str8 << endl; // 输出 str8=hi world

    str8.assign(10,"*"); // 将 str8 赋值为 10 个 '*' 字符
    cout << "str8=" << str8 << endl; // 输出 str8=**********

    string str9 = "Hello, hangzhou city";
    string str_to_find = "hangzhou";
    cout << str9.find(str_to_find) << endl; // 输出 str_to_find 在 str9 中的位置，输出 7
    str9.replace(str9.find(str_to_find),str_to_find.length(),"zju"); // 将 str9 中的 str_to_find 替换为 "zju"
    cout << str9 << endl; // 输出 str9=Hello, zju city

    return 0;
}
```

```cpp
#include<fstream>
#include<iostream>
using namespace std;
int main() {
    string str1 = "foo, bar!";
    ofstream fout("output.txt"); // 创建一个输出文件流对象，关联到 output.txt 文件
    fout << str1; // 将 str1 的内容写入 output.txt 文件

    ifstream fin("output.txt");  // 创建一个输入文件流对象，关联到 output.txt 文件
    string str2,str3;
    fin >> str2>>str3; // 从 output.txt 文件中读取一个字符串，赋值给 str2
    cout << "str2=" << str2 << endl; // 输出 str2   
    cout << "str3=" << str3 << endl; // 输出 str3
    return 0;
}
```

```cpp
#include <iostream>
#include<regex> // 正则表达式库
using namespace std;
int main()
{
    string s = "Hello, Students@zju!";
    regex re("a|e|i|o|u"); // 定义一个正则表达式，匹配元音字母
    string s1 = regex_replace(s, re, "*"); // 将 s 中的所有元音字母替换为 '*'
    cout << s << endl; // 输出 Hello, Students@zju!
    cout << s1 <<  endl; // 输出 H*ll*, St*d*nts@zj*!
    return 0;
}
```

