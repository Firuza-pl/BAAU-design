// BAAU HR Automation — shared UI behaviour (mockup stage, no backend calls yet)

document.addEventListener("DOMContentLoaded", function () {
  initTabs();
  initTableFilter();
  initModals();
  initRadioCards();
  initRepeatRows();
  initCascadingSelects();
  initPageLoader();
  initScrollTop();
  initUserMenu();
  initNotifMenu();
  initPasswordToggles();
  initTableExports();
  initBirthdayBanner();
  initMilitaryTabGender();
  initDropzones();
});

/* =========================================================
   Sidebar user menu (logout)
   ========================================================= */

function initUserMenu() {
  document.querySelectorAll("[data-user-menu-toggle]").forEach(function (toggle) {
    var menu = toggle.parentElement.querySelector("[data-user-menu]");
    if (!menu) return;
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll("[data-user-menu].open").forEach(function (m) {
      m.classList.remove("open");
    });
  });
}

/* =========================================================
   Topbar notification dropdown
   ========================================================= */

function initNotifMenu() {
  document.querySelectorAll("[data-notif-toggle]").forEach(function (toggle) {
    var menu = toggle.parentElement.querySelector("[data-notif-menu]");
    if (!menu) return;
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var wasOpen = menu.classList.contains("open");
      document.querySelectorAll("[data-notif-menu].open").forEach(function (m) {
        m.classList.remove("open");
      });
      if (!wasOpen) menu.classList.add("open");
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll("[data-notif-menu].open").forEach(function (m) {
      m.classList.remove("open");
    });
  });
}

/* =========================================================
   Password show/hide toggles ([data-toggle="password"] wrapper)
   ========================================================= */

function initPasswordToggles() {
  document.querySelectorAll(".input-icon-wrap.has-toggle").forEach(function (wrap) {
    var toggle = wrap.querySelector(".password-toggle");
    var input = wrap.querySelector("input");
    if (!toggle || !input) return;
    toggle.addEventListener("click", function () {
      var showing = input.type === "text";
      input.type = showing ? "password" : "text";
      toggle.classList.toggle("showing", !showing);
    });
  });
}

/* =========================================================
   Page-transition loading bar
   Fills in on every page load, and kicks off again on click
   of any internal link so navigation between pages feels alive.
   ========================================================= */

function initPageLoader() {
  var bar = document.createElement("div");
  bar.className = "page-loader";
  document.body.appendChild(bar);

  requestAnimationFrame(function () {
    bar.style.width = "100%";
  });
  setTimeout(function () { bar.classList.add("done"); }, 280);
  setTimeout(function () { bar.remove(); }, 600);

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href]");
    if (!link) return;
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#" || href.indexOf("javascript:") === 0) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;

    var travelBar = document.querySelector(".page-loader");
    if (!travelBar) {
      travelBar = document.createElement("div");
      travelBar.className = "page-loader";
      document.body.appendChild(travelBar);
    }
    travelBar.classList.remove("done");
    travelBar.style.transition = "none";
    travelBar.style.width = "0%";
    void travelBar.offsetWidth;
    travelBar.style.transition = "";
    travelBar.style.width = "78%";
  });
}

/* =========================================================
   Scroll-to-top button
   Shows once the page has been scrolled down a bit.
   ========================================================= */

function initScrollTop() {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "scroll-top-btn";
  btn.setAttribute("aria-label", "Yuxarı qayıt");
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
  document.body.appendChild(btn);

  function toggle() {
    if (window.scrollY > 320) btn.classList.add("visible");
    else btn.classList.remove("visible");
  }
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initTabs() {
  var tabButtons = document.querySelectorAll("[data-tab-target]");
  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.closest("[data-tab-group]");
      if (!group) return;
      var targetId = btn.getAttribute("data-tab-target");

      group.querySelectorAll("[data-tab-target]").forEach(function (b) {
        b.classList.remove("active");
      });
      group.querySelectorAll("[data-tab-panel]").forEach(function (p) {
        p.classList.remove("active");
      });

      btn.classList.add("active");
      var panel = group.querySelector('[data-tab-panel="' + targetId + '"]');
      if (panel) panel.classList.add("active");
    });
  });

  // Deep-linking: /page.html#tab-id opens straight into that tab.
  var hash = window.location.hash.replace("#", "");
  if (hash) {
    var target = document.querySelector('[data-tab-target="' + hash + '"]');
    if (target) target.click();
  }
}

function initTableFilter() {
  var input = document.querySelector("[data-table-search]");
  if (!input) return;
  var table = document.querySelector("[data-table-target]");
  if (!table) return;

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    var rows = table.querySelectorAll("tbody tr");
    rows.forEach(function (row) {
      var text = row.textContent.toLowerCase();
      row.style.display = text.indexOf(q) !== -1 ? "" : "none";
    });
  });
}

/* =========================================================
   Excel / Word export
   data-export-excel / data-export-word on a button inside a
   .table-toolbar exports the table.data-table in the next
   .table-wrap — always reads the LIVE table at click time, so
   it works the same whether rows are mock data or came from a
   real backend response, and skips rows hidden by the search box.
   ========================================================= */

function findExportTable(btn) {
  var toolbar = btn.closest(".table-toolbar");
  if (!toolbar) return null;
  var wrap = toolbar.nextElementSibling;
  while (wrap && !wrap.classList.contains("table-wrap")) wrap = wrap.nextElementSibling;
  return wrap ? wrap.querySelector("table") : null;
}

function tableToRows(table) {
  var rows = [];
  var headers = Array.prototype.map.call(table.querySelectorAll("thead th"), function (th) {
    return th.textContent.trim();
  });
  rows.push(headers);
  Array.prototype.forEach.call(table.querySelectorAll("tbody tr"), function (tr) {
    if (tr.style.display === "none") return;
    var cells = Array.prototype.map.call(tr.querySelectorAll("td"), function (td) {
      return td.textContent.trim().replace(/\s+/g, " ");
    });
    rows.push(cells);
  });
  return rows;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function downloadBlob(content, mime, filename) {
  var blob = new Blob(["﻿" + content], { type: mime });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function exportName(btn) {
  return (btn.getAttribute("data-export-excel") || btn.getAttribute("data-export-word") ||
    (document.title || "hesabat").split("—")[0].trim().replace(/\s+/g, "_").toLowerCase());
}

function exportTableToExcel(table, filename) {
  var rows = tableToRows(table);
  var html = "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:x=\"urn:schemas-microsoft-com:office:excel\" xmlns=\"http://www.w3.org/TR/REC-html40\"><head><meta charset=\"UTF-8\"></head><body><table>";
  rows.forEach(function (r, i) {
    html += "<tr>" + r.map(function (c) {
      var tag = i === 0 ? "th" : "td";
      return "<" + tag + ">" + escapeHtml(c) + "</" + tag + ">";
    }).join("") + "</tr>";
  });
  html += "</table></body></html>";
  downloadBlob(html, "application/vnd.ms-excel;charset=utf-8", filename + ".xls");
}

function exportTableToWord(table, filename) {
  var rows = tableToRows(table);
  var title = document.querySelector("h1") ? document.querySelector("h1").textContent.trim() : "Hesabat";
  var html = "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" xmlns=\"http://www.w3.org/TR/REC-html40\"><head><meta charset=\"UTF-8\">" +
    "<style>body{font-family:Calibri,Arial,sans-serif;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #999;padding:6px 10px;font-size:12px;} th{background:#262d6e;color:#fff;text-align:left;}</style>" +
    "</head><body><h3>" + escapeHtml(title) + "</h3><table>";
  rows.forEach(function (r, i) {
    html += "<tr>" + r.map(function (c) {
      var tag = i === 0 ? "th" : "td";
      return "<" + tag + ">" + escapeHtml(c) + "</" + tag + ">";
    }).join("") + "</tr>";
  });
  html += "</table></body></html>";
  downloadBlob(html, "application/msword;charset=utf-8", filename + ".doc");
}

/* =========================================================
   Birthday greeting banner (employee portal)
   <body data-birthday="MM-DD"> holds the logged-in employee's
   birth month/day. In production this comes from the backend
   with the session (GET /api/me), and the check runs server- or
   client-side against the real employee record — here it's a
   static demo value so the banner logic can be seen firing today.
   ========================================================= */

function initBirthdayBanner() {
  var banner = document.querySelector("[data-birthday-banner]");
  if (!banner) return;
  var mmdd = document.body.getAttribute("data-birthday");
  if (!mmdd) return;

  var today = new Date();
  var todayMmdd = String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
  if (todayMmdd !== mmdd) return;

  banner.style.display = "flex";
  var closeBtn = banner.querySelector("[data-birthday-banner-close]");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      banner.style.display = "none";
    });
  }
}

/* =========================================================
   Hərbi (military) tab gated by gender
   Shows the real military card for "Kişi", the "not applicable"
   card for "Qadın". Reads gender from the "Cinsi" info-item when
   the page has one (read-only employee-detail.html), otherwise
   falls back to <body data-gender="..."> (form pages like
   profile-edit-request.html, which have no info-item to read).
   In production this reads employee.gender from the backend
   instead of scraping the rendered field.
   ========================================================= */

function initMilitaryTabGender() {
  var maleCard = document.querySelector("[data-military-male]");
  var femaleCard = document.querySelector("[data-military-female]");
  if (!maleCard || !femaleCard) return;

  var genderValue = document.body.getAttribute("data-gender") || "";
  document.querySelectorAll(".info-item").forEach(function (item) {
    var label = item.querySelector(".info-label");
    if (label && label.textContent.trim() === "Cinsi") {
      var value = item.querySelector(".info-value");
      if (value) genderValue = value.textContent.trim();
    }
  });

  var isMale = genderValue === "Kişi";
  maleCard.style.display = isMale ? "" : "none";
  femaleCard.style.display = isMale ? "none" : "";
}

/* =========================================================
   File upload dropzones
   Every .dropzone becomes clickable (opens the OS file picker)
   and drag-and-drop, restricted to PNG / JPEG / PDF. Purely
   client-side preview here — no upload endpoint yet, so the
   chosen file is just reflected in the dropzone's own label.
   ========================================================= */

function initDropzones() {
  document.querySelectorAll(".dropzone").forEach(function (zone) {
    if (zone.dataset.dzInit) return;
    zone.dataset.dzInit = "1";

    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf";
    input.style.display = "none";
    zone.appendChild(input);

    function isAllowed(file) {
      return /\.(png|jpe?g|pdf)$/i.test(file.name);
    }

    function applyFile(file) {
      if (!file) return;
      if (!isAllowed(file)) {
        zone.classList.remove("has-file");
        zone.classList.add("dropzone-error");
        setTimeout(function () { zone.classList.remove("dropzone-error"); }, 1600);
        return;
      }
      zone.classList.remove("dropzone-error");
      zone.classList.add("has-file");
      var sizeKb = Math.max(1, Math.round(file.size / 1024));
      var span = zone.querySelector("span");
      if (span) {
        span.textContent = file.name + " · " + sizeKb + " KB";
      } else {
        var bold = zone.querySelector("div b");
        var divs = zone.querySelectorAll(":scope > div");
        if (bold) bold.textContent = file.name;
        if (divs[1]) divs[1].textContent = sizeKb + " KB — dəyişmək üçün klikləyin";
      }
    }

    zone.addEventListener("click", function (e) {
      if (e.target !== input) input.click();
    });
    input.addEventListener("change", function () {
      applyFile(input.files[0]);
    });
    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      zone.classList.add("drag-over");
    });
    zone.addEventListener("dragleave", function () {
      zone.classList.remove("drag-over");
    });
    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      zone.classList.remove("drag-over");
      var file = e.dataTransfer.files && e.dataTransfer.files[0];
      applyFile(file);
    });
  });
}

function initTableExports() {
  document.addEventListener("click", function (e) {
    var excelBtn = e.target.closest("[data-export-excel]");
    var wordBtn = e.target.closest("[data-export-word]");
    var btn = excelBtn || wordBtn;
    if (!btn) return;
    var table = findExportTable(btn);
    if (!table) return;
    var filename = exportName(btn);
    if (excelBtn) exportTableToExcel(table, filename);
    else exportTableToWord(table, filename);
  });
}

/* =========================================================
   Modal system
   data-modal-open="modal-id"   -> button opens the modal
   data-modal-close             -> button/backdrop closes nearest open modal
   data-modal-delete-row        -> on a confirm button inside a delete modal:
                                    removes the table row referenced by
                                    window.__modalContext.rowEl and shows a toast
   ========================================================= */

window.__modalContext = { rowEl: null, label: "" };

function initModals() {
  document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var modalId = btn.getAttribute("data-modal-open");
      var modal = document.getElementById(modalId);
      if (!modal) return;

      // If this trigger sits inside a table row, remember it so the
      // confirm button can remove that specific row (delete mockups).
      var row = btn.closest("tr");
      window.__modalContext.rowEl = row || null;

      var labelSource = btn.getAttribute("data-modal-label");
      if (labelSource) {
        var labelTarget = modal.querySelector("[data-modal-label-target]");
        if (labelTarget) labelTarget.textContent = labelSource;
      }

      openModal(modalId);
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (e.target !== el && el.classList.contains("modal-overlay")) return;
      var modal = el.closest(".modal-overlay");
      if (modal) closeModal(modal.id);
    });
  });

  document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  document.querySelectorAll("[data-modal-confirm-delete]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var modal = btn.closest(".modal-overlay");
      var row = window.__modalContext.rowEl;
      if (row) {
        row.style.transition = "opacity .18s ease";
        row.style.opacity = "0";
        setTimeout(function () { row.remove(); }, 180);
      }
      if (modal) closeModal(modal.id);
      showToast(btn.getAttribute("data-success-message") || "Uğurla silindi.");
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.open").forEach(function (m) {
        closeModal(m.id);
      });
    }
  });
}

function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.classList.add("open");
}

function closeModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.classList.remove("open");
}

function showToast(message) {
  var toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span></span>';
    document.body.appendChild(toast);
  }
  toast.querySelector("span").textContent = message;
  toast.classList.add("show");
  clearTimeout(toast.__timer);
  toast.__timer = setTimeout(function () { toast.classList.remove("show"); }, 2800);
}

/* =========================================================
   Radio cards (e.g. "Ştat forması" selectors)
   ========================================================= */

function initRadioCards() {
  document.querySelectorAll(".radio-card").forEach(function (card) {
    var input = card.querySelector("input[type=radio], input[type=checkbox]");
    if (!input) return;

    function sync() {
      if (input.type === "radio") {
        var group = card.closest(".radio-card-group");
        if (group) {
          group.querySelectorAll(".radio-card").forEach(function (c) {
            c.classList.remove("selected");
          });
        }
      }
      if (input.checked) card.classList.add("selected");
      else card.classList.remove("selected");
    }

    input.addEventListener("change", sync);
    sync();
  });
}

/* =========================================================
   Repeatable form rows (education, family members, etc.)
   ========================================================= */

function initRepeatRows() {
  document.querySelectorAll("[data-repeat-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var containerId = btn.getAttribute("data-repeat-add");
      var container = document.getElementById(containerId);
      if (!container) return;
      var template = container.querySelector(".repeat-card");
      if (!template) return;
      var clone = template.cloneNode(true);
      clone.querySelectorAll("input, textarea, select").forEach(function (f) {
        if (f.type === "checkbox" || f.type === "radio") f.checked = false;
        else f.value = "";
      });
      container.appendChild(clone);
    });
  });

  document.addEventListener("click", function (e) {
    var removeBtn = e.target.closest(".repeat-card-remove");
    if (!removeBtn) return;
    var card = removeBtn.closest(".repeat-card");
    var container = card ? card.parentElement : null;
    if (card && container && container.querySelectorAll(".repeat-card").length > 1) {
      card.remove();
    }
  });
}

/* =========================================================
   Cascading selects for order classification
   order_fields -> order_classifications -> order_types -> order_subtypes
   ========================================================= */

var ORDER_TAXONOMY = {
  "Kadr məsələləri": {
    "İşə qəbul haqqında": {
      "İşə qəbul (ştat üzrə)": ["Müsabiqə əsasında", "Bilavasitə təyinat"],
      "İşə qəbul (əvəzçiliklə)": ["Daxili əvəzçilik", "Kənar əvəzçilik"]
    },
    "Vəzifə dəyişikliyi haqqında": {
      "Vəzifəyə təyinat": ["Struktur daxilində", "Struktur xaricindən"],
      "Vəzifədən azad etmə": ["Öz xahişi ilə", "Ştatın ixtisarı"]
    },
    "İşdən azad olma haqqında": {
      "Öz xahişi ilə azad etmə": ["Standart"],
      "Tərəflərin razılığı ilə": ["Standart"],
      "Nizam-intizam qaydasında": ["Kobud pozuntu", "Təkrar pozuntu"]
    }
  },
  "Məzuniyyət məsələləri": {
    "Məzuniyyət haqqında": {
      "Əmək məzuniyyəti": ["Əsas hissə", "Əlavə hissə"],
      "Ödənişsiz məzuniyyət": ["Standart"],
      "Hamiləlik və doğuş məzuniyyəti": ["Standart"],
      "Uşağa qulluq məzuniyyəti": ["Standart"]
    }
  },
  "Tələbə məsələləri": {
    "Tələbələr sırasından xaric olma haqqında": {
      "Xaric olma": ["Öz xahişi ilə", "Akademik müvəffəqiyyətsizliyə görə"]
    }
  }
};

function initCascadingSelects() {
  var fieldSel = document.querySelector("[data-order-field]");
  var classSel = document.querySelector("[data-order-classification]");
  var typeSel = document.querySelector("[data-order-type]");
  var subtypeSel = document.querySelector("[data-order-subtype]");
  if (!fieldSel || !classSel || !typeSel || !subtypeSel) return;

  function fillSelect(select, options, placeholder) {
    select.innerHTML = "";
    var ph = document.createElement("option");
    ph.textContent = placeholder;
    ph.value = "";
    select.appendChild(ph);
    options.forEach(function (opt) {
      var o = document.createElement("option");
      o.textContent = opt;
      o.value = opt;
      select.appendChild(o);
    });
  }

  function onFieldChange() {
    var field = ORDER_TAXONOMY[fieldSel.value];
    fillSelect(classSel, field ? Object.keys(field) : [], "Kateqoriya seçin");
    onClassChange();
  }
  function onClassChange() {
    var field = ORDER_TAXONOMY[fieldSel.value];
    var cls = field ? field[classSel.value] : null;
    fillSelect(typeSel, cls ? Object.keys(cls) : [], "Əmr növü seçin");
    onTypeChange();
  }
  function onTypeChange() {
    var field = ORDER_TAXONOMY[fieldSel.value];
    var cls = field ? field[classSel.value] : null;
    var subtypes = cls ? cls[typeSel.value] : null;
    fillSelect(subtypeSel, subtypes || [], "Alt növ seçin");
  }

  fillSelect(fieldSel, Object.keys(ORDER_TAXONOMY), "Fəaliyyət sahəsi seçin");
  fillSelect(classSel, [], "Əvvəlcə sahəni seçin");
  fillSelect(typeSel, [], "Əvvəlcə kateqoriyanı seçin");
  fillSelect(subtypeSel, [], "Əvvəlcə növü seçin");

  fieldSel.addEventListener("change", onFieldChange);
  classSel.addEventListener("change", onClassChange);
  typeSel.addEventListener("change", onTypeChange);
}
