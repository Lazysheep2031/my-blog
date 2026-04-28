---
title: Application Development
published: 2026-04-27
description: Application Programs, Web Fundamentals, Servlets, Server-Side Frameworks, Client-Side Code, Application Architectures, Performance, Security, Encryption
tags: [数据库系统]
category: 笔记
draft: true
---

## 概述

这一章的核心是：

> 大多数用户并不直接写 SQL。真实数据库系统通常通过 **application program（应用程序）** 连接用户和数据库：前端负责交互，中间层负责业务逻辑，后端负责访问数据库。

基本链条：

- **Front-end**：用户界面，例如表单、GUI、Web 页面、移动端界面
- **Middle layer**：业务逻辑，例如权限检查、流程控制、规则执行
- **Backend**：数据库访问，例如查询、更新、事务、缓存

这一章讲的是数据库系统如何变成真正可用的应用系统：

- Web 如何把浏览器、服务器和数据库连起来
- Servlet / JSP / PHP / Django 等如何生成动态页面
- JavaScript / AJAX / Web Service 如何让前端更灵活
- MVC、ORM、RAD 如何组织大型应用
- 性能、安全、认证、授权、审计、加密如何保护应用

简单说：

**前几章偏数据库本身，这一章偏“数据库怎么被真实应用使用”。**

---

## 目录

- [概述](#概述)
- [目录](#目录)
- [Application Programs and User Interfaces](#application-programs-and-user-interfaces)
  - [应用程序的作用](#应用程序的作用)
  - [应用架构的演化](#应用架构的演化)
  - [Web Interface](#web-interface)
- [Web Fundamentals](#web-fundamentals)
  - [HTML](#html)
  - [URL](#url)
  - [HTML Form](#html-form)
    - [GET 与 POST](#get-与-post)
  - [Web Server 与 CGI](#web-server-与-cgi)
  - [Two-Layer 与 Three-Layer Web Architecture](#two-layer-与-three-layer-web-architecture)
    - [Three-Layer Web Architecture](#three-layer-web-architecture)
    - [Two-Layer Web Architecture](#two-layer-web-architecture)
  - [HTTP 与 Cookie](#http-与-cookie)
- [Servlets](#servlets)
  - [Servlet 的基本思想](#servlet-的基本思想)
  - [Servlet 示例](#servlet-示例)
  - [Servlet Session](#servlet-session)
  - [Servlet Life Cycle 与 Application Server](#servlet-life-cycle-与-application-server)
- [Server-Side Frameworks](#server-side-frameworks)
  - [Server-Side Scripting](#server-side-scripting)
  - [JSP](#jsp)
  - [PHP](#php)
  - [Django Framework](#django-framework)
- [Client-Side Code and Web Services](#client-side-code-and-web-services)
  - [Client-Side Scripts](#client-side-scripts)
  - [JavaScript](#javascript)
  - [AJAX](#ajax)
  - [Web Services](#web-services)
    - [REST](#rest)
    - [Big Web Services](#big-web-services)
  - [Disconnected Operations](#disconnected-operations)
  - [Mobile Applications 与 PWA](#mobile-applications-与-pwa)
- [Application Architectures](#application-architectures)
  - [Layered Architecture](#layered-architecture)
  - [MVC](#mvc)
  - [Business Logic Layer](#business-logic-layer)
  - [Data Access Layer](#data-access-layer)
  - [Object-Relational Mapping](#object-relational-mapping)
    - [Hibernate](#hibernate)
    - [Microsoft Entity Data Model](#microsoft-entity-data-model)
- [Rapid Application Development](#rapid-application-development)
- [Application Performance](#application-performance)
  - [Server-Side Caching](#server-side-caching)
    - [Connection Pooling](#connection-pooling)
    - [Query Result Caching](#query-result-caching)
    - [Generated HTML Caching](#generated-html-caching)
  - [Client / Proxy Caching](#client--proxy-caching)
  - [扩展到更大规模](#扩展到更大规模)
- [Application Security](#application-security)
  - [SQL Injection](#sql-injection)
    - [Prepared Statement](#prepared-statement)
    - [动态排序字段风险](#动态排序字段风险)
  - [XSS 与 CSRF](#xss-与-csrf)
    - [XSS](#xss)
    - [CSRF / XSRF](#csrf--xsrf)
  - [Password Leakage](#password-leakage)
  - [Application-Level Authentication](#application-level-authentication)
  - [Single Sign-On](#single-sign-on)
    - [SAML](#saml)
    - [OpenID](#openid)
  - [Application-Level Authorization](#application-level-authorization)
  - [Audit Trails](#audit-trails)
  - [Privacy](#privacy)
- [Encryption and Its Applications](#encryption-and-its-applications)
  - [Encryption 的基本性质](#encryption-的基本性质)
  - [Symmetric-Key Encryption](#symmetric-key-encryption)
    - [DES](#des)
    - [AES](#aes)
  - [Public-Key Encryption](#public-key-encryption)
  - [Hybrid Encryption](#hybrid-encryption)
  - [Dictionary Attack 与 Salt](#dictionary-attack-与-salt)
  - [Encryption in Databases](#encryption-in-databases)
    - [Disk Block Level](#disk-block-level)
    - [Relation / Attribute Level](#relation--attribute-level)
    - [Key Management](#key-management)
  - [Challenge-Response Authentication](#challenge-response-authentication)
  - [Digital Signatures](#digital-signatures)
  - [Digital Certificates](#digital-certificates)
- [本章复习抓手](#本章复习抓手)
  - [最容易考的概念](#最容易考的概念)
  - [一句话总结](#一句话总结)

---

## Application Programs and User Interfaces

### 应用程序的作用

大多数数据库用户不会直接使用 SQL。

他们通常通过应用程序访问数据库，例如：

- 学生选课系统
- 银行网银系统
- 航空订票系统
- 电商订单系统
- 大学成绩查询系统

应用程序在用户和数据库之间起中介作用：

```text
User  →  Application Program  →  Database
```

应用程序一般分成三部分：

| 层次 | 作用 | 例子 |
|---|---|---|
| **front-end** | 用户界面 | 表单、GUI、Web 页面、移动端 App |
| **middle layer** | 业务逻辑 | 登录验证、选课规则、权限检查、工作流 |
| **backend** | 数据库交互 | SQL 查询、更新、事务、连接管理 |

前端解决“用户怎么输入和看到结果”。

中间层解决“用户请求是否合理，应该执行什么规则”。

后端解决“数据如何从数据库中取出或写回”。

### 应用架构的演化

应用架构经历了几个阶段：

1. **Mainframe era**：主机时代，用户通过终端连接主机
2. **Personal computer era**：PC 客户端直接连接数据库或局域网服务
3. **Web era**：浏览器通过 Internet 访问 Web 应用服务器
4. **Web and Smartphone era**：浏览器和移动端 App 共同作为主要入口

> **插图占位符：** 插入 slides p.4 的 *Application Architecture Evolution* 图。图中对比 Mainframe Era、Personal Computer Era、Web Era 三种架构：终端连接主机、PC 程序连接局域网数据库、浏览器连接 Web Application Server 再访问数据库。

关键变化：

- 早期用户端很“重”，需要专门安装程序
- Web 时代把浏览器变成通用前端
- 移动互联网时代又加入了 Android / iOS App
- 后端逐渐集中到 application server 和 database server

### Web Interface

Web interface 成为数据库应用的事实标准前端，原因是：

- 用户可以从任何地方访问数据库
- 不需要安装专门客户端程序
- 浏览器天然支持图形化界面
- JavaScript 等脚本可以透明下载并在浏览器运行

典型例子：

- 银行系统
- 航空订票 / 租车预约
- 大学选课与成绩系统
- 电商系统

Web 界面的本质是：

```text
Browser  →  HTTP  →  Web/Application Server  →  Database
```

浏览器给用户看界面；服务器运行应用逻辑；数据库保存数据。

---

## Web Fundamentals

### HTML

Web 是基于 **hypertext（超文本）** 的分布式信息系统。

Web 文档通常用 **HTML（HyperText Markup Language）** 表示。

HTML 文档可以包含：

- 文本和格式说明
- 超链接
- 图片
- 表格
- 表单
- 输入控件

HTML 负责“页面结构与输入界面”。

HTTP 负责“浏览器和服务器之间的通信”。

### URL

在 Web 中，指针的功能由 **URL（Uniform Resource Locator）** 实现。

例子：

```text
http://www.acm.org/sigmod
```

URL 可以拆成三部分：

| 部分 | 含义 |
|---|---|
| `http` | 访问协议，表示使用 HTTP |
| `www.acm.org` | Internet 上机器的唯一名称 |
| `/sigmod` | 机器内部的文档路径或程序路径 |

URL 也可以指向一个程序，并附带参数：

```text
http://www.google.com/search?q=silberschatz
```

含义是：

- 访问 `www.google.com`
- 执行路径为 `/search` 的服务
- 参数是 `q=silberschatz`

这说明 URL 不只可以定位静态文件，也可以触发服务器端程序。

### HTML Form

HTML 不只负责显示，也负责输入。

常见输入方式：

- 下拉菜单
- 单选按钮
- 复选框
- 文本框
- 文件选择框
- 日期 / 时间选择框

slides 中的 HTML 示例同时包含表格和表单：

```html
<html>
<body>
  <table border>
    <tr> <th>ID</th> <th>Name</th> <th>Department</th> </tr>
    <tr> <td>00128</td> <td>Zhang</td> <td>Comp. Sci.</td> </tr>
    <tr> <td>12345</td> <td>Shankar</td> <td>Comp. Sci.</td> </tr>
    <tr> <td>19991</td> <td>Brandt</td> <td>History</td> </tr>
  </table>

  <form action="PersonQuery" method="get">
    Search for:
    <select name="persontype">
      <option value="student" selected>Student</option>
      <option value="instructor">Instructor</option>
    </select> <br>
    Name: <input type="text" size="20" name="name">
    <input type="submit" value="submit">
  </form>
</body>
</html>
```

这里要看懂几个点：

- `<table>` 定义表格
- `<tr>` 定义一行
- `<th>` 定义表头单元格
- `<td>` 定义普通单元格
- `<form>` 定义输入表单
- `action="PersonQuery"` 表示提交后访问服务器上的 `PersonQuery`
- `method="get"` 表示把输入值编码到 URL 中
- `name="persontype"` 和 `name="name"` 是提交给服务器的参数名

> **插图占位符：** 插入 slides p.10 的 *Display of Sample HTML Source* 图。图中显示一个三列表格，以及 Search for 下拉框、Name 输入框和 submit 按钮。

#### GET 与 POST

HTTP 中表单提交常见两种方法：

| 方法 | 特点 | 适合场景 |
|---|---|---|
| **GET** | 参数编码在 URL 中 | 查询、搜索等只读操作 |
| **POST** | 参数放在 HTTP 请求体中 | 更新、提交、上传等可能改变状态的操作 |

重要原则：

> **不要用 GET 执行更新操作。**

因为 GET URL 很容易被图片、链接、脚本触发，可能导致 CSRF 风险。

### Web Server 与 CGI

Web server 不只可以返回静态 HTML 文件，也可以执行程序。

过程如下：

```text
Browser request URL
        ↓
Web server receives request
        ↓
Server executes program identified by URL
        ↓
Program generates HTML
        ↓
Server sends HTML back to browser
```

例如：

```text
/PersonQuery?persontype=student&name=Zhang
```

服务器可以执行 `PersonQuery` 程序，根据参数查询数据库，再生成 HTML 表格返回。

**CGI（Common Gateway Interface）** 是早期 Web server 和 application program 之间的标准接口。

它的作用是：

- Web server 接收 HTTP 请求
- CGI 程序处理请求
- CGI 程序输出 HTML
- Web server 把结果返回给浏览器

CGI 的思想很重要：

**URL 可以映射到一个可执行程序，而不是只能映射到一个文件。**

### Two-Layer 与 Three-Layer Web Architecture

#### Three-Layer Web Architecture

三层 Web 架构：

```text
browser
  ↓ HTTP
web server
  ↓
application server
  ↓
database server
```

特点：

- 浏览器只负责界面
- Web server 负责 HTTP 请求
- Application server 负责业务逻辑
- Database server 负责数据管理

优点：

- 结构清晰
- 安全性更好
- 业务逻辑集中维护
- 更适合大型系统

> **插图占位符：** 插入 slides p.12 的 *Three-Layer Web Architecture* 图。图中 browser 通过 network/HTTP 访问服务器端，服务器内部有 web server、application server、database server 和 data。

#### Two-Layer Web Architecture

两层 Web 架构把 Web server 和 application server 合并：

```text
browser
  ↓ HTTP
web server + application server
  ↓
database server
```

动机：

- 多层间接调用有开销
- 简化部署
- 降低中间层跳转成本

代价：

- 分层边界不如三层清晰
- 大型系统里维护性和扩展性可能下降

> **插图占位符：** 插入 slides p.13 的 *Two-Layer Web Architecture* 图。图中 web server and application server 被放在同一层，下面连接 database server。

### HTTP 与 Cookie

HTTP 是 **connectionless（无连接）** 的协议。

含义是：

- 浏览器发起一次请求
- 服务器返回响应
- 连接关闭
- 服务器默认忘记这次请求

这和 JDBC / ODBC 连接不同：

- JDBC / ODBC 会保持连接直到客户端断开
- HTTP 请求结束后默认不保留连接状态

无连接的好处：

- 减少服务器负载
- 避免服务器长期维护大量连接

问题是：

- 应用需要 session information
- 例如用户登录后，不应该每点一次页面都重新认证

解决方案：**cookie**。

Cookie 是一小段带有识别信息的文本：

1. 用户第一次访问时，服务器把 cookie 发给浏览器
2. 浏览器保存 cookie
3. 之后访问同一服务器时，浏览器自动带上 cookie
4. 服务器用 cookie 找到对应 session 信息

Cookie 可以用于保存：

- session id
- authentication information
- user preferences

Cookie 可以是：

- 临时 cookie：浏览器关闭后失效
- 持久 cookie：保存一段时间

注意：

> Cookie 本身不应该保存敏感明文信息。通常 cookie 里只放 session id，真正的用户状态保存在服务器端。

---

## Servlets

### Servlet 的基本思想

**Servlet** 是运行在 Web/application server 中的 Java 应用程序。

Java Servlet specification 定义了 Web server / application server 和 servlet 程序之间的 API。

Servlet 可以：

- 从 Web form 中读取参数
- 访问数据库
- 生成 HTML 文本
- 把 HTML 返回给浏览器
- 管理 session

基本工作方式：

```text
Browser sends request
        ↓
Application server receives request
        ↓
Find servlet class by URL mapping
        ↓
Create/request thread
        ↓
Servlet executes doGet / doPost
        ↓
Servlet generates response
```

程序员通常写一个继承 `HttpServlet` 的类，并重写：

- `doGet()`
- `doPost()`

Servlet 名称到 servlet class 的映射通常写在 `web.xml` 中。现在很多 IDE 会自动生成。

### Servlet 示例

slides 中的 `PersonQueryServlet` 框架：

```java
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class PersonQueryServlet extends HttpServlet {
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        out.println("<HEAD><TITLE> Query Result</TITLE></HEAD>");
        out.println("<BODY>");

        // BODY OF SERVLET

        out.println("</BODY>");
        out.close();
    }
}
```

核心对象：

| 对象 | 作用 |
|---|---|
| `HttpServletRequest` | 读取浏览器请求，例如表单参数 |
| `HttpServletResponse` | 构造服务器响应 |
| `PrintWriter out` | 输出 HTML 文本 |

处理表单参数的代码：

```java
String persontype = request.getParameter("persontype");
String name = request.getParameter("name");

if (persontype.equals("student")) {
    // 使用 JDBC 查询 student 表
    out.println("<table BORDER COLS=3>");
    out.println("<tr><td>ID</td><td>Name</td><td>Department</td></tr>");

    for (... each result ...) {
        // retrieve ID, name, deptname from ResultSet
        out.println("<tr><td>" + ID + "</td>"
                  + "<td>" + name + "</td>"
                  + "<td>" + deptname + "</td></tr>");
    }

    out.println("</table>");
} else {
    // 类似处理 instructor 查询
}
```

这段程序的逻辑是：

1. 从 request 中取出用户选择的 `persontype`
2. 从 request 中取出输入的 `name`
3. 根据类型查询 student 或 instructor
4. 把查询结果拼成 HTML 表格
5. 返回给浏览器显示

这里的本质是：

```text
HTML form input → servlet parameters → JDBC query → HTML response
```

### Servlet Session

Servlet API 支持 session。

Session 的典型用途是登录状态管理。

检查 session 是否已经存在：

```java
HttpSession session = request.getSession(false);

if (session == null || session.getAttribute("userid") == null) {
    // not logged in
    response.sendRedirect("login.html");
    return;
}

String userid = (String) session.getAttribute("userid");
```

登录成功后创建 session：

```java
HttpSession session = request.getSession(true);
session.setAttribute("userid", userid);
```

读取 session 属性：

```java
HttpSession session = request.getSession(false);
String userid = (String) session.getAttribute("userid");
```

这里要分清：

- `getSession(true)`：如果没有 session，就创建一个
- `getSession(false)`：如果没有 session，就返回 `null`
- `setAttribute()`：把用户信息保存到 session
- `getAttribute()`：从 session 取回用户信息

### Servlet Life Cycle 与 Application Server

Servlet 生命周期由 application server 管理：

1. 第一次请求到来时，加载 servlet class
2. 创建 servlet 实例
3. 调用 `init()` 初始化
4. 每次请求调用 `service()`
5. `service()` 再调用 `doGet()` 或 `doPost()`
6. 不再需要时调用 `destroy()`

重要点：

- 一个 servlet 可以服务多个请求
- application server 通常为每个请求创建一个线程
- 多个请求可以并发执行
- 因此 servlet 中共享变量要注意并发问题

常见 servlet application servers：

- Apache Tomcat
- Glassfish
- JBoss / WildFly
- BEA WebLogic
- IBM WebSphere
- Oracle Application Server

Application server 通常还支持：

- servlet 部署与监控
- 性能统计
- J2EE / Java EE 平台
- 多 application server 并行处理

---

## Server-Side Frameworks

### Server-Side Scripting

Servlet 写动态页面时，经常需要在 Java 代码里拼接大量 HTML 字符串。

这会导致：

- 代码冗长
- 页面结构不直观
- 前端和后端混在一起

**Server-side scripting** 的思想是：

> 在 HTML 文档中嵌入可执行代码或 SQL 查询。服务器收到请求后，先执行其中的代码，再生成真正返回给浏览器的 HTML。

典型 server-side scripting 技术：

- JSP
- PHP
- ASP.NET
- VBScript
- Perl
- Python
- Ruby on Rails

### JSP

**JSP（Java Server Pages）** 允许在 HTML 中嵌入 Java 代码。

slides 示例：

```jsp
<html>
<head> <title> Hello </title> </head>
<body>
<%
if (request.getParameter("name") == null) {
    out.println("Hello World");
} else {
    out.println("Hello, " + request.getParameter("name"));
}
%>
</body>
</html>
```

如果没有输入 `name`：

```text
Hello World
```

如果输入 `name=Zhang`：

```text
Hello, Zhang
```

JSP 的执行逻辑：

```text
JSP page → translated into Servlet → compiled Java code → generates HTML
```

JSP 的优势：

- 静态 HTML 可以直接写在页面里
- 动态部分用 Java 代码生成
- 比纯 servlet 拼字符串更方便

JSP 还支持 **tag library**。

Tag library 可以把常用功能封装成类似 HTML tag 的形式，例如：

- 分页显示大结果集
- 日期格式化
- 表单组件生成
- 控制流标签

### PHP

**PHP** 是常用的服务器端脚本语言。

slides 示例：

```php
<html>
<head> <title> Hello </title> </head>
<body>
<?php
if (!isset($_REQUEST['name'])) {
    echo "Hello World";
} else {
    echo "Hello, " . $_REQUEST['name'];
}
?>
</body>
</html>
```

关键点：

- `<?php ... ?>` 中间是 PHP 代码
- `$_REQUEST['name']` 读取请求参数
- `isset()` 判断参数是否存在
- `echo` 输出 HTML 内容
- `.` 用于字符串拼接

PHP 也有大量库，包括通过 ODBC 访问数据库的库。

### Django Framework

教材补充了 **Django**。

Django 是 Python Web application framework。

它的基本组件包括：

- URL mapping：把 URL 映射到 view function
- view：处理请求，类似 servlet
- template：生成 HTML
- session：管理登录状态
- ORM：把 Python object 映射到数据库表
- form validation：表单生成与输入校验

一个简化的 Django 查询例子：

```python
from django.http import HttpResponse
from django.db import connection


def result_set_to_html(headers, cursor):
    html = "<table border=1>"
    html += "<tr>"
    for header in headers:
        html += "<th>" + header + "</th>"
    html += "</tr>"

    for row in cursor.fetchall():
        html += "<tr>"
        for col in row:
            html += "<td>" + str(col) + "</td>"
        html += "</tr>"

    html += "</table>"
    return html


def person_query_view(request):
    if "username" not in request.session:
        return login_view(request)

    persontype = request.GET.get("persontype")
    personname = request.GET.get("personname")

    if persontype == "student":
        query_tmpl = "select id, name, dept_name from student where name=%s"
    else:
        query_tmpl = "select id, name, dept_name from instructor where name=%s"

    with connection.cursor() as cursor:
        cursor.execute(query_tmpl, [personname])
        headers = ["ID", "Name", "Department Name"]
        return HttpResponse(result_set_to_html(headers, cursor))
```

注意这里的安全点：

```python
cursor.execute(query_tmpl, [personname])
```

参数通过列表传入，而不是直接字符串拼接。

这和 prepared statement 的思想相同，可以降低 SQL injection 风险。

---

## Client-Side Code and Web Services

### Client-Side Scripts

浏览器可以在下载页面时一起下载脚本，并在客户端执行。

常见客户端脚本 / 程序：

- JavaScript
- Adobe Flash / Shockwave
- VRML
- Java Applet（现在基本淘汰）

Client-side code 的作用：

- 让页面变成 active document
- 本地完成输入检查
- 本地动画和交互
- 减少服务器往返次数
- 提升用户体验

安全问题：

- 客户端脚本可能恶意访问本地资源
- 因此浏览器需要 safe mode / sandbox
- Java Applet 不能直接任意系统调用
- 危险动作通常需要用户确认或被禁止

### JavaScript

JavaScript 是现代 Web 应用的核心。

它可以：

- 检查输入是否合法
- 修改当前页面显示内容
- 操作 DOM tree
- 与服务器异步通信
- 在不刷新整个页面的情况下局部更新页面

DOM（Document Object Model）可以理解为：

> 浏览器把 HTML 页面解析成一棵树。JavaScript 可以修改这棵树，从而改变页面显示。

slides 中的表单校验例子：

```html
<html>
<head>
<script type="text/javascript">
function validate() {
    var credits = document.getElementById("credits").value;
    if (isNaN(credits) || credits <= 0 || credits >= 16) {
        alert("Credits must be a number greater than 0 and less than 16");
        return false;
    }
}
</script>
</head>
<body>
<form action="createCourse" onsubmit="return validate()">
    Title: <input type="text" id="title" size="20"><br />
    Credits: <input type="text" id="credits" size="2"><br />
    <input type="submit" value="Submit">
</form>
</body>
</html>
```

这里的逻辑是：

- 用户点击 submit
- 浏览器先执行 `validate()`
- 如果 credits 不是数字，或不在 `(0, 16)` 范围内，就弹窗并返回 `false`
- 返回 `false` 会阻止表单提交

注意：

> 客户端校验只能改善体验，不能替代服务器端校验。

因为攻击者可以绕过浏览器脚本，直接构造 HTTP 请求。

### AJAX

**AJAX** 的核心是：

> JavaScript 在后台向服务器请求数据，然后局部修改当前页面，不需要刷新整个页面。

例子：

- 国家下拉框选择 China
- JavaScript 向服务器请求 China 的省份列表
- 页面自动填充省份下拉框

AJAX 使 Web 页面更接近桌面应用体验，是 Web 2.0 的基础技术之一。

### Web Services

**Web service** 允许 Web 上的数据和功能像远程过程调用一样被访问。

常见两类：

#### REST

**REST（Representational State Transfer）** 使用标准 HTTP 请求执行服务。

基本形式：

```text
Client → HTTP request to URL → Server executes request → Returns XML / JSON
```

返回格式常见为：

- JSON
- XML

RESTful Web Service 常用于：

- 浏览器 JavaScript 调用后端 API
- 移动 App 调用后端 API
- 后端服务之间相互调用
- 地图、语音识别、云存储等外部服务调用

例子：

```text
GET /api/course?course_id=CS101
```

返回：

```json
{
  "course_id": "CS101",
  "title": "Introduction to Computer Science",
  "credits": 4
}
```

#### Big Web Services

Big Web Services 使用更复杂的 XML 表示请求和结果，并在 HTTP 之上构建标准协议层。

特点：

- 请求参数用 XML 编码
- 返回结果也用 XML 编码
- 接口通常有更正式的定义
- 比 REST 重量级

### Disconnected Operations

有些应用需要在断网时继续运行。

例子：

- 学生离线填写申请表，联网后自动提交
- 邮件客户端离线写邮件，联网后发送

HTML5 提供 local storage。

检测浏览器是否支持：

```javascript
if (typeof(Storage) !== "undefined") {
    // browser supports local storage
}
```

基本操作：

```javascript
localStorage.setItem(key, value);
localStorage.getItem(key);
localStorage.removeItem(key);
```

localStorage 的特点：

- 保存 key-value pairs
- 通常有容量限制，例如每个站点约 5MB
- 适合小规模本地状态

如果要存储 JSON object 并按多个属性建立索引，可以使用 **IndexedDB**。

IndexedDB 支持：

- 存储 JSON 对象
- 多属性索引
- schema version
- 数据迁移

### Mobile Applications 与 PWA

教材补充了移动应用开发。

两大主流平台：

- Android
- iOS

移动 App 的优势：

- 可提前下载和安装
- 可针对小屏幕优化
- 可访问摄像头、定位、联系人等设备能力
- 可本地保存数据，支持离线使用
- 编译成本地代码后，性能和能耗可能更好

缺点：

- Android 和 iOS 需要不同平台适配
- 开发和维护成本较高

跨平台方案：

- React Native
- Flutter

**PWA（Progressive Web App）** 试图结合 Web App 和 Mobile App 的优点。

PWA 依赖：

- HTML5 local storage
- JavaScript 编译优化
- service worker
- 后台同步
- 通知推送
- 定位权限

趋势是：

> 一部分传统移动 App 场景可以被 PWA 替代，但高性能、强设备能力依赖的应用仍然需要原生 App。

---

## Application Architectures

### Layered Architecture

大型应用通常分层，以降低复杂度。

常见层次：

| 层 | 作用 |
|---|---|
| **presentation / user-interface layer** | 用户交互、页面显示 |
| **business-logic layer** | 业务规则、工作流、应用语义 |
| **data-access layer** | 连接数据库、执行查询、对象关系映射 |
| **database** | 持久化数据管理 |

请求处理链条：

```text
browser
  ↓
controller
  ↓
model / business logic
  ↓
data-access layer
  ↓
database
  ↓
view
  ↓
browser
```

> **插图占位符：** 插入教材 Figure 9.14 或 slides p.30 的 *Application Architecture* 图。图中展示 browser、controller、view、model、data-access layer、database 之间的请求处理顺序。

### MVC

**MVC（Model-View-Controller）** 是常见应用组织方式。

| 组件 | 作用 |
|---|---|
| **Model** | 业务数据和业务逻辑 |
| **View** | 数据展示方式 |
| **Controller** | 接收事件、调用 model、选择 view |

例如选课系统：

- Model：学生、课程、选课规则
- View：网页表格、移动端列表
- Controller：处理“点击选课”这个事件

MVC 的价值：

- 同一个 model 可以对应多个 view
- 业务逻辑和显示逻辑分开
- 更容易维护大型系统

### Business Logic Layer

Business logic layer 提供业务实体和业务动作的抽象。

大学系统中的实体：

- student
- instructor
- course
- section

大学系统中的动作：

- admit a student
- enroll a student in a course
- assign grades
- process applications

它还负责执行业务规则。

例如：

> 学生只有在完成先修课程、缴清学费后，才能选某门课。

这不是数据库外键能直接表达的规则，需要应用层业务逻辑处理。

Business logic 还包括 **workflow（工作流）**。

例子：学生申请大学：

1. 学生提交申请
2. 初审人员查看材料
3. 推荐信到齐后进入下一步
4. 教师或委员会审核
5. 发 offer 或 rejection
6. 如果某步超时，通知 supervisor

工作流强调：

- 多参与者
- 多步骤
- 顺序控制
- 错误处理
- 超时处理

### Data Access Layer

Data access layer 位于 business logic 和 database 之间。

作用：

- 隐藏数据库连接细节
- 封装 SQL 查询
- 管理结果集
- 管理事务
- 把对象模型映射到关系模型

最简单情况下：

```text
Business logic calls DAO method → DAO executes SQL → returns result
```

更复杂情况下，业务层用 object-oriented model，数据库用 relational model，就需要 ORM。

### Object-Relational Mapping

**ORM（Object-Relational Mapping）** 的目标是：

> 应用程序用对象模型写代码，底层仍然用关系数据库存储数据。

原因是：

- Java / Python / C# 等语言天然使用对象
- 数据库通常使用关系表
- 手写对象和表之间的转换很繁琐、容易出错

ORM 负责自动完成：

- class 到 relation 的映射
- object 到 tuple 的映射
- object attribute 到 table attribute 的映射
- object relationship 到 relation / foreign key 的映射
- 查询对象时生成 SQL
- 保存对象时生成 insert / update

#### Hibernate

Hibernate 是 Java 中常用 ORM 系统。

特点：

- 支持多种数据库
- 支持复杂查询语言
- 查询会被翻译成 SQL
- 支持把 relationship 映射成对象中的集合

例子：

```java
@Entity
public class Student {
    @Id
    String ID;
    String name;
    String department;
    int tot_cred;
}
```

含义：

- `@Entity`：这个 Java class 映射到数据库关系
- `@Id`：`ID` 是主键
- `name`、`department`、`tot_cred` 映射成表中的属性

保存对象：

```java
Session session = getSessionFactory().openSession();
Transaction txn = session.beginTransaction();

Student stud = new Student("12328", "John Smith", "Comp. Sci.", 0);
session.save(stud);

txn.commit();
session.close();
```

ORM 背后会生成相应 SQL，把对象保存到数据库。

#### Microsoft Entity Data Model

Microsoft 的 Entity Data Model 直接向应用提供 entity-relationship model。

它负责：

- 在 entity data model 和底层存储之间映射数据
- 底层存储可以是关系数据库
- Entity SQL 直接操作 Entity Data Model

---

## Rapid Application Development

Web 应用界面开发很费力，尤其是 Web 2.0 时代的富交互界面。

**RAD（Rapid Application Development）** 的目标是提高开发速度。

常见方法：

- 用函数库生成 UI 元素
- IDE 中拖拽创建 UI 元素
- 用 declarative specification 自动生成界面代码
- 根据数据库 schema 或 object model 自动生成 CRUD 界面

CRUD 指：

| 操作 | 含义 |
|---|---|
| **Create** | 创建 |
| **Read** | 读取 |
| **Update** | 更新 |
| **Delete** | 删除 |

典型框架 / 工具：

- Java Server Faces（JSF）
- Ruby on Rails
- ASP.NET
- Visual Studio

ASP.NET / Visual Studio 的特点：

- ASP.NET 提供服务器端 controls
- controls 在服务器端解释并生成 HTML
- Visual Studio 支持 drag-and-drop 开发
- menu、list box 可以绑定 DataSet
- validator controls 可以检查输入约束
- JavaScript 可以在客户端执行约束检查
- 服务器端也必须再次检查约束
- DataGrid 可以方便地表格化显示 SQL 查询结果

注意：

> RAD 可以快速生成应用框架，但复杂业务规则、安全控制、性能优化仍然需要人工设计。

---

## Application Performance

热门 Web 站点的性能压力很大：

- 每天可能有数百万用户访问
- 高峰期可能每秒数千请求
- 数据库可能成为瓶颈

核心思路是：

> 利用请求之间的共性，通过 caching 降低重复计算和数据库访问成本。

常见 caching 技术：

### Server-Side Caching

#### Connection Pooling

JDBC 连接建立成本较高。

如果每次 servlet 请求都新建数据库连接，开销很大。

**Connection pooling** 的思想是：

- 预先维护一组数据库连接
- 请求来时从池中取连接
- 请求结束后把连接归还池
- 连接本身不立即关闭

优点：

- 降低连接创建成本
- 提高吞吐量
- 减少数据库连接压力

#### Query Result Caching

如果多个请求查询相同数据，可以缓存查询结果。

例子：

- 热门商品信息
- 课程列表
- 新闻首页

问题：

> 底层数据库发生变化后，缓存结果必须更新或失效。

否则用户看到的是 stale data。

#### Generated HTML Caching

如果整个 HTML 页面对多个用户相同，可以直接缓存生成好的 HTML。

适合：

- 静态新闻页
- 公共课程介绍页
- 不频繁变化的排行榜

不适合：

- 个性化页面
- 涉及权限和隐私的页面

### Client / Proxy Caching

Web proxy 或浏览器可以缓存页面。

优点：

- 减少服务器请求
- 减少网络延迟

风险：

- 敏感页面不能被公共代理缓存
- 需要正确设置 HTTP cache header

### 扩展到更大规模

当单个数据库无法承受负载时，还需要：

- 并行数据库
- 分布式数据库
- Web service API 后端存储
- 云存储服务
- 多层缓存系统，例如 memcached / Redis

性能优化的关键不是盲目加缓存，而是识别瓶颈：

- 是数据库连接开销？
- 是重复查询？
- 是 HTML 生成成本？
- 是网络传输？
- 是数据库本身无法承载？

---

## Application Security

应用安全要处理 SQL 授权之外的问题。

即使数据库系统本身安全，应用代码写得不好也会导致安全漏洞。

主要问题包括：

- SQL injection
- XSS / CSRF
- password leakage
- authentication
- authorization
- audit trails
- privacy

### SQL Injection

SQL injection 的本质是：

> 用户输入被直接拼接进 SQL 字符串，攻击者就可以把输入伪装成 SQL 代码，让应用执行攻击者构造的语句。

危险写法：

```java
String query = "select * from instructor where name = '" + name + "'";
```

如果用户输入：

```text
X' or 'Y' = 'Y
```

拼接后变成：

```sql
select * from instructor where name = 'X' or 'Y' = 'Y'
```

因为 `'Y' = 'Y'` 永远为真，所以可能返回所有 instructor。

更危险的输入：

```text
X'; update instructor set salary = salary + 10000; --
```

可能导致更新语句被执行。

#### Prepared Statement

正确做法：使用 prepared statement，并把用户输入作为参数。

安全写法：

```java
PreparedStatement pStmt = conn.prepareStatement(
    "select * from instructor where name = ?"
);
pStmt.setString(1, name);
ResultSet rs = pStmt.executeQuery();
```

prepared statement 的作用是：

- SQL 结构先固定
- 用户输入只作为参数值
- 输入中的引号不会变成 SQL 语法

slides 中问到：

```java
conn.prepareStatement(
    "select * from instructor where name = '" + name + "'"
)
```

这不安全。

原因是：

- 虽然调用了 `prepareStatement`
- 但 SQL 字符串已经在调用前完成拼接
- 用户输入已经进入 SQL 语法结构

真正安全的形式必须使用 `?` 占位符。

#### 动态排序字段风险

有些值不能用普通参数占位符，例如排序字段名：

```java
String query = "select * from takes order by " + orderAttribute;
```

这种情况下应该检查白名单：

```java
Set<String> allowed = Set.of("ID", "course_id", "year", "semester");
if (!allowed.contains(orderAttribute)) {
    throw new IllegalArgumentException("invalid order attribute");
}
```

### XSS 与 CSRF

#### XSS

**XSS（Cross-Site Scripting）** 指攻击者把脚本注入到网页中，让其他用户浏览页面时执行恶意脚本。

常见场景：

- 评论区允许用户输入 HTML
- 攻击者输入 `<script>...</script>`
- 其他用户查看评论时脚本被执行

脚本可能：

- 窃取 cookie
- 伪造请求
- 修改页面内容
- 冒充用户执行操作

防御：

- 对用户输入做 HTML escaping
- 禁止或过滤 HTML tags
- 只允许安全白名单标签
- 使用成熟框架提供的 XSS 防护

#### CSRF / XSRF

**CSRF（Cross-Site Request Forgery）** 指攻击者诱导已经登录某网站的用户，在不知情情况下向该网站发起请求。

slides 示例：

```html
<img src="http://mybank.com/transfermoney?amount=1000&toaccount=14523">
```

如果用户已经登录 `mybank.com`，浏览器请求图片时可能自动带上 cookie，从而触发转账。

这个例子虽然简化，因为更新操作通常不该用 GET，但它说明了风险本质。

防御：

- 不用 GET 执行更新
- 检查 `Referer` 是否来自本站合法页面
- session 可绑定原始 IP，降低 cookie 被盗后复用风险
- 使用 CSRF token
- 使用框架提供的 CSRF protection

### Password Leakage

不要把密码以明文形式写在用户可能访问到的脚本中。

风险例子：

- `file.jsp` 正常会被服务器执行
- 但编辑器备份文件 `file.jsp~` 或 `.file.jsp.swp` 可能被当作静态文件下载
- 攻击者可能看到数据库密码

防御：

- 不在脚本里写明文密码
- 使用 application server 的安全配置管理密码
- 限制数据库只接受 application server IP 的连接
- 即使密码泄露，也尽量阻止外部机器直接连数据库

### Application-Level Authentication

**Authentication（认证）** 是确认“你是谁”。

最简单方法是 password。

但单因子密码风险很高：

- 密码可被猜测
- 未加密传输会被 sniffing
- 用户常复用密码
- 电脑可能有 spyware 记录密码

因此关键应用常用 **two-factor authentication（双因素认证）**。

两类因素应该相互独立，例如：

- password + SMS one-time password
- password + one-time password device
- password + smart card

一次性密码设备的思想：

- 设备每分钟生成一个伪随机数
- 用户输入当前数值
- 服务器生成同样序列并验证
- 需要设备和服务器时钟大致同步

但双因素认证不能完全防止 **man-in-the-middle attack**。

攻击者可以伪装成银行网站：

```text
User → Fake site → Real bank site
```

用户把密码和验证码输入 fake site，fake site 立刻转发给真实银行。

解决思路：

- 用户也要认证网站
- 使用 HTTPS
- 使用 digital certificates

### Single Sign-On

**Central authentication** 可以让组织内部多个应用共享认证服务。

常见技术：

- LDAP
- Active Directory

优点：

- 用户不需要在多个系统重复设置密码
- 应用不需要都保存用户密码
- 认证逻辑集中管理

**SSO（Single Sign-On）** 进一步允许：

> 用户认证一次后，多个应用可以通过认证服务验证用户身份，而不要求用户反复输入密码。

相关标准：

- SAML
- OpenID
- OAuth

#### SAML

SAML 用于跨安全域交换认证和授权信息。

例子：

- Yale 用户访问 ACM 资源
- 用户使用 `joe@yale.edu` 登录
- ACM 把用户重定向到 Yale 认证服务
- Yale 认证成功后告诉 ACM：这个用户是谁，有什么权限

#### OpenID

OpenID 允许用户选择外部认证提供者。

例子：

- 应用允许用户选择 Yahoo 作为 OpenID provider
- 用户被重定向到 Yahoo 登录
- Yahoo 认证后把结果返回应用

### Application-Level Authorization

**Authorization（授权）** 是确认“你能做什么”。

SQL 标准授权主要控制：

- 表级权限
- 列级权限
- 角色权限

但应用常需要更细粒度的授权。

例子：

> 学生可以看自己的成绩，但不能看其他学生的成绩。

SQL 标准授权难以直接表达，因为：

1. 数据库通常不知道 Web 应用的最终用户是谁
2. SQL 授权通常不是针对某一行 tuple 的细粒度控制

一种 workaround 是使用 view：

```sql
create view studentTakes as
select *
from takes
where takes.ID = syscontext.user_id();
```

其中 `syscontext.user_id()` 表示应用传给数据库的最终用户身份。

问题：

- 为每种权限建 view 很繁琐
- 应用必须可靠地把 end-user identity 传给数据库
- 查询语义可能被隐藏谓词改变

当前很多系统把授权完全放在 application code 中。

问题是：

- 整个应用代码通常能访问整个数据库
- 攻击面很大
- 某个接口漏写权限检查就可能泄露数据

更好的方向是 **fine-grained / row-level authorization**。

例如 Oracle VPD 可以自动给查询添加谓词：

```sql
ID = sys_context.user_id()
```

这样即使应用代码漏掉检查，数据库层仍然可以阻止越权访问。

### Audit Trails

**Audit trail（审计轨迹）** 是记录用户行为的日志。

应用必须记录：

- 谁进行了更新
- 什么时候更新
- 更新了什么
- 从哪个 IP 发起请求
- 是否访问了敏感数据

审计轨迹用于：

- 检测安全漏洞
- 修复安全事件造成的损害
- 追踪攻击者或误操作用户
- 事后还原事实

审计需要两个层次：

| 层次 | 记录内容 |
|---|---|
| **Database-level audit** | tuple insert / delete / update |
| **Application-level audit** | 业务动作、用户身份、IP、操作上下文 |

数据库级审计通常不足，因为它可能只知道 application server 的数据库账号，不知道最终用户是谁。

应用级审计能记录更接近业务语义的动作。

审计日志本身也要保护：

- 不能被攻击者修改
- 不能被攻击者删除
- 可以复制到独立机器
- 可以用 hash / blockchain-like 技术增强防篡改能力

### Privacy

教材还强调 privacy。

应用经常保存个人数据：

- 姓名
- 地址
- 电话
- 邮箱
- 信用卡号
- 医疗记录
- 身份证件号

隐私保护的难点是：

- 业务需要使用数据
- 用户希望限制数据泄露和滥用
- 法律可能规定哪些数据可以收集、保存、共享

即使去掉姓名，也可能重新识别用户。

例如：

```text
date of birth + postal code
```

在很多情况下可能足以唯一定位一个人。

所以隐私保护不只是删除姓名，还要考虑外部数据结合后的 re-identification 风险。

---

## Encryption and Its Applications

### Encryption 的基本性质

**Encryption（加密）** 是把数据转换成不可读形式。

**Decryption（解密）** 是把加密数据还原。

加密算法通常使用：

- encryption key
- decryption key

好的加密技术应满足：

1. 授权用户加密和解密相对容易
2. 安全性依赖 key，而不是依赖算法保密
3. 攻击者即使看到密文，也极难推出 key

也就是说：

> 算法可以公开，key 必须保密。

### Symmetric-Key Encryption

**Symmetric-key encryption（对称加密）** 使用同一个 key 加密和解密。

```text
plaintext --encrypt with K--> ciphertext
ciphertext --decrypt with K--> plaintext
```

特点：

- 加解密速度快
- 适合大量数据
- key 必须安全共享

典型算法：

- DES
- AES

#### DES

**DES（Data Encryption Standard）** 是较早的对称加密标准。

它根据 key 对字符进行替换和重排。

问题是：

- key 需要传给授权用户
- 安全性不超过 key 传输机制的安全性
- 现在已经不够安全

#### AES

**AES（Advanced Encryption Standard）** 是替代 DES 的标准。

特点：

- 基于 Rijndael algorithm
- 使用 shared secret key
- 支持 128 / 192 / 256 bit key
- 现代系统广泛使用

### Public-Key Encryption

**Public-key encryption（公钥加密 / 非对称加密）** 使用两个 key：

| key | 是否公开 | 作用 |
|---|---|---|
| **public key** | 公开 | 加密 |
| **private key** | 私有 | 解密 |

过程：

```text
Sender uses receiver's public key to encrypt
Receiver uses own private key to decrypt
```

优点：

- public key 可以公开发布
- private key 不需要传输
- 解决了对称加密中“如何安全传 key”的问题

典型算法：

- RSA

RSA 的安全性基于：

> 对一个很大的整数做质因数分解非常困难。

大致思想：

- public key 包含两个大素数的乘积
- private key 包含这两个素数本身
- 知道乘积很难反推出两个素数

### Hybrid Encryption

Public-key encryption 安全，但计算成本高。

Symmetric-key encryption 快，但 key 分发困难。

因此实际系统常用混合方案：

1. 随机生成一个对称密钥
2. 用 public-key encryption 安全传输这个对称密钥
3. 后续大量数据用 symmetric-key encryption 加密

HTTPS 就采用类似思想。

### Dictionary Attack 与 Salt

加密小范围值时可能遭受 **dictionary attack**。

例子：生日字段。

如果攻击者看到某个加密值 `e`，可以尝试把所有可能日期逐个加密，直到某个结果等于 `e`。

即使没有 key，也可能通过频率推断。

例如：

- 年龄 18 出现频率最高
- 出现频率最高的密文可能对应 18

防御方法：添加随机 bits。

这些随机 bits 常称为：

- salt bits
- initialization vector

效果：

- 同一个明文每次加密得到不同密文
- 阻止简单字典攻击
- 降低频率分析效果

密码存储中常见做法：

```text
password_hash = hash(password + salt)
```

数据库中存储：

```text
(user, salt, password_hash)
```

不要存明文密码。

### Encryption in Databases

数据库可以在不同层次加密。

#### Disk Block Level

最底层：加密磁盘块。

```text
disk block encrypted on disk
        ↓ read
DBMS decrypts block in memory
        ↓ use normally
```

优点：

- 对应用透明
- 保护磁盘被盗、备份泄露等场景

局限：

- DBMS 运行时能看到明文
- 如果攻击者拿到 DBMS 权限，仍可能访问数据

#### Relation / Attribute Level

可以加密整张表，或某些敏感属性。

例如：

- credit_card_number
- national_id
- fingerprint
- signature

优点：

- 非敏感属性可以不加密
- 粒度更细

限制：

- 参与 primary key / foreign key 的属性通常不适合直接加密
- 加密后比较、排序、索引会变困难

#### Key Management

通常使用：

- master key 保护多个 data encryption keys
- data encryption keys 存在数据库中
- master key 存在应用或用户侧

另一种方式：

> 应用在把数据发给数据库前先加密，取回后再解密。

优点：数据库看不到明文。

缺点：

- 应用修改成本高
- 查询和索引能力受限
- key management 更复杂

### Challenge-Response Authentication

密码认证的问题是：密码可能在网络上传输时被 sniffing。

**Challenge-response** 避免直接传密码。

对称密钥版本：

1. 数据库发送随机 challenge string
2. 用户用 secret password / key 加密 challenge
3. 用户返回加密结果
4. 数据库用同一 key 解密并验证

公钥版本：

1. 数据库用用户 public key 加密 challenge
2. 用户用 private key 解密
3. 用户返回解密结果
4. 数据库验证返回值

优点：

- 密码不在网络上传输
- 可以降低 sniffing 风险

Smart card 可以保存 private key。

它的关键价值是：

- private key 不可被读出
- 只允许把数据发给卡片做加密 / 解密

### Digital Signatures

**Digital signature（数字签名）** 用于验证数据真实性。

它使用 public-key encryption 的反向角色：

```text
Sender signs with private key
Anyone verifies with sender's public key
```

作用：

- 证明数据确实由 private key 持有者生成
- 防止发送者事后否认

第二点叫：

**nonrepudiation（不可否认性）**。

直观类比：

- 纸质世界里，签名证明文件来自某个人
- 电子世界里，数字签名证明数据来自某个 private key 持有者

### Digital Certificates

问题：

> 浏览器拿到某个网站的 public key，怎么知道这个 public key 真的属于这个网站？

解决方案：**digital certificate（数字证书）**。

数字证书由 **certification authority（CA）** 签发。

基本机制：

1. 浏览器内置少数 root CA 的 public key
2. 网站把自己的 URL 和 public key 交给 CA 签名
3. CA 签名后的文档就是 certificate
4. 浏览器用 CA 的 public key 验证 certificate
5. 如果验证通过，浏览器相信该 public key 属于该网站

CA 可以多级：

```text
Root CA
  ↓ signs
Intermediate CA
  ↓ signs
Website certificate
```

每一级 CA 用自己的 private key 签发下一级证书。

浏览器递归验证证书链，直到 root CA。

HTTPS 使用 digital certificates：

- 网站向浏览器提供证书
- 浏览器验证证书
- 证书通过后，浏览器使用网站 public key 建立安全通信
- 实际大量数据通常再切换到一次性 symmetric key 加密

Digital certificate 解决的是：

> 如何确认对方的 public key 可信。

---

## 本章复习抓手

这章内容多，但主线很清楚：

```text
用户不直接访问数据库
        ↓
应用程序作为中介
        ↓
Web / Mobile 前端负责交互
        ↓
Application Server 负责业务逻辑
        ↓
Database Server 负责数据存取
        ↓
安全、性能、加密贯穿整个系统
```

### 最容易考的概念

- front-end / middle layer / backend
- URL 的组成
- HTML form 的 `action` 和 `method`
- GET 和 POST 的区别
- HTTP connectionless 的含义
- cookie 和 session 的关系
- servlet 的 `doGet` / `doPost`
- JSP / PHP 的 server-side scripting 思想
- JavaScript 和 AJAX 的作用
- MVC 三个组成部分
- ORM 的目的
- Hibernate 的基本映射思想
- REST 和 Big Web Services 的区别
- connection pooling 和 caching
- SQL injection 的原理和 prepared statement 防御
- XSS 和 CSRF 的区别
- two-factor authentication
- SAML / OpenID / OAuth 的基本用途
- application-level authorization 的困难
- audit trail 的作用
- symmetric-key 与 public-key encryption
- DES / AES / RSA
- salt bits 的作用
- challenge-response
- digital signature 与 digital certificate

### 一句话总结

> Application development 这一章讲的是：如何把数据库封装成真实可用、可访问、可扩展、可保护的应用系统。
