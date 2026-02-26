#!/bin/bash

# BaZi Fortune App - Deployment Test Script
# 测试线上部署的各项功能

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 设置你的 Railway URL
RAILWAY_URL="${1:-https://your-app.railway.app}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}BaZi Fortune App - 部署测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "测试 URL: ${YELLOW}${RAILWAY_URL}${NC}\n"

# 测试计数器
PASSED=0
FAILED=0

# 测试函数
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4

    echo -e "${BLUE}[测试]${NC} ${name}"

    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ 通过${NC} (HTTP $http_code)"
        echo -e "${GREEN}响应:${NC} $(echo $body | head -c 200)...\n"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ 失败${NC} (HTTP $http_code)"
        echo -e "${RED}错误:${NC} $body\n"
        ((FAILED++))
        return 1
    fi
}

echo -e "${YELLOW}=== 1. 基础健康检查 ===${NC}\n"

# 1. Health Check
test_endpoint "健康检查" "${RAILWAY_URL}/health"

# 2. API 基础测试
test_endpoint "API 根路径" "${RAILWAY_URL}/api"

echo -e "${YELLOW}=== 2. 认证功能测试 ===${NC}\n"

# 3. 用户注册测试
REGISTER_DATA='{
  "username": "test_user_'$(date +%s)'",
  "email": "test'$(date +%s)'@example.com",
  "password": "Test123456!"
}'

test_endpoint "用户注册" "${RAILWAY_URL}/api/auth/register" "POST" "$REGISTER_DATA"

# 4. 用户登录测试（使用刚注册的用户）
LOGIN_DATA=$(echo $REGISTER_DATA | sed 's/"username"[^,]*,//')

if test_endpoint "用户登录" "${RAILWAY_URL}/api/auth/login" "POST" "$LOGIN_DATA"; then
    # 提取 token (简化版，实际需要 jq)
    TOKEN=$(echo $body | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}获取到 Token:${NC} ${TOKEN:0:20}...\n"
fi

echo -e "${YELLOW}=== 3. BaZi 计算功能测试 ===${NC}\n"

# 5. 八字计算测试
BAZI_DATA='{
  "name": "测试用户",
  "gender": "male",
  "birthDate": {
    "year": 1990,
    "month": 5,
    "day": 15,
    "hour": 14,
    "minute": 30
  },
  "timezone": "Asia/Shanghai"
}'

test_endpoint "八字计算" "${RAILWAY_URL}/api/charts/calculate" "POST" "$BAZI_DATA"

echo -e "${YELLOW}=== 4. AI 分析功能测试 ===${NC}\n"

# 6. AI 分析测试（需要 GLM API Key）
AI_DATA='{
  "chartId": "test_chart_id",
  "analysisType": "comprehensive"
}'

test_endpoint "AI 综合分析" "${RAILWAY_URL}/api/ai/analyze" "POST" "$AI_DATA"

echo -e "${YELLOW}=== 5. 数据库连接测试 ===${NC}\n"

# 7. 测试数据库查询
if [ -n "$TOKEN" ]; then
    echo -e "${BLUE}[测试]${NC} 用户信息查询（需要认证）"
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "${RAILWAY_URL}/api/users/me" 2>&1)

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ 数据库连接正常${NC}\n"
        ((PASSED++))
    else
        echo -e "${RED}✗ 数据库连接失败${NC}\n"
        ((FAILED++))
    fi
fi

echo -e "${YELLOW}=== 6. 性能测试 ===${NC}\n"

# 8. 响应时间测试
echo -e "${BLUE}[测试]${NC} API 响应时间"
time_start=$(date +%s%N)
curl -s "${RAILWAY_URL}/health" > /dev/null
time_end=$(date +%s%N)
time_diff=$(( ($time_end - $time_start) / 1000000 ))

if [ $time_diff -lt 2000 ]; then
    echo -e "${GREEN}✓ 响应时间: ${time_diff}ms (良好)${NC}\n"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ 响应时间: ${time_diff}ms (较慢)${NC}\n"
    ((FAILED++))
fi

# 测试总结
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}测试总结${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo -e "总计: $((PASSED + FAILED))\n"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！部署成功！${NC}\n"
    exit 0
else
    echo -e "${YELLOW}⚠️  有 $FAILED 个测试失败，请检查日志${NC}\n"
    echo -e "查看 Railway 日志: ${BLUE}railway logs${NC}"
    echo -e "或访问: ${BLUE}https://railway.app/dashboard${NC}\n"
    exit 1
fi
