package com.stringtinyst.healthlife.mapper;

import com.stringtinyst.healthlife.pojo.Body;
import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.*;

@Mapper
public interface BodyMapper {

  /**
   * 根据用户ID查询身体信息
   *
   * @param userID 用户ID
   * @return 身体信息
   */
  @Select("SELECT * FROM body WHERE UserID = #{userID}")
  public Body getByUserID(String userID);

  @Insert(
      "INSERT INTO bodymetrics(UserID, HeightCM, WeightKG, RecordDate) VALUES  (#{userID}, #{heightCM}, #{weightKG}, #{recordDate})")
  @Options(useGeneratedKeys = true, keyProperty = "bodyMetricID", keyColumn = "BodyMetricID")
  public void insertBody(Body body);

  @Select("SELECT * FROM bodymetrics WHERE BodyMetricID = #{bodyMetricID}")
  public Body getByBodyID(int bodyMetricID);

  @Update(
      "UPDATE bodymetrics SET HeightCM = #{heightCM}, WeightKG = #{weightKG}, RecordDate = #{recordDate} WHERE BodyMetricID = #{bodyMetricID}")
  public void updateBody(Body body);

  List<Body> list(String userID, LocalDate begin, LocalDate end);

  @Delete("DELETE FROM bodymetrics WHERE BodyMetricID = #{bodyMetricID}")
  void removeBody(int bodyMetricID);
}
