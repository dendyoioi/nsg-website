/**
 * PT NATTU GLOBAL SYNERGY - INTERACTIVE DEMO & QUOTATION HUB SCRIPT
 */

// State Management
const appState = {
    viewMode: 'compro', // 'compro' | 'quotation' | 'split'
    device: 'desktop',  // 'desktop' | 'tablet' | 'mobile'
    lang: 'en',         // 'en' | 'id' (English is default)
    selectedDomain: 'co.id',
    domainPrice: 270000,
    hostingPrice: 450000,
    devPrice: 2800000,
    maintPrice: 1500000
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    updateCalculatorValues();
    setupScrollSpy();
    applyLanguage(appState.lang);
});

// Language Switcher Engine
function setLanguage(lang) {
    appState.lang = lang;
    applyLanguage(lang);

    // Update Language Toggle Buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    showToast(lang === 'en' ? 'Language switched to ENGLISH' : 'Bahasa diubah ke INDONESIA');
}

function applyLanguage(lang) {
    const elements = document.querySelectorAll('[data-en][data-id]');
    elements.forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                el.innerHTML = text;
            }
        }
    });
}

// View Mode Switcher (Compro vs Quotation vs Split)
function switchViewMode(mode) {
    appState.viewMode = mode;
    document.body.className = `mode-${mode} device-${appState.device}`;

    // Update Tab Buttons
    document.querySelectorAll('.demo-tab').forEach(btn => btn.classList.remove('active'));
    if (mode === 'compro') document.getElementById('tabCompro').classList.add('active');
    if (mode === 'quotation') document.getElementById('tabQuotation').classList.add('active');
    if (mode === 'split') document.getElementById('tabSplit').classList.add('active');

    // Scroll view to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showToast(`View Mode: ${mode.toUpperCase()}`);
}

// Device Viewport Emulator
function setDeviceViewport(device) {
    appState.device = device;
    document.body.className = `mode-${appState.viewMode} device-${device}`;

    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.device === device);
    });

    showToast(`Device Frame: ${device.toUpperCase()}`);
}

// Domain Selector & Dynamic Calculator
function selectDomain(ext, price) {
    appState.selectedDomain = ext;
    appState.domainPrice = price;

    // Update Radio UI Cards
    document.querySelectorAll('.domain-option-card').forEach(card => {
        const input = card.querySelector('input');
        if (input.value === ext) {
            card.classList.add('selected');
            input.checked = true;
        } else {
            card.classList.remove('selected');
        }
    });

    updateCalculatorValues();
}

// Format Currency Utility (IDR)
function formatIDR(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

// Recalculate Totals
function updateCalculatorValues() {
    const domainPrice = appState.domainPrice;
    const hostingPrice = appState.hostingPrice;
    const devPrice = appState.devPrice;
    const maintPrice = appState.maintPrice;

    // Calculations
    const biznetDirectVal = hostingPrice + domainPrice; // Direct to Biznet (No DP allowed)
    const totalServiceVal = devPrice + maintPrice;      // Service cost eligible for 50% DP
    const totalYear1 = biznetDirectVal + totalServiceVal;
    
    const dpVal = Math.round(totalServiceVal * 0.5);      // DP 50% of Service Cost = 2.150.000
    const pelunasanVal = totalServiceVal - dpVal;        // Pelunasan 50% of Service Cost = 2.150.000
    
    const renewalNoMaint = hostingPrice + domainPrice;
    const renewalWithMaint = hostingPrice + domainPrice + maintPrice;

    // Update DOM Elements in Table
    const labelElem = document.getElementById('selectedDomainLabel');
    const priceElem = document.getElementById('selectedDomainPrice');
    const totalElem = document.getElementById('totalYear1Val');
    const biznetElem = document.getElementById('biznetDirectVal');
    const dpElem = document.getElementById('dpVal');
    const pelunasanElem = document.getElementById('pelunasanVal');
    const renewalNoMaintElem = document.getElementById('renewalNoMaintVal');
    const renewalWithMaintElem = document.getElementById('renewalWithMaintVal');

    if (labelElem) labelElem.innerText = `.${appState.selectedDomain}`;
    if (priceElem) priceElem.innerText = formatIDR(domainPrice);
    if (totalElem) totalElem.innerText = formatIDR(totalYear1);
    if (biznetElem) biznetElem.innerText = formatIDR(biznetDirectVal);
    if (dpElem) dpElem.innerText = formatIDR(dpVal);
    if (pelunasanElem) pelunasanElem.innerText = formatIDR(pelunasanVal);
    if (renewalNoMaintElem) renewalNoMaintElem.innerText = `± ${formatIDR(renewalNoMaint)} / thn`;
    if (renewalWithMaintElem) renewalWithMaintElem.innerText = `± ${formatIDR(renewalWithMaint)} / thn`;

    // Update Modal Summary Values
    const modalDomain = document.getElementById('modalDomainLabel');
    const modalTotal = document.getElementById('modalTotalVal');
    const modalBiznet = document.getElementById('modalBiznetVal');
    const modalDp = document.getElementById('modalDpVal');

    if (modalDomain) modalDomain.innerText = `.${appState.selectedDomain}`;
    if (modalTotal) modalTotal.innerText = formatIDR(totalYear1);
    if (modalBiznet) modalBiznet.innerText = formatIDR(biznetDirectVal);
    if (modalDp) modalDp.innerText = formatIDR(dpVal);
}

// Vision & Mission Tab Switcher
function switchVmTab(tab) {
    document.querySelectorAll('.vm-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.vm-tab-content').forEach(content => content.classList.remove('active'));

    if (tab === 'visi') {
        document.querySelector('.vm-tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('vmVisi').classList.add('active');
    } else {
        document.querySelector('.vm-tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('vmMisi').classList.add('active');
    }
}

// Mobile Nav Toggle
function toggleMobileNav() {
    const nav = document.getElementById('siteNav');
    nav.classList.toggle('active');
}

// Contact Form Handler Simulation
function handleFormSubmit(e) {
    e.preventDefault();
    const nama = document.getElementById('namaLengkap').value;
    const isEn = appState.lang === 'en';

    showToast(isEn ? `Thank you ${nama}! Your inquiry has been successfully sent.` : `Terima kasih Bpk/Ibu ${nama}! Pesan konsultasi Anda telah terkirim.`, 'success');
    document.getElementById('contactForm').reset();
}

// Approval Modal Handlers
function openApprovalModal() {
    document.getElementById('approvalModal').classList.add('show');
}

function closeApprovalModal() {
    document.getElementById('approvalModal').classList.remove('show');
}

// Submit Quotation Approval via WhatsApp
function submitApproval(e) {
    e.preventDefault();
    const ownerName = document.getElementById('appOwnerName').value;
    const catatan = document.getElementById('appCatatan').value;
    const domain = appState.selectedDomain;
    const biznetTotal = formatIDR(appState.hostingPrice + appState.domainPrice);
    const total = formatIDR(appState.hostingPrice + appState.domainPrice + appState.devPrice + appState.maintPrice);

    let message = `Halo%20Developer,%20saya%20*${encodeURIComponent(ownerName)}*%20Owner/Direksi%20PT%20Nattu%20Global%20Synergy.` +
        `%0A%0ASaya%20MENYETUJUI%20Dokumen%20Penawaran%20*QUO-NSG-2026/07/001*:` +
        `%0A-%20*Pilihan%20Domain:*%20.${domain}` +
        `%0A-%20*Total%20Investasi%20Thn%201:*%20${encodeURIComponent(total)}` +
        `%0A-%20*Bayar%20Direct%20ke%20Biznet%20(100%25):*%20${encodeURIComponent(biznetTotal)}` +
        `%0A-%20*DP%2050%25%20Biaya%20Jasa%20Developer:*%20Rp%202.150.000` +
        `%0A-%20*Pelunasan%2050%25%20Biaya%20Jasa:*%20Rp%202.150.000`;

    if (catatan) {
        message += `%0A-%20*Catatan:*%20${encodeURIComponent(catatan)}`;
    }

    closeApprovalModal();
    showToast('Persetujuan berhasil diproses! Mengarahkan ke WhatsApp...', 'success');

    setTimeout(() => {
        window.open(`https://wa.me/6282240206861?text=${message}`, '_blank');
    }, 1000);
}

// Scrollspy for Prototype Navigation
function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const navItem = document.querySelector(`.site-nav a[href*=${sectionId}]`);

            if (navItem) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navItem.classList.add('active');
                } else {
                    navItem.classList.remove('active');
                }
            }
        });
    });
}

// Toast Notifications
function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-info'}"></i> <span>${msg}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
