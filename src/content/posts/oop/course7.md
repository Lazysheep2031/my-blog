---
title: Polymorphism
published: 2026-04-16
description: virtual functions, dynamic binding, vptr/vtable, slicing, virtual destructors, abstract classes, interface classes
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

**Polymorphism（多态）**。

> 当我们用一个基类指针统一管理不同派生类对象时，如何让同一个函数调用根据对象的真实类型执行不同版本？
> 使用 **virtual function**，让函数调用从 **static binding** 变成 **dynamic binding**。

---

## 目录

- [概述](#概述)
- [目录](#目录)
- [为什么需要多态](#为什么需要多态)
  - [Ray tracing](#ray-tracing)
  - [绘图程序中的例子](#绘图程序中的例子)
- [Shape 继承体系](#shape-继承体系)
  - [基类 `Shape`](#基类-shape)
  - [`Ellipse` 和 `Circle`](#ellipse-和-circle)
- [`virtual` 与 polymorphic call](#virtual-与-polymorphic-call)
  - [没有 `virtual` 时：静态绑定](#没有-virtual-时静态绑定)
  - [加入 `virtual` 后：动态绑定](#加入-virtual-后动态绑定)
  - [用 `vector<Shape*>` 统一管理图形](#用-vectorshape-统一管理图形)
- [Static binding vs. Dynamic binding](#static-binding-vs-dynamic-binding)
- [Virtual destructor](#virtual-destructor)
  - [为什么基类析构函数要写成 `virtual`](#为什么基类析构函数要写成-virtual)
  - [析构调用链](#析构调用链)
- [`virtual` 的底层机制：vptr 与 vtable](#virtual-的底层机制vptr-与-vtable)
  - [对象大小为什么会变大](#对象大小为什么会变大)
  - [同一类对象共享同一张 vtable](#同一类对象共享同一张-vtable)
  - [派生类有自己的 vtable](#派生类有自己的-vtable)
  - [`override` 与函数签名检查](#override-与函数签名检查)
  - [通过 vtable 手动调用函数](#通过-vtable-手动调用函数)
- [类型转换与对象切片](#类型转换与对象切片)
  - [派生类对象赋值给基类对象](#派生类对象赋值给基类对象)
  - [指针赋值不会切片，但可能泄漏](#指针赋值不会切片但可能泄漏)
  - [引用参数中的虚函数调用](#引用参数中的虚函数调用)
  - [危险实验：手动复制 vptr](#危险实验手动复制-vptr)
- [Overriding](#overriding)
  - [`override` 的作用](#override-的作用)
  - [向上调用基类版本](#向上调用基类版本)
- [Return type relaxation](#return-type-relaxation)
- [Overloading and virtual](#overloading-and-virtual)
  - [覆盖所有重载版本](#覆盖所有重载版本)
  - [用 `using` 引入基类重载集合](#用-using-引入基类重载集合)
- [Abstract classes](#abstract-classes)
- [Protocol / Interface classes](#protocol--interface-classes)
  - [Unix character device 例子](#unix-character-device-例子)

---

## 为什么需要多态

### Ray tracing

在 ray tracing（光线追踪）中，一个场景里会有很多种物体：

- sphere；
- triangle；
- mesh；
- cube；
- 其他复杂几何体。

渲染时，相机会向场景中发出 view ray。光线撞到物体后，需要计算交点、法向、材质、反射方向等信息。

不同物体和光线求交的方法不同：

- 球体有球体的求交算法；
- 三角形有三角形的求交算法；
- mesh 有 mesh 的求交算法。

但对渲染器来说，它希望统一处理：

```cpp
shape->rayIntersect(ray);
```

也就是：

> 场景中的对象都可以被看作 `Shape`，但每种具体 `Shape` 自己实现不同的求交逻辑。

Mitsuba renderer ：

```cpp
// --- <mitsuba/render/shape.h> ---
class Shape : public ConfigurableObject {
public:
    /* ... */
    virtual bool rayIntersect(const Ray &ray, /* ... */) const;
    /* ... */
};
```

这里 `rayIntersect()` 是基类中的 virtual interface。它定义统一接口，具体的形状类负责实现具体算法。

### 绘图程序中的例子

一个图形对象通常包含：

- **Data**
  - `center`
  - 半径、长短轴、宽高等
- **Operations**
  - `render()`
  - `move()`
  - `resize()`

图形之间有自然的继承关系：

```text
Shape
├── Rectangle
│   └── Square
└── Ellipse
    └── Circle
```

语义上：

- `Ellipse is a Shape`
- `Circle is a special Ellipse`
- `Rectangle is another Shape`

它们共享一些公共属性和服务：

- 每个图形都有 `center`；
- 每个图形都可以 `move()`；
- 每个图形都可以 `render()`；
- 每个图形都可以 `resize()`。

但是：

- `move()` 通常只需要修改中心点，对所有形状都类似；
- `render()` 每种形状画法不同；
- `resize()` 每种形状缩放逻辑也可能不同。

所以设计上：

- 共同数据和共同操作放在基类；
- 不同图形差异化的行为定义为 `virtual`，交给派生类实现。

---

## Shape 继承体系

### 基类 `Shape`

`Shape` 负责定义所有图形的共同属性和共同接口：

```cpp
class Point {
    // (x, y) point
};

class Shape {
public:
    Shape();
    virtual ~Shape();

    void move(const Point&);
    virtual void render();
    virtual void resize();

protected:
    Point center;
};
```

重点：

- `center` 是所有图形共有的数据；
- `move()` 对所有图形的逻辑基本一致，所以可以写在基类中；
- `render()` 和 `resize()` 不同图形有不同实现，所以写成 `virtual`；
- 析构函数写成 `virtual ~Shape()`，因为 `Shape` 会被当作多态基类使用。

:::TIP
早期把 `render()` 注释为 `abstract`。从 C++ 语法上说，只有写成 `virtual void render() = 0;` 才是 pure virtual function，类才会变成 abstract class。这里只先强调它是一个需要派生类重新定义的虚接口。
:::

### `Ellipse` 和 `Circle`

`Ellipse` 继承自 `Shape`：

```cpp
class Ellipse : public Shape {
public:
    Ellipse(float major, float minor);
    ~Ellipse();

    virtual void render();

protected:
    float major_axis;
    float minor_axis;
};
```

`Circle` 继承自 `Ellipse`：

```cpp
class Circle : public Ellipse {
public:
    Circle(float radius);
    ~Circle();

    virtual void render();
    virtual void resize();
    virtual float radius();

protected:
    float area;
};
```

也可以简化写成：

```cpp
class Circle : public Ellipse {
public:
    Circle(float radius)
        : Ellipse(radius, radius)
    {}

    virtual void render();
};
```

这里的设计含义：

- `Circle` 是一种特殊的 `Ellipse`；
- 圆的长轴和短轴相等；
- 所以 `Circle(float radius)` 可以直接调用 `Ellipse(radius, radius)` 构造基类部分。

对象布局可以理解为：

```text
Shape object
├── vptr
└── center

Ellipse object
├── vptr
├── center
├── major_axis
└── minor_axis

Circle object
├── vptr
├── center
├── major_axis
├── minor_axis
└── area
```

其中 `vptr` 是实现 `virtual` 的常见隐藏指针，后面单独讲。

---

## `virtual` 与 polymorphic call

### 没有 `virtual` 时：静态绑定

先定义三个类：

```cpp
#include <iostream>
using namespace std;

class Shape {
public:
    void move() {
        cout << "Shape::move()" << endl;
    }

    void render() {
        cout << "Shape::render()" << endl;
    }
};

class Ellipse : public Shape {
public:
    void render() {
        cout << "Ellipse::render()" << endl;
    }
};

class Circle : public Ellipse {
public:
    void render() {
        cout << "Circle::render()" << endl;
    }
};
```

然后用一个函数统一接收 `Shape*`：

```cpp
void serve(Shape* s) {
    s->render();
}

int main() {
    Ellipse e;
    Circle c;

    serve(&e);
    serve(&c);
}
```

此时输出是：

```text
Shape::render()
Shape::render()
```

原因：

- `serve()` 的参数类型是 `Shape*`；
- `s->render()` 中 `s` 的静态类型是 `Shape*`；
- `render()` 不是 `virtual`；
- 编译器按声明类型绑定，所以调用 `Shape::render()`。

这就是 **static binding**。

### 加入 `virtual` 后：动态绑定

把基类中的 `render()` 改成 `virtual`，并在派生类中使用 `override`：

```cpp
#include <iostream>
using namespace std;

class Shape {
public:
    void move() {
        cout << "Shape::move()" << endl;
    }

    virtual void render() {
        cout << "Shape::render()" << endl;
    }
};

class Ellipse : public Shape {
public:
    void render() override {
        cout << "Ellipse::render()" << endl;
    }
};

class Circle : public Ellipse {
public:
    void render() override {
        cout << "Circle::render()" << endl;
    }
};

void serve(Shape* s) {
    s->render();   // polymorphic call
}

int main() {
    Ellipse e;
    Circle c;

    serve(&e);
    serve(&c);
}
```

此时输出变成：

```text
Ellipse::render()
Circle::render()
```

这就是 **polymorphism**：

> 虽然接口都是 `Shape*` 的 `render()`，但真正调用哪个函数由对象的真实类型决定。

### 用 `vector<Shape*>` 统一管理图形

多态最常见的用法是：

> 用基类指针统一管理一组不同派生类对象。

下面这个完整程序：

```cpp
#include <iostream>
#include <vector>
using namespace std;

class Shape {
public:
    virtual ~Shape() = default;

    void move() {
        cout << "Shape::move()" << endl;
    }

    virtual void render() {
        cout << "Shape::render()" << endl;
    }
};

class Ellipse : public Shape {
public:
    void render() override {
        cout << "Ellipse::render()" << endl;
    }
};

class Circle : public Ellipse {
public:
    void render() override {
        cout << "Circle::render()" << endl;
    }
};

void move_and_redraw(const vector<Shape*>& shapes) {
    for (Shape* p : shapes) {
        p->move();      // static binding: Shape::move()
        p->render();    // dynamic binding: real type's render()
    }
}

int main() {
    vector<Shape*> shapes;

    shapes.push_back(new Circle);
    shapes.push_back(new Ellipse);

    move_and_redraw(shapes);

    for (Shape* p : shapes) {
        delete p;
    }
}
```

输出类似：

```text
Shape::move()
Circle::render()
Shape::move()
Ellipse::render()
```

注意：

- `move()` 不是 `virtual`，所以调用 `Shape::move()`；
- `render()` 是 `virtual`，所以根据真实对象类型调用；
- `new` 出来的对象必须 `delete`，否则会内存泄漏；
- 更现代的写法可以用 `std::unique_ptr<Shape>` 避免手动 `delete`。

:::WARNING
如果容器中存的是 `vector<Shape>` 而不是 `vector<Shape*>`，派生类对象会被切片，不能实现多态。多态通常依赖指针或引用。
:::

---

## Static binding vs. Dynamic binding


| 绑定方式 | 含义 | 决定时机 | 依据 |
|---|---|---|---|
| Static binding | call the function of the declared type | 编译期 | 声明类型 / 静态类型 |
| Dynamic binding | call the function of the real type | 运行期 | 实际对象类型 |

例子：

```cpp
Shape* p = new Circle;

p->move();    // 非 virtual：看 p 的声明类型 Shape*
p->render();  // virtual：看 p 实际指向 Circle
```

所以：

```text
非 virtual 函数：静态绑定
virtual 函数：动态绑定
```

前提：

> 动态绑定通常发生在通过基类指针或基类引用调用 virtual function 时。

---

## Virtual destructor

### 为什么基类析构函数要写成 `virtual`

多态类体系中，一个非常重要的规则是：

> 如果一个类可能作为基类被继承，并且可能通过基类指针删除派生类对象，那么基类析构函数必须是 `virtual`。

错误示例：

```cpp
#include <iostream>
using namespace std;

class Shape {
public:
    ~Shape() {
        cout << "~Shape()" << endl;
    }
};

class Ellipse : public Shape {
public:
    ~Ellipse() {
        cout << "~Ellipse()" << endl;
    }
};

int main() {
    Shape* p = new Ellipse;
    delete p;
}
```

如果 `~Shape()` 不是 `virtual`，`delete p` 只会根据 `p` 的静态类型调用 `~Shape()`。派生类析构函数可能不会被调用。

这会导致：

- 派生类资源无法释放；
- 内存、文件、锁等资源泄漏；
- 行为不符合对象真实类型。

正确写法：

```cpp
class Shape {
public:
    virtual ~Shape() {
        cout << "~Shape()" << endl;
    }
};

class Ellipse : public Shape {
public:
    ~Ellipse() override {
        cout << "~Ellipse()" << endl;
    }
};

int main() {
    Shape* p = new Ellipse;
    delete p;
}
```

输出：

```text
~Ellipse()
~Shape()
```

常见简洁写法：

```cpp
class Shape {
public:
    virtual ~Shape() = default;
};
```

### 析构调用链

如果：

```cpp
Shape* p = new Circle;
delete p;
```

并且析构函数是虚的，则调用过程是：

```text
通过 vtable 找到 Circle::~Circle()
执行 Circle 析构函数体
自动继续析构 Ellipse 基类部分
自动继续析构 Shape 基类部分
释放整块内存
```

注意：

> 派生类析构函数执行完后，基类析构函数会被自动调用，不需要手动写 `Shape::~Shape()`。

---

## `virtual` 的底层机制：vptr 与 vtable

:::WARNING
下面讲的是主流编译器的典型实现方式，不是 C++ 标准强制规定的唯一实现。理解它有助于掌握多态的运行时机制，但不要在正常业务代码中依赖这些对象布局细节。
:::

### 对象大小为什么会变大

先看一个普通类：

```cpp
#include <iostream>
using namespace std;

class Base {
private:
    int data = 10;

public:
    void foo() {
        cout << data << endl;
    }
};

int main() {
    Base b;
    cout << sizeof(b) << endl;
}
```

通常输出：

```text
4
```

因为对象里只有一个 `int data`。

加入一个虚函数：

```cpp
#include <iostream>
using namespace std;

class Base {
private:
    int data = 10;

public:
    virtual void bar() {
        cout << "Base::bar()" << endl;
    }

    void foo() {
        cout << data << endl;
    }
};

int main() {
    Base b;
    cout << sizeof(b) << endl;
}
```

在 64-bit 环境下，老师演示中 `sizeof(b)` 变成了：

```text
16
```

原因可以理解为：

```text
Base object
├── vptr      // 8 bytes on 64-bit machine
├── data      // 4 bytes
└── padding   // 4 bytes, for alignment
```

`vptr` 是隐藏指针，指向这个类对应的 **virtual table（vtable，虚函数表）**。

### 同一类对象共享同一张 vtable

如果创建两个 `Base` 对象：

```cpp
Base b1;
Base b2;
```

它们各自对象内部都有一个 `vptr`，但这两个 `vptr` 通常指向同一张 `Base vtable`。

可以理解为：

```text
b1
├── vptr ─┐
└── data  │
          ├── Base vtable
b2        │   ├── &Base::bar0
├── vptr ─┘   └── &Base::bar1
└── data
```

同一个类的对象共享虚函数表，避免每个对象都复制一份函数地址表。

### 派生类有自己的 vtable

两个虚函数：

```cpp
#include <iostream>
using namespace std;

class Base {
private:
    int data = 10;

public:
    virtual void bar0() {
        cout << "Base::bar0()" << endl;
    }

    virtual void bar1(int x) {
        cout << "Base::bar1(" << x << ")" << endl;
    }
};

class Derived : public Base {
private:
    int data_d = 100;

public:
    void bar0() override {
        cout << "Derived::bar0()" << endl;
    }

    void bar1(int x) override {
        cout << "Derived::bar1(" << x << "), data_d = "
             << data_d + x << endl;
    }
};
```

`Base` 和 `Derived` 各有自己的 vtable：

```text
Base vtable
├── &Base::bar0
└── &Base::bar1

Derived vtable
├── &Derived::bar0
└── &Derived::bar1
```

当执行：

```cpp
Base* p = new Derived;
p->bar0();
```

运行时大致发生：

```text
p 指向 Derived 对象
→ 从对象头部找到 vptr
→ 通过 vptr 找到 Derived vtable
→ bar0 对应 vtable 第 0 项
→ 调用 Derived::bar0()
```

这就是 virtual function 能根据真实对象类型动态调用的原因。

### `override` 与函数签名检查

如果派生类没有复写某个虚函数，那么派生类 vtable 对应位置会沿用基类函数地址。

例如：

```cpp
class Derived : public Base {
public:
    void bar0() override {
        cout << "Derived::bar0()" << endl;
    }

    // 没有定义 bar1
};
```

此时可以理解为：

```text
Derived vtable
├── &Derived::bar0
└── &Base::bar1
```

如果本来想复写 `bar1(int)`，但参数写错了：

```cpp
class Derived : public Base {
public:
    void bar1() {
        cout << "Derived::bar1()" << endl;
    }
};
```

这不是 overriding，因为函数签名不同。它只是定义了一个新的函数。

更好的写法是加 `override`：

```cpp
class Derived : public Base {
public:
    void bar1() override {
        cout << "Derived::bar1()" << endl;
    }
};
```

这会编译报错，因为基类没有 `virtual void bar1()` 这个签名可以被覆盖。

所以：

> `override` 的主要价值是让编译器检查：你是否真的覆盖了一个基类虚函数。

### 通过 vtable 手动调用函数

函数指针说明：vtable 里存的确实是函数地址。下面代码是教学实验，不推荐在正常代码中使用：

```cpp
#include <iostream>
using namespace std;

class Base {
public:
    virtual void bar0() {
        cout << "Base::bar0()" << endl;
    }

    virtual void bar1(int x) {
        cout << "Base::bar1(" << x << ")" << endl;
    }
};

class Derived : public Base {
private:
    int data_d = 100;

public:
    void bar0() override {
        cout << "Derived::bar0()" << endl;
    }

    void bar1(int x) override {
        cout << "Derived::bar1(" << x << "), data_d + x = "
             << data_d + x << endl;
    }
};

int main() {
    Derived d;

    // 把对象地址解释为“指向 vptr 的指针”
    void** vptr = *(void***)&d;

    // 取 vtable 的第 1 项，也就是 bar1 的函数地址
    void* f1 = vptr[1];

    // 成员函数底层有隐藏 this 参数
    using Fn = void (*)(Derived*, int);

    Fn func = reinterpret_cast<Fn>(f1);
    func(&d, 20);    // 类似 d.bar1(20)

    d.bar1(20);
}
```

为什么函数指针类型需要写成：

```cpp
using Fn = void (*)(Derived*, int);
```

原因：

> 普通成员函数有一个隐藏的 `this` 指针参数。

所以：

```cpp
d.bar1(20);
```

底层可近似理解为：

```cpp
Derived::bar1(&d, 20);
```

---

## 类型转换与对象切片

派生类到基类的转换：

```text
D is derived from B

D  => B
D* => B*
D& => B&
```

这三种转换的后果不同。

### 派生类对象赋值给基类对象

课件例子：

```cpp
Ellipse elly(20.0f, 40.0f);
Circle circ(60.0f);

elly = circ;
```

此时发生 **object slicing（对象切片）**：

```text
Circle object
├── Ellipse base part
│   ├── center
│   ├── major_axis
│   └── minor_axis
└── Circle own part
    └── area
```

赋值给 `Ellipse` 对象时：

- 只有 `Circle` 中能放进 `Ellipse` 的那部分被复制；
- `Circle` 自己新增的 `area` 被切掉；
- `circ` 的 `vptr` 不会复制到 `elly`；
- `elly` 仍然是 `Ellipse` 对象，它的 `vptr` 仍指向 `Ellipse vtable`。

可以用下面例子理解：

```cpp
#include <iostream>
using namespace std;

class Base {
public:
    int data = 10;

    virtual void bar() {
        cout << "Base::bar(), data = " << data << endl;
    }
};

class Derived : public Base {
public:
    int data_d = 100;

    void bar() override {
        cout << "Derived::bar(), data_d = " << data_d << endl;
    }
};

int main() {
    Base b;
    Derived d;

    b = d;      // object slicing

    b.bar();   // Base::bar()
}
```

虽然 `d` 是 `Derived`，但 `b = d` 后，`b` 仍然是一个 `Base` 对象。

### 指针赋值不会切片，但可能泄漏

例子：

```cpp
Ellipse *elly = new Ellipse(20.0f, 40.0f);
Circle *circ = new Circle(60.0f);

elly = circ;
```

这里不会发生对象切片，因为没有复制对象本身，只是让指针改指向。

但会发生另一个问题：

> 原来 `elly` 指向的那个 `new Ellipse(20.0f, 40.0f)` 丢失了，造成 memory leak。

此时：

```cpp
elly->render(); // Circle::render()
```

如果 `render()` 是 virtual，那么 `elly` 虽然类型是 `Ellipse*`，但实际指向 `Circle` 对象，所以会调用 `Circle::render()`。

更安全的写法应避免裸指针，例如使用智能指针：

```cpp
#include <memory>
#include <vector>
using namespace std;

vector<unique_ptr<Shape>> shapes;
shapes.push_back(make_unique<Circle>(60.0f));
shapes.push_back(make_unique<Ellipse>(20.0f, 40.0f));
```

### 引用参数中的虚函数调用

例子：

```cpp
void func(Ellipse& elly) {
    elly.render();
}

Circle circ(60.0f);
func(circ);
```

引用和指针类似，不复制对象，所以不会切片。

如果 `render()` 是 virtual，那么调用的是：

```text
Circle::render()
```

原因：

- `elly` 的静态类型是 `Ellipse&`；
- 它实际绑定的是 `Circle` 对象；
- `render()` 是 virtual；
- 所以发生 dynamic binding。

### 危险实验：手动复制 vptr


```cpp
Base b;
Derived d;

b = d;  // 正常对象切片，只复制 Base 有效数据，不复制 Derived 的 vptr
```

此时：

```cpp
b.bar();       // 静态绑定，Base::bar()
Base* pb = &b;
pb->bar();     // 动态绑定，但 vptr 仍指向 Base vtable，所以还是 Base::bar()
```

如果手动把 `d` 的 vptr 复制到 `b`：

```cpp
void** pb_vptr = reinterpret_cast<void**>(&b);
void** pd_vptr = reinterpret_cast<void**>(&d);

*pb_vptr = *pd_vptr;  // 强行让 b 的 vptr 指向 Derived vtable
```

那么：

```cpp
pb->bar();     // 可能动态调用 Derived::bar()
```

但这是非法且危险的对象破坏行为。

原因是：

- `b` 的真实内存布局仍然只有 `Base` 部分；
- `Derived::bar()` 会把 `this` 当作 `Derived*` 使用；
- 如果它访问 `data_d`，会读到 `Base` 对象后面不属于它的内存；
- 结果可能是随机数、崩溃或未定义行为。

:::WARNING
这段实验只用于说明 vptr/vtable 与 dynamic binding 的关系。实际程序中不能手动改 vptr，也不能依赖对象内部布局。
:::

---

## Overriding

### `override` 的作用

> `override` redefines the body of a virtual function.

例子：

```cpp
class Base {
public:
    virtual void func();
};

class Derived : public Base {
public:
    void func() override;  // overrides Base::func()
};
```

`override` 的作用：

1. 表明这个函数是为了覆盖基类虚函数；
2. 让编译器检查函数签名是否真的匹配；
3. 避免因为参数、`const`、引用限定等细节写错导致没有真正覆盖。

例如：

```cpp
class Base {
public:
    virtual void func(int);
};

class Derived : public Base {
public:
    void func() override;  // 编译错误：没有覆盖 Base::func(int)
};
```

### 向上调用基类版本

覆盖基类虚函数后，派生类仍然可以主动调用基类版本来复用旧逻辑：

```cpp
#include <iostream>
using namespace std;

class Base {
public:
    virtual void func() {
        cout << "Base::func()" << endl;
    }
};

class Derived : public Base {
public:
    void func() override {
        cout << "Derived::func()" << endl;
        Base::func();
    }
};
```

这种写法表示：

> 在基类行为基础上增加派生类的新功能，不需要复制基类原来的代码。

---

## Return type relaxation

C++ 允许一种特殊的返回类型放宽，称为 **covariant return type（协变返回类型）**。

课件中的规则：

> Suppose `D` is publicly derived from `B`. `D::f()` can return a subclass of the return type defined in `B::f()`.

它只适用于：

- pointer return type；
- reference return type。

例子：

```cpp
class Expr {
public:
    virtual Expr* newExpr();
    virtual Expr& clone();
    virtual Expr self();
};

class BinaryExpr : public Expr {
public:
    virtual BinaryExpr* newExpr();  // ok
    virtual BinaryExpr& clone();    // ok
    virtual BinaryExpr self();      // Error
};
```

解释：

```cpp
virtual Expr* newExpr();
virtual BinaryExpr* newExpr();
```

合法，因为 `BinaryExpr*` 可以转成 `Expr*`。

```cpp
virtual Expr& clone();
virtual BinaryExpr& clone();
```

合法，因为 `BinaryExpr&` 可以转成 `Expr&`。

```cpp
virtual Expr self();
virtual BinaryExpr self();
```

不合法，因为返回值是对象本身，按值返回不支持这种放宽。按值返回还会涉及对象切片问题。

---

## Overloading and virtual

**Overloading** 指同名函数有多个签名：

```cpp
class Base {
public:
    virtual void func();
    virtual void func(int);
};
```

如果派生类只写：

```cpp
class Derived : public Base {
public:
    void func() override;
};
```

那么 `Derived::func()` 会隐藏基类中同名的其他重载版本，例如 `Base::func(int)`。

这和上一讲的 **name hiding** 是同一类问题。

解决方案有两种：

### 覆盖所有重载版本

```cpp
class Derived : public Base {
public:
    void func() override;
    void func(int) override;
};
```

### 用 `using` 引入基类重载集合

```cpp
class Derived : public Base {
public:
    using Base::func;

    void func() override;
};
```

这样 `Base::func(int)` 仍然参与名字查找。

:::TIP
如果一个 virtual function 有多个 overloaded variants，派生类覆盖其中一个时，要检查其他同名重载是否被隐藏。
:::

---

## Abstract classes

**Abstract class（抽象类）** 用来定义接口和约束，不一定提供完整实现。

为什么需要抽象类：

- modeling；
- force correct behavior；
- define interface without defining an implementation。

什么时候使用：

- 基类信息不足，无法给出合理实现；
- 设计目标是 interface inheritance；
- 需要强制派生类实现某些操作。

C++ 中通过 **pure virtual function** 定义抽象类：

```cpp
class Shape {
public:
    virtual ~Shape() = default;

    void move(const Point& p) {
        center = p;
    }

    virtual void render() = 0;   // pure virtual function

protected:
    Point center;
};
```

含义：

- `render()` 没有基类通用实现；
- 任何具体图形都必须实现 `render()`；
- `Shape` 自身不能直接实例化。

例如：

```cpp
Shape s;          // 错误：Shape 是抽象类
Shape* p = new Circle(10.0f);  // 可以：指向具体派生类对象
```

---

## Protocol / Interface classes

> Protocol / Interface class 是一种特殊的 abstract base class。

特征：

- 所有 non-static member functions 都是 pure virtual，析构函数除外；
- 有一个 virtual destructor，通常函数体为空；
- 不含 non-static member variables；
- 可以含 static members。

典型写法：

```cpp
class Interface {
public:
    virtual ~Interface() {}

    virtual void f() = 0;
    virtual void g() = 0;
};
```

### Unix character device 例子

```cpp
class CDevice {
public:
    virtual ~CDevice() {}

    virtual int read(...) = 0;
    virtual int write(...) = 0;
    virtual int open(...) = 0;
    virtual int close(...) = 0;
    virtual int ioctl(...) = 0;
};
```

这个类只定义“设备应该支持哪些操作”，不关心具体设备如何实现：

- keyboard device 可以实现一套；
- terminal device 可以实现一套；
- serial device 可以实现一套；
- file-like device 可以实现一套。

使用者只依赖接口：

```cpp
void use_device(CDevice& dev) {
    dev.open(...);
    dev.read(...);
    dev.close(...);
}
```

这样就能把“使用设备的代码”和“具体设备实现”解耦。

---