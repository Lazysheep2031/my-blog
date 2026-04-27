---
title: Composition, Inheritance, and Class-Level Features
published: 2026-04-10
description: Composition vs Inheritance, const objects, static members, inline functions
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

1. 一个类能不能直接包含另一个类的对象？——这就是 **composition**。
2. 一个类能不能扩展另一个类的接口和实现？——这就是 **inheritance**。
3. 类与类之间能访问哪些成员？——这就是 **access protection**。

判断标准：

| 关系 | 英文表达 | 典型语义 | C++ 实现方式 |
|---|---|---|---|
| 组合 | `A has a B` | A 拥有 / 使用 B | 把 `B` 作为 `A` 的成员字段 |
| 继承 | `A is a B` | A 是一种 B | `class A : public B` |
| 实现复用 | `A is implemented in terms of B` | A 内部用 B 实现 | 通常优先用组合 |

---

## 目录

- [Composition：组合复用](#composition组合复用)
- [Inheritance：继承复用](#inheritance继承复用)
- [Access protection：成员访问控制](#access-protection成员访问控制)
- [继承方式：public / protected / private](#继承方式public--protected--private)
- [Public inheritance、LSP 与 Upcasting](#public-inheritancelsp-与-upcasting)
- [Name hiding：同名函数隐藏](#name-hiding同名函数隐藏)
- [组合 vs 继承：设计判断](#组合-vs-继承设计判断)

---

## Composition：组合复用

### 组合的语义：has-a

组合（composition）指：

> 用已有对象作为字段，构造出一个新对象。

它表达的是：

> **has-a**，即“有一个”。

典型例子：

- `car has an engine`
- `car has tyres`
- `SavingsAccount has a Person`
- `SavingsAccount has a Currency`

如果一句话念出来是通顺的 “A has a B”，通常就应该先考虑组合。

Effective C++ Item 38 的观点：

- 在应用领域里，composition 常表示 **has-a**；
- 在实现领域里，composition 也可以表示 **is-implemented-in-terms-of**。

所以，很多时候如果只是想复用某个类的内部实现，更适合用组合，而不是公有继承。

### 两种组合方式

组合主要有两种方式：

| 方式 | 英文 | 成员写法 | 语义 |
|---|---|---|---|
| 直接拥有 | Direct, owns | `Y y;` | `X` 拥有 `Y`，生命周期绑定 |
| 间接引用 / 共享 | By reference, shares | `Y* p;` / `Y& r;` | `X` 指向 / 借用 / 共享外部 `Y` |

#### 直接拥有

字段直接是对象本身：

```cpp
class X {
private:
    Y y1, y2;
};
```

含义：

- `X` 直接拥有这些 `Y` 对象；
- `X` 的生命周期结束，这些 `Y` 成员对象也会结束；
- 绑定关系紧密；
- 适合表示真正属于对象内部状态的部分。

例如，一个 `Employee` 的下面这些信息通常和员工对象绑定紧密：

- `Name`
- `Address`
- `Health Plan`
- `Salary History`

它们适合被 `Employee` 直接拥有。

#### 间接引用 / 共享

字段存的是指针或引用：

```cpp
class X {
private:
    Y* p1;
    Y* p2;
    Y& r1;
    Y& r2;
};
```

含义：

- `X` 不一定拥有这些 `Y` 对象；
- 更像“引用 / 借用 / 指向 / 共享”；
- 生命周期管理可能不归 `X` 全权负责；
- 适合表示外部已有对象之间的关联。

例如 `Employee` 的 `Supervisor` 虽然也和员工相关，但 supervisor 本身也是另一个 `Employee`。此时更合理的实现通常是指针或引用：

```cpp
class Employee {
private:
    // Name, Address, HealthPlan, SalaryHistory 可以直接拥有
    Employee* supervisor;  // 指向另一个 Employee，不直接拥有
};
```

### 组合对象的初始化

组合对象本质上也是成员字段，所以应该在 **constructor initializer list（构造函数初始化列表）** 中完成初始化。

例子：

```cpp
class Person { /* ... */ };
class Currency { /* ... */ };

class SavingsAccount {
public:
    SavingsAccount(const string& name,
                   const string& address,
                   int cents);
    ~SavingsAccount();
    void print();
private:
    Person m_saver;
    Currency m_balance;
};
```

构造函数应该写成：

```cpp
SavingsAccount::SavingsAccount(const string& name,
                               const string& address,
                               int cents)
    : m_saver(name, address),
      m_balance(0, cents)
{}
```

这里的含义是：

- `m_saver(name, address)` 调用 `Person` 的构造函数；
- `m_balance(0, cents)` 调用 `Currency` 的构造函数；
- 初始化列表把参数直接传给成员对象的子构造函数。

#### 不推荐的写法

```cpp
SavingsAccount::SavingsAccount(const string& name,
                               const string& address,
                               int cents) {
    m_saver.set_name(name);
    m_saver.set_address(address);
    m_balance.set_cents(cents);
}
```

问题：

- 进入构造函数体之前，`m_saver` 和 `m_balance` 已经被默认构造了；
- 函数体里再调用 `set_...`，本质是“先默认初始化，再赋值修改”；
- 如果成员对象没有默认构造函数，这种写法会直接编译失败；
- 即使能编译，语义和效率也更差。

结论：成员对象需要构造参数时，应优先使用初始化列表。

### 组合后的函数实现：把工作转派出去

组合以后，不应该越过抽象边界去读取被组合对象的内部数据。更好的做法是：

> 把任务转派给真正负责该信息的对象。

例如 `SavingsAccount::print()`：

```cpp
void SavingsAccount::print()
{
    m_saver.print();
    m_balance.print();
}
```

这段代码的设计含义：

- `m_saver` 自己知道怎么打印 `Person` 信息；
- `m_balance` 自己知道怎么打印 `Currency` 信息；
- `SavingsAccount` 只负责组织整体流程。

不推荐的思路：

- 直接伸手去读 `m_saver` 内部每个字段；
- 在 `SavingsAccount` 里重新拼一遍 `Person` 的打印逻辑；
- 破坏封装，使得 `Person` 内部结构一变，`SavingsAccount` 也要跟着改。

组合的正确使用方式包括：

- 保持抽象边界；
- 通过公开接口协作；
- 把职责分派给真正拥有该数据的对象。

---

## Inheritance：继承复用

### 继承的语义：is-a

继承（inheritance）表示：

> 一个类是另一个类的一种特殊形式。

它表达的是：

> **is-a**，即“是一个”。

典型例子：

- `Student is a Person`
- `Professor is a Person`
- `Manager is an Employee`

如果这句话说得通，那么继承才有语义基础。

| 关系 | 判断句式 | 例子 |
|---|---|---|
| composition | `A has a B` | `Car has an engine` |
| inheritance | `A is a B` | `Manager is an Employee` |

### 基类 / 派生类术语

| 英文 | 中文 | 说明 |
|---|---|---|
| Base class | 基类 | 被继承的类 |
| Super class | 超类 | 同 base class |
| Parent class | 父类 | 同 base class |
| Derived class | 派生类 | 继承别人的类 |
| Sub class | 子类 | 同 derived class |
| Child class | 子类 | 同 derived class |

例如：

```cpp
class Employee {
    // ...
};

class Manager : public Employee {
    // ...
};
```

这里：

- `Employee` 是 base class / parent class；
- `Manager` 是 derived class / child class。

### Employee / Manager 例子

#### 声明基类 `Employee`

```cpp
class Employee {
public:
    Employee(const string& name, const string& ssn);
    const string& get_name() const;
    void print(ostream& out) const;
    void print(ostream& out, const string& msg) const;
protected:
    string m_name;
    string m_ssn;
};
```

这里要注意：

- `m_name` 和 `m_ssn` 被声明为 `protected`；
- 派生类可以直接访问 `protected` 成员；
- 类外仍然不能直接访问。

`protected` 的完整规则放在后面的 [Access protection](#access-protection成员访问控制) 中统一讲。

#### `Employee` 构造函数

```cpp
Employee::Employee(const string& name, const string& ssn)
    : m_name(name), m_ssn(ssn)
{
    // initializer list sets up the values!
}
```

这里依然使用初始化列表，因为 `m_name` 和 `m_ssn` 是成员字段，应在构造阶段完成初始化。

#### `Employee` 成员函数

```cpp
const string& Employee::get_name() const
{
    return m_name;
}

void Employee::print(ostream& out) const
{
    out << m_name << endl;
    out << m_ssn << endl;
}

void Employee::print(ostream& out, const string& msg) const
{
    out << msg << endl;
    print(out);
}
```

这里有两个 `print`，构成重载：

```cpp
void print(ostream& out) const;
void print(ostream& out, const string& msg) const;
```

后面会看到，派生类中重新定义同名 `print` 时，会触发 **name hiding**。

#### 声明派生类 `Manager`

```cpp
class Manager : public Employee {
public:
    Manager(const string& name,
            const string& ssn,
            const string& title);
    const string title_name() const;
    const string& get_title() const;
    void print(ostream& out) const;
private:
    string m_title;
};
```

这里：

- `Manager : public Employee` 表示公有继承；
- `Manager` 继承了 `Employee` 的接口和实现；
- `Manager` 自己新增了 `m_title`。

### 继承中的构造与析构顺序

派生类构造函数写法：

```cpp
Manager::Manager(const string& name,
                 const string& ssn,
                 const string& title)
    : Employee(name, ssn), m_title(title)
{}
```

这里的 `Employee(name, ssn)` 表示：

> 先调用基类 `Employee` 的构造函数，构造出派生类对象内部的基类子对象。

可以把派生类对象理解成：

```text
Manager object
├── Employee base subobject
│   ├── m_name
│   └── m_ssn
└── Manager's own part
    └── m_title
```

构造顺序：

```text
Base class
→ Derived class's member fields
→ Derived class constructor body
```

也就是：

```text
Employee(name, ssn)
→ m_title(title)
→ Manager constructor body
```

如果没有显式给基类传参：

```cpp
Manager::Manager(...) : m_title(title) {}
```

编译器会尝试调用 `Employee` 的默认构造函数。若 `Employee` 没有默认构造函数，会编译失败。

析构顺序与构造顺序严格相反：

```text
Derived class destructor body
→ Derived class's member fields
→ Base class
```

> **构造从上到下，析构从下到上。**

### 继承后的成员访问与复用

派生类可以复用基类已经写好的成员函数。

```cpp
void Manager::print(ostream& out) const
{
    Employee::print(out); // call the base class print
    out << m_title << endl;
}
```

这里的逻辑：

- 先调用 `Employee::print(out)`，打印员工共有信息；
- 再输出 `m_title`，打印 `Manager` 自己新增的信息。

这体现了继承复用的常见模式：

> 先复用基类行为，再补充派生类自己的行为。

其他成员函数：

```cpp
const string& Manager::get_title() const
{
    return m_title;
}

const string Manager::title_name() const
{
    return string(m_title + ": " + m_name);
    // access base m_name
}
```

这里 `title_name()` 能直接访问 `m_name`，原因是：

- `m_name` 是 `Employee` 的 `protected` 成员；
- `Manager` 是 `Employee` 的派生类；
- 派生类内部可以直接访问基类的 `protected` 成员。

#### 使用例子

```cpp
int main () {
    Employee bob("Bob Jones", "555-44-0000");
    Manager bill("Bill Smith", "666-55-1234", "ImportantPerson");

    // okay Manager inherits Employee
    string name = bill.get_name();

    // Error -- bob is an Employee!
    string title = bob.get_title();

    cout << bill.title_name() << '\n' << endl;

    bob.print(cout);
    bob.print(cout, "Employee:");
    bill.print(cout);
    bill.print(cout, "Employee:"); // Error -- hidden!
}
```

关键点：

- `bill.get_name()` 合法，因为 `Manager` 继承了 `Employee::get_name()`；
- `bob.get_title()` 不合法，因为 `Employee` 不是 `Manager`，没有 `get_title()`；
- `bill.print(cout, "Employee:")` 不合法，原因是 **name hiding**，后面单独讲。

---

## Access protection：成员访问控制

### `private` / `protected` / `public`

访问控制用于决定：

> 当前代码位置能不能访问某个成员。

总表：

| specifier | within same class | in derived class | outside the class |
|---|---:|---:|---:|
| `private` | Yes | No | No |
| `protected` | Yes | Yes | No |
| `public` | Yes | Yes | Yes |

### `private`

```cpp
class Employee {
private:
    std::string m_ssn;
};
```

含义：

- `Employee` 自己的成员函数可以访问 `m_ssn`；
- `Manager : public Employee` 这样的派生类不能直接访问 `m_ssn`；
- 类外也不能访问 `m_ssn`。

例子：

```cpp
class Employee {
private:
    std::string m_ssn;
public:
    Employee(const std::string& ssn) : m_ssn(ssn) {}
};

class Manager : public Employee {
public:
    Manager(const std::string& ssn) : Employee(ssn) {}

    void foo() {
        // std::cout << m_ssn; // 错：private 成员对派生类不可见
    }
};
```

### `protected`

```cpp
class Employee {
protected:
    std::string m_name;
};
```

含义：

- 基类自己能访问；
- 派生类也能访问；
- 类外仍然不能访问。

例子：

```cpp
class Employee {
protected:
    std::string m_name;
public:
    Employee(const std::string& name) : m_name(name) {}
};

class Manager : public Employee {
public:
    Manager(const std::string& name) : Employee(name) {}

    void print_name() const {
        std::cout << m_name << '\n'; // 对：protected 对派生类可见
    }
};
```

这也是 `Manager::title_name()` 能直接使用基类 `m_name` 的原因。

### `public`

```cpp
class Date {
public:
    int get_day() const;
};
```

含义：

- 类内能访问；
- 派生类能访问；
- 类外也能访问。

`public` 成员通常构成类的对外接口。

### `class` 与 `struct` 的默认权限

`class` 和 `struct` 在 C++ 中有两个默认值不同：

| 项目 | `class` | `struct` |
|---|---|---|
| 成员默认访问权限 | `private` | `public` |
| 默认继承方式 | `private` inheritance | `public` inheritance |

#### 成员默认访问权限

`class` 默认是 `private`：

```cpp
class A {
    int x;
};
```

等价于：

```cpp
class A {
private:
    int x;
};
```

`struct` 默认是 `public`：

```cpp
struct B {
    int x;
};
```

等价于：

```cpp
struct B {
public:
    int x;
};
```

例子：

```cpp
#include <iostream>
using namespace std;

class A {
    int x = 1;   // 默认 private
public:
    int get() const { return x; }
};

struct B {
    int x = 2;   // 默认 public
};

int main() {
    A a;
    B b;

    // cout << a.x << '\n'; // 错：A::x 默认 private
    cout << a.get() << '\n';
    cout << b.x << '\n';    // 对：B::x 默认 public
}
```

实际写代码时建议显式写出继承方式：

```cpp
class Manager : public Employee {
    // ...
};
```

### `friend`：显式授予访问权

`friend` 的含义：

> Grant access explicitly.

也就是：

> 某个类自己决定，把自己的私有 / 保护成员开放给谁。

友元可以是：

- free function（自由函数）；
- another class's member function（另一个类的成员函数）；
- an entire class（整个类）。

#### 友元函数

```cpp
#include <iostream>
using namespace std;

class Box {
private:
    int secret;
public:
    Box(int x) : secret(x) {}

    friend void reveal(const Box& b);
};

void reveal(const Box& b) {
    cout << b.secret << '\n'; // 对：reveal 是 Box 的 friend
}

int main() {
    Box b(42);
    reveal(b);
}
```

这里 `reveal()` 不是 `Box` 的成员函数，但因为被声明成 `friend`，所以可以访问 `Box::secret`。

#### 友元类

```cpp
#include <iostream>
using namespace std;

class Vault {
private:
    int password = 123456;

    friend class Inspector;
};

class Inspector {
public:
    void check(const Vault& v) const {
        cout << v.password << '\n'; // 对：Inspector 整个类都是友元
    }
};
```

#### 友元的注意点

友元有三个重要性质：

- 友元不是继承关系：`friend class B;` 只表示 `A` 允许 `B` 访问自己的私有实现，不表示 `B is-an A`。
- 友元不是双向的：`A` 声明 `B` 为 friend，只表示 `B` 能访问 `A`，不表示 `A` 能访问 `B`。
- 友元不是传递的：`A` 把权限给 `B`，`B` 把权限给 `C`，不意味着 `C` 也能访问 `A`。

```cpp
class A {
    friend class B;
};
```

#### 友元的合理使用场景

常见场景：

- 运算符重载，比如 `operator<<`；
- 两个类实现上高度协作；
- 测试代码或调试工具需要深入访问内部状态。

典型例子：

```cpp
#include <iostream>
using namespace std;

class Point {
private:
    int x, y;
public:
    Point(int x, int y) : x(x), y(y) {}

    friend ostream& operator<<(ostream& os, const Point& p);
};

ostream& operator<<(ostream& os, const Point& p) {
    return os << '(' << p.x << ", " << p.y << ')';
}
```

### `private is to class, not to object`

> `private` 限制的是“哪些类 / 函数的代码可以访问”，不是限制“某个具体对象只能访问自己的 private”。

只要代码处在同一个类的成员函数内部，就可以访问这个类的任意对象的私有成员。

#### 同类对象之间互访私有成员

```cpp
#include <iostream>
using namespace std;

class Point {
private:
    int x;
public:
    Point(int x) : x(x) {}

    bool same_as(const Point& other) const {
        return x == other.x;           // 对：访问另一个 Point 对象的 private
    }

    int diff(const Point& other) const {
        return x - other.x;            // 对：访问另一个 Point 对象的 private
    }
};
```

`other.x` 是 `private`，但这里合法，因为当前代码位于 `Point` 类自己的成员函数中。

另一个例子：

```cpp
class Counter {
private:
    int value;
public:
    Counter(int v) : value(v) {}

    void swap_with(Counter& other) {
        int tmp = value;
        value = other.value;      // 对：访问另一个 Counter 对象的 private
        other.value = tmp;        // 对
    }
};
```

判断访问是否合法，看的是：

> 当前代码所在的位置，是否属于这个类授权的代码范围。

#### pointer 间接读写 private 成员


- 如果你已经在这个类的成员函数内部；
- 即使通过 `this` 指针，或者另一个同类对象指针；
- 仍然可以访问该类的私有成员。

例子：

```cpp
class Node {
private:
    int data;
public:
    Node(int x) : data(x) {}

    void copy_from(const Node* p) {
        data = p->data;  // 对：虽然通过指针访问，但仍在 Node 类内部
    }
};
```

注意：

> 这不表示类外拿到指针就能绕过 `private`。

类外代码仍然不能写：

```cpp
Node* p = new Node(1);
// p->data = 2; // 错：类外不能访问 private 成员
```

---

## 继承方式：`public` / `protected` / `private`

### 继承方式的本质

继承关键字：

```cpp
class Derived1 : public Base {};
class Derived2 : protected Base {};
class Derived3 : private Base {};
```

它们决定的是：

> 继承之后，基类的 `public` / `protected` 成员在派生类里被重新映射成什么访问级别。

总表：

| inheritance type | public members in Base | protected members in Base | private members in Base |
|---|---|---|---|
| `class B : public A` | `public` in B | `protected` in B | not accessible |
| `class B : protected A` | `protected` in B | `protected` in B | not accessible |
| `class B : private A` | `private` in B | `private` in B | not accessible |

对应图示：

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604161025618.png" alt="Inheritance Access Control" style="width: 360px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

注意：

- 基类的 `private` 成员始终不能被派生类直接访问；
- 继承方式只影响基类的 `public` 和 `protected` 成员在派生类中的访问级别；
- 最常见、最符合 `is-a` 语义的是 `public` 继承。

### `public` 继承

```cpp
class B : public A {};
```

映射规则：

- `A` 的 `public` 成员，在 `B` 中仍是 `public`；
- `A` 的 `protected` 成员，在 `B` 中仍是 `protected`；
- `A` 的 `private` 成员，在 `B` 中仍不可直接访问。

这是最自然的 **is-a** 关系。

例子：

```cpp
class A {
public:
    void pub() {}
protected:
    void prot() {}
private:
    void priv() {}
};

class B : public A {
public:
    void test() {
        pub();    // 对
        prot();   // 对
        // priv(); // 错
    }
};

int main() {
    B b;
    b.pub();      // 对：public 继承后仍然 public
    // b.prot();  // 错：类外不能访问 protected
}
```

### `protected` 继承

```cpp
class B : protected A {};
```

映射规则：

- `A` 的 `public` 成员，在 `B` 中变成 `protected`；
- `A` 的 `protected` 成员，在 `B` 中仍是 `protected`；
- `A` 的 `private` 成员仍不可直接访问。

例子：

```cpp
class A {
public:
    void pub() {}
protected:
    void prot() {}
};

class B : protected A {
public:
    void test() {
        pub();
        prot();
    }
};

int main() {
    B b;
    // b.pub(); // 错：现在 pub 在 B 外部看来已经不是 public 了
}
```

`protected` 继承可以让派生类继续使用基类能力，但不把基类接口公开给外部。

### `private` 继承

```cpp
class B : private A {};
```

映射规则：

- `A` 的 `public` 成员，在 `B` 中变成 `private`；
- `A` 的 `protected` 成员，在 `B` 中也变成 `private`；
- `A` 的 `private` 成员仍不可直接访问。

例子：

```cpp
class A {
public:
    void pub() {}
protected:
    void prot() {}
};

class B : private A {
public:
    void test() {
        pub();
        prot();
    }
};

int main() {
    B b;
    // b.pub(); // 错：对外已经变成 private 了
}
```

`private` 继承更偏向实现复用，不表达自然的 `is-a` 关系。外部不能把 `B` 当作 `A` 使用。

---

## Public inheritance、LSP 与 Upcasting

### 替换原则 LSP

> Public inheritance should imply substitution.
> 如果 `B is-an A`，那么任何需要 `A` 的地方都应该可以使用 `B`。

这就是 **Liskov Substitution Principle（LSP，里氏替换原则）**。

如果：

```cpp
class Manager : public Employee {
    // ...
};
```

那么理论上：

- 任何要求 `Employee` 的函数；
- 都应该可以传入 `Manager` 对象。

例子：

```cpp
#include <iostream>
#include <string>
using namespace std;

class Employee {
public:
    Employee(string name) : m_name(std::move(name)) {}
    const string& get_name() const { return m_name; }
protected:
    string m_name;
};

class Manager : public Employee {
public:
    Manager(string name, string title)
        : Employee(std::move(name)), m_title(std::move(title)) {}
private:
    string m_title;
};

void print_employee_name(const Employee& e) {
    cout << e.get_name() << '\n';
}

int main() {
    Manager m("Bill", "CTO");
    print_employee_name(m);  // 对：Manager 可以当 Employee 用
}
```

### Upcasting：上转型

Upcasting 指：

> 把派生类对象当成基类对象来看待。

它通常发生在：

- 基类指针；
- 基类引用。

例如：

```cpp
Manager pete("Pete", "444-55-6666", "Bakery");
Employee* ep = &pete; // Upcast
Employee& er = pete;  // Upcast
```

这里：

- `pete` 的真实类型是 `Manager`；
- `ep` 的静态类型是 `Employee*`；
- `er` 的静态类型是 `Employee&`；
- 通过 `ep` / `er` 使用对象时，只能看到 `Employee` 接口视角。

上转型只对引用和指针自然成立，因为它们仍然指向 / 引用原来的对象。

### 引用 / 指针上转型与按值切片

#### 指针上转型

```cpp
Manager pete("Pete", "444-55-6666", "Bakery");
Employee* ep = &pete;
```

`ep` 指向的实际对象仍然是 `Manager`，只是当前通过 `Employee*` 视角访问。

#### 引用上转型

```cpp
Employee& er = pete;
```

`er` 是 `pete` 的一个基类引用视角，没有复制对象。

#### 按值赋值会发生 object slicing

如果写成：

```cpp
Employee e = pete;
```

这不是上转型引用，而是创建了一个新的 `Employee` 对象副本。此时会发生 **object slicing（对象切片）**：

- `Manager` 中属于 `Employee` 的基类部分被拷贝出来；
- `Manager` 自己新增的 `m_title` 等字段被切掉；
- 得到的是一个独立的 `Employee` 对象。

例子：

```cpp
#include <iostream>
#include <string>
using namespace std;

class Employee {
public:
    Employee(string name) : m_name(std::move(name)) {}
    void print() const {
        cout << "Employee: " << m_name << '\n';
    }
protected:
    string m_name;
};

class Manager : public Employee {
public:
    Manager(string name, string title)
        : Employee(std::move(name)), m_title(std::move(title)) {}

    void print_manager() const {
        cout << "Manager: " << m_name << ", " << m_title << '\n';
    }
private:
    string m_title;
};

int main() {
    Manager m("Alice", "Director");

    Employee& ref = m;  // 上转型，还是同一个对象
    ref.print();

    Employee copy = m;  // 切片，产生一个独立的 Employee 子对象副本
    copy.print();
}
```

总结：

| 写法 | 是否复制对象 | 是否保留完整 `Manager` 对象 | 结果 |
|---|---:|---:|---|
| `Employee* p = &m;` | 否 | 是 | 指针上转型 |
| `Employee& r = m;` | 否 | 是 | 引用上转型 |
| `Employee e = m;` | 是 | 否 | 对象切片 |

### 上转型后的静态绑定与动态绑定

> Lose type information of the object: `ep->print(cout); // The base print() is called`

意思是：

- 通过基类指针 / 引用访问时，编译器当前只看到基类接口；
- 如果函数不是 `virtual`，调用会按照静态类型绑定；
- `Employee* ep` 调用 `ep->print(cout)` 时，会调用 `Employee::print`。

#### 非 virtual：静态绑定

```cpp
#include <iostream>
using namespace std;

class Employee {
public:
    void print() const {
        cout << "Employee::print\n";
    }
};

class Manager : public Employee {
public:
    void print() const {
        cout << "Manager::print\n";
    }
};

int main() {
    Manager m;
    Employee* p = &m;

    p->print(); // 输出 Employee::print
}
```

原因：

- `p` 的静态类型是 `Employee*`；
- `print()` 不是 virtual；
- 编译器按静态类型决定调用 `Employee::print()`。

#### virtual：动态绑定

如果想让基类指针 / 引用根据对象真实类型调用派生类版本，需要使用 `virtual`。

```cpp
#include <iostream>
using namespace std;

class Employee {
public:
    virtual void print() const {
        cout << "Employee::print\n";
    }
    virtual ~Employee() = default;
};

class Manager : public Employee {
public:
    void print() const override {
        cout << "Manager::print\n";
    }
};

int main() {
    Manager m;
    Employee* p = &m;
    p->print(); // 输出 Manager::print
}
```

补充：

- `virtual` 表示允许运行时动态分派；
- `override` 表示这个函数确实覆盖了基类虚函数；
- 如果一个类准备用作多态基类，析构函数通常也应该声明为 `virtual`。

---

## Name hiding：同名函数隐藏

### 问题现象

如果派生类重新定义了一个同名成员函数，基类中其他同名重载版本可能会被隐藏。

例子：

```cpp
class Employee {
public:
    void print(ostream& out) const;
    void print(ostream& out, const string& msg) const;
};

class Manager : public Employee {
public:
    void print(ostream& out) const;
};
```

此时：

```cpp
Manager bill("Bill Smith", "666-55-1234", "ImportantPerson");
bill.print(cout, "Employee:"); // Error -- hidden!
```

原因：

- `Manager` 中声明了同名函数 `print`；
- 名字查找先在 `Manager` 作用域中找到 `print`；
- 找到后，基类 `Employee` 中同名重载集合被挡住；
- 编译器只在 `Manager::print` 这一组中匹配参数；
- `Manager::print(ostream&)` 不能接受两个参数，所以报错。

关键结论：

> 派生类中的同名函数会隐藏基类中整个同名重载集合。

它不是只隐藏“同参数列表”的版本。

### 问题代码

```cpp
#include <iostream>
using namespace std;

class Employee {
public:
    void print(ostream& out) const {
        out << "Employee base print\n";
    }

    void print(ostream& out, const string& msg) const {
        out << msg << '\n';
        print(out);
    }
};

class Manager : public Employee {
public:
    void print(ostream& out) const {
        out << "Manager print\n";
    }
};

int main() {
    Manager m;
    // m.print(cout, "hello"); // 错：被 name hiding 挡住了
}
```

### 修复方式：`using Base::func;`

可以在派生类中把基类同名重载重新引入当前作用域：

```cpp
class Manager : public Employee {
public:
    using Employee::print;  // 把基类同名重载重新引入当前作用域

    void print(ostream& out) const {
        out << "Manager print\n";
    }
};
```

此时：

```cpp
int main() {
    Manager m;
    m.print(cout);              // 调用派生类版本
    m.print(cout, "hello");     // 调用基类重载版本
}
```

总结：

| 情况 | 结果 |
|---|---|
| 派生类定义同名函数，但没有 `using Base::func;` | 基类同名重载集合被隐藏 |
| 派生类写 `using Base::func;` | 基类同名重载重新参与重载解析 |

---

## 组合 vs 继承：设计判断

### 适合组合的情况

如果可以说：

> `A has a B`

就优先考虑组合。

例子：

- `SavingsAccount has a Person`
- `SavingsAccount has a Currency`
- `Car has an engine`
- `Employee has a supervisor`（通常通过引用 / 指针）

组合强调：

- 拥有；
- 包含；
- 使用；
- 内部实现。

### 适合继承的情况

如果可以说：

> `A is a B`

才考虑继承。

例子：

- `Manager is an Employee`
- `Student is a Person`
- `Professor is a Person`

继承强调：

- 类型扩展；
- 接口复用；
- 可以被当作基类使用；
- 满足替换原则。

### 警惕为了实现复用而滥用继承

Effective C++ Item 38 的核心观点：

> 有时候两个类之间实现上很像，但语义上并不满足 `is-a`。

经典例子：

```cpp
class Set : public std::vector<int> {
    // 很可疑
};
```

问题：

- `vector` 允许重复元素；
- `Set` 通常要求元素唯一；
- 所以 `Set is-a vector` 语义不成立。

更合理的关系：

```cpp
class Set {
private:
    std::vector<int> data;
};
```

即：

- `Set has-a vector`；
- `Set is implemented in terms of vector`；
- `vector` 只是 `Set` 的内部实现细节。
