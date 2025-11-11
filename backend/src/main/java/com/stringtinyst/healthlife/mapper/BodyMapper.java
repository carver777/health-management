package com.stringtinyst.healthlife.mapper;

import com.stringtinyst.healthlife.pojo.Body;
import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.*;

@Mapper
public interface BodyMapper {

  @Select("SELECT count(*) FROM bodymetrics")
  public Long count();

  @Select("SELECT * FROM bodymetrics LIMIT #{start}, #{pageSize}")
  public List<Body> page(Integer start, Integer pageSize);

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
  public void insertBody(Body body);

  @Select("SELECT * FROM bodymetrics WHERE BodyMetricID = #{bodyMetricID}")
  public Body getByBodyID(int bodyMetricID);

  @Update(
      "UPDATE bodymetrics SET HeightCM = #{heightCM}, WeightKG = #{weightKG}, RecordDate = #{recordDate} WHERE BodyMetricID = #{bodyMetricID}")
  public void updateBody(Body body);

  @Select(
      "SELECT BodyMetricID FROM bodymetrics WHERE UserID = #{userID} AND HeightCM = #{heightCM} AND WeightKG = #{weightKG} AND RecordDate = #{recordDate}")
  public int searchbodyID(Body body);

  List<Body> list(String userID, LocalDate begin, LocalDate end);

  @Delete("DELETE FROM bodymetrics WHERE BodyMetricID = #{bodyMetricID}")
  void removeBody(int bodyMetricID);
}
