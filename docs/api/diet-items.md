# 饮食记录接口

## `GET /diet-items`

分页查询饮食记录

- **查询参数**：
  - `page`（默认 `1`）
  - `pageSize`（默认 `10`）
  - `userID`（必填）
  - `startDate`、`endDate`（可选，`YYYY-MM-DD`）
  - `mealType`（可选，例如 `Breakfast`）
- **成功响应**：

  ```json
  {
    "code": 1,
    "msg": "success",
    "data": {
      "total": 1,
      "rows": [
        {
          "dietItemID": 25,
          "userID": "user-uuid-string",
          "recordDate": "2024-06-01",
          "foodName": "Oatmeal",
          "mealType": "Breakfast",
          "estimatedCalories": 320
        }
      ]
    }
  }
  ```

## `GET /diet-items/{dietItemID}`

- **成功响应**：返回 `Diet` 对象
- **未找到记录**：`{"code":1,"msg":"success","data":null}`

## `POST /diet-items`

新增饮食记录

- **请求体**：

  ```json
  {
    "userID": "user-uuid-string",
    "recordDate": "2024-06-01",
    "foodName": "Oatmeal",
    "mealType": "Breakfast",
    "estimatedCalories": 320
  }
  ```

- **成功响应**：`{"code":1,"msg":"success","data":<new-dietItemID>}`

## `PUT /diet-items/{dietItemID}`

- **请求体**：同上，可更新字段
- **成功响应**：`{"code":1,"msg":"success","data":null}`

## `DELETE /diet-items/{dietItemID}`

- **成功响应**：`{"code":1,"msg":"success","data":null}`；删除后查询该 ID 得到 `data = null`
