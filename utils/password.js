const crypto = require('crypto');

function generatePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        password += chars.charAt(bytes[i] % chars.length);
    }
    return password;
}

const SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}',
};
const AMBIGUOUS = /[Il1O0o]/g;

function generatePasswordAdvanced({ length = 16, lowercase = true, uppercase = true,
                                    digits = true, symbols = true, excludeAmbiguous = false } = {}) {
    const flags = { lowercase, uppercase, digits, symbols };
    const pools = Object.keys(flags)
        .filter(k => flags[k])
        .map(k => (excludeAmbiguous ? SETS[k].replace(AMBIGUOUS, '') : SETS[k]));
    if (pools.length === 0) throw new Error('Не выбран ни один набор символов');

    const all = pools.join('');
    // минимум по одному символу из каждого выбранного набора
    const chars = pools.map(p => p[crypto.randomInt(p.length)]);
    while (chars.length < length) chars.push(all[crypto.randomInt(all.length)]);
    // перемешивание (Фишер–Йетс)
    for (let i = chars.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

function checkStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(pw)).length;
    if (classes >= 3) score++;
    if (classes === 4) score++;
    if (/(.)\1{2,}/.test(pw) || /^(123|abc|qwerty|password)/i.test(pw)) score = Math.max(0, score - 2);
    const labels = ['очень слабый', 'слабый', 'средний', 'хороший', 'сильный', 'отличный'];
    return { score, label: labels[score], length: pw.length, character_classes: classes };
}

module.exports = { generatePassword, generatePasswordAdvanced, checkStrength };