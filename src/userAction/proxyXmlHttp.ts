import { type HttpMetrics } from '@/types';
import { formatDate } from '@/utils';

export function proxyXmlHttp(loadHandler: (...args: any[]) => any) {
  if ('XMLHttpRequest' in window && typeof window.XMLHttpRequest === 'function') {
    const oXMLHttpRequest = window.XMLHttpRequest;
    if (!(window as any).oXMLHttpRequest) {
      // oXMLHttpRequest 为原生的 XMLHttpRequest，可以用以 SDK 进行数据上报，区分业务
      (window as any).oXMLHttpRequest = oXMLHttpRequest;
    }
    (window as any).XMLHttpRequest = function () {
      // 覆写 window.XMLHttpRequest
      // eslint-disable-next-line new-cap
      const xhr = new oXMLHttpRequest();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { open, send } = xhr;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      let httpMetrics: HttpMetrics = {} as HttpMetrics;
      xhr.open = (method, url) => {
        httpMetrics.method = method;
        httpMetrics.url = url;
        open.call(xhr, method, url, true);
      };
      xhr.send = (body) => {
        httpMetrics.body = body ?? '';
        httpMetrics.requestTime = new Date().getTime();
        httpMetrics.requestTimeFormat = formatDate(new Date());
        send.call(xhr, body);
      };
      xhr.addEventListener('loadend', () => {
        const { status, statusText, response } = xhr;
        httpMetrics = {
          ...httpMetrics,
          status,
          statusText,
          response: response && JSON.parse(response),
          responseTime: new Date().getTime(),
          responseTimeFormat: formatDate(new Date()),
        };
        if (typeof loadHandler === 'function') loadHandler(httpMetrics);
      });
      return xhr;
    };
  }
}
