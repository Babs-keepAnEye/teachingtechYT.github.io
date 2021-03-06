var persistChangeEvent = new Event('change');

function loadFormData(form) {
  if (!form.name)
    return;

  if (!localStorage)
    return;

  for (var i = 0; i < form.length; ++i) {
    var element = form[i];
    if (!element.name)
      continue;

    if (
      element.tagName == "INPUT" && element.type == "number" ||
      element.tagName == "INPUT" && element.type == "checkbox" ||
      element.tagName == "INPUT" && element.type == "radio" ||
      element.tagName == "INPUT" && element.type == "text" ||
      element.tagName == "TEXTAREA" ||
      element.tagName == "SELECT"
    ) {
      var newValue = getPeristedValue(element);
      if (newValue !== null) {
        setFormItemValue(element, newValue);
      }

      element.addEventListener("change", persistFormValue);
    }
  }
}

function resetFormToDefaults(form) {
  for (var i = 0; i < form.length; ++i) {
    var element = form[i];
    if (!element.name) {
      continue;
    }

    setPersistedValue(element, null);
    if (element.defaultValue) {
      setFormItemValue(element, element.defaultValue);
    }
  }
}

function getPersistKey(element) {
  return "persist_" + element.name;
}

function getPeristedValue(element) {
  return localStorage.getItem(getPersistKey(element));
}

function setPersistedValue(element, value) {
  var key = getPersistKey(element);

  if (value != null) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
}

function getFormItemValue(element) {
  if (element.type == "radio") {
    return element.checked ? element.value : null;
  } else if (element.type == "checkbox") {
    return element.checked ? "true" : "false";
  } else {
    return element.value;
  }
}

function setFormItemValue(element, value) {
  if (element.type == "radio") {
    var realValue = (value == element.value);

    if (element.checked == realValue) {
      return;
    }

    element.checked = realValue;
  } else if (element.type == "checkbox") {
    var realValue = (value == "true");

    if (element.checked == realValue) {
      return;
    }

    element.checked = realValue;
  } else {
    if (element.value == value) {
      return;
    }

    element.value = value;
  }

  element.dispatchEvent(persistChangeEvent);
}

function persistFormValue(event) {
  // ignore cascade updates
  if (persistChangeEvent == event) {
    return;
  }

  var element = event.target;
  var value = getFormItemValue(element);
  var others = document.getElementsByName(element.name);

  setPersistedValue(element, value);

  // update all other inputs
  for (var i = 0; i < others.length; ++i) {
    var other = others[i];

    if (other.tagName == element.tagName && other.type == element.type) {
      setFormItemValue(other, value);
    }
  }
}

function loadAllFormData() {
  for (var i = 0; i < document.forms.length; ++i) {
    loadFormData(document.forms[i]);
  }
}
