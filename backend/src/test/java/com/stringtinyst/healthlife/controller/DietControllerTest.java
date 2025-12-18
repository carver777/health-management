package com.stringtinyst.healthlife.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stringtinyst.healthlife.interceptor.LoginCheckInterceptor;
import com.stringtinyst.healthlife.pojo.Diet;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.service.DietService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DietController.class)
class DietControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private DietService dietService;
  @MockitoBean private LoginCheckInterceptor loginCheckInterceptor;

  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() throws Exception {
    objectMapper = new ObjectMapper().findAndRegisterModules();
    when(loginCheckInterceptor.preHandle(any(), any(), any())).thenReturn(true);
  }

  @Test
  @DisplayName("查询 Diet 列表返回分页数据")
  void listDietItems() throws Exception {
    Diet sample = new Diet(10, "u1", LocalDate.parse("2024-03-01"), "Apple", "breakfast", 120);
    when(dietService.page(
            eq(1), eq(10), eq("u1"), Mockito.isNull(), Mockito.isNull(), Mockito.isNull()))
        .thenReturn(new PageBean(1L, List.of(sample)));

    mockMvc
        .perform(get("/diet-items").param("userID", "u1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data.total").value(1))
        .andExpect(jsonPath("$.data.rows[0].foodName").value("Apple"));
  }

  @Test
  @DisplayName("新增 Diet 记录返回生成的 ID")
  void addDietItem() throws Exception {
    doAnswer(
            invocation -> {
              Diet diet = invocation.getArgument(0);
              diet.setDietItemID(200);
              return null;
            })
        .when(dietService)
        .addDiet(any(Diet.class));

    String payload =
        objectMapper.writeValueAsString(
            new Diet(0, "u2", LocalDate.parse("2024-03-02"), "Rice", "lunch", 500));

    mockMvc
        .perform(post("/diet-items").contentType(MediaType.APPLICATION_JSON).content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data").value(200));
  }
}
