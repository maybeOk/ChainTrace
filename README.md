# ChainTrace

![ChainTrace Banner](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blockchain%20product%20traceability%20platform%20logo%20with%20QR%20code%20and%20NFT%20elements%20blue%20theme&image_size=landscape_16_9)

## 项目简介 | Project Introduction

ChainTrace 是一个基于 **Sui 区块链** 的去中心化商品追溯平台，利用 **NFT 技术** 实现商品信息的不可篡改存储和验证。

ChainTrace is a decentralized product traceability platform built on the **Sui blockchain**, leveraging **NFT technology** for immutable storage and verification of product information.

### 项目愿景 | Vision

- 🌍 **全球商品追溯**：打破地域限制，实现商品信息的全球透明共享
- 📋 **公开透明**：所有商品信息上链存储，任何人都可以验证
- 🆓 **免费使用**：提供免费的追溯码生成和验证服务
- ⏳ **长久保存**：链上数据永久保存，确保商品信息的长期可追溯

- 🌍 **Global Traceability**: Break geographical barriers, achieve global transparent sharing of product information
- 📋 **Open & Transparent**: All product information stored on-chain, verifiable by anyone
- 🆓 **Free to Use**: Provide free traceability code generation and verification services
- ⏳ **Permanent Storage**: On-chain data persists forever, ensuring long-term traceability

---

## 核心功能 | Core Features

| 功能 | 描述 |
|------|------|
| **商品管理** | 企业可以创建、编辑、删除商品信息，支持自定义扩展字段 |
| **商品上链** | 将商品信息上传至 Sui 区块链，获得链上 ID，确保数据不可篡改 |
| **批量生成追溯码** | 根据商品数量批量生成加密无规律的追溯码，每个追溯码对应唯一验证链接 |
| **扫码验证** | 消费者通过 RESTful 链接 `/verify/:id` 验证商品真伪，查看完整信息 |
| **NFT 领取** | 首次扫码用户可以领取 NFT 奖励，作为商品所有权的数字凭证 |
| **企业信息管理** | 企业信息展示在钱包下拉框中，可点击跳转编辑页面进行修改 |
| **多语言支持** | 支持中文和英文双语切换，满足国际化需求 |

| Feature | Description |
|---------|-------------|
| **Product Management** | Enterprises can create, edit, delete product information with custom fields |
| **On-chain Upload** | Upload product info to Sui blockchain, obtain on-chain ID for immutable storage |
| **Batch QR Code Generation** | Generate encrypted traceability codes in batches, each with unique verification link |
| **QR Code Verification** | Consumers verify authenticity via RESTful `/verify/:id` endpoint |
| **NFT Claim** | First-time scanners can claim NFT rewards as digital ownership certificates |
| **Enterprise Profile** | Enterprise info displayed in wallet dropdown, editable via dedicated page |
| **Multi-language Support** | Chinese and English bilingual support for international users |

---

## 技术栈 | Tech Stack

| 分类 | 技术 | 版本 |
|------|------|------|
| **区块链** | Sui Blockchain, Move | - |
| **前端框架** | React | ^18.3.1 |
| **类型系统** | TypeScript | ^5.8.3 |
| **状态管理** | React Context, Mock Store | - |
| **路由** | React Router DOM | ^7.18.0 |
| **UI 框架** | Radix UI Themes | ^3.2.1 |
| **钱包集成** | Mysten Dapp Kit | ^1.0.4 |
| **二维码** | qrcode | ^1.5.4 |
| **构建工具** | Vite | ^7.0.5 |
| **图标** | Radix UI Icons | ^1.3.0 |

---

## 系统架构 | System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChainTrace Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Enterprise │     │   Consumer   │     │   Dashboard  │    │
│  │     User     │     │     User     │     │   Admin      │    │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘    │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Frontend Layer (React)                │  │
│  │  • HomePage • DashboardPage • VerifyPage • ProfilePage  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Service Layer                          │  │
│  │  • Blockchain Service • QR Code Service • Data Service   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Sui Blockchain Layer                    │  │
│  │  • Enterprise Contract • Product Contract • NFT Contract │  │
│  │  • QR Code Contract • Immutable Storage                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 项目结构 | Project Structure

```
ChainTrace/
├── move/                              # Move 智能合约
│   └── product-trace/
│       ├── sources/                   # 合约源码
│       │   ├── enterprise.move        # 企业管理合约
│       │   ├── nft.move               # NFT 发行合约
│       │   ├── product.move           # 商品管理合约
│       │   └── qrcode.move            # 追溯码合约
│       ├── Move.toml                  # 依赖配置文件
│       └── Move.lock                  # 依赖锁文件
├── ui/                                # 前端应用
│   ├── src/
│   │   ├── components/                # 通用组件
│   │   │   ├── CreateProduct.tsx      # 创建商品组件
│   │   │   ├── Dashboard.tsx          # 控制台组件
│   │   │   ├── ProductDetail.tsx      # 商品详情组件
│   │   │   ├── QRCodeScanner.tsx      # 扫码组件
│   │   │   └── WalletDropdown.tsx     # 钱包下拉组件
│   │   ├── context/                   # React Context
│   │   │   ├── LanguageContext.tsx    # 多语言上下文
│   │   │   └── ThemeContext.tsx       # 主题上下文
│   │   ├── pages/                     # 页面组件
│   │   │   ├── HomePage.tsx           # 首页（企业官网）
│   │   │   ├── DashboardPage.tsx      # 企业控制台页
│   │   │   ├── VerifyPage.tsx         # 扫码验证页
│   │   │   └── EnterpriseProfilePage.tsx # 企业信息页
│   │   ├── services/                  # 服务层
│   │   │   └── blockchain.ts          # 区块链服务
│   │   ├── store/                     # Mock 数据存储
│   │   │   └── mockStore.ts           # 模拟数据存储
│   │   ├── App.tsx                    # 应用主组件
│   │   ├── main.tsx                   # React 入口文件
│   │   └── index.css                  # 全局样式
│   ├── package.json                   # 前端依赖配置
│   ├── vite.config.mts                # Vite 配置
│   ├── tsconfig.json                  # TypeScript 配置
│   └── .env                           # 环境变量
├── walrus/                            # Walrus 数据库配置
│   └── config.yaml                    # 数据库配置文件
├── .gitignore                         # Git 忽略配置
├── CLAUDE.md                          # Claude 提示词
└── README.md                          # 项目说明文档
```

---

## 安装步骤 | Installation

### 前置要求 | Prerequisites

确保您的环境已安装以下工具：

- Node.js >= 20.x
- pnpm >= 8.x
- Sui CLI（可选，用于部署合约）
- Git

Make sure you have the following tools installed:

- Node.js >= 20.x
- pnpm >= 8.x
- Sui CLI (optional, for contract deployment)
- Git

### 克隆项目 | Clone Repository

```bash
git clone https://github.com/your-username/ChainTrace.git
cd ChainTrace
```

### 安装前端依赖 | Install Frontend Dependencies

```bash
cd ui
pnpm install
```

---

## 运行项目 | Run Project

### 开发模式 | Development Mode

启动开发服务器：

Start development server:

```bash
cd ui
pnpm dev
```

访问 **http://localhost:5173** 查看应用。

Visit **http://localhost:5173** to access the application.

### 构建生产版本 | Build Production Version

```bash
cd ui
pnpm build
```

构建产物将生成在 `ui/dist` 目录。

Build output will be in the `ui/dist` directory.

### 预览生产版本 | Preview Production Version

```bash
cd ui
pnpm preview
```

### 部署合约（可选）| Deploy Contract (Optional)

```bash
cd move/product-trace
sui move build
sui client publish --gas-budget 100000000
```

---

## 使用流程 | Usage Flow

### 企业端操作流程 | Enterprise Workflow

```
1. 连接钱包 ──────→ 自动注册企业账户
       │
       ▼
2. 创建商品 ──────→ 填写商品信息（名称、描述、数量、扩展字段）
       │
       ▼
3. 商品上链 ──────→ 点击上传按钮，等待链上确认
       │
       ▼
4. 生成追溯码 ────→ 设置数量，批量生成加密追溯码和二维码
       │
       ▼
5. 分发追溯码 ────→ 下载二维码或复制验证链接
```

### 消费者端操作流程 | Consumer Workflow

```
1. 扫码/打开链接 → 扫描二维码或访问 /verify/:id
       │
       ▼
2. 查看商品信息 → 页面展示商品详细信息和溯源记录
       │
       ▼
3. 领取 NFT ────→ 首次验证用户可领取专属 NFT
```

---

## API 端点 | API Endpoints

| 端点 | 方法 | 描述 |
|------|------|------|
| `/` | GET | 首页（企业官网风格） |
| `/dashboard` | GET | 企业控制台（需连接钱包） |
| `/verify` | GET | 扫码验证页面（输入追溯码） |
| `/verify/:id` | GET | 直接验证指定追溯码 |
| `/enterprise-profile` | GET | 企业信息编辑页 |

---

## 配置说明 | Configuration

### 环境变量 | Environment Variables

在 `ui/.env` 文件中配置：

Configure in `ui/.env` file:

```env
# Sui 网络配置 | Sui Network Configuration
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# 合约包 ID（部署后配置）| Contract Package ID (configure after deployment)
VITE_CONTRACT_PACKAGE_ID=0x...

# 是否使用真实区块链 | Use real blockchain or mock
VITE_USE_REAL_BLOCKCHAIN=false
```

### 主题配置 | Theme Configuration

- 默认主题：深海蓝（Deep Sea Blue）
- 支持主题：紫色（Purple）、蓝色（Blue）
- 主题切换功能已隐藏，如需开启请修改 `ThemeContext.tsx`

- Default Theme: Deep Sea Blue
- Supported Themes: Purple, Blue
- Theme switch is hidden by default, modify `ThemeContext.tsx` to enable

---

## 核心特性详解 | Core Features Details

### 追溯码生成机制 | QR Code Generation

追溯码采用**加密无规律**算法生成，确保：

- 唯一性：每个追溯码都是独一无二的
- 不可预测性：无法通过已有追溯码推测其他码
- 安全性：采用加密算法防止伪造

QR codes are generated using **encrypted random** algorithm, ensuring:

- Uniqueness: Each code is unique
- Unpredictability: Cannot guess other codes from existing ones
- Security: Encrypted to prevent forgery

### NFT 领取机制 | NFT Claim Mechanism

- 每个追溯码对应一个 NFT
- 首次验证时自动发放 NFT
- NFT 包含商品信息和验证记录
- NFT 所有权归验证用户所有

- Each QR code corresponds to one NFT
- Automatically minted on first verification
- NFT contains product info and verification records
- NFT ownership belongs to the verifying user

---

## 常见问题 | FAQ

### Q1: 如何连接钱包？

A: 点击页面右上角的"连接钱包"按钮，选择支持的 Web3 钱包（如 Sui Wallet、Suiet 等）。

### Q1: How to connect wallet?

A: Click the "Connect Wallet" button in the top-right corner, select a supported Web3 wallet (e.g., Sui Wallet, Suiet).

### Q2: 追溯码有效期是多久？

A: 追溯码永久有效，商品信息上链后将永久保存。

### Q2: What is the validity period of QR codes?

A: QR codes are valid forever, product information is permanently stored on-chain.

### Q3: 是否需要支付 Gas 费用？

A: 当前使用 Mock 模式，无需支付 Gas 费用。切换到真实区块链模式后需要支付。

### Q3: Is Gas fee required?

A: No gas fee required in mock mode. Gas fee is required when using real blockchain.

### Q4: 如何部署到生产环境？

A: 请参考 [部署指南](#部署合约) 部分，部署 Move 合约并配置环境变量。

### Q4: How to deploy to production?

A: Please refer to the [Deployment Guide](#deploy-contract-optional) section, deploy Move contracts and configure environment variables.

---

## 开发指南 | Development Guide

### 代码规范 | Code Standards

- 使用 TypeScript 编写，确保类型安全
- 遵循 ESLint 和 Prettier 规范
- 使用 React Hooks 管理状态
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### 测试命令 | Test Commands

```bash
# 运行 ESLint 检查
pnpm lint

# 运行类型检查
pnpm build --mode=development
```

---

## 贡献指南 | Contributing

欢迎贡献代码！请遵循以下步骤：

Welcome to contribute! Please follow these steps:

1. Fork 项目到您的 GitHub 账户 | Fork the project to your GitHub account
2. 创建功能分支 | Create a feature branch: `git checkout -b feature/your-feature`
3. 提交更改 | Commit changes: `git commit -m "feat: your feature"`
4. 推送到分支 | Push to branch: `git push origin feature/your-feature`
5. 创建 Pull Request | Create a Pull Request

### 贡献规范 | Contribution Guidelines

- 提交信息遵循 Conventional Commits 规范
- PR 描述清晰，包含改动说明和测试结果
- 确保代码通过 ESLint 和类型检查

---

## 许可证 | License

[MIT License](LICENSE)

---

## 联系方式 | Contact

如有问题或建议，请通过以下方式联系：

For questions or suggestions, please contact us via:

- GitHub Issues: [https://github.com/your-username/ChainTrace/issues](https://github.com/your-username/ChainTrace/issues)
- 项目讨论区 | Project Discussion

---

## 致谢 | Acknowledgements

- [Sui Blockchain](https://sui.io/) - 高性能区块链平台 | High-performance blockchain platform
- [Mysten Labs](https://mystenlabs.com/) - 区块链基础设施 | Blockchain infrastructure
- [Vite](https://vitejs.dev/) - 快速构建工具 | Fast build tool
- [Radix UI](https://www.radix-ui.com/) - 优质 UI 组件 | High-quality UI components
- [React](https://react.dev/) - 前端框架 | Frontend framework

---

## 项目状态 | Project Status

![Development Status](https://img.shields.io/badge/status-development-blue.svg)

- 当前版本：v0.0.0（开发中）
- 主要功能：已完成商品管理、上链、追溯码生成、扫码验证、NFT 领取
- 下一步计划：完善智能合约、添加更多商品属性、优化用户体验

- Current Version: v0.0.0 (In Development)
- Main Features: Product management, on-chain upload, QR code generation, verification, NFT claim
- Next Steps: Improve smart contracts, add more product attributes, optimize UX

---

*Made with ❤️ by ChainTrace Team*
