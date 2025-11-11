package com.stringtinyst.healthlife.mapper;

import com.stringtinyst.healthlife.pojo.Diet;
import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.*;

@Mapper
public interface DietMapper {

  @Insert(
      "INSERT INTO dietitem(UserID, RecordDate, FoodName, MealType, EstimatedCalories) VALUES (#{userID}, #{recordDate}, #{foodName}, #{mealType}, #{estimatedCalories})")
  void insertDiet(Diet diet);

  @Select(
      "SELECT DietItemID FROM dietitem WHERE UserID = #{userID} AND RecordDate = #{recordDate} AND FoodName = #{foodName} AND MealType = #{mealType} AND EstimatedCalories = #{estimatedCalories}")
  int searchdietItemID(Diet diet);

  List<Diet> list(String userID, LocalDate startDate, LocalDate endDate, String mealType);

  @Select("SELECT * FROM dietitem WHERE DietItemID = #{dietItemID}")
  Diet getByDietItemByID(int dietItemID);

  @Update(
      "UPDATE dietitem SET RecordDate = #{recordDate}, FoodName = #{foodName}, MealType = #{mealType}, EstimatedCalories = #{estimatedCalories} WHERE DietItemID = #{dietItemID}")
  void updateDiet(Diet diet);

  @Delete("DELETE FROM dietitem WHERE DietItemID = #{dietItemID}")
  void deleteDiet(int dietItemID);
}
