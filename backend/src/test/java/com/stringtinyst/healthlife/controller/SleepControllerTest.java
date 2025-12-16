package com.stringtinyst.healthlife.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stringtinyst.healthlife.interceptor.LoginCheckInterceptor;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.pojo.Sleep;
import com.stringtinyst.healthlife.service.SleepService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SleepController.class)
class SleepControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private SleepService sleepService;
  @MockitoBean private LoginCheckInterceptor loginCheckInterceptor;

  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() throws Exception {
    objectMapper = new ObjectMapper().findAndRegisterModules();
    when(loginCheckInterceptor.preHandle(any(), any(), any())).thenReturn(true);
  }

  @Test
  @DisplayName("查询 Sleep 列表返回分页数据")
  void listSleepItems() throws Exception {
    Sleep sample =
        new Sleep(
            8,
            "u1",
            LocalDate.parse("2024-04-01"),
            LocalDateTime.parse("2024-03-31T23:00:00"),
            LocalDateTime.parse("2024-04-01T07:00:00"));

    when(sleepService.page(eq(1), eq(10), eq("u1"), any(), any()))
        .thenReturn(new PageBean(1L, List.of(sample)));

    mockMvc
        .perform(get("/sleep-items").param("userID", "u1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data.total").value(1))
        .andExpect(jsonPath("$.data.rows[0].sleepItemID").value(8));
  }

  @Test
  @DisplayName("新增 Sleep 记录返回生成的 ID")
  void addSleepItem() throws Exception {
    when(sleepService.searchSleepItemID(any(Sleep.class))).thenReturn(456);

    String payload =
        objectMapper.writeValueAsString(
            new Sleep(
                0,
                "u2",
                LocalDate.parse("2024-04-02"),
                LocalDateTime.parse("2024-04-01T22:30:00"),
                LocalDateTime.parse("2024-04-02T06:30:00")));

    mockMvc
        .perform(post("/sleep-items").contentType(MediaType.APPLICATION_JSON).content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data").value(456));
  }
}
