package com.stringtinyst.healthlife.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.stringtinyst.healthlife.mapper.DietMapper;
import com.stringtinyst.healthlife.pojo.Diet;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.service.DietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DietServiceImpl implements DietService {

    @Autowired
    private DietMapper dietMapper;


    @Override
    public void addDiet(Diet diet) {
        dietMapper.insertDiet(diet);
    }

    @Override
    public int searchdietItemID(Diet diet) {
        return dietMapper.searchdietItemID(diet);
    }

    @Override
    public PageBean page(Integer page, Integer pageSize, String userID,LocalDate startDate, LocalDate endDate, String mealType) {
        PageHelper.startPage(page,pageSize);
        List<Diet> dietList = dietMapper.list(userID,startDate,endDate,mealType);
        Page<Diet> dietPage = (Page<Diet>) dietList;
        PageBean pageBean = new PageBean(dietPage.getTotal(),dietPage.getResult());
        return pageBean;
    }

    @Override
    public Diet getByDietItemByID(int dietItemID) {
        return dietMapper.getByDietItemByID(dietItemID);
    }

    @Override
    public void updateDiet(Diet diet) {
        dietMapper.updateDiet(diet);
    }

    @Override
    public void deleteDiet(int dietItemID) {
        dietMapper.deleteDiet(dietItemID);
    }
}
