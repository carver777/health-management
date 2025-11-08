package com.stringtinyst.healthlife.mapper;

import com.stringtinyst.healthlife.pojo.Exer;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ExerMapper {
    List<Exer> list(String userID,LocalDate startDate, LocalDate endDate, String exerciseType);

    @Insert("INSERT INTO exerciseitem(UserID, RecordDate, ExerciseType, DurationMinutes, EstimatedCaloriesBurned) VALUES (#{userID}, #{recordDate}, #{exerciseType}, #{durationMinutes}, #{estimatedCaloriesBurned})")
    void insertExer(Exer exer);

    @Select("SELECT ExerciseItemID FROM exerciseitem WHERE UserID = #{userID} AND RecordDate = #{recordDate} AND ExerciseType = #{exerciseType} AND DurationMinutes = #{durationMinutes} AND EstimatedCaloriesBurned = #{estimatedCaloriesBurned}")
    int searchExerItemID(Exer exer);
    @Select("SELECT * FROM exerciseitem WHERE ExerciseItemID = #{exerciseItemID}")
    Exer getByExerItemID(int exerciseItemID);

    @Update("UPDATE exerciseitem SET RecordDate = #{recordDate}, ExerciseType = #{exerciseType}, DurationMinutes = #{durationMinutes}, EstimatedCaloriesBurned = #{estimatedCaloriesBurned} WHERE ExerciseItemID = #{exerciseItemID}")
    void updateExer(Exer exer);
    @Delete("DELETE FROM exerciseitem WHERE ExerciseItemID = #{exerciseItemID}")
    void deleteExer(int exerciseItemID);
}
