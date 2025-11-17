export const getDeviceFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let canvasHash = '';

    if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
        canvasHash = canvas.toDataURL();
    }

    const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: screen.width,
        screenHeight: screen.height,
        colorDepth: screen.colorDepth,
        timezone: new Date().getTimezoneOffset(),
        canvas: canvasHash,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
    };

    // Create hash from fingerprint
    const fingerprintString = JSON.stringify(fingerprint);
    return btoa(fingerprintString).substring(0, 64);
};