---
title: 大语言模型
published: 2026-04-28
description: 从通用基座到垂直领域大模型
tags: [人工智能基础]
category: 笔记
draft: true
---

## 概述

**Large Language Model（大语言模型，LLM）** 。

> **计算机无法直接理解人类语言，那么它如何把语言变成数字、学习语言规律，并进一步生成符合人类需求的回答？**

主线：

- 先说明为什么语言对人工智能重要：知识主要通过文字记录，思维也常以语言表达；
- 再讲计算机如何表示语言：从 **One-Hot Encoding（独热编码）** 到 **Word Embedding（词向量）** ；
- 然后进入序列建模：从 **Sequence-to-Sequence Model（序列到序列模型）** 到 **Attention Mechanism（注意力机制）** ；
- 接着讲 Transformer：它如何通过 **Encoder（编码器）、Decoder（解码器）、Self-Attention（自注意力）、Cross-Attention（交叉注意力）** 处理文本序列；
- 再讲 **LLM** 训练流程： **Pretraining（预训练） → Supervised Fine-Tuning（有监督微调，SFT） / Instruction Tuning（指令微调） → Reward Modeling（奖励建模，RM） → Reinforcement Learning（强化学习，RL）** ；
- 最后讨论垂直领域大模型：通用基座模型如何迁移到医疗、金融、法律、教育等专业领域。

> **LLM = 用海量文本训练出的概率预测模型，通过 Transformer 架构学习上下文关系，再通过Instruction Tuning和人类反馈对齐到人类需求。**

---

## 目录

- [概述](#概述)
- [为什么语言对人工智能重要](#为什么语言对人工智能重要)
- [计算机如何理解语言](#计算机如何理解语言)
- [从 **Sequence-to-Sequence Model** 和 **Attention Mechanism**](#从-sequence-to-sequence-model-和-attention-mechanism)
- [**Language Model（语言模型，LM）** 与 **LLM**](#lm-与-llm)
- [Transformer](#transformer)
- [**LLM** 的发展历程](#llm-的发展历程)
- [**LLM** 训练流程](#llm-训练流程)
- [通用基座模型与垂直领域大模型](#通用基座模型与垂直领域大模型)
- [大模型的前景与挑战](#大模型的前景与挑战)

---

## 为什么语言对人工智能重要

语言是人类表达思想、记录知识和进行社会协作的核心工具。

人类的很多知识主要以文字形式保存，直接以图像、动作或数字形式存在的只是一部分：

- 书籍；
- 百科；
- 论文；
- 网页；
- 对话；
- 代码注释；
- 法律、医学、金融等专业文档。

所以，如果人工智能想要获取人类知识，就必须能处理人类语言。

但人类语言有几个特点：

1. **不精确**
   - 同一句话可能有不同解释；
   - 同一个词在不同语境中意思不同。

2. **有歧义**
   - 例如“苹果”可以指水果，也可以指公司。

3. **依赖上下文**
   - “它”指代什么，必须看前后文。

4. **表达混乱但仍可理解**
   - 人类对话中常有省略、口语、错误表达，但人仍能推断含义。

因此，语言智能的核心问题要超出查词典，关键在于：

> **理解词语本身、词语之间的关系，以及词语在上下文中的动态含义。**

---

## 计算机如何理解语言

### 计算机只能处理数字

计算机不能直接处理“猫”“cat”“项庄舞剑”这样的自然语言符号。

它只能处理数字，所以语言进入模型之前必须完成数字化。

图像数字化比较直观：

- 图片可以看成像素矩阵；
- 每个像素有灰度值或 RGB 值；
- 图像就被转成了数字矩阵。

语言数字化更困难，因为词语是离散符号，单词之间还存在复杂语义关系。

例如：

- “猫”和“cat”在不同语言中指向相同概念；
- “king - man + woman ≈ queen”体现 **Word Embedding** 中的语义方向；
- “中国 - 北京”和“法国 - 巴黎”具有国家—首都关系。

> **语言数字化的目标，不只是给每个词一个编号，还要让数字表示能反映语义关系。**


### **One-Hot Encoding**

**One-Hot Encoding** 是最简单的语言数字化方法。

假设词汇表为：

```text
[apple, banana, dog, cat, elephant]
```

那么可以表示为：

```text
apple    = [1, 0, 0, 0, 0]
banana   = [0, 1, 0, 0, 0]
dog      = [0, 0, 1, 0, 0]
cat      = [0, 0, 0, 1, 0]
elephant = [0, 0, 0, 0, 1]
```

每个词对应一个唯一位置。

### **One-Hot Encoding** 的特点

1. 唯一性

每个词都有唯一编码，不会混淆。

2. 稀疏性

如果词汇表有 10000 个词，那么每个 one-hot 向量就是 10000 维，其中只有一个位置是 1，其余 9999 个位置都是 0。

这种向量称为 **Sparse Vector（稀疏向量）** 。

3. 不能表达语义关系

在 **One-Hot Encoding** 里，不同词之间互相正交。

例如：

- apple 和 banana 都是水果；
- apple 和 dog 的语义距离明显更远。

但在 one-hot 表示中：

$$
\text{sim}(apple, banana) = 0
$$

$$
\text{sim}(apple, dog) = 0
$$

它无法表达“apple 与 banana 更相似”。

4. 维度随词汇表变大

词汇表越大，向量维度越高，存储和计算效率越低。

所以 **One-Hot Encoding** 只解决了“把词变成数字”的问题，没有解决“把语义变成数字”的问题。

### **Word Embedding**

**Word Embedding** 用连续的低维或中高维向量表示词语。

与 one-hot 不同， **Word Embedding** 希望满足：

- 语义相近的词，向量位置接近；
- 语义关系相似的词，向量方向关系相似；
- 模型可以通过向量计算捕捉语义结构。

例如：

- apple 和 banana 都是水果，向量应更接近；
- man 和 woman 都与人类相关，但具有性别方向差异；
- king 和 queen 在“王权”语义上相近，在性别方向上不同。

**Word Embedding** 的直观理解：

> **Word Embedding是把词放进一个语义空间里，让词与词之间的关系可以通过距离、方向和位置来表达。**


### 衡量 **Word Embedding** 相似性的两种方式

1. **Euclidean Distance（欧氏距离）**

**Euclidean Distance** 衡量两个向量在空间中的直线距离：

$$
d(A,B)=\sqrt{\sum_{i=1}^{n}(A_i-B_i)^2}
$$

含义：

- 距离越小，两个向量越接近；
- 距离越大，两个向量差异越大。

适合关心“绝对位置差异”的场景。

2. **Cosine Similarity（余弦相似度）**

**Cosine Similarity** 衡量两个向量夹角的余弦值：

$$
\cos(A,B)=\frac{A\cdot B}{\|A\|\|B\|}
$$

含义：

- 只关心方向是否相似；
- 不太关心向量长度；
- 常用于文本相似度、语义相似度。

:::TIP
在 **Natural Language Processing（自然语言处理）** 中， **Cosine Similarity** 通常比 **Euclidean Distance** 更常用，因为语义更像“方向关系”，而不完全是空间中的绝对距离。
:::

---

## 从 **Sequence-to-Sequence Model** 和 **Attention Mechanism**

### 语言任务通常是序列到序列任务

很多自然语言任务都可以看成 **从一个序列到另一个序列的转换** 。

例如：

| 任务 | 输入序列 | 输出序列 |
|---|---|---|
| 机器翻译 | How are you | 你怎么样 |
| 智能问答 | 问题文本 | 回答文本 |
| 摘要生成 | 长文章 | 短摘要 |
| 代码生成 | 自然语言需求 | 代码 |
| 对话系统 | 用户消息 | 回复消息 |

**LLM** 的输入和输出也都是文本序列。

### 早期 **Sequence-to-Sequence Model**

经典的 **Sequence-to-Sequence Model** 通常包含两个部分：

1. **Encoder**
   - 读取输入序列；
   - 把输入压缩成一个内部表示。

2. **Decoder**
   - 根据内部表示；
   - 逐步生成目标序列。

例如把英文翻译成中文：

```text
How are you  →  Encoder  →  内部表示  →  Decoder  →  你怎么样
```

这种结构的思想很清晰：

> **先理解输入，再生成输出。**

但早期 **seq2seq** 的问题也明显：如果所有输入信息都压缩进一个固定维度向量，长句子中的细节容易丢失。

### **Attention Mechanism**

同一个词在不同上下文中含义不同。

经典例子：

```text
The animal didn't cross the street because it was too tired.
```

这里的 it 指代 animal。

```text
The animal didn't cross the street because it was too wide.
```

这里的 it 指代 street。

两个句子只有最后一个形容词不同，但 it 的指代对象完全不同。

这说明：

- 词语的意义不是固定的；
- 一个词要从上下文中吸收信息；
- 不同上下文词对当前词的重要性不同。

于是产生了 **Attention Mechanism（attention）** 。

### **Self-Attention**

**Self-Attention** 用来建模同一个序列内部不同 **token（词元）** 之间的关系。

直观理解：

> **序列中的每个 token 都会观察同一句话中的其他 token，并根据重要程度吸收信息。**

例如在句子中处理 it 时：

- 如果后文是 tired，模型应更多关注 animal；
- 如果后文是 wide，模型应更多关注 street。

数学上，可以把当前 **token** 的新表示理解为其他 **token** 表示的加权平均：

$$
h_i' = \sum_j \alpha_{ij} h_j
$$

其中：

- $h_i$：第 $i$ 个 **token** 原来的表示；
- $h_i'$：吸收上下文后的新表示；
- $\alpha_{ij}$：第 $i$ 个 **token** 对第 $j$ 个 **token** 的注意力权重；
- 权重越大，说明第 $j$ 个 **token** 对第 $i$ 个 **token** 越重要。

在 Transformer 的标准形式中，注意力可以写成：

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

其中：

- $Q$ 是 Query，表示“我想找什么信息”；
- $K$ 是 Key，表示“我有什么信息可供匹配”；
- $V$ 是 Value，表示“真正要被取走的信息内容”；
- $\sqrt{d_k}$ 用于缩放，避免点积过大导致 softmax 过于尖锐。

:::TIP
**Self-Attention** 解决的是“同一句话内部谁和谁更相关”的问题。它让同一个词在不同语境下得到不同表示。
:::


### **Cross-Attention**

**Cross-Attention** 用来建模两个不同序列之间的关系。

**Self-Attention** 关注的是：

```text
同一序列内部 token 与 token 的关系
```

**Cross-Attention** 关注的是：

```text
目标序列 token 与源序列 token 的关系
```

机器翻译中最典型。

例如：

```text
源句子：I just want to have a sister.
目标句子：Je veux juste avoir une sœur.
```

当模型生成法语中的 `une sœur` 时，需要知道源句子里的 `sister` 是女性名词，因此目标语言中的冠词应与其性别保持一致。

**Cross-Attention** 的作用就是：

> **在生成目标语言的某个词时，回头查看源语言中最相关的词。**

:::TIP
**Self-Attention** 负责“看自己这句话内部”， **Cross-Attention** 负责“生成时看另一句话的信息”。
:::


### **Attention Mechanism** 的直观类比

**Attention Mechanism** 类似人类翻译或阅读时的行为：

- 翻译时不会平均关注每个词；
- 会根据当前要翻译的内容，重点看输入句子中的相关部分；
- 看图说话时，生成“dog”时关注狗的位置，生成“people”时关注人群的位置。

所以它被称为“注意力”。

---

## **LM** 与 **LLM**

### 什么是 **LM**

**LM** 的目标是建模自然语言序列的概率分布。

给定词汇表 $V$，一个句子可以写成：

$$
w_1,w_2,\ldots,w_m
$$

**LM** 要估计：

$$
P(w_1,w_2,\ldots,w_m)
$$

它表示这个词序列作为一句话出现的可能性。

一个好的 **LM** 应该能判断：

```text
我 今天 去 上课
```

比：

```text
上课 去 我 今天
```

更像自然语言。

### 直接建模联合概率为什么困难

如果词汇表大小是 $|V|$，句子长度是 $m$，那么可能的词序列数量是：

$$
|V|^m
$$

如果词汇表约 7 万个词，句子长度按 20 个词计算，可能组合数量达到天文规模。

所以直接对每个完整句子建模不可行。

### 链式法则分解

为降低建模难度，可以用概率链式法则：

$$
P(w_1,w_2,\ldots,w_m)=\prod_{i=1}^{m}P(w_i\mid w_1,w_2,\ldots,w_{i-1})
$$

这意味着句子可以被看成从左到右逐词生成：

1. 先生成 $w_1$；
2. 再根据 $w_1$ 生成 $w_2$；
3. 再根据 $w_1,w_2$ 生成 $w_3$；
4. 依此类推，直到生成完整句子。

这就是现代自回归 **LM** 的基本思想。

> **LM的核心任务：根据已有上下文，预测下一个 token。**

### **LLM** 是什么

**LLM** 是大规模 **Neural Network（神经网络）**  **LM**。

它通常具有以下特征：

- 参数规模大，通常从数十亿到数千亿甚至更高；
- 使用海量无标注文本进行自监督 **Pretraining**；
- 主要基于 Transformer 架构；
- 具有强大的文本理解、生成、问答、摘要、翻译、代码生成和对话能力；
- 可以通过 **Prompt（提示词）** 完成许多下游任务。

**LLM** 的能力来自三个方面：

> **数据是燃料，模型是引擎，算力是加速器。**

| 要素 | 作用 | 类比 |
|---|---|---|
| 数据 | 提供语言和知识材料 | 学习资料 |
| 模型 | 定义如何吸收、表示和生成信息 | 思考方法 |
| 算力 | 支撑大规模训练和推理 | 大脑运算速度 |

### **Scaling Laws（缩放法则）**

**LLM** 的发展中，一个重要经验规律是 **Scaling Laws** 。

它指出模型性能通常受三类规模影响：

1. **参数数量** ；
2. **训练数据规模** ；
3. **训练计算量** 。

在一定范围内，增加参数、数据和计算量会稳定提升模型性能。

这解释了为什么近年来大模型持续向“大数据、大模型、大算力”方向发展。

:::TIP
**Scaling Laws** 不是说模型越大一定越好。它的关键含义是：在数据、参数、计算量合理匹配时，扩大规模通常能带来可预测的性能提升。
:::

---

## Transformer

### Transformer 为什么重要

Transformer 是一种基于 **Attention Mechanism** 的 **Neural Network** 架构，由 Vaswani 等人在 2017 年提出。

它成为 **LLM** 核心架构的原因主要有三点：

1. **能建模长距离依赖**
   - 通过 **Attention Mechanism**，一个 **token** 可以直接关注远处 **token**；
   - 不像 **Recurrent Neural Network（循环神经网络，RNN）** 那样必须一步一步传递信息。

2. **训练可以高度并行**
   - **RNN** 受时间步顺序限制；
   - Transformer 可以同时处理序列中多个位置。

3. **扩展性强**
   - 可以堆叠很多层；
   - 可以扩大隐藏维度、注意力头数、参数规模；
   - 适合训练超大规模 **LM**。

### Transformer 的基本结构

原始 Transformer 主要包含两部分：

1. **Encoder**
   - 处理输入序列；
   - 得到上下文化的内部表示。

2. **Decoder**
   - 根据 **Encoder** 输出和已生成 **token**；
   - **Autoregressive Generation（自回归生成）** 目标序列。

机器翻译任务中：

```text
英文句子 → Encoder → 内部表示 → Decoder → 德文句子
```

但在很多现代模型中， **Encoder** 和 **Decoder** 可以单独使用：

| 模型结构 | 代表模型 | 主要任务 |
|---|---|---|
| Encoder-only | BERT、RoBERTa | 文本理解、分类、命名实体识别 |
| Decoder-only | GPT 系列、LLaMA | 文本生成、对话、代码生成 |
| Encoder-Decoder | T5、BART | 翻译、摘要、文本重写 |

### Tokenizer：把文本变成 **token** 编号

Transformer 不能直接处理文字，输入文本要先经过 **Tokenizer** 。

Tokenizer 通常做三件事。

**1. 分词**

把句子拆成 **token**。

例如：

```text
A little girl is looking at a black dog.
```

可以被拆成：

```text
['A', 'little', 'girl', 'is', 'looking', 'at', 'a', 'black', 'dog', '.']
```

实际模型中， **token** 未必等于单词。它可以是：

- 一个词；
- 一个子词；
- 一个字符；
- 一个标点；
- 一个特殊符号。

**2. 数字化**

根据词表把 **token** 映射成数字编号。

例如：

```text
['A', 'little', 'girl'] → [6, 61, 33]
```

**3. 加入特殊 token**

常见特殊 **token**：

| 特殊 **token** | 含义 |
|---|---|
| `<bos>` | 序列开始 |
| `<eos>` | 序列结束 |
| `<pad>` | 填充 |
| `<unk>` | 未知 **token** |

例如：

```text
[6, 61, 33, 10, 56, 20, 4, 26, 34, 5]
```

加入 `<bos>` 和 `<eos>` 后变成：

```text
[2, 6, 61, 33, 10, 56, 20, 4, 26, 34, 5, 3]
```

### Input Embedding：把 **token** 编号变成向量

**token** 编号只是离散数字，不能直接表达语义。

因此模型会把每个 **token** 编号映射为一个向量，这一步叫 **Input Embedding** 。

例如课件中用 Transformer 默认 512 维作为例子：

- 输入序列长度为 12；
- 每个 **token** 被映射为 512 维向量；
- 最终得到一个 $12 \times 512$ 的矩阵。

这可以理解为：

```text
每个 token → 一个高维语义向量
```

### 位置编码：让模型知道顺序

**Attention Mechanism** 本身不天然知道 **token** 的先后顺序。

例如，如果只看一组 **Word Embedding**，模型不一定知道：

```text
武松打虎
```

和：

```text
虎打武松
```

顺序不同、含义完全不同。

所以 Transformer 需要加入 **位置编码（positional encoding / positional embedding）** 。

输入给 Transformer 的表示通常是：

$$
\text{Transformer Embedding} = \text{Token Embedding} + \text{Position Embedding}
$$


### **Encoder** 的工作方式

**Encoder** 的任务是把输入序列变成更好的内部表示。

流程：

1. 输入 **token** 经过 embedding；
2. 加入位置编码；
3. 经过多个 **Encoder** Layer；
4. 每层都执行 **Self-Attention**；
5. 每个 **token** 都从其他 **token** 中吸收上下文信息；
6. 最终得到上下文化表示。

对于输入句子中的每个 **token**， **Encoder** 会让它“参考”整个输入句子。

所以 **Encoder** 中的 **Self-Attention** 通常是双向的：

```text
每个 token 可以看到前面和后面的 token
```

这适合文本理解任务。

### **Decoder** 的工作方式

**Decoder** 的任务是生成输出序列。

它是 **Autoregressive Generation** 的：

```text
第 1 步：生成第 1 个 token
第 2 步：根据已生成 token 生成第 2 个 token
第 3 步：根据已生成 token 生成第 3 个 token
...
```

例如翻译：

```text
输入：A little girl is looking at a black dog.
输出：Ein kleines Mädchen schaut einen schwarzen Hund an.
```

生成过程是：

```text
<bos> → Ein
<bos> Ein → kleines
<bos> Ein kleines → Mädchen
<bos> Ein kleines Mädchen → schaut
...
```

**Decoder** 中有两种注意力：

1. **Masked Self-Attention**
   - 目标序列内部 **Self-Attention**；
   - 只能看已经生成的 **token**；
   - 不能偷看未来 **token**。

2. **Cross-Attention**
   - 目标序列查看 **Encoder** 输出；
   - 用于从源序列中获取信息。

### Transformer 整体流程

对于原始 Encoder-Decoder Transformer，可以总结为：

1. 输入文本经过 Tokenizer，变成 **token** 编号；
2. **token** 编号经过 Input Embedding，变成向量；
3. 向量加上位置编码；
4. **Encoder** 通过 **Self-Attention** 得到输入序列的内部表示；
5. **Decoder** 从 `<bos>` 开始 **Autoregressive Generation**；
6. **Decoder** 每一步通过 masked **self-attention** 看已生成内容；
7. **Decoder** 通过 **cross-attention** 看 **Encoder** 的输入表示；
8. **Generator（生成器）** / Linear + Softmax 输出下一个 **token** 的概率分布；
9. 选出下一个 **token**，继续迭代直到 `<eos>`。

---

## **LLM** 的发展历程

**LLM** 发展粗略分为三个阶段。

1. 基础模型阶段：2018—2021 年

这一阶段主要研究 **LM** 本身。

关键节点：

- 2017 年：Transformer 架构提出；
- 2018 年：BERT 和 GPT-1 出现，开启 **Pretraining**  **LM** 时代；
- 2019 年：GPT-2 发布，参数量 15 亿；T5 发布，参数量达到 110 亿级别；
- 2020 年：GPT-3 发布，参数量 1750 亿。

这一阶段的核心问题是：

> **如何用PretrainingLM学习大规模文本中的通用语言规律？**

模型结构上出现三条路线：

1. Encoder-only；
2. Decoder-only；
3. Encoder-Decoder。

2. 能力探索阶段：2019—2022 年

随着模型变大，针对每个任务单独 **Fine-Tuning（微调）** 成本很高。

研究者开始探索：

> **不针对每个任务重新训练，能否直接通过Prompt让模型完成任务？**

关键方向：

- **Zero-Shot Learning（零样本学习）** ：不给样例，直接让模型完成任务；
- **Few-Shot Learning（少样本学习）** ：在 **Prompt** 中给少量示例；
- **In-Context Learning（上下文学习）** ：模型不更新参数，仅通过上下文示例理解任务；
- **Instruction Tuning** ：把不同任务统一成自然语言指令，让模型学会遵循任务说明；
- **InstructGPT** ：使用“ **SFT** + **RL** ”的方式让模型更符合人类指令。

这一阶段的核心变化：

> **模型从“会补全文本”逐渐变成“会按照人类指令完成任务”。**

3. 突破发展阶段：2022 年底以后

2022 年 11 月 ChatGPT 发布后， **LLM** 进入大众视野。

它通过一个对话框统一完成过去需要大量定制系统才能完成的任务：

- 问答；
- 文稿撰写；
- 翻译；
- 摘要；
- 代码生成；
- 数学解题；
- 对话陪伴；
- 多步骤任务辅助。

2023 年 GPT-4 发布后，模型在推理、多模态理解和复杂任务处理上进一步增强。

---

## **LLM** 训练流程

现代类 ChatGPT 模型通常可以抽象为四个阶段：

```text
预训练 → 有监督微调 / 指令微调 → 奖励建模 → 强化学习
```

课件中的表格也给出了这四个阶段在数据、算法、模型和资源上的区别。

| 阶段 | 数据 | 算法 | 输出模型 | 资源需求 |
|---|---|---|---|---|
| **Pretraining** | 数千亿 **token**，图书、百科、网页、代码等 | **LM**  **Pretraining** | Base Model | 1000+ GPU，月级训练 |
| **Instruction Tuning** / **SFT** | 数万条用户指令和理想答案 | **Supervised Learning（监督学习）** 式 **LM** 训练 | **SFT** Model | 1–100 GPU，天级训练 |
| **RM** | 大量输出对比排序数据 | 二分类 / 排序模型 | **Reward Model（奖励模型）** | 1–100 GPU，天级训练 |
| **RL** | 用户 **Prompt** + **Reward Model** 反馈 | **Reinforcement Learning from Human Feedback（人类反馈强化学习，RLHF）** 等 **RL** 方法 | **RL** Model | 1–100 GPU，天级训练 |

### 第一阶段： **Pretraining**

**Pretraining** 是训练 **LLM** 的基础阶段。

它使用海量无标注文本数据，例如：

- 互联网网页；
- 维基百科；
- 图书；
- GitHub 代码；
- 论文；
- 问答网站；
- 论坛和社交媒体内容。

目标是让模型学习：

- 语法；
- 词汇；
- 常识；
- 文体；
- 推理模式；
- 代码模式；
- 世界知识的统计关联。

**Pretraining** 通常采用 **Self-Supervised Learning（自监督学习）**。

### **Self-Supervised Learning**

**Self-Supervised Learning** 的特点是：

- 不依赖人工标注标签；
- 标注信号由数据本身自动构造；
- 借用 **Supervised Learning** 的训练形式。

**LM** 中的典型自监督任务就是预测被遮住或未来的词。

例如：

```text
原句：一辆 列车 缓慢 行驶 在 崎岖 的 山路上
遮住：一辆 列车 ____ 行驶 在 崎岖 的 山路上
预测：缓慢
```

或者自回归预测：

```text
输入：一辆 列车
预测：缓慢
```

这就是课件中说的“完形填空下的 **Self-Supervised Learning** ”。

:::TIP
**Self-Supervised Learning** 的关键价值：它让模型可以利用互联网上几乎无限的无标注文本，不需要人工给每句话标答案。
:::

### 基础模型

经过 **Pretraining** 得到的模型称为 **基础模型（base model / foundation model）** 。

基础模型通常具有：

- 广泛的语言建模能力；
- 一定的知识记忆能力；
- 文本补全能力；
- 初步的上下文理解能力。

但它不一定适合直接与人对话。

因为 **Pretraining** 目标主要是：

```text
预测下一个 token
```

这并不等于：

```text
理解人类指令并给出有帮助、真实、安全的回答
```

所以还需要后续对齐训练。

### **Pretraining** 中的数据与算力量级

#### GPT-3 数据示例

GPT-3 的训练语料包括：

- Common Crawl；
- WebText2；
- Books1；
- Books2；
- 英文 Wikipedia。

Common Crawl 原始数据约 45TB，过滤后保留约 570GB；经过子词切分后，总体约 5000 亿子词。

为了提高数据质量，训练时会对不同来源设置不同采样权重。例如高质量数据可能被重复采样更多次。

#### OPT 与 BLOOM 资源示例

- OPT 使用大量 NVIDIA A100 80GB GPU，并采用 **Fully Sharded Data Parallel（全分片数据并行）** 与 Megatron-LM **Tensor Parallelism（张量并行）**；
- BLOOM 训练使用 48 个计算节点，每个节点 8 块 A100 80GB，总计 384 块 GPU，训练耗时约 3.5 个月。

这些例子说明：

> **LLM训练属于数据、模型、算力和分布式系统共同作用的工程问题。**

### 第二阶段： **SFT** / **Instruction Tuning**

**SFT** 使用少量高质量标注数据继续训练基础模型。

数据形式通常是：

```text
用户提示词 / 指令 → 理想回答
```

例如：

```text
Prompt：浙江大学的发展历史？
Ideal Output：浙江大学前身是创立于 1897 年的求是书院……
```

**SFT** 的作用：

- 让模型理解人类提问；
- 让模型学会按指令回答；
- 提升问答、翻译、阅读理解、代码生成等能力；
- 让模型输出更像“回答”，而不只是“续写”。

**Instruction Tuning** 概括为：

> **让人工智能模型说人话、做人事。**

### **Instruction Tuning**

**Instruction Tuning** 是一种特殊的 **SFT**。

它会把很多任务统一写成自然语言指令，训练目标覆盖多个任务。

例如：

```text
请判断下面评论的情感倾向：这部电影很精彩。
```

```text
请把下面英文翻译成中文：A little girl is looking at a black dog.
```

```text
请总结下面这段文字的主要观点：...
```

模型通过大量指令学习到：

- 如何理解任务描述；
- 如何根据任务格式组织回答；
- 如何迁移到未见过的新任务。

因此， **Instruction Tuning** 能提升零样本能力。

### **Prompt Learning（提示学习）**

**Prompt Learning** 是指通过设计 **Prompt**，把下游任务转换成 **LM** 能够处理的形式。

例如情感分类原本是：

```text
输入：这部电影很精彩
输出：正向情感
```

**Prompt Learning** 可以改写为：

```text
这部电影很精彩，因为它很 [MASK]
```

如果模型预测出“引人入胜”“好看”等词，再把这些词映射到“正向情感”。

**Prompt Learning** 的优点：

- 不一定需要重新训练全部参数；
- 可以利用 **LM** 已有的生成能力；
- 对少样本、零样本任务很有帮助。

**Prompt Learning** 的缺点：

- 依赖高质量 **Prompt** 设计；
- 对任务模板较敏感；
- 不同领域可能需要反复试错。

### 第三阶段： **RM**

**RM** 的目标是训练一个模型来判断回答质量。

数据形式通常是：

```text
同一个 prompt → 回答 A、回答 B → 人类标注哪个更好
```

**Reward Model** 学习：

- 哪个回答更有帮助；
- 哪个回答更准确；
- 哪个回答更符合人类偏好；
- 哪个回答更安全、更得体。

**Reward Model** 本身通常不直接面向用户使用。

它的作用是：

> **给后续RL阶段提供奖励信号。**

### 第四阶段： **RLHF**

**RLHF** 在 **SFT** 模型基础上继续优化。

流程大致是：

1. 给模型一个用户指令；
2. 模型生成回答；
3. **Reward Model** 给回答打分；
4. **RL** 算法调整模型参数；
5. 让模型更倾向于生成高奖励回答。

这个阶段的目标是：

> **让模型输出更符合人类偏好。**

课件中也提醒： **RL** 并非没有问题。

可能问题包括：

- 训练稳定性较差；
- **Hyperparameter（超参数）** 多；
- 收敛困难；
- **Reward Model**  **Accuracy（准确率）** 影响最终效果；
- **RL** 可能降低模型输出多样性，使模型熵下降。

### **LLM** 训练的“三板斧”

可以把训练流程记成三板斧：

1. **自监督Pretraining**
   - 学语言规律；
   - 学世界知识的统计关联；
   - 形成基础模型。

2. **Instruction Tuning**
   - 学会理解人类任务；
   - 学会按要求回答；
   - 形成 **SFT** 模型。

3. **RLHF**
   - 学会偏好对齐；
   - 回答更有帮助、更安全、更符合人类期望；
   - 形成最终对话模型。

---

## 通用基座模型与垂直领域大模型

### 什么是通用基座模型

**通用基座模型（general foundation model）** 是在大规模、多领域、多样化数据上训练出来的基础模型。

它的目标是：

- 学到广泛语言能力；
- 覆盖尽可能多的知识领域；
- 具备迁移到下游任务的能力；
- 作为后续 **Fine-Tuning** 和定制的起点。

通用基座模型的优势：

- 能处理多种任务；
- 不需要为每个任务从零训练；
- 具备较强泛化能力；
- 可以通过提示、 **Fine-Tuning**、插件、 **Retrieval-Augmented Generation（检索增强生成，RAG）** 等方式扩展。

局限：

- 对专业领域知识可能不够准确；
- 对领域术语、格式、标准不够熟悉；
- 对高风险场景可能缺乏可靠性；
- 容易产生 **Hallucination（幻觉）**。

### 为什么需要垂直领域大模型

通用模型很强，但专业场景往往有更高要求。

例如：

| 领域 | 特殊需求 |
|---|---|
| 医疗 | 医学术语、病历理解、诊断支持、隐私保护 |
| 金融 | 财报解析、市场分析、风险评估、时间序列数据 |
| 法律 | 法条理解、案例分析、合同审查、法律推理 |
| 教育 | 个性化教学、学习反馈、能力诊断、内容生成 |

这些任务要求模型具备：

- 专业术语理解；
- 领域知识准确性；
- 可靠推理；
- 低 **Hallucination** 率；
- 符合行业规范；
- 数据安全和隐私保护。

因此，需要把通用基座模型迁移为 **垂直领域大模型（vertical domain model）** 。

### 垂直领域大模型的定制流程

教材把垂直领域定制过程概括为三步。

#### 数据收集与标注

领域模型需要领域特定数据。

例如医疗领域：

- 病历记录；
- 医学影像；
- 实验室检测结果；
- 医学文献；
- 临床指南；
- 医患问答。

这些数据通常需要专业人员标注和清洗，确保准确性与一致性。

#### 模型 **Fine-Tuning**

模型 **Fine-Tuning** 通常包括两个层次。

##### 二次预训练

**二次预训练（continuous pre-training）** 是在通用基座模型基础上，用领域无监督数据继续 **Pretraining**。

目的：

- 让模型适应领域术语；
- 学习领域文本风格；
- 增强领域知识；
- 减少从零训练成本。

例如在法律领域，大量法律条文、判例、合同文本可以用于二次预训练。

##### 领域 **Instruction Tuning**

在二次预训练后，再使用领域指令数据进行 **Fine-Tuning**。

例如法律领域指令：

```text
请根据以下案情分析可能适用的法律条文。
```

```text
请审查以下合同条款是否存在风险。
```

金融领域指令：

```text
请根据以下财务数据生成风险评估报告。
```

医疗领域指令：

```text
请根据以下病历摘要列出可能需要进一步检查的项目。
```

**Instruction Tuning** 能让模型更好地执行具体领域任务。

#### 性能评估与优化

垂直领域模型必须在真实或接近真实的任务上评估。

例如：

| 领域 | 评估重点 |
|---|---|
| 医疗 | 诊断建议准确性、风险提示完整性、隐私保护 |
| 法律 | 法条引用准确性、推理合理性、文书格式规范 |
| 金融 | 数据解释准确性、风险判断、时效性 |
| 教育 | 内容适龄性、反馈质量、个性化程度 |

根据评估结果，可能需要：

- 调整 **Hyperparameter**；
- 改进 **Data Cleaning（数据清洗）**；
- 增加训练数据；
- 改进提示模板；
- 加入检索增强；
- 加入安全规则和人工审核。

### 通用模型与垂直模型的关系

可以这样理解：

```text
通用基座模型：大而广，什么都懂一点
垂直领域模型：窄而深，在特定领域更专业
```

通用模型提供基础能力，垂直模型通过迁移训练获得专业能力。

:::TIP
垂直领域大模型的关键不只是“换一个 **Prompt** ”，更重要的是领域数据、二次预训练、 **Instruction Tuning**、评估体系和安全治理。
:::

---

## 大模型的前景与挑战

1. 计算资源与能耗问题

大模型训练和推理需要大量计算资源。

挑战包括：

- GPU 成本高；
- 训练周期长；
- 能耗大；
- 碳排放高；
- 大模型推理部署成本高。

可能解决方向：

- **Model Compression（模型压缩）**；
- **Pruning（剪枝）**；
- **Knowledge Distillation（蒸馏）**；
- **Quantization（量化）**；
- **Mixed-Precision Training（混合精度训练）**；
- 稀疏模型；
- 更高效硬件；
- 更高效训练算法。

核心矛盾：

> **性能提升往往需要更大模型和更多计算，但实际应用要求成本可控。**

2. **Explainability（可解释性）** 与透明性问题

大模型常被看作“黑盒”。

问题在于：

- 模型为什么这样回答，很难解释；
- 哪些输入影响了输出，很难精确追踪；
- 在医疗、法律、金融等高风险领域，不可解释会降低可信度。

可能方法：

- 注意力可视化；
- Shapley 值分析；
- 可解释 **Neural Network** 结构；
- 输出证据链；
- **RAG** 中的来源引用；
- 人工审核和问责机制。

但 **Explainability** 与性能之间可能存在权衡。

3. 数据隐私与安全问题

大模型训练和应用可能涉及大量个人数据。

例如：

- 医疗记录；
- 财务数据；
- 用户对话；
- 企业内部文档；
- 法律案件资料。

风险包括：

- 训练数据泄露；
- 模型记忆敏感信息；
- 通过提示攻击诱导泄露；
- 反向推理出隐私数据；
- 数据被不当使用。

可能技术方向：

- **Federated Learning（联邦学习）** ：数据不集中上传，在本地训练或更新；
- **Differential Privacy（差分隐私）** ：引入噪声，降低个体信息泄露风险；
- 数据脱敏；
- 权限控制；
- 安全审计；
- 私有化部署。

4. 伦理问题与社会影响

大模型可能带来：

- 偏见放大；
- 错误决策；
- **Hallucination** 信息；
- 责任归属不清；
- 学术诚信问题；
- 就业结构变化；
- 自动化决策不公平。

例如在招聘和贷款审批中，如果训练数据本身存在历史偏见，模型可能把这种偏见继续放大。

所以大模型发展不能只看性能，还要考虑：

- 公平性；
- 透明性；
- 安全性；
- 可问责性；
- 人类监督；
- 法律和伦理边界。

5. 未来方向

大模型仍有广阔发展空间。

可能方向包括：

1. **更高效的模型架构**
   - 稀疏化模型；
   - 更高效 **Attention Mechanism**；
   - 小模型高效化。

2. **更强的垂直领域能力**
   - 个性化医疗；
   - 智能教育；
   - 智能制造；
   - 金融风控；
   - 法律辅助。

3. **多模态模型**
   - 文本、图像、音频、视频统一处理；
   - 更接近人类综合感知。

4. **可信 AI 与治理**
   - 安全监管；
   - 模型评测；
   - 数据合规；
   - 人类可控。

5. **人机协作**
   - 大模型不只是替代工具；
   - 更可能成为写作、科研、设计、教育和工程中的协作伙伴。
