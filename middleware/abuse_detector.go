package middleware

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/Veloera/Veloera/common"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

type AbuseDetector struct {
	redis *redis.Client
	ctx   context.Context
}

func NewAbuseDetector() *AbuseDetector {
	return &AbuseDetector{
		redis: common.RDB,
		ctx:   context.Background(),
	}
}

// CheckRequestFrequency 检查请求频率
func (d *AbuseDetector) CheckRequestFrequency(userId int) (bool, string) {
	key := fmt.Sprintf("abuse:freq:%d", userId)
	now := time.Now().Unix()
	windowSeconds := int64(60)

	d.redis.ZRemRangeByScore(d.ctx, key, "-inf", fmt.Sprintf("%d", now-windowSeconds))
	d.redis.ZAdd(d.ctx, key, &redis.Z{Score: float64(now), Member: fmt.Sprintf("%d", now)})
	d.redis.Expire(d.ctx, key, time.Duration(windowSeconds)*time.Second)

	count, _ := d.redis.ZCard(d.ctx, key).Result()
	threshold := d.getDynamicThreshold(userId)

	if count > threshold {
		return true, fmt.Sprintf("频率超限: %d/%d", count, threshold)
	}
	return false, ""
}

// CheckIPHopping 检查IP跳变
func (d *AbuseDetector) CheckIPHopping(userId int, currentIP string) (bool, string) {
	key := fmt.Sprintf("abuse:ips:%d", userId)
	ips, _ := d.redis.SMembers(d.ctx, key).Result()

	if len(ips) > 5 && !contains(ips, currentIP) {
		return true, fmt.Sprintf("短时间使用%d个不同IP", len(ips)+1)
	}

	d.redis.SAdd(d.ctx, key, currentIP)
	d.redis.Expire(d.ctx, key, 1*time.Hour)
	return false, ""
}

// CheckTokenSpike 检查Token激增
func (d *AbuseDetector) CheckTokenSpike(userId int, currentTokens int) (bool, string) {
	key := fmt.Sprintf("abuse:avg_tokens:%d", userId)
	avgTokens, _ := d.redis.Get(d.ctx, key).Float64()

	if avgTokens == 0 {
		avgTokens = 500
	}

	if float64(currentTokens) > avgTokens*5 {
		return true, fmt.Sprintf("Token激增: %d (平均: %.0f)", currentTokens, avgTokens)
	}

	d.updateMovingAverage(key, currentTokens, 100)
	return false, ""
}

// CheckContentRepetition 检查内容重复
func (d *AbuseDetector) CheckContentRepetition(userId int, content string) (bool, string) {
	key := fmt.Sprintf("abuse:content:%d", userId)
	contentHash := hashContent(content)

	exists, _ := d.redis.SIsMember(d.ctx, key, contentHash).Result()
	if exists {
		countKey := fmt.Sprintf("abuse:content_repeat:%d:%s", userId, contentHash)
		count, _ := d.redis.Get(d.ctx, countKey).Int()
		if count > 3 {
			return true, "重复内容超过3次"
		}
		d.redis.Incr(d.ctx, countKey)
	}

	d.redis.SAdd(d.ctx, key, contentHash)
	if size, _ := d.redis.SCard(d.ctx, key).Result(); size > 50 {
		d.redis.SPop(d.ctx, key)
	}
	d.redis.Expire(d.ctx, key, 24*time.Hour)
	return false, ""
}

// IsWhitelisted 检查是否在白名单
func (d *AbuseDetector) IsWhitelisted(userId int) bool {
	key := fmt.Sprintf("abuse:whitelist:%d", userId)
	exists, _ := d.redis.Exists(d.ctx, key).Result()
	return exists > 0
}

// RecordViolation 记录违规
func (d *AbuseDetector) RecordViolation(userId int, violations []string) {
	key := fmt.Sprintf("abuse:violations:%d", userId)
	for _, v := range violations {
		d.redis.RPush(d.ctx, key, v)
	}
	d.redis.Expire(d.ctx, key, 24*time.Hour)
}

// getDynamicThreshold 获取动态阈值
func (d *AbuseDetector) getDynamicThreshold(userId int) int64 {
	return 60 // 默认每分钟60次
}

// updateMovingAverage 更新移动平均
func (d *AbuseDetector) updateMovingAverage(key string, value int, window int) {
	listKey := key + ":list"
	d.redis.RPush(d.ctx, listKey, value)

	size, _ := d.redis.LLen(d.ctx, listKey).Result()
	if size > int64(window) {
		d.redis.LPop(d.ctx, listKey)
	}

	values, _ := d.redis.LRange(d.ctx, listKey, 0, -1).Result()
	sum := 0.0
	for _, v := range values {
		var val float64
		fmt.Sscanf(v, "%f", &val)
		sum += val
	}
	avg := sum / float64(len(values))
	d.redis.Set(d.ctx, key, avg, 24*time.Hour)
}

// hashContent 计算内容哈希
func hashContent(content string) string {
	hash := md5.Sum([]byte(content))
	return hex.EncodeToString(hash[:])
}

// contains 检查字符串是否在切片中
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// AbuseDetectionMiddleware 滥用检测中间件
func AbuseDetectionMiddleware() gin.HandlerFunc {
	detector := NewAbuseDetector()

	return func(c *gin.Context) {
		userId := c.GetInt("id")
		if userId == 0 {
			c.Next()
			return
		}

		if detector.IsWhitelisted(userId) {
			c.Next()
			return
		}

		violations := []string{}

		if violated, msg := detector.CheckRequestFrequency(userId); violated {
			violations = append(violations, msg)
		}

		if violated, msg := detector.CheckIPHopping(userId, c.ClientIP()); violated {
			violations = append(violations, msg)
		}

		if len(violations) > 0 {
			detector.RecordViolation(userId, violations)
			c.JSON(429, gin.H{
				"error":   "请求频率过高或行为异常",
				"details": violations,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
