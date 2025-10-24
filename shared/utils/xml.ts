export const escapeXml = (str: string): string => {
    return String(str).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'})[c] || c);
};
