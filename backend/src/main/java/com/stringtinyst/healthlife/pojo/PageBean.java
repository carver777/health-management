package com.stringtinyst.healthlife.pojo;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageBean {
  private Long total; // 总记录数
  // 多态子类可以赋值给父类
  private List rows; // 数据列表
}
