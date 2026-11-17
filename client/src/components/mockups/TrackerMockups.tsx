import React from 'react';
import type { CSSProperties } from 'react';
import type { TrackerMockupLocale, TrkField, TrkIcon, TrkNavItem, TrkScreen, TrkTone } from './trackerMockupData';

const ICONS: Record<TrkIcon, string> = {
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    badge: 'M20 7h-5V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 12c.83 0 1.5.67 1.5 1.5S9.83 15 9 15s-1.5-.67-1.5-1.5S8.17 12 9 12zm3 6H6v-.75c0-1 2-1.5 3-1.5s3 .5 3 1.5V18zm1-9h-2V4h2v5zm5 7.5h-4V15h4v1.5zm0-3h-4V12h4v1.5z',
    personSearch: 'M10 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm.35 2.01C7.62 13.91 2 15.27 2 18v2h9.54c-2.47-2.76-1.23-5.89-1.19-5.99zm9.08 4.01c.36-.59.57-1.28.57-2.02 0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4c.74 0 1.43-.22 2.02-.57L20.59 22 22 20.59l-2.57-2.57zM16 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
    calendar: 'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM7 12h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z',
    handshake: 'M11.2 6.3 8.4 4.5a2 2 0 0 0-2.2 0L1 7.8v6.4l1.6-.8 6.1 5.7a1.6 1.6 0 0 0 2.3-.1 1.6 1.6 0 0 0 2.2-.1 1.6 1.6 0 0 0 2.2-.2 1.6 1.6 0 0 0 1.9-2.4l-5-4.6 1.5-1.2 5.4 5 2.8-1.3V7.8l-5-3.3a2 2 0 0 0-2.1-.1L9.8 7.6a1.4 1.4 0 0 0 1.5 2.4l1.4-.9z',
    inventory: 'M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z',
    storefront: 'M3.6 3h16.8l1.6 5.2a2.6 2.6 0 0 1-2 3.2V21H4v-9.6a2.6 2.6 0 0 1-2-3.2zM6 11.6V19h12v-7.4a2.7 2.7 0 0 1-2-1 2.7 2.7 0 0 1-4 0 2.7 2.7 0 0 1-4 0 2.7 2.7 0 0 1-2 1z',
    cart: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
    shipping: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
    warehouse: 'M22 21V7L12 3 2 7v14h5v-9h10v9h5zm-11-2H9v2h2v-2zm2-3h-2v2h2v-2zm2 3h-2v2h2v-2z',
    quiz: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 13a1.05 1.05 0 1 1 0-2.1 1.05 1.05 0 0 1 0 2.1zm2.5-6.2c-.6.9-1.2 1.2-1.5 1.8-.15.25-.2.4-.2 1.2h-1.5c0-.4-.06-1.1.26-1.65.4-.73 1.18-1.16 1.63-1.8.48-.68.2-1.94-1.14-1.94-.88 0-1.32.67-1.5 1.23l-1.37-.57C11.5 5.96 12.5 5 14 5c1.23 0 2.08.56 2.5 1.26.37.6.58 1.72.01 2.55z',
    support: 'M12 2a8 8 0 0 0-8 8v5a3 3 0 0 0 3 3h1v-7H6v-1a6 6 0 0 1 12 0v1h-2v7h2v1h-5v2h5a2 2 0 0 0 2-2v-1.2A3 3 0 0 0 20 15v-5a8 8 0 0 0-8-8z',
    news: 'M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm3 2v3h12V7zm0 5v5h5v-5zm7 0v1.5h5V12zm0 3.5V17h5v-1.5z',
    inbox: 'M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z',
    route: 'M19 15.18V7c0-2.21-1.79-4-4-4s-4 1.79-4 4v10c0 1.1-.9 2-2 2s-2-.9-2-2V8.82C8.16 8.4 9 7.3 9 6c0-1.66-1.34-3-3-3S3 4.34 3 6c0 1.3.84 2.4 2 2.82V17c0 2.21 1.79 4 4 4s4-1.79 4-4V7c0-1.1.9-2 2-2s2 .9 2 2v8.18c-1.16.41-2 1.51-2 2.82 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.3-.84-2.4-2-2.82z',
    more: 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    sparkle: 'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z',
    person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    personAdd: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    sort: 'M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z',
    search: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    call: 'M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z',
    sms: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z',
    back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    refresh: 'M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
    chevronLeft: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z',
    chevronRight: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    dropDown: 'm7 10 5 5 5-5z',
    edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    star: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
    mail: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
    description: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    print: 'M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z',
    lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
    bluetooth: 'M17.71 7.71 12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z',
    keyboard: 'M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z',
    stop: 'M6 6h12v12H6z',
    mic: 'M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z',
    map: 'm20.5 3-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z'
};

const Icon: React.FC<{ name: TrkIcon; size: number; className?: string }> = ({ name, size, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true">
        <path d={ICONS[name]} />
    </svg>
);

const tint = (color: string) => ({ '--trkm-c': color }) as CSSProperties;

const StatusBar: React.FC<{ clock: string }> = ({ clock }) => (
    <div className="trkm__status">
        <span>{clock}</span>
        <span className="trkm__sysicons">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 23.6 6.8A18.4 18.4 0 0 0 12 3 18.4 18.4 0 0 0 .4 6.8z" /></svg>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 22h20V2z" /></svg>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg>
        </span>
    </div>
);

const AppBar: React.FC<{ items: TrkNavItem[] }> = ({ items }) => (
    <div className="trkm__appbar">
        {items.map(item => (
            <span className={item.on ? 'trkm__navitem is-on' : 'trkm__navitem'} key={item.icon}><Icon name={item.icon} size={28} /></span>
        ))}
    </div>
);

const SystemNav: React.FC = () => (
    <div className="trkm__sysnav" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M17 4v16L5 12z" /></svg>
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>
        <svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
    </div>
);

const Dashboard: React.FC<{ data: TrackerMockupLocale['dashboard'] }> = ({ data }) => (
    <div className="trkm-dash">
        <div className="trkm-dash__top">
            <span className="trkm-dash__tenant">{data.tenant}</span>
            <span className="trkm-dash__gateway"><i />{data.gateway}</span>
            <span className="trkm-dash__round"><Icon name="sparkle" size={22} /></span>
            <span className="trkm-dash__round"><Icon name="person" size={22} /></span>
        </div>
        <div className="trkm-dash__pinned">
            <div className="trkm-dash__head">
                <span>{data.pinnedTitle}</span>
                <b>{data.edit}</b>
            </div>
            <div className="trkm-dash__tiles">
                {data.pinned.map(tile => (
                    <div className="trkm-dash__tile" style={tint(tile.color)} key={tile.label}>
                        <Icon name={tile.icon} size={30} />
                        <span className="trkm-dash__tilelabel">{tile.label}</span>
                        <span className="trkm-dash__tilemodule">{tile.module}</span>
                    </div>
                ))}
            </div>
        </div>
        <div className="trkm-dash__modules">
            <span className="trkm-dash__section">{data.allModules}</span>
            <div className="trkm-dash__grid">
                {data.modules.map(module => (
                    <div className="trkm-dash__cell" style={tint(module.color)} key={module.label}>
                        <span className="trkm-dash__soft"><Icon name={module.icon} size={26} /></span>
                        <span className="trkm-dash__celllabel">{module.label}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const Calls: React.FC<{ data: TrackerMockupLocale['calls'] }> = ({ data }) => (
    <div className="trkm-buf">
        <div className="trkm-buf__header">
            <div className="trkm-buf__titlebar">
                <span className="trkm-buf__badge"><Icon name="inbox" size={20} /></span>
                <span className="trkm-buf__titles">
                    <b>{data.title}</b>
                    <span>{data.description}</span>
                </span>
                <span className="trkm-buf__sort"><Icon name="sort" size={24} /></span>
            </div>
            <div className="trkm-buf__search"><Icon name="search" size={24} /><span>{data.search}</span></div>
            <div className="trkm-buf__chips">
                <span className="trkm-buf__chip"><Icon name="call" size={16} />{data.categories.call}</span>
                <span className="trkm-buf__chip"><Icon name="sms" size={16} />{data.categories.sms}</span>
            </div>
        </div>
        <div className="trkm-buf__list">
            <div className="trkm-buf__meta">
                <span>{data.count}</span>
                <span className="trkm-buf__size">{data.pageSize}<Icon name="dropDown" size={16} /></span>
            </div>
            {data.rows.map(row => (
                <div className="trkm-buf__card" key={row.phone}>
                    <span className={`trkm-buf__kind is-${row.category}`}><Icon name={row.category} size={18} /></span>
                    <span className="trkm-buf__body">
                        <span className="trkm-buf__line">
                            <b>{row.phone}</b>
                            <span className={`trkm-buf__type is-${row.type}`}>{data.types[row.type]}</span>
                        </span>
                        <span className="trkm-buf__at">{row.at}</span>
                        <span className="trkm-buf__details">{row.details}</span>
                    </span>
                    <span className="trkm-buf__assign"><Icon name="personAdd" size={16} />{data.assign}</span>
                </div>
            ))}
        </div>
        <div className="trkm-buf__pager">
            <Icon name="chevronLeft" size={24} className="is-off" />
            <span>{data.pageOf}</span>
            <Icon name="chevronRight" size={24} />
        </div>
    </div>
);

const Pill: React.FC<{ text: string; tone: TrkTone }> = ({ text, tone }) => (
    <span className={`trkm-pill is-${tone}`}><i />{text}</span>
);

const Fields: React.FC<{ rows: TrkField[] }> = ({ rows }) => (
    <>{rows.map(row => <div className="trkm-trip__field" key={row.label}><span>{row.label}</span><b>{row.value}</b></div>)}</>
);

const Route: React.FC<{ data: TrackerMockupLocale['route'] }> = ({ data }) => (
    <div className="trkm-trip">
        <div className="trkm-trip__top">
            <span className="trkm-trip__back"><Icon name="back" size={24} /></span>
            <b>{data.trip}</b>
            <Pill text={data.status} tone="active" />
        </div>
        <div className="trkm-trip__content">
            <section className="trkm-trip__card">
                <div className="trkm-trip__cardhead">
                    <b>{data.tracking.title}</b>
                    <span className="trkm-trip__action"><Icon name="refresh" size={16} />{data.tracking.refresh}</span>
                </div>
                <div className="trkm-trip__line">
                    <span>{data.tracking.statusLabel}</span>
                    <Pill text={data.tracking.statusValue} tone="success" />
                </div>
                <div className="trkm-trip__line">
                    <span>{data.tracking.lastLabel}</span>
                    <b>{data.tracking.lastValue}</b>
                </div>
                <div className="trkm-trip__coords">{data.tracking.coordinates}</div>
                {data.tracking.rows.map(row => (
                    <div className="trkm-trip__line" key={row.label}><span>{row.label}</span><b>{row.value}</b></div>
                ))}
            </section>
            <section className="trkm-trip__card">
                <div className="trkm-trip__cardhead"><b>{data.executor.title}</b></div>
                <Fields rows={data.executor.rows} />
            </section>
            <section className="trkm-trip__card">
                <div className="trkm-trip__cardhead"><b>{data.settlement.title}</b></div>
                <Fields rows={data.settlement.rows} />
            </section>
            <section className="trkm-trip__card">
                <div className="trkm-trip__cardhead"><b>{data.orders.title}</b></div>
                {data.orders.rows.map(order => (
                    <div className="trkm-trip__order" key={order.number}>
                        <span className="trkm-trip__orderhead">
                            <b>{order.number}</b>
                            <Pill text={order.status} tone={order.tone} />
                            <span>{order.customer}</span>
                        </span>
                        <span className="trkm-trip__ordermeta"><span>{order.cargo}</span><b>{order.sell}</b></span>
                    </div>
                ))}
            </section>
        </div>
    </div>
);

const CrmClient: React.FC<{ data: TrackerMockupLocale['crmClient'] }> = ({ data }) => (
    <div className="trkm-cli">
        <div className="trkm-cli__top">
            <span className="trkm-trip__back"><Icon name="back" size={24} /></span>
            <b>{data.title}</b>
        </div>
        <div className="trkm-cli__list">
            <section className="trkm-cli__card">
                <div className="trkm-cli__head"><b>{data.managers.title}</b><i>1</i><Icon name="add" size={24} /></div>
                <div className="trkm-cli__row">
                    <span className="trkm-cli__who">
                        <span className="trkm-cli__name"><b>{data.managers.name}</b><span className="trkm-cli__star"><Icon name="star" size={10} />{data.managers.primary}</span></span>
                        <span className="trkm-cli__sub">{data.managers.email}</span>
                    </span>
                    <Icon name="close" size={16} className="trkm-cli__x" />
                </div>
            </section>
            <section className="trkm-cli__card">
                <div className="trkm-cli__head"><b>{data.contacts.title}</b><i>1</i><Icon name="add" size={24} /></div>
                <div className="trkm-cli__row">
                    <span className="trkm-cli__who">
                        <span className="trkm-cli__name"><b>{data.contacts.name}</b><span className="trkm-cli__pill">{data.contacts.primary}</span></span>
                        <span className="trkm-cli__link"><Icon name="mail" size={14} /><span>{data.contacts.email}</span></span>
                        <span className="trkm-cli__link"><Icon name="call" size={14} /><span>{data.contacts.phone}</span></span>
                    </span>
                    <Icon name="edit" size={16} className="trkm-cli__edit" />
                    <Icon name="close" size={16} className="trkm-cli__x" />
                </div>
            </section>
            <section className="trkm-cli__card">
                <div className="trkm-cli__head"><b>{data.lastContact.title}</b></div>
                <div className="trkm-cli__log is-head"><span /><span>{data.lastContact.date}</span><span>{data.lastContact.who}</span><span>{data.lastContact.withWhom}</span></div>
                {data.lastContact.rows.map(row => (
                    <div className="trkm-cli__log" key={row.at}>
                        <Icon name={row.kind === 'sms' ? 'mail' : 'call'} size={16} className={`is-${row.kind}`} />
                        <span>{row.at}</span><span>{row.phone}</span><span>{row.phone}</span>
                    </div>
                ))}
                <div className="trkm-cli__pages"><Icon name="chevronLeft" size={24} className="is-off" /><span>{data.lastContact.pageOf}</span><Icon name="chevronRight" size={24} /></div>
            </section>
        </div>
    </div>
);

const PrintDoc: React.FC<{ data: TrackerMockupLocale['printDoc'] }> = ({ data }) => (
    <div className="trkm-doc">
        <div className="trkm-doc__top">
            <span className="trkm-doc__btn"><Icon name="back" size={20} /></span>
            <span className="trkm-doc__badge"><Icon name="description" size={20} /></span>
            <b>{data.symbol}</b>
            <span className="trkm-doc__btn"><Icon name="download" size={20} /></span>
            <span className="trkm-doc__btn is-pressed"><Icon name="print" size={20} /></span>
            <span className="trkm-doc__btn"><Icon name="lock" size={20} /></span>
            <span className="trkm-doc__btn"><Icon name="close" size={20} /></span>
        </div>
        <div className="trkm-doc__content">
            <div className="trkm-doc__stripe">
                <b>{data.symbol}</b>
                <span className="trkm-doc__type">{data.typeLine}</span>
                <span className="trkm-doc__chips"><span className="is-draft">{data.status}</span><span className="is-out">{data.category}</span></span>
            </div>
            <div className="trkm-doc__tiles">
                {data.tiles.map(tile => <span className="trkm-doc__tile" key={tile.label}><small>{tile.label}</small><b>{tile.value}</b></span>)}
                <span className="trkm-doc__tile"><small>{data.pending.label}</small><b><em>{data.pending.value}</em></b></span>
            </div>
            <div className="trkm-doc__block">
                <div className="trkm-doc__poshead">
                    <b>{data.positions.title}</b>
                    <span>{data.positions.count}</span>
                    <span className="trkm-doc__add"><Icon name="add" size={14} />{data.positions.add}</span>
                </div>
                <div className="trkm-doc__empty"><span><Icon name="inventory" size={20} /></span>{data.positions.empty}</div>
            </div>
            <div className="trkm-doc__block trkm-doc__details">
                {data.details.map(row => <div key={row.label}><span>{row.label}</span><b>{row.value}</b></div>)}
            </div>
        </div>
        <div className="trkm-doc__actions">
            <span className="trkm-doc__cancel">{data.cancel}</span>
            <span className="trkm-doc__send">{data.send}</span>
        </div>
    </div>
);

const QR_SIZE = 25;

const qrPath = (() => {
    const finder = (x: number, y: number) => {
        const dx = x < 7 ? x : x - (QR_SIZE - 7);
        const dy = y < 7 ? y : y - (QR_SIZE - 7);
        return Math.max(Math.abs(dx - 3), Math.abs(dy - 3)) !== 2;
    };
    const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x >= QR_SIZE - 8 && y < 8) || (x < 8 && y >= QR_SIZE - 8);
    let seed = 4120;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cells: string[] = [];
    for (let y = 0; y < QR_SIZE; y++) {
        for (let x = 0; x < QR_SIZE; x++) {
            const corner = x < 7 || x >= QR_SIZE - 7 ? (y < 7 || (y >= QR_SIZE - 7 && x < 7)) : false;
            const dark = corner ? finder(x, y) : !inFinder(x, y) && (x === 6 || y === 6 ? (x + y) % 2 === 0 : random() < .48);
            if (dark) cells.push(`M${x} ${y}h1v1h-1z`);
        }
    }
    return cells.join('');
})();

const ZebraLabel: React.FC<{ data: TrackerMockupLocale['zebraLabel'] }> = ({ data }) => (
    <div className="trkm-zl">
        <div className="trkm-cli__top">
            <span className="trkm-trip__back"><Icon name="back" size={24} /></span>
            <b>{data.title}</b>
        </div>
        <div className="trkm-zl__content">
            <section className="trkm-trip__card">
                <b className="trkm-zl__product">{data.product}</b>
                <div className="trkm-trip__line"><span>{data.receivedLabel}</span><b className="trkm-zl__qty">{data.received}</b></div>
            </section>
            <section className="trkm-trip__card">
                <div className="trkm-trip__cardhead"><b>{data.printer.title}</b></div>
                <div className="trkm-zl__printer">
                    <span className="trkm-zl__icons"><Icon name="bluetooth" size={22} /><Icon name="print" size={22} /></span>
                    <span className="trkm-zl__device"><b>{data.printer.model}</b><span>{data.printer.mac}</span></span>
                </div>
                <div className="trkm-trip__line"><span>{data.printer.statusLabel}</span><Pill text={data.printer.status} tone="success" /></div>
            </section>
            <section className="trkm-trip__card">
                <div className="trkm-trip__cardhead"><b>{data.preview.title}</b></div>
                <div className="trkm-zl__label">
                    <svg className="trkm-zl__qr" viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`} shapeRendering="crispEdges" aria-hidden="true"><path d={qrPath} /></svg>
                    <span className="trkm-zl__lines"><span>{data.preview.name}</span><span>{data.preview.quantity}</span><span>{data.preview.code}</span></span>
                </div>
            </section>
            <section className="trkm-trip__card">
                <span className="trkm-zl__field"><small>{data.copiesLabel}</small>{data.copies}</span>
            </section>
        </div>
        <div className="trkm-doc__actions">
            <span className="trkm-zl__cancel">{data.cancel}</span>
            <span className="trkm-doc__send trkm-zl__print"><Icon name="print" size={16} />{data.print}</span>
        </div>
    </div>
);

const LevelBars: React.FC = () => (
    <span className="trkm-lemy__bars" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => <i key={index} style={{ '--i': index } as CSSProperties} />)}
    </span>
);

const LemySheet: React.FC<{ status: string; hint?: string; children: React.ReactNode }> = ({ status, hint, children }) => (
    <div className="trkm-lemy">
        <div className="trkm-lemy__sheet">
            <div className="trkm-lemy__head">
                <span className="trkm-lemy__avatar"><Icon name="sparkle" size={16} /></span>
                <span className="trkm-lemy__status"><b>{status}</b>{hint && <span>{hint}</span>}</span>
                <Icon name="close" size={20} className="trkm-lemy__close" />
            </div>
            {children}
        </div>
    </div>
);

const LemyListen: React.FC<{ data: TrackerMockupLocale }> = ({ data }) => {
    const lemy = data.lemyListen;
    return (
        <>
            <div className="trkm-lemy-bg" data-cards="2"><CrmClient data={data.crmClient} /></div>
            <LemySheet status={lemy.status} hint={lemy.hint}>
                <LevelBars />
                <span className="trkm-lemy__said">{lemy.said}</span>
                <div className="trkm-lemy__row">
                    <span className="trkm-lemy__round" title={lemy.keyboard}><Icon name="keyboard" size={22} /></span>
                    <span className="trkm-lemy__stop"><Icon name="stop" size={20} />{lemy.stop}</span>
                    <span className="trkm-lemy__gap" />
                </div>
            </LemySheet>
        </>
    );
};

const LemyConfirm: React.FC<{ data: TrackerMockupLocale }> = ({ data }) => {
    const lemy = data.lemyConfirm;
    return (
        <>
            <div className="trkm-lemy-bg" data-cards="1"><CrmClient data={data.crmClient} /></div>
            <LemySheet status={lemy.status}>
                <span className="trkm-lemy__said">{lemy.said}</span>
                <div className="trkm-lemy__card">
                    <span className="trkm-lemy__pill">{lemy.card.title}</span>
                    <b>{lemy.card.target}</b>
                    <span className="trkm-lemy__preview">{lemy.card.preview}</span>
                    <span className="trkm-lemy__expires">{lemy.card.expires}</span>
                    <span className="trkm-lemy__buttons">
                        <span className="trkm-lemy__cancel">{lemy.card.cancel}</span>
                        <span className="trkm-lemy__confirm">{lemy.card.confirm}</span>
                    </span>
                    <span className="trkm-lemy__voice">{lemy.card.voiceHint}</span>
                </div>
                <div className="trkm-lemy__row">
                    <span className="trkm-lemy__round" title={lemy.keyboard}><Icon name="keyboard" size={22} /></span>
                    <span className="trkm-lemy__mic" title={lemy.mic}><Icon name="mic" size={26} /></span>
                    <span className="trkm-lemy__gap" />
                </div>
            </LemySheet>
        </>
    );
};

const SCREENS: Record<TrkScreen, React.FC<{ data: TrackerMockupLocale }>> = {
    dashboard: ({ data }) => <Dashboard data={data.dashboard} />,
    calls: ({ data }) => <Calls data={data.calls} />,
    route: ({ data }) => <Route data={data.route} />,
    crmClient: ({ data }) => <CrmClient data={data.crmClient} />,
    printDoc: ({ data }) => <PrintDoc data={data.printDoc} />,
    zebraLabel: ({ data }) => <ZebraLabel data={data.zebraLabel} />,
    lemyListen: LemyListen,
    lemyConfirm: LemyConfirm
};

export const TrackerPhone: React.FC<{ screen: TrkScreen; data: TrackerMockupLocale }> = ({ screen, data }) => {
    const Screen = SCREENS[screen];
    return (
        <div className="trkm" role="img" aria-label={data.aria[screen]}>
            <div className="trkm__phone" aria-hidden="true">
                <div className="trkm__screen">
                    <StatusBar clock={data.clock} />
                    <div className="trkm__body"><Screen data={data} /></div>
                    <AppBar items={data[screen].nav} />
                    <SystemNav />
                </div>
            </div>
        </div>
    );
};

export default TrackerPhone;
