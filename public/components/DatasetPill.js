import { api } from '../services/api.js';

export class DatasetPill {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isOpen = false;
        this.datasets = [];
        this.activeDataset = null;
    }

    async init() {
        if (!this.container) return;
        await this.refreshData();
        this.render();
        this.bindEvents();

        // Listen for external updates
        api.onDatasetChange(() => {
            this.refreshData().then(() => this.render());
        });
    }

    async refreshData() {
        const res = await api.getDatasets();
        if (res && res.success) {
            this.datasets = res.datasets || [];
            this.activeDataset = res.activeDataset || null;
        }
    }

    render() {
        if (!this.container) return;

        let activeName = "No Dataset";
        const fullName = this.activeDataset ? (this.activeDataset.name || this.activeDataset.datasetName) : null;
        if (fullName) {
            activeName = fullName.split(' ')[0]; // short name
        }

        let optionsHtml = '';
        this.datasets.forEach(ds => {
            const isActive = ds.active || ds.isActive;
            const desc = ds.description || (ds.reads ? `${ds.reads.toLocaleString()} reads` : 'FASTQ dataset');
            optionsHtml += `
                <div class="dataset-option-item ${isActive ? 'active' : ''}" data-id="${ds.id}">
                    <div class="ds-opt-info">
                        <span class="ds-opt-name">${ds.name}</span>
                        <span class="ds-opt-desc">${desc}</span>
                    </div>
                    ${isActive ? '<span class="ds-opt-badge">&#10004; Active</span>' : ''}
                </div>
            `;
        });

        this.container.innerHTML = `
            <div class="dataset-pill-wrapper ${this.isOpen ? 'open' : ''}" id="datasetPillWrapper">
                <button type="button" class="dataset-pill-btn" id="btnToggleDatasetPill" title="Click to switch dataset">
                    <span class="dataset-status-dot"></span>
                    <span class="dataset-pill-label">${activeName}</span>
                    <span class="dataset-caret">&#9662;</span>
                </button>
                <div class="dataset-dropdown-menu" id="datasetDropdownMenu">
                    <div class="dropdown-header-title">Active Index Dataset</div>
                    <div class="dataset-options-list">
                        ${optionsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const toggleBtn = this.container.querySelector('#btnToggleDatasetPill');
        const wrapper = this.container.querySelector('#datasetPillWrapper');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                wrapper.classList.add('open');
            } else {
                wrapper.classList.remove('open');
            }
        });

        // Click outside closes dropdown
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target)) {
                this.isOpen = false;
                wrapper?.classList.remove('open');
            }
        });

        // Click on dataset option
        this.container.addEventListener('click', async (e) => {
            const opt = e.target.closest('.dataset-option-item');
            if (opt) {
                const datasetId = opt.getAttribute('data-id');
                if (datasetId) {
                    await api.setActiveDataset(datasetId);
                    this.isOpen = false;
                    await this.refreshData();
                    this.render();
                    this.bindEvents();
                }
            }
        });
    }
}
