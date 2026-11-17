import React from 'react';
import { Language } from '../../types';

type Step = { text: string; meta: string };
type CloudText = { label: string; title: string; plan: string; planResult: string; release: string; steps: Step[]; done: string };

const CLOUD_MOCK: Record<Language, CloudText> = {
    pl: {
        label: 'Terminal: plan infrastruktury bez zmian i wydanie z kopią bazy, wdrożeniem 34 serwisów i planem wycofania',
        title: 'wydanie 0.7.6',
        plan: '$ terraform plan',
        planResult: 'No changes. Your infrastructure matches the configuration.',
        release: '$ wydanie 0.7.6',
        steps: [
            { text: 'Kopia bazy danych przed wydaniem', meta: '41 s' },
            { text: 'Obrazy poprzedniej wersji zapisane do wycofania', meta: '34 serwisy' },
            { text: 'Wdrożenie stopniowe, bez przerwy w pracy', meta: '6 min 12 s' },
            { text: 'Kontrola gotowości serwisów', meta: '34 / 34' },
            { text: 'Alerty na wzrost błędów włączone', meta: 'monitoring' }
        ],
        done: 'Wydanie gotowe. Wycofanie jedną komendą.'
    },
    en: {
        label: 'Terminal: an infrastructure plan with no changes and a release with a database backup, a rollout of 34 services and a rollback plan',
        title: 'release 0.7.6',
        plan: '$ terraform plan',
        planResult: 'No changes. Your infrastructure matches the configuration.',
        release: '$ release 0.7.6',
        steps: [
            { text: 'Database backup before the release', meta: '41 s' },
            { text: 'Previous images saved for rollback', meta: '34 services' },
            { text: 'Rolling deployment, no downtime', meta: '6 min 12 s' },
            { text: 'Service readiness checks', meta: '34 / 34' },
            { text: 'Error-rate alerts on', meta: 'monitoring' }
        ],
        done: 'Release ready. Rollback is one command.'
    }
};

const CloudMock: React.FC<{ language: Language }> = ({ language }) => {
    const text = CLOUD_MOCK[language];
    return (
        <div className="ui ui-panel ui-win cloudm" role="img" aria-label={text.label}>
            <div className="ui-win__bar">
                <span className="ui-dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="ui-win__crumb"><b>{text.title}</b></span>
            </div>
            <div className="cloudm__body">
                <p className="cloudm__cmd">{text.plan}</p>
                <p className="cloudm__ok">{text.planResult}</p>
                <p className="cloudm__cmd">{text.release}</p>
                <ul className="cloudm__steps">
                    {text.steps.map(step => (
                        <li key={step.text}><span className="cloudm__tick" aria-hidden="true">✓</span><span>{step.text}</span><span className="cloudm__meta">{step.meta}</span></li>
                    ))}
                </ul>
                <p className="cloudm__done">{text.done}</p>
            </div>
        </div>
    );
};

export default CloudMock;
