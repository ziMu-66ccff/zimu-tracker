export function getCacheData() {
  const resourceDatas = performance.getEntriesByType('resource');
  let cacheHitQuantity = 0;
  resourceDatas.forEach((resourceData) => {
    if ((resourceData as any).deliveryType === 'cache') cacheHitQuantity++;
    else if (resourceData.duration === 0 && resourceData.transferSize !== 0) cacheHitQuantity++;
  });
  return {
    cacheHitQuantity,
    noCacheHitQuantity: resourceDatas.length - cacheHitQuantity,
    cacheHitRate: (cacheHitQuantity / resourceDatas.length).toFixed(2),
  };
}
