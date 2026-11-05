// Vanilla JavaScript enhancements for PgrStudentManagement.Web.
// Client-side form validation relies strictly on native HTML5 constraint attributes.

(function () {
    'use strict';

    /**
     * Toggles the responsive navigation menu on small screens without Bootstrap JS.
     */
    function initNavbarToggle() {
        const togglers = document.querySelectorAll('.navbar-toggler');
        togglers.forEach((toggler) => {
            toggler.addEventListener('click', () => {
                const targetId = toggler.getAttribute('aria-controls');
                const menu = targetId
                    ? document.getElementById(targetId)
                    : toggler.closest('.navbar')?.querySelector('.navbar-collapse');

                if (!menu) {
                    return;
                }

                const isExpanded = menu.classList.toggle('show');
                toggler.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            });
        });
    }

    /**
     * Moves keyboard focus to the server-side accessible error summary banner when present.
     */
    function initErrorSummaryFocus() {
        const errorSummary = document.getElementById('error-summary');
        if (errorSummary) {
            errorSummary.focus();
        }
    }

    /**
     * Initializes accessible live character counters for fields with a data-maxlength attribute.
     */
    function initCharacterCounters() {
        const fields = document.querySelectorAll('[data-maxlength]');
        fields.forEach((field) => {
            const counterId = field.id ? `${field.id}-count` : null;
            const counter = counterId ? document.getElementById(counterId) : null;
            if (!counter) {
                return;
            }

            const max = parseInt(field.getAttribute('data-maxlength') || '2000', 10);
            if (Number.isNaN(max)) {
                return;
            }

            function updateCount() {
                const remaining = max - field.value.length;
                if (remaining >= 0) {
                    counter.textContent = `You have ${remaining.toLocaleString()} characters remaining`;
                    counter.classList.remove('text-danger');
                } else {
                    counter.textContent = `You have ${Math.abs(remaining).toLocaleString()} characters too many`;
                    counter.classList.add('text-danger');
                }
            }

            field.addEventListener('input', updateCount);
            updateCount();
        });
    }

    /**
     * Initializes progressive-enhancement multi-step form panels ([data-step-panel] and [data-step]).
     * Automatically reveals the panel containing an invalid field when native HTML5 validation runs.
     */
    function initStepWizard() {
        const panels = document.querySelectorAll('[data-step-panel]');
        const buttons = document.querySelectorAll('[data-step]');
        if (panels.length === 0 || buttons.length === 0) {
            return;
        }

        function showStep(stepNumber) {
            const targetStep = String(stepNumber);

            panels.forEach((panel) => {
                panel.hidden = panel.getAttribute('data-step-panel') !== targetStep;
            });

            buttons.forEach((button) => {
                const isActive = button.getAttribute('data-step') === targetStep;
                button.classList.toggle('active', isActive);
                if (isActive) {
                    button.setAttribute('aria-current', 'step');
                } else {
                    button.removeAttribute('aria-current');
                }
            });
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                showStep(button.getAttribute('data-step'));
            });
        });

        // When native HTML5 validation flags a control inside a hidden step panel,
        // reveal that step panel immediately so the browser can focus the control.
        const form = panels[0].closest('form');
        if (form) {
            form.addEventListener(
                'invalid',
                (event) => {
                    const target = event.target;
                    if (!(target instanceof HTMLElement)) {
                        return;
                    }
                    const panel = target.closest('[data-step-panel]');
                    if (panel && panel.hidden) {
                        showStep(panel.getAttribute('data-step-panel'));
                    }
                },
                true
            );
        }

        showStep(1);
    }

    function init() {
        initNavbarToggle();
        initErrorSummaryFocus();
        initCharacterCounters();
        initStepWizard();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
