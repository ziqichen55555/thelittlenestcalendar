export interface WeatherData {
  temp: string;
  condition: string;
  icon: string;
}

const WEATHER_CACHE_KEY = 'perth-weather-cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 分钟

export const fetchPerthWeather = async (): Promise<WeatherData | null> => {
  try {
    // 检查缓存
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    // 使用 wttr.in API（免费，无需 API key）
    const response = await fetch('https://wttr.in/Perth?format=j1&lang=zh');
    if (!response.ok) {
      throw new Error('天气数据获取失败');
    }

    const data = await response.json();
    const current = data.current_condition[0];
    
    const weatherData: WeatherData = {
      temp: current.temp_C + '°C',
      condition: current.lang_zh[0]?.value || current.weatherDesc[0]?.value || '未知',
      icon: getWeatherIcon(current.weatherCode),
    };

    // 保存到缓存
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
      data: weatherData,
      timestamp: Date.now(),
    }));

    return weatherData;
  } catch (error) {
    console.error('获取天气失败:', error);
    return null;
  }
};

// 根据天气代码返回 emoji 图标
const getWeatherIcon = (code: string): string => {
  const codeNum = parseInt(code);
  if (codeNum >= 113 && codeNum <= 116) return '☀️'; // 晴天/部分多云
  if (codeNum >= 119 && codeNum <= 122) return '☁️'; // 多云/阴天
  if (codeNum >= 143 && codeNum <= 248) return '🌫️'; // 雾
  if (codeNum >= 260 && codeNum <= 263) return '🌧️'; // 小雨
  if (codeNum >= 266 && codeNum <= 272) return '🌧️'; // 雨
  if (codeNum >= 281 && codeNum <= 284) return '🌧️'; // 冻雨
  if (codeNum >= 293 && codeNum <= 299) return '🌦️'; // 阵雨
  if (codeNum >= 300 && codeNum <= 302) return '🌦️'; // 小雨
  if (codeNum >= 305 && codeNum <= 308) return '🌧️'; // 中雨/大雨
  if (codeNum >= 311 && codeNum <= 314) return '🌧️'; // 雨
  if (codeNum >= 353 && codeNum <= 356) return '🌦️'; // 阵雨
  if (codeNum >= 359 && codeNum <= 365) return '🌧️'; // 雨
  if (codeNum >= 371 && codeNum <= 377) return '❄️'; // 雪
  if (codeNum >= 386 && codeNum <= 389) return '⛈️'; // 雷暴
  if (codeNum >= 395 && codeNum <= 399) return '❄️'; // 雪
  return '🌤️'; // 默认
};

