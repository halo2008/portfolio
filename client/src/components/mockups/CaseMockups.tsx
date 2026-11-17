import React from 'react';
import type {
    CameraTile,
    CaseMockupText,
    CaseWindowText,
    MailOrdersText,
    NavModule,
    OffersText,
    ProposalRow,
    WeighbridgeText,
    WeighingRow,
} from './caseMockupData';

const ICONS = {
    panel: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M9 3v18'],
    bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
    search: ['c11 11 8', 'm21 21-4.3-4.3'],
    x: ['M18 6 6 18', 'm6 6 12 12'],
    plus: ['M5 12h14', 'M12 5v14'],
    minus: ['M5 12h14'],
    calendar: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M8 2v4', 'M16 2v4', 'M3 10h18', 'M8 14h.01', 'M12 14h.01', 'M16 14h.01', 'M8 18h.01', 'M12 18h.01'],
    chevronDown: ['m6 9 6 6 6-6'],
    chevronLeft: ['m15 18-6-6 6-6'],
    chevronRight: ['m9 18 6-6-6-6'],
    arrowLeft: ['m12 19-7-7 7-7', 'M19 12H5'],
    pencil: ['M21.17 6.81a1 1 0 0 0-3.98-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z', 'm15 5 4 4'],
    trash: ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'],
    camera: ['M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z', 'c12 13 3'],
    info: ['c12 12 10', 'M12 16v-4', 'M12 8h.01'],
    pause: ['M14 4h4v16h-4z', 'M6 4h4v16H6z'],
    maximize: ['M8 3H5a2 2 0 0 0-2 2v3', 'M21 8V5a2 2 0 0 0-2-2h-3', 'M3 16v3a2 2 0 0 0 2 2h3', 'M16 21h3a2 2 0 0 0 2-2v-3'],
    more: ['c5 12 1', 'c12 12 1', 'c19 12 1'],
    mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'],
    paperclip: ['m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48'],
    download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
    sparkles: ['M9.94 14.06 8.5 19.5l-1.44-5.44L1.5 12.5l5.56-1.44L8.5 5.5l1.44 5.56 5.56 1.44z', 'M19 3v4', 'M21 5h-4'],
    clipboard: ['M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z', 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'M12 11h4', 'M12 16h4', 'M8 11h.01', 'M8 16h.01'],
    history: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5', 'M12 7v5l4 2'],
    circleCheck: ['c12 12 10', 'm9 12 2 2 4-4'],
    circleDashed: ['M10.1 2.18a10 10 0 0 1 3.8 0', 'M17.6 3.71a10 10 0 0 1 2.69 2.7', 'M21.82 10.1a10 10 0 0 1 0 3.8', 'M20.29 17.6a10 10 0 0 1-2.7 2.69', 'M13.9 21.82a10 10 0 0 1-3.8 0', 'M6.4 20.29a10 10 0 0 1-2.69-2.7', 'M2.18 13.9a10 10 0 0 1 0-3.8', 'M3.71 6.4a10 10 0 0 1 2.7-2.69'],
    grip: ['c9 9 1', 'c15 9 1', 'c9 15 1', 'c15 15 1'],
} satisfies Record<string, string[]>;

type IconName = keyof typeof ICONS;

const Glyph: React.FC<{ paths: string[]; className: string }> = ({ paths, className }) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        {paths.map(d => {
            if (!d.startsWith('c')) return <path key={d} d={d} />;
            const [cx, cy, r] = d.slice(1).split(' ');
            return <circle key={d} cx={cx} cy={cy} r={r} />;
        })}
    </svg>
);

const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className }) => (
    <Glyph paths={ICONS[name]} className={className ? `casem-i ${className}` : 'casem-i'} />
);

const NAV: { key: NavModule; paths: string[] }[] = [
    { key: 'crm', paths: ['c12 5 2.2', 'c5 18.5 2.2', 'c19 18.5 2.2', 'c12 12.5 1.6', 'M12 7.2v3.7', 'M10.7 13.6 6.8 16.6', 'M13.3 13.6l3.9 3', 'M7.4 18.5h9.2'] },
    { key: 'sales', paths: ['M2.5 3h2.2l2.3 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 1.9-1.5L21 7H6', 'c9.5 20 1.2', 'c17.5 20 1.2', 'm10.5 10.5 2 2 3.5-3.5'] },
    { key: 'supply', paths: ['c6 6 2.5', 'M2 14.5c0-2.2 1.8-4 4-4s4 1.8 4 4', 'M14 14h7v6h-7z', 'M14 16.5h7', 'M13 5h6v4', 'm21 7-2 2-2-2', 'M11 19H6v-2', 'm4 19 2-2'] },
    { key: 'logistics', paths: ['M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2', 'M15 18H9', 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14', 'c17 18 2', 'c7 18 2'] },
    { key: 'wms', paths: ['M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z', 'M6 18h12', 'M6 14h12', 'M6 22V10h12v12'] },
    { key: 'products', paths: ['M3 7V5a2 2 0 0 1 2-2h2', 'M17 3h2a2 2 0 0 1 2 2v2', 'M21 17v2a2 2 0 0 1-2 2h-2', 'M7 21H5a2 2 0 0 1-2-2v-2', 'M8 7v10', 'M12 7v10', 'M17 7v10'] },
    { key: 'reports', paths: ['c6 5 2', 'M3 21v-7a3 3 0 0 1 6 0v7', 'M12 21v-4', 'M16 21v-7', 'M20 21V11', 'm11 10.5 4-4 2 2 4-4'] },
];

const Mark: React.FC<{ className: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="15.5" rx="10.5" ry="3.2" fill="none" stroke="#8b8b8b" strokeWidth="1.1" />
        <path d="M6 3.5h4.2v10.2c0 1.4.8 2.2 1.8 2.2s1.8-.8 1.8-2.2V3.5H18v10.4c0 3.6-2.4 6-6 6s-6-2.4-6-6z" fill="#e3202a" />
    </svg>
);

const Shell: React.FC<{ data: CaseMockupText; win: CaseWindowText; active: NavModule; mod: string; children: React.ReactNode }> = ({ data, win, active, mod, children }) => {
    const [app, ...path] = win.crumb;
    return (
        <div className={`ui ui-panel ui-win casem casem--${mod}`} role="img" aria-label={win.label}>
            <div className="ui-win__bar">
                <span className="ui-dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="ui-win__crumb">
                    <Mark className="casem-mark" />{app}
                    {path.map((part, index) => (
                        <span className="casem__crumbpart" key={part}><i>/</i>{index === path.length - 1 ? <b>{part}</b> : part}</span>
                    ))}
                </span>
            </div>
            <div className="casem__app">
                <div className="casem__rail">
                    <div className="casem__logo"><Mark className="casem-mark casem-mark--rail" /></div>
                    <div className="casem__nav">
                        {NAV.map(({ key, paths }) => (
                            <span className={key === active ? 'casem__navi is-on' : 'casem__navi'} key={key}>
                                <Glyph paths={paths} className="casem-i casem-i--nav" />
                            </span>
                        ))}
                    </div>
                    <span className="casem__avatar">{data.shell.initials}</span>
                </div>
                <div className="casem__inset">
                    <div className="casem__head">
                        <Icon name="panel" className="casem__trigger" />
                        <span className="casem__sep" />
                        <span className="casem__mtitle">{data.shell.mobileTitle}</span>
                        <span className="casem__tabs">
                            {win.tabs.map((tab, index) => <span className={index === win.activeTab ? 'casem__tab is-on' : 'casem__tab'} key={tab}>{tab}</span>)}
                        </span>
                        <Icon name="bell" className="casem__bell" />
                    </div>
                    <div className="casem__page">{children}</div>
                </div>
            </div>
        </div>
    );
};

const CAMERA_SHOTS = {
    front: { src: '/assets/img/anpr-entry-800.webp', srcSet: '/assets/img/anpr-entry-800.webp 800w, /assets/img/anpr-entry.webp 1600w', plate: { left: 47.8, top: 62.2, width: 5.8, height: 4.8 } },
    rear: { src: '/assets/img/anpr-exit-800.webp', srcSet: '/assets/img/anpr-exit-800.webp 800w, /assets/img/anpr-exit.webp 1600w', plate: { left: 48.8, top: 57.2, width: 6.7, height: 5.4 } }
};

const CameraScene: React.FC<{ tile: CameraTile }> = ({ tile }) => {
    const shot = CAMERA_SHOTS[tile.view];
    const box = { left: `${shot.plate.left}%`, top: `${shot.plate.top}%`, width: `${shot.plate.width}%`, height: `${shot.plate.height}%` };
    return (
        <div className="casem-cam__scene" aria-hidden="true">
            <div className="casem-cam__frame">
                <img src={shot.src} srcSet={shot.srcSet} sizes="(max-width: 1023px) 100vw, 520px" alt="" width={800} height={364} loading="lazy" decoding="async" />
                <i className="casem-cam__box" style={box} />
            </div>
        </div>
    );
};

const Camera: React.FC<{ tile: CameraTile; data: WeighbridgeText; first?: boolean }> = ({ tile, data, first }) => (
    <section className={first ? 'casem-cam' : 'casem-cam casem-cam--second'}>
        <div className="casem-cam__img">
            <CameraScene tile={tile} />
            <span className="casem-cam__stamp">{tile.stamp}</span>
            <div className="casem-cam__info">
                <span className="casem-glass casem-cam__id"><i className="casem-cam__dot" />{tile.label}</span>
                <span className="casem-cam__readout">
                    <span className="casem-cam__weight"><b>{tile.weight}</b><em>kg</em></span>
                    <span className="casem-cam__plate"><Icon name="camera" />{tile.plate}</span>
                    <span className={`casem-cam__more casem-cam__more--${tile.tone}`}><Icon name="info" /></span>
                </span>
                {tile.hint && <span className="casem-hint">{tile.hint.map(line => <span key={line}>{line}</span>)}</span>}
            </div>
            <span className="casem-cam__corner casem-cam__actions">
                <span className="casem-glass casem-ctl"><Icon name="pause" /><span className="casem-cam__lbl">{data.controls.pause}</span></span>
                <span className="casem-glass casem-ctl"><Icon name="camera" /><span className="casem-cam__lbl">{data.controls.photo}</span></span>
            </span>
            <span className="casem-cam__corner casem-cam__tools">
                <span className="casem-glass casem-cam__zoom"><Icon name="minus" /><i /><span>{data.controls.fit}</span><i /><Icon name="plus" /></span>
                <span className="casem-glass casem-ctl casem-ctl--icon"><Icon name="maximize" /></span>
                <span className="casem-glass casem-ctl casem-ctl--icon"><Icon name="more" /></span>
            </span>
        </div>
        <div className="casem-cam__bar">
            {tile.fix && <span className="casem-btn casem-btn--outline casem-cam__fix"><Icon name="pencil" />{tile.fix}</span>}
            <span className="casem-btn casem-btn--red"><Icon name="plus" />{tile.add}</span>
        </div>
    </section>
);

const WeighRow: React.FC<{ row: WeighingRow; data: WeighbridgeText['history'] }> = ({ row, data }) => (
    <div className="casem-wt__row">
        <span className="casem-wt__id">{row.id}</span>
        <span className="casem-wt__plate">{row.plate}</span>
        <span className="casem-wt__dlv"><b>{row.delivery}</b><em>{row.party}</em></span>
        <span className="casem-wt__num casem-wt__in">{row.weightIn}</span>
        <span className={row.complete ? 'casem-wt__num casem-wt__out' : 'casem-wt__num casem-wt__out is-dim'}>{row.weightOut}</span>
        <span className={row.complete ? 'casem-wt__num casem-wt__net' : 'casem-wt__num casem-wt__net is-dim'}>{row.net}</span>
        <span className="casem-wt__st">
            <span className={row.complete ? 'casem-pill casem-pill--ok' : 'casem-pill casem-pill--wait'}>{row.complete ? data.statuses.complete : data.statuses.pending}</span>
            {row.manual && <span className="casem-pill casem-pill--manual">{data.statuses.manual}</span>}
        </span>
        <span className="casem-wt__date">{row.created}</span>
        <span className="casem-wt__act"><Icon name="pencil" /><Icon name="trash" /></span>
    </div>
);

export const WeighbridgeMock: React.FC<{ data: CaseMockupText }> = ({ data }) => {
    const wb = data.weighbridge;
    const h = wb.history;
    return (
        <Shell data={data} win={wb} active="sales" mod="wb">
            <div className="casem-wb">
                <div className="casem-wb__head">
                    <span className="casem-row">
                        <span className="casem-h1">{wb.title}</span>
                        <span className="casem-live"><i />{wb.live}</span>
                    </span>
                    <span className="casem-presets">
                        {wb.presets.map((preset, index) => <span className={index === wb.activePreset ? 'is-on' : undefined} key={preset}>{preset}</span>)}
                    </span>
                </div>
                <div className="casem-wb__cams">
                    <Camera tile={wb.cameras[0]} data={wb} first />
                    <span className="casem-wb__vgrip"><Icon name="grip" /></span>
                    <Camera tile={wb.cameras[1]} data={wb} />
                </div>
                <span className="casem-wb__hgrip"><Icon name="grip" /></span>
                <div className="casem-wb__hist">
                    <div className="casem-wb__tools">
                        <span className="casem-row">
                            <span className="casem-h2">{h.title}</span>
                            <span className="casem-count">{h.total}</span>
                        </span>
                        <span className="casem-wb__filters">
                            <span className="casem-input"><Icon name="search" />{h.search}</span>
                            <span className="casem-btn casem-btn--outline casem-wb__opt"><Icon name="calendar" />{h.dates}</span>
                            <span className="casem-select casem-wb__opt">{h.status}<Icon name="chevronDown" /></span>
                            <span className="casem-btn casem-btn--light"><Icon name="plus" />{h.add}</span>
                        </span>
                    </div>
                    <div className="casem-wt">
                        <div className="casem-wt__row casem-wt__head">
                            <span className="casem-wt__id">{h.columns.id}</span>
                            <span className="casem-wt__plate">{h.columns.plate}</span>
                            <span className="casem-wt__dlv">{h.columns.delivery}</span>
                            <span className="casem-wt__num casem-wt__in">{h.columns.weightIn}</span>
                            <span className="casem-wt__num casem-wt__out">{h.columns.weightOut}</span>
                            <span className="casem-wt__num casem-wt__net">{h.columns.net}</span>
                            <span className="casem-wt__st">{h.columns.status}</span>
                            <span className="casem-wt__date">{h.columns.created}</span>
                            <span className="casem-wt__act" />
                        </div>
                        {h.rows.map(row => <WeighRow row={row} data={h} key={row.id} />)}
                    </div>
                </div>
            </div>
        </Shell>
    );
};

const SourceCell: React.FC<{ row: ProposalRow }> = ({ row }) => (
    <span className={`casem-pt__src casem-tone--${row.sourceTone}`}>
        <span className="casem-pt__srcline">
            {row.sourceTone === 'ai' && <Icon name="sparkles" className="casem-ai-i" />}
            <span className={row.quote ? 'casem-pt__quote' : undefined}>{row.source}</span>
            {row.detail && <em>· {row.detail}</em>}
            {row.sourceAction && <span className="casem-chipbtn">{row.sourceAction}</span>}
        </span>
        {row.confidence && <span className="casem-tip">{row.confidence}</span>}
    </span>
);

const ProposalTableRow: React.FC<{ row: ProposalRow }> = ({ row }) => (
    <div className={`casem-pt__row casem-pt__row--${row.kind}${row.nameTone === 'ai' ? ' is-ai' : ''}`}>
        <span className="casem-pt__lp">{row.lp}</span>
        <span className={`casem-pt__name${row.nameTone ? ` casem-name--${row.nameTone}` : ''}`}>
            {row.kind === 'candidate' && <i>└</i>}
            {row.nameTone === 'ai' && <Icon name="sparkles" className="casem-ai-i" />}
            <span>{row.name}</span>
            {row.nameAction && <span className="casem-chipbtn">{row.nameAction}</span>}
        </span>
        <SourceCell row={row} />
        <span className="casem-pt__num casem-pt__qty">{row.qty}</span>
        <span className="casem-pt__unit">{row.unit}</span>
        <span className="casem-pt__num casem-pt__avail">{row.available}</span>
        <span className="casem-pt__num casem-pt__price">{row.price}</span>
        <span className="casem-pt__num casem-pt__vat">{row.vat}</span>
        <span className="casem-pt__num casem-pt__net">{row.net}</span>
        <span className="casem-pt__num casem-pt__gross">{row.gross}</span>
    </div>
);

const MailPanel: React.FC<{ mail: MailOrdersText['mail'] }> = ({ mail }) => (
    <div className="casem-mail">
        <div className="casem-mail__head">
            <Icon name="chevronDown" />
            <Icon name="mail" />
            <b>{mail.from}</b>
            <span className="casem-mail__subj">{mail.subject}</span>
            <span className="casem-mail__clip"><Icon name="paperclip" />1</span>
            <em>{mail.toggle}</em>
        </div>
        <div className="casem-mail__body">
            <div className="casem-mail__part">
                <span className="casem-mail__label">{mail.part}</span>
                <p className="casem-mail__text">
                    {mail.segments.map((segment, index) => segment.mark ? (
                        <mark className={`casem-mark-${segment.mark}`} key={index}>
                            {segment.text}
                            {segment.mark === 'missing' && <span className="casem-mail__missing">{mail.missing}</span>}
                        </mark>
                    ) : <React.Fragment key={index}>{segment.text}</React.Fragment>)}
                </p>
            </div>
            <span className="casem-btn casem-btn--ghost casem-btn--xs"><Icon name="download" />{mail.attachment}</span>
        </div>
    </div>
);

export const MailOrdersMock: React.FC<{ data: CaseMockupText }> = ({ data }) => {
    const po = data.mailOrders;
    const c = po.columns;
    return (
        <Shell data={data} win={po} active="sales" mod="po">
            <div className="casem-po">
                <div className="casem-po__doc">
                    <div className="casem-dh">
                        <span className="casem-dh__nav">
                            <span className="casem-dh__back"><Icon name="arrowLeft" />{po.back}</span>
                            <span className="casem-dh__count"><Icon name="chevronLeft" />{po.counter}<Icon name="chevronRight" /></span>
                        </span>
                        <span className="casem-dh__sep" />
                        <span className="casem-dh__num"><b>{po.doc.prefix}</b><i>/</i><i>{po.doc.auto}</i><i>/</i><i>{po.doc.number}</i><i>/</i><b>{po.doc.year}</b></span>
                        <span className="casem-dh__sep" />
                        <span className="casem-dh__title">{po.doc.title}</span>
                        <span className="casem-dh__items">
                            {po.header.map(item => <span className="casem-dh__item" key={item.label}><em>{item.label}</em><b>{item.value}</b></span>)}
                        </span>
                    </div>
                    <div className="casem-cd">
                        <span className="casem-cd__field casem-cd__firm">
                            <em>{po.client.label}</em>
                            <span className="casem-cd__box"><span>{po.client.value}</span><span className="casem-aichip"><Icon name="sparkles" />{po.client.ai}</span></span>
                        </span>
                        <span className="casem-cd__field casem-cd__addr"><em>{po.billing.label}</em><span className="casem-cd__box"><span>{po.billing.value}</span><Icon name="chevronDown" /></span></span>
                        <span className="casem-cd__field casem-cd__addr"><em>{po.delivery.label}</em><span className="casem-cd__box"><span>{po.delivery.value}</span><Icon name="chevronDown" /></span></span>
                        <span className="casem-cd__logi">{po.logistics}</span>
                    </div>
                    <div className="casem-pt">
                        <div className="casem-pt__row casem-pt__head">
                            <span className="casem-pt__lp" />
                            <span className="casem-pt__name">{c.name}</span>
                            <span className="casem-pt__src">{c.source}</span>
                            <span className="casem-pt__num casem-pt__qty">{c.qty}</span>
                            <span className="casem-pt__unit">{c.unit}</span>
                            <span className="casem-pt__num casem-pt__avail">{c.available}</span>
                            <span className="casem-pt__num casem-pt__price">{c.price}</span>
                            <span className="casem-pt__num casem-pt__vat">{c.vat}</span>
                            <span className="casem-pt__num casem-pt__net">{c.net}</span>
                            <span className="casem-pt__num casem-pt__gross">{c.gross}</span>
                        </div>
                        {po.rows.map(row => <ProposalTableRow row={row} key={row.name} />)}
                    </div>
                    <div className="casem-totals">
                        {po.totals.map(total => <span className="casem-totals__chip" key={total.label}>{total.label}: <b>{total.value}</b></span>)}
                        <span className="casem-totals__mail"><Icon name="mail" />{po.mailButton}</span>
                        <span className="casem-totals__clip"><Icon name="paperclip" />{po.attachments}</span>
                    </div>
                    <MailPanel mail={po.mail} />
                </div>
                <div className="casem-pf">
                    <span className="casem-pf__issuer">{po.footer.issuerLabel} <b>{po.footer.issuer}</b></span>
                    <span className="casem-pf__status">{po.footer.status}</span>
                    <span className="casem-pf__actions">
                        <span className="casem-btn casem-btn--ghost">{po.footer.reject}</span>
                        <span className="casem-btn casem-btn--neutral">{po.footer.save}</span>
                        <span className="casem-btn casem-btn--red">{po.footer.create}</span>
                    </span>
                </div>
            </div>
        </Shell>
    );
};

const RunList: React.FC<{ runs: OffersText['runs'] }> = ({ runs }) => (
    <div className="casem-runs">
        <span className="casem-runs__title"><Icon name="history" />{runs.title}</span>
        {runs.items.map(run => (
            <span className={run.selected ? 'casem-runs__item is-on' : 'casem-runs__item'} key={run.label + run.when}>
                <span className="casem-runs__top">
                    <b><i>{run.letter}</i>{run.label}</b>
                    <span className={`casem-state casem-state--${run.tone}`}><Icon name={run.tone === 'done' ? 'circleCheck' : 'circleDashed'} />{run.state}</span>
                </span>
                <span>{run.who}</span>
                <em>{run.when}</em>
            </span>
        ))}
    </div>
);

export const OffersMock: React.FC<{ data: CaseMockupText }> = ({ data }) => {
    const of = data.offers;
    const c = of.columns;
    const d = of.draft;
    return (
        <Shell data={data} win={of} active="reports" mod="of">
            <div className="casem-rp">
                <div className="casem-rp__bar">
                    <span className="casem-rp__title"><Icon name="clipboard" />{of.title}</span>
                    <span className="casem-rp__ctrls">
                        <span className="casem-select casem-rp__who">{of.salesman}<Icon name="chevronDown" /></span>
                        <span className="casem-btn casem-btn--outline casem-rp__period"><Icon name="calendar" />{of.period}</span>
                        <span className="casem-rp__variants">
                            {of.variants.map((variant, index) => (
                                <span className={index === of.activeVariant ? 'casem-btn casem-btn--light casem-btn--sm' : 'casem-btn casem-btn--outline casem-btn--sm casem-rp__alt'} key={variant.letter}>
                                    <i>{variant.letter}</i>{variant.label}
                                </span>
                            ))}
                        </span>
                    </span>
                </div>
                <div className="casem-rp__body">
                    <RunList runs={of.runs} />
                    <div className="casem-rp__main">
                        <div className="casem-rp__meta">
                            {of.meta.map(item => <span key={item.label}>{item.label}: <b>{item.value}</b></span>)}
                        </div>
                        <section className="casem-sec">
                            <span className="casem-sec__title">{of.section} <em>{of.sectionNote}</em></span>
                            <div className="casem-up">
                                <div className="casem-up__row casem-up__head">
                                    <span className="casem-up__lp">{c.lp}</span>
                                    <span className="casem-up__client">{c.client}</span>
                                    <span className="casem-up__buys">{c.buys}</span>
                                    <span className="casem-up__gaps">{c.gaps}</span>
                                    <span className="casem-up__prop">{c.proposal}</span>
                                    <span className="casem-up__turn">{c.turnover}</span>
                                </div>
                                {of.rows.map(row => (
                                    <div className={row.selected ? 'casem-up__row is-sel' : 'casem-up__row'} key={row.lp}>
                                        <span className="casem-up__lp">{row.lp}</span>
                                        <span className="casem-up__client">
                                            <b>{row.client}</b>
                                            {row.badge && <span className="casem-mono-badge">{row.badge}</span>}
                                            {row.flags && <span className="casem-flags">{row.flags}</span>}
                                        </span>
                                        <span className="casem-up__buys">{row.buys.map(buy => <span key={buy.category}>{buy.category} <em>{buy.share}</em></span>)}</span>
                                        <span className="casem-up__gaps"><span>{row.gaps}</span><em>{row.peers}</em></span>
                                        <span className="casem-up__prop">{row.proposal}</span>
                                        <span className="casem-up__turn">{row.turnover}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className="casem-sec casem-draft">
                            <div className="casem-draft__head">
                                <b>{d.title}</b>
                                <span className="casem-draft__client">{d.client}</span>
                                <span className="casem-aichip"><Icon name="sparkles" />{d.ai}</span>
                            </div>
                            <span className="casem-draft__note">{d.note}</span>
                            <div className="casem-ot">
                                <div className="casem-ot__row casem-ot__head">
                                    <span className="casem-ot__prod">{d.columns.product}</span>
                                    <span className="casem-ot__num">{d.columns.qty}</span>
                                    <span className="casem-ot__unit">{d.columns.unit}</span>
                                    <span className="casem-ot__num casem-ot__price">{d.columns.price}</span>
                                    <span className="casem-ot__num">{d.columns.value}</span>
                                </div>
                                {d.lines.map(line => (
                                    <div className={line.ai ? 'casem-ot__row is-ai' : 'casem-ot__row'} key={line.product}>
                                        <span className="casem-ot__prod">
                                            {line.ai && <Icon name="sparkles" className="casem-ai-i" />}
                                            <span>{line.product}</span>
                                            {line.why && <em>{line.why}</em>}
                                        </span>
                                        <span className="casem-ot__num">{line.qty}</span>
                                        <span className="casem-ot__unit">{line.unit}</span>
                                        <span className="casem-ot__num casem-ot__price">{line.price}</span>
                                        <span className="casem-ot__num">{line.value}</span>
                                    </div>
                                ))}
                                <div className="casem-ot__row casem-ot__sum">
                                    <span className="casem-ot__prod">{d.totalLabel}</span>
                                    <b>{d.total}</b>
                                </div>
                            </div>
                            <div className="casem-draft__foot">
                                <p className="casem-draft__letter">{d.letter}</p>
                                <span className="casem-draft__actions">
                                    <span className="casem-btn casem-btn--ghost">{d.discard}</span>
                                    <span className="casem-btn casem-btn--red">{d.insert}</span>
                                </span>
                            </div>
                        </section>
                    </div>
                </div>
                <p className="casem-rp__foot">{of.footer}</p>
            </div>
        </Shell>
    );
};
