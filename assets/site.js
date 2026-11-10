/*
 * Yugo Contracting — site script.
 *
 * EVERYTHING that still needs a real value lives in CONFIG below.
 * Fill these in before launch. While any required value still looks like a
 * placeholder, every page shows a small yellow "Preview" ribbon.
 */
var CONFIG = {
  // Required. Public phone number, written the way it should be displayed.
  phone: "(667) 220-6558",

  // Required. Public email address. Also receives the form's email fallback.
  email: "amar@yugocontracting.com",

  // Required. Plain text, e.g. "Mon to Fri, 8am to 5pm".
  hours: "Mon to Sat, 8am to 6pm",

  // Required. The live domain, no protocol, e.g. "www.yourdomain.com".
  domain: "www.yugocontracting.com",

  // Optional. Street line only. Leave "" to show just "Utica, NY".
  streetAddress: "",

  // Optional. Shown in the footer only when filled in. Leave "" to hide.
  // Only put a licence or insurance statement here if it is true and current.
  licenseLine: "",

  // Optional. URL that accepts a JSON POST of the form data.
  // Leave "" and the forms open a pre-filled email to CONFIG.email instead.
  formEndpoint: ""
};

(function () {
  "use strict";

  var doc = document;
  doc.documentElement.className += " js";

  var REQUIRED = ["phone", "email", "hours", "domain"];

  function isPlaceholder(key) {
    var v = String(CONFIG[key] || "").trim();
    if (!v) return true;
    if (key === "phone") return /000-0000/.test(v);
    if (key === "email" || key === "domain") return /(^|[@.])example\.(com|org|net)$/i.test(v);
    if (key === "hours") return /not set/i.test(v);
    return false;
  }

  function each(selector, fn, root) {
    Array.prototype.forEach.call((root || doc).querySelectorAll(selector), fn);
  }

  function telHref(phone) {
    var digits = phone.replace(/\D/g, "");
    if (digits.length === 10) digits = "1" + digits;
    return "tel:+" + digits;
  }

  /* ---- Render contact details from CONFIG ---- */

  var address = (CONFIG.streetAddress ? CONFIG.streetAddress.trim() + ", " : "") + "Utica, NY";

  each("[data-cfg]", function (el) {
    var key = el.getAttribute("data-cfg");
    if (key === "phone") el.textContent = CONFIG.phone;
    else if (key === "email") el.textContent = CONFIG.email;
    else if (key === "hours") el.textContent = CONFIG.hours;
    else if (key === "address") el.textContent = address;
    else if (key === "license") {
      if (CONFIG.licenseLine.trim()) {
        el.textContent = CONFIG.licenseLine.trim();
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    }
  });

  each("[data-cfg-href]", function (el) {
    var kind = el.getAttribute("data-cfg-href");
    if (kind === "tel") el.setAttribute("href", telHref(CONFIG.phone));
    if (kind === "mailto") el.setAttribute("href", "mailto:" + CONFIG.email);
  });

  each("[data-year]", function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- Domain-dependent head tags and structured data ---- */

  if (!isPlaceholder("domain")) {
    var page = location.pathname.split("/").pop() || "index.html";
    var url = "https://" + CONFIG.domain.replace(/^https?:\/\//, "").replace(/\/$/, "") + "/" + (page === "index.html" ? "" : page);
    var canonical = doc.createElement("link");
    canonical.rel = "canonical";
    canonical.href = url;
    doc.head.appendChild(canonical);
    var og = doc.createElement("meta");
    og.setAttribute("property", "og:url");
    og.content = url;
    doc.head.appendChild(og);
  }

  var ld = doc.getElementById("ld-business");
  if (ld) {
    try {
      var data = JSON.parse(ld.textContent);
      if (!isPlaceholder("phone")) data.telephone = telHref(CONFIG.phone).slice(4);
      if (!isPlaceholder("email")) data.email = CONFIG.email;
      if (!isPlaceholder("domain")) data.url = "https://" + CONFIG.domain.replace(/^https?:\/\//, "").replace(/\/$/, "") + "/";
      if (CONFIG.streetAddress.trim()) data.address.streetAddress = CONFIG.streetAddress.trim();
      ld.textContent = JSON.stringify(data);
    } catch (e) {
      /* leave the static block as written */
    }
  }

  /* ---- Preview ribbon ---- */

  var unset = REQUIRED.filter(isPlaceholder);
  if (unset.length) {
    var ribbon = doc.createElement("div");
    ribbon.className = "preview-ribbon";
    ribbon.setAttribute("role", "note");
    ribbon.textContent = "Preview only. Not set: " + unset.join(", ");
    doc.body.appendChild(ribbon);
  }

  /* ---- Mobile navigation ---- */

  var toggle = doc.querySelector(".nav-toggle");
  var nav = doc.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---- Forms ---- */

  var usesEndpoint = Boolean(CONFIG.formEndpoint.trim());

  var FORM_TITLES = {
    "request-call": "Call request",
    "quick-call": "Call request",
    "partner-account": "Account setup request"
  };

  function fieldLabel(form, name) {
    var el = form.querySelector('[data-label-for="' + name + '"]');
    return el ? el.getAttribute("data-label") : name;
  }

  function errorNode(form, name) {
    return form.querySelector('[data-error-for="' + name + '"]');
  }

  function setError(form, name, message) {
    var node = errorNode(form, name);
    if (node) node.textContent = message || "";
    each('[name="' + name + '"]', function (input) {
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }, form);
  }

  function validPhone(value) {
    var digits = value.replace(/\D/g, "");
    if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
    return digits.length === 10;
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function collect(form) {
    var values = {};
    var order = [];
    each("[name]", function (input) {
      var name = input.name;
      if (name === "website") return;
      if (order.indexOf(name) === -1) order.push(name);
      if (input.type === "checkbox") {
        if (!values[name]) values[name] = [];
        if (input.checked) values[name].push(input.value);
      } else {
        values[name] = input.value.trim();
      }
    }, form);
    return { values: values, order: order };
  }

  function validate(form, values) {
    var firstBad = null;
    function fail(name, message) {
      setError(form, name, message);
      if (!firstBad) firstBad = form.querySelector('[name="' + name + '"]');
    }

    each("[data-label-for]", function (labelEl) {
      var name = labelEl.getAttribute("data-label-for");
      var rule = labelEl.getAttribute("data-rule") || "";
      var required = labelEl.hasAttribute("data-required");
      var value = values[name];
      var label = labelEl.getAttribute("data-label");
      setError(form, name, "");

      if (Array.isArray(value)) {
        if (required && !value.length) fail(name, "Choose at least one.");
        return;
      }
      if (!value) {
        if (required) fail(name, label + " is required.");
        return;
      }
      if (rule === "phone" && !validPhone(value)) {
        fail(name, "Enter a 10-digit phone number, including area code.");
      } else if (rule === "email" && !validEmail(value)) {
        fail(name, "Enter an email address like name@domain.com.");
      }
    }, form);

    return firstBad;
  }

  function summary(form, data) {
    var lines = [];
    data.order.forEach(function (name) {
      var value = data.values[name];
      if (Array.isArray(value)) value = value.join(", ");
      if (!value) return;
      lines.push(fieldLabel(form, name) + ": " + value);
    });
    return lines.join("\n");
  }

  function subjectFor(form, values) {
    var title = FORM_TITLES[form.getAttribute("data-form")] || "Website request";
    var who = values.company || values.name || "";
    var where = values.town ? " (" + values.town + ")" : "";
    return title + (who ? ": " + who : "") + where;
  }

  function showAlert(form, html) {
    var alert = form.querySelector(".form-alert");
    alert.innerHTML = html;
    alert.hidden = false;
  }

  function showResult(form, mode, text, mailto) {
    var panel = form.parentNode.querySelector(".form-result");
    var title = panel.querySelector("[data-result-title]");
    var body = panel.querySelector("[data-result-body]");
    var again = panel.querySelector("[data-result-mailto]");
    var copy = panel.querySelector("[data-result-copy]");
    var icon = panel.querySelector("h3 use");
    if (icon) icon.setAttribute("href", mode === "sent" ? "#i-check" : "#i-mail");

    if (mode === "sent") {
      title.textContent = "Request sent";
      body.textContent = "Amar has your details and will call you back to talk it through. This is a request for a call, not a booking.";
      again.hidden = true;
      copy.hidden = true;
    } else {
      title.textContent = "One more step: send the email";
      body.textContent = "Your email app should have opened with your request filled in. Press send there to finish. Nothing reaches Amar until that email is sent.";
      again.hidden = false;
      again.setAttribute("href", mailto);
      copy.hidden = false;
      copy.querySelector("pre").textContent = "To: " + CONFIG.email + "\n\n" + text;
    }
    form.hidden = true;
    panel.hidden = false;
    panel.focus();
  }

  function openMailto(href) {
    var link = doc.createElement("a");
    link.href = href;
    link.style.display = "none";
    doc.body.appendChild(link);
    link.click();
    doc.body.removeChild(link);
  }

  each("[data-account-type]", function (link) {
    link.addEventListener("click", function () {
      var select = doc.querySelector('form[data-form="partner-account"] select[name="type"]');
      if (!select) return;
      select.value = link.getAttribute("data-account-type");
      setError(select.form, "type", "");
    });
  });

  each("form[data-form]", function (form) {
    form.setAttribute("novalidate", "");

    var mode = form.querySelector(".form-mode");
    if (mode) {
      mode.textContent = usesEndpoint
        ? ""
        : "Heads up: this will open your email app with the details filled in. You send it from there.";
    }

    form.addEventListener("input", function (e) {
      var name = e.target && e.target.name;
      if (name && e.target.getAttribute("aria-invalid") === "true") setError(form, name, "");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var alert = form.querySelector(".form-alert");
      alert.hidden = true;

      var data = collect(form);
      var firstBad = validate(form, data.values);
      if (firstBad) {
        showAlert(form, "Some details are missing or need fixing. Check the highlighted fields.");
        firstBad.focus();
        return;
      }

      // Honeypot: real people never see or fill this field.
      var trap = form.querySelector('[name="website"]');
      if (trap && trap.value) {
        showResult(form, "sent", "", "");
        return;
      }

      var text = summary(form, data);
      var subject = subjectFor(form, data.values);
      var mailto = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);

      if (!usesEndpoint) {
        openMailto(mailto);
        showResult(form, "mailto", text, mailto);
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      var buttonText = button.textContent;
      button.disabled = true;
      button.textContent = "Sending…";

      fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          form: form.getAttribute("data-form"),
          subject: subject,
          submittedAt: new Date().toISOString(),
          page: location.pathname.split("/").pop() || "index.html",
          fields: data.values
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          showResult(form, "sent", text, mailto);
        })
        .catch(function () {
          var safeMailto = mailto.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
          showAlert(
            form,
            "That didn't go through, and nothing was sent. Try again, or " +
              '<a href="' + safeMailto + '">send the same details by email</a>' +
              ", or call " + CONFIG.phone.replace(/</g, "&lt;") + "."
          );
          form.querySelector(".form-alert").focus();
        })
        .then(function () {
          button.disabled = false;
          button.textContent = buttonText;
        });
    });
  });
})();
