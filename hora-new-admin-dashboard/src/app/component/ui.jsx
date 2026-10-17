
'use client';

/** Shared building blocks: status chips, KPI tiles, cards, bar lists, sparklines, tooltip. */
import { useEffect, useRef, useState } from 'react';
import { LEVEL_LABEL } from '../../lib/format';

const ICONS = {
    critical: (
        <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 3.2v3.3M6 8.4v.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
    ),
    serious: (
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.2 11 10.5H1z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M6 4.6v2.6M6 8.7v.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    ),
    warning: (
        <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 3.3V6l1.8 1.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    ),
    ok: (
        <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m3.6 6.1 1.7 1.7 3.1-3.3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
    closed: (
        <svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1.5" y="1.5" width="9" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M4 6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    ),
};

/** Status always carries an icon and a label, never color alone. */
export function StatusChip({ level, text }) {
    return (
        <span className={`status ${level}`}>
            {ICONS[level]}
            {text || LEVEL_LABEL[level]}
        </span>
    );
}

export function Kpi({ label, value, note, alert, tip }) {
    return (
        <div className={`kpi${alert ? ' alert' : ''}`} data-tip={tip}>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
            {note !== undefined && <div className="kpi-note">{note}</div>}
        </div>
    );
}

export function Card({ span, title, sub, children }) {
    return (
        <section className={`card span-${span}`}>
            <div className="card-head">
                <div>
                    <h2>{title}</h2>
                    {sub && <p className="card-sub">{sub}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

export function HBars({ items }) {
    const max = Math.max(1, ...items.map(i => i.value));
    return (
        <div className="hbars">
            {items.map(i => (
                <div className="hbar" key={i.label} data-tip={i.tip}>
                    <div className="hbar-label" title={i.label}>{i.label}</div>
                    <div className="hbar-track">
                        <div className={`hbar-fill${i.critical ? ' critical' : ''}`} style={{ width: `${((i.value / max) * 100).toFixed(1)}%` }} />
                    </div>
                    <div className="hbar-value">{i.display}</div>
                </div>
            ))}
        </div>
    );
}

export function Spark({ values, tip }) {
    const W = 112, H = 30, P = 3;
    const max = Math.max(1, ...values);
    const pts = values.map((v, i) => [P + (i * (W - 2 * P)) / (values.length - 1), H - P - (v / max) * (H - 2 * P)]);
    const line = pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const last = pts[pts.length - 1];
    return (
        <svg className="spark" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Calls per day"
            data-tip={`${tip}\nToday: ${values[values.length - 1]} · busiest day: ${max}`}>
            <polygon className="area" points={`${P},${H - P} ${line} ${W - P},${H - P}`} />
            <polyline points={line} />
            <circle cx={last[0]} cy={last[1]} r="2.5" />
        </svg>
    );
}

/**
 * One tooltip for the whole page: any element with data-tip="Title\nline\nline"
 * shows it on hover. Text only (first line bold).
 */
export function TooltipLayer() {
    const ref = useRef(null);
    const [text, setText] = useState(null);

    useEffect(() => {
        let current = null;

        const hide = () => {
            current?.classList.remove('is-hover');
            current = null;
            setText(null);
        };

        const move = (e) => {
            const el = e.target?.closest?.('[data-tip]');
            const tip = el?.getAttribute('data-tip');

            if (!el || !tip) return hide();

            if (el !== current) {
                current?.classList.remove('is-hover');
                current = el;
                el.classList.add('is-hover');
                setText(tip);
            }

            const box = ref.current;
            if (!box) return;

            const w = box.offsetWidth, h = box.offsetHeight;
            let x = e.clientX + 14, y = e.clientY + 14;

            if (x + w > window.innerWidth - 8) x = e.clientX - w - 14;
            if (y + h > window.innerHeight - 8) y = e.clientY - h - 14;

            box.style.left = `${Math.max(8, x)}px`;
            box.style.top = `${Math.max(8, y)}px`;
        };

        document.addEventListener('pointermove', move);
        document.addEventListener('scroll', hide, true);
        document.documentElement.addEventListener('pointerleave', hide);

        return () => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('scroll', hide, true);
            document.documentElement.removeEventListener('pointerleave', hide);
        };
    }, []);

    return (
        <div ref={ref} className="tip" hidden={!text} role="tooltip">
            {text?.split('\n').map((line, i) => <div key={i} className="tip-line">{line}</div>)}
        </div>
    );
}
