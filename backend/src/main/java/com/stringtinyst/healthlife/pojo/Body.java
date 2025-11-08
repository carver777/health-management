package com.stringtinyst.healthlife.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Body metrics entity
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Body {
    private int bodyMetricID;
    private String userID;
    private BigDecimal heightCM;
    private BigDecimal weightKG;
    private LocalDate recordDate;
}
