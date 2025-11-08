package com.stringtinyst.healthlife.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Diet item entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Diet {
    private int dietItemID;
    private String userID;
    private LocalDate recordDate;
    private String foodName;
    private String mealType;
    private Integer estimatedCalories;
}
