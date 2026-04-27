---
title: A quick tour of C++
published: 2026-03-14
description: Starting from selection sort, we will abstract the algorithm with templates, then apply it to a polymorphic array of shapes.
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

主线：

- 从具体实现（`int` 的选择排序）到抽象封装（`min_element` / `swap`）
- 从函数重载到函数模板（同一份算法适配多类型）
- 从“默认比较规则”到“可传入比较器”（支持按 `id`、按 `name`、按面积、按周长）
- 从普通类型到自定义类型（`Student` 运算符重载）
- 从过程式写法到面向对象多态（`Shape` 抽象类 + 派生类 + 虚函数）


## 目录

- [概述](#概述)
- [目录](#目录)
- [选择排序：从具体到抽象](#选择排序从具体到抽象)
- [函数模板：一份算法，多种类型](#函数模板一份算法多种类型)
  - [模板通常写在头文件里](#模板通常写在头文件里)
- [`&` 引用](#-引用)
  - [`T&`：可修改的引用](#t可修改的引用)
  - [`const T&`：只读引用](#const-t只读引用)
  - [`std::ostream&`：把同一个输出流继续传下去](#stdostream把同一个输出流继续传下去)
- [Student：自定义类型接入模板](#student自定义类型接入模板)
  - [`<` 的两种常见写法](#-的两种常见写法)
  - [`<<` 的意义](#-的意义)
- [比较器 Compare](#比较器-compare)
  - [带比较器的模板形态](#带比较器的模板形态)
  - [比较器函数 vs lambda](#比较器函数-vs-lambda)
- [泛型设计](#泛型设计)
  - [头文件与 `#pragma once`](#头文件与-pragma-once)
  - [命名空间](#命名空间)
  - [模板重载（按是否传比较器）](#模板重载按是否传比较器)
  - [`print_array` 的模板重载](#print_array-的模板重载)
  - [静态数组长度的写法](#静态数组长度的写法)
- [面向对象与多态：`Shape` 抽象层](#面向对象与多态shape-抽象层)
  - [`Shape` 这层到底想解决什么问题](#shape-这层到底想解决什么问题)
  - [抽象基类（接口层）](#抽象基类接口层)
  - [`virtual`](#virtual)
  - [访问控制：`public / protected / private`](#访问控制public--protected--private)
  - [派生类 + override](#派生类--override)
  - [构造函数与初始化列表](#构造函数与初始化列表)
  - [友元输出函数](#友元输出函数)
  - [多态输出与排序](#多态输出与排序)
  - [资源管理提醒](#资源管理提醒)

---

## 选择排序：从具体到抽象

先看最直接版本（只支持 `int`）：

```cpp
void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        if (min_idx != i) {
            int temp = arr[i];
            arr[i] = arr[min_idx];
            arr[min_idx] = temp;
        }
    }
}
```

接着做了两层抽象：

1. 找最小值索引 → `min_element`
2. 交换元素 → `swap`

这样 `selectionSort` 本体更干净，更像“算法骨架”。这就是 **abstraction barrier（抽象屏障）** 的思想：

- 上层只关心“做什么”（找最小、交换）
- 下层负责“怎么做”（循环与细节）

---

## 函数模板：一份算法，多种类型

当你希望同样的算法支持 `int` / `double` / `std::string` 时，函数重载能做，但会重复很多代码。

模板做法：

```cpp
template<typename T>
int min_element(T arr[], int begin, int end) { ... }

template<typename T>
void swap(T& a, T& b) { ... }

template<typename T>
void selectionSort(T arr[], int n) { ... }

template<typename T>
void print_array(T arr[], int n) { ... }
```

核心收益：

- 你只写一份算法代码
- 编译器按实参推导 `T`，实例化出具体版本

### 模板通常写在头文件里

模板代码放在了 `xchen_algorithm.h`，这是很常见的写法。

```cpp
// xchen_algorithm.h
template<typename T>
void selection_sort(T arr[], int n) { ... }
```

原因：

- 模板不是普通函数，它通常要在**使用点**看到完整定义
- 编译器看到 `selection_sort(arr, n)` 时，才会按 `T=int`、`T=Student` 等去实例化
- 如果只有声明没有定义，很多情况下链接阶段会找不到对应版本

所以这类小型模板算法，直接写在头文件里最省事。

:::TIP
为什么每个函数都要写 `template<typename T>`？

因为这四个函数是 **四个独立的函数模板**，不是一个模板包着四个函数。

所以 `T` 的作用域只在“紧随其后的那一个函数”里有效：

- 写在 `min_element` 前面，`T` 只能用于 `min_element`
- 写在 `swap` 前面，`T` 只能用于 `swap`
- 写在 `selectionSort` 前面，`T` 只能用于 `selectionSort`
- 写在 `print_array` 前面，`T` 只能用于 `print_array`

每个模板函数都要声明自己的模板参数。
:::


**如果只写一个模板头的写法**

可以把多个操作放进同一个类模板里，让所有成员共享同一个 `T`：

```cpp
template<typename T>
struct SelectionSortToolkit {
    static int min_element(T arr[], int begin, int end) { ... }
    static void swap(T& a, T& b) { ... }
    static void selectionSort(T arr[], int n) { ... }
    static void print_array(T arr[], int n) { ... }
};
```

区别：

- 函数模板版调用更自然：`selectionSort(arr, n)`
- 类模板版模板头只写一次，但调用更长：`SelectionSortToolkit<int>::selectionSort(arr, n)`


---

## `&` 引用

```cpp
void swap(T& a, T& b)
bool operator<(const Student& s1, const Student& s2)
std::ostream& operator<<(std::ostream& out, const Student& s)
```

这里的 `&` 不是“取地址”，而是**引用（reference）**。

先把它记成一句话：

- 引用 = 原对象的别名

也就是说，引用不是新开一份对象，而是给原来的对象起了一个“另一个名字”。

### `T&`：可修改的引用

```cpp
void swap(T& a, T& b)
```

这里 `a` 和 `b` 直接绑定到外面的两个变量。

所以在函数里交换 `a`、`b`，外面的值也真的会被交换。

如果写成：

```cpp
void swap(T a, T b)
```

那只是交换了两个副本，函数结束后外面不会变。

### `const T&`：只读引用

```cpp
bool operator<(const Student& s1, const Student& s2)
```

这里有两层意思：

- `&`：不拷贝对象，直接引用原对象
- `const`：我承诺只读，不修改它

所以 `const T&` 很常见，因为它同时做到：

- 避免拷贝
- 不修改实参

### `std::ostream&`：把同一个输出流继续传下去

```cpp
std::ostream& operator<<(std::ostream& out, const Student& s)
```

这里有三处值得看：

- `std::ostream& out`：`out` 是输出流对象的引用，不复制 `std::cout`
- `const Student& s`：`s` 是学生对象的只读引用
- 返回 `std::ostream&`：把同一个输出流返回去，支持链式输出

所以这句才成立：

```cpp
std::cout << a << b << c;
```

前一次 `<<` 的结果，还是那个 `std::cout`。

- `T&`：要改原对象
- `const T&`：不想拷贝，也不想改原对象
- `std::ostream&`：要把同一个输出流继续往后传

---


## Student：自定义类型接入模板

当 `T=Student` 时，模板里会用到两类操作：

1. 排序时比较：`arr[i] < arr[j]`
2. 打印时输出：`std::cout << arr[i]`

所以 `Student` 需要支持 `<` 和 `<<`。

### `<` 的两种常见写法

成员函数写法：

```cpp
struct Student {
    int id;
    std::string name;

    bool operator<(const Student& other) const {
        return id < other.id;
    }
};
```

非成员写法：

```cpp
bool operator<(const Student& s1, const Student& s2) {
    return s1.id < s2.id;
    // return s1.name < s2.name;
}
```

### `<<` 的意义

```cpp
std::ostream& operator<<(std::ostream& out, const Student& s) {
    return out << "(" << s.id << "," << s.name << ")";
}
```

- 返回 `std::ostream&`，支持链式输出
- 参数用 `const Student&`，避免拷贝且不修改对象
- 这样 `print_array` 才能直接打印 `Student`

这里的 `&` 可以顺手这样看：

- `std::ostream& out`：`out` 是输出流本身的别名
- `const Student& s`：`s` 是学生对象的只读别名
- 返回 `std::ostream&`：把同一个输出流继续传回去

---

## 比较器 Compare

- 保留默认 `selection_sort(T arr[], int n)`
- 再提供带比较器版本 `selection_sort(T arr[], int n, Compare comp)`

这样排序规则就不再写死。

### 带比较器的模板形态

```cpp
template<typename T, typename Compare>
int min_element(T arr[], int begin, int end, Compare comp) {
    int min_idx = begin;
    for (int i = begin + 1; i < end; ++i) {
        if (comp(arr[i], arr[min_idx])) {
            min_idx = i;
        }
    }
    return min_idx;
}

template<typename T, typename Compare>
void selection_sort(T arr[], int n, Compare comp) {
    for (int i = 0; i < n - 1; ++i) {
        int min_idx = min_element(arr, i, n, comp);
        if (min_idx != i) {
            swap(arr[min_idx], arr[i]);
        }
    }
}
```

用在 Student 上

```cpp
xchen::selection_sort(arr, n); // 默认按 operator<，即按 id

xchen::selection_sort(
    arr,
    n,
    [](const Student& s1, const Student& s2) {
        return s1.name < s2.name;
    }
); // 按 name
```

- `operator<` 适合定义“默认顺序”
- 比较器参数适合定义“可切换顺序”

### 比较器函数 vs lambda

先回到模板本体：

```cpp
template<typename T, typename Compare>
int min_element(T arr[], int begin, int end, Compare comp) {
    int min_idx = begin;
    for (int i = begin + 1; i < end; ++i) {
        if (comp(arr[i], arr[min_idx])) {
            min_idx = i;
        }
    }
    return min_idx;
}
```

这里最关键的是这一句：

```cpp
if (comp(arr[i], arr[min_idx]))
```

模板只要求你传进来一个 `comp`，并且这个 `comp` 能回答这样一个问题：

- “`arr[i]` 应不应该排在 `arr[min_idx]` 前面？”

如果返回 `true`，就更新最小值位置；如果返回 `false`，就不更新。

代码里两种传法都用了。

**第一种：传命名函数**

```cpp
bool less_shape_area(Shape* s1, Shape* s2)
{
    return s1->get_area() < s2->get_area();
}

xchen::selection_sort(arr, n, less_shape_area);
```

可以把它拆开理解成：

```cpp
less_shape_area(arr[i], arr[min_idx])
```

而 `less_shape_area` 的意思是：

- 如果 `arr[i]` 的面积更小，就返回 `true`
- 所以排序结果会变成“按面积升序”

只看函数名，基本就知道排序规则。

**第二种：传 lambda**

```cpp
xchen::selection_sort(
    arr,
    n,
    [](Shape* s1, Shape* s2) {
        return s1->get_perimeter() > s2->get_perimeter();
    }
);
```

这个 lambda 没有名字，但作用和上面的函数完全一样。

它等价于“临时写一个比较器，然后立刻传进去”。

这里的逻辑是按周长降序

可以把它脑补成这种临时函数：

```cpp
bool temp(Shape* s1, Shape* s2)
{
    return s1->get_perimeter() > s2->get_perimeter();
}
```

只是 lambda 不需要真的单独定义 `temp` 这个名字。

**两者到底有什么关系**

对模板来说，这两种写法没有本质区别：

- 命名函数：`less_shape_area`
- lambda：`[](Shape* s1, Shape* s2) { ... }`

它们都会被当成 `comp`，然后在模板内部这样使用：

```cpp
comp(arr[i], arr[min_idx])
```

所以：

- 你传进去的东西，必须能接收两个元素
- 它必须返回 `bool`
- 它定义了“谁应该排在前面”

**什么时候用函数，什么时候用 lambda**

如果规则会重复使用，适合写成命名函数：

- 代码更整齐
- 名字本身就是注释
- 多次排序时可以复用

如果规则只用一次，适合直接写 lambda：

- 不用额外起名字
- 逻辑离调用点更近
- 读代码时能立刻看到排序条件

---

## 泛型设计

把算法抽到头文件并放进命名空间：

```cpp
namespace xchen {
    // min_element / swap / selection_sort / print_array ...
}
```

这里体现了几个实用点：

### 头文件与 `#pragma once`

`xchen_algorithm.h` 开头是：

```cpp
#pragma once
```

作用：

- 防止头文件被重复包含
- 避免重复定义错误
- 对这种模板头文件尤其常见

可以理解成“这个头文件本次编译只展开一次”。

### 命名空间

- 避免与标准库或其他代码同名冲突
- 调用时语义清晰：`xchen::selection_sort(...)`

### 模板重载（按是否传比较器）

- `selection_sort(arr, n)`：走默认 `<`
- `selection_sort(arr, n, comp)`：走自定义规则

### `print_array` 的模板重载

除了普通数组：

```cpp
template<typename T>
void print_array(T arr[], int n)
```

还有指针数组版本：

```cpp
template<typename T>
void print_array(T* arr[], int n) {
    for (int i = 0; i < n; ++i)
        std::cout << *arr[i] << ' ';
    std::cout << '\n';
}
```

这就是为什么 `Shape* arr[]` 也能直接被打印。

- `Student arr[]` 是“对象数组”，元素本身就是对象
- `Shape* arr[]` 是“指针数组”，元素是指向对象的指针
- 打印对象数组时直接 `cout << arr[i]`
- 打印指针数组时要先解引用：`cout << *arr[i]`

### 静态数组长度的写法

`main.cpp` 里多次出现：

```cpp
int n = sizeof(arr) / sizeof(arr[0]);
```

这只适用于当前作用域里的静态数组。

- `sizeof(arr)`：整个数组占多少字节
- `sizeof(arr[0])`：一个元素占多少字节
- 两者相除得到元素个数

但如果数组传进普通函数，参数会退化成指针，这招就不能用了。

---

## 面向对象与多态：`Shape` 抽象层

这一段的核心，是用一个抽象基类把不同图形统一到同一套接口下，再配合虚函数实现多态。

### `Shape` 这层到底想解决什么问题

代码里有：

- `Rectangle`
- `Circle`
- `Triangle`

它们的面积公式不同、周长公式不同，但它们又都属于“图形”。

所以作者先抽出一个共同的上层：

- 图形都应该能算面积
- 图形都应该能算周长
- 图形都应该能告诉别人自己叫什么

这就是 `Shape` 的作用：**先定义共同接口，再让不同图形各自实现。**

这样后面就可以统一写成：

```cpp
Shape* arr[] = {
    new Rectangle(2,3),
    new Circle(3),
    new Triangle(2,5,4)
};
```

虽然数组里装的是不同类型的对象，但在这一层都被统一看成 `Shape`，因此可以用同一套代码处理。

### 抽象基类（接口层）

```cpp
class Shape {
protected:
    double area, perimeter;

public:
    virtual ~Shape() {}
    virtual void calc_area() = 0;
    virtual void calc_perimeter() = 0;
    virtual std::string name() const = 0;

    double get_area() const { return area; }
    double get_perimeter() const { return perimeter; }

    friend std::ostream& operator<<(std::ostream&, const Shape&);
};
```

- `class Shape`：定义“图形”这个基类
- `area, perimeter`：面积和周长是所有图形共有的数据
- `calc_area()`：要求所有图形都会算面积
- `calc_perimeter()`：要求所有图形都会算周长
- `name()`：要求所有图形都能返回名字
- `get_area()` / `get_perimeter()`：对外提供读取接口
- `friend operator<<`：允许直接打印图形对象

`Shape` 不是某一个具体图形，它更像图形这一类对象的公共接口。

### `virtual`

这一组函数前面都有 `virtual`：

```cpp
virtual ~Shape() {}
virtual void calc_area() = 0;
virtual void calc_perimeter() = 0;
virtual std::string name() const = 0;
```

`virtual` 的核心作用是：

- 当你通过“基类指针/基类引用”访问对象时
- 程序会根据“对象真实类型”决定调用哪个版本

例如：

```cpp
Shape* p = new Rectangle(2, 3);
p->calc_area();
```

虽然 `p` 写成了 `Shape*`，但它实际指向的是 `Rectangle` 对象，所以这里应该执行的是 `Rectangle::calc_area()`。

这就是多态：接口统一，但实际执行的函数版本由对象真实类型决定。

如果没有 `virtual`，程序就很难在“统一接口”下正确区分矩形、圆形和三角形各自的实现。

**`=0` 是什么意思？**

```cpp
virtual void calc_area() = 0;
```

这里的 `=0` 表示纯虚函数。

- 基类这里只提要求
- 不给出具体实现
- 必须由子类来实现

所以 `Shape` 变成了**抽象类**：

- 你不能写 `Shape s;`
- 你只能把它当成一个统一接口

也就是说，`Shape` 的角色不是直接拿来创建对象，而是规定所有图形都必须提供哪些能力。

**虚析构函数：`virtual ~Shape() {}`**

这一句虽然短，但非常关键：

```cpp
virtual ~Shape() {}
```

析构函数的作用，是对象销毁时执行清理工作。

这里把析构函数写成 `virtual`，是为了保证下面这种写法是安全的：

```cpp
Shape* p = new Rectangle(2, 3);
delete p;
```

表面上看，`p` 的类型是 `Shape*`；但它实际指向的是 `Rectangle` 对象。

如果基类析构函数不是虚函数，`delete p` 时就可能只按 `Shape` 这一层来销毁，派生类那一层的清理过程无法正确执行。

把析构函数写成虚函数后，删除基类指针时会按真实类型销毁对象：

- 先执行派生类析构
- 再执行基类析构

在这份代码里，`Rectangle` / `Circle` / `Triangle` 没有自己额外管理资源，所以就算析构函数体是空的，`virtual` 仍然必须保留。

**`Rectangle : public Shape` 是什么意思？**

```cpp
class Rectangle : public Shape {
private:
    double w, h;
};
```

这里不是“`Rectangle` 里面再放一个 `Shape` 对象”，而是：

- `Rectangle` 继承 `Shape`
- 也就是“矩形是一种图形”

这叫 `is-a` 关系：

- `Rectangle is a Shape`
- `Circle is a Shape`
- `Triangle is a Shape`

所以我们才可以把矩形对象交给 `Shape*`：

```cpp
Shape* p = new Rectangle(2, 3);
```

这句成立的前提，就是矩形本来就是图形的一种。

### 访问控制：`public / protected / private`

代码里三种访问级别都出现了：

```cpp
class Shape {
protected:
    double area, perimeter;

public:
    virtual void calc_area() = 0;
};

class Rectangle : public Shape {
private:
    double w, h;
};
```

可以这样记：

- `public`：类外也能访问，是对外接口
- `protected`：类外不能直接访问，但派生类能访问
- `private`：只有当前类自己能访问

放在这份代码里：

- `area / perimeter` 放在 `protected`，因为子类算面积周长时要用到
- `w / h / r / a / b / c` 放在 `private`，因为它们只是具体图形的内部细节

### 派生类 + override

派生类真正做的事，是把基类里的“要求”补成各自的“具体实现”。

例如矩形会写：

```cpp
void calc_area() override {
    area = w * h;
}
```

圆形、三角形也会各自给出自己的公式。

`override` 的意思是在重写基类里的那个虚函数

- 如果函数签名写错，编译器会直接报错
- 能防止你以为自己重写了，实际上根本没重写成功

### 构造函数与初始化列表

派生类构造函数是这种形式：

```cpp
Rectangle(double w, double h) : w(w), h(h) {}
Circle(double r) : r(r) {}
Triangle(double a, double b, double c) : a(a), b(b), c(c) {}
```

- 左边的 `w` 是成员变量
- 右边的 `w` 是传进来的参数

所以 `Rectangle(double w, double h) : w(w), h(h) {}` 的意思就是：

- 用传进来的 `w` 初始化成员 `w`
- 用传进来的 `h` 初始化成员 `h`

这是 C++ 里很常见、也很标准的写法。

### 友元输出函数

`Shape` 里有这一句：

```cpp
friend std::ostream& operator<<(std::ostream&, const Shape&);
```

这里的 `friend` 表示：

- `operator<<` 不是 `Shape` 的成员函数
- 但我们授权它访问 `Shape` 的内部成员

对应定义是：

```cpp
std::ostream& operator<<(std::ostream& out, const Shape& s)
{
    return out << "(" << s.name() << ":" << s.area << "," << s.perimeter << ")";
}
```

这样写的原因是：

因为我们想保留这种自然语法：

```cpp
std::cout << shape;
```

`<<` 通常写成非成员函数更自然，但非成员函数默认不能访问类里的非公有成员，所以这里用 `friend` 授权。

同时，这里也再次体现了 `&` 的用法：

- `std::ostream& out`：输出流按引用传入，不复制 `cout`
- `const Shape& s`：图形按只读引用传入
- 返回 `std::ostream&`：这样才能继续连写 `<<`

还有一个细节：

```cpp
s.name()
```

这里 `name()` 是虚函数，所以即使 `s` 的静态类型写成 `Shape&`，真正调用的仍然会是各个派生类自己的 `name()`。

### 多态输出与排序

主程序的执行流程大致是：

1. 创建不同类型的图形对象
2. 用 `Shape*` 统一保存它们
3. 调用统一接口去计算面积和周长
4. 传入不同比较器进行排序
5. 统一打印

对应代码像这样：

```cpp
for (Shape* s : arr)
{
    s->calc_area();
    s->calc_perimeter();
}
```

这一段的关键是：

- `s` 的写法是 `Shape*`
- 但每个 `s` 实际可能指向矩形、圆形、三角形
- 因为有 `virtual`，调用会自动分发到正确的版本

因此，这一段真正体现的是：

- 算法层：`selection_sort`
- 规则层：比较器
- 对象层：`Shape` 多态

三者是可以组合起来的。

还有两个小语法点：

```cpp
s->calc_area();
```

- `->` 用在指针上
- 如果是普通对象，就写成 `obj.calc_area()`

```cpp
double get_area() const { return area; }
```

- 末尾的 `const` 表示这个成员函数不会修改对象状态
- 这种“读取型接口”通常都写成 `const`

### 资源管理提醒

显式 `delete`：

```cpp
for (Shape* s : arr)
    delete s;
```

这是因为前面用的是 `new`，所以最后要手动释放。

这里删除的是基类指针：

```cpp
Shape* p = new Rectangle(2, 3);
delete p;
```
先析构Rectangle，再析构Shape。

---
