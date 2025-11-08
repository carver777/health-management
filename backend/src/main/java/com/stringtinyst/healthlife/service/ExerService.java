package com.stringtinyst.healthlife.service;

import com.stringtinyst.healthlife.pojo.Exer;
import com.stringtinyst.healthlife.pojo.PageBean;

import java.time.LocalDate;

public interface ExerService {
    PageBean page(Integer page, Integer pageSize, String userID,LocalDate startDate, LocalDate endDate, String exerciseType);

    void addExer(Exer exer);

    int searchExerItemID(Exer exer);

    Exer getByExerItemID(int exerciseItemID);

    void updateExer(Exer exer);

    void deleteExer(int exerciseItemID);
}
