// Copyright (c) 2025 Tethys Plex
//
// This file is part of Veloera.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"veloera/common"
	"veloera/setting"

	"github.com/gin-gonic/gin"
)

func TestModelRequestRateLimit(t *testing.T) {
	// 设置测试环境
	gin.SetMode(gin.TestMode)
	common.RedisEnabled = false // 使用内存限流测试

	// 测试场景1: 限流禁用时
	t.Run("DisabledRateLimit", func(t *testing.T) {
		setting.ModelRequestRateLimitEnabled = false
		
		router := gin.New()
		router.Use(ModelRequestRateLimit())
		router.GET("/test", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		req, _ := http.NewRequest("GET", "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != 200 {
			t.Errorf("Expected status 200, got %d", w.Code)
		}
	})

	// 测试场景2: 限流启用但未达到限制
	t.Run("EnabledRateLimitWithinLimits", func(t *testing.T) {
		setting.ModelRequestRateLimitEnabled = true
		setting.ModelRequestRateLimitCount = 10
		setting.ModelRequestRateLimitSuccessCount = 5
		setting.ModelRequestRateLimitDurationMinutes = 1

		router := gin.New()
		router.Use(func(c *gin.Context) {
			c.Set("id", 1) // 模拟用户ID
			c.Next()
		})
		router.Use(ModelRequestRateLimit())
		router.GET("/test", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		req, _ := http.NewRequest("GET", "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != 200 {
			t.Errorf("Expected status 200, got %d", w.Code)
		}
	})

	// 测试场景3: 验证函数返回类型
	t.Run("MiddlewareReturnType", func(t *testing.T) {
		middleware := ModelRequestRateLimit()
		if middleware == nil {
			t.Error("ModelRequestRateLimit should return a non-nil function")
		}
	})
}