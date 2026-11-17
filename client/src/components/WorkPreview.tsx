import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import CloudMock from './mockups/CloudMock';
import { MailOrdersMock, OffersMock, WeighbridgeMock } from './mockups/CaseMockups';
import { CASE_MOCKUP } from './mockups/caseMockupData';
import TrackerPhone from './mockups/TrackerMockups';
import { TRACKER_MOCKUP } from './mockups/trackerMockupData';

export const PREVIEW_KEYS = ['cloud', 'weighbridge', 'mailOrders', 'crmApp', 'labels', 'offers'] as const;
export type PreviewKey = typeof PREVIEW_KEYS[number];

const renderPreview = (key: PreviewKey, language: Language): React.ReactNode => {
    switch (key) {
        case 'cloud': return <CloudMock language={language} />;
        case 'crmApp': return <TrackerPhone screen="crmClient" data={TRACKER_MOCKUP[language]} />;
        case 'labels': return <TrackerPhone screen="zebraLabel" data={TRACKER_MOCKUP[language]} />;
        case 'weighbridge': return <WeighbridgeMock data={CASE_MOCKUP[language]} />;
        case 'mailOrders': return <MailOrdersMock data={CASE_MOCKUP[language]} />;
        case 'offers': return <OffersMock data={CASE_MOCKUP[language]} />;
        default: return null;
    }
};

export const hasPreview = (key: PreviewKey) => renderPreview(key, 'pl') !== null;

const WorkPreview: React.FC<{ previewKey: PreviewKey | null; title: string; closeLabel: string; language: Language; onClose: () => void }> = ({ previewKey, title, closeLabel, language, onClose }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (previewKey && !dialog.open) dialog.showModal();
        if (!previewKey && dialog.open) dialog.close();
    }, [previewKey]);

    return (
        <dialog
            ref={dialogRef}
            className="preview"
            aria-labelledby="preview-h"
            onClose={onClose}
            onClick={event => { if (event.target === event.currentTarget) onClose(); }}
        >
            {previewKey && (
                <div className="preview__inner">
                    <div className="preview__bar">
                        <h2 id="preview-h" className="preview__title">{title}</h2>
                        <button className="btn btn--secondary btn--sm" type="button" onClick={onClose} autoFocus>{closeLabel}</button>
                    </div>
                    <div className="preview__stage">{renderPreview(previewKey, language)}</div>
                </div>
            )}
        </dialog>
    );
};

export default WorkPreview;
