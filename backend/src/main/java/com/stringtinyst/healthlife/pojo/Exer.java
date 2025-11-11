package com.stringtinyst.healthlife.pojo;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Exercise item entity */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Exer {
  private int exerciseItemID;
  private String userID;
  private LocalDate recordDate;
  private String exerciseType;
  private int durationMinutes;
  private Integer estimatedCaloriesBurned;
}
