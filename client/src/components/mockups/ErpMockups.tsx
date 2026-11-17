import React from 'react';
import type {
    CardType,
    ErpMockupText,
    MarkerState,
    NavKey,
    PickingText,
    PipelineCard,
    QueueItem,
    Segment,
    WindowText,
} from './erpMockupData';

const ICONS = {
    briefcase: ['M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z', 'M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2', 'M22 13a18.15 18.15 0 0 1-20 0', 'M12 12h.01'],
    calendar: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M8 2v4', 'M16 2v4', 'M3 10h18', 'M8 14h.01', 'M12 14h.01', 'M16 14h.01', 'M8 18h.01', 'M12 18h.01'],
    handshake: ['m11 17 2 2a1 1 0 1 0 3-3', 'm14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4', 'm21 3 1 11h-2', 'M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3', 'M3 4h8'],
    cart: ['c8 21 1', 'c19 21 1', 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'],
    package: ['M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z', 'M12 22V12', 'm3.3 7 8.7 5 8.7-5', 'm7.5 4.27 9 5.15'],
    truck: ['M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2', 'M15 18H9', 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14', 'c17 18 2', 'c7 18 2'],
    warehouse: ['M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z', 'M6 18h12', 'M6 14h12', 'M6 22V10h12v12'],
    message: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
    square: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
    panel: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M9 3v18'],
    menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
    help: ['c12 12 10', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01'],
    plusCircle: ['c12 12 10', 'M8 12h8', 'M12 8v8'],
    plus: ['M5 12h14', 'M12 5v14'],
    refresh: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
    at: ['c12 12 4', 'M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8'],
    bulb: ['M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5', 'M9 18h6', 'M10 22h4'],
    archive: ['M3 3h18a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8', 'M10 12h4'],
    sliders: ['M21 4h-7', 'M10 4H3', 'M21 12h-9', 'M8 12H3', 'M21 20h-5', 'M12 20H3', 'M14 2v4', 'M8 10v4', 'M16 18v4'],
    target: ['c12 12 10', 'c12 12 6', 'c12 12 2'],
    file: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M10 9H8', 'M16 13H8', 'M16 17H8'],
    star: ['M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.91l5.16-.75a2.12 2.12 0 0 0 1.6-1.16z'],
    clock: ['c12 12 10', 'M12 6v6l4 2'],
    more: ['c12 5 1', 'c12 12 1', 'c12 19 1'],
    pin: ['M20 10c0 5-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 15 4 10a8 8 0 0 1 16 0', 'c12 10 3'],
    copy: ['M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z', 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'],
    alert: ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
    search: ['c11 11 8', 'm21 21-4.3-4.3'],
    chevron: ['m6 9 6 6 6-6'],
    check: ['M20 6 9 17l-5-5'],
    pencil: ['M21.17 6.81a1 1 0 0 0-3.98-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z', 'm15 5 4 4'],
    wand: ['m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72', 'm14 7 3 3', 'M5 6v4', 'M19 14v4', 'M10 2v2', 'M7 8H3', 'M21 16h-4', 'M11 3H9'],
    download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
    arrowUp: ['m5 12 7-7 7 7', 'M12 19V5'],
    crosshair: ['c12 12 10', 'M22 12h-4', 'M6 12H2', 'M12 6V2', 'M12 22v-4'],
    route: ['c6 19 3', 'M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15', 'c18 5 3'],
    maximize: ['M15 3h6v6', 'M9 21H3v-6', 'M21 3l-7 7', 'M3 21l7-7'],
    panelRight: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M15 3v18', 'm8 9 3 3-3 3'],
} satisfies Record<string, string[]>;

type IconName = keyof typeof ICONS;

const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className }) => (
    <svg className={className ? `erpm-i ${className}` : 'erpm-i'} viewBox="0 0 24 24" aria-hidden="true">
        {ICONS[name].map(d => {
            if (!d.startsWith('c')) return <path key={d} d={d} />;
            const [cx, cy, r] = d.slice(1).split(' ');
            return <circle key={d} cx={cx} cy={cy} r={r} />;
        })}
    </svg>
);

const Logo: React.FC = () => (
    <svg className="erpm-logo" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#e8303f" />
        <path d="M5.4 17.4 16.3 5.5l.4 11.4h-4.6" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const Lemy: React.FC<{ className?: string }> = ({ className = 'erpm-lemy' }) => (
    <svg className={className} viewBox="0 0 32 24" aria-hidden="true">
        <path d="M11.5 7.5 8.2 2.6M20.5 7.5l3.3-4.9" stroke="#c4602e" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="8" cy="2.4" r="1.9" fill="#f7a764" stroke="#c4602e" strokeWidth=".6" />
        <circle cx="24" cy="2.4" r="1.9" fill="#f7a764" stroke="#c4602e" strokeWidth=".6" />
        <rect x="9.5" y="6" width="13" height="2.4" rx="1" fill="#2d3b68" />
        <rect x="1.6" y="7.6" width="28.8" height="15.4" rx="4.2" fill="#f0884a" stroke="#b9542a" strokeWidth=".9" />
        <rect x="5.6" y="8.6" width="20.8" height="13.4" rx="2.4" fill="#f4985c" />
        <path d="M9.6 15.4q1.7-2.2 3.4 0M19 15.4q1.7-2.2 3.4 0M13.9 17.7q1.05 1.1 2.1 0 1.05 1.1 2.1 0" fill="none" stroke="#2a1712" strokeWidth="1.05" strokeLinecap="round" />
        <ellipse cx="10.4" cy="18.2" rx="1.3" ry=".65" fill="#f2737f" />
        <ellipse cx="21.6" cy="18.2" rx="1.3" ry=".65" fill="#f2737f" />
    </svg>
);

const NAV: { key: NavKey; icon: IconName | 'lemy' }[] = [
    { key: 'hr', icon: 'briefcase' },
    { key: 'calendar', icon: 'calendar' },
    { key: 'crm', icon: 'handshake' },
    { key: 'sales', icon: 'cart' },
    { key: 'products', icon: 'package' },
    { key: 'logistics', icon: 'truck' },
    { key: 'wms', icon: 'warehouse' },
    { key: 'communicator', icon: 'message' },
    { key: 'lemy', icon: 'lemy' },
];

const Shell: React.FC<{ data: ErpMockupText; win: WindowText; active: NavKey; mod: string; children: React.ReactNode }> = ({ data, win, active, mod, children }) => {
    const { shell } = data;
    const [app, ...path] = win.crumb;
    return (
        <div className={`ui ui-panel ui-win erpm erpm--${mod}`} role="img" aria-label={win.label}>
            <div className="ui-win__bar">
                <span className="ui-dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="ui-win__crumb">
                    <Logo />{app}
                    {path.map((part, index) => (
                        <span className="erpm__crumbpart" key={part}><i>/</i>{index === path.length - 1 ? <b>{part}</b> : part}</span>
                    ))}
                </span>
            </div>
            <div className="erpm__app">
                <div className="erpm__mbar">
                    <Logo /><span>{shell.brand}</span>
                    <Icon name="menu" />
                </div>
                <div className="erpm__side">
                    <div className="erpm__brand"><span className="erpm__ic"><Logo /></span><span className="erpm__lbl">{shell.brand}</span><Icon name="panel" /></div>
                    <div className="erpm__nav">
                        {NAV.map(({ key, icon }) => (
                            <div className={key === active ? 'erpm__link is-on' : 'erpm__link'} key={key}>
                                <span className="erpm__ic">{icon === 'lemy' ? <Lemy className="erpm-lemy erpm-lemy--nav" /> : <Icon name={icon} />}</span>
                                <span className="erpm__lbl">{shell.nav[key]}</span>
                                {key === active && <Icon name="chevron" className="erpm__chev" />}
                            </div>
                        ))}
                    </div>
                    <div className="erpm__foot">
                        <div className="erpm__link"><span className="erpm__ic"><Icon name="help" /></span><span className="erpm__lbl">{shell.help}</span></div>
                        <div className="erpm__link erpm__user"><span className="erpm__ic"><span className="erpm-avatar">{shell.user.initials}</span></span><span className="erpm__lbl">{shell.user.name}</span></div>
                    </div>
                </div>
                <div className="erpm__main">
                    <div className="erpm__tabs">
                        {win.tabs.map((tab, index) => <span className={index === win.activeTab ? 'erpm__tab is-on' : 'erpm__tab'} key={tab}>{tab}</span>)}
                    </div>
                    <div className="erpm__page">{children}</div>
                </div>
            </div>
        </div>
    );
};

const Segmented: React.FC<{ segment: Segment }> = ({ segment }) => (
    <div className="erpm-seg">
        <span className="erpm-seg__label">{segment.label}</span>
        <span className="erpm-seg__box">
            {segment.options.map((option, index) => <span className={index === segment.active ? 'is-on' : undefined} key={option}>{option}</span>)}
        </span>
    </div>
);

const TYPE_ICON: Record<CardType, IconName> = { OPPORTUNITY: 'target', OFFER: 'file', ORDER: 'package' };

const idleLevel = (days: number) => (days <= 3 ? 'fresh' : days <= 7 ? 'warm' : 'stale');

const KanbanCard: React.FC<{ card: PipelineCard; data: ErpMockupText['pipeline'] }> = ({ card, data }) => (
    <div className={`erpm-card erpm-card--${card.type.toLowerCase()}${card.highlighted ? ' is-hi' : ' is-dim'}`}>
        <div className="erpm-card__top">
            <Icon name={TYPE_ICON[card.type]} />
            <span className="erpm-card__type">{data.types[card.type]}</span>
            {card.highlighted && <Icon name="star" className="erpm-star" />}
            {card.idleDays !== undefined && (
                <span className={`erpm-idle erpm-idle--${idleLevel(card.idleDays)}`}><Icon name="clock" />{card.idleDays}d</span>
            )}
            <Icon name="more" className="erpm-card__more" />
        </div>
        <div className="erpm-card__party">{card.party}</div>
        <div className="erpm-card__title">{card.reference ? `${card.title} · ${card.reference}` : card.title}</div>
        <div className="erpm-card__foot">
            <span className="erpm-card__value">{card.value}</span>
            <span className="erpm-card__owner">{card.owner}</span>
            <span className={`erpm-temp erpm-temp--${card.temperature.toLowerCase()}`}>{data.temperatures[card.temperature]}</span>
        </div>
    </div>
);

export const ErpPipeline: React.FC<{ data: ErpMockupText }> = ({ data }) => {
    const crm = data.pipeline;
    return (
        <Shell data={data} win={crm} active="crm" mod="pipeline">
            <div className="erpm-crm">
                <div className="erpm-crm__head">
                    <div className="erpm-row">
                        <span className="erpm-h1">{crm.title}</span>
                        <span className="erpm-badge">{crm.pipeline}</span>
                    </div>
                    <div className="erpm-row erpm-crm__actions">
                        <span className="erpm-btn erpm-btn--primary"><Icon name="plusCircle" /><span className="erpm-wide">{crm.create}</span></span>
                        <span className="erpm-btn"><Icon name="refresh" /><span className="erpm-wide">{crm.refresh}</span></span>
                        <span className="erpm-btn"><Icon name="at" /><span className="erpm-wide">{crm.mentions}</span></span>
                        <span className="erpm-btn"><Icon name="bulb" /><span className="erpm-wide">{crm.today.label}</span><em className="erpm-count">{crm.today.count}</em></span>
                        <span className="erpm-btn"><Icon name="archive" /><span className="erpm-wide">{crm.closed.label}</span><em className="erpm-count">{crm.closed.count}</em></span>
                    </div>
                </div>
                <div className="erpm-crm__controls">
                    <Segmented segment={crm.axis} />
                    <span className="erpm-crm__owner"><Segmented segment={crm.owner} /></span>
                    <span className="erpm-btn erpm-btn--xs"><Icon name="sliders" />{crm.filters}</span>
                </div>
                <div className="erpm-crm__stats">
                    {crm.stats.map(stat => <span className="erpm-stat" key={stat.label}><span>{stat.label}</span><b>{stat.value}</b></span>)}
                </div>
                <div className="erpm-board">
                    {crm.columns.map(column => (
                        <div className={`erpm-col erpm-col--${column.tone}`} key={column.title}>
                            <div className="erpm-col__head">
                                <span className="erpm-col__title">{column.title}</span>
                                <span className="erpm-col__prob">{column.probability}%</span>
                                <span className="erpm-col__count">{column.cards.length}</span>
                            </div>
                            <div className="erpm-col__body">
                                {column.cards.map(card => <KanbanCard card={card} data={crm} key={card.party + card.title} />)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Shell>
    );
};

const QueueCard: React.FC<{ item: QueueItem; suggested: string }> = ({ item, suggested }) => (
    <div className={`erpm-qi${item.selected ? ' is-sel' : ''}${item.suggested ? ' is-sug' : ''}`}>
        <span className="erpm-qi__row">
            <span className="erpm-qi__ref">{item.reference}</span>
            <span className={`erpm-status erpm-status--${item.tone}`}>{item.status}</span>
        </span>
        <span className="erpm-qi__grid">
            <span>{item.warehouse}</span><span>{item.group}</span><span>{item.assignee}</span><span className="erpm-mono">{item.positions}</span>
        </span>
        {item.suggested && <span className="erpm-qi__sug">{suggested}</span>}
    </div>
);

const Checkbox: React.FC<{ checked?: boolean }> = ({ checked }) => (
    <span className={checked ? 'erpm-check is-on' : 'erpm-check'}>{checked && <Icon name="check" />}</span>
);

const PickWorkspace: React.FC<{ wms: PickingText }> = ({ wms }) => (
    <div className="erpm-doc">
        <div className="erpm-doc__head">
            <div className="erpm-doc__line">
                <span className="erpm-doc__id">
                    <span className="erpm-eyebrow">{wms.task.type}</span>
                    <span className="erpm-doc__ref">{wms.task.reference}</span>
                    <Icon name="copy" />
                </span>
                <span className="erpm-status erpm-status--progress">{wms.task.status}</span>
            </div>
            <div className="erpm-doc__meta">
                {wms.task.meta.map(meta => <span key={meta.label}>{meta.label}: <b>{meta.value}</b></span>)}
            </div>
        </div>
        <div className="erpm-doc__body">
            <div className="erpm-prog">
                <span className="erpm-eyebrow">{wms.progress.title}</span>
                <span className="erpm-prog__note"><Icon name="alert" />{wms.progress.notice}</span>
                <div className="erpm-tbl erpm-prog__tbl">
                    <div className="erpm-tbl__head">{wms.progress.columns.map(column => <span key={column}>{column}</span>)}</div>
                    {wms.progress.rows.map(row => {
                        const left = row.toPick - row.confirmed;
                        return (
                            <div className="erpm-tbl__row" key={row.symbol}>
                                <span><b className="erpm-mono">{row.symbol}</b><em className="erpm-mono">{row.detail}</em></span>
                                <span>{row.toPick}</span>
                                <span>{row.confirmed}</span>
                                <span className={left > 0 ? 'is-warn' : 'is-ok'}>{left}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="erpm-tbl erpm-lines">
                <div className="erpm-tbl__head">{wms.lines.columns.map(column => <span key={column}>{column}</span>)}<span /></div>
                {wms.lines.rows.map(line => (
                    <div className={line.checked ? 'erpm-tbl__row is-done' : 'erpm-tbl__row'} key={line.symbol}>
                        <span className="erpm-lines__prod">
                            <b className="erpm-mono">{line.symbol}</b>
                            <em>{line.name}</em>
                            <i className="erpm-mono"><Icon name="pin" />{line.location}</i>
                        </span>
                        <span className="erpm-mono">{line.lot}</span>
                        <span className="erpm-mono">{line.expiration}</span>
                        <span className="erpm-lines__qty">{line.quantity}</span>
                        <span><Checkbox checked={line.checked} /></span>
                        <span>{!line.checked && <span className="erpm-btn erpm-btn--sm">{wms.lines.shortPick}</span>}</span>
                    </div>
                ))}
            </div>
        </div>
        <div className="erpm-doc__foot">
            <span className="erpm-doc__sum">{wms.summary}</span>
            <span className="erpm-row">
                <span className="erpm-btn erpm-btn--primary erpm-btn--lg">{wms.confirmScan}</span>
                <span className="erpm-btn erpm-btn--primary erpm-btn--lg is-off">{wms.pack}</span>
            </span>
        </div>
    </div>
);

export const ErpPicking: React.FC<{ data: ErpMockupText }> = ({ data }) => {
    const wms = data.picking;
    const count = wms.queue.sections.reduce((sum, section) => sum + section.items.length, 0);
    return (
        <Shell data={data} win={wms} active="wms" mod="picking">
            <div className="erpm-wms">
                <div className="erpm-wms__sub">
                    <span className="erpm-wms__title">
                        <span className="erpm-h1 erpm-h1--lg">{wms.title}</span>
                        <span className="erpm-wms__lead">{wms.subtitle}</span>
                    </span>
                    <span className="erpm-select">{wms.warehouse}<Icon name="chevron" /></span>
                </div>
                <div className="erpm-wms__grid">
                    <div className="erpm-queue">
                        <div className="erpm-queue__head">
                            <span className="erpm-queue__title"><b>{wms.queue.title}</b><span className="erpm-mono">{count}</span></span>
                            <span className="erpm-input"><Icon name="search" />{wms.queue.search}</span>
                            <span className="erpm-btn erpm-btn--primary erpm-btn--block erpm-btn--lg">{wms.queue.claimNext}</span>
                        </div>
                        <div className="erpm-queue__list">
                            {wms.queue.sections.map(section => (
                                <div className="erpm-queue__sec" key={section.title}>
                                    <span className="erpm-queue__sectitle"><b>{section.title}</b><span className="erpm-mono">{section.items.length}</span></span>
                                    {section.items.map(item => <QueueCard item={item} suggested={wms.queue.suggested} key={item.reference} />)}
                                </div>
                            ))}
                        </div>
                    </div>
                    <PickWorkspace wms={wms} />
                </div>
            </div>
        </Shell>
    );
};

export const ErpAssistant: React.FC<{ data: ErpMockupText }> = ({ data }) => {
    const ai = data.assistant;
    const card = ai.proposal;
    return (
        <Shell data={data} win={ai} active="lemy" mod="assistant">
            <div className="erpm-ai">
                <div className="erpm-ai__hist">
                    <span className="erpm-btn erpm-btn--primary erpm-btn--block erpm-btn--start"><Icon name="plus" />{ai.newConversation}</span>
                    <span className="erpm-input erpm-input--sm"><Icon name="search" />{ai.search}</span>
                    {ai.history.map(group => (
                        <div className="erpm-ai__group" key={group.group}>
                            <span className="erpm-ai__gtitle">{group.group}</span>
                            {group.sessions.map(session => (
                                <span className={session.active ? 'erpm-ai__sess is-on' : 'erpm-ai__sess'} key={session.title}>
                                    <Icon name="square" /><span>{session.title}</span><em>{session.time}</em>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="erpm-ai__main">
                    <div className="erpm-ai__head">
                        <span className="erpm-ai__who">
                            <Lemy className="erpm-lemy erpm-lemy--head" />
                            <span><b>{ai.name}</b><span><i className="erpm-dot" />{ai.status}</span></span>
                        </span>
                        <span className="erpm-row">
                            <span className="erpm-btn erpm-btn--ghost"><Icon name="wand" /><span className="erpm-wide">{ai.wizard}</span></span>
                            <span className="erpm-btn erpm-btn--ghost"><Icon name="download" /><span className="erpm-wide">{ai.download}</span></span>
                        </span>
                    </div>
                    <div className="erpm-ai__log">
                        <div className="erpm-msg erpm-msg--user"><span className="erpm-bubble">{ai.question.text}</span><span className="erpm-time">{ai.question.time}</span></div>
                        <div className="erpm-msg erpm-msg--lemy">
                            <Lemy className="erpm-lemy erpm-lemy--msg" />
                            <span className="erpm-msg__body">
                                <span>{ai.answer.intro}</span>
                                <span className="erpm-list">{ai.answer.items.map(item => <span key={item}>{item}</span>)}</span>
                                <span>{ai.answer.outro}</span>
                                <span className="erpm-time">{ai.answer.time}</span>
                            </span>
                        </div>
                        <div className="erpm-msg erpm-msg--user"><span className="erpm-bubble">{ai.command.text}</span><span className="erpm-time">{ai.command.time}</span></div>
                        <div className="erpm-msg erpm-msg--lemy">
                            <Lemy className="erpm-lemy erpm-lemy--msg" />
                            <span className="erpm-msg__body">
                                <span>{card.intro}</span>
                                <span className="erpm-confirm">
                                    <span className="erpm-confirm__title"><Icon name="pencil" />{card.title}</span>
                                    <span className="erpm-confirm__target">{card.target}</span>
                                    <span className="erpm-confirm__label">{card.changesLabel}</span>
                                    <span className="erpm-confirm__field">{card.field}</span>
                                    <span className="erpm-confirm__dl">
                                        <span>{card.beforeLabel}</span><span>{card.before}</span>
                                        <span>{card.afterLabel}</span><b>{card.after}</b>
                                    </span>
                                    <span className="erpm-confirm__label">{card.effectsLabel}</span>
                                    <span className="erpm-confirm__effects">{card.effects.map(effect => <span key={effect}>{effect}</span>)}</span>
                                    <span className="erpm-confirm__actions">
                                        <span className="erpm-btn erpm-btn--primary">{card.confirm}</span>
                                        <span className="erpm-btn">{card.cancel}</span>
                                        <span className="erpm-confirm__exp"><Icon name="clock" />{card.expires}</span>
                                    </span>
                                    <span className="erpm-confirm__sends">{card.sends}</span>
                                </span>
                                <span className="erpm-time">{card.time}</span>
                            </span>
                        </div>
                    </div>
                    <div className="erpm-ai__composer">
                        <span className="erpm-ai__box"><span>{ai.placeholder}</span><span className="erpm-ai__send"><Icon name="arrowUp" /></span></span>
                    </div>
                </div>
            </div>
        </Shell>
    );
};

const MARKER_ORDER: MarkerState[] = ['FRESH', 'STALE', 'STOPPED', 'UNKNOWN'];
const SELECTED_POSITION: [number, number] = [55.1, 75.98];
const OTHER_POSITIONS: [number, number][] = [[74.06, 82.31], [78.12, 24.01]];
const ROUTE_START: [number, number] = [20.09, 40.38];
const ROUTE_POINTS = '20.09,40.38 20.17,40.54 20.2,40.48 20.39,40.46 20.47,40.32 20.5,40.25 20.8,39.35 20.83,39.3 20.85,39.29 20.92,39.29 21.01,39.31 21.07,39.34 21.14,39.41 21.29,39.56 21.89,38.11 21.9,38.07 21.94,38.0 22.0,37.82 22.05,37.85 22.09,37.86 22.22,37.93 22.32,37.97 22.42,38.02 22.51,38.06 22.69,38.14 23.28,38.41 23.61,38.57 23.66,38.59 24.08,38.79 24.15,38.82 24.45,38.96 24.79,39.12 25.08,39.25 25.36,39.38 25.7,39.54 25.71,39.55 25.76,39.57 25.88,39.62 26.05,39.7 26.24,39.79 26.4,39.86 26.66,39.99 26.75,40.03 27.16,40.22 27.44,40.35 27.64,40.44 27.79,40.51 28.09,40.65 28.3,40.75 28.35,40.77 28.38,40.79 28.64,40.9 28.72,41.19 28.74,41.27 29.05,42.36 29.19,42.88 29.44,43.76 29.62,44.38 29.79,44.99 30.04,45.9 30.69,48.2 31.03,49.4 31.11,49.69 31.2,50.03 31.22,50.1 31.25,50.19 31.29,50.32 31.42,50.79 31.43,50.83 31.44,50.88 31.48,51.01 31.58,50.9 31.72,50.76 31.74,50.73 31.88,50.59 32.0,50.46 32.64,49.77 32.76,49.67 32.89,49.56 33.07,49.45 33.22,49.34 33.38,49.24 33.53,49.15 34.36,48.65 34.49,48.57 34.56,48.53 34.78,48.43 34.84,48.71 34.85,48.79 34.86,48.83 34.98,49.51 35.03,49.82 35.09,50.11 35.11,50.22 35.2,50.66 35.29,51.07 35.42,51.57 35.47,51.75 35.68,52.53 35.72,52.67 36.25,54.47 36.37,54.88 36.58,55.6 36.98,56.99 37.38,58.38 37.51,58.81 37.76,59.65 37.89,60.07 38.02,60.46 38.05,60.53 38.16,60.84 38.36,61.35 38.64,62.01 38.84,62.52 38.98,62.88 39.18,63.61 39.31,64.0 39.45,64.43 39.78,65.51 39.86,65.82 40.19,66.95 40.29,67.3 40.48,67.96 40.51,68.07 40.54,68.14 40.62,68.44 40.73,68.84 40.8,69.13 40.9,69.54 41.01,70.07 41.22,70.98 41.24,71.07 41.25,71.11 41.25,71.13 41.26,71.15 41.3,71.36 41.39,71.75 41.39,71.77 41.4,71.81 41.4,71.82 41.41,71.86 41.43,71.92 41.47,72.1 41.88,72.03 42.0,72.01 42.1,72.0 42.11,72.0 42.12,71.99 42.16,71.99 42.19,71.99 42.29,71.98 42.38,71.97 42.59,71.97 43.01,71.96 43.04,71.96 44.31,71.94 44.49,71.94 44.67,71.93 44.84,71.91 45.02,71.88 45.19,71.85 45.37,71.82 45.54,71.78 45.71,71.73 45.88,71.68 46.05,71.63 46.3,71.53 46.55,71.42 46.68,71.36 46.76,71.32 46.84,71.28 47.46,70.93 47.92,70.67 48.36,70.44 48.8,70.3 49.15,70.15 50.51,69.53 50.8,69.4 50.97,69.33 51.04,69.29 51.17,69.23 51.2,69.22 51.21,69.21 51.22,69.2 51.24,69.19 51.26,69.18 51.42,69.09 51.67,68.93 51.87,68.8 52.0,68.73 52.05,68.71 52.17,68.64 52.31,68.55 52.55,68.41 52.56,68.4 52.58,68.39 52.6,68.38 52.62,68.37 53.02,68.13 53.15,68.05 53.25,68.0 53.45,67.88 53.57,67.82 53.82,67.7 54.1,67.57 54.29,67.48 54.31,67.61 54.31,67.63 54.32,67.68 54.33,67.85 54.37,68.25 54.38,68.32 54.43,68.9 54.45,69.11 54.46,69.14 54.5,69.55 54.54,69.98 54.56,70.18 54.56,70.2 54.6,70.61 54.6,70.63 54.62,70.9 54.63,71.04 54.64,71.11 54.68,71.56 54.7,71.71 54.73,72.04 54.77,72.44 54.8,72.77 54.8,72.79 54.81,72.95 54.82,73.03 54.83,73.09 54.84,73.26 54.85,73.4 54.86,73.49 54.88,73.63 54.88,73.66 54.91,73.91 54.97,74.66 55.01,75.1 55.04,75.35 55.1,75.98 55.1,75.98';

const MapBackground: React.FC = () => (
    <>
        <img className="erpm-map__tiles" src="/assets/img/osm-map-768.webp" srcSet="/assets/img/osm-map-768.webp 768w, /assets/img/osm-map.webp 1536w" sizes="(max-width: 1023px) 100vw, 900px" alt="" width={768} height={512} loading="lazy" decoding="async" />
        <svg className="erpm-map__bg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={ROUTE_POINTS} className="erpm-map__route" />
        </svg>
    </>
);

const Truck: React.FC = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        {ICONS.truck.map(d => {
            if (!d.startsWith('c')) return <path key={d} d={d} />;
            const [cx, cy, r] = d.slice(1).split(' ');
            return <circle key={d} cx={cx} cy={cy} r={r} />;
        })}
    </svg>
);

export const ErpTracking: React.FC<{ data: ErpMockupText }> = ({ data }) => {
    const tr = data.tracking;
    const selectedIndex = tr.drivers.findIndex(driver => driver.selected);
    const positions = tr.drivers.map((_, index) => index === selectedIndex ? SELECTED_POSITION : OTHER_POSITIONS[index < selectedIndex ? index : index - 1]);
    const [sx, sy] = SELECTED_POSITION;
    const at = (x: number, y: number) => ({ left: `${x}%`, top: `${y}%` });
    return (
        <Shell data={data} win={tr} active="logistics" mod="tracking">
            <div className="erpm-trk">
                <div className="erpm-map">
                    <div className="erpm-map__frame">
                    <MapBackground />
                    <span className="erpm-map__start" style={at(...ROUTE_START)} />
                    {tr.drivers.map((driver, index) => {
                        const [x, y] = positions[index];
                        return (
                            <span className={driver.selected ? 'erpm-map__pin is-sel' : 'erpm-map__pin'} style={at(x, y)} key={driver.name}>
                                <span className={`erpm-marker erpm-marker--${driver.state.toLowerCase()}`}><Truck /></span>
                                <span className="erpm-map__label">{driver.short} <em>· {driver.age}</em></span>
                            </span>
                        );
                    })}
                    <span className="erpm-pop" style={at(sx, sy)}>
                        <span className="erpm-pop__box">
                            <span className="erpm-pop__close">×</span>
                            <b className="erpm-pop__name">{tr.popup.name}</b>
                            <span className="erpm-pop__muted">{tr.popup.plate}</span>
                            <span className="erpm-pop__link">{tr.popup.subject}</span>
                            <span className="erpm-pop__state"><i />{tr.popup.state} <em>· {tr.popup.age}</em></span>
                            <span className="erpm-pop__muted">{tr.popup.session}: <span className="erpm-pop__fg">{tr.popup.status}</span></span>
                            <span className="erpm-pop__pos">
                                <span>{tr.popup.recorded}</span>
                                <span>{tr.popup.accuracy}</span>
                                <span>{tr.popup.speed}</span>
                            </span>
                        </span>
                        <span className="erpm-pop__tip" />
                    </span>
                    </div>
                    <span className="erpm-map__attr">Leaflet | © OpenStreetMap</span>
                    <span className="erpm-map__zoom"><span>+</span><span>−</span></span>
                    <span className="erpm-map__panel">
                        <span className="erpm-map__ptitle"><Icon name="route" />{tr.route.title}</span>
                        <b>{tr.route.distance}</b>
                        <span>{tr.route.note}</span>
                    </span>
                    <span className="erpm-btn erpm-btn--sm erpm-map__all"><Icon name="maximize" />{tr.showAll}</span>
                    <span className="erpm-map__legend">
                        <span className="erpm-map__ltitle">{tr.legend.title}</span>
                        {MARKER_ORDER.map(state => (
                            <span key={state}><i className={`erpm-ldot erpm-ldot--${state.toLowerCase()}`} />{tr.legend.states[state]}</span>
                        ))}
                        <span><i className="erpm-ldot erpm-ldot--acc" />{tr.legend.lowAccuracy}</span>
                        <span><i className="erpm-ldot erpm-ldot--route" />{tr.legend.route}</span>
                    </span>
                </div>
                <div className="erpm-drv">
                    <span className="erpm-drv__search">
                        <span className="erpm-input erpm-drv__input"><Icon name="search" /><span>{tr.search}</span></span>
                        <Icon name="panelRight" />
                    </span>
                    <span className="erpm-drv__count">{tr.count}</span>
                    <div className="erpm-drv__list">
                        {tr.drivers.map(driver => (
                            <div className={driver.selected ? 'erpm-drv__card is-open' : 'erpm-drv__card'} key={driver.name}>
                                <div className="erpm-drv__head">
                                    <i className={`erpm-ldot erpm-drv__dot erpm-ldot--${driver.state.toLowerCase()}`} />
                                    <span className="erpm-drv__main">
                                        <span className="erpm-drv__row">
                                            <b>{driver.name}</b>
                                            <span className={driver.state === 'STALE' ? 'erpm-drv__age is-stale' : 'erpm-drv__age'}>{driver.age}</span>
                                        </span>
                                        <span className="erpm-drv__det">{driver.details}</span>
                                        <span className="erpm-drv__pills">
                                            <span className="erpm-pill erpm-pill--ok">{tr.active}</span>
                                            {driver.state === 'STALE' && <span className="erpm-pill erpm-pill--warn">{tr.stale}</span>}
                                        </span>
                                    </span>
                                    <Icon name="chevron" className="erpm-drv__chev" />
                                </div>
                                {driver.selected && (
                                    <div className="erpm-drv__body">
                                        <span className="erpm-drv__dl">
                                            {tr.details.map(row => (
                                                <React.Fragment key={row.label}>
                                                    <span>{row.label}</span>
                                                    <b>{row.value}{row.sub && <em>{row.sub}</em>}</b>
                                                </React.Fragment>
                                            ))}
                                        </span>
                                        <span className="erpm-drv__actions">
                                            <span className="erpm-btn erpm-btn--xs"><Icon name="crosshair" />{tr.showOnMap}</span>
                                            <span className="erpm-btn erpm-btn--xs"><Icon name="route" />{tr.openTrip}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Shell>
    );
};
