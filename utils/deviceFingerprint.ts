async function sha256(value: string) {
    const encoded = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', encoded);

    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

export const getDeviceFingerprint = async (): Promise<string> => {
    const browserDocument = document as unknown as {
        createElement: (tagName: 'canvas') => {
            getContext: (contextId: '2d') => {
                textBaseline: string;
                font: string;
                fillText: (text: string, x: number, y: number) => void;
            } | null;
            toDataURL: () => string;
        };
    };
    const browserNavigator = navigator as unknown as {
        userAgent: string;
        language: string;
        platform: string;
        hardwareConcurrency?: number;
    };
    const browserScreen = screen as unknown as {
        width: number;
        height: number;
        colorDepth: number;
    };
    const canvas = browserDocument.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let canvasSample = '';

    if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
        canvasSample = canvas.toDataURL().slice(0, 256);
    }

    const fingerprint = {
        userAgent: browserNavigator.userAgent,
        language: browserNavigator.language,
        platform: browserNavigator.platform,
        screenWidth: browserScreen.width,
        screenHeight: browserScreen.height,
        colorDepth: browserScreen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvasSample,
        hardwareConcurrency: browserNavigator.hardwareConcurrency || 0,
    };

    return sha256(JSON.stringify(fingerprint));
};
