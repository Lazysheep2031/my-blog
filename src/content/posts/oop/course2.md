---
title: Templates,Comparators, and Polymorphic Shapes
published: 2026-03-13
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
- [Student：自定义类型接入模板](#student自定义类型接入模板)
  - [`<` 的两种常见写法](#-的两种常见写法)
  - [`<<` 的意义](#-的意义)
- [比较器 Compare（按需切换排序规则）](#比较器-compare按需切换排序规则)
  - [带比较器的模板形态](#带比较器的模板形态)
- [泛型设计](#泛型设计)
  - [命名空间](#命名空间)
  - [模板重载（按是否传比较器）](#模板重载按是否传比较器)
  - [`print_array` 的模板重载](#print_array-的模板重载)
- [面向对象与多态：`Shape` 抽象层](#面向对象与多态shape-抽象层)
  - [抽象基类（接口层）](#抽象基类接口层)
  - [派生类 + override](#派生类--override)
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

---

## 泛型设计

把算法抽到头文件并放进命名空间：

```cpp
namespace xchen {
    // min_element / swap / selection_sort / print_array ...
}
```

这里体现了 3 个实用点：

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

### 派生类 + override

`Rectangle` / `Circle` / `Triangle` 都 `override` 了面积、周长、名称方法。

- `override` 是强约束：函数签名不匹配会编译报错
- `Triangle` 用海伦公式求面积（`<cmath>` 的 `sqrt`）

### 多态输出与排序

- `Shape* arr[] = {new Rectangle(...), new Circle(...), new Triangle(...)}`
- 先逐个 `calc_area()` / `calc_perimeter()`
- 再按不同比较器排序并打印（面积升序、周长升序、面积降序、周长降序）

这说明：

- 算法模板（selection sort） + 多态对象（Shape*）可以组合使用
- 排序规则通过函数指针/lambda 注入

### 资源管理提醒

显式 `delete`：

```cpp
for (Shape* s : arr)
    delete s;
```

这是因为前面用了 `new`。现代 C++ 实践中更推荐智能指针（`std::unique_ptr`）管理生命周期。

---

