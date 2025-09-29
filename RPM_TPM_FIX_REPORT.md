# RPM和TPM显示修复报告

## 问题描述
前端数据看板显示的统计值（RPM和TPM）是正确的，但是使用日志中显示的RPM和TPM不正确。

## 问题根因分析
1. **数据看板（Detail页面）**：使用前端JavaScript计算RPM和TPM
   - RPM = `times / ((endTime - startTime) / 60000)` ✅ 正确
   - TPM = `consumeTokens / ((endTime - startTime) / 60000)` ✅ 正确

2. **使用日志（LogsTable）**：调用后端API获取RPM和TPM
   - 后端直接返回原始计数值，而非计算的速率 ❌ 错误
   - RPM查询：`count(*) rpm` - 这只是总请求数，不是每分钟请求数
   - TPM查询：`sum(prompt_tokens) + sum(completion_tokens) tpm` - 这只是总令牌数，不是每分钟令牌数

## 修复方案
修改了 `/workspaces/Veloera/model/log.go` 中的 `SumUsedQuota` 函数：

### 修复前：
```go
rpmTpmQuery := LOG_DB.Table("logs").Select("count(*) rpm, sum(prompt_tokens) + sum(completion_tokens) tpm")
// ...
tx.Scan(&stat)
rpmTmpQuery.Scan(&stat)  // 直接扫描原始值
```

### 修复后：
```go
rpmTpmQuery := LOG_DB.Table("logs").Select("count(*) as request_count, sum(prompt_tokens) + sum(completion_tokens) as token_count")
// ...
// 执行配额查询
tx.Scan(&stat)

// 执行RPM和TPM查询
var counts struct {
    RequestCount int `json:"request_count"`
    TokenCount   int `json:"token_count"`
}
rpmTmpQuery.Scan(&counts)

// 计算时间间隔（分钟）
var timeRangeMinutes float64 = 1 // 默认为1分钟，避免除零
if startTimestamp != 0 && endTimestamp != 0 {
    timeRangeMinutes = float64(endTimestamp-startTimestamp) / 60.0
}

// 计算RPM和TPM
if timeRangeMinutes > 0 {
    stat.Rpm = int(float64(counts.RequestCount) / timeRangeMinutes)
    stat.Tpm = int(float64(counts.TokenCount) / timeRangeMinutes)
} else {
    stat.Rpm = 0
    stat.Tpm = 0
}
```

## 修复内容
1. **更改查询语句**：使用别名`request_count`和`token_count`分别获取请求总数和令牌总数
2. **添加时间计算**：根据开始和结束时间戳计算时间间隔（分钟）
3. **添加速率计算**：
   - RPM = 总请求数 ÷ 时间间隔（分钟）
   - TPM = 总令牌数 ÷ 时间间隔（分钟）
4. **添加边界检查**：避免除零错误

## 影响的API端点
- `/api/log/stat` - 管理员查看日志统计
- `/api/log/self/stat` - 用户查看自己的日志统计

## 验证方法
1. 重启后端服务
2. 在使用日志页面选择时间范围，点击统计按钮
3. 验证RPM和TPM值是否与数据看板显示的值一致（考虑精度差异）

## 注意事项
- 修复后的RPM和TPM将显示为整数值（向下取整）
- 如果时间间隔为0或未设置时间范围，RPM和TPM将显示为0
- 该修复保持了与前端数据看板相同的计算逻辑