import React from 'react';
import { Inbox } from '../types';

const MailIcon: React.FC<{ className?: string }> = ({ className = 'ui-icon' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m22 7-8.99 5.73a2 2 0 0 1-2.02 0L2 7" />
        <rect width="20" height="16" x="2" y="4" rx="2" />
    </svg>
);

const OrderInbox: React.FC<{ inbox: Inbox }> = ({ inbox }) => (
    <div className="ui ui-panel ui-win inbox" role="img" aria-label={inbox.label}>
        <div className="ui-win__bar">
            <span className="ui-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="ui-win__crumb"><MailIcon className="ui-brand" />{inbox.app} <i>/</i> <b>{inbox.view}</b></span>
            <span className="ui-spacer" />
            <span className="ui-win__search">
                <svg className="ui-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
                <span className="ui-win__ph">{inbox.search}</span>
            </span>
        </div>
        <div className="inbox__tabs">
            {inbox.folders.map((folder, index) => (
                <span className={index === 0 ? 'inbox__tab is-on' : 'inbox__tab'} key={folder.name}>
                    {folder.name}{folder.count !== undefined && <em>{folder.count}</em>}
                </span>
            ))}
        </div>
        <div className="inbox__cols">{inbox.columns.map(column => <span key={column}>{column}</span>)}</div>
        <ul className="inbox__rows">
            {inbox.rows.map(row => (
                <li className={row.review ? 'inbox__row is-sel' : 'inbox__row'} key={row.sender}>
                    <span className="inbox__icon"><MailIcon /></span>
                    <span className="inbox__who"><b>{row.sender}</b><span>{row.items}</span></span>
                    <span className="inbox__match">{row.match}%</span>
                    {row.review
                        ? <span className="ui-chip ui-chip--ink">{inbox.review}</span>
                        : <span className="ui-btn ui-btn--sm">{inbox.approve}</span>}
                </li>
            ))}
        </ul>
        <div className="inbox__open">
            <p className="inbox__title">{inbox.open.title}</p>
            <p className="inbox__mail">{inbox.open.mail}</p>
            <ul className="inbox__lines">
                {inbox.open.lines.map(line => (
                    <li className={line.pick ? 'inbox__line is-pick' : 'inbox__line'} key={line.name}>
                        <span>{line.name}</span>
                        <span>{line.qty}</span>
                        <span className="inbox__match">{line.match}%</span>
                        {line.pick && <span className="ui-chip ui-chip--accent">{line.pick}</span>}
                    </li>
                ))}
            </ul>
            <div className="inbox__actions">
                <span className="ui-btn ui-btn--sm ui-btn--ghost">{inbox.open.fix}</span>
                <span className="ui-btn ui-btn--sm">{inbox.approve}</span>
            </div>
        </div>
    </div>
);

export default OrderInbox;
