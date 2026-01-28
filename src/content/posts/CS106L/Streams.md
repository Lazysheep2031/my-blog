---
title: Streams
published: 2026-01-22
description: C++ Streams相关笔记
tags: [CS106L]
category: 笔记
draft: false
---
## String Stream
不连接到任何外部设备的流。

### ostringstream
- 注释是对应输出
```c++
ostringstream oss("Ito En Green Tea");
cout << oss.str() << endl; // Ito En Green Tea
```

这一步发生了两件事：
1. **底层 string buffer 初始化为**
    `"Ito En Green Tea"`
2. **写指针（put pointer）在开头**
构造函数并没有把写指针放到末尾。

```c++
oss << 16.9 << " Ounce ";
cout << oss.str() << endl; // 16.9 Ounce n Tea
```

- 写指针 **从开头开始**
- `"16.9 Ounce "` 覆盖原字符串前面的字符

```c++
ostringstream oss("Ito En Green Tea");
cout << oss.str() << endl; // Ito En Green Tea

oss << 16.9 << " Ounce ";
cout << oss.str() << endl; // 16.9 Ounce n Tea

oss << "(Pack of " << 12 << ")";
cout << oss.str() << endl; // 16.9 Ounce (Pack of 12)
```

> **写指针并没有回到开头，而是停留在上一次写完的位置！**

```c++
ostringstream oss("Ito En Green Tea", stringstream::ate); // 就会从末尾位置打开，而不是默认的开头了
等价于
oss.str("Ito En Green Tea");
oss.seekp(0, ios::end); // seekp(offset, base)，offset 是以 stream 的 character type 为单位的偏移
```

写入的时候会开始先分配一个初始空间，如果不够了会再扩充。

### istringstream
```c++
string s = "123 abc 45";
istringstream iss(s);

int x;
string y;
int z;

iss >> x >> y >> z;
```

1. `>>` 是“**尽量多读，直到失败**”
- 读 `int`：    
    - 跳过空白
    - 连续读数字
- 读 `string`：
    - 跳过空白
    - 读到下一个空白

- @ 这和 `cin` **完全一样**。

2. 失败 ≠ 抛异常
如果失败了，比如：
`istringstream iss("abc"); int x; iss >> x;   // ❌ 读不了`
⚠️ **不会崩，不会报错，不会 throw**
而是：
- `iss.fail()` → `true`
- 之后的所有 `>>` 都会**直接跳过，不干活**

3. stream 有状态位（state bits）

| 状态位      | 含义              |
| -------- | --------------- |
| `good()` | 一切正常            |
| `fail()` | 上一次操作失败（类型不匹配等） |
| `eof()`  | 读到结尾            |
| `bad()`  | 严重错误（IO 崩了）     |
```c++
if (iss.fail()) { ... }
if (!iss) { ... }  // 等价，更 idiomatic
```
### stringstream
如何把一个 string 安全地转成 int ？
```c++
int stringToInteger(const string& str) {
    istringstream iss(str);

    int result;
    iss >> result;
    if (iss.fail()) throw domain_error("invalid integer");

    char remain;
    iss >> remain;
    if (!iss.fail()) throw domain_error("extra characters");

    return result;
}
```

|输入|第一段|第二段|结果|
|---|---|---|---|
|`"123"`|成功|fail|✅|
|`"123abc"`|成功|成功|❌|
|`"abc"`|fail|—|❌|
|`"123 "`|成功|fail|✅|

> **一次成功不代表输入是干净的**💡 

## State bits
- Good bit : ready for read/write
- Fail bit : previous operation failed , future operations fail.
- EOF bit : reached end of buffer content , future operations fail.
- Bad bit : external error , future operations fail.

## Input/output stream
**Four standard iostreams**
- cin : Standard input stream
- cout : Standard output stream (buffered)
- cerr : Standard error stream (unbuffered)
- clog : Standard error stream (buffered)

| 流      | 方向  | 目标     | 是否缓冲 | 语义            |
| ------ | --- | ------ | ---- | ------------- |
| `cin`  | 输入  | stdin  | 是    | 用户/程序输入       |
| `cout` | 输出  | stdout | ✅ 是  | **正常输出**      |
| `cerr` | 输出  | stderr | ❌ 否  | **错误 / 致命信息** |
| `clog` | 输出  | stderr | ✅ 是  | **日志 / 调试信息** |
### 错误样例
代码片段（简化）：

```c++
#include<iostream>
#include<string>
using namespace std;

int main() {
    cout << "What is your name? ";
    string name;
    cin >> name;

    cout << "What is your age? ";
    int age;
    cin >> age;

    cout << "Where are you from? ";
    string home;
    cin >> home;

    cout << "Hello " << name
         << " (age " << age
         << " from " << home << ")"
         << endl;
}
```

终端输入：

```text
Avery Wang
```

输出结果：

```text
What is your name? Avery Wang What is your age? Where are you from? Hello Avery(age 0 from )
```

**分析** ：

---

1.  `operator>>` 的读取规则
`cin >> string` 只读取一个单词 `cin >> name;`
- 跳过前导空白
- 读取字符，直到遇到 **第一个空白字符**
- 不会读整行

因此输入：
`Avery Wang\n`
结果是：
`name = "Avery"`
输入缓冲区中 **还剩下**：
`"Wang\n"`

---

2. 输入缓冲区的问题 读取 int 时，遇到非数字 → failbit 被置位
`cin >> age;`
此时缓冲区的下一个字符是： `W`

但 `operator>> int` 的规则是：
- 跳过空白
- 期望看到数字（或 `+ / -`）
- 解析失败 → 设置 `failbit`

结果：
- `cin.fail() == true`
- **输入流进入失败状态**    
- 后续所有 `>>` 操作都会立刻失败
    
> [!WARNING] 注意：
> 
> `int age; cin >> age;`
> 
> 如果读取失败：
> 
> - `age` **不会被赋值**
>     
> - 它的值是 **未定义行为（UB）**
>     
> - 看到的 `0` 只是“碰巧”

---

3. failbit 不清除，后续读取全部失效 `cin >> home;`
由于 `cin` 仍处于 `fail()` 状态：
- 不会读取任何字符
- `home` 保持默认初始化值：`""`

4. 为什么提示语句会黏在一起？

`cout << "What is your age? "; cout << "Where are you from? ";`

原因：
- `cout` 是 **缓冲输出流**
- 没有 `\n` / `endl` / `flush`
- 多条输出可能在一次刷新中一起显示

---

### getline
```c++
getline(cin, name, '\n');
```
**getline 的规则**
1. 从当前读指针开始    
2. 逐字符读取
3. 直到遇到 delimiter（这里是 `'\n'`）
4. 把 delimiter 之前的所有字符 放进 `name`
5. delimiter 本身会被“吃掉”，但不会存进 string

```c++
int getInteger(const string& prompt, const string& reprompt) {
	while(true) {
		/*
		while (true) {
		    // 1. 打印提示
		    // 2. 读一整行
		    // 3. 用 stringstream 解析
		    // 4. 检查是否是“干净整数”
		    // 5. 不合法就 reprompt
		}
		*/
		cout << prompt;
		string line;
		if (!getline(cin, line)) throw domain_error("...");//不会留下 `'\n'` 在输入缓冲区
		
		istringstream iss(line);// 把“字符串”当成 `cin` 来用。
		int val; char remain;
		
		if (iss >> val && !(iss >> remain)) return val;
		
		cout << reprompt << endl;  
	}
	return 0;
}
```

## Types

 STL 的类型有时很长 → 用 type alias/auto 让代码更可读、更不易错 → C++ 里返回多个值有更自然的方式（pair/struct）而不是一堆引用参数。

---
### STL 会出现长类型
**为什么 STL 会出现很长的类型？**

```cpp
std::unordered_map<std::forward_list<Student>, std::unordered_set<...>>::iterator begin
    = studentMap.cbegin();
````

**原因**
- STL 容器是模板（template）写的：类型由 `unordered_map<K, V>` 的 `K` / `V` 决定
- 容器内部还有嵌套类型：
    - `unordered_map<...>::iterator`        
    - `unordered_map<...>::const_iterator`
- 当 `K` / `V` 本身也是复杂容器时（比如 `forward_list<Student>`），整段类型就会非常长

**长类型的问题**

- 可读性差：看不清变量的角色（是迭代器？是容器？）
- 易错：`iterator` / `const_iterator`、`begin()` / `cbegin()` 配套问题容易写错
- 重构困难：改了容器类型后，要改很多处声明

---
### `using` 
**用 Type Alias（类型别名）解决**：`using`

```cpp
using map_iterator = std::unordered_map< std::forward_list<Student>, std::unordered_set<...> >::iterator;

map_iterator begin = studentMap.cbegin();
map_iterator end   = studentMap.cend();
```

`using` 的含义

```cpp
using 新名字 = 原类型;
```

它不会创建新类型，只是给原类型起外号。

- 让代码更短、更清晰    
- 一处改动，全局受益：只要改 alias 那一行即可
- 表达语义：`map_iterator` 让读者立刻知道它是某个 map 的迭代器
    

**alias 仍然有点易错**，因为你仍然需要自己决定到底用哪个：

- `iterator` 还是 `const_iterator`？
- 如果你写的是：

```c++
auto begin = studentMap.cbegin();
```

那 begin 实际上是 **const_iterator**  ，如果 alias 写成 iterator，就类型不匹配。

---
###  `auto`
#### `auto` 的定义
`auto`：让编译器推导类型（C++11）

```cpp
auto begin = studentMap.cbegin();
auto end   = studentMap.cend();
```

- `auto` 不是动态类型    
- 变量依然有明确类型，只是 **由编译器从右侧表达式推导**

为什么 `auto` 在这里更安全？

因为你不用自己猜：
- `cbegin()` 返回什么？（通常是 `const_iterator`）
- `begin()` 返回什么？（通常是 `iterator`）

你写 `auto`，编译器一定推对。

`auto ` 能用在几乎所有地方

（以下是典型展示，重点是 auto 很灵活）

```cpp
auto copy = v;                 // 推导为 vector<string>
auto multiplier = 2.4;         // double
auto name = "Avery";           // const char*（注意！）
auto betterName = string{"Avery"}; // std::string
auto& refMult = multiplier;    // 引用：double&
auto func = [](auto i){ return i*2; }; // lambda 的闭包类型（很长，auto 很有用）
```

**一个重要坑**：字符串字面量

- `auto name = "Avery";` 推导成 **const char***（C 风格字符串）
- 如果你想要 `std::string`，写：

 ```cpp
 auto name = std::string("Avery");
 // 或
 auto name = std::string{"Avery"};
 ```

---

####  `auto` 的收益

**Correctness**

- 避免**未初始化变量**（尤其是你本来想写某个复杂类型，但写错导致没赋上）
- 避免**隐式转换的坑**（比如把某个复杂 iterator 类型写错）
- 避免 `iterator` vs `const_iterator` 搞混
    

**Flexibility**

- 以后如果 `studentMap` 的类型变了：
    - 显式类型版本要全局改
    - `auto` 版本大多不需要动，因为推导会跟着变

---
何时用 `auto `
✅ 建议用：
- **类型从上下文一眼能看出**
- **确切类型不重要**（你只关心能用它做什么）
    - 典型：迭代器、lambda 的闭包类型、模板返回值

❌ 不建议用：  
-  **用了反而降低可读性**  
例如：

```cpp
auto x = f();  // f() 到底返回啥？读者看不出来
```

如果 `x` 的含义很重要（比如单位/范围/含义），显式类型可能更清晰。

---

### 返回多个值
#### 引用参数输出多个结果
```cpp
void findPriceRange(int dist, int& min, int& max) {
    min = static_cast<int>(dist * 0.08 + 100);
    max = static_cast<int>(dist * 0.36 + 750);
}

int main() {
    int dist = 6452;
    int min, max;
    findPriceRange(dist, min, max);
    cout << "You can find prices between: " << min << " and " << max;
}
```

- 函数签名里混合了输入参数 dist 和输出参数 min/max
- 调用者需要先声明 `min, max`（而且可能忘记初始化、或者顺序写错）
- 从接口上看不够自然：你在找一个范围，结果却是 void + 改外部变量

---

#### 返回 `std::pair`

```cpp
std::pair<int, int> findPriceRange(int dist) {
    int min = static_cast<int>(dist * 0.08 + 100);
    int max = static_cast<int>(dist * 0.36 + 750);
    return std::make_pair(min, max);
}

int main() {
    int dist = 6452;
    std::pair<int, int> p = findPriceRange(dist);
    cout << "You can find prices between: " << p.first << " and " << p.second;
}
```

- 给我 dist → 我返回 range
这个映射更符合数学/函数式思维，也更符合现代 C++ 风格

#### `std::make_pair`

- 用来创建 pair，避免手写类型：
    
```cpp
return std::make_pair(min, max);
```

- （现代 C++ 里也可以直接 `return {min, max};`


#### Structured Binding

```cpp
auto [mn, mx] = findPriceRange(dist);
cout << mn << " " << mx;
```

这样就不用 `p.first/p.second`，更语义化。


> [!NOTE] 一些 C++的个人疑问解答
> 
> 
>  1️⃣ `const string&` 是什么意思？
> 
> 这里的 `string` 指的是：
> 
> ```cpp
> std::string
> ```
> 
> 它是 **C++ 标准库里的一个类（class）**，不是 C 语言的字符串。
> 
>  `std::string` 的本质
> 
> - 内部管理一段字符数组（`char*`）    
> - **自动管理内存**
> - 记录长度
> - 可以安全复制、传参、返回
> 
> 和 C 语言的字符串（`char[]` / `char*`）**完全不是一类东西**
> 
> `&`：引用（reference）
> 
> ```cpp
> string& s
> ```
> 
> 含义是：
> 
> **s 是某个 `string` 的别名**
> 
> - 不复制字符串
> - 不新分配内存
> - 修改 `s` 就是修改原来的那个 `string`
> 
> `const`：只读约束
> 
> ```cpp
> const string& s
> ```
> 
> 含义是：
> 
> **我借用这个 string，但我保证不会修改它**
> 
> 效果：
> - 函数里不能写 `s += "abc";`
> - 编译器帮你检查，防止误改
> 
> ```cpp
> void f(const string& s);
> ```
> 
> 
> |C|C++|
> |---|---|
> |`char arr[100]`|`std::string s`|
> |手动管理大小|自动管理|
> |容易越界|安全|
> |传参会退化成指针|可值传 / 引用传|
> |没有 const 保护|`const string&`|
> 
> ---
> 
>  2️⃣ STL 是什么？模板又是什么？
> 
> **STL = Standard Template Library**
> 
> **C++ 标准库里，一整套用模板写的数据结构 + 算法**
> 
> 主要包括三类东西：
> 
> |类别|例子|
> |---|---|
> |容器|`vector`, `map`, `unordered_map`, `set`|
> |迭代器|`iterator`, `const_iterator`|
> |算法|`sort`, `find`, `count`, `accumulate`|
> 
> ---
> 
> 模板可以理解为：
> 
> **“类型的函数 / 类型的类”**
> 
>  **普通函数**（固定类型）
> 
> ```cpp
> int add(int a, int b);
> ```
> 
>  **模板函数**（类型参数化）
> 
> ```cpp
> template<typename T>
> T add(T a, T b);
> ```
> 
> ```cpp
> unordered_map<K, V>
> ```
> 
> 这里的：
> 
> - `K` = key 的类型
> - `V` = value 的类型
>     
> 
> 比如：
> 
> ```cpp
> unordered_map<string, int> m;
> ```
> 
> 编译器会生成一个：
> 
> **key 是 string，value 是 int 的 map 类型**
> 
> 
> 
>  3️⃣ `iterator` / `const_iterator` / `begin()` / `cbegin()` 是什么？
> 
> 
> **iterator = 容器里的“指针式访问工具”**
> 
> ```cpp
> vector<int> v = {1,2,3};
> auto it = v.begin();
> ```
> 
> - `it` 指向第一个元素
> - `*it` 访问元素
> - `++it` 移到下一个
> 
> ---
> 
> `iterator` vs `const_iterator`
> 
> | 类型               | 能不能改元素 |
> | ---------------- | ------ |
> | `iterator`       | ✅ 能    |
> | `const_iterator` | ❌ 不能   |
> 
> ```cpp
> *it = 10;        // iterator OK
> *cit = 10;       // const_iterator ❌
> ```
> 
> ---
> 
> `begin()` vs `cbegin()`
> 
> |函数|返回什么|
> |---|---|
> |`begin()`|`iterator`|
> |`cbegin()`|`const_iterator`|
> 
> 因为有时候你**明确想表达“只读遍历”**：
> 
> ```cpp
> for (auto it = v.cbegin(); it != v.cend(); ++it) {
>     // 保证不会改 v
> }
> ```
> 
> 这是 **const-correctness（常量正确性）** 的体现
> 
> ---
> 
> 为什么 `auto` 特别适合 iterator？
> 
> 因为你不用记这种怪物类型：
> 
> ```cpp
> std::unordered_map<
>     std::forward_list<Student>,
>     std::unordered_set<int>
>::const_iterator
> ```
> 
> 你只要写：
> 
> ```cpp
> auto it = studentMap.cbegin();
> ```
> 
> - 类型对
> - const 性质对
> - 不容易写错
> 
> ---
> 
> 4️⃣ `std::` 是什么意思？
> 
> ```cpp
> std::
> ```
> 
> 表示：
> 
> **这是标准库里的名字**
> 
> 比如：
> 
> - `std::string`
> - `std::vector`    
> - `std::cout`
> 
> ---
> 
> 如果没有 namespace：
> 
> - 你写的 `string`    
> - 别人库里的 `string`
> - 标准库里的 `string`
> 
> 会**名字冲突**
> 
> `std::` 就是为了防止冲突。
> 