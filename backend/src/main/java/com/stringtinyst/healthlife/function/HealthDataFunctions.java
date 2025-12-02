package com.stringtinyst.healthlife.function;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.stringtinyst.healthlife.pojo.Body;
import com.stringtinyst.healthlife.pojo.Diet;
import com.stringtinyst.healthlife.pojo.Exer;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.pojo.Sleep;
import com.stringtinyst.healthlife.service.BodyService;
import com.stringtinyst.healthlife.service.DietService;
import com.stringtinyst.healthlife.service.ExerService;
import com.stringtinyst.healthlife.service.SleepService;
import com.stringtinyst.healthlife.utils.FunctionResultCache;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.function.Function;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Component;

/**
 * 健康数据管理函数工具集
 *
 * <p>提供 AI 助手操作用户健康数据的能力，包括：
 *
 * <ul>
 *   <li>身体数据（身高、体重）的查询和添加
 *   <li>睡眠记录的查询、添加和修改
 *   <li>饮食记录的查询、添加和修改
 *   <li>运动记录的查询、添加和修改
 * </ul>
 */
@Slf4j
@Component
public class HealthDataFunctions {

  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter DATE_TIME_FORMATTER =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

  private final BodyService bodyService;
  private final SleepService sleepService;
  private final DietService dietService;
  private final ExerService exerService;
  private final FunctionResultCache resultCache;

  public HealthDataFunctions(
      BodyService bodyService,
      SleepService sleepService,
      DietService dietService,
      ExerService exerService,
      FunctionResultCache resultCache) {
    this.bodyService = bodyService;
    this.sleepService = sleepService;
    this.dietService = dietService;
    this.exerService = exerService;
    this.resultCache = resultCache;
  }

  @FunctionalInterface
  private interface PageSupplier {
    PageBean get() throws Exception;
  }

  private String buildCacheKey(String domain, String userID, Object... parts) {
    String safeUser = userID == null ? "anonymous" : userID;
    StringBuilder key = new StringBuilder(domain).append(":").append(safeUser);
    if (parts != null) {
      for (Object part : parts) {
        key.append(":").append(part == null ? "null" : part);
      }
    }
    return key.toString();
  }

  private String userCachePrefix(String domain, String userID) {
    return domain + ":" + (userID == null ? "anonymous" : userID);
  }

  private LocalDate parseDateOrNull(String value) {
    return (value == null || value.isBlank()) ? null : LocalDate.parse(value, DATE_FORMATTER);
  }

  private LocalDate parseRequiredDate(String value) {
    return LocalDate.parse(value, DATE_FORMATTER);
  }

  private LocalDateTime parseRequiredDateTime(String value) {
    return LocalDateTime.parse(value, DATE_TIME_FORMATTER);
  }

  private String runCachedQuery(
      String domain,
      String userID,
      PageSupplier supplier,
      java.util.function.Function<PageBean, String> successFormatter,
      String logLabel,
      Object... cacheParts) {
    String cacheKey = buildCacheKey(domain, userID, cacheParts);
    return resultCache.getOrCompute(
        cacheKey,
        () -> {
          try {
            PageBean pageBean = supplier.get();
            return successFormatter.apply(pageBean);
          } catch (Exception e) {
            log.error("{}失败", logLabel, e);
            return logLabel + "失败: " + e.getMessage();
          }
        });
  }

  // ==================== 身体数据相关 ====================

  /** 身体数据查询请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class BodyQueryRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonPropertyDescription("开始日期 (格式: yyyy-MM-dd)")
    private String startDate;

    @JsonPropertyDescription("结束日期 (格式: yyyy-MM-dd)")
    private String endDate;

    @JsonPropertyDescription("页码，默认 1")
    private Integer page = 1;

    @JsonPropertyDescription("每页大小，默认 10")
    private Integer pageSize = 10;
  }

  @Bean
  @Description("查询用户的身体数据（身高、体重）记录")
  public Function<BodyQueryRequest, String> queryBodyMetrics() {
    return request -> {
      return runCachedQuery(
          "body.query",
          request.getUserID(),
          () ->
              bodyService.page(
                  request.getPage(),
                  request.getPageSize(),
                  request.getUserID(),
                  parseDateOrNull(request.getStartDate()),
                  parseDateOrNull(request.getEndDate())),
          pageBean -> "查询成功，共找到 " + pageBean.getTotal() + " 条身体数据记录。数据: " + pageBean.getRows(),
          "查询身体数据",
          request.getStartDate(),
          request.getEndDate(),
          request.getPage(),
          request.getPageSize());
    };
  }

  /** 添加身体数据请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class AddBodyRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonProperty(required = true)
    @JsonPropertyDescription("身高（厘米），范围 100-250")
    private Double heightCM;

    @JsonProperty(required = true)
    @JsonPropertyDescription("体重（千克），范围 30-300")
    private Double weightKG;

    @JsonProperty(required = true)
    @JsonPropertyDescription("记录日期 (格式: yyyy-MM-dd)")
    private String recordDate;
  }

  @Bean
  @Description("添加用户的身体数据记录（身高、体重）")
  public Function<AddBodyRequest, String> addBodyMetric() {
    return request -> {
      try {
        Body body = new Body();
        body.setUserID(request.getUserID());
        body.setHeightCM(BigDecimal.valueOf(request.getHeightCM()));
        body.setWeightKG(BigDecimal.valueOf(request.getWeightKG()));
        body.setRecordDate(parseRequiredDate(request.getRecordDate()));

        bodyService.addBody(body);

        double bmi = request.getWeightKG() / Math.pow(request.getHeightCM() / 100, 2);
        resultCache.evictByPrefix(userCachePrefix("body.query", request.getUserID()));
        return String.format(
            "成功添加身体数据！记录 ID: %d，BMI: %.2f（正常范围 18.5-23.9）", body.getBodyMetricID(), bmi);
      } catch (Exception e) {
        log.error("添加身体数据失败", e);
        return "添加身体数据失败: " + e.getMessage();
      }
    };
  }

  // ==================== 睡眠数据相关 ====================

  /** 睡眠数据查询请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SleepQueryRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonPropertyDescription("开始日期 (格式: yyyy-MM-dd)")
    private String startDate;

    @JsonPropertyDescription("结束日期 (格式: yyyy-MM-dd)")
    private String endDate;

    @JsonPropertyDescription("页码，默认 1")
    private Integer page = 1;

    @JsonPropertyDescription("每页大小，默认 10")
    private Integer pageSize = 10;
  }

  @Bean
  @Description("查询用户的睡眠记录")
  public Function<SleepQueryRequest, String> querySleepRecords() {
    return request -> {
      return runCachedQuery(
          "sleep.query",
          request.getUserID(),
          () ->
              sleepService.page(
                  request.getPage(),
                  request.getPageSize(),
                  request.getUserID(),
                  parseDateOrNull(request.getStartDate()),
                  parseDateOrNull(request.getEndDate())),
          pageBean -> "查询成功，共找到 " + pageBean.getTotal() + " 条睡眠记录。数据: " + pageBean.getRows(),
          "查询睡眠记录",
          request.getStartDate(),
          request.getEndDate(),
          request.getPage(),
          request.getPageSize());
    };
  }

  /** 添加睡眠数据请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class AddSleepRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonProperty(required = true)
    @JsonPropertyDescription("记录日期 (格式: yyyy-MM-dd)")
    private String recordDate;

    @JsonProperty(required = true)
    @JsonPropertyDescription("入睡时间 (格式: yyyy-MM-dd HH:mm:ss)")
    private String bedTime;

    @JsonProperty(required = true)
    @JsonPropertyDescription("起床时间 (格式: yyyy-MM-dd HH:mm:ss)")
    private String wakeTime;
  }

  @Bean
  @Description("添加用户的睡眠记录")
  public Function<AddSleepRequest, String> addSleepRecord() {
    return request -> {
      try {
        LocalDateTime bedTime = parseRequiredDateTime(request.getBedTime());
        LocalDateTime wakeTime = parseRequiredDateTime(request.getWakeTime());

        if (bedTime.isAfter(wakeTime)) {
          return "错误：入睡时间不能晚于起床时间";
        }

        Sleep sleep = new Sleep();
        sleep.setUserID(request.getUserID());
        sleep.setRecordDate(parseRequiredDate(request.getRecordDate()));
        sleep.setBedTime(bedTime);
        sleep.setWakeTime(wakeTime);

        sleepService.addSleep(sleep);

        double hoursDecimal = java.time.Duration.between(bedTime, wakeTime).toMinutes() / 60.0;

        resultCache.evictByPrefix(userCachePrefix("sleep.query", request.getUserID()));
        return String.format(
            "成功添加睡眠记录！记录 ID: %d，睡眠时长: %.1f 小时（建议 7-9 小时）", sleep.getSleepItemID(), hoursDecimal);
      } catch (Exception e) {
        log.error("添加睡眠记录失败", e);
        return "添加睡眠记录失败: " + e.getMessage();
      }
    };
  }

  /** 更新睡眠数据请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class UpdateSleepRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("睡眠记录 ID")
    private Integer sleepItemID;

    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonProperty(required = true)
    @JsonPropertyDescription("记录日期 (格式: yyyy-MM-dd)")
    private String recordDate;

    @JsonProperty(required = true)
    @JsonPropertyDescription("入睡时间 (格式: yyyy-MM-dd HH:mm:ss)")
    private String bedTime;

    @JsonProperty(required = true)
    @JsonPropertyDescription("起床时间 (格式: yyyy-MM-dd HH:mm:ss)")
    private String wakeTime;
  }

  @Bean
  @Description("更新用户的睡眠记录")
  public Function<UpdateSleepRequest, String> updateSleepRecord() {
    return request -> {
      try {
        LocalDateTime bedTime = parseRequiredDateTime(request.getBedTime());
        LocalDateTime wakeTime = parseRequiredDateTime(request.getWakeTime());

        if (bedTime.isAfter(wakeTime)) {
          return "错误：入睡时间不能晚于起床时间";
        }

        Sleep sleep = new Sleep();
        sleep.setSleepItemID(request.getSleepItemID());
        sleep.setUserID(request.getUserID());
        sleep.setRecordDate(parseRequiredDate(request.getRecordDate()));
        sleep.setBedTime(bedTime);
        sleep.setWakeTime(wakeTime);

        sleepService.updateSleep(sleep);

        double hoursDecimal = java.time.Duration.between(bedTime, wakeTime).toMinutes() / 60.0;

        resultCache.evictByPrefix(userCachePrefix("sleep.query", request.getUserID()));
        return String.format(
            "成功更新睡眠记录 ID: %d，新的睡眠时长: %.1f 小时", request.getSleepItemID(), hoursDecimal);
      } catch (Exception e) {
        log.error("更新睡眠记录失败", e);
        return "更新睡眠记录失败: " + e.getMessage();
      }
    };
  }

  // ==================== 饮食数据相关 ====================

  /** 饮食数据查询请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class DietQueryRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonPropertyDescription("开始日期 (格式: yyyy-MM-dd)")
    private String startDate;

    @JsonPropertyDescription("结束日期 (格式: yyyy-MM-dd)")
    private String endDate;

    @JsonPropertyDescription("餐次类型（早餐、午餐、晚餐、加餐）")
    private String mealType;

    @JsonPropertyDescription("页码，默认 1")
    private Integer page = 1;

    @JsonPropertyDescription("每页大小，默认 10")
    private Integer pageSize = 10;
  }

  @Bean
  @Description("查询用户的饮食记录")
  public Function<DietQueryRequest, String> queryDietRecords() {
    return request -> {
      return runCachedQuery(
          "diet.query",
          request.getUserID(),
          () ->
              dietService.page(
                  request.getPage(),
                  request.getPageSize(),
                  request.getUserID(),
                  parseDateOrNull(request.getStartDate()),
                  parseDateOrNull(request.getEndDate()),
                  request.getMealType()),
          pageBean -> "查询成功，共找到 " + pageBean.getTotal() + " 条饮食记录。数据: " + pageBean.getRows(),
          "查询饮食记录",
          request.getStartDate(),
          request.getEndDate(),
          request.getMealType(),
          request.getPage(),
          request.getPageSize());
    };
  }

  /** 添加饮食数据请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class AddDietRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonProperty(required = true)
    @JsonPropertyDescription("记录日期 (格式: yyyy-MM-dd)")
    private String recordDate;

    @JsonProperty(required = true)
    @JsonPropertyDescription("食物名称")
    private String foodName;

    @JsonProperty(required = true)
    @JsonPropertyDescription("餐次类型（早餐、午餐、晚餐、加餐）")
    private String mealType;

    @JsonProperty(required = true)
    @JsonPropertyDescription("预估卡路里（必须大于 0）")
    private Integer estimatedCalories;
  }

  @Bean
  @Description("添加用户的饮食记录")
  public Function<AddDietRequest, String> addDietRecord() {
    return request -> {
      try {
        Diet diet = new Diet();
        diet.setUserID(request.getUserID());
        diet.setRecordDate(parseRequiredDate(request.getRecordDate()));
        diet.setFoodName(request.getFoodName());
        diet.setMealType(request.getMealType());
        diet.setEstimatedCalories(request.getEstimatedCalories());

        dietService.addDiet(diet);
        int dietItemID = diet.getDietItemID();

        resultCache.evictByPrefix(userCachePrefix("diet.query", request.getUserID()));
        return String.format(
            "成功添加饮食记录！记录 ID: %d，食物: %s，餐次: %s，卡路里: %d kcal",
            dietItemID,
            request.getFoodName(),
            request.getMealType(),
            request.getEstimatedCalories());
      } catch (Exception e) {
        log.error("添加饮食记录失败", e);
        return "添加饮食记录失败: " + e.getMessage();
      }
    };
  }

  /** 更新饮食数据请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class UpdateDietRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("饮食记录 ID")
    private Integer dietItemID;

    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonProperty(required = true)
    @JsonPropertyDescription("记录日期 (格式: yyyy-MM-dd)")
    private String recordDate;

    @JsonProperty(required = true)
    @JsonPropertyDescription("食物名称")
    private String foodName;

    @JsonProperty(required = true)
    @JsonPropertyDescription("餐次类型（早餐、午餐、晚餐、加餐）")
    private String mealType;

    @JsonProperty(required = true)
    @JsonPropertyDescription("预估卡路里（必须大于 0）")
    private Integer estimatedCalories;
  }

  @Bean
  @Description("更新用户的饮食记录")
  public Function<UpdateDietRequest, String> updateDietRecord() {
    return request -> {
      try {
        Diet diet = new Diet();
        diet.setDietItemID(request.getDietItemID());
        diet.setUserID(request.getUserID());
        diet.setRecordDate(parseRequiredDate(request.getRecordDate()));
        diet.setFoodName(request.getFoodName());
        diet.setMealType(request.getMealType());
        diet.setEstimatedCalories(request.getEstimatedCalories());

        dietService.updateDiet(diet);

        resultCache.evictByPrefix(userCachePrefix("diet.query", request.getUserID()));
        return String.format(
            "成功更新饮食记录 ID: %d，食物: %s，餐次: %s，卡路里: %d kcal",
            request.getDietItemID(),
            request.getFoodName(),
            request.getMealType(),
            request.getEstimatedCalories());
      } catch (Exception e) {
        log.error("更新饮食记录失败", e);
        return "更新饮食记录失败: " + e.getMessage();
      }
    };
  }

  // ==================== 运动数据相关 ====================

  /** 运动数据查询请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ExerciseQueryRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonPropertyDescription("开始日期 (格式: yyyy-MM-dd)")
    private String startDate;

    @JsonPropertyDescription("结束日期 (格式: yyyy-MM-dd)")
    private String endDate;

    @JsonPropertyDescription("运动类型（如：跑步、游泳、骑行等）")
    private String exerciseType;

    @JsonPropertyDescription("页码，默认 1")
    private Integer page = 1;

    @JsonPropertyDescription("每页大小，默认 10")
    private Integer pageSize = 10;
  }

  @Bean
  @Description("查询用户的运动记录")
  public Function<ExerciseQueryRequest, String> queryExerciseRecords() {
    return request -> {
      return runCachedQuery(
          "exercise.query",
          request.getUserID(),
          () ->
              exerService.page(
                  request.getPage(),
                  request.getPageSize(),
                  request.getUserID(),
                  parseDateOrNull(request.getStartDate()),
                  parseDateOrNull(request.getEndDate()),
                  request.getExerciseType()),
          pageBean -> "查询成功，共找到 " + pageBean.getTotal() + " 条运动记录。数据: " + pageBean.getRows(),
          "查询运动记录",
          request.getStartDate(),
          request.getEndDate(),
          request.getExerciseType(),
          request.getPage(),
          request.getPageSize());
    };
  }

  // 支持的运动类型列表（与前端保持一致）
  private static final java.util.List<String> VALID_EXERCISE_TYPES =
      java.util.Arrays.asList(
          "跑步", "游泳", "骑行", "徒步", "爬山", "跳绳", "篮球", "足球", "羽毛球", "乒乓球", "网球", "健身房训练", "瑜伽", "普拉提",
          "力量训练");

  // 运动类型对应的 MET 值（中等强度）
  // MET (Metabolic Equivalent of Task) 代谢当量
  private static final java.util.Map<String, Double> EXERCISE_MET_VALUES =
      java.util.Map.ofEntries(
          java.util.Map.entry("跑步", 9.8),
          java.util.Map.entry("游泳", 8.0),
          java.util.Map.entry("骑行", 6.8),
          java.util.Map.entry("徒步", 3.5),
          java.util.Map.entry("爬山", 7.0),
          java.util.Map.entry("跳绳", 11.0),
          java.util.Map.entry("篮球", 6.5),
          java.util.Map.entry("足球", 7.0),
          java.util.Map.entry("羽毛球", 5.5),
          java.util.Map.entry("乒乓球", 4.0),
          java.util.Map.entry("网球", 7.0),
          java.util.Map.entry("健身房训练", 5.0),
          java.util.Map.entry("瑜伽", 3.0),
          java.util.Map.entry("普拉提", 4.0),
          java.util.Map.entry("力量训练", 5.0));

  // 默认体重（当用户没有体重数据时使用）
  private static final double DEFAULT_WEIGHT_KG = 65.0;

  /**
   * 获取用户最新体重
   *
   * @param userID 用户 ID
   * @return 用户最新体重，如果没有记录则返回 null
   */
  private Double getUserLatestWeight(String userID) {
    try {
      PageBean pageBean = bodyService.page(1, 1, userID, null, null);
      if (pageBean.getRows() != null && !pageBean.getRows().isEmpty()) {
        Object firstRow = pageBean.getRows().get(0);
        if (firstRow instanceof Body body) {
          return body.getWeightKG().doubleValue();
        }
      }
    } catch (Exception e) {
      log.warn("获取用户体重失败: {}", e.getMessage());
    }
    return null;
  }

  /**
   * 使用 MET 公式计算运动消耗热量
   *
   * <p>公式: 热量 (kcal) = MET × 体重 (kg) × 时间 (小时)
   *
   * @param exerciseType 运动类型
   * @param durationMinutes 运动时长（分钟）
   * @param weightKG 体重（千克）
   * @return 消耗热量（kcal）
   */
  private int calculateCaloriesByMET(String exerciseType, int durationMinutes, double weightKG) {
    double met = EXERCISE_MET_VALUES.getOrDefault(exerciseType, 5.0);
    double hours = durationMinutes / 60.0;
    return (int) Math.round(met * weightKG * hours);
  }

  /** 添加运动数据请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class AddExerciseRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonProperty(required = true)
    @JsonPropertyDescription("记录日期 (格式: yyyy-MM-dd)")
    private String recordDate;

    @JsonProperty(required = true)
    @JsonPropertyDescription("运动类型，必须是以下之一：跑步、游泳、骑行、徒步、爬山、跳绳、篮球、足球、羽毛球、乒乓球、网球、健身房训练、瑜伽、普拉提、力量训练")
    private String exerciseType;

    @JsonProperty(required = true)
    @JsonPropertyDescription("运动时长（分钟），范围 1-600")
    private Integer durationMinutes;

    @JsonPropertyDescription("预估消耗卡路里（可选，如不提供将根据 MET 公式自动计算）")
    private Integer estimatedCaloriesBurned;
  }

  @Bean
  @Description("添加用户的运动记录。如果不提供消耗热量，系统将使用 MET 公式（热量 = MET × 体重 × 时间）自动计算。需要先查询用户身体数据获取体重。")
  public Function<AddExerciseRequest, String> addExerciseRecord() {
    return request -> {
      try {
        // 验证运动类型
        if (!VALID_EXERCISE_TYPES.contains(request.getExerciseType())) {
          return String.format(
              "错误：不支持的运动类型 '%s'。支持的运动类型有：%s",
              request.getExerciseType(), String.join("、", VALID_EXERCISE_TYPES));
        }

        // 获取用户体重
        Double userWeight = getUserLatestWeight(request.getUserID());
        boolean usingDefaultWeight = (userWeight == null);
        double weightForCalculation = usingDefaultWeight ? DEFAULT_WEIGHT_KG : userWeight;

        // 计算消耗热量
        int calories;
        String calorieSource;
        if (request.getEstimatedCaloriesBurned() != null
            && request.getEstimatedCaloriesBurned() > 0) {
          calories = request.getEstimatedCaloriesBurned();
          calorieSource = "用户提供";
        } else {
          calories =
              calculateCaloriesByMET(
                  request.getExerciseType(), request.getDurationMinutes(), weightForCalculation);
          calorieSource =
              usingDefaultWeight
                  ? String.format("MET 公式计算（使用默认体重 %.1f kg）", DEFAULT_WEIGHT_KG)
                  : String.format("MET 公式计算（基于体重 %.1f kg）", userWeight);
        }

        Exer exer = new Exer();
        exer.setUserID(request.getUserID());
        exer.setRecordDate(parseRequiredDate(request.getRecordDate()));
        exer.setExerciseType(request.getExerciseType());
        exer.setDurationMinutes(request.getDurationMinutes());
        exer.setEstimatedCaloriesBurned(calories);

        exerService.addExer(exer);

        StringBuilder result = new StringBuilder();
        result.append(
            String.format(
                "成功添加运动记录！记录 ID: %d，运动: %s，时长: %d 分钟，消耗: %d kcal（%s）",
                exer.getExerciseItemID(),
                request.getExerciseType(),
                request.getDurationMinutes(),
                calories,
                calorieSource));

        if (usingDefaultWeight) {
          result.append("\n\n⚠️ 提示：您还没有记录身体数据，热量计算使用了默认体重 65 kg。");
          result.append("建议先记录您的身高体重数据，以获得更准确的热量消耗计算。");
        }

        resultCache.evictByPrefix(userCachePrefix("exercise.query", request.getUserID()));
        return result.toString();
      } catch (Exception e) {
        log.error("添加运动记录失败", e);
        return "添加运动记录失败: " + e.getMessage();
      }
    };
  }

  /** 更新运动数据请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class UpdateExerciseRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("运动记录 ID")
    private Integer exerciseItemID;

    @JsonProperty(required = true)
    @JsonPropertyDescription("用户 ID")
    private String userID;

    @JsonProperty(required = true)
    @JsonPropertyDescription("记录日期 (格式: yyyy-MM-dd)")
    private String recordDate;

    @JsonProperty(required = true)
    @JsonPropertyDescription("运动类型（如：跑步、游泳、骑行等）")
    private String exerciseType;

    @JsonProperty(required = true)
    @JsonPropertyDescription("运动时长（分钟），范围 1-600")
    private Integer durationMinutes;

    @JsonProperty(required = true)
    @JsonPropertyDescription("预估消耗卡路里（必须大于 0）")
    private Integer estimatedCaloriesBurned;
  }

  @Bean
  @Description("更新用户的运动记录，运动类型必须是系统支持的类型之一")
  public Function<UpdateExerciseRequest, String> updateExerciseRecord() {
    return request -> {
      try {
        // 验证运动类型
        if (!VALID_EXERCISE_TYPES.contains(request.getExerciseType())) {
          return String.format(
              "错误：不支持的运动类型 '%s'。支持的运动类型有：%s",
              request.getExerciseType(), String.join("、", VALID_EXERCISE_TYPES));
        }

        Exer exer = new Exer();
        exer.setExerciseItemID(request.getExerciseItemID());
        exer.setUserID(request.getUserID());
        exer.setRecordDate(parseRequiredDate(request.getRecordDate()));
        exer.setExerciseType(request.getExerciseType());
        exer.setDurationMinutes(request.getDurationMinutes());
        exer.setEstimatedCaloriesBurned(request.getEstimatedCaloriesBurned());

        exerService.updateExer(exer);

        resultCache.evictByPrefix(userCachePrefix("exercise.query", request.getUserID()));
        return String.format(
            "成功更新运动记录 ID: %d，运动: %s，时长: %d 分钟，消耗: %d kcal",
            request.getExerciseItemID(),
            request.getExerciseType(),
            request.getDurationMinutes(),
            request.getEstimatedCaloriesBurned());
      } catch (Exception e) {
        log.error("更新运动记录失败", e);
        return "更新运动记录失败: " + e.getMessage();
      }
    };
  }
}
