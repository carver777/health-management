package com.stringtinyst.healthlife.mapper;

import com.stringtinyst.healthlife.pojo.Exer;
import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ExerMapper {
  List<Exer> list(String userID, LocalDate startDate, LocalDate endDate, String exerciseType);

  @Insert(
      "INSERT INTO exerciseitem(UserID, RecordDate, ExerciseType, DurationMinutes, EstimatedCaloriesBurned) VALUES (#{userID}, #{recordDate}, #{exerciseType}, #{durationMinutes}, #{estimatedCaloriesBurned})")
  @Options(useGeneratedKeys = true, keyProperty = "exerciseItemID", keyColumn = "ExerciseItemID")
  void insertExer(Exer exer);

  @Select("SELECT * FROM exerciseitem WHERE ExerciseItemID = #{exerciseItemID}")
  Exer getByExerItemID(int exerciseItemID);

  @Update(
      "UPDATE exerciseitem SET RecordDate = #{recordDate}, ExerciseType = #{exerciseType}, DurationMinutes = #{durationMinutes}, EstimatedCaloriesBurned = #{estimatedCaloriesBurned} WHERE ExerciseItemID = #{exerciseItemID}")
  void updateExer(Exer exer);

  @Delete("DELETE FROM exerciseitem WHERE ExerciseItemID = #{exerciseItemID}")
  void deleteExer(int exerciseItemID);
}
