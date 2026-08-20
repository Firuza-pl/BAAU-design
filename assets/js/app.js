// BAAU HR Automation — shared UI behaviour (mockup stage, no backend calls yet)

document.addEventListener("DOMContentLoaded", function () {
  initTabs();
  initTableFilter();
  initModals();
  initRadioCards();
  initRepeatRows();
  initCascadingSelects();
});

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
