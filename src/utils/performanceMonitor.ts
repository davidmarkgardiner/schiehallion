// Performance monitoring utilities for image loading

interface LoadingMetrics {
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: LoadingMetrics[] = [];
  private readonly MAX_METRICS = 100; // Keep only last 100 measurements

  /**
   * Start tracking image load performance
   */
  startImageLoad(url: string): string {
    const id = `${url}-${Date.now()}`;
    const metric: LoadingMetrics = {
      url,
      startTime: performance.now(),
      success: false
    };

    this.metrics.push(metric);

    // Keep metrics array size manageable
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    return id;
  }

  /**
   * End tracking image load performance
   */
  endImageLoad(url: string, success: boolean, error?: string): void {
    const metric = this.metrics
      .reverse()
      .find(m => m.url === url && !m.endTime);

    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.success = success;
      metric.error = error;
    }

    // Reverse back to maintain order
    this.metrics.reverse();
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalImages: number;
    successfulLoads: number;
    failedLoads: number;
    averageLoadTime: number;
    slowestLoad: number;
    fastestLoad: number;
    recentFailures: string[];
  } {
    const completedMetrics = this.metrics.filter(m => m.duration !== undefined);
    const successfulMetrics = completedMetrics.filter(m => m.success);
    const failedMetrics = completedMetrics.filter(m => !m.success);

    const durations = successfulMetrics.map(m => m.duration!);

    return {
      totalImages: completedMetrics.length,
      successfulLoads: successfulMetrics.length,
      failedLoads: failedMetrics.length,
      averageLoadTime: durations.length > 0 ?
        durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      slowestLoad: durations.length > 0 ? Math.max(...durations) : 0,
      fastestLoad: durations.length > 0 ? Math.min(...durations) : 0,
      recentFailures: failedMetrics
        .slice(-5)
        .map(m => m.url)
    };
  }

  /**
   * Log performance stats to console (dev mode only)
   */
  logStats(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const stats = this.getStats();
    console.group('🖼️ Image Loading Performance');
    console.log(`Total Images: ${stats.totalImages}`);
    console.log(`Success Rate: ${((stats.successfulLoads / stats.totalImages) * 100).toFixed(1)}%`);
    console.log(`Average Load Time: ${stats.averageLoadTime.toFixed(0)}ms`);
    console.log(`Fastest Load: ${stats.fastestLoad.toFixed(0)}ms`);
    console.log(`Slowest Load: ${stats.slowestLoad.toFixed(0)}ms`);

    if (stats.recentFailures.length > 0) {
      console.log('Recent Failures:', stats.recentFailures);
    }
    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get recent metrics for debugging
   */
  getRecentMetrics(count: number = 10): LoadingMetrics[] {
    return this.metrics.slice(-count);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for components to use performance monitoring
export function useImagePerformanceMonitor() {
  const trackImageLoad = (url: string) => {
    return {
      onLoadStart: () => performanceMonitor.startImageLoad(url),
      onLoadEnd: (success: boolean, error?: string) =>
        performanceMonitor.endImageLoad(url, success, error),
      getStats: () => performanceMonitor.getStats()
    };
  };

  return { trackImageLoad, monitor: performanceMonitor };
}