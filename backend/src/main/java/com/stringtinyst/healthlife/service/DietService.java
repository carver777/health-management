package com.stringtinyst.healthlife.service;

import com.stringtinyst.healthlife.pojo.Diet;
import com.stringtinyst.healthlife.pojo.PageBean;

import java.time.LocalDate;

public interface DietService {
    void addDiet(Diet diet);

    int searchdietItemID(Diet diet);

    PageBean page(Integer page, Integer pageSize, String userID,LocalDate startDate, LocalDate endDate, String mealType);

    Diet getByDietItemByID(int dietItemID);

    void updateDiet(Diet diet);

    void deleteDiet(int dietItemID);
}
