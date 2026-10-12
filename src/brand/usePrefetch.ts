// Image sequences swap their <Img> src every frame. Rendering waits for each image, but Studio playback
// doesn't, so unloaded frames show blank. Prefetching them once in the Studio/Player makes playback steady; Remotion's
// <Img> picks up the prefetched copies by itself. Renders skip this.
import { useEffect } from "react";
import { getRemotionEnvironment, prefetch } from "remotion";

export const usePrefetch = (srcs: string[]) => {
  const key = srcs.join("|");
  useEffect(() => {
    if (getRemotionEnvironment().isRendering) return;
    const handles = srcs.map((src) => prefetch(src, { method: "blob-url" }));
    return () => handles.forEach((h) => h.free());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};
