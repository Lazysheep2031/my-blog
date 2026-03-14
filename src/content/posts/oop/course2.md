---
title: Templates,Comparators, and Polymorphic Shapes
published: 2026-03-14
description: Starting from selection sort, we will abstract the algorithm with templates, then apply it to a polymorphic array of shapes.
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

这节课在讲一个很完整的主线：

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
  - [模板为什么通常写在头文件里](#模板为什么通常写在头文件里)
- [Student：自定义类型接入模板](#student自定义类型接入模板)
  - [`<` 的两种常见写法](#-的两种常见写法)
  - [`<<` 的意义](#-的意义)
- [比较器 Compare（按需切换排序规则）](#比较器-compare按需切换排序规则)
  - [带比较器的模板形态](#带比较器的模板形态)
  - [比较器函数 vs lambda](#比较器函数-vs-lambda)
- [泛型设计](#泛型设计)
  - [头文件与 `#pragma once`](#头文件与-pragma-once)
  - [命名空间](#命名空间)
  - [模板重载（按是否传比较器）](#模板重载按是否传比较器)
  - [`print_array` 的模板重载](#print_array-的模板重载)
  - [静态数组长度的写法](#静态数组长度的写法)
- [面向对象与多态：`Shape` 抽象层](#面向对象与多态shape-抽象层)
  - [抽象基类（接口层）](#抽象基类接口层)
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

### 模板为什么通常写在头文件里

这节课的模板代码放在了 `xchen_algorithm.h`，这是很常见的写法。

```cpp
// xchen_algorithm.h
template<typename T>
void selection_sort(T arr[], int n) { ... }
```

原因很直接：

- 模板不是普通函数，它通常要在**使用点**看到完整定义
- 编译器看到 `selection_sort(arr, n)` 时，才会按 `T=int`、`T=Student` 等去实例化
- 如果只有声明没有定义，很多情况下链接阶段会找不到对应版本

所以这类小型模板算法，直接写在头文件里最省事。

---
:::TIP
为什么每个函数都要写 `template<typename T>`？

因为这四个函数是 **四个独立的函数模板**，不是一个模板包着四个函数。

所以 `T` 的作用域只在“紧随其后的那一个函数”里有效：

- 写在 `min_element` 前面，`T` 只能用于 `min_element`
- 写在 `swap` 前面，`T` 只能用于 `swap`
- 写在 `selectionSort` 前面，`T` 只能用于 `selectionSort`
- 写在 `print_array` 前面，`T` 只能用于 `print_array`

这不是“每种类型要手写一遍”，而是“每个模板函数都要声明自己的模板参数”。
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

---

## 比较器 Compare（按需切换排序规则）


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

也就是说，模板并不关心“到底按面积比，还是按周长比”。

它只要求你传进来一个 `comp`，并且这个 `comp` 能回答这样一个问题：

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

这个写法的优点是名字很明确：

- `less_shape_area`：按面积小的在前
- `less_shape_perimeter`：按周长小的在前
- `greater_shape_area`：按面积大的在前

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

这里的逻辑是：

- 如果 `s1` 的周长比 `s2` 大，就返回 `true`
- 所以“更大”的元素会被当成“更靠前”
- 最终结果就是“按周长降序”

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

所以真正要抓住的不是“语法长得不一样”，而是：

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

它可以理解成“这个头文件本次编译只展开一次”。

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

对照理解：

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

知识点：

- `=0` 是纯虚函数，`Shape` 成为抽象类，不能直接实例化
- 虚析构函数非常关键：通过基类指针 `delete` 派生类对象才安全
- `protected` 让派生类可访问 `area/perimeter`，外部不能直接访问

### 访问控制：`public / protected / private`

这份代码里三种访问级别都出现了：

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
- `protected`：类外不能直接访问，但派生类能用
- `private`：只有当前类自己能直接用

所以：

- `area / perimeter` 放 `protected`，方便子类写计算逻辑
- `w / h / r / a / b / c` 放 `private`，表示具体实现细节

### 派生类 + override

`Rectangle` / `Circle` / `Triangle` 都 `override` 了面积、周长、名称方法。

- `override` 是强约束：函数签名不匹配会编译报错
- `Triangle` 用海伦公式求面积（`<cmath>` 的 `sqrt`）

### 构造函数与初始化列表

派生类构造函数都是这种形式：

```cpp
Rectangle(double w, double h) : w(w), h(h) {}
Circle(double r) : r(r) {}
Triangle(double a, double b, double c) : a(a), b(b), c(c) {}
```

这里的 `: w(w), h(h)` 是**初始化列表**。

- 前一个 `w` 是成员变量
- 后一个 `w` 是形参
- 含义是“对象创建时直接初始化成员”

这比先默认构造、再赋值更自然，也是 C++ 很常见的写法。

### 友元输出函数

`Shape` 里声明了：

```cpp
friend std::ostream& operator<<(std::ostream&, const Shape&);
```

对应定义是：

```cpp
std::ostream& operator<<(std::ostream& out, const Shape& s)
{
    return out << "(" << s.name() << ":" << s.area << "," << s.perimeter << ")";
}
```

这里用 `friend`，是因为输出函数不是成员函数，但它需要访问 `Shape` 的内部数据。

这样设计的好处：

- 仍然能保持 `cout << obj` 这种自然写法
- 又能读取 `area`、`perimeter` 这些非公有成员
- `s.name()` 还是走虚函数，所以输出时保留多态效果

### 多态输出与排序

- `Shape* arr[] = {new Rectangle(...), new Circle(...), new Triangle(...)}`
- 先逐个 `calc_area()` / `calc_perimeter()`
- 再按不同比较器排序并打印（面积升序、周长升序、面积降序、周长降序）

这说明：

- 算法模板（selection sort） + 多态对象（Shape*）可以组合使用
- 排序规则通过函数指针/lambda 注入

还有两个细节值得记：

```cpp
s->calc_area();
```

- `->` 用在指针上
- 如果是普通对象，就写成 `obj.calc_area()`

```cpp
virtual std::string name() const = 0;
double get_area() const { return area; }
```

- 末尾的 `const` 表示该成员函数不会修改对象状态
- 读取型接口常常都写成 `const`

### 资源管理提醒

显式 `delete`：

```cpp
for (Shape* s : arr)
    delete s;
```

这是因为前面用了 `new`。现代 C++ 实践中更推荐智能指针（`std::unique_ptr`）管理生命周期。


---
