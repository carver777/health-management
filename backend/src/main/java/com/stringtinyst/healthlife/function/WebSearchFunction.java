package com.stringtinyst.healthlife.function;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Component;

/**
 * 联网搜索功能
 *
 * <p>使用 DuckDuckGo 或其他搜索引擎为 AI 提供实时网络搜索能力
 */
@Slf4j
@Component
public class WebSearchFunction {

  @Value("${web.search.enabled:true}")
  private boolean searchEnabled;

  private final OkHttpClient httpClient;

  public WebSearchFunction() {
    this.httpClient =
        new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build();
  }

  /** 搜索请求 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SearchRequest {
    @JsonProperty(required = true)
    @JsonPropertyDescription("搜索关键词或问题")
    private String query;

    @JsonPropertyDescription("最大搜索结果数量，默认 5，最大 10")
    private Integer maxResults = 5;
  }

  /** 搜索结果项 */
  @Data
  public static class SearchResult {
    private String title;
    private String url;
    private String snippet;
  }

  @Bean
  @Description("在互联网上搜索信息，获取最新的健康、营养、运动等相关知识。当用户询问需要最新信息或实时数据的问题时使用此功能。")
  public Function<SearchRequest, String> webSearch() {
    return request -> {
      if (!searchEnabled) {
        return "网络搜索功能当前未启用";
      }

      try {
        int maxResults = Math.min(request.getMaxResults(), 10);
        List<SearchResult> results = searchDuckDuckGo(request.getQuery(), maxResults);

        if (results.isEmpty()) {
          return "未找到相关搜索结果";
        }

        StringBuilder response = new StringBuilder();
        response.append(String.format("找到 %d 条搜索结果:\n\n", results.size()));

        for (int i = 0; i < results.size(); i++) {
          SearchResult result = results.get(i);
          response.append(String.format("%d. **%s**\n", i + 1, result.getTitle()));
          response.append(String.format("   %s\n", result.getSnippet()));
          response.append(String.format("   来源: %s\n\n", result.getUrl()));
        }

        return response.toString();
      } catch (Exception e) {
        log.error("网络搜索失败: query={}", request.getQuery(), e);
        return "网络搜索失败: " + e.getMessage();
      }
    };
  }

  /**
   * 使用 DuckDuckGo Instant Answer API 进行搜索
   *
   * @param query 搜索关键词
   * @param maxResults 最大结果数
   * @return 搜索结果列表
   */
  private List<SearchResult> searchDuckDuckGo(String query, int maxResults) throws IOException {
    List<SearchResult> results = new ArrayList<>();

    // 使用 DuckDuckGo HTML 搜索（更稳定）
    String searchUrl =
        String.format(
            "https://html.duckduckgo.com/html/?q=%s", java.net.URLEncoder.encode(query, "UTF-8"));

    Request request =
        new Request.Builder()
            .url(searchUrl)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            .build();

    try (Response response = httpClient.newCall(request).execute()) {
      if (!response.isSuccessful()) {
        log.warn("DuckDuckGo 搜索请求失败: {}", response.code());
        return searchDuckDuckGoAPI(query, maxResults);
      }

      String html = response.body().string();
      results = parseDuckDuckGoHtml(html, maxResults);
    }

    return results;
  }

  /**
   * 使用 DuckDuckGo Instant Answer API
   *
   * @param query 搜索关键词
   * @param maxResults 最大结果数
   * @return 搜索结果列表
   */
  private List<SearchResult> searchDuckDuckGoAPI(String query, int maxResults) throws IOException {
    List<SearchResult> results = new ArrayList<>();

    String apiUrl =
        String.format(
            "https://api.duckduckgo.com/?q=%s&format=json&no_html=1&skip_disambig=1",
            java.net.URLEncoder.encode(query, "UTF-8"));

    Request request = new Request.Builder().url(apiUrl).build();

    try (Response response = httpClient.newCall(request).execute()) {
      if (!response.isSuccessful()) {
        throw new IOException("DuckDuckGo API 请求失败: " + response.code());
      }

      String jsonData = response.body().string();
      JSONObject json = JSON.parseObject(jsonData);

      // 提取摘要信息
      String abstractText = json.getString("Abstract");
      String abstractSource = json.getString("AbstractSource");
      String abstractUrl = json.getString("AbstractURL");

      if (abstractText != null && !abstractText.isEmpty()) {
        SearchResult result = new SearchResult();
        result.setTitle(abstractSource != null ? abstractSource : "DuckDuckGo");
        result.setSnippet(abstractText);
        result.setUrl(abstractUrl != null ? abstractUrl : "");
        results.add(result);
      }

      // 提取相关主题
      JSONArray relatedTopics = json.getJSONArray("RelatedTopics");
      if (relatedTopics != null) {
        for (int i = 0; i < Math.min(relatedTopics.size(), maxResults - results.size()); i++) {
          JSONObject topic = relatedTopics.getJSONObject(i);
          if (topic != null && topic.containsKey("Text")) {
            SearchResult result = new SearchResult();
            result.setTitle(topic.getString("FirstURL") != null ? "相关主题" : "DuckDuckGo");
            result.setSnippet(topic.getString("Text"));
            result.setUrl(topic.getString("FirstURL"));
            results.add(result);
          }
        }
      }
    }

    return results;
  }

  /**
   * 解析 DuckDuckGo HTML 搜索结果
   *
   * @param html HTML 内容
   * @param maxResults 最大结果数
   * @return 搜索结果列表
   */
  private List<SearchResult> parseDuckDuckGoHtml(String html, int maxResults) {
    List<SearchResult> results = new ArrayList<>();

    // 简单的 HTML 解析（生产环境建议使用 Jsoup 等专业库）
    try {
      String[] resultBlocks = html.split("result__a");

      for (int i = 1; i < Math.min(resultBlocks.length, maxResults + 1); i++) {
        String block = resultBlocks[i];

        SearchResult result = new SearchResult();

        // 提取标题
        int titleStart = block.indexOf(">") + 1;
        int titleEnd = block.indexOf("</a>");
        if (titleStart > 0 && titleEnd > titleStart) {
          result.setTitle(cleanHtml(block.substring(titleStart, titleEnd)));
        }

        // 提取 URL
        int urlStart = block.indexOf("href=\"") + 6;
        int urlEnd = block.indexOf("\"", urlStart);
        if (urlStart > 5 && urlEnd > urlStart) {
          String url = block.substring(urlStart, urlEnd);
          // DuckDuckGo 使用重定向 URL
          if (url.startsWith("//duckduckgo.com/l/?uddg=")) {
            url = java.net.URLDecoder.decode(url.substring(25), "UTF-8");
          }
          result.setUrl(url);
        }

        // 提取摘要（简化处理）
        result.setSnippet("搜索结果摘要");

        if (result.getTitle() != null && result.getUrl() != null) {
          results.add(result);
        }
      }
    } catch (Exception e) {
      log.error("解析 DuckDuckGo HTML 失败", e);
    }

    return results;
  }

  /** 清理 HTML 标签 */
  private String cleanHtml(String html) {
    return html.replaceAll("<[^>]*>", "")
        .replaceAll("&nbsp;", " ")
        .replaceAll("&amp;", "&")
        .replaceAll("&quot;", "\"")
        .trim();
  }
}
