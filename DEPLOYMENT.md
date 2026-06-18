# ChainTrace 合约部署指南

## 前置要求

1. **安装 Sui CLI**
   ```bash
   curl -f https://docs.sui.io/install.sh | sh
   ```

2. **配置钱包**
   ```bash
   sui client new-address ed25519
   ```

3. **获取测试币**
   ```bash
   sui client faucet
   ```

## 部署步骤

### 1. 编译合约

```bash
cd move/product-trace
sui move build
```

### 2. 部署到测试网

```bash
sui client publish --gas-budget 100000000
```

部署成功后会返回：
- `packageId`: 合约包ID (如 `0x1234...`)
- `EnterpriseManager` 对象ID
- `ProductManager` 对象ID
- `NFTManager` 对象ID
- `QRCodeManager` 对象ID

### 3. 更新前端配置

编辑 `ui/.env` 文件：

```env
VITE_SUI_NETWORK=testnet
VITE_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
VITE_CONTRACT_PACKAGE_ID=0x你的合约包ID
VITE_USE_REAL_BLOCKCHAIN=true
```

### 4. 更新合约对象ID

编辑 `ui/src/services/blockchain.ts`，将 Manager 对象ID替换为实际部署后返回的ID：

```typescript
// EnterpriseManager ID - 替换为实际部署的ID
tx.object("0x实际EnterpriseManagerID")

// ProductManager ID - 替换为实际部署的ID
tx.object("0x实际ProductManagerID")

// NFTManager ID - 替换为实际部署的ID
tx.object("0x实际NFTManagerID")

// QRCodeManager ID - 替换为实际部署的ID
tx.object("0x实际QRCodeManagerID")
```

### 5. 重新构建前端

```bash
cd ui
pnpm build
```

## 当前状态

- **Mock模式**: ✅ 已启用（默认）
- **真实链上模式**: 需要完成上述部署步骤后启用

## 注意事项

1. 确保钱包有足够的 SUI 测试币支付 Gas 费用
2. 首次部署可能需要较长时间等待确认
3. 测试完成后可将 `VITE_USE_REAL_BLOCKCHAIN` 设置为 `true` 切换到真实链上模式
