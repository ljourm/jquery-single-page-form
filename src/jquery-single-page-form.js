(function($){
  $.fn.singlePageForm = function(options = {}) {
    $.extend(true, settings, options);

    methods.init()

    return this
  }

  const settings = {
    demo: false,
    url: null,
    selectorNames: {
      form: "form",
      buttons: {
        confirm: "#confirm-button",
        prev: "#prev-button",
        send: "#send-button",
        clear: "#clear-button",
      },
      status: {
        input: ".status-input",
        confirm: ".status-confirm",
        completed: ".status-completed",
      },
    },
    validators: [
      // {
      //   name: "passport-number",
      //   message: "Required",
      //   messageSelector: ".row.passport-number .error-message",
      //   validate: function(val) { return val !== "" },
      // }
    ],
    dataToConfirms: [
      // {
      //   confirmSelector: ".row.passport-number .item-confirm",
      //   dataName: "passport-number",
      //   syncFunc: function(data) { return "number: " + data["passport-number"] },
      // },
    ],
    messages: {
      leave: "Are you sure you want to move from this page?",
      sendError: "Failed to send.",
    },
    useLeaveMessage: true,
    scrollTop: true,
    statusAfterChanged: function() {},
  }

  const methods = {
    init : function() {
      methods.showInput()

      $(settings.selectorNames.buttons.confirm).on("click", methods.confirmButtonClicked)
      $(settings.selectorNames.buttons.prev).on("click", methods.prevButtonClicked)
      $(settings.selectorNames.buttons.send).on("click", methods.sendButtonClicked)
      $(settings.selectorNames.buttons.clear).on("click", methods.clearButtonClicked)

      $(settings.selectorNames.form + " input").each(function(_i, el) {
        $(el).on("change", methods.addLeaveEvent)
      })
    },
    confirmButtonClicked() {
      if(settings.demo) {
        console.log(methods.getValues())
      }

      if(methods.validate()) {
        methods.syncToConfirm()
        methods.showConfirm()
      }

      if(settings.scrollTop) {
        methods.scrollTop(0)
      }

      return false
    },
    prevButtonClicked() {
      methods.showInput()

      return false
    },
    sendButtonClicked() {
      $sendButton = $(this)

      if($sendButton.prop("disabled")) {
        return false
      }

      $sendButton.prop("disabled", true)

      results = methods.send({
        successEvent: function() {
          methods.showCompleted()
          methods.removeLeaveEvent()

          if(settings.scrollTop) {
            methods.scrollTop(0)
          }
        },
        failEvent: function() {
          alert(settings.messages.sendError)
        },
        completedEvent: function() {
          $sendButton.prop("disabled", false)
        },
      })

      return false
    },
    clearButtonClicked() {
      methods.showInput()

      return false
    },
    showInput: function() {
      methods.hideAll([
        settings.selectorNames.status.confirm,
        settings.selectorNames.status.completed,
        settings.selectorNames.buttons.clear,
        settings.selectorNames.buttons.prev,
        settings.selectorNames.buttons.send,
      ])
      methods.showAll([
        settings.selectorNames.status.input,
        settings.selectorNames.buttons.confirm,
      ])

      settings.statusAfterChanged()
    },
    showConfirm: function() {
      methods.hideAll([
        settings.selectorNames.status.input,
        settings.selectorNames.status.completed,
        settings.selectorNames.buttons.confirm,
        settings.selectorNames.buttons.clear,
      ])
      methods.showAll([
        settings.selectorNames.status.confirm,
        settings.selectorNames.buttons.prev,
        settings.selectorNames.buttons.send,
      ])

      settings.statusAfterChanged()
    },
    showCompleted: function() {
      methods.hideAll([
        settings.selectorNames.status.input,
        settings.selectorNames.status.confirm,
        settings.selectorNames.buttons.confirm,
        settings.selectorNames.buttons.prev,
        settings.selectorNames.buttons.send,
      ])
      methods.showAll([
        settings.selectorNames.status.completed,
        settings.selectorNames.buttons.clear,
      ])

      settings.statusAfterChanged()
    },
    showAll: function(selectors) {
      $(selectors.join(",")).show()
    },
    hideAll: function(selectors) {
      $(selectors.join(",")).hide()
    },
    getValues: function() {
      const data = {}

      $(settings.selectorNames.form).find("input").each(function() {
        const $el = $(this)
        const type = $el.attr("type")
        const name = $el.attr("name")
        const value = $el.val()

        if(type == "checkbox") {
          if(!data[name]) {
            data[name] = {}
          }

          data[name][value] = $el.prop("checked")
        }
        else if(type == "radio") {
          if($el.prop("checked")) {
            data[name] = value
          }
          else if(!data[name]) {
            data[name] = null
          }
        }
        else {
          data[name] = value
        }
      })

      return data
    },
    send: function(options) {
      if(settings.demo) {
        setTimeout(function() {
          options.successEvent()
          options.completedEvent()
        }, 1000)
        return
      }

      $.ajax({
        type: "POST",
        url: url,
        datatype: "json",
        data: methods.getValues(),
      }).done(function() {
        options.successEvent()
      }).fail(function() {
        options.failEvent()
      }).always(function() {
        options.completedEvent()
      })
    },
    validate: function() {
      const data = methods.getValues()
      let allSuccess = true

      settings.validators.forEach(function(validator) {
        const val = data[validator.name]
        const isSuccess = validator.validate(val)
        let message = ""

        if(!isSuccess) {
          allSuccess = false
          message = validator.message
        }

        $(validator.messageSelector).text(message)
      })

      return allSuccess
    },
    syncToConfirm: function() {
      const data = methods.getValues()

      settings.dataToConfirms.forEach(function(dataToConfirm) {
        let value = ""

        if(dataToConfirm.syncFunc) {
          value = dataToConfirm.syncFunc(data)
        }
        else {
          value = data[dataToConfirm.dataName]
        }

        $(dataToConfirm.confirmSelector).text(value)
      })

    },
    scrollTop: function(top) {
      $("html, body").animate({ scrollTop: top }, 500, "swing");
    },
    addLeaveEvent: function() {
      if(!settings.useLeaveMessage || settings.formChanged) {
        return
      }

      settings.formChanged = true
      window.addEventListener("beforeunload", methods.changeWindowHandler)
    },
    removeLeaveEvent: function() {
      settings.formChanged = false
      window.removeEventListener("beforeunload", methods.changeWindowHandler)
    },
    changeWindowHandler: function(e) {
      e.returnValue = settings.messages.leave
    },
  }
})(jQuery)
