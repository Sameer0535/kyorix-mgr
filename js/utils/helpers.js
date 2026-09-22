// Helper functions for formatting, badges, modals, and notifications
import { TKD_BELTS } from '../tkdConstants.js';

export function getBeltBadge(beltId, customClass = '') {
    const belt = TKD_BELTS.find(b => b.id === beltId) || { name: beltId || 'Color Belt', color: '#0f172a' };
    let dotStyle = `background-color: ${belt.color === '#ffffff' ? '#cbd5e1' : belt.color};`;
    if (belt.halfColor) {
        dotStyle = `background: linear-gradient(90deg, #0f172a 50%, #dc2626 50%);`;
    }
    return `<span class="inline-flex items-center gap-1.5 font-semibold text-white text-xs whitespace-nowrap ${customClass}"><span class="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-300" style="${dotStyle}"></span><span class="text-white">${belt.name}</span></span>`;
}

export function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `tkd-toast tkd-toast-${type} animate-slide-in`;

    const iconMap = {
        success: 'fa-circle-check text-emerald-400',
        error: 'fa-circle-exclamation text-rose-500',
        warning: 'fa-triangle-exclamation text-amber-400',
        info: 'fa-circle-info text-cyan-400'
    };

    const icon = iconMap[type] || iconMap.info;

    toast.innerHTML = `
        <div class="tkd-toast-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="tkd-toast-content">
            ${title ? `<div class="tkd-toast-title">${title}</div>` : ''}
            <div class="tkd-toast-message">${message}</div>
        </div>
        <button class="tkd-toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    toast.querySelector('.tkd-toast-close').addEventListener('click', () => {
        toast.classList.add('animate-slide-out');
        setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
        if (toast.isConnected) {
            toast.classList.add('animate-slide-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, 4500);
}

export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

export function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export function calculateAge(dobString) {
    if (!dobString) return 16;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
