let setLoadingFn: ((v: boolean) => void) | null = null;

export function registerGlobalLoading(setter: (v: boolean) => void) {
  setLoadingFn = setter;
}

export function showGlobalLoading() {
  try { setLoadingFn && setLoadingFn(true); } catch { }
}

export function hideGlobalLoading() {
  try { setLoadingFn && setLoadingFn(false); } catch { }
}


